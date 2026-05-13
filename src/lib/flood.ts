import { globalCache } from "@/lib/cache";
import type { EnvironmentalContext, SourceMeta } from "@/lib/types";

// PetaBencana API documentation: https://docs.petabencana.id/
// For checking floods in an area, we can query by coordinates (distance) or adm area.
const PETA_BENCANA_API_URL = "https://data.petabencana.id/reports";
const CACHE_TTL_MS = 1000 * 60 * 10; // 10 mins cache for flood data

type FloodContext = EnvironmentalContext["flood"];

function floodMeta(areaLabel: string): SourceMeta {
  return {
    areaLabel,
    updatedAt: new Date().toISOString(),
    ttlMs: CACHE_TTL_MS,
  };
}

type FloodReport = {
  properties?: {
    created_at?: string;
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

  if (typeof lat !== "number" || typeof lng !== "number") {
    return fallback;
  }

  // PetaBencana doesn't strictly require an API key for public endpoints,
  // but if we simulate it via env check, we can bypass if user wants to mock.
  const isProd = process.env.NODE_ENV === "production" || process.env.GCP_API_KEY;
  if (!isProd) {
    return {
      source: "Fallback",
      summary: "Simulasi: Tidak ada laporan genangan banjir di sekitar lokasi ini.",
      recentReportCount: 0,
      sourceMeta: floodMeta(areaLabel),
    };
  }

  const cacheKey = `flood_${lat.toFixed(3)}_${lng.toFixed(3)}`;
  const cached = globalCache.get(cacheKey) as FloodContext | null;
  if (cached) return cached;

  try {
    // We query reports within 5000 meters from the coordinates.
    // Query params for PetaBencana: lat, lng, distance, admin, disaster
    const url = new URL(PETA_BENCANA_API_URL);
    url.searchParams.append("lat", lat.toString());
    url.searchParams.append("lng", lng.toString());
    url.searchParams.append("distance", "5000"); // 5km radius
    url.searchParams.append("disaster", "flood");

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`PetaBencana API failed with status ${response.status}`);
    }

    const data = (await response.json()) as {
      result?: {
        objects?: {
          output?: {
            geometries?: FloodReport[];
          };
        };
      };
    };
    const reports = data.result?.objects?.output?.geometries ?? [];
    
    // Filter out reports older than 6 hours
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    const recentReports = reports.filter((report) => {
      const createdAt = report.properties?.created_at;
      return createdAt ? new Date(createdAt) > sixHoursAgo : false;
    });

    let summary = "Tidak terpantau ada laporan banjir dalam radius 5km.";
    if (recentReports.length > 0) {
      summary = `Perhatian: Terdapat ${recentReports.length} laporan genangan banjir di sekitar Anda dalam 6 jam terakhir. Harap waspada jika bepergian.`;
    }

    const result: FloodContext = {
      source: "PetaBencana",
      summary,
      recentReportCount: recentReports.length,
      sourceMeta: floodMeta(areaLabel),
    };

    globalCache.set(cacheKey, result, CACHE_TTL_MS);
    return result;

  } catch (error) {
    console.error("Flood fetch failed:", error);
    return fallback;
  }
}
