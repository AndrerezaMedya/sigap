# SIGAP Technical Architecture Document
## Smart Intelligent Guide for Activity Planning
### AI-Powered City Decision Engine

---

# Document Purpose

This document describes the full technical architecture, system design philosophy, AI orchestration strategy, data pipeline, infrastructure approach, and operational intelligence flow of SIGAP.

The document is intended to serve as:
- the primary engineering blueprint,
- the AI agent technical context,
- the architectural reference for development,
- and the system-level understanding of how SIGAP operates.

---

# #JuaraVibeCoding Technical Compliance

This architecture is constrained by the #JuaraVibeCoding submission requirements.

## Required AI Layer
- Gemini API / Google AI Studio is the required AI backbone.
- Gemini is responsible for the primary contextual reasoning and recommendation generation.
- Other AI providers must not replace Gemini as the main intelligence layer for the submitted product.

## Required Deployment Layer
- Google Cloud Run is the required live runtime for the final submitted application.
- The application is designed as a containerized web service so it can expose a public Cloud Run URL.
- Firebase Hosting, Vercel, Netlify, or similar platforms may only be treated as development previews or optional auxiliary surfaces. They must not be the only live endpoint for the competition submission.

## GCP Value Alignment
- Google Maps Platform, Routes API, Air Quality API, and related GCP services are prioritized because they strengthen the Solution scoring pillar.
- API keys and secrets must be handled server-side where appropriate, especially for Gemini, Routes, AQI, and other paid or sensitive APIs.

---

# System Overview

SIGAP is an AI-powered urban environmental decision platform designed to transform fragmented environmental and mobility data into contextual, human-centered recommendations.

Rather than acting as a traditional weather dashboard,
SIGAP functions as:

# A Real-Time Urban Decision Intelligence Layer

The platform combines:
- environmental data,
- geospatial intelligence,
- mobility analysis,
- public hazard signals,
- and AI reasoning

into a unified contextual recommendation system.

The primary objective is to help users decide:
- whether an activity is safe,
- when the best timing is,
- what risks exist,
- and what environmental factors should be considered.

---

# Core Technical Philosophy

SIGAP follows four primary engineering principles:

## 1. Decision-First Architecture
The system prioritizes:
- actionable recommendations,
- contextual interpretation,
- and human-centered reasoning.

Raw data visualization is secondary.

---

## 2. AI-Centric Reasoning
Gemini acts as the primary intelligence engine.

The system is designed around:
- AI contextual synthesis,
- environmental interpretation,
- multi-factor reasoning,
- and recommendation generation.

The AI layer is not an auxiliary chatbot.
It is the core system brain.

---

## 3. Multi-Source Intelligence Fusion
SIGAP integrates multiple environmental and mobility datasets into a unified reasoning pipeline.

The system focuses on:
- contextual fusion,
- temporal interpretation,
- and cross-source environmental understanding.

---

## 4. Lightweight MVP Scalability
Although designed as an MVP,
the architecture follows modular service principles to allow:
- future expansion,
- additional intelligence layers,
- and scalable infrastructure evolution.

---

# High-Level System Architecture

The system consists of the following layers:

1. Client Experience Layer
2. API Gateway Layer
3. Context Aggregation Layer
4. Environmental Intelligence Layer
5. AI Reasoning Layer (Gemini)
6. Recommendation Engine
7. Cache & Optimization Layer
8. Infrastructure & Deployment Layer

---

# Core Architecture Diagram (Conceptual)

User Input
(Location / Activity / Intent)
        ↓
Context Aggregator
        ↓
Environmental Data Fetching
(BMKG / AQI / Traffic / Flood / Weather)
        ↓
Spatial Intelligence Processing
(Routing / Geocoding / Area Context)
        ↓
Structured Environmental Context Object
        ↓
Gemini Reasoning Engine
        ↓
Decision Recommendation Generation
        ↓
Frontend Delivery Layer

---

# AI Architecture

# Gemini as the System Brain

Gemini is the primary intelligence and reasoning layer of SIGAP.

Gemini is responsible for:
- contextual synthesis,
- environmental interpretation,
- activity-aware reasoning,
- recommendation generation,
- temporal optimization,
- and natural-language decision support.

Gemini is NOT used merely for:
- chat responses,
- generic summarization,
- or conversational gimmicks.

Gemini functions as:

# An Environmental Decision Intelligence Engine

---

# Gemini Responsibilities

## 1. Multi-Factor Reasoning
Gemini combines:
- weather conditions,
- AQI,
- traffic,
- flood warnings,
- route conditions,
- and activity context.

