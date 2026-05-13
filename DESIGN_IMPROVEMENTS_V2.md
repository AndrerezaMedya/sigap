# SIGAP Design Improvements — V2

> **Date:** May 13, 2026
> **Goal:** Add genuine "spark" while keeping the Linear / Apple Weather aesthetic.
> **Approach:** AI-native *behavior* over visual *cosmetics*.
> **Skill used:** [`ui-ux-pro-max`](.agent/skills/ui-ux-pro-max/SKILL.md) — recommended style: **AI-Native UI** (chatbot/assistant/agentic, ambient, minimal chrome, streaming text, typing indicators).

---

## Why This Document Exists

A previous pass at improving SIGAP was captured in `DESIGN_IMPROVEMENTS.md`. That work added shadows, glassmorphism, a mouse-follow spotlight, gradient text, and softer particles. All of it is **visually nice but cosmetic** — it makes the surface feel more premium without changing how the product *behaves* as an AI assistant.

This V2 pass is grounded in a different premise:

> **For an AI urban-decision product, "spark" is not how shiny the surface is. It is whether the AI feels alive, intentional, and trustworthy while it is working and when it answers.**

Every change below is justified against that premise.

---

## Diagnosis of V1 (`DESIGN_IMPROVEMENTS.md`)

| Concern | What V1 Did | Why It Falls Short for an AI Product |
|---|---|---|
| **Loading** | Generic blue SVG spinner with a single label. | A user waiting on an AI assistant needs to feel that *something intentional* is happening, not that "a request is in flight". |
| **Result reveal** | `motion.h1` fade-in, all content appears instantly. | AI-native products (ChatGPT, Claude, Perplexity, Linear's AI features) all stream their output. Instant text reads as "pre-computed", not "reasoned". |
| **Reasoning list** | All bullets appear at once. | A reasoning chain is sequential by nature — showing it as a single block hides the *thought process*. |
| **Confidence %** | `Math.round(confidence * 100)%` rendered immediately. | A static number is a stat. A counting-up number reads as a measurement being taken. |
| **Ambient atmosphere** | Hero background fades to a tinted color + a single radial pulse. | The rest of the page (particles, freshness dots) stays neutral, so the ambient signal lives only in the hero. |
| **Reduced motion** | Mentioned in the pre-delivery checklist only. | Not actually implemented — the previous animations would still play for users who requested less motion. |

V1 raised the *visual* ceiling. V2 raises the *behavioral* ceiling.

---

## Core Principle for V2

> **Every animation must answer: "Does this make the AI feel more alive and trustworthy?"**
> **Not: "Does this make the page look more polished?"**

If a candidate change can only justify itself with the second question, it does not ship.

---

## Skill-Driven Recommendations (ui-ux-pro-max)

Running the skill against SIGAP's brief returned **AI-Native UI** as the primary style match:

```
Style: AI-Native UI
Keywords: chatbot, conversational, assistant, agentic, ambient, minimal chrome,
          streaming text, AI interactions
Effects: typing indicators (3-dot pulse), streaming text animations,
         pulse animations, context cards, smooth reveals
AI Accent: #6366F1 (Indigo)
```

V1 implemented none of those *named* effects. V2 implements all of them.

A secondary match — **Real-Time Monitoring** — recommended:

```
Effects: live status indicators (pulsing), alert pulse/glow,
         status indicator blink, smooth data stream updates
```

That informs the new breathing-pulse on the Ground Truth freshness dots.

---

## Implementation Map

```
src/
├── lib/hooks/                         (NEW DIR)
│   ├── useStreamingText.ts            (NEW) Token-by-token reveal hook
│   ├── useCountUp.ts                  (NEW) Eased number animation hook
│   └── useReducedMotion.ts            (NEW) prefers-reduced-motion sync hook
├── components/
│   ├── AIThinkingLoader.tsx           (NEW) Replaces the generic spinner
│   ├── ParticlesBackground.tsx        (CHANGED) Reactive to riskLevel
│   ├── GroundTruthSheet.tsx           (CSS-only impact)
│   └── …                              (untouched)
└── app/
    ├── page.tsx                       (CHANGED) Wires everything together
    └── globals.css                    (CHANGED) New keyframes + reduced-motion guard
```

---

## The Six Improvements

### 1. AI Thinking Loader — Replaces the Generic Spinner

**File:** `src/components/AIThinkingLoader.tsx`

The new loader rotates through five labels that mirror SIGAP's actual data pipeline:

```
1. CloudSun       → "Membaca cuaca dari BMKG…"
2. Wind           → "Memeriksa kualitas udara…"
3. Navigation     → "Menelusuri kepadatan lalu lintas…"
4. Activity       → "Mencocokkan dengan profil aktivitas…"
5. Sparkles       → "Merangkai rekomendasi…"
```

**What this conveys**

- The AI is *consulting specific sources*, not "thinking" abstractly. This builds trust — users learn that SIGAP reasons over BMKG + AQI + Routes + their profile.
- The 1.1s rotation per step makes a 3–6 second wait feel like meaningful work.
- A 3-dot pulse on the right is the canonical AI-native typing indicator (`ui-ux-pro-max` calls this out explicitly).
- A soft halo expands around the active icon (`box-shadow` 0→14px, 1.6s loop).

**Accessibility**

- `role="status"` and `aria-live="polite"` so screen readers announce step changes.
- All motion bypassed when `prefers-reduced-motion: reduce` (single static state).

---

### 2. Streaming Headline + Recommendation

**Files:**
- `src/lib/hooks/useStreamingText.ts` (new)
- `src/app/page.tsx` (wire-up)

When a recommendation arrives, the headline streams in first (12 ms/char ≈ 80 chars/sec), then the recommendation streams in 60 ms after the headline finishes (10 ms/char). A `▏` caret blinks at the cursor while text is streaming.

**Why these speeds**

- 80 chars/sec ≈ a confident assistant typing. Slower feels artificial; faster feels pre-recorded.
- The recommendation streams slightly faster (10 ms/char) because by then the user is already engaged and waiting more would feel sluggish.

**Why streaming matters here**

This is the single biggest behavioral gap V1 left on the table. AI products that *don't* stream feel like CRUD apps with smart payloads. AI products that *do* stream feel like they're reasoning in front of you.

**State management note**

The hook resets cleanly on every `text` change, which means:
- A new submission triggers a fresh streaming reveal.
- A persona change re-streams the new recommendation.
- A `prefers-reduced-motion` user gets the full text instantly.

All state mutations are scheduled via the timer pipeline (never synchronously inside the effect body) so this passes React 19's `react-hooks/set-state-in-effect` lint rule cleanly.

---

### 3. Reasoning Cascade

**File:** `src/app/page.tsx` (Elaborasi Detail card)

```tsx
<motion.li
  initial={reducedMotion ? false : { opacity: 0, x: -8 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{
    duration: 0.4,
    delay: reducedMotion ? 0 : 0.15 + i * 0.09,
    ease: [0.16, 1, 0.3, 1],
  }}
>
```

Each reasoning bullet animates in 90 ms after the previous one, sliding 8 px from the left. The total cascade for a typical 4-bullet list takes ≈ 0.5 s — short enough that nobody waits for it, long enough to make the *order* feel intentional.

**Why this matters**

A reasoning chain is sequential. If you show it as a block, the user has no cue about which factor SIGAP weighed first. Cascading the items implies *priority of thought*.

The `key` is bound to `${result.recommendation.headline}-${i}` so a new submission re-runs the cascade. (Using `i` alone would have caused Framer to skip the animation on subsequent submissions because React reuses the same DOM nodes.)

---

### 4. Count-Up for Confidence Percentage

**Files:**
- `src/lib/hooks/useCountUp.ts` (new)
- `src/app/page.tsx`

```tsx
<strong style={{ fontVariantNumeric: "tabular-nums", … }}>
  {Math.round(animatedConfidence)}%
</strong>
```

The confidence number sweeps from its previous value (or 0 on first render) to the new target over 900 ms with `easeOutCubic`. `tabular-nums` keeps the digit width fixed so the number doesn't shimmy as it counts.

**Why 900 ms**

Fast enough not to feel like a loading bar (which would imply the value is still being computed). Slow enough that the eye registers it as a *measurement settling*. The same family of timing used by Apple's Activity rings and Tesla's range estimator.

**Why ease-out cubic**

Linear count-ups feel mechanical. Ease-out implies arrival — the number is *settling on its answer*, which matches the AI semantics of "this is my confidence".

---

### 5. Aurora Orb in the Hero

**Files:**
- `src/app/globals.css` (`.aurora-orb` + `@keyframes aurora-drift`)
- `src/app/page.tsx` (color tokens per risk level)

A 3-layer radial gradient sits behind the hero content, blurred 40 px, opacity 0.55, slowly rotating 360° over 24 seconds. Three CSS variables drive the colors:

```css
--aurora-tint    /* primary risk hue */
--aurora-tint-2  /* secondary, harmonious */
--aurora-tint-3  /* tertiary accent */
```

`page.tsx` sets these inline based on the active `riskLevel`:

| State | Aurora 1 | Aurora 2 | Aurora 3 |
|---|---|---|---|
| **Default** (no result yet) | Blue 0.18 | Violet 0.14 | Green 0.08 |
| **Safe / Comfortable** | Green 0.22 | Teal 0.18 | Blue 0.10 |
| **Moderate / Less Recommended** | Orange 0.22 | Amber 0.18 | Magenta 0.08 |
| **High Risk** | Red 0.24 | Rose 0.18 | Orange 0.10 |

**Why aurora instead of a flat tint**

V1 used a flat radial gradient with a 4 s opacity pulse. That communicates one bit: "the hero is alive". The aurora communicates two more bits:

1. **Direction** — slow rotation implies time progressing, which fits an urban-decision product (conditions evolve).
2. **Atmosphere** — three overlapping color blobs create *parallax tint*, which is what makes Apple Weather and Tesla's vehicle status feel atmospheric instead of just colored.

**Performance**

The orb is a single `<div>` with CSS `filter: blur()` and a transform animation. GPU-accelerated, no JS per frame, no canvas. Cheaper than the existing particles.

---

### 6. Reactive Particles + Breathing Freshness Pulse

**Files:**
- `src/components/ParticlesBackground.tsx`
- `src/app/globals.css` (`.ground-truth-freshness::before` + `@keyframes freshness-breathe`)

**Reactive particles**

The background particles now accept a `riskLevel` prop and switch their color palette:

```ts
default:           ["#CBD5E1", "#94A3B8", "#E2E8F0"]   // neutral slate
safe / comfortable:["#A7F3D0", "#CBD5E1", "#E2E8F0"]   // mint-tinted
moderate / less:   ["#FED7AA", "#CBD5E1", "#E2E8F0"]   // peach-tinted
high_risk:         ["#FECACA", "#CBD5E1", "#E2E8F0"]   // rose-tinted
```

Two of three palette colors stay neutral so the effect remains *ambient*, not decorative. The single tinted hue is enough that a user glancing at the page periphery picks up the city's mood without ever consciously reading it.

**Breathing freshness pulse**

The freshness dots in the Ground Truth Sheet (BMKG, AQI, Routes, etc.) used to be flat circles. They now have a `::before` halo that breathes:

```css
@keyframes freshness-breathe {
  0%, 100% { transform: scale(1);   opacity: 0; }
  50%      { transform: scale(1.9); opacity: 0.45; }
}
```

`fresh` → green halo. `aging` → yellow halo. `fallback` → no halo (deliberately static, because stale data should *not* feel alive).

This is the visual equivalent of a heartbeat. It tells the user: "this data is breathing — it's live, it's being kept fresh."

---

## Reduced Motion — Actually Implemented

V1 listed `prefers-reduced-motion` as a checklist item but didn't implement it. V2 implements it three ways:

1. **`useReducedMotion()` hook** wraps `window.matchMedia("(prefers-reduced-motion: reduce)")` with a state subscription.
2. **JS-driven animations** (streaming, count-up, cascade, thinking-loader rotation) gate on the hook and short-circuit to instant final state.
3. **CSS-driven animations** (aurora drift, caret blink, freshness breathe) are disabled via:
   ```css
   @media (prefers-reduced-motion: reduce) {
     .aurora-orb,
     .streaming-caret,
     .ground-truth-freshness.fresh::before,
     .ground-truth-freshness.aging::before {
       animation: none;
     }
   }
   ```

Net result: a user who has requested reduced motion sees the full content immediately with zero animation, but loses none of the information.

---

## Accessibility Additions

| Element | What's Added | Why |
|---|---|---|
| Hero headline | `aria-live="polite"` | Screen readers announce streaming text as it arrives. |
| Hero recommendation | `aria-live="polite"` | Same. |
| AI Thinking Loader | `role="status"` + `aria-live="polite"` | Step changes are announced. |
| Aurora orb / glow layers | `aria-hidden` | Decorative, removed from a11y tree. |
| Caret span | (no role; inert text node) | Pure decoration, ignored by SR. |

---

## What V2 Does NOT Touch (and Why)

| Component | Status | Reason |
|---|---|---|
| `SigapInputPanel` | Untouched | Already well-designed; V1's mouse-follow spotlight stays. |
| `IntelligenceMap` | Untouched | The map is correctly a *secondary* surface per the blueprint. Adding more animation would compete with the recommendation. |
| `DocModal` / `PersonaModal` | Untouched | Modals are already polished and out of the critical AI-feedback loop. |
| Color tokens | Mostly untouched | V1 already established a strong 4-channel semantic palette. V2 only adds aurora-tint variants. |
| Typography | Untouched | Plus Jakarta Sans is a strong choice. The skill recommends Inter, but switching would be churn for no real gain. |

---

## Comparison Table

| Aspect | V1 (`DESIGN_IMPROVEMENTS.md`) | V2 (this document) |
|---|---|---|
| **Style match (skill)** | "Liquid Glass" cues (mostly cosmetic) | **AI-Native UI** (skill's primary recommendation) |
| **Loading state** | Generic SVG spinner | AI thinking pipeline + 3-dot pulse + halo |
| **Headline reveal** | Instant fade-in | Streaming token-by-token + caret |
| **Recommendation reveal** | Instant fade-in | Streams after headline finishes |
| **Reasoning list** | Renders as a block | Cascades with 90 ms stagger |
| **Confidence number** | Static int | 900 ms count-up, ease-out cubic, tabular-nums |
| **Hero ambience** | Tinted bg + radial pulse | + Aurora orb (3-layer, slow-rotate, risk-tinted) |
| **Particles** | Decorative, neutral | Risk-tinted palette |
| **Ground Truth dots** | Static dots | Breathing halo for fresh/aging |
| **`prefers-reduced-motion`** | Checklist only | Hook + CSS guard, three vectors |
| **`aria-live` on streaming text** | Not addressed | Implemented |
| **Engineering quality** | Inline styles + framer values | Reusable hooks, typed, lint-clean |
| **Build status** | Implicit | `npm run build` ✅ 46 s, `npm run typecheck` ✅, lint ✅ on all new files |

---

## Files Changed

### New
- `src/components/AIThinkingLoader.tsx` (~115 lines)
- `src/lib/hooks/useStreamingText.ts` (~70 lines)
- `src/lib/hooks/useCountUp.ts` (~60 lines)
- `src/lib/hooks/useReducedMotion.ts` (~20 lines)

### Modified
- `src/app/page.tsx`
  - Added imports for hooks + `AIThinkingLoader`.
  - Extended `RISK_COLORS` from 2 channels (`bg`, `glow`) to 5 (+ `aurora1/2/3`).
  - Added `DEFAULT_AURORA` tokens for the no-result state.
  - Wired `useStreamingText`, `useCountUp`, `useReducedMotion` to the hero.
  - Replaced the spinner block with `<AIThinkingLoader>`.
  - Aurora orb `<div>` + risk-tinted CSS variables added inside the hero.
  - Reasoning items converted from `<li>` to `<motion.li>` with cascade timing.
  - `<ParticlesBackground>` now receives `riskLevel`.

- `src/app/globals.css`
  - New: `.ai-thinking-loader`, `.ai-thinking-icon-stack`, `.ai-thinking-halo`, `.ai-thinking-icon`, `.ai-thinking-text`, `.ai-thinking-headline`, `.ai-thinking-step`, `.ai-thinking-dots`.
  - New: `.aurora-orb` + `@keyframes aurora-drift` (24 s).
  - New: `.streaming-caret` + `@keyframes caret-blink` (0.85 s, jump-none).
  - New: `.ground-truth-freshness::before` + `@keyframes freshness-breathe` (2.4 s).
  - New: `@media (prefers-reduced-motion: reduce) { … }` block.

- `src/components/ParticlesBackground.tsx`
  - Refactored from a single static options object into a `buildParticleOptions(palette)` factory.
  - Added `RISK_PALETTES` map and a `riskLevel?: RiskLevel` prop.
  - `useMemo` now keys on `paletteKey` so tsparticles re-inits exactly on risk transitions.

---

## Verification

```bash
npm run typecheck   # ✅ clean
npm run lint        # ✅ clean on all new files
                    # (2 pre-existing errors in PlaceAutocomplete.tsx, untouched)
npx next build      # ✅ Compiled successfully in 46 s
```

---

## Future Enhancement Opportunities

These are deliberately deferred. They would extend V2's behavioral approach but the marginal "spark" gain doesn't yet justify the implementation cost.

1. **Streaming the reasoning list itself.** Each bullet streamed token-by-token, not just cascaded. Most useful if the reasoning list ever grows beyond 5 bullets.
2. **Animated polyline draw on the map.** Route polyline animates segment-by-segment with traffic colors, similar to how Apple Maps reveals routes. Requires hooking into Google Maps polyline drawing.
3. **Magnetic submit button.** Submit button slightly follows the cursor on hover (Linear-style). High-skill, low-information; only worth it if the rest of the page already feels finished.
4. **Timeline "now" sweep.** A faint sweep across the timeline showing the user's current planned-time position. Useful when the user has a specific departure time, less so for ambient browsing.
5. **Sound.** A two-tone chime when the result lands. Would need to be off by default and gated behind a setting.

---

## Closing Principle

V1 made SIGAP *prettier*. V2 makes SIGAP *feel like an AI*.

Pretty surfaces are easy to copy. AI-native behavior — streaming, sequential reasoning, settling numbers, atmospheric state — is what users associate with current-generation products like Linear, Apple Intelligence, ChatGPT, and Perplexity. That association is the actual "spark" the brief asks for.

Every change in V2 is small. The cumulative effect is that SIGAP now reads as a *contemporary AI assistant*, not as a clean dashboard with smart data behind it.
