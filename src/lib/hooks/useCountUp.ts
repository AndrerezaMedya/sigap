"use client";

import { useEffect, useRef, useState } from "react";

interface Options {
  /** Milliseconds for the full sweep. Default 900ms — fast enough to feel snappy, slow enough to read. */
  duration?: number;
  /** When true, snap to the target instantly. Use for prefers-reduced-motion. */
  instant?: boolean;
}

// Smooth ease-out cubic — same family as framer's easeOut, feels natural for numbers settling.
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Count-up animation that respects target changes (re-runs when target changes).
 * Returns a number, caller decides formatting.
 */
export function useCountUp(target: number, opts: Options = {}): number {
  const { duration = 900, instant = false } = opts;
  const [value, setValue] = useState(instant ? target : 0);
  const fromRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    // All state mutations are scheduled via RAF so they never happen
    // synchronously inside the effect body (React 19 rule:
    // react-hooks/set-state-in-effect).
    if (instant) {
      fromRef.current = target;
      rafRef.current = requestAnimationFrame(() => setValue(target));
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }

    const from = fromRef.current;
    let start: number | null = null;

    const tick = (now: number) => {
      if (start === null) start = now;
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const next = from + (target - from) * easeOutCubic(t);
      setValue(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, instant]);

  return value;
}
