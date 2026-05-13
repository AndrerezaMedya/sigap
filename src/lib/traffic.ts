import { globalCache } from "@/lib/cache";
import type { EnvironmentalContext, SpeedReadingInterval, TrafficCongestionLevel, TransportMode } from "@/lib/types";

const ROUTES_API_URL = "https://routes.googleapis.com/directions/v2:computeRoutes";
const CACHE_TTL_MS = 1000 * 60 * 15; // 15 mins cache for Traffic

type TrafficContext = EnvironmentalContext["traffic"];

type GoogleRoutesResponse = {
  routes?: Array<{
    duration?: string;
    staticDuration?: string;
    distanceMeters?: number;
    polyline?: {
      encodedPolyline?: string;
    };
    travelAdvisory?: {
      speedReadingIntervals?: Array<{
        startPolylinePointIndex?: number;
        endPolylinePointIndex?: number;
        speed?: string;
      }>;
    };
  }>;
};

// Map our transport mode to Google Routes API routingPreference/travelMode
function getGoogleRoutingMode(mode: TransportMode) {
  switch (mode) {
    case "motorcycle":
      return { travelMode: "TWO_WHEELER" };
    case "walking":
      return { travelMode: "WALK" };
    case "cycling":
      return { travelMode: "BICYCLE" };
    case "public_transport":
      return { travelMode: "TRANSIT" };
    case "car":
    default:
      return { travelMode: "DRIVE", routingPreference: "TRAFFIC_AWARE" };
  }
}

function parseDurationToMinutes(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const seconds = Number.parseInt(value.replace("s", ""), 10);
  if (Number.isNaN(seconds)) {
    return null;
  }

  return Math.round(seconds / 60);
}

function getCongestionLevel(delayMin: number): TrafficCongestionLevel {
  if (delayMin <= 2) {
    return "low";
  }

  if (delayMin <= 8) {
    return "moderate";
  }

  return "high";
}

function createFallbackTraffic(areaLabel: string): TrafficContext {
  return {
    source: "Fallback",
    summary: "Estimasi lalu lintas real-time tidak tersedia untuk titik ini.",
    travelTimeMin: null,
    trafficDelayMin: null,
    congestionPercent: null,
    congestionLevel: "unknown",
    sourceMeta: {
      areaLabel,
      updatedAt: new Date().toISOString(),
      ttlMs: CACHE_TTL_MS,
    },
  };
}

