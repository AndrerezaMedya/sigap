import { globalCache } from "@/lib/cache";
import type { EnvironmentalContext, SourceMeta } from "@/lib/types";

// PetaBencana API documentation: https://docs.petabencana.id/routes/laporan-urun-daya
// Correct base: api.petabencana.id (NOT data.petabencana.id)
// Parameters: admin (ISO 3166-2 province code), disaster, timeperiod (seconds), geoformat
// No lat/lng/distance params — radius filtering is done client-side via Haversine
const PETA_BENCANA_API_URL = "https://api.petabencana.id/reports";
const CACHE_TTL_MS = 1000 * 60 * 10; // 10 min
const RADIUS_KM = 15;
const TIME_PERIOD_SEC = 6 * 60 * 60; // 6 hours

type FloodContext = EnvironmentalContext["flood"];

function floodMeta(areaLabel: string): SourceMeta {
  return {
    areaLabel,
    updatedAt: new Date().toISOString(),
    ttlMs: CACHE_TTL_MS,
  };
}

// ── Haversine distance (km) ──────────────────────────────────────────────────
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Map coordinates to PetaBencana admin code (ISO 3166-2:ID) ───────────────
// Ordered from most specific (DKI Jakarta) to broadest (island-level).
// If no match, falls back to empty string → all-Indonesia query.
function getAdminCode(lat: number, lng: number): string {
  // DKI Jakarta (more specific, checked before Jawa Barat)
  if (lat >= -6.37 && lat <= -5.89 && lng >= 106.65 && lng <= 107.00) return "ID-JK";
  // Banten
  if (lat >= -7.10 && lat <= -5.80 && lng >= 105.20 && lng <= 106.70) return "ID-BT";
  // Jawa Barat (includes Bandung, Bogor, Depok, Bekasi, Cirebon)
  if (lat >= -7.80 && lat <= -5.90 && lng >= 105.10 && lng <= 108.80) return "ID-JB";
  // Jawa Tengah
  if (lat >= -8.20 && lat <= -6.40 && lng >= 108.60 && lng <= 111.70) return "ID-JT";
  // D.I. Yogyakarta
  if (lat >= -8.20 && lat <= -7.50 && lng >= 110.00 && lng <= 110.80) return "ID-YO";
  // Jawa Timur
  if (lat >= -8.80 && lat <= -6.90 && lng >= 110.90 && lng <= 114.50) return "ID-JI";
  // Bali
  if (lat >= -8.90 && lat <= -8.00 && lng >= 114.40 && lng <= 115.70) return "ID-BA";
  // Sumatera Utara (Medan)
  if (lat >= 1.00 && lat <= 4.60 && lng >= 97.50 && lng <= 100.00) return "ID-SU";
  // Sumatera Selatan (Palembang)
  if (lat >= -5.50 && lat <= -1.50 && lng >= 102.50 && lng <= 107.00) return "ID-SS";
  // Sulawesi Selatan (Makassar)
  if (lat >= -7.00 && lat <= -1.00 && lng >= 119.00 && lng <= 125.00) return "ID-SN";
  // No match → query all (filter by distance)
  return "";
}

// GeoJSON feature shape returned when geoformat=geojson
type GeoFeature = {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    created_at?: string;
    disaster_type?: string;
    status?: string;
    text?: string;
  };
};

type GeoResponse = {
  statusCode?: number;
  result?: {
    type: "FeatureCollection";
    features?: GeoFeature[];
  };
};

export async function getFloodAlerts(
  lat: number | undefined,
  lng: number | undefined,
  areaLabel: string,
): Promise<FloodContext> {
  const fallback: FloodContext = {
    source: "Fallback",
    summary: "Informasi peringatan banjir real-time tidak tersedia.",
    recentReportCount: null,
    sourceMeta: floodMeta(areaLabel),
  };

  if (typeof lat !== "number" || typeof lng !== "number") return fallback;

  const cacheKey = `flood_${lat.toFixed(3)}_${lng.toFixed(3)}`;
  const cached = globalCache.get(cacheKey) as FloodContext | null;
  if (cached) return cached;

  try {
    const adminCode = getAdminCode(lat, lng);

    const url = new URL(PETA_BENCANA_API_URL);
    if (adminCode) url.searchParams.append("admin", adminCode);
    url.searchParams.append("disaster", "flood");
    url.searchParams.append("timeperiod", String(TIME_PERIOD_SEC));
    url.searchParams.append("geoformat", "geojson");

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "SIGAP-App/1.0 (https://github.com/AndrerezaMedya/sigap)",
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`PetaBencana API failed: ${response.status}`);
    }

    const data = (await response.json()) as GeoResponse;
    const features = data.result?.features ?? [];

    // Filter to only reports within RADIUS_KM of user
    const sixHoursAgo = new Date(Date.now() - TIME_PERIOD_SEC * 1000);
    const nearbyReports = features.filter((f) => {
      const [fLng, fLat] = f.geometry.coordinates;
      if (typeof fLat !== "number" || typeof fLng !== "number") return false;
      if (haversineKm(lat, lng, fLat, fLng) > RADIUS_KM) return false;
      const createdAt = f.properties.created_at;
      return createdAt ? new Date(createdAt) > sixHoursAgo : true;
    });

    let summary = `Tidak terpantau laporan banjir dalam radius ${RADIUS_KM}km.`;
    if (nearbyReports.length > 0) {
      summary = `Perhatian: ${nearbyReports.length} laporan genangan banjir terdeteksi dalam radius ${RADIUS_KM}km dari lokasi Anda (6 jam terakhir). Harap waspada.`;
    }

    const result: FloodContext = {
      source: "PetaBencana",
      summary,
      recentReportCount: nearbyReports.length,
      sourceMeta: floodMeta(areaLabel),
    };

    globalCache.set(cacheKey, result, CACHE_TTL_MS);
    return result;

  } catch (error) {
    console.error("Flood fetch failed:", error);
    return fallback;
  }
}
