"use client";

import { useEffect, useState, useMemo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";
import type { RiskLevel } from "@/lib/types";

/**
 * Per-risk-level particle palettes.
 * Kept neutral-leaning: only one tinted hue blended with light slate so the
 * effect reads as ambient context, not as decorative noise.
 */
const RISK_PALETTES: Record<RiskLevel | "default", string[]> = {
  default: ["#CBD5E1", "#94A3B8", "#E2E8F0"],
  safe: ["#A7F3D0", "#CBD5E1", "#E2E8F0"],
  comfortable: ["#A7F3D0", "#CBD5E1", "#E2E8F0"],
  moderate: ["#FED7AA", "#CBD5E1", "#E2E8F0"],
  less_recommended: ["#FED7AA", "#CBD5E1", "#E2E8F0"],
  high_risk: ["#FECACA", "#CBD5E1", "#E2E8F0"],
};

// ── Base options factory ──
// Memoized via useMemo at call site; we build a fresh options object only when
// the risk palette changes (rare). tsparticles will re-init only on those
// transitions, which is intentional — the colour shift telegraphs the new state.
function buildParticleOptions(palette: string[]): ISourceOptions {
  return {
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "slow",
        },
        onClick: {
          enable: false,
        },
      },
      modes: {
        slow: {
          factor: 2,
          radius: 120,
        },
      },
    },
    particles: {
      color: {
        value: palette,
      },
      links: {
        enable: false,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "out",
        },
        random: true,
        speed: 0.3,
        straight: false,
      },
      number: {
        density: {
          enable: true,
        },
        value: 30,
      },
      opacity: {
        value: { min: 0.08, max: 0.25 },
        animation: {
          enable: true,
          speed: 0.4,
          sync: false,
        },
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 0.5, max: 2 },
      },
    },
    detectRetina: true,
  };
}

interface ParticlesBackgroundProps {
  /** When provided, particle palette tints toward the matching risk level. */
  riskLevel?: RiskLevel;
}

export default function ParticlesBackground({ riskLevel }: ParticlesBackgroundProps) {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  // Re-build options only when the palette key changes — tsparticles will
  // smoothly re-init on transitions, which is the intended visual cue.
  const paletteKey = riskLevel ?? "default";
  const options = useMemo(
    () => buildParticleOptions(RISK_PALETTES[paletteKey]),
    [paletteKey],
  );

  if (!init) return null;

  return (
    <Particles
      id="tsparticles"
      options={options}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        // Always behind everything — lower than any card/modal/header
        zIndex: -10,
      }}
    />
  );
}