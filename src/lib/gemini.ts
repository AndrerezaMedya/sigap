import { createFallbackRecommendation } from "@/lib/fallback";
import type {
  ActivityType,
  DecisionRecommendation,
  EnvironmentalContext,
  RiskLevel,
  TransportMode,
} from "@/lib/types";

/** Explicit trip context injected into the Gemini prompt when user plans a route */
export interface TripContext {
  origin: string;
  destination: string;
  transportMode: TransportMode;
  plannedTime: string; // ISO string
}

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.1-flash-lite";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Strip frontend-only fields before serializing to Gemini.
 * - encodedPolyline + speedReadingIntervals : used only by IntelligenceMap — not needed by Gemini
 * - weather.forecast: trim to 6 periods (~18hrs) — enough for decision-making
 *
 * Removing these saves ~1-3k tokens per request.
 */
function serializeContextForGemini(context: EnvironmentalContext): unknown {
  const { traffic, weather, ...rest } = context;
  const { encodedPolyline: _ep, speedReadingIntervals: _sri, ...trafficForGemini } = traffic;
  const forecastTrimmed = weather.forecast.slice(0, 6);
  return {
    ...rest,
    weather: { ...weather, forecast: forecastTrimmed },
    traffic: trafficForGemini,
  };
}

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

const RISK_LEVELS: RiskLevel[] = [
  "safe",
  "comfortable",
  "moderate",
  "less_recommended",
  "high_risk",
];

const ACTIVITY_TYPES: ActivityType[] = [
  "walking",
  "motorcycle",
  "commute",
  "jogging",
  "outdoor_event",
  "cycling",
  "family_trip",
];

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1] ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("Gemini response did not contain JSON");
  }

  return JSON.parse(candidate.slice(start, end + 1));
}

function isRiskLevel(value: unknown): value is RiskLevel {
  return typeof value === "string" && RISK_LEVELS.includes(value as RiskLevel);
}

function isActivityType(value: unknown): value is ActivityType {
  return typeof value === "string" && ACTIVITY_TYPES.includes(value as ActivityType);
}

function normalizeRecommendation(
  value: unknown,
  fallback: DecisionRecommendation,
): DecisionRecommendation {
  if (!value || typeof value !== "object") {
    return fallback;
  }

  const raw = value as Partial<DecisionRecommendation>;

  return {
    riskLevel: isRiskLevel(raw.riskLevel) ? raw.riskLevel : fallback.riskLevel,
    statusLabel:
      typeof raw.statusLabel === "string" ? raw.statusLabel : fallback.statusLabel,
    headline: typeof raw.headline === "string" ? raw.headline : fallback.headline,
    recommendation:
      typeof raw.recommendation === "string"
        ? raw.recommendation
        : fallback.recommendation,
    reasoning: Array.isArray(raw.reasoning)
      ? raw.reasoning.filter((item): item is string => typeof item === "string")
      : fallback.reasoning,
    confidence:
      typeof raw.confidence === "number"
        ? Math.max(0, Math.min(1, raw.confidence))
        : fallback.confidence,
    bestWindow:
      typeof raw.bestWindow === "string" ? raw.bestWindow : fallback.bestWindow,
    timeline: Array.isArray(raw.timeline)
      ? raw.timeline
          .filter((item) => item && typeof item === "object")
          .map((item) => {
            const timelineItem = item as Partial<
              DecisionRecommendation["timeline"][number]
            >;

            return {
              time:
                typeof timelineItem.time === "string"
                  ? timelineItem.time
                  : "Sekarang",
              label:
                typeof timelineItem.label === "string"
                  ? timelineItem.label
                  : "Pantau kondisi",
              detail:
                typeof timelineItem.detail === "string"
                  ? timelineItem.detail
                  : "Data pendukung terbatas.",
              riskLevel: isRiskLevel(timelineItem.riskLevel)
                ? timelineItem.riskLevel
                : fallback.riskLevel,
            };
          })
          .slice(0, 4)
      : fallback.timeline,
    dataNotes: Array.isArray(raw.dataNotes)
      ? raw.dataNotes.filter((item): item is string => typeof item === "string")
      : fallback.dataNotes,
    activityComparison: (() => {
      const merged = new Map(
        (fallback.activityComparison ?? []).map((item) => [item.activity, item]),
      );

      if (Array.isArray(raw.activityComparison)) {
        raw.activityComparison
          .filter((item) => Boolean(item) && typeof item === "object")
          .forEach((item) => {
            const row = item as Record<string, unknown>;
            const activity = isActivityType(row.activity) ? row.activity : null;
            if (!activity) {
              return;
            }

            const fallbackItem = merged.get(activity);
            merged.set(activity, {
              activity,
              comfort:
                typeof row.comfort === "number"
                  ? Math.max(0, Math.min(100, row.comfort))
                  : (fallbackItem?.comfort ?? 50),
              reason:
                typeof row.reason === "string" && row.reason.trim() !== ""
                  ? row.reason.trim()
                  : (fallbackItem?.reason ?? "Data terbatas"),
            });
          });
      }

      return ACTIVITY_TYPES.map(
        (activity) =>
          merged.get(activity) ?? {
            activity,
            comfort: 50,
            reason: "Data aktivitas belum cukup, gunakan sebagai indikator awal.",
          },
      );
    })(),
  };
}

const TRANSPORT_LABEL: Record<TransportMode, string> = {
  motorcycle: "Motor (Sepeda Motor)",
  car: "Mobil",
  walking: "Jalan Kaki",
  cycling: "Sepeda",
  public_transport: "Transportasi Umum",
};