export async function getTrafficConditions(
  lat: number | undefined,
  lng: number | undefined,
  destination: string | undefined,
  mode: TransportMode,
  areaLabel: string,
): Promise<TrafficContext> {
  const fallback = createFallbackTraffic(areaLabel);

  // We need origin coordinates and destination to do a route calculation
  if (typeof lat !== "number" || typeof lng !== "number" || !destination) {
    console.log("🚦 Traffic: Missing inputs", { lat, lng, destination });
    return fallback;
  }

  console.log(`🚦 Traffic: Requesting route for ${areaLabel} -> ${destination} (${mode})`);

  const apiKey = process.env.NEXT_PUBLIC_GCP_API_KEY || process.env.GCP_API_KEY;
  if (!apiKey) {
    console.warn("🚦 Traffic: No GCP_API_KEY found in environment!");
    return {
      ...fallback,
      summary: `Simulasi: Rute menuju ${destination} diprakirakan lancar dengan mode transportasi ${mode}. (GCP Routes API belum terkonfigurasi).`,
    };
  }

  // Very basic caching using origin and destination strings
  const cacheKey = `traffic_${lat.toFixed(3)}_${lng.toFixed(3)}_${destination}_${mode}`;
  const cached = globalCache.get(cacheKey) as TrafficContext | null;
  if (cached) {
    return cached;
  }

  const routingOptions = getGoogleRoutingMode(mode);

  try {
    const response = await fetch(ROUTES_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        // Request polyline + traffic interval data for frontend rendering
        "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.staticDuration,routes.polyline.encodedPolyline,routes.travelAdvisory.speedReadingIntervals",
        "Referer": "http://localhost:3000/",
      },
      body: JSON.stringify({
        origin: {
          location: {
            latLng: { latitude: lat, longitude: lng },
          },
        },
        destination: {
          // Fallback to text query for destination since we might only have a string "Kantor" or "Mall"
          address: destination,
        },
        ...routingOptions,
        extraComputations: ["TRAFFIC_ON_POLYLINE"],
        computeAlternativeRoutes: false,
        languageCode: "id-ID",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`🚦 Traffic: Routes API Error [${response.status}]`, errorText);
      throw new Error(`Routes API failed with status ${response.status}`);
    }

    const data = (await response.json()) as GoogleRoutesResponse;
    const route = data.routes?.[0];

    if (!route) {
      console.warn("🚦 Traffic: Google returned 0 routes for this path.");
      return fallback;
    }

    console.log("🚦 Traffic: Route found!", { 
      distance: route.distanceMeters, 
      duration: route.duration,
      hasPolyline: !!route.polyline?.encodedPolyline 
    });

    const durationMin = parseDurationToMinutes(route.duration);
    const staticDurationMin = parseDurationToMinutes(route.staticDuration) ?? durationMin;

    if (durationMin === null || staticDurationMin === null) {
      return fallback;
    }

    const distanceKm = route.distanceMeters
      ? (route.distanceMeters / 1000).toFixed(1)
      : null;
    const trafficDelayMin = Math.max(0, durationMin - staticDurationMin);
    
    let totalPoints = 0;
    let congestedPoints = 0;

    if (route.travelAdvisory?.speedReadingIntervals) {
      for (const interval of route.travelAdvisory.speedReadingIntervals) {
        const start = interval.startPolylinePointIndex ?? 0;
        const end = interval.endPolylinePointIndex ?? 0;
        const diff = end - start;
        totalPoints += diff;
        if (interval.speed === "SLOW" || interval.speed === "TRAFFIC_JAM") {
          congestedPoints += diff;
        }
      }
    }

    const congestionPercent = totalPoints > 0 ? Math.round((congestedPoints / totalPoints) * 100) : 0;
    const congestionLevel = getCongestionLevel(trafficDelayMin);

    // Parse speedReadingIntervals — normalize to typed format
    const rawIntervals = route.travelAdvisory?.speedReadingIntervals ?? [];
    const speedReadingIntervals: SpeedReadingInterval[] = rawIntervals
      .filter(i => i.speed === "NORMAL" || i.speed === "SLOW" || i.speed === "TRAFFIC_JAM")
      .map(i => ({
        startPolylinePointIndex: i.startPolylinePointIndex ?? 0,
        endPolylinePointIndex: i.endPolylinePointIndex ?? 0,
        speed: i.speed as SpeedReadingInterval["speed"],
      }));

    const result: TrafficContext = {
      source: "Google",
      summary: `Total Jarak: ${distanceKm ?? "-"} km\nEstimasi Waktu Tempuh: ${durationMin} menit\nMenit Keterlambatan: ${trafficDelayMin} menit\nPersentase Kemacetan: ${congestionPercent}%`,
      travelTimeMin: durationMin,
      trafficDelayMin,
      congestionPercent,
      congestionLevel,
      encodedPolyline: route.polyline?.encodedPolyline,
      speedReadingIntervals: speedReadingIntervals.length > 0 ? speedReadingIntervals : undefined,
      sourceMeta: {
        areaLabel,
        updatedAt: new Date().toISOString(),
        ttlMs: CACHE_TTL_MS,
      },
    };

    globalCache.set(cacheKey, result, CACHE_TTL_MS);
    return result;
  } catch (error) {
    console.error("Traffic fetch failed:", error);
    return fallback;
  }
}
