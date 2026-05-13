"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import type { EnvironmentalContext, SourceMeta } from "@/lib/types";

type FreshnessState = "fresh" | "aging" | "fallback";

// Note: "routes" was removed from this union. Google Routes data is now
// surfaced directly on the map (see RouteSummaryPill + MapLegend) so this
// sheet is exclusively for ambient environmental sources.
type GroundTruthCard = {
  id: "bmkg" | "aqi" | "petabencana" | "vc";
  title: string;
  accentClass: string;
  freshness: FreshnessState;
  attribution: string;
  metrics: Array<{
    value: string;
    label: string;
  }>;
};

interface GroundTruthSheetProps {
  isOpen: boolean;
  onClose: () => void;
  context: EnvironmentalContext | null;
}

function formatNumber(value: number | null | undefined, unit = "", digits = 0): string {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }

  return `${value.toFixed(digits)}${unit}`;
}

function formatTimestampWib(iso: string | undefined): string {
  if (!iso) {
    return "baru saja";
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "baru saja";
  }

  return `${date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  })} WIB`;
}

function formatGranularArea(areaLabel: string | undefined): string {
  if (!areaLabel) {
    return "Lokasi";
  }

  const firstChunk = areaLabel.split(",")[0]?.trim();
  if (!firstChunk) {
    return "Lokasi";
  }

  if (/^(Kel\.|Desa|Kec\.|Kecamatan|Kota|Kab\.)/i.test(firstChunk)) {
    return firstChunk;
  }

  return `Kel. ${firstChunk}`;
}

function getFreshnessState(source: string, sourceMeta: SourceMeta | undefined): FreshnessState {
  if (source === "Fallback") {
    return "fallback";
  }

  if (!sourceMeta) {
    return "fresh";
  }

  const updatedAtMs = new Date(sourceMeta.updatedAt).getTime();
  if (Number.isNaN(updatedAtMs) || sourceMeta.ttlMs <= 0) {
    return "fresh";
  }

  const ageMs = Date.now() - updatedAtMs;
  if (ageMs >= sourceMeta.ttlMs * 0.75) {
    return "aging";
  }

  return "fresh";
}

function floodStatusShort(flood: NonNullable<EnvironmentalContext["flood"]>): string {
  if (flood.source === "PetaBencana") {
    const n = flood.recentReportCount ?? 0;
    return n > 0 ? "Laporan aktif" : "Tidak ada laporan";
  }

  if (flood.recentReportCount !== null && flood.recentReportCount > 0) {
    return "Laporan aktif";
  }

  return "Fallback / demo";
}

function formatReportCount(count: number | null): string {
  if (count === null) {
    return "-";
  }

  return String(count);
}

function buildAttribution(apiName: string, sourceMeta: SourceMeta | undefined): string {
  return `${apiName} · ${formatGranularArea(sourceMeta?.areaLabel)} · diperbarui ${formatTimestampWib(
    sourceMeta?.updatedAt,
  )}`;
}

