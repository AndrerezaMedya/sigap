import { globalCache } from "@/lib/cache";
import type { EnvironmentalContext } from "@/lib/types";

const AQI_API_URL = "https://airquality.googleapis.com/v1/currentConditions:lookup";
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 mins cache for AQI

type AqiContext = EnvironmentalContext["aqi"];

type GoogleAqiResponse = {
  dateTime?: string;
  indexes?: Array<{
    aqi?: number;
    category?: string;
  }>;
  pollutants?: Array<{
    code?: string;
    concentration?: {
      value?: number;
    };
  }>;
  healthRecommendations?: {
    generalPopulation?: string;
  };
};

function createFallbackAqi(areaLabel: string): AqiContext {
  return {
    source: "Fallback",
    level: "Tidak diketahui",
    summary: "Informasi kualitas udara tidak tersedia secara real-time saat ini.",
    aqi: null,
    pm25: null,
    sourceMeta: {
      areaLabel,
      updatedAt: new Date().toISOString(),
      ttlMs: CACHE_TTL_MS,
    },
  };
}

export async function getAirQuality(
  lat: number | undefined,
  lng: number | undefined,
  areaLabel: string,
): Promise<AqiContext> {
  const fallback = createFallbackAqi(areaLabel);

  if (typeof lat !== "number" || typeof lng !== "number") {
    return fallback;
  }

  const apiKey = process.env.NEXT_PUBLIC_GCP_API_KEY || process.env.GCP_API_KEY;
  if (!apiKey) {
    return {
      ...fallback,
      level: "Sedang (Simulasi)",
      summary:
        "Simulasi: Kualitas udara di lokasi ini berada pada tingkat sedang. Google AQI API belum terkonfigurasi.",
    };
  }

  const cacheKey = `aqi_${lat.toFixed(3)}_${lng.toFixed(3)}_${areaLabel}`;
  const cached = globalCache.get(cacheKey) as AqiContext | null;
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(`${AQI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: { latitude: lat, longitude: lng },
        extraComputations: [
          "HEALTH_RECOMMENDATIONS",
          "DOMINANT_POLLUTANT_CONCENTRATION",
          "POLLUTANT_CONCENTRATION",
        ],
        languageCode: "id",
      }),
    });

    if (!response.ok) {
      throw new Error(`AQI API failed with status ${response.status}`);
    }

    const data = (await response.json()) as GoogleAqiResponse;
    const index = data.indexes?.[0];

    if (!index) {
      return fallback;
    }

    const pm25 = data.pollutants?.find(
      (pollutant) => pollutant.code?.toLowerCase() === "pm25",
    )?.concentration?.value;
    const updatedAt = data.dateTime ?? new Date().toISOString();

    const result: AqiContext = {
      source: "Google",
      level: index.category || "Sedang",
      summary:
        data.healthRecommendations?.generalPopulation ||
        `Indeks Kualitas Udara: ${index.aqi ?? "-"}. Tingkat: ${index.category ?? "Sedang"}.`,
      aqi: typeof index.aqi === "number" ? index.aqi : null,
      pm25: typeof pm25 === "number" ? pm25 : null,
      sourceMeta: {
        areaLabel,
        updatedAt,
        ttlMs: CACHE_TTL_MS,
      },
    };

    globalCache.set(cacheKey, result, CACHE_TTL_MS);
    return result;
  } catch (error) {
    console.error("AQI fetch failed:", error);
    return fallback;
  }
}
