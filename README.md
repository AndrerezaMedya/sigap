# SIGAP

**Smart Intelligent Guide for Activity Planning** — an AI-powered city decision engine for #JuaraVibeCoding.

SIGAP helps urban residents decide whether an activity is safe, when to depart, and what environmental risks matter — synthesising weather, air quality, traffic, flood, and route data into a single clear recommendation powered by Gemini.

🔗 **Live demo**: https://sigap-web-o4ofqm2urq-et.a.run.app/

---

## Why It Matters

### Problem

People need to open multiple apps — weather, maps, air quality, flood alerts — just to answer a simple daily question: _"Should I leave now or wait?"_

### Solution

SIGAP fuses all environmental signals and answers in one place:

- **Status** — safe / comfortable / caution / less recommended / high risk
- **Action** — depart now / delay / prepare an alternative / avoid
- **Reasoning** — concise explanation grounded in real-time data
- **Timeline** — time-based guidance for the next decision window
- **Trip Analysis** — route risk, estimated duration, and traffic-aware advice for a planned journey

### Uniqueness

SIGAP is not a weather dashboard or a generic chatbot. It uses Gemini as a **contextual environmental reasoning engine**, with a decision-first UI designed around urban activity planning.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 + TypeScript |
| AI | Gemini 2.5 Flash (Google AI Studio) |
| Maps | Google Maps Platform — Maps JS, Places, Routes API |
| Environmental | Google Air Quality API, BMKG public weather API |
| Flood | PetaBencana public reports API |
| Weather (backup) | Visual Crossing Weather API |
| Deployment | Docker → Google Cloud Run (asia-southeast2) |

---

## Local Setup

```bash
npm install
cp .env.example .env.local
# Fill in the required keys (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

```bash
# Required
GEMINI_API_KEY=your_google_ai_studio_api_key
GCP_API_KEY=your_google_cloud_server_key          # Air Quality, Routes API (server-side)
NEXT_PUBLIC_MAPS_API_KEY=your_maps_js_key         # Maps JS + Places (client-side)

# Optional
GEMINI_MODEL=gemini-2.5-flash                     # defaults to gemini-2.5-flash
VC_API_KEY=your_visualcrossing_key                # fallback weather source
```

If a key or external provider is unavailable, SIGAP uses structured fallback data so the demo remains usable.

---

## Cloud Run Deployment

Build and push via Cloud Build:

```bash
gcloud builds submit --config cloudbuild.yaml
```

Or manually:

```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/sigap
gcloud run deploy sigap \
  --image gcr.io/PROJECT_ID/sigap \
  --platform managed \
  --region asia-southeast2 \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest,GCP_API_KEY=GCP_API_KEY:latest
```

---

## Demo Flow

1. Open the live URL — allow browser location access for GPS auto-fill.
2. **Tab "Tanya SIGAP"** — type a free-form question (e.g., _"Aman gak keluar sekarang?"_) and get an instant AI recommendation based on your current location.
3. **Tab "Rencanakan Perjalanan"** — set origin, destination, transport mode, and planned time, then get a route-aware risk assessment.
4. Explore the **Smart Decision Panel**: decision badge → action guidance → reasoning → timeline.
5. Open **Ground Truth** (bottom-right) to inspect the raw data sources: BMKG, Air Quality, PetaBencana, Visual Crossing.
6. Scroll down to see the **Route Map**, **Activity Comparison Chart**, and **Smart Timeline**.

---

## #JuaraVibeCoding Compliance

- ✅ **Gemini API** — core reasoning engine (AI Studio key)
- ✅ **Google Cloud Run** — production deployment target
- ✅ **Google Maps Platform** — Maps JS, Places Autocomplete, Routes API
- ✅ **Google Air Quality API** — real-time AQI and PM2.5
- ✅ **Indonesian public data relevance** — BMKG weather, PetaBencana flood reports
