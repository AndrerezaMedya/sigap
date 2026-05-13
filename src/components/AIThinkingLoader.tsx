"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { CloudSun, Wind, Navigation, Activity, Sparkles } from "lucide-react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * AI Thinking experience — replaces the generic spinner.
 *
 * Why this exists: when an AI assistant is reasoning, users need to feel that
 * something *intentional* is happening, not just a network request. Rotating
 * context messages signal which data sources are being consulted, which builds
 * trust and reduces perceived latency.
 *
 * Sources of the messages mirror the actual SIGAP pipeline: BMKG → AQI → Routes
 * → PetaBencana → Gemini synthesis.
 */

interface Step {
  icon: React.ElementType;
  label: string;
  /** Tailwind-ish color used inline for the icon. */
  color: string;
}

const STEPS: Step[] = [
  { icon: CloudSun, label: "Membaca cuaca dari BMKG…", color: "#3B82F6" },
  { icon: Wind, label: "Memeriksa kualitas udara…", color: "#10B981" },
  { icon: Navigation, label: "Menelusuri kepadatan lalu lintas…", color: "#F59E0B" },
  { icon: Activity, label: "Mencocokkan dengan profil aktivitas…", color: "#06B6D4" },
  { icon: Sparkles, label: "Merangkai rekomendasi…", color: "#8B5CF6" },
];

const STEP_INTERVAL_MS = 1100;

export default function AIThinkingLoader({ label }: { label?: string }) {
  const reducedMotion = useReducedMotion();
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => {
      setStepIndex((i) => (i + 1) % STEPS.length);
    }, STEP_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reducedMotion]);

  const step = STEPS[stepIndex];
  const Icon = step.icon;

  return (
    <motion.div
      className="ai-thinking-loader"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.3 }}
      role="status"
      aria-live="polite"
    >
      <div className="ai-thinking-icon-stack">
        {/* Soft halo around the active icon */}
        <motion.span
          className="ai-thinking-halo"
          aria-hidden
          animate={
            reducedMotion
              ? undefined
              : {
                  boxShadow: [
                    `0 0 0 0 ${step.color}55`,
                    `0 0 0 14px ${step.color}00`,
                  ],
                }
          }
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
          style={{ background: `${step.color}14` }}
        />
        <AnimatePresence mode="wait">
          <motion.span
            key={stepIndex}
            initial={{ opacity: 0, scale: 0.85, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -4 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="ai-thinking-icon"
            style={{ color: step.color }}
          >
            <Icon size={18} strokeWidth={2.2} />
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="ai-thinking-text">
        <span className="ai-thinking-headline">
          {label ?? "SIGAP sedang menganalisis"}
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={stepIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.32 }}
            className="ai-thinking-step"
          >
            {step.label}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* 3-dot pulse — canonical AI-native typing indicator */}
      <div className="ai-thinking-dots" aria-hidden>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={
              reducedMotion
                ? { opacity: 0.5 }
                : { opacity: [0.25, 1, 0.25], y: [0, -2, 0] }
            }
            transition={{
              duration: 1.0,
              repeat: Infinity,
              delay: i * 0.18,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
