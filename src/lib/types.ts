export type ActivityType =
  | "commute"
  | "motorcycle"
  | "walking"
  | "jogging"
  | "outdoor_event"
  | "cycling"
  | "family_trip";

export type TransportMode =
  | "motorcycle"
  | "car"
  | "walking"
  | "cycling"
  | "public_transport";

export type RiskLevel =
  | "safe"
  | "comfortable"
  | "moderate"
  | "less_recommended"
  | "high_risk";

export type UserProfile = {
  occupation: string;
  ageGroup: string;
  mainTransport: TransportMode;
  healthNotes?: string;
};

export type UserContext = {
  locationName: string;
  lat?: number;
  lng?: number;
  adm4Code?: string;
  destination?: string;
  activity: ActivityType;
  transportMode: TransportMode;
  plannedTime: string;
  userQuestion?: string;
  profile?: UserProfile;
};

export type SourceMeta = {
  areaLabel: string;
  updatedAt: string;
  ttlMs: number;
};

export type WeatherPoint = {
  localDatetime: string;
  temperatureCelsius: number | null;
  humidityPercent: number | null;
  precipitationMm: number | null;
  weatherDescription: string;
  windSpeedKmh: number | null;
  cloudCoverPercent: number | null;
  visibilityText: string | null;
};

export type WeatherContext = {
  source: "BMKG" | "Fallback";
  locationLabel: string;
  analysisDate?: string;
  summary: string;
  forecast: WeatherPoint[];
  sourceMeta: SourceMeta;
};

export type TrafficCongestionLevel = "low" | "moderate" | "high" | "unknown";

/** Per-segment speed data from Routes API TRAFFIC_ON_POLYLINE computation */
export type SpeedReadingInterval = {
  startPolylinePointIndex: number;
  endPolylinePointIndex: number;
  speed: "NORMAL" | "SLOW" | "TRAFFIC_JAM";
};

export type EnvironmentalContext = {
  location: {
    label: string;
    lat?: number;
    lng?: number;
    adm4Code?: string;
  };
  timestamp: string;
  plannedTime?: string;
  weather: WeatherContext;
  microclimate: {
    source: "VisualCrossing" | "Fallback";
    summary: string;
    uvIndex: number | null;
    sourceMeta: SourceMeta;
  };
  aqi: {
    source: "Google" | "Fallback" | "Planned";
    level: string;
    summary: string;
    aqi: number | null;
    pm25: number | null;
    sourceMeta: SourceMeta;
  };
  traffic: {
    source: "Google" | "Fallback" | "Planned";
    summary: string;
    travelTimeMin: number | null;
    trafficDelayMin: number | null;
    /** Persentase panjang rute dengan status SLOW atau TRAFFIC_JAM (0-100) */
    congestionPercent: number | null;
    congestionLevel: TrafficCongestionLevel;
    /** Encoded polyline string from Routes API — used by frontend to draw the route */
    encodedPolyline?: string;
    /** Per-segment speed intervals for traffic-colored polyline rendering */
    speedReadingIntervals?: SpeedReadingInterval[];
    sourceMeta: SourceMeta;
  };
  wind: {
    source: "Stormglass" | "Fallback";
    summary: string;
    windSpeedMs: number | null;
    visibilityKm: number | null;
    sourceMeta: SourceMeta;
  };
  flood: {
    source: "PetaBencana" | "Fallback" | "Planned";
    summary: string;
    /** Jumlah laporan genangan dalam jendela waktu API; null jika tidak diketahui (fallback). */
    recentReportCount: number | null;
    sourceMeta: SourceMeta;
  };
  activityIntent: ActivityType;
  transportMode: TransportMode;
};

export type RecommendationTimelineItem = {
  time: string;
  label: string;
  detail: string;
  riskLevel: RiskLevel;
};

export type DecisionRecommendation = {
  riskLevel: RiskLevel;
  statusLabel: string;
  headline: string;
  recommendation: string;
  reasoning: string[];
  confidence: number;
  bestWindow: string;
  timeline: RecommendationTimelineItem[];
  dataNotes: string[];
  activityComparison?: ActivityComparisonItem[];
};

export type ActivityComparisonItem = {
  activity: ActivityType;
  comfort: number;
  reason: string;
};

export type RecommendationRequest = {
  userContext: UserContext;
};

export type RecommendationResponse = {
  userContext: UserContext;
  environmentalContext: EnvironmentalContext;
  recommendation: DecisionRecommendation;
  generatedBy: "Gemini" | "Fallback";
};
