"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { motion, AnimatePresence, useMotionValue, useMotionTemplate } from "framer-motion";
import PlaceAutocomplete from "@/components/PlaceAutocomplete";
import DateTimePicker from "@/components/DateTimePicker";
import {
  Send, MapPin, Car, Bike, PersonStanding, TentTree, Users,
  Navigation, Clock, StickyNote, Footprints, ChevronDown,
  MessageCircle, Map
} from "lucide-react";
import { TRANSPORT_OPTIONS } from "@/lib/options";
import type { ActivityType, TransportMode } from "@/lib/types";

/* ── Transport icon mapping ── */
const TRANSPORT_ICONS: Record<TransportMode, React.ElementType> = {
  motorcycle: Bike,
  car: Car,
  walking: PersonStanding,
  cycling: Bike,
  public_transport: Navigation,
};

function getNowForInput() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

interface SigapInputPanelProps {
  // "Ask" tab
  userQuestion: string;
  setUserQuestion: (v: string) => void;
  activity: ActivityType;
  setActivity: (v: ActivityType) => void;

  // "Plan" tab
  locationName: string;
  setLocationName: (v: string) => void;
  lat: number | undefined;
  setLat: (v: number | undefined) => void;
  lng: number | undefined;
  setLng: (v: number | undefined) => void;
  destination: string;
  setDestination: (v: string, lat?: number, lng?: number) => void;
  transportMode: TransportMode;
  setTransportMode: (v: TransportMode) => void;
  plannedTime: string;
  setPlannedTime: (v: string) => void;

  // Shared
  isLoading: boolean;
  onSubmit: (e?: React.FormEvent) => void;
  onTabChange?: (tab: "ask" | "plan") => void;
}

const QUICK_PROMPTS = [
  "Aman jogging sore ini?",
  "Mending motor atau mobil jam 4?",
  "Kapan waktu terbaik berangkat?",
];

