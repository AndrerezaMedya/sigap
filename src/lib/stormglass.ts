import { globalCache } from "@/lib/cache";
import type { EnvironmentalContext } from "@/lib/types";

const STORMGLASS_API_URL = "https://api.stormglass.io/v2/weather/point";
const CACHE_TTL_MS = 1000 * 60 * 20; // 20 mins cache for wind & visibility

type WindContext = EnvironmentalContext["wind"];

type StormglassHourValue = {
  noaa?: number;
  sg?: number;
};

type StormglassResponse = {
  hours?: Array<{
    time?: string;
    windSpeed?: StormglassHourValue;
    visibility?: StormglassHourValue;
  }>;
};

function pickStormglassValue(value: StormglassHourValue | undefined): number | null {
  if (!value) {
    return null;
  }

  if (typeof value.noaa === "number") {
    return value.noaa;
  }

  if (typeof value.sg === "number") {
    return value.sg;
  }

  return null;
}

function normalizeVisibilityKm(raw: number | null): number | null {
  if (raw === null) {
    return null;
  }

  // Stormglass visibility can be returned in meters in some datasets.
  if (raw > 100) {
    return Math.round((raw / 1000) * 10) / 10;
  }

  return Math.round(raw * 10) / 10;
}

function createFallbackWind(areaLabel: string): WindContext {
  return {
    source: "Fallback",
    summary: "Kondisi angin dan visibilitas real-time tidak tersedia.",
    windSpeedMs: null,
    visibilityKm: null,
    sourceMeta: {
      areaLabel,
      updatedAt: new Date().toISOString(),
      ttlMs: CACHE_TTL_MS,
    },
  };
}

export async function getStormglassWind(
  lat: number | undefined,
  lng: number | undefined,
  areaLabel: string,
): Promise<WindContext> {
  const fallback = createFallbackWind(areaLabel);

  if (typeof lat !== "number" || typeof lng !== "number") {
    return fallback;
  }

  const apiKey = process.env.STORMGLASS_API_KEY;
  if (!apiKey) {
    return {
      ...fallback,
      summary:
        "Simulasi: Angin cenderung ringan dan visibilitas stabil. Stormglass API belum terkonfigurasi.",
    };
  }

  const cacheKey = `stormglass_${lat.toFixed(3)}_${lng.toFixed(3)}`;
  const cached = globalCache.get(cacheKey) as WindContext | null;
  if (cached) {
    return cached;
  }

  try {
    const url = new URL(STORMGLASS_API_URL);
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lng", String(lng));
    url.searchParams.set("params", "windSpeed,visibility");

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Stormglass API failed with status ${response.status}`);
    }

    const payload = (await response.json()) as StormglassResponse;
    const firstHour = payload.hours?.[0];

    if (!firstHour) {
      return fallback;
    }

    const windSpeedMs = pickStormglassValue(firstHour.windSpeed);
    const visibilityKm = normalizeVisibilityKm(
      pickStormglassValue(firstHour.visibility),
    );
    const updatedAt = firstHour.time ?? new Date().toISOString();

    const result: WindContext = {
      source: "Stormglass",
      summary: `Angin ${windSpeedMs ?? "-"} m/s dengan visibilitas ${
        visibilityKm ?? "-"
      } km.`,
      windSpeedMs,
      visibilityKm,
      sourceMeta: {
        areaLabel,
        updatedAt,
        ttlMs: CACHE_TTL_MS,
      },
    };

    globalCache.set(cacheKey, result, CACHE_TTL_MS);
    return result;
  } catch (error) {
    console.error("Stormglass fetch failed:", error);
    return fallback;
  }
}
