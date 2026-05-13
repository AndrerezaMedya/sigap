import { createFallbackWeather } from "@/lib/fallback";
import type { WeatherContext, WeatherPoint } from "@/lib/types";

const BMKG_FORECAST_URL = "https://api.bmkg.go.id/publik/prakiraan-cuaca";
const CACHE_TTL_MS = 1000 * 60 * 60;

import { globalCache } from "@/lib/cache";

type BmkgForecastItem = {
  local_datetime?: string;
  utc_datetime?: string;
  t?: number | string;
  hu?: number | string;
  tp?: number | string;
  weather_desc?: string;
  weather_desc_en?: string;
  ws?: number | string;
  tcc?: number | string;
  vs_text?: string;
};

type BmkgResponse = {
  lokasi?: {
    provinsi?: string;
    kotkab?: string;
    kecamatan?: string;
    desa?: string;
  };
  data?: Array<{
    cuaca?: BmkgForecastItem[] | BmkgForecastItem[][];
  }>;
};

function toNumber(value: number | string | undefined): number | null {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
}

function flattenForecast(data: BmkgResponse): BmkgForecastItem[] {
  return (
    data.data?.flatMap((entry) =>
      (entry.cuaca ?? []).flatMap((item) => (Array.isArray(item) ? item : [item])),
    ) ?? []
  );
}

function buildLocationLabel(data: BmkgResponse, fallbackLabel: string): string {
  const location = data.lokasi;
  const parts = [
    location?.desa,
    location?.kecamatan,
    location?.kotkab,
    location?.provinsi,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : fallbackLabel;
}

function normalizeBmkgResponse(
  data: BmkgResponse,
  fallbackLabel: string,
): WeatherContext {
  const forecast = flattenForecast(data)
    .slice(0, 8)
    .map<WeatherPoint>((item) => ({
      localDatetime: item.local_datetime ?? item.utc_datetime ?? new Date().toISOString(),
      temperatureCelsius: toNumber(item.t),
      humidityPercent: toNumber(item.hu),
      precipitationMm: toNumber(item.tp),
      weatherDescription:
        item.weather_desc ?? item.weather_desc_en ?? "Kondisi tidak tersedia",
      windSpeedKmh: toNumber(item.ws),
      cloudCoverPercent: toNumber(item.tcc),
      visibilityText: item.vs_text ?? null,
    }));

  const first = forecast[0];

  return {
    source: "BMKG",
    locationLabel: buildLocationLabel(data, fallbackLabel),
    analysisDate: first?.localDatetime,
    summary: first
      ? `${first.weatherDescription} dengan suhu ${
          first.temperatureCelsius ?? "-"
        }°C dan kelembapan ${first.humidityPercent ?? "-"}%.`
      : "Data BMKG tersedia, tetapi prakiraan rinci belum ditemukan.",
    forecast,
    sourceMeta: {
      areaLabel: data.lokasi?.desa || fallbackLabel,
      updatedAt: first?.localDatetime ?? new Date().toISOString(),
      ttlMs: CACHE_TTL_MS,
    },
  };
}

export async function getBmkgWeather(
  adm4Code: string | undefined,
  fallbackLabel: string,
): Promise<WeatherContext> {
  if (!adm4Code) {
    return createFallbackWeather(fallbackLabel);
  }

  const cacheKey = `bmkg_${adm4Code}`;
  const cached = globalCache.get(cacheKey) as WeatherContext | null;
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(`${BMKG_FORECAST_URL}?adm4=${adm4Code}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`BMKG request failed with ${response.status}`);
    }

    const payload = (await response.json()) as BmkgResponse;
    const weather = normalizeBmkgResponse(payload, fallbackLabel);

    globalCache.set(cacheKey, weather, CACHE_TTL_MS);

    return weather;
  } catch (error) {
    console.error("BMKG weather fallback activated", error);
    return createFallbackWeather(fallbackLabel);
  }
}
