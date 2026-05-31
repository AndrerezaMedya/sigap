"use client";

import {
  type FormEvent,
  useEffect,
  useState,
} from "react";
import { motion, AnimatePresence, useMotionValue, useMotionTemplate } from "framer-motion";
import PersonaModal from "@/components/PersonaModal";
import DocModal from "@/components/DocModal";
import ParticlesBackground from "@/components/ParticlesBackground";
import IntelligenceMap from "@/components/IntelligenceMap";
import ActivityComparisonChart from "@/components/ActivityComparisonChart";
import GroundTruthSheet from "@/components/GroundTruthSheet";
import SigapInputPanel from "@/components/SigapInputPanel";
import AIThinkingLoader from "@/components/AIThinkingLoader";
import { APIProvider } from "@vis.gl/react-google-maps";
import { useStreamingText } from "@/lib/hooks/useStreamingText";
import { useCountUp } from "@/lib/hooks/useCountUp";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import {
  MapPin,
  Clock,
  CloudSun,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  Navigation,
  Settings2,
} from "lucide-react";
import {
  DEFAULT_DEMO_LOCATION,
} from "@/lib/options";
import type {
  ActivityType,
  RecommendationResponse,
  RiskLevel,
  TransportMode,
  UserContext,
} from "@/lib/types";

/* ── Ambient Background Colors (Risk-based) ──
   Each risk level has 5 channels:
   - bg/glow drive the hero card background and shadow
   - aurora1/aurora2/aurora3 drive the slow-drifting aurora orb behind content
   The aurora colors are slightly more saturated than bg so the orb still reads
   through the surface gradient.
*/
const RISK_COLORS: Record<
  RiskLevel,
  { bg: string; glow: string; aurora1: string; aurora2: string; aurora3: string }
> = {
  safe: {
    bg: "rgba(34, 197, 94, 0.08)",
    glow: "rgba(34, 197, 94, 0.15)",
    aurora1: "rgba(34, 197, 94, 0.22)",
    aurora2: "rgba(20, 184, 166, 0.18)",
    aurora3: "rgba(59, 130, 246, 0.10)",
  },
  comfortable: {
    bg: "rgba(34, 197, 94, 0.06)",
    glow: "rgba(34, 197, 94, 0.12)",
    aurora1: "rgba(34, 197, 94, 0.18)",
    aurora2: "rgba(20, 184, 166, 0.14)",
    aurora3: "rgba(59, 130, 246, 0.10)",
  },
  moderate: {
    bg: "rgba(251, 146, 60, 0.08)",
    glow: "rgba(251, 146, 60, 0.15)",
    aurora1: "rgba(251, 146, 60, 0.22)",
    aurora2: "rgba(245, 158, 11, 0.18)",
    aurora3: "rgba(217, 70, 239, 0.08)",
  },
  less_recommended: {
    bg: "rgba(251, 146, 60, 0.06)",
    glow: "rgba(251, 146, 60, 0.12)",
    aurora1: "rgba(251, 146, 60, 0.18)",
    aurora2: "rgba(245, 158, 11, 0.14)",
    aurora3: "rgba(217, 70, 239, 0.08)",
  },
  high_risk: {
    bg: "rgba(239, 68, 68, 0.08)",
    glow: "rgba(239, 68, 68, 0.15)",
    aurora1: "rgba(239, 68, 68, 0.24)",
    aurora2: "rgba(244, 63, 94, 0.18)",
    aurora3: "rgba(251, 146, 60, 0.10)",
  },
};

/* Default aurora tints when no recommendation has loaded yet — cool blue/indigo. */
const DEFAULT_AURORA = {
  aurora1: "rgba(59, 130, 246, 0.18)",
  aurora2: "rgba(139, 92, 246, 0.14)",
  aurora3: "rgba(34, 197, 94, 0.08)",
} as const;

const RISK_STYLE: Record<
  RiskLevel,
  { label: string; badgeClass: string; icon: React.ElementType }
> = {
  safe: { label: "Aman", badgeClass: "safe", icon: ShieldCheck },
  comfortable: { label: "Nyaman", badgeClass: "safe", icon: ShieldCheck },
  moderate: { label: "Waspada", badgeClass: "caution", icon: AlertTriangle },
  less_recommended: { label: "Kurang Disarankan", badgeClass: "caution", icon: AlertTriangle },
  high_risk: { label: "Risiko Tinggi", badgeClass: "risk", icon: ShieldAlert },
};

