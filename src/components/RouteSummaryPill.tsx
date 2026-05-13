"use client";

import { motion } from "framer-motion";
import { Clock, TrendingUp, WifiOff } from "lucide-react";
import type { EnvironmentalContext, TrafficCongestionLevel } from "@/lib/types";
import { useCountUp } from "@/lib/hooks/useCountUp";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * RouteSummaryPill — top-left overlay on the map.
 *
 * Surfaces Google Routes data *in spatial context* (on top of the polyline that
 * proves it), instead of in a separate Ground Truth card. Mirrors the convention
 * used by Apple Maps / Google Maps native: travel-time number is the lede, traffic
 * delay is supporting, congestion% is the colour-coded confidence band.
 *
 * Empty/fallback states are handled inline so the map never has a missing pill —
 * either it shows the answer, or it explains why the answer is unavailable.
 */

type TrafficShape = EnvironmentalContext["traffic"];

interface RouteSummaryPillProps {
  trafficData?: TrafficShape;
  hasDestination: boolean;
}

const CONGESTION_TINT: Record<TrafficCongestionLevel, string> = {
  low: "#22C55E",
  moderate: "#F97316",
  high: "#EF4444",
  unknown: "#94A3B8",
};

const CONGESTION_LABEL: Record<TrafficCongestionLevel, string> = {
  low: "Lancar",
  moderate: "Padat",
  high: "Macet",
  unknown: "Tidak diketahui",
};

export default function RouteSummaryPill({ trafficData, hasDestination }: RouteSummaryPillProps) {
  const reducedMotion = useReducedMotion();

  // Hooks must run unconditionally — feed safe defaults when data is missing.
  const travelTimeTarget = trafficData?.travelTimeMin ?? 0;
  const animatedTravelTime = useCountUp(travelTimeTarget, { instant: reducedMotion });

  // No destination → render nothing. The map is centered on the user's location
  // and the legend already explains the spatial-engine state.
  if (!hasDestination) return null;

  const isFallback = trafficData?.source === "Fallback" || !trafficData;
  const hasIntervals = !!trafficData?.speedReadingIntervals?.length;
  const congestionLevel: TrafficCongestionLevel = trafficData?.congestionLevel ?? "unknown";
  const congestionPercent = trafficData?.congestionPercent;
  const tint = CONGESTION_TINT[congestionLevel];

  // ── Empty state: API fallback / no real-time data ─────────────────────────
  if (isFallback) {
    return (
      <PillShell tint="#94A3B8">
        <div className="route-pill-empty">
          <WifiOff size={14} strokeWidth={2.4} />
          <div>
            <div className="route-pill-empty-title">Data lalu lintas tidak tersedia</div>
            <div className="route-pill-empty-sub">Estimasi berdasarkan jarak rute</div>
          </div>
        </div>
      </PillShell>
    );
  }

  return (
    <PillShell tint={tint}>
      {/* Tier 1 — Travel time, the answer */}
      <div className="route-pill-row-1">
        <Clock size={14} strokeWidth={2.4} className="route-pill-icon" />
        <span className="route-pill-time">
          <strong>{Math.round(animatedTravelTime)}</strong>
          <span className="route-pill-time-unit">menit</span>
        </span>
      </div>

      {/* Tier 2 — Traffic delay, supporting */}
      {trafficData.trafficDelayMin !== null && trafficData.trafficDelayMin !== undefined && (
        <div className="route-pill-row-2">
          {trafficData.trafficDelayMin > 0 ? (
            <>
              <TrendingUp size={11} strokeWidth={2.4} style={{ color: tint }} />
              <span>
                +{Math.round(trafficData.trafficDelayMin)} mnt karena lalu lintas
              </span>
            </>
          ) : (
            <span style={{ color: "var(--safe)" }}>Sesuai estimasi normal</span>
          )}
        </div>
      )}

      {/* Tier 3 — Congestion confidence band (only when intervals exist) */}
      {hasIntervals && congestionPercent !== null && congestionPercent !== undefined && (
        <div className="route-pill-row-3" aria-label={`${congestionPercent}% rute padat, level ${CONGESTION_LABEL[congestionLevel]}`}>
          <div className="route-pill-bar-track">
            <motion.div
              className="route-pill-bar-fill"
              initial={reducedMotion ? false : { width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(0, congestionPercent))}%` }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              style={{ background: tint }}
            />
          </div>
          <span className="route-pill-bar-caption">
            {congestionPercent}% rute {CONGESTION_LABEL[congestionLevel].toLowerCase()}
          </span>
        </div>
      )}
    </PillShell>
  );
}

/* ── Shared shell ─────────────────────────────────────────────────────────── */
function PillShell({ children, tint }: { children: React.ReactNode; tint: string }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      className="route-summary-pill"
      role="status"
      aria-live="polite"
      initial={reducedMotion ? false : { opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1], delay: reducedMotion ? 0 : 0.5 }}
      style={{ borderLeftColor: tint }}
    >
      {children}
    </motion.div>
  );
}