export default function SigapInputPanel({
  userQuestion, setUserQuestion,
  activity, setActivity,
  locationName, setLocationName,
  lat, setLat, lng, setLng,
  destination, setDestination,
  transportMode, setTransportMode,
  plannedTime, setPlannedTime,
  isLoading, onSubmit, onTabChange,
}: SigapInputPanelProps) {
  const [activeTab, setActiveTab] = useState<"ask" | "plan">("ask");

  function handleTabChange(tab: "ask" | "plan") {
    setActiveTab(tab);
    onTabChange?.(tab);
  }
  const [tripNotes, setTripNotes] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [transportOpen, setTransportOpen] = useState(false);
  const transportRef = useRef<HTMLDivElement>(null);

  // Mouse-follow spotlight for premium feel
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove(e: React.MouseEvent) {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }
  }, []);

  useEffect(() => { autoResize(); }, [userQuestion, autoResize]);

  // Close dropdown on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (transportRef.current && !transportRef.current.contains(e.target as Node)) {
        setTransportOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  }

  const selectedTransport = TRANSPORT_OPTIONS.find(o => o.value === transportMode);
  const TransportIcon = TRANSPORT_ICONS[transportMode] || Car;

  const planReady = !!destination;

  return (
    <div className="sigap-input-panel group" onMouseMove={handleMouseMove}>
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              rgba(59, 130, 246, 0.04),
              transparent 70%
            )
          `,
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 1, pointerEvents: "none"
        }}
      />
      <Tabs.Root
        value={activeTab}
        onValueChange={(v) => handleTabChange(v as "ask" | "plan")}
      >
        {/* ── Tab List ── */}
        <Tabs.List className="sip-tab-list" aria-label="Mode interaksi">
          <Tabs.Trigger value="ask" className="sip-tab-trigger">
            <MessageCircle size={15} />
            Tanya SIGAP
          </Tabs.Trigger>
          <Tabs.Trigger value="plan" className="sip-tab-trigger">
            <Map size={15} />
            Rencanakan Perjalanan
          </Tabs.Trigger>
        </Tabs.List>

        {/* ═══════════════════════════════════════
            TAB 1 — Tanya SIGAP (Conversational)
        ═══════════════════════════════════════ */}
        <Tabs.Content value="ask" className="sip-tab-content">
          <AnimatePresence mode="wait">
            <motion.div
              key="ask-panel"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {/* Conversational input */}
              <form onSubmit={onSubmit} className="sip-chat-form">
                <div className="sip-chat-box">
                  <textarea
                    ref={textareaRef}
                    className="sip-chat-input"
                    placeholder="Tanya SIGAP terkait rencanamu"
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                  />
                  <button
                    type="submit"
                    className="sip-send-btn"
                    disabled={isLoading}
                    aria-label="Kirim pertanyaan"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </form>

              {/* Quick prompt chips — fill only, user submits manually */}
              <div className="sip-quick-prompts">
                {QUICK_PROMPTS.map((text) => (
                  <button
                    key={text}
                    type="button"
                    className="sip-prompt-chip"
                    onClick={() => setUserQuestion(text)}
                  >
                    {text}
                  </button>
                ))}
              </div>

            </motion.div>
          </AnimatePresence>
        </Tabs.Content>

        {/* ═══════════════════════════════════════
            TAB 2 — Rencanakan Perjalanan (Structured)
        ═══════════════════════════════════════ */}
        <Tabs.Content value="plan" className="sip-tab-content">
          <AnimatePresence mode="wait">
            <motion.div
              key="plan-panel"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={onSubmit} className="sip-plan-form">

                {/* ── Origin / Destination row ── */}
                <div className="sip-route-block">
                  {/* Origin */}
                  <div className="sip-route-field">
                    <div className="sip-route-icon origin">
                      <MapPin size={14} />
                    </div>
                    <PlaceAutocomplete
                      key={locationName || "detecting"}
                      value={locationName}
                      onChange={(val, newLat, newLng) => {
                        setLocationName(val);
                        if (newLat !== undefined) setLat(newLat);
                        if (newLng !== undefined) setLng(newLng);
                      }}
                      placeholder={locationName ? locationName : "Mendeteksi lokasi GPS..."}
                      id="sip-origin"
                      userLat={lat}
                      userLng={lng}
                    />
                  </div>

                  {/* Route connector dot */}
                  <div className="sip-route-connector">
                    <span />
                    <span />
                    <span />
                  </div>

                  {/* Destination */}
                  <div className="sip-route-field">
                    <div className="sip-route-icon dest">
                      <Navigation size={14} />
                    </div>
                    <PlaceAutocomplete
                      value={destination}
                      onChange={(val, dLat, dLng) => setDestination(val, dLat, dLng)}
                      placeholder="Tujuan (wajib diisi)"
                      id="sip-destination"
                      userLat={lat}
                      userLng={lng}
                    />
                  </div>
                </div>

                {/* ── Transport + Time row ── */}
                <div className="sip-meta-row">
                  {/* Transport mode — custom dropdown */}
                  <div className="sip-transport-select" ref={transportRef}>
                    <button
                      type="button"
                      className="sip-transport-btn"
                      onClick={() => setTransportOpen(!transportOpen)}
                      aria-expanded={transportOpen}
                    >
                      <TransportIcon size={15} />
                      <span>{selectedTransport?.label ?? "Transportasi"}</span>
                      <ChevronDown size={13} className={`sip-chevron ${transportOpen ? "open" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {transportOpen && (
                        <motion.div
                          className="sip-transport-dropdown"
                          initial={{ opacity: 0, y: -4, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.97 }}
                          transition={{ duration: 0.15 }}
                        >
                          {TRANSPORT_OPTIONS.map((opt) => {
                            const TIcon = TRANSPORT_ICONS[opt.value] || Car;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                className={`sip-transport-option ${opt.value === transportMode ? "active" : ""}`}
                                onClick={() => {
                                  setTransportMode(opt.value);
                                  setTransportOpen(false);
                                }}
                              >
                                <TIcon size={14} />
                                {opt.label}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Datetime — custom picker (replaces native datetime-local) */}
                  <DateTimePicker
                    value={plannedTime}
                    onChange={setPlannedTime}
                    ariaLabel="Waktu keberangkatan"
                  />
                </div>

                {/* ── Optional notes ── */}
                <div className="sip-notes-field">
                  <StickyNote size={13} className="sip-notes-icon" />
                  <input
                    type="text"
                    className="sip-notes-input"
                    placeholder="Ada detail tambahan? (opsional) — mis. 'bawa barang banyak' atau 'ada anak kecil'"
                    value={tripNotes}
                    onChange={(e) => {
                      setTripNotes(e.target.value);
                      // inject notes into question context
                      setUserQuestion(e.target.value);
                    }}
                  />
                </div>

                {/* ── Submit ── */}
                <button
                  type="submit"
                  className={`sip-plan-submit ${!planReady ? "disabled" : ""}`}
                  disabled={isLoading || !planReady}
                >
                  {isLoading ? (
                    <>
                      <span className="sip-spinner" />
                      Menganalisis...
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      Analisis Rute
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </AnimatePresence>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