function buildPrompt(
  context: EnvironmentalContext,
  userQuestion?: string,
  userProfile?: import("@/lib/types").UserProfile,
  tripContext?: TripContext,
): string {
  const questionBlock = userQuestion
    ? `\n\nPertanyaan spesifik dari pengguna:\n"${userQuestion}"\n\nJawab pertanyaan ini secara langsung dalam field "headline" dan "recommendation". Berikan jawaban yang kontekstual dan membantu keputusan mereka.`
    : "";

  const personaBlock = userProfile
    ? `\n\nPROFIL PENGGUNA (PERSONA):
Pengguna ini adalah seorang [${userProfile.occupation}] dengan rentang usia [${userProfile.ageGroup}]. Moda transportasi utama mereka adalah [${userProfile.mainTransport}]. Catatan kesehatan: [${userProfile.healthNotes || "Tidak ada"}].
Instruksi Personalisasi: Sesuaikan rekomendasi Anda dengan gaya hidup, usia, dan kesehatan mereka. Contoh: Jika ada catatan kesehatan (misal asma), beri peringatan ketat saat AQI buruk. Perhatikan juga Indeks UV (uvIndex) untuk menyarankan pelindung matahari (sunscreen/jaket) jika beraktivitas outdoor siang hari saat UV tinggi (>5).`
    : "";

  // When destination is provided, inject explicit trip planning context.
  // This is the MOST IMPORTANT block — without it, Gemini doesn't know
  // the user is evaluating a specific route from A to B.
  const tripBlock = tripContext
    ? `\n\nKONTEKS RENCANA PERJALANAN (WAJIB DIPERHATIKAN):
Pengguna sedang merencanakan perjalanan dengan detail berikut:
- Titik Berangkat  : ${tripContext.origin}
- Tujuan           : ${tripContext.destination}
- Moda Transportasi: ${TRANSPORT_LABEL[tripContext.transportMode] ?? tripContext.transportMode}
- Waktu Berangkat  : ${new Date(tripContext.plannedTime).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Jakarta" })}

Fokus UTAMA: Evaluasi apakah rute ini aman dan optimal pada waktu tersebut berdasarkan kondisi lalu lintas, cuaca, dan lingkungan. Headline dan rekomendasi HARUS spesifik tentang perjalanan ini (sebutkan asal, tujuan, atau moda). Jangan memberikan rekomendasi generik tentang cuaca saja.`
    : "";

  return `Anda adalah SIGAP, Smart Intelligent Guide for Activity Planning.

Tugas Anda adalah mengubah konteks lingkungan menjadi rekomendasi keputusan yang ringkas, praktis, dan manusiawi. Jangan bertindak sebagai chatbot umum. Fokus pada keputusan: aman/tidak, kapan sebaiknya berangkat/beraktivitas, risiko utama, dan alasan.${personaBlock}${tripBlock}

Pengguna mungkin bertanya dengan bahasa sehari-hari (contoh: "ntar sore mau keluar jam 4, mending pake motor atau mobil?"). Pahami intent mereka dan berikan rekomendasi yang relevan.

PENTING: Selain rekomendasi utama, berikan perbandingan "Comfort & Safety Score" (0-100) untuk SEMUA jenis aktivitas pada waktu rencana yang sama (plannedTime). Ini membantu user melihat pilihan lain dengan sekali pandang tanpa mengganti waktu.

Balas hanya JSON valid tanpa markdown dengan bentuk:
{
  "riskLevel": "safe | comfortable | moderate | less_recommended | high_risk",
  "statusLabel": "label pendek berbahasa Indonesia",
  "headline": "satu kalimat keputusan utama",
  "recommendation": "aksi praktis yang disarankan",
  "reasoning": ["2-4 alasan ringkas"],
  "confidence": 0.0,
  "bestWindow": "rentang waktu terbaik",
  "timeline": [
    {"time":"HH:mm","label":"situasi","detail":"alasan singkat","riskLevel":"safe | comfortable | moderate | less_recommended | high_risk"}
  ],
  "dataNotes": ["catatan sumber data atau ketidakpastian"],
  "activityComparison": [
    {"activity":"walking","comfort":40,"reason":"Alasan singkat mengapa walking score ini"},
    {"activity":"motorcycle","comfort":75,"reason":"Alasan singkat"},
    {"activity":"commute","comfort":95,"reason":"Alasan singkat"},
    {"activity":"jogging","comfort":30,"reason":"Alasan singkat"},
    {"activity":"outdoor_event","comfort":50,"reason":"Alasan singkat"},
    {"activity":"cycling","comfort":60,"reason":"Alasan singkat"},
    {"activity":"family_trip","comfort":70,"reason":"Alasan singkat"}
  ]
}

Konteks terstruktur:
${JSON.stringify(serializeContextForGemini(context), null, 2)}${questionBlock}`;
}

export async function generateGeminiRecommendation(
  context: EnvironmentalContext,
  userQuestion?: string,
  userProfile?: import("@/lib/types").UserProfile,
  tripContext?: TripContext,
): Promise<DecisionRecommendation> {
  const fallback = createFallbackRecommendation(context);
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return fallback;
  }

  try {
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: buildPrompt(context, userQuestion, userProfile, tripContext) }],
          },
        ],
        generationConfig: {
          temperature: 0.35,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini request failed with ${response.status}`);
    }

    const payload = (await response.json()) as GeminiResponse;
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("Gemini response was empty");
    }

    return normalizeRecommendation(extractJson(text), fallback);
  } catch (error) {
    console.error("Gemini recommendation fallback activated", error);
    return fallback;
  }
}
