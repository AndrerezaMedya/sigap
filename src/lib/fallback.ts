import type {
  DecisionRecommendation,
  EnvironmentalContext,
  RiskLevel,
  SourceMeta,
  UserContext,
  WeatherContext,
} from "@/lib/types";

const FALLBACK_TTL_MS = 1000 * 60 * 30;

function nowIso(): string {
  return new Date().toISOString();
}

function createSourceMeta(areaLabel: string): SourceMeta {
  return {
    areaLabel,
    updatedAt: nowIso(),
    ttlMs: FALLBACK_TTL_MS,
  };
}

export function createFallbackWeather(locationLabel: string): WeatherContext {
  const now = new Date();
  const hourMs = 60 * 60 * 1000;
  const sourceMeta = createSourceMeta(locationLabel);

  return {
    source: "Fallback",
    locationLabel,
    analysisDate: now.toISOString(),
    summary:
      "Data demo menunjukkan cuaca berawan dengan peluang hujan ringan menjelang sore.",
    forecast: [0, 1, 2, 3].map((offset) => ({
      localDatetime: new Date(now.getTime() + offset * hourMs).toISOString(),
      temperatureCelsius: 29 - Math.min(offset, 2),
      humidityPercent: 78 + offset * 3,
      precipitationMm: offset < 2 ? 0 : 1.2,
      weatherDescription: offset < 2 ? "Berawan" : "Hujan ringan",
      windSpeedKmh: 8 + offset,
      cloudCoverPercent: 70 + offset * 5,
      visibilityText: "Baik",
    })),
    sourceMeta,
  };
}

export function createFallbackEnvironmentalContext(
  userContext: UserContext,
): EnvironmentalContext {
  const areaLabel = userContext.locationName;
  const sourceMeta = createSourceMeta(areaLabel);

  return {
    location: {
      label: userContext.locationName,
      adm4Code: userContext.adm4Code,
    },
    timestamp: new Date().toISOString(),
    plannedTime: userContext.plannedTime,
    weather: createFallbackWeather(userContext.locationName),
    microclimate: {
      source: "Fallback",
      summary: "Data cuaca mikroklimat (VisualCrossing) tidak tersedia dalam mode demo.",
      uvIndex: null,
      sourceMeta,
    },
    aqi: {
      source: "Fallback",
      level: "Sedang",
      summary:
        "AQI belum terhubung ke Google Air Quality API; gunakan sebagai konteks demo.",
      aqi: null,
      pm25: null,
      sourceMeta,
    },
    traffic: {
      source: "Fallback",
      summary:
        "Estimasi mobilitas demo: kepadatan cenderung meningkat pada jam berangkat/pulang.",
      travelTimeMin: null,
      trafficDelayMin: null,
      congestionPercent: null,
      congestionLevel: "unknown",
      sourceMeta,
    },
    wind: {
      source: "Fallback",
      summary:
        "Kondisi angin dan visibilitas Stormglass belum tersedia; gunakan sebagai konteks awal.",
      windSpeedMs: null,
      visibilityKm: null,
      sourceMeta,
    },
    flood: {
      source: "Fallback",
      summary:
        "Belum ada peringatan banjir aktif dalam data demo; integrasi PetaBencana disiapkan untuk tahap lanjut.",
      recentReportCount: null,
      sourceMeta,
    },
    activityIntent: userContext.activity,
    transportMode: userContext.transportMode,
  };
}

export function createFallbackRecommendation(
  context: EnvironmentalContext,
): DecisionRecommendation {
  const upcomingRain = context.weather.forecast.some((item) =>
    item.weatherDescription.toLowerCase().includes("hujan"),
  );
  const riskLevel: RiskLevel = upcomingRain ? "moderate" : "comfortable";

  // Generate activity comparison scores based on weather
  const activityComparison = [
    {
      activity: "walking" as const,
      comfort: upcomingRain ? 30 : 60,
      reason: upcomingRain ? "Hujan dapat mengganggu kenyamanan pedestrian" : "Cuaca nyaman untuk berjalan",
    },
    {
      activity: "motorcycle" as const,
      comfort: upcomingRain ? 45 : 75,
      reason: upcomingRain ? "Hujan mengurangi stabilitas dan visibilitas" : "Aksesibilitas baik, tapi perhatikan cuaca",
    },
    {
      activity: "commute" as const,
      comfort: upcomingRain ? 70 : 85,
      reason: upcomingRain ? "Mobil memberikan perlindungan, tapi lalu lintas kemungkinan padat" : "Paling optimal di dalam kendaraan tertutup",
    },
    {
      activity: "jogging" as const,
      comfort: upcomingRain ? 20 : 65,
      reason: upcomingRain ? "Hujan membuat olahraga tidak nyaman dan berisiko" : "Kondisi cukup baik untuk jogging pagi/sore",
    },
    {
      activity: "outdoor_event" as const,
      comfort: upcomingRain ? 35 : 75,
      reason: upcomingRain ? "Hujan memerlukan persiapan tambahan (tenda, perlengkapan)" : "Cocok untuk acara outdoor",
    },
    {
      activity: "cycling" as const,
      comfort: upcomingRain ? 25 : 70,
      reason: upcomingRain ? "Permukaan jalan licin, mengurangi keamanan" : "Aksesibilitas baik, pantau cuaca",
    },
    {
      activity: "family_trip" as const,
      comfort: upcomingRain ? 50 : 80,
      reason: upcomingRain ? "Dapat dilakukan dengan persiapan khusus untuk anak-anak" : "Kondisi ideal untuk keluarga",
    },
  ];

  return {
    riskLevel,
    statusLabel: upcomingRain ? "Caution" : "Nyaman",
    headline: upcomingRain
      ? "Aktivitas masih memungkinkan, tetapi sebaiknya percepat keberangkatan."
      : "Kondisi relatif nyaman untuk aktivitas yang direncanakan.",
    recommendation: upcomingRain
      ? "Berangkat dalam 30 menit ke depan atau siapkan alternatif jika hujan meningkat."
      : "Lanjutkan rencana dengan tetap memantau perubahan cuaca lokal.",
    reasoning: [
      context.weather.summary,
      context.traffic.summary,
      context.flood.summary,
    ],
    confidence: context.weather.source === "BMKG" ? 0.72 : 0.56,
    bestWindow: upcomingRain ? "Sekarang - 30 menit ke depan" : "1 jam ke depan",
    timeline: context.weather.forecast.slice(0, 4).map((item) => ({
      time: new Date(item.localDatetime).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
      }),
      label: item.weatherDescription,
      detail: `${item.temperatureCelsius ?? "-"}°C, kelembapan ${
        item.humidityPercent ?? "-"
      }%`,
      riskLevel: item.weatherDescription.toLowerCase().includes("hujan")
        ? "moderate"
        : "comfortable",
    })),
    dataNotes: [
      `Sumber cuaca: ${context.weather.source}`,
      "AQI, lalu lintas, dan banjir masih memakai fallback sampai kredensial GCP/API tersedia.",
    ],
    activityComparison,
  };
}
