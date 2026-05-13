"use client";

import { useEffect, useRef, useState } from "react";

interface Options {
  /** Milliseconds per character. Default 14ms ≈ ~70 chars/sec, feels like a fast confident assistant. */
  speed?: number;
  /** Pause this many ms before starting to stream (allows entrance animation to finish). */
  delay?: number;
  /** When true, returns the full text immediately (e.g. prefers-reduced-motion). */
  instant?: boolean;
}

/**
 * Token-by-token reveal for AI-generated text.
 * Resets whenever `text` changes, so each new recommendation streams fresh.
 */
export function useStreamingText(text: string, opts: Options = {}): { value: string; done: boolean } {
  const { speed = 14, delay = 0, instant = false } = opts;
  const [value, setValue] = useState(instant ? text : "");
  const [done, setDone] = useState(instant);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (rafRef.current) {
      window.clearTimeout(rafRef.current);
      rafRef.current = null;
    }

    // All state mutations are scheduled via the timer pipeline so they never
    // happen synchronously inside the effect body (React 19 rule:
    // react-hooks/set-state-in-effect).
    if (!text) {
      rafRef.current = window.setTimeout(() => {
        setValue("");
        setDone(true);
      }, 0) as unknown as number;
      return () => {
        if (rafRef.current) window.clearTimeout(rafRef.current);
      };
    }

    if (instant) {
      rafRef.current = window.setTimeout(() => {
        setValue(text);
        setDone(true);
      }, 0) as unknown as number;
      return () => {
        if (rafRef.current) window.clearTimeout(rafRef.current);
      };
    }

    let i = 0;
    const tick = () => {
      if (i === 0) {
        // Reset on first tick — avoids a flash of stale text from the previous run.
        setValue("");
        setDone(false);
      }
      i += 1;
      setValue(text.slice(0, i));
      if (i < text.length) {
        rafRef.current = window.setTimeout(tick, speed) as unknown as number;
      } else {
        setDone(true);
      }
    };

    rafRef.current = window.setTimeout(tick, delay) as unknown as number;

    return () => {
      if (rafRef.current) window.clearTimeout(rafRef.current);
    };
  }, [text, speed, delay, instant]);

  return { value, done };
}
