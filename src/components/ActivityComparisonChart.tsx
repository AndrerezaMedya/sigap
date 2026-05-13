"use client";

import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Bike,
  Car,
  PersonStanding,
  TentTree,
  Users,
} from "lucide-react";
import type { ActivityComparisonItem, ActivityType } from "@/lib/types";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * ActivityComparisonChart — pure comparison view, NOT a picker.
 *
 * Earlier iterations let users click rows to switch the active activity,
 * but that mutated state without re-submitting, creating a disconnect
 * between click and result. The activity picker upstream is the canonical
 * input; this section is purely "how does my pick compare against the
 * other activities at the same time?". Read-only, scannable, dense.
 */

const ACTIVITY_ICONS: Record<ActivityType, React.ElementType> = {
  walking: PersonStanding,
  motorcycle: Bike,
  commute: Car,
  jogging: Activity,
  outdoor_event: TentTree,
  family_trip: Users,
  cycling: Bike,
};

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  walking: "Jalan Kaki",
  motorcycle: "Naik Motor",
  commute: "Mobil",
  jogging: "Jogging",
  outdoor_event: "Event Outdoor",
  family_trip: "Family Trip",
  cycling: "Sepeda",
};

const ACTIVITY_ORDER: ActivityType[] = [
  "walking",
  "motorcycle",
  "commute",
  "jogging",
  "outdoor_event",
  "cycling",
  "family_trip",
];

type Tier = "optimal" | "nyaman" | "waspada" | "kurang";

interface ToneSpec {
  tier: Tier;
  label: string;
  /** CSS class scopes the per-tier hue to the bar fill + chip + accent strip,
   *  so each row only carries one class instead of 3 inline style colours. */
  cssClass: string;
}

function getTone(comfort: number): ToneSpec {
  if (comfort >= 80) return { tier: "optimal", label: "Optimal", cssClass: "tier-optimal" };
  if (comfort >= 60) return { tier: "nyaman", label: "Nyaman", cssClass: "tier-nyaman" };
  if (comfort >= 40) return { tier: "waspada", label: "Waspada", cssClass: "tier-waspada" };
  return { tier: "kurang", label: "Kurang ideal", cssClass: "tier-kurang" };
}

function formatSnapshotTime(plannedTime?: string): string {
  if (!plannedTime) {
    return "saat ini";
  }

  const date = new Date(plannedTime);
  if (Number.isNaN(date.getTime())) {
    return "saat ini";
  }

  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface ActivityComparisonChartProps {
  items: ActivityComparisonItem[];
  currentActivity: ActivityType;
  plannedTime?: string;
}

export default function ActivityComparisonChart({
  items,
  currentActivity,
  plannedTime,
}: ActivityComparisonChartProps) {
  const reducedMotion = useReducedMotion();

  const itemMap = new Map(items.map((item) => [item.activity, item]));
  const normalized = ACTIVITY_ORDER.map((activity) => {
    const existing = itemMap.get(activity);
    if (!existing) {
      return {
        activity,
        comfort: 50,
        reason: "Data aktivitas terbatas untuk kondisi ini.",
      };
    }

    return {
      activity,
      comfort: Math.max(0, Math.min(100, existing.comfort)),
      reason:
        existing.reason.trim() !== ""
          ? existing.reason
          : "Data aktivitas terbatas untuk kondisi ini.",
    };
  });

  const sortedItems = normalized.sort((a, b) => b.comfort - a.comfort);
  const best = sortedItems[0];
  const caution = sortedItems[sortedItems.length - 1];
  const snapshotTime = formatSnapshotTime(plannedTime);

  return (
    <div className="card" style={{ gridColumn: "1 / -1" }}>
      <h3 className="card-title">
        <BarChart3 />
        Safe Window Komparasi Aktivitas
      </h3>
      <p className="safe-window-intro">
        Snapshot pukul {snapshotTime}
      </p>

      <ol className="safe-window-list" aria-label="Peringkat aktivitas berdasarkan skor kenyamanan">
        {sortedItems.map((item, index) => {
          const Icon = ACTIVITY_ICONS[item.activity];
          const isCurrent = currentActivity === item.activity;
          const tone = getTone(item.comfort);

          return (
            <li
              key={item.activity}
              className={`safe-window-row ${tone.cssClass} ${isCurrent ? "is-current" : ""}`}
            >
              <Icon
                size={20}
                strokeWidth={1.8}
                className="safe-window-row-icon"
                aria-hidden
              />

              <div className="safe-window-row-body">
                <div className="safe-window-row-head">
                  <span className="safe-window-row-name">
                    {ACTIVITY_LABELS[item.activity]}
                  </span>
                  {isCurrent && (
                    <span className="safe-window-current-tag">saat ini</span>
                  )}
                </div>
                <p className="safe-window-row-reason">{item.reason}</p>
                <div className="safe-window-row-track">
                  <motion.div
                    initial={reducedMotion ? false : { width: 0 }}
                    animate={{ width: `${item.comfort}%` }}
                    transition={{
                      duration: 0.65,
                      ease: [0.16, 1, 0.3, 1],
                      delay: reducedMotion ? 0 : 0.05 * index,
                    }}
                    className="safe-window-row-fill"
                  />
                </div>
              </div>

              <div className="safe-window-row-score" aria-label={`Skor ${item.comfort} dari 100, ${tone.label}`}>
                <span className="safe-window-row-score-num">{item.comfort}</span>
                <span className="safe-window-row-score-unit">%</span>
              </div>
            </li>
          );
        })}
      </ol>

      <p className="safe-window-footer">
        Aktivitas terbaik <strong>{ACTIVITY_LABELS[best.activity]} {best.comfort}%</strong>
        <span className="safe-window-footer-sep" aria-hidden> &middot; </span>
        Perlu perhatian <strong>{ACTIVITY_LABELS[caution.activity]} {caution.comfort}%</strong>
      </p>
    </div>
  );
}