Example:

Weather alone may indicate:
- “safe”.

But:
- high AQI,
- severe congestion,
- and flood risk

may alter the recommendation.

Gemini performs this synthesis.

---

## 2. Human-Centered Interpretation
Gemini converts:
- technical environmental data
into:
- understandable recommendations.

Example:

Instead of:
> “Humidity: 89%”

Gemini may generate:
> “Outdoor conditions may feel uncomfortable for prolonged activity.”

---

## 3. Activity-Aware Reasoning
Recommendations differ depending on:
- commuting,
- jogging,
- outdoor events,
- motorcycle travel,
- or walking.

Gemini dynamically adapts recommendations based on:
- user intent,
- mobility mode,
- environmental context,
- and risk combination.

---

## 4. Temporal Optimization
Gemini can analyze:
- weather transitions,
- congestion patterns,
- and risk escalation

to suggest:
- optimal departure windows,
- safer timing,
- and better activity periods.

---

## 5. Environmental Narrative Generation
Gemini provides:
- concise summaries,
- contextual insights,
- and human-readable environmental intelligence.

---

# Environmental Data Sources

SIGAP integrates multiple external data sources.

The system architecture is designed to remain modular and provider-independent.

---

# Primary Environmental Sources

## BMKG API
Role:
- authoritative local weather source for Indonesia.

Used for:
- hyperlocal forecasts,
- weather warnings,
- and official meteorological information.

Reason for selection:
- localized Indonesian relevance,
- administrative region precision,
- and trusted public authority.

---

## VisualCrossing API
Role:
- temporal interpolation and higher-frequency weather continuity.

Used for:
- hourly gap-filling,
- smoother environmental transitions,
- and temporal recommendation refinement.

Example:
> “Recommended departure at 07:15 instead of 07:00.”

---

## Google Maps Platform
Role:
- geospatial intelligence backbone.

Services used may include:
- Reverse Geocoding API,
- Routes API,
- Distance Matrix functionality,
- and location intelligence.

Primary functions:
- location contextualization,
- route analysis,
- travel estimation,
- and spatial awareness.

---

## Google Air Quality API
Role:
- real-time air quality intelligence.

Used for:
- AQI contextual interpretation,
- environmental comfort assessment,
- and public health awareness.

---

## PetaBencana API
Role:
- flood and disaster awareness.

Used for:
- flood risk contextualization,
- public hazard awareness,
- and urban resilience intelligence.

---

## Traffic & Routing Data
Role:
- mobility realism layer.

The system considers:
- congestion,
- travel delays,
- and route efficiency.

This ensures recommendations remain:
- realistic,
- actionable,
- and contextually valid.

---

# Context Aggregation Layer

The Context Aggregation Layer acts as:

# The Environmental Intelligence Collector

Responsibilities include:
- collecting user context,
- orchestrating API calls,
- normalizing data structures,
- and building a unified context object.

---

# User Context Inputs

Possible inputs include:
- GPS location,
- place name,
- destination,
- activity type,
- transportation mode,
- and preferred timing.

---

# Reverse Geocoding Flow

1. User location acquired.
2. Reverse geocoding performed.
3. Administrative region identified.
4. Regional code extracted.
5. BMKG regional query executed.

This allows:
- hyperlocal weather interpretation,
- and region-specific environmental analysis.

---

# Unified Context Object

All environmental signals are transformed into a normalized structured object before being sent to Gemini.

Example structure:

- location
- timestamp
- weather summary
- rainfall probability
- AQI level
- traffic status
- flood warning
- travel estimation
- environmental risks
- route conditions
- activity intent

This creates:
- deterministic AI context,
- lower hallucination risk,
- and more controllable reasoning.

---

# Recommendation Engine

The Recommendation Engine operates as:

# The Decision Delivery Layer

It receives:
- structured environmental intelligence,
- Gemini reasoning outputs,
- and contextual scoring.

Responsibilities include:
- recommendation formatting,
- risk classification,
- timing optimization,
- and user-facing delivery.

---

# Recommendation Categories

Possible recommendation states:
- Safe
- Comfortable
- Moderately Risky
- Less Recommended
- High Risk

Recommendations are:
- probabilistic,
- contextual,
- and activity-aware.

---

# Temporal Intelligence

One of SIGAP’s core differentiators is:

# Time-Aware Recommendation Optimization

The system analyzes:
- forecast transitions,
- congestion evolution,
- and environmental timing.

