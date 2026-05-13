"use client";

import {
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * DateTimePicker — drop-in replacement for the native <input type="datetime-local">.
 *
 * Why custom: the browser-native picker looks dated and breaks the AI-native UI
 * language used elsewhere in SIGAP. This component preserves the exact same
 * string contract ("YYYY-MM-DDTHH:MM" local-time) so the surrounding state and
 * API serialization need zero changes.
 *
 * Behaviour:
 *   - Trigger reads as a glass chip with the formatted date/time and a clock icon.
 *   - Popover contains preset chips (most common UX path), a month calendar, and
 *     a horizontal stepper for hour + minute.
 *   - Closes on outside-click and Escape.
 *   - Respects prefers-reduced-motion (popover skips slide/scale).
 */

interface DateTimePickerProps {
  value: string;
  onChange: (next: string) => void;
  ariaLabel?: string;
}

const ID_DAY_HEADERS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const ID_MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const ID_MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const ID_DAY_NAMES_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function parseValue(raw: string): Date {
  // raw is "YYYY-MM-DDTHH:MM" in local time — Date constructor parses this as local.
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return new Date();
  return d;
}

function toLocalString(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatTrigger(d: Date): string {
  return `${ID_DAY_NAMES_SHORT[d.getDay()]}, ${d.getDate()} ${ID_MONTHS_SHORT[d.getMonth()]} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function DateTimePicker({ value, onChange, ariaLabel }: DateTimePickerProps) {
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(() => parseValue(value), [value]);
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());

  // Sync calendar viewport when value changes externally (e.g. preset chips
  // that jump to tomorrow). Deferred via microtask so the setState happens
  // outside the effect body and stays compatible with React 19's
  // react-hooks/set-state-in-effect rule.
  useEffect(() => {
    const handle = window.setTimeout(() => {
      setViewYear(selected.getFullYear());
      setViewMonth(selected.getMonth());
    }, 0);
    return () => window.clearTimeout(handle);
  }, [selected]);

  // Outside click & Escape close handlers — only attached while open.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // ── Calendar grid (6 rows × 7 cols, always — keeps height stable across months)
  const grid = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const firstDow = first.getDay();
    const start = new Date(viewYear, viewMonth, 1 - firstDow);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [viewYear, viewMonth]);

  const today = useMemo(() => new Date(), []);

  // ── Mutators (always preserve the time-of-day when only the date changes,
  // and vice versa, so the user never accidentally loses one half).
  function pickDay(d: Date) {
    const next = new Date(d);
    next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    onChange(toLocalString(next));
  }

  function bumpHour(delta: number) {
    const next = new Date(selected);
    next.setHours(next.getHours() + delta);
    onChange(toLocalString(next));
  }

  function bumpMinute(delta: number) {
    const next = new Date(selected);
    // Snap to nearest 5-minute boundary first if the current value is off-grid,
    // so the user gets predictable steps.
    const m = next.getMinutes();
    const snapped = Math.round(m / 5) * 5;
    if (snapped !== m) next.setMinutes(snapped);
    next.setMinutes(next.getMinutes() + delta);
    onChange(toLocalString(next));
  }

  function setNow() {
    onChange(toLocalString(new Date()));
  }

  function addHours(n: number) {
    const next = new Date();
    next.setHours(next.getHours() + n);
    next.setMinutes(Math.round(next.getMinutes() / 5) * 5);
    onChange(toLocalString(next));
  }

  function setTomorrowAt(h: number) {
    const next = new Date();
    next.setDate(next.getDate() + 1);
    next.setHours(h, 0, 0, 0);
    onChange(toLocalString(next));
  }

  function shiftMonth(delta: number) {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  return (
    <div className="datetime-picker" ref={containerRef}>
      <button
        type="button"
        className={`datetime-trigger ${open ? "active" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={ariaLabel ?? "Pilih waktu keberangkatan"}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Clock size={14} className="datetime-trigger-icon" />
        <span className="datetime-trigger-text">{formatTrigger(selected)}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="datetime-popover"
            role="dialog"
            aria-label="Pilih tanggal dan waktu"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Preset chips — fast path for the 80% of cases. */}
            <div className="datetime-presets">
              <button type="button" className="datetime-preset" onClick={setNow}>
                Sekarang
              </button>
              <button type="button" className="datetime-preset" onClick={() => addHours(1)}>
                +1 jam
              </button>
              <button type="button" className="datetime-preset" onClick={() => addHours(3)}>
                +3 jam
              </button>
              <button type="button" className="datetime-preset" onClick={() => setTomorrowAt(7)}>
                Besok pagi
              </button>
              <button type="button" className="datetime-preset" onClick={() => setTomorrowAt(17)}>
                Besok sore
              </button>
            </div>

            <div className="datetime-divider" />

            {/* Calendar header */}
            <div className="datetime-cal-header">
              <button
                type="button"
                className="datetime-icon-btn"
                onClick={() => shiftMonth(-1)}
                aria-label="Bulan sebelumnya"
              >
                <ChevronLeft size={14} />
              </button>
              <div className="datetime-cal-title">
                {ID_MONTHS[viewMonth]} {viewYear}
              </div>
              <button
                type="button"
                className="datetime-icon-btn"
                onClick={() => shiftMonth(1)}
                aria-label="Bulan berikutnya"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Day-of-week headers */}
            <div className="datetime-dow-row">
              {ID_DAY_HEADERS.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            {/* Day grid */}
            <div className="datetime-grid">
              {grid.map((d) => {
                const inMonth = d.getMonth() === viewMonth;
                const isToday = isSameDay(d, today);
                const isSelected = isSameDay(d, selected);
                return (
                  <button
                    type="button"
                    key={`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`}
                    className={[
                      "datetime-day",
                      !inMonth && "muted",
                      isToday && "today",
                      isSelected && "selected",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => pickDay(d)}
                    aria-current={isToday ? "date" : undefined}
                    aria-pressed={isSelected}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="datetime-divider" />

            {/* Time stepper */}
            <div className="datetime-time-row">
              <span className="datetime-time-label">Waktu</span>
              <div className="datetime-time-controls">
                <TimeStepper
                  value={pad(selected.getHours())}
                  onDec={() => bumpHour(-1)}
                  onInc={() => bumpHour(1)}
                  ariaLabel="Jam"
                />
                <span className="datetime-time-colon">:</span>
                <TimeStepper
                  value={pad(selected.getMinutes())}
                  onDec={() => bumpMinute(-5)}
                  onInc={() => bumpMinute(5)}
                  ariaLabel="Menit"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TimeStepper({
  value,
  onDec,
  onInc,
  ariaLabel,
}: {
  value: string;
  onDec: () => void;
  onInc: () => void;
  ariaLabel: string;
}) {
  return (
    <div className="datetime-stepper" role="group" aria-label={ariaLabel}>
      <button
        type="button"
        className="datetime-stepper-btn"
        onClick={onDec}
        aria-label={`${ariaLabel} kurang`}
        tabIndex={-1}
      >
        <ChevronLeft size={12} strokeWidth={2.5} />
      </button>
      <span className="datetime-stepper-value">{value}</span>
      <button
        type="button"
        className="datetime-stepper-btn"
        onClick={onInc}
        aria-label={`${ariaLabel} tambah`}
        tabIndex={-1}
      >
        <ChevronRight size={12} strokeWidth={2.5} />
      </button>
    </div>
  );
}
