import { globalCache } from "@/lib/cache";
import type { EnvironmentalContext } from "@/lib/types";

const VC_API_URL = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 mins cache for VisualCrossing (demo)

type MicroclimateContext = EnvironmentalContext["microclimate"];

type VisualCrossingHour = {
  datetime: string;
  precipprob?: number;
  conditions?: string;
};

type VisualCrossingResponse = {
  currentConditions?: {
    feelslike?: number;
    precip?: number;
    uvindex?: number;
  };
  days?: Array<{
    hours?: VisualCrossingHour[];
  }>;
};

export async function getMicroclimate(
  lat: number | undefined,
  lng: number | undefined,
  areaLabel: string,
): Promise<MicroclimateContext> {
  const fallback: MicroclimateContext = {
    source: "Fallback",
    summary: "Informasi resolusi cuaca per-jam tidak tersedia.",
    uvIndex: null,
    sourceMeta: {
      areaLabel,
      updatedAt: new Date().toISOString(),
      ttlMs: CACHE_TTL_MS,
    },
  };

  if (typeof lat !== "number" || typeof lng !== "number") {
    return fallback;
  }

  const apiKey = process.env.VC_API_KEY;
  if (!apiKey) {
    // Simulasi jika tidak ada API key
    return {
      source: "Fallback",
      summary: "Simulasi: Kondisi cuaca lokal diprakirakan stabil dalam 3 jam ke depan tanpa perubahan ekstrem.",
      uvIndex: null,
      sourceMeta: {
        areaLabel,
        updatedAt: new Date().toISOString(),
        ttlMs: CACHE_TTL_MS,
      },
    };
  }

  const cacheKey = `vc_${lat.toFixed(3)}_${lng.toFixed(3)}`;
  const cached = globalCache.get(cacheKey) as MicroclimateContext | null;
  if (cached) return cached;

  try {
    // Menarik data prakiraan jam-jaman untuk 24 jam ke depan (parameter include=hours)
    // Parameter lang=id untuk bahasa Indonesia, unitGroup=metric untuk Celcius/Kmh
    const response = await fetch(
      `${VC_API_URL}/${lat},${lng}?unitGroup=metric&include=hours,current&key=${apiKey}&lang=id`
    );

    if (!response.ok) {
      throw new Error(`VisualCrossing API failed with status ${response.status}`);
    }

    const data = (await response.json()) as VisualCrossingResponse;
    const current = data.currentConditions;
    const hours = data.days?.[0]?.hours || [];

    if (!current || hours.length === 0) return fallback;

    // Filter cuaca 3 jam ke depan dari sekarang untuk gap-filling
    const currentHour = new Date().getHours();
    const nextHours = hours.filter((h) => {
      const hTime = parseInt(h.datetime.split(":")[0]);
      return hTime > currentHour && hTime <= currentHour + 3;
    });

    let nextHoursSummary = "";
    if (nextHours.length > 0) {
      const avgPrecipProb = Math.round(
        nextHours.reduce((acc, h) => acc + (h.precipprob || 0), 0) / nextHours.length
      );
      const condition = nextHours[0].conditions ?? "stabil";
      nextHoursSummary = `Dalam 3 jam ke depan: dominan ${condition} (Peluang Hujan: ${avgPrecipProb}%).`;
    }

    const result: MicroclimateContext = {
      source: "VisualCrossing",
      summary: `Saat ini terasa seperti ${current.feelslike}°C, curah hujan ${current.precip || 0}mm, dengan Indeks UV ${current.uvindex || 0}. ${nextHoursSummary}`,
      uvIndex: current.uvindex ?? null,
      sourceMeta: {
        areaLabel,
        updatedAt: new Date().toISOString(),
        ttlMs: CACHE_TTL_MS,
      },
    };

    globalCache.set(cacheKey, result, CACHE_TTL_MS);
    return result;

  } catch (error) {
    console.error("VisualCrossing fetch failed:", error);
    return fallback;
  }
}