This enables:
- optimal departure suggestions,
- adaptive activity timing,
- and smarter urban mobility decisions.

---

# Cache & Optimization Strategy

SIGAP follows an intelligent caching strategy.

The purpose is to:
- reduce unnecessary API calls,
- improve responsiveness,
- minimize cost,
- and align with source update frequency.

---

# BMKG Cache Logic

Because BMKG forecast updates are limited in frequency,
SIGAP caches regional weather responses.

Suggested strategy:
- in-memory cache on Cloud Run,
- 1–2 hour TTL,
- region-based cache keys.

Benefits:
- lower latency,
- API efficiency,
- reduced external dependency load.

---

# AI Optimization Strategy

Gemini requests should prioritize:
- structured compact context,
- deterministic environmental objects,
- and recommendation-focused prompts.

Avoid:
- excessively large prompts,
- raw unfiltered environmental dumps,
- and redundant information.

This improves:
- reasoning quality,
- consistency,
- speed,
- and token efficiency.

---

# Frontend Architecture

The frontend architecture follows:

# Recommendation-First Design Principles

The frontend prioritizes:
- contextual insights,
- smart recommendations,
- and human-centered interpretation.

Maps and analytics function as:
- supporting intelligence surfaces,
not primary experiences.

---

# Frontend Experience Priorities

The UI should emphasize:
- calm intelligence,
- readability,
- contextual awareness,
- and lightweight interaction.

Primary components include:
- Smart Decision Panel
- Activity Selector
- Recommendation Timeline
- Environmental Summary
- Route Intelligence View
- Risk Visualization

---

# Infrastructure Architecture

# Core Infrastructure Stack

## Cloud Platform
Primary platform:
- Google Cloud Platform (GCP)

---

## Compute Layer
Recommended:
- Google Cloud Run

Reason:
- serverless deployment,
- scalability,
- lightweight MVP operations,
- and efficient API orchestration.

---

## AI Layer
Primary reasoning engine:
- Gemini API
- Google AI Studio

Gemini acts as:
- the core contextual intelligence engine.

---

## Frontend Delivery & Submission Runtime
Primary production and competition runtime:
- Google Cloud Run

Implementation approach:
- Next.js standalone container
- public Cloud Run URL
- server-side API orchestration for Gemini and external data providers

Non-primary preview options:
- Firebase Hosting or Vercel may be used only for temporary previews or auxiliary workflows.
- They must not replace Cloud Run as the final #JuaraVibeCoding submission endpoint.

---

## Cache Layer
Possible implementations:
- in-memory cache,
- Redis,
- or lightweight server cache.

---

# Security & Reliability Considerations

Although SIGAP is an MVP,
several principles remain important:

## API Key Security
- environment variables,
- server-side secret handling,
- and restricted API exposure.

---

## Rate Limiting
Prevent:
- API abuse,
- excessive external requests,
- and infrastructure overload.

---

## Fallback Logic
Environmental data providers may fail.

The system should:
- gracefully degrade,
- fallback to alternative sources,
- and communicate uncertainty clearly.

---

# Future Scalability

The architecture is intentionally modular.

Potential future expansions include:

## Additional Intelligence Layers
- maritime intelligence,
- lightning alerts,
- urban heat analysis,
- seismic awareness,
- and environmental anomaly detection.

---

## Predictive Modeling
Future systems may include:
- predictive congestion,
- risk escalation analysis,
- and adaptive environmental forecasting.

---

## Personalized Environmental Profiles
Potential future capabilities:
- health-sensitive recommendations,
- elderly-friendly guidance,
- athlete optimization,
- and environmental preference modeling.

---

# Technical Differentiator

SIGAP’s primary technical differentiator is:

# AI-Centered Multi-Context Urban Reasoning

The platform does not merely aggregate data.

It:
- interprets,
- contextualizes,
- synthesizes,
- and transforms environmental intelligence
into:
- human decisions.

This creates a significantly different experience from:
- traditional weather applications,
- static dashboards,
- or generic AI chatbots.

---

# Final Technical Vision

SIGAP represents a new approach to urban environmental interaction.

By combining:
- AI reasoning,
- geospatial intelligence,
- environmental awareness,
- mobility analysis,
- and contextual recommendation systems,

SIGAP aims to become:

# An Intelligent Environmental Decision Layer for Modern Cities.

The long-term vision is a future where urban residents no longer manually interpret fragmented environmental signals before making daily decisions.

Instead,
AI systems like SIGAP synthesize city-scale intelligence into calm, contextual, and actionable human guidance.

