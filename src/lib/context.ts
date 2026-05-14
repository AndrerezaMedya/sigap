import { getBmkgWeather } from "@/lib/bmkg";
import { getAirQuality } from "@/lib/aqi";
import { getTrafficConditions } from "@/lib/traffic";
import { getFloodAlerts } from "@/lib/flood";
import { getMicroclimate } from "@/lib/visualcrossing";
import { getStormglassWind } from "@/lib/stormglass";
import type { EnvironmentalContext, UserContext } from "@/lib/types";

export async function buildEnvironmentalContext(
  userContext: UserContext,
): Promise<EnvironmentalContext> {
  const areaLabel = userContext.locationName;
  const nowIso = new Date().toISOString();

  // Use Promise.allSettled to fetch all contexts concurrently. 
  // If one fails, the others still succeed (Fallback logic).
  const [weatherResult, microclimateResult, aqiResult, trafficResult, windResult, floodResult] = await Promise.allSettled([
    getBmkgWeather(userContext.adm4Code, userContext.locationName),
    getMicroclimate(userContext.lat, userContext.lng, areaLabel),
    getAirQuality(userContext.lat, userContext.lng, areaLabel),
    getTrafficConditions(
      userContext.lat,
      userContext.lng,
      userContext.destination,
      userContext.transportMode ?? "car",
      areaLabel,
    ),
    getStormglassWind(userContext.lat, userContext.lng, areaLabel),
    getFloodAlerts(userContext.lat, userContext.lng, areaLabel),
  ]);

  const weather = weatherResult.status === "fulfilled" 
    ? weatherResult.value 
    : {
        source: "Fallback" as const,
        locationLabel: userContext.locationName,
        summary: "Gagal memuat cuaca BMKG.",
        forecast: [],
        sourceMeta: {
          areaLabel,
          updatedAt: nowIso,
          ttlMs: 1000 * 60 * 60,
        },
      };
  const granularArea = weather.locationLabel.split(",")[0]?.trim() || areaLabel;

  const microclimateBase = microclimateResult.status === "fulfilled"
    ? microclimateResult.value
    : {
        source: "Fallback" as const,
        summary: "Data cuaca mikroklimat gagal dimuat.",
        uvIndex: null,
        sourceMeta: {
          areaLabel,
          updatedAt: nowIso,
          ttlMs: 1000 * 60 * 30,
        },
      };
  const microclimate = {
    ...microclimateBase,
    sourceMeta: {
      ...microclimateBase.sourceMeta,
      areaLabel: granularArea,
    },
  };

  const aqiBase = aqiResult.status === "fulfilled"
    ? aqiResult.value
    : {
        source: "Fallback" as const,
        level: "Tidak diketahui",
        summary: "Data kualitas udara gagal dimuat.",
        aqi: null,
        pm25: null,
        sourceMeta: {
          areaLabel,
          updatedAt: nowIso,
          ttlMs: 1000 * 60 * 30,
        },
      };
  const aqi = {
    ...aqiBase,
    sourceMeta: {
      ...aqiBase.sourceMeta,
      areaLabel: granularArea,
    },
  };

  const trafficBase = trafficResult.status === "fulfilled"
    ? trafficResult.value
    : {
        source: "Fallback" as const,
        summary: "Data lalu lintas gagal dimuat.",
        travelTimeMin: null,
        trafficDelayMin: null,
        congestionPercent: null,
        congestionLevel: "unknown" as const,
        sourceMeta: {
          areaLabel,
          updatedAt: nowIso,
          ttlMs: 1000 * 60 * 15,
        },
      };
  const traffic = {
    ...trafficBase,
    sourceMeta: {
      ...trafficBase.sourceMeta,
      areaLabel: granularArea,
    },
  };

  const windBase = windResult.status === "fulfilled"
    ? windResult.value
    : {
        source: "Fallback" as const,
        summary: "Data angin dan visibilitas gagal dimuat.",
        windSpeedMs: null,
        visibilityKm: null,
        sourceMeta: {
          areaLabel,
          updatedAt: nowIso,
          ttlMs: 1000 * 60 * 20,
        },
      };
  const wind = {
    ...windBase,
    sourceMeta: {
      ...windBase.sourceMeta,
      areaLabel: granularArea,
    },
  };

  const floodBase =
    floodResult.status === "fulfilled"
      ? floodResult.value
      : {
          source: "Fallback" as const,
          summary: "Data bencana/banjir gagal dimuat.",
          recentReportCount: null,
          sourceMeta: {
            areaLabel,
            updatedAt: nowIso,
            ttlMs: 1000 * 60 * 10,
          },
        };
  const flood = {
    ...floodBase,
    sourceMeta: {
      ...floodBase.sourceMeta,
      areaLabel: granularArea,
    },
  };

  return {
    location: {
      label: weather.locationLabel || userContext.locationName,
      lat: userContext.lat,
      lng: userContext.lng,
      adm4Code: userContext.adm4Code,
    },
    timestamp: new Date().toISOString(),
    plannedTime: userContext.plannedTime,
    weather,
    microclimate,
    aqi,
    traffic,
    wind,
    flood,
    activityIntent: userContext.activity,
    transportMode: userContext.transportMode,
  };
}