function getNowForInput() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

export default function Home() {
  /* Form state */
  const [locationName, setLocationName] = useState("");
  const [adm4Code] = useState(DEFAULT_DEMO_LOCATION.adm4Code);
  const [lat, setLat] = useState<number | undefined>(DEFAULT_DEMO_LOCATION.lat);
  const [lng, setLng] = useState<number | undefined>(DEFAULT_DEMO_LOCATION.lng);
  const [destination, setDestination] = useState("");
  const [activity, setActivity] = useState<ActivityType>("commute");
  const [transportMode, setTransportMode] = useState<TransportMode>("motorcycle");
  const [plannedTime, setPlannedTime] = useState(getNowForInput);
  const [userQuestion, setUserQuestion] = useState("");
  const [userProfile, setUserProfile] = useState<import("@/lib/types").UserProfile | null>(null);
  const [geoDetected, setGeoDetected] = useState(false);

  /* Results & UI state */
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetchedInitial, setHasFetchedInitial] = useState(false);
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showGroundTruth, setShowGroundTruth] = useState(false);
  const [activeTab, setActiveTab] = useState<"ask" | "plan">("ask");
  // Snapshot of form values at last submit — used for marker labels
  const [submittedOrigin, setSubmittedOrigin] = useState("");
  const [submittedDestination, setSubmittedDestination] = useState("");

  /* Spotlight state */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }



  const risk = result ? RISK_STYLE[result.recommendation.riskLevel] : RISK_STYLE.comfortable;
  const RiskIcon = risk.icon;

  /* ── AI-native streaming reveal ──
     When a new recommendation arrives, headline + body stream in token-by-token.
     Reasoning items cascade with a slight stagger (handled below via Framer).
     prefersReducedMotion short-circuits the typewriter to instant text.
  */
  const reducedMotion = useReducedMotion();
  const headlineSource = result?.recommendation.headline ?? "Kondisi kota terpantau stabil untuk aktivitas luar ruang.";
  const recommendationSource = result?.recommendation.recommendation ?? "Direkomendasikan untuk berangkat sesuai jadwal Anda.";
  const headlineStream = headlineSource;
  const recommendationStream = recommendationSource;
  const headlineDone = true;
  const recommendationDone = true;

  const targetConfidence = Math.round((result?.recommendation.confidence ?? 0) * 100);
  const animatedConfidence = useCountUp(targetConfidence, { instant: reducedMotion });

  const aurora = result
    ? RISK_COLORS[result.recommendation.riskLevel]
    : { aurora1: DEFAULT_AURORA.aurora1, aurora2: DEFAULT_AURORA.aurora2, aurora3: DEFAULT_AURORA.aurora3 };

  // Geolocation auto-detect + Persona from localStorage on mount
  useEffect(() => {
    const initializeApp = async () => {
      const savedPersona = localStorage.getItem("sigap_persona");
      if (savedPersona) {
        setUserProfile(JSON.parse(savedPersona));
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setLat(latitude);
            setLng(longitude);

            try {
              const geoResponse = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                { headers: { "Accept-Language": "id" } }
              );
              const geoData = await geoResponse.json();
              const cityName = geoData.address?.city || geoData.address?.town || geoData.address?.village || "Lokasi Anda";
              setLocationName(cityName);
              setGeoDetected(true);
            } catch (error) {
              console.log("Geolocation reverse geocoding failed, using default", error);
              setLocationName("Lokasi Anda");
              setGeoDetected(true);
            }
          },
          (error) => {
            console.log("Geolocation permission denied or unavailable", error);
            setLocationName("Lokasi Tidak Diketahui");
            setGeoDetected(true);
          }
        );
      } else {
        setLocationName("Lokasi Tidak Diketahui");
        setGeoDetected(true);
      }

      if (!hasFetchedInitial && savedPersona) {
        setHasFetchedInitial(true);
        setTimeout(() => handleSubmit(), 100);
      } else if (!hasFetchedInitial && !savedPersona) {
        setTimeout(() => setShowPersonaModal(true), 500);
      }
    };

    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasFetchedInitial]);

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null); // Clear old result so hero card enters loading state immediately
    // Snapshot form values so markers show the route that was actually requested
    setSubmittedOrigin(locationName);
    setSubmittedDestination(destination);

    const saved = localStorage.getItem("sigap_persona");
    const profileData = saved ? JSON.parse(saved) : undefined;

    const userContext: UserContext = {
      locationName,
      lat,
      lng,
      adm4Code,
      destination: activeTab === "plan" ? (destination || undefined) : undefined,
      activity,
      transportMode: activeTab === "plan" ? transportMode : undefined,
      plannedTime: new Date(plannedTime).toISOString(),
      userQuestion: activeTab === "ask" ? (userQuestion || undefined) : undefined,
      profile: profileData,
    };

    try {
      const response = await fetch("/api/recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userContext }),
      });

      if (!response.ok) throw new Error("Request failed");
      setResult(await response.json());

      // Scroll to top so user sees the updated hero card
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 150);
    } catch {
      setError("Gagal menghubungi server analitik SIGAP. Silakan coba sesaat lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  // Destination setter with optional coords (for plan tab)
  function handleSetDestination(val: string, _dLat?: number, _dLng?: number) {
    setDestination(val);
  }

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GCP_API_KEY || "dummy_key_waiting_for_billing"}>
      <div className="app">
        <ParticlesBackground riskLevel={result?.recommendation.riskLevel} />

        <AnimatePresence>
          {showPersonaModal && (
            <PersonaModal
              onComplete={(profile) => {
                localStorage.setItem("sigap_persona", JSON.stringify(profile));
                setUserProfile(profile);
                setShowPersonaModal(false);
                setHasFetchedInitial(true);
                setTimeout(() => handleSubmit(), 100);
              }}
              onCancel={userProfile ? () => setShowPersonaModal(false) : undefined}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showDocModal && <DocModal onClose={() => setShowDocModal(false)} />}
        </AnimatePresence>
        <GroundTruthSheet
          isOpen={showGroundTruth}
          onClose={() => setShowGroundTruth(false)}
          context={result?.environmentalContext ?? null}
        />

        <header className="header">
          <div className="logo">
            <Navigation className="text-blue-600" />
            SIGAP
          </div>
          <div className="header-divider" />
          <button
            className="header-action"
            onClick={() => setShowDocModal(true)}
          >
            <Info size={14} />
            Cara Pakai
          </button>
          {userProfile && (
            <button
              className="header-action"
              onClick={() => setShowPersonaModal(true)}
            >
              <Settings2 size={14} />
              Ubah Profil
            </button>
          )}
        </header>

        <main className="main-content">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

            <motion.div
              className="hero-spotlight-container group"
              onMouseMove={handleMouseMove}
              animate={{
                backgroundColor: result ? RISK_COLORS[result.recommendation.riskLevel].bg : "rgba(15, 23, 42, 0.02)",
                borderColor: result ? RISK_COLORS[result.recommendation.riskLevel].glow : "rgba(15, 23, 42, 0.08)",
              }}
              transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                position: "relative",
                padding: "48px",
                marginBottom: "32px",
                borderRadius: "24px",
                border: "1px solid var(--border)",
                overflow: "hidden",
                background: "var(--gradient-premium)",
              }}
            >
              {/* Aurora orb — slow-rotating ambient gradient. Color shifts when riskLevel changes. */}
              <div
                className="aurora-orb"
                aria-hidden
                style={
                  {
                    "--aurora-tint": aurora.aurora1,
                    "--aurora-tint-2": aurora.aurora2,
                    "--aurora-tint-3": aurora.aurora3,
                  } as React.CSSProperties
                }
              />

              {/* Subtle pulsing top highlight to add cinematic depth on the hero edge. */}
              <motion.div
                className="pointer-events-none absolute -inset-px rounded-2xl"
                animate={{
                  opacity: result ? [0.25, 0.45, 0.25] : 0.18,
                  background: result
                    ? `radial-gradient(ellipse at 50% 0%, ${RISK_COLORS[result.recommendation.riskLevel].glow} 0%, transparent 70%)`
                    : "radial-gradient(ellipse at 50% 0%, rgba(59, 130, 246, 0.08) 0%, transparent 70%)",
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0, bottom: 0,
                  zIndex: 0, pointerEvents: "none",
                }}
              />

              {/* Mouse-follow spotlight */}
              <motion.div
                className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-500 group-hover:opacity-100"
                style={{
                  background: useMotionTemplate`
                  radial-gradient(
                    800px circle at ${mouseX}px ${mouseY}px,
                    rgba(59, 130, 246, 0.06),
                    transparent 70%
                  )
                `,
                  position: "absolute",
                  top: 0, left: 0, right: 0, bottom: 0,
                  zIndex: 1, pointerEvents: "none"
                }}
              />

              {/* Subtle grid pattern */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `
                  linear-gradient(rgba(15, 23, 42, 0.02) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(15, 23, 42, 0.02) 1px, transparent 1px)
                `,
                  backgroundSize: "32px 32px",
                  opacity: 0.5,
                  zIndex: 0,
                  pointerEvents: "none"
                }}
              />

              <div style={{ position: "relative", zIndex: 2 }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 500 }}
                  >
                    <MapPin size={16} style={{ color: "var(--text-light)" }} />
                    {result?.environmentalContext.location.label ?? locationName}
                    {geoDetected && (
                      <motion.span
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "0.75rem",
                          color: "#0ea5e9",
                          fontWeight: 600,
                          marginLeft: "8px",
                          padding: "4px 10px",
                          borderRadius: "999px",
                          backgroundColor: "rgba(6, 182, 212, 0.1)",
                          backdropFilter: "blur(8px)",
                          border: "1px solid rgba(6, 182, 212, 0.2)",
                        }}
                      >
                        <motion.span
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          style={{ width: "4px", height: "4px", borderRadius: "999px", backgroundColor: "#0ea5e9" }}
                        />
                        Terdeteksi
                      </motion.span>
                    )}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                  >
                    <div className={`status-badge ${risk.badgeClass}`} style={{ margin: 0 }}>
                      <RiskIcon size={14} />
                      {result?.recommendation.statusLabel ?? (isLoading ? "Mohon Tunggu" : risk.label)}
                    </div>
                  </motion.div>
                </div>

                <motion.h1
                  key={`headline-${result?.recommendation.headline}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="headline"
                  style={{ marginBottom: "16px" }}
                  aria-live="polite"
                >
                  {isLoading && !result ? (
                    <>Menganalisis kondisi kota<span className="streaming-caret" /></>
                  ) : (
                    headlineStream
                  )}
                </motion.h1>

                <motion.p
                  key={`rec-${result?.recommendation.recommendation}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                  className="subheadline"
                  style={{ marginBottom: "28px" }}
                  aria-live="polite"
                >
                  {isLoading && !result ? (
                    "Mengumpulkan data cuaca dan lalu lintas..."
                  ) : (
                    recommendationStream
                  )}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", paddingTop: "24px", borderTop: "1px solid var(--border-light)" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.875rem", color: "var(--text-muted)", padding: "8px 12px", borderRadius: "12px", background: "rgba(255,255,255,0.72)", backdropFilter: "blur(8px)", fontWeight: 500 }}>
                    <CloudSun size={16} style={{ color: "var(--text-light)" }} />
                    <span>{result?.environmentalContext.weather.summary ?? "—"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.875rem", color: "var(--text-muted)", padding: "8px 12px", borderRadius: "12px", background: "rgba(255,255,255,0.72)", backdropFilter: "blur(8px)", fontWeight: 500 }}>
                    <Clock size={16} style={{ color: "var(--text-light)" }} />
                    <span>Optimal: {result?.recommendation.bestWindow ?? "—"}</span>
                  </div>
                  {result?.recommendation.confidence && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.875rem", color: "var(--text-muted)", padding: "8px 12px", borderRadius: "12px", background: "rgba(255,255,255,0.72)", backdropFilter: "blur(8px)", fontWeight: 500 }}>
                      <Info size={16} style={{ color: "var(--text-light)" }} />
                      <span>
                        Keyakinan AI: <strong style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600, color: "var(--text-main)" }}>{Math.round(animatedConfidence)}%</strong>
                      </span>
                    </div>
                  )}
                </motion.div>
                {result && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.35 }}
                    type="button"
                    className="ground-truth-trigger"
                    onClick={() => setShowGroundTruth(true)}
                  >
                    Ground Truth · lihat data sumber
                  </motion.button>
                )}
              </div>
            </motion.div>

            <SigapInputPanel
              userQuestion={userQuestion}
              setUserQuestion={setUserQuestion}
              activity={activity}
              setActivity={setActivity}
              locationName={locationName}
              setLocationName={setLocationName}
              lat={lat}
              setLat={setLat}
              lng={lng}
              setLng={setLng}
              destination={destination}
              setDestination={handleSetDestination}
              transportMode={transportMode}
              setTransportMode={setTransportMode}
              plannedTime={plannedTime}
              setPlannedTime={setPlannedTime}
              isLoading={isLoading}
              onSubmit={handleSubmit}
              onTabChange={(tab) => {
                setActiveTab(tab);
                if (tab === "plan") setUserQuestion("");
              }}
              geoDetected={geoDetected}
            />
          </motion.div>

          {/* ── AI Thinking Indicator ── */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="loader-wrapper"
              >
                <AIThinkingLoader
                  label={hasFetchedInitial ? "Memperbarui rekomendasi" : "SIGAP sedang menganalisis"}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="error-box">
              <ShieldAlert size={18} />
              {error}
            </div>
          )}

          {/* ── Deep Intelligence Panel (Secondary Info) ── */}
          <AnimatePresence>
            {result && !isLoading && (
              <motion.div
                className="intelligence-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="card" style={{ gridColumn: "1 / -1" }}>
                  <h3 className="card-title" style={{ marginBottom: "16px" }}><MapPin /> Visualisasi Rute & Risiko Lingkungan</h3>
                  {result.environmentalContext.location.lat !== undefined && result.environmentalContext.location.lng !== undefined ? (
                    <IntelligenceMap
                      lat={result.environmentalContext.location.lat}
                      lng={result.environmentalContext.location.lng}
                      destination={destination || undefined}
                      trafficData={result.environmentalContext.traffic}
                      originName={submittedOrigin || result.environmentalContext.location.label}
                      destinationName={submittedDestination || destination || undefined}
                    />
                  ) : (
                    <div style={{ padding: "32px", textAlign: "center", color: "#64748B", fontSize: "0.875rem" }}>
                      Koordinat lokasi tidak tersedia untuk divisualisasikan.
                    </div>
                  )}
                </div>

                {result.recommendation.activityComparison && result.recommendation.activityComparison.length > 0 && (
                  <ActivityComparisonChart
                    items={result.recommendation.activityComparison}
                    currentActivity={activeTab === "plan" ? activity : null}
                    plannedTime={result.userContext.plannedTime}
                  />
                )}

                <div className="card">
                  <h3 className="card-title"><Clock /> Smart Timeline (Proyeksi Waktu)</h3>
                  <div className="timeline" style={{ marginTop: "20px" }}>
                    {result.recommendation.timeline.map((item, i) => (
                      <div key={i} className="timeline-item">
                        <div className="timeline-time">{item.time}</div>
                        <div className={`timeline-dot ${RISK_STYLE[item.riskLevel].badgeClass}`} />
                        <div className="timeline-content">
                          <div className="timeline-label">{item.label}</div>
                          <div className="timeline-detail">{item.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <h3 className="card-title"><Info /> Elaborasi Detail</h3>
                  <ul className="reasoning-list" style={{ marginTop: "16px" }}>
                    {result.recommendation.reasoning.map((reason, i) => (
                      <motion.li
                        key={`${result.recommendation.headline}-${i}`}
                        className="reasoning-item"
                        initial={reducedMotion ? false : { opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: reducedMotion ? 0 : 0.15 + i * 0.09,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      >
                        <ArrowRight />
                        <span>{reason}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="meta-info">
                  {result.recommendation.dataNotes.map((note, i) => <span key={i}>{note}</span>)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <GroundTruthSheet
          isOpen={showGroundTruth}
          onClose={() => setShowGroundTruth(false)}
          context={result?.environmentalContext ?? null}
        />
      </div>
    </APIProvider>
  );
}
