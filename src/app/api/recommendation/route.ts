import { NextResponse } from "next/server";
import { buildEnvironmentalContext } from "@/lib/context";
import { generateGeminiRecommendation, type TripContext } from "@/lib/gemini";
import { DEFAULT_DEMO_LOCATION } from "@/lib/options";
import type {
  ActivityType,
  RecommendationRequest,
  RecommendationResponse,
  TransportMode,
  UserContext,
} from "@/lib/types";

const ACTIVITIES: ActivityType[] = [
  "commute",
  "motorcycle",
  "walking",
  "jogging",
  "outdoor_event",
  "cycling",
  "family_trip",
];

const TRANSPORT_MODES: TransportMode[] = [
  "motorcycle",
  "car",
  "walking",
  "cycling",
  "public_transport",
];

function isActivity(value: unknown): value is ActivityType {
  return typeof value === "string" && ACTIVITIES.includes(value as ActivityType);
}

function isTransportMode(value: unknown): value is TransportMode {
  return (
    typeof value === "string" &&
    TRANSPORT_MODES.includes(value as TransportMode)
  );
}

function normalizeUserContext(value: unknown): UserContext {
  const raw =
    value && typeof value === "object"
      ? (value as Partial<UserContext>)
      : ({} as Partial<UserContext>);

  return {
    locationName:
      typeof raw.locationName === "string" && raw.locationName.trim() !== ""
        ? raw.locationName.trim()
        : DEFAULT_DEMO_LOCATION.label,
    lat: typeof raw.lat === "number" ? raw.lat : DEFAULT_DEMO_LOCATION.lat,
    lng: typeof raw.lng === "number" ? raw.lng : DEFAULT_DEMO_LOCATION.lng,
    adm4Code:
      typeof raw.adm4Code === "string" && raw.adm4Code.trim() !== ""
        ? raw.adm4Code.trim()
        : DEFAULT_DEMO_LOCATION.adm4Code,
    destination:
      typeof raw.destination === "string" && raw.destination.trim() !== ""
        ? raw.destination.trim()
        : undefined,
    activity: isActivity(raw.activity) ? raw.activity : undefined,
    transportMode: isTransportMode(raw.transportMode)
      ? raw.transportMode
      : undefined,
    plannedTime:
      typeof raw.plannedTime === "string" && raw.plannedTime.trim() !== ""
        ? raw.plannedTime.trim()
        : new Date().toISOString(),
    userQuestion:
      typeof raw.userQuestion === "string" && raw.userQuestion.trim() !== ""
        ? raw.userQuestion.trim()
        : undefined,
    profile:
      raw.profile && typeof raw.profile === "object"
        ? raw.profile
        : undefined,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<RecommendationRequest>;
    const userContext = normalizeUserContext(body.userContext);
    const environmentalContext = await buildEnvironmentalContext(userContext);

    // Build explicit trip context when destination AND transport mode are provided
    // This tells Gemini exactly where the user is going, not just traffic numbers
    const tripContext: TripContext | undefined =
      userContext.destination && userContext.transportMode
        ? {
            origin: userContext.locationName,
            destination: userContext.destination,
            transportMode: userContext.transportMode,
            plannedTime: userContext.plannedTime,
          }
        : undefined;

    const recommendation = await generateGeminiRecommendation(
      environmentalContext,
      userContext.userQuestion,
      userContext.profile,
      tripContext,
    );

    const response: RecommendationResponse = {
      userContext,
      environmentalContext,
      recommendation,
      generatedBy: process.env.GEMINI_API_KEY ? "Gemini" : "Fallback",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Recommendation API failed", error);
    return NextResponse.json(
      {
        error:
          "SIGAP belum bisa membuat rekomendasi saat ini. Coba lagi beberapa saat.",
      },
      { status: 500 },
    );
  }
}
