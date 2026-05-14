import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, BrainCircuit, CheckCircle2, ArrowLeft, X } from "lucide-react";
import type { UserProfile, TransportMode } from "@/lib/types";

interface PersonaModalProps {
  onComplete: (profile: UserProfile) => void;
  onCancel?: () => void;
}

export default function PersonaModal({ onComplete, onCancel }: PersonaModalProps) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    occupation: undefined,
    ageGroup: undefined,
    mainTransport: undefined,
    healthNotes: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const [showOtherOccupation, setShowOtherOccupation] = useState(false);
  const [otherOccupationInput, setOtherOccupationInput] = useState("");

  const handleNext = () => {
    if (step < 4) {
      if (step === 1 && showOtherOccupation && otherOccupationInput.trim()) {
        setProfile({ ...profile, occupation: otherOccupationInput.trim() });
      }
      setStep(step + 1);
    } else {
      setIsProcessing(true);
      setTimeout(() => {
        onComplete(profile as UserProfile);
      }, 2500);
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px", backgroundColor: "rgba(15, 23, 42, 0.4)",
      backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)"
    }}>
      <style>{`
        .persona-opt-btn {
          transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .persona-opt-btn:hover:not(.selected) {
          background-color: rgba(226, 232, 240, 0.6) !important;
        }
        .persona-action-btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .persona-back-btn {
          transition: all 0.2s ease;
        }
        .persona-back-btn:hover {
          background-color: rgba(226, 232, 240, 0.5);
          color: #0F172A !important;
        }
      `}</style>
      <AnimatePresence mode="wait">
        {!isProcessing ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -16 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: "100%", maxWidth: "440px",
              backgroundColor: "rgba(250, 250, 250, 0.95)",
              backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
              borderRadius: "24px",
              boxShadow: "0 20px 60px -15px rgba(0,0,0,0.1)",
              border: "1px solid rgba(255, 255, 255, 0.6)",
              display: "flex", flexDirection: "column",
              overflow: "hidden"
            }}
          >
            <div style={{ padding: "32px 32px 16px 32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {step > 1 && (
                  <button onClick={handlePrev} className="persona-back-btn" style={{ background: "transparent", border: "none", cursor: "pointer", padding: "8px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B", marginLeft: "-8px" }}>
                    <ArrowLeft size={20} strokeWidth={2.5} />
                  </button>
                )}
                <h2 style={{ 
                  fontSize: "1.5rem", fontWeight: 600, color: "#0F172A",
                  display: "flex", alignItems: "center", gap: "12px",
                  margin: 0, letterSpacing: "-0.02em", flex: 1
                }}>
                  <div style={{ padding: "8px", backgroundColor: "#F1F5F9", borderRadius: "12px", display: "flex" }}>
                    <BrainCircuit size={20} color="#334155" strokeWidth={2} />
                  </div>
                  Personalisasi
                </h2>
                {onCancel && (
                  <button
                    onClick={onCancel}
                    className="persona-back-btn"
                    style={{
                      background: "transparent", border: "none", cursor: "pointer",
                      padding: "8px", borderRadius: "12px", display: "flex",
                      alignItems: "center", justifyContent: "center", color: "#94A3B8",
                      marginRight: "-8px"
                    }}
                    aria-label="Batal"
                  >
                    <X size={20} strokeWidth={2} />
                  </button>
                )}
              </div>
              <p style={{ fontSize: "0.9375rem", color: "#64748B", marginTop: "12px", lineHeight: 1.6, marginBottom: 0 }}>
                Bantu AI kami memahami profil mobilitas Anda untuk rekomendasi yang lebih tajam.
              </p>
            </div>

            <div style={{ padding: "0 32px 24px 32px", flex: 1, minHeight: "260px" }}>
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.3 }}>
                    <label style={{ display: "block", fontSize: "0.9375rem", fontWeight: 500, marginBottom: "16px", color: "#1E293B" }}>
                      Aktivitas utama sehari-hari?
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {["Pelajar / Mahasiswa", "Pekerja Kantoran", "Pekerja Lapangan", "Lainnya"].map((opt) => {
                        const isSelected = profile.occupation === opt || (opt === "Lainnya" && showOtherOccupation);
                        return (
                          <button
                            key={opt}
                            className={`persona-opt-btn ${isSelected ? "selected" : ""}`}
                            onClick={() => {
                              if (opt === "Lainnya") {
                                setShowOtherOccupation(true);
                                setProfile({ ...profile, occupation: "" });
                              } else {
                                setShowOtherOccupation(false);
                                setProfile({ ...profile, occupation: opt });
                                setTimeout(handleNext, 300);
                              }
                            }}
                            style={{
                              textAlign: "left", padding: "14px 20px", borderRadius: "16px",
                              border: "none", cursor: "pointer", fontSize: "0.9375rem", fontWeight: 500,
                              backgroundColor: isSelected ? "#0F172A" : "rgba(241, 245, 249, 0.5)",
                              color: isSelected ? "#FFFFFF" : "#475569",
                              transform: isSelected ? "scale(0.98)" : "scale(1)",
                              boxShadow: isSelected ? "0 4px 12px rgba(15, 23, 42, 0.15)" : "none"
                            }}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {showOtherOccupation && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                        <input
                          type="text"
                          placeholder="Ketik pekerjaan Anda..."
                          value={otherOccupationInput}
                          onChange={(e) => setOtherOccupationInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleNext()}
                          style={{
                            flex: 1, padding: "14px 20px", border: "none", borderRadius: "16px",
                            backgroundColor: "rgba(241, 245, 249, 0.5)", color: "#0F172A",
                            outline: "none", fontSize: "0.9375rem", fontFamily: "inherit",
                            transition: "all 0.3s ease"
                          }}
                          onFocus={(e) => { e.target.style.boxShadow = "0 0 0 1px rgba(15, 23, 42, 0.5)"; }}
                          onBlur={(e) => { e.target.style.boxShadow = "none"; }}
                          autoFocus
                        />
                        <button
                          onClick={handleNext}
                          disabled={!otherOccupationInput.trim()}
                          className="persona-action-btn"
                          style={{
                            padding: "0 20px", backgroundColor: otherOccupationInput.trim() ? "#0F172A" : "#CBD5E1",
                            color: "#FFFFFF", border: "none", borderRadius: "16px",
                            fontWeight: 500, cursor: otherOccupationInput.trim() ? "pointer" : "not-allowed",
                            transition: "all 0.2s ease"
                          }}
                        >
                          Lanjut
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.3 }}>
                    <label style={{ display: "block", fontSize: "0.9375rem", fontWeight: 500, marginBottom: "16px", color: "#1E293B" }}>
                      Berapa usia Anda?
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "10px" }}>
                      {["<18", "18-25", "26-35", "36-50", ">50"].map((opt) => (
                        <button
                          key={opt}
                          className={`persona-opt-btn ${profile.ageGroup === opt ? "selected" : ""}`}
                          onClick={() => {
                            setProfile({ ...profile, ageGroup: opt });
                            setTimeout(handleNext, 300);
                          }}
                          style={{
                            textAlign: "center", padding: "16px", borderRadius: "16px",
                            border: "none", cursor: "pointer", fontSize: "0.9375rem", fontWeight: 500,
                            backgroundColor: profile.ageGroup === opt ? "#0F172A" : "rgba(241, 245, 249, 0.5)",
                            color: profile.ageGroup === opt ? "#FFFFFF" : "#475569",
                            transform: profile.ageGroup === opt ? "scale(0.98)" : "scale(1)",
                            boxShadow: profile.ageGroup === opt ? "0 4px 12px rgba(15, 23, 42, 0.15)" : "none"
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="s3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.3 }}>
                    <label style={{ display: "block", fontSize: "0.9375rem", fontWeight: 500, marginBottom: "16px", color: "#1E293B" }}>
                      Moda transportasi utama?
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {[
                        { val: "motorcycle", label: "Sepeda Motor" },
                        { val: "car", label: "Mobil Pribadi" },
                        { val: "public_transport", label: "Kendaraan Umum" },
                        { val: "walking", label: "Jalan Kaki / Sepeda" }
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          className={`persona-opt-btn ${profile.mainTransport === opt.val ? "selected" : ""}`}
                          onClick={() => {
                            setProfile({ ...profile, mainTransport: opt.val as TransportMode });
                            setTimeout(handleNext, 300);
                          }}
                          style={{
                            textAlign: "left", padding: "14px 20px", borderRadius: "16px",
                            border: "none", cursor: "pointer", fontSize: "0.9375rem", fontWeight: 500,
                            backgroundColor: profile.mainTransport === opt.val ? "#0F172A" : "rgba(241, 245, 249, 0.5)",
                            color: profile.mainTransport === opt.val ? "#FFFFFF" : "#475569",
                            transform: profile.mainTransport === opt.val ? "scale(0.98)" : "scale(1)",
                            boxShadow: profile.mainTransport === opt.val ? "0 4px 12px rgba(15, 23, 42, 0.15)" : "none"
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div key="s4" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.3 }}>
                    <label style={{ display: "block", fontSize: "0.9375rem", fontWeight: 500, marginBottom: "8px", color: "#1E293B" }}>
                      Kondisi kesehatan khusus?
                    </label>
                    <p style={{ fontSize: "0.8125rem", color: "#64748B", marginBottom: "16px", marginTop: 0 }}>
                      Opsional. (Misal: &quot;Asma&quot;, &quot;Mudah dehidrasi&quot;).
                    </p>
                    <textarea
                      style={{
                        width: "100%", padding: "16px", border: "none", borderRadius: "16px",
                        backgroundColor: "rgba(241, 245, 249, 0.5)", color: "#0F172A",
                        outline: "none", resize: "none", fontSize: "0.9375rem",
                        fontFamily: "inherit", boxSizing: "border-box",
                        transition: "all 0.3s ease"
                      }}
                      rows={3}
                      placeholder="Ketik di sini..."
                      value={profile.healthNotes}
                      onChange={(e) => setProfile({ ...profile, healthNotes: e.target.value })}
                      onFocus={(e) => { e.target.style.boxShadow = "0 0 0 1px rgba(15, 23, 42, 0.5)"; }}
                      onBlur={(e) => { e.target.style.boxShadow = "none"; }}
                    />
                    <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
                      <button
                        onClick={handleNext}
                        className="persona-action-btn"
                        style={{
                          padding: "12px 24px", backgroundColor: "#0F172A", color: "#FFFFFF",
                          border: "none", borderRadius: "16px", fontWeight: 500, fontSize: "0.9375rem",
                          cursor: "pointer", transition: "all 0.2s ease",
                          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)"
                        }}
                      >
                        Selesaikan
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div style={{
              padding: "20px 32px", backgroundColor: "rgba(241, 245, 249, 0.3)",
              display: "flex", alignItems: "flex-start", gap: "12px",
              borderTop: "1px solid rgba(226, 232, 240, 0.4)", backdropFilter: "blur(4px)"
            }}>
              <Shield size={16} color="#94A3B8" style={{ marginTop: "2px", flexShrink: 0 }} />
              <p style={{ fontSize: "0.75rem", lineHeight: 1.6, color: "#64748B", margin: 0 }}>
                Data kesehatan hanya digunakan untuk pemrosesan AI lokal pada sesi Anda, dan tidak disimpan di server permanen.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#FAFAFA" }}
          >
            <div
              style={{
                marginBottom: "32px", padding: "16px", backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "24px", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
                border: "1px solid rgba(255, 255, 255, 0.2)", boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                style={{ display: "flex" }}
              >
                <BrainCircuit size={48} color="#FAFAFA" strokeWidth={1.5} />
              </motion.div>
            </div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 500, letterSpacing: "-0.02em", marginBottom: "12px", margin: 0 }}>
              Sinkronisasi AI...
            </h3>
            <p style={{ textAlign: "center", maxWidth: "280px", color: "rgba(250, 250, 250, 0.7)", fontSize: "0.9375rem", lineHeight: 1.6, margin: 0 }}>
              SIGAP sedang menyesuaikan algoritma dengan profil kesehatan dan mobilitas Anda.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              style={{
                marginTop: "32px", display: "flex", alignItems: "center", gap: "8px",
                padding: "8px 16px", backgroundColor: "#FAFAFA", color: "#0F172A",
                borderRadius: "9999px", fontSize: "0.875rem", fontWeight: 500,
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)"
              }}
            >
              <CheckCircle2 size={16} />
              <span>Personalisasi Selesai</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
