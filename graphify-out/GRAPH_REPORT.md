# Graph Report - JuaraVibeCoding  (2026-05-14)

## Corpus Check
- 48 files · ~41,873 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 658 nodes · 822 edges · 45 communities (38 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7c532a74`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]

## God Nodes (most connected - your core abstractions)
1. `SIGAP Design Improvements` - 18 edges
2. `SIGAP Design Improvements — V2` - 15 edges
3. `Humanizer: Remove AI Writing Patterns` - 13 edges
4. `EnvironmentalContext` - 12 edges
5. `useReducedMotion()` - 12 edges
6. `buildEnvironmentalContext()` - 11 edges
7. `generateGeminiRecommendation()` - 9 edges
8. `TransportMode` - 8 edges
9. `Component Enhancements` - 8 edges
10. `🎯 WoW Factor Implementation Summary` - 8 edges

## Surprising Connections (you probably didn't know these)
- `runTests()` --calls--> `generateGeminiRecommendation()`  [EXTRACTED]
  test-api.ts → src/lib/gemini.ts
- `runTests()` --calls--> `getBmkgWeather()`  [EXTRACTED]
  test-api.ts → src/lib/bmkg.ts
- `runTests()` --calls--> `getFloodAlerts()`  [EXTRACTED]
  test-api.ts → src/lib/flood.ts
- `runTests()` --calls--> `getMicroclimate()`  [EXTRACTED]
  test-api.ts → src/lib/visualcrossing.ts
- `runTests()` --calls--> `buildEnvironmentalContext()`  [EXTRACTED]
  test-api.ts → src/lib/context.ts

## Communities (45 total, 7 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (47): runTests(), AqiContext, createFallbackAqi(), getAirQuality(), GoogleAqiResponse, BmkgForecastItem, BmkgResponse, buildLocationLabel() (+39 more)

### Community 1 - "Community 1"
Cohesion: 0.04
Nodes (47): 10. Rule of Three Overuse, 11. Elegant Variation (Synonym Cycling), 12. False Ranges, 13. Passive Voice and Subjectless Fragments, 14. Em Dash Overuse, 15. Overuse of Boldface, 16. Inline-Header Vertical Lists, 17. Title Case in Headings (+39 more)

### Community 2 - "Community 2"
Cohesion: 0.04
Nodes (45): Accessibility, Animation System, Apple Weather Inspiration, Before vs After, code:css (--radius-sm: 8px (was 6px)), code:tsx (const mouseX = useMotionValue(0);), code:css (/* Before */), code:css (.headline {) (+37 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (35): 1. AI Activity Recommendation Engine, 2. Environmental Intelligence Integration, 3. Hyperlocal Decision Support, 4. Smart Departure Time Recommendation, 5. Public Safety & Risk Awareness, A Contextual Environmental Reasoning Engine, Absence of Contextual Reasoning, AI & Intelligence (+27 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (34): 1. AI Thinking Loader — Replaces the Generic Spinner, 2. Streaming Headline + Recommendation, 3. Reasoning Cascade, 4. Count-Up for Confidence Percentage, 5. Aurora Orb in the Hero, 6. Reactive Particles + Breathing Freshness Pulse, Accessibility Additions, Closing Principle (+26 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (32): Alur Utama: Activity Decision Flow, Apa itu SIGAP?, Apa yang terjadi pada data pengguna?, BMKG Weather, Cara Kerja SIGAP, Cara membaca keputusan SIGAP, code:block1 (riskLevel, headline, recommendation, reasoning, confidence, ), code:block2 (POST /api/recommendation) (+24 more)

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (30): A Real-Time Urban Decision Intelligence Layer, AI Architecture, AI-Centered Multi-Context Urban Reasoning, AI Optimization Strategy, An Environmental Decision Intelligence Engine, An Intelligent Environmental Decision Layer for Modern Cities., BMKG Cache Logic, Cache & Optimization Strategy (+22 more)

### Community 7 - "Community 7"
Cohesion: 0.07
Nodes (28): A Smart Decision Panel, Activity-Centered Interaction, AI Interaction Philosophy, AI-Powered Urban Decision Guidance., An Ambient Urban Decision Intelligence Experience, An intelligent environmental layer that quietly helps humans navigate urban life more safely, comfortably, and intelligently., Core UX Differentiator, Design Philosophy (+20 more)

### Community 8 - "Community 8"
Cohesion: 0.07
Nodes (27): Animation Details, Browser Compatibility, Code Changes, Code Changes, code:block1 (User opens SIGAP), code:block2 (Before result: Comfortable baseline (light green)), code:typescript (1. Component mounts → initializeApp()), code:typescript (<motion.div) (+19 more)

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (17): DEFAULT_AURORA, getNowForInput(), RISK_COLORS, RISK_STYLE, PersonaModalProps, QUICK_PROMPTS, SigapInputPanelProps, TRANSPORT_ICONS (+9 more)

### Community 10 - "Community 10"
Cohesion: 0.1
Nodes (14): buildAttribution(), formatGranularArea(), formatTimestampWib(), FreshnessState, GroundTruthCard, GroundTruthSheetProps, computeFreshness(), formatWibTime() (+6 more)

### Community 11 - "Community 11"
Cohesion: 0.13
Nodes (20): createFallbackRecommendation(), ACTIVITY_TYPES, buildPrompt(), extractJson(), GeminiResponse, generateGeminiRecommendation(), isRiskLevel(), normalizeRecommendation() (+12 more)

### Community 12 - "Community 12"
Cohesion: 0.09
Nodes (21): Additional Forbidden Patterns, Anti-Patterns (Do NOT Use), Buttons, Cards, code:css (@import url('https://fonts.googleapis.com/css2?family=DM+San), code:css (/* Primary Button */), code:css (.card {), code:css (.input {) (+13 more)

### Community 13 - "Community 13"
Cohesion: 0.1
Nodes (19): Akses API, Akses API/CAP, Base URL, BMKG, Creating a weather API request, Data Peringatan Dini Cuaca Terbuka BMKG, Data Prakiraan Cuaca Terbuka BMKG, Endpoints (+11 more)

### Community 14 - "Community 14"
Cohesion: 0.18
Nodes (13): Home(), AIThinkingLoader(), Step, STEPS, CONGESTION_LABEL, CONGESTION_TINT, PillShell(), RouteSummaryPill() (+5 more)

### Community 15 - "Community 15"
Cohesion: 0.13
Nodes (14): Cloud Run Deployment, code:bash (npm install), code:bash (GEMINI_API_KEY=your_google_ai_studio_api_key), code:bash (gcloud builds submit --tag gcr.io/PROJECT_ID/sigap), Demo Flow, Environment Variables, Local Setup, Problem (+6 more)

### Community 16 - "Community 16"
Cohesion: 0.14
Nodes (6): DOC_CONTENT, DOC_SECTIONS, DocChild, DocContent, DocModalProps, DocSection

### Community 17 - "Community 17"
Cohesion: 0.14
Nodes (14): Buttons, Cards, Chat Box, code:css (--gradient-safe: linear-gradient(135deg, rgba(5, 150, 105, 0), code:css (--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.04), 0 0 0 1px rgba), code:css (--ease-premium: cubic-bezier(0.16, 1, 0.3, 1)), code:css (--bg-glass: rgba(255, 255, 255, 0.72)), Component Enhancements (+6 more)

### Community 18 - "Community 18"
Cohesion: 0.21
Nodes (9): DateTimePicker(), DateTimePickerProps, formatTrigger(), ID_DAY_HEADERS, ID_DAY_NAMES_SHORT, ID_MONTHS, ID_MONTHS_SHORT, pad() (+1 more)

### Community 19 - "Community 19"
Cohesion: 0.2
Nodes (9): ACTIVITY_ICONS, ACTIVITY_LABELS, ACTIVITY_ORDER, ActivityComparisonChart(), ActivityComparisonChartProps, formatSnapshotTime(), Tier, ToneSpec (+1 more)

### Community 20 - "Community 20"
Cohesion: 0.22
Nodes (8): 1. Kondisi API Saat Ini, 2. Rencana Remediasi (Perbaikan Pasca-Kompetisi), A. Hardcoded API Key di Dockerfile, B. Injeksi "Fake Referer" di Backend, 🛡️ Dokumen Audit Keamanan API (SIGAP), Tahap 1: Rotasi Kunci (Key Rotation), Tahap 2: Pemisahan Kunci API (Split Keys), Tahap 3: Implementasi Secret Manager

### Community 21 - "Community 21"
Cohesion: 0.22
Nodes (8): **1. Konteks Program: #JuaraVibeCoding**, **2. Mandatory Technical Constraints (Syarat Wajib)**, **3. Kriteria Penilaian (Judging Rubric)**, **4. Syarat Submisi Final**, **A. Jantung Kecerdasan: Model Gemini**, **B. Infrastruktur: Google Cloud Run**, **C. Ekosistem Pendukung: Google Cloud Platform (GCP)**, **PROJECT BRIEF: #JuaraVibeCoding Compliance & Context**

### Community 22 - "Community 22"
Cohesion: 0.29
Nodes (6): **1. Konten** `activeTab === "intro"` **(Pengantar Platform)**, **2. Konten** `activeTab === "general"` **(Mekanika Sistem & Arsitektur)**, **[MODIFY]** `src/components/DocModal.tsx`, **Proposed Changes**, **Rencana Implementasi: Melengkapi Dokumentasi SIGAP di** `DocModal.tsx`, **User Review Required**

### Community 23 - "Community 23"
Cohesion: 0.29
Nodes (7): BMKG API, Google Air Quality API, Google Maps Platform, PetaBencana API, Primary Environmental Sources, Traffic & Routing Data, VisualCrossing API

### Community 24 - "Community 24"
Cohesion: 0.33
Nodes (3): ParticlesBackgroundProps, RISK_PALETTES, RiskLevel

### Community 26 - "Community 26"
Cohesion: 0.33
Nodes (6): 1. Multi-Factor Reasoning, 2. Human-Centered Interpretation, 3. Activity-Aware Reasoning, 4. Temporal Optimization, 5. Environmental Narrative Generation, Gemini Responsibilities

### Community 27 - "Community 27"
Cohesion: 0.33
Nodes (6): AI Layer, Cache Layer, Cloud Platform, Compute Layer, Core Infrastructure Stack, Frontend Delivery & Submission Runtime

### Community 28 - "Community 28"
Cohesion: 0.33
Nodes (6): AI Recommendation, Confidence or Risk Indicator, Environmental Status Summary, Location Context, Reasoning Summary, Smart Decision Panel

### Community 29 - "Community 29"
Cohesion: 0.5
Nodes (4): PlaceAutocomplete(), PlaceAutocompleteProps, Suggestion, useDebounce()

### Community 30 - "Community 30"
Cohesion: 0.4
Nodes (5): 1. Decision-First Architecture, 2. AI-Centric Reasoning, 3. Multi-Source Intelligence Fusion, 4. Lightweight MVP Scalability, Core Technical Philosophy

### Community 31 - "Community 31"
Cohesion: 0.4
Nodes (5): 1. Understood, 2. Guided, 3. Informed Without Overload, 4. Calm & Confident, User Experience Goals

### Community 33 - "Community 33"
Cohesion: 0.5
Nodes (4): API Key Security, Fallback Logic, Rate Limiting, Security & Reliability Considerations

### Community 34 - "Community 34"
Cohesion: 0.5
Nodes (4): GCP Value Alignment, #JuaraVibeCoding Technical Compliance, Required AI Layer, Required Deployment Layer

### Community 35 - "Community 35"
Cohesion: 0.5
Nodes (4): Additional Intelligence Layers, Future Scalability, Personalized Environmental Profiles, Predictive Modeling

### Community 36 - "Community 36"
Cohesion: 0.5
Nodes (4): Information Hierarchy, Level 1 — Decision, Level 2 — Contextual Reasoning, Level 3 — Detailed Information

### Community 38 - "Community 38"
Cohesion: 0.67
Nodes (3): AI-Powered City Decision Engine, SIGAP Technical Architecture Document, Smart Intelligent Guide for Activity Planning

### Community 39 - "Community 39"
Cohesion: 0.67
Nodes (3): AI-Powered City Decision Engine, SIGAP UI/UX Design System & Experience Direction, Smart Intelligent Guide for Activity Planning

## Knowledge Gaps
- **382 isolated node(s):** `eslintConfig`, `nextConfig`, `metadata`, `viewport`, `RISK_COLORS` (+377 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SIGAP Design Improvements` connect `Community 2` to `Community 17`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Why does `EnvironmentalContext` connect `Community 0` to `Community 10`, `Community 11`, `Community 14`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Why does `LRUCache` connect `Community 25` to `Community 0`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `metadata` to the rest of the system?**
  _382 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._