export default function GroundTruthSheet({
  isOpen,
  onClose,
  context,
}: GroundTruthSheetProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const cards = useMemo<GroundTruthCard[]>(() => {
    if (!context) {
      const emptyAttribution = "Sumber · Lokasi · diperbarui baru saja";
      return [
        {
          id: "bmkg",
          title: "BMKG Meteorologi",
          accentClass: "bmkg",
          freshness: "fallback",
          attribution: emptyAttribution,
          metrics: [
            { value: "-", label: "Suhu" },
            { value: "-", label: "Kelembapan" },
            { value: "-", label: "Curah hujan" },
          ],
        },
        {
          id: "vc",
          title: "VisualCrossing",
          accentClass: "bmkg",
          freshness: "fallback",
          attribution: emptyAttribution,
          metrics: [
            { value: "-", label: "UV Index" },
            { value: "-", label: "Resolusi" },
            { value: "-", label: "Status" },
          ],
        },
        {
          id: "aqi",
          title: "Google Air Quality",
          accentClass: "aqi",
          freshness: "fallback",
          attribution: emptyAttribution,
          metrics: [
            { value: "-", label: "AQI" },
            { value: "-", label: "PM2.5" },
            { value: "-", label: "Status" },
          ],
        },
        {
          id: "petabencana",
          title: "PetaBencana",
          accentClass: "petabencana",
          freshness: "fallback",
          attribution: emptyAttribution,
          metrics: [
            { value: "-", label: "Laporan" },
            { value: "5 km", label: "Radius" },
            { value: "-", label: "Status" },
          ],
        },
      ];
    }

    const weatherNow = context.weather.forecast[0];

    return [
      {
        id: "bmkg",
        title: "BMKG Meteorologi",
        accentClass: "bmkg",
        freshness: getFreshnessState(context.weather.source, context.weather.sourceMeta),
        attribution: buildAttribution("BMKG", context.weather.sourceMeta),
        metrics: [
          { value: formatNumber(weatherNow?.temperatureCelsius, "°C"), label: "Suhu" },
          { value: formatNumber(weatherNow?.humidityPercent, "%"), label: "Kelembapan" },
          { value: formatNumber(weatherNow?.precipitationMm, " mm", 1), label: "Curah hujan" },
        ],
      },
      {
        id: "vc",
        title: "Microclimate (VC)",
        accentClass: "bmkg",
        freshness: getFreshnessState(context.microclimate.source, context.microclimate.sourceMeta),
        attribution: buildAttribution("VisualCrossing", context.microclimate.sourceMeta),
        metrics: [
          { value: formatNumber(context.microclimate.uvIndex), label: "UV Index" },
          { value: "Per jam", label: "Resolusi" },
          { value: context.microclimate.source === "VisualCrossing" ? "Aktif" : "Fallback", label: "Status" },
        ],
      },
      {
        id: "aqi",
        title: "Google Air Quality",
        accentClass: "aqi",
        freshness: getFreshnessState(context.aqi.source, context.aqi.sourceMeta),
        attribution: buildAttribution("Google Air Quality", context.aqi.sourceMeta),
        metrics: [
          { value: formatNumber(context.aqi.aqi), label: "AQI" },
          { value: formatNumber(context.aqi.pm25, " ug/m3", 1), label: "PM2.5" },
          { value: context.aqi.level || "-", label: "Status" },
        ],
      },
      {
        id: "petabencana",
        title: "PetaBencana",
        accentClass: "petabencana",
        freshness: getFreshnessState(context.flood.source, context.flood.sourceMeta),
        attribution: buildAttribution("PetaBencana", context.flood.sourceMeta),
        metrics: [
          { value: formatReportCount(context.flood.recentReportCount), label: "Laporan" },
          { value: "5 km", label: "Radius" },
          { value: floodStatusShort(context.flood), label: "Status" },
        ],
      },
    ];
  }, [context]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="ground-truth-layer" role="dialog" aria-modal="true">
          <motion.button
            type="button"
            aria-label="Tutup Ground Truth"
            className="ground-truth-backdrop"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            className="ground-truth-sheet"
            style={{ left: "50%" }}
            initial={{ y: 120, opacity: 0, x: "-50%" }}
            animate={{ y: 0, opacity: 1, x: "-50%" }}
            exit={{ y: 140, opacity: 0, x: "-50%" }}
            transition={{ type: "spring", stiffness: 320, damping: 30, mass: 0.8 }}
          >
            <button
              type="button"
              className="ground-truth-handle"
              aria-label="Dismiss Ground Truth"
              onClick={onClose}
            >
              <span />
            </button>

            <div className="ground-truth-header">
              <h3>Ground Truth</h3>
              <p>
                Sumber lingkungan ambient yang dipertimbangkan SIGAP. Data rute
                &amp; lalu lintas tampil langsung di peta.
              </p>
            </div>

            <div className="ground-truth-grid">
              {cards.map((card) => (
                <article
                  key={card.id}
                  className={`ground-truth-card ${card.accentClass}`}
                >
                  <span className={`ground-truth-freshness ${card.freshness}`} />

                  <div className="ground-truth-card-title">{card.title}</div>
                  <div className="ground-truth-metrics">
                    {card.metrics.map((metric) => (
                      <div key={`${card.id}-${metric.label}`}>
                        <div className="ground-truth-value">{metric.value}</div>
                        <div className="ground-truth-label">{metric.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="ground-truth-attribution">{card.attribution}</div>
                </article>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
