# SIGAP

Smart Intelligent Guide for Activity Planning, an AI-powered city decision engine for #JuaraVibeCoding.

SIGAP helps urban residents decide whether an activity is safe, when to depart, and what environmental risks matter. The MVP uses BMKG weather data, a structured environmental context object, and Gemini reasoning via Google AI Studio.

## Why It Matters

### Problem

People often need to open multiple apps to understand weather, mobility, air quality, and urban risk before making a simple daily decision. Raw data is fragmented and difficult to interpret quickly.

### Solution

SIGAP turns environmental signals into a clear recommendation:

- Status: safe, comfortable, caution, less recommended, or high risk.
- Action: depart now, delay, prepare an alternative, or avoid an activity.
- Reasoning: concise explanation based on weather and planned activity.
- Timeline: short time-based guidance for the next decision window.

### Uniqueness

SIGAP is not a weather dashboard or generic chatbot. It uses Gemini as a contextual environmental reasoning engine, with a decision-first UI designed around urban activity planning.

## Tech Stack

- Next.js + TypeScript
- Gemini API through Google AI Studio API Key
- BMKG public weather API
- Server-side API routes for secret handling
- Docker standalone build for Google Cloud Run

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `GEMINI_API_KEY` in `.env.local`.

If the Gemini key or an external data provider is unavailable, SIGAP uses fallback data so the demo remains usable.

## Environment Variables

```bash
GEMINI_API_KEY=your_google_ai_studio_api_key
GEMINI_MODEL=gemini-2.5-flash
GCP_API_KEY=your_google_maps_and_air_quality_key
VC_API_KEY=your_visualcrossing_key
STORMGLASS_API_KEY=your_stormglass_key
```

## Cloud Run Deployment

Build and deploy with Google Cloud:

```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/sigap
gcloud run deploy sigap \
  --image gcr.io/PROJECT_ID/sigap \
  --platform managed \
  --region asia-southeast2 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=YOUR_KEY,GEMINI_MODEL=gemini-2.5-flash
```

Replace `PROJECT_ID` and `YOUR_KEY` with your Google Cloud project and Google AI Studio key.

## Demo Flow

1. Open the live Cloud Run URL.
2. Show the problem: users normally interpret raw weather and mobility data themselves.
3. Select a location, activity, transport mode, and planned time.
4. Click `Dapatkan rekomendasi SIGAP`.
5. Explain the Smart Decision Panel: decision first, then reasoning, supporting data, and timeline.
6. Highlight #JuaraVibeCoding compliance: Gemini, Google Cloud Run, and Indonesian public data relevance.

## Roadmap

- Add Google Maps Platform reverse geocoding and Routes API.
- Add Google Air Quality API.
- Add PetaBencana flood and disaster awareness.
- Add richer route-aware recommendation scoring.
- Add saved scenarios for commuter, outdoor event, and tourism use cases.
