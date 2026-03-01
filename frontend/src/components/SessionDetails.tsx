import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import axios from "axios";

interface Patient {
  _id: string;
  name: string;
  dry_weight_kg: number;
  unit_id: string;
}

interface Session {
  _id: string;
  status?: string;
  timestamps: { start: string; end: string };
  vitals: {
    pre_weight: number;
    pre_bp_sys: number;
    pre_bp_dia: number;
    post_weight?: number;
    post_bp_sys?: number;
    post_bp_dia?: number;
  };
  patient_id: Patient;
  nurse_notes?: string;
}

/* ─── Floating label input ─── */
const FloatingInput: React.FC<{
  label: string;
  type?: string;
  value: number | string;
  onChange: (v: number) => void;
  suffix?: string;
}> = ({ label, type = "number", value, onChange, suffix }) => {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value !== "";

  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-transparent border-0 border-b-2 outline-none pt-5 pb-1.5 text-sm font-semibold text-[#1a1a2e] transition-all duration-300"
        style={{
          borderBottomColor: focused ? "#25CED1" : "rgba(37,206,209,0.25)",
          fontFamily: "'DM Sans', sans-serif",
          paddingRight: suffix ? "36px" : "0",
        }}
      />
      <label
        className="absolute left-0 pointer-events-none transition-all duration-250"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          top: lifted ? "2px" : "20px",
          fontSize: lifted ? "10px" : "13px",
          color: focused ? "#25CED1" : "#9ca3af",
          fontWeight: lifted ? 700 : 400,
          letterSpacing: lifted ? "0.1em" : "0",
          textTransform: lifted ? "uppercase" : "none",
        }}
      >
        {label}
      </label>
      {suffix && (
        <span className="absolute right-0 bottom-2 text-[10px] text-[#25CED1]/60"
          style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {suffix}
        </span>
      )}
      <span
        className="absolute bottom-0 left-0 h-0.5 rounded-full transition-all duration-300"
        style={{
          width: focused ? "100%" : "0%",
          background: "linear-gradient(90deg, #25CED1, #FF8A5B)",
        }}
      />
    </div>
  );
};

/* ─── Vital stat pill ─── */
const VitalPill: React.FC<{ label: string; value: string; accent?: boolean }> = ({ label, value, accent }) => (
  <div className={`flex flex-col gap-1 px-4 py-3 rounded-xl
    ${accent
      ? "bg-[#25CED1]/8 border border-[#25CED1]/20"
      : "bg-[#F4F4F4]"
    }`}>
    <span className={`text-[9px] font-bold uppercase tracking-widest
      ${accent ? "text-[#25CED1]" : "text-[#b0b8c4]"}`}>
      {label}
    </span>
    <span className="text-sm font-semibold text-[#1a1a2e]">{value}</span>
  </div>
);

/* ─── Status badge ─── */
const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  const cfg: Record<string, string> = {
    completed:   "bg-[#25CED1]/10 text-[#25CED1]  border-[#25CED1]/25",
    in_progress: "bg-[#FF8A5B]/10 text-[#FF8A5B]  border-[#FF8A5B]/25",
    scheduled:   "bg-[#F4F4F4]   text-[#9ca3af]   border-[#e5e7eb]",
  };
  const dots: Record<string, string> = {
    completed: "bg-[#25CED1]",
    in_progress: "bg-[#FF8A5B] animate-pulse",
    scheduled: "bg-[#9ca3af]",
  };
  const key = status ?? "scheduled";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${cfg[key] ?? cfg.scheduled}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[key] ?? dots.scheduled}`} />
      {(status ?? "Not Started").replace("_", " ")}
    </span>
  );
};

/* ─── Section label ─── */
const SectionLabel: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <div className="flex items-center gap-2.5 mb-5">
    <div className="w-7 h-7 rounded-[10px] bg-[#25CED1]/10 border border-[#25CED1]/20
                    flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <span className="text-sm text-[#1a1a2e]"
      style={{ fontFamily: "'DM Serif Display', serif", fontStyle: "italic" }}>
      {label}
    </span>
    <div className="flex-1 h-px bg-gradient-to-r from-[#25CED1]/25 to-transparent" />
  </div>
);

/* ─── Main ─── */
const SessionDetails: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [postWeight, setPostWeight] = useState<number | "">("");
  const [postBpSys, setPostBpSys] = useState<number | "">("");
  const [postBpDia, setPostBpDia] = useState<number | "">("");
  const [nurseNotes, setNurseNotes] = useState("");
  const [notesFocused, setNotesFocused] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/session/${sessionId}`);
        setSession(res.data.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch session");
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  const handleStartSession = async () => {
    setActionLoading(true);
    try {
      await axios.patch(`http://localhost:3001/api/schedule/update/${sessionId}`, { status: "in_progress" });
      window.location.reload();
    } catch {
      setError("Failed to start session");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!postWeight || !postBpSys || !postBpDia) {
      setFormError("Please fill in all post-session vitals before ending.");
      return;
    }
    setFormError("");
    setActionLoading(true);
    try {
      await axios.patch(`http://localhost:3001/api/schedule/update/${sessionId}`, {
        status: "completed",
        vitals: { post_weight: postWeight, post_bp_sys: postBpSys, post_bp_dia: postBpDia },
        nurse_notes: nurseNotes,
      });
      navigate("/");
    } catch {
      setError("Failed to end session");
    } finally {
      setActionLoading(false);
    }
  };

  const getInitials = (name: string) =>
    name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() ?? "?";

  const duration = session
    ? Math.round(
        (new Date(session.timestamps.end).getTime() - new Date(session.timestamps.start).getTime()) / 3600000
      )
    : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');

        @keyframes shimmer-bar {
          0%   { background-position: -400% center; }
          100% { background-position: 400% center; }
        }
        @keyframes morph-a {
          0%,100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          33%      { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; transform: scale(1.04); }
          66%      { border-radius: 70% 30% 50% 50% / 30% 50% 70% 50%; transform: scale(0.97); }
        }
        @keyframes morph-b {
          0%,100% { border-radius: 40% 60% 60% 40% / 40% 50% 60% 50%; }
          50%      { border-radius: 60% 40% 30% 60% / 60% 30% 60% 40%; transform: scale(1.06); }
        }
        @keyframes card-in {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes section-in {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-glow {
          0%,100% { box-shadow: 0 0 0 0 rgba(37,206,209,0.35); }
          50%      { box-shadow: 0 0 0 8px rgba(37,206,209,0); }
        }
        @keyframes error-shake {
          0%,100% { transform: translateX(0); }
          20%,60% { transform: translateX(-5px); }
          40%,80% { transform: translateX(5px); }
        }

        .shimmer-top {
          height: 3px;
          background: linear-gradient(90deg, #25CED1 0%, #FF8A5B 40%, #25CED1 80%, #FF8A5B 100%);
          background-size: 400% 100%;
          animation: shimmer-bar 3.5s linear infinite;
        }
        .card-appear   { animation: card-in 0.5s cubic-bezier(0.34,1.2,0.64,1) both; }
        .section-appear { animation: section-in 0.4s ease both; }
        .blob-a { animation: morph-a 10s ease-in-out infinite; }
        .blob-b { animation: morph-b 13s ease-in-out infinite; }
        .icon-pulse { animation: pulse-glow 2.5s ease-in-out infinite; }
        .form-error { animation: error-shake 0.4s ease; }

        .btn-start {
          transition: all 0.25s cubic-bezier(0.34,1.2,0.64,1);
          position: relative; overflow: hidden;
        }
        .btn-start:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(37,206,209,0.35) !important; }
        .btn-start:active { transform: translateY(0); }

        .btn-end {
          transition: all 0.25s cubic-bezier(0.34,1.2,0.64,1);
          position: relative; overflow: hidden;
        }
        .btn-end:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255,138,91,0.38) !important; }
        .btn-end:active { transform: translateY(0); }

        .notes-area:focus {
          outline: none;
          background: white !important;
          border-color: #25CED1 !important;
          box-shadow: 0 0 0 4px rgba(37,206,209,0.1);
        }
      `}</style>

      <div className="min-h-screen bg-[#F4F4F4] relative overflow-hidden"
        style={{ fontFamily: "'DM Sans', sans-serif" }}>


        <div className="relative z-10 max-w-2xl mx-auto px-4 py-10">

          {/* Back link */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-xs font-semibold text-[#9ca3af]
                       hover:text-[#25CED1] transition-colors duration-200 mb-6 group"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              className="group-hover:-translate-x-0.5 transition-transform duration-200">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to Sessions
          </button>

          {/* ── Loading ── */}
          {loading && (
            <div className="card-appear bg-white rounded-2xl border border-[#25CED1]/10 shadow-sm overflow-hidden">
              <div className="shimmer-top" />
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#25CED1]/8 border border-[#25CED1]/15 flex items-center justify-center">
                  <svg style={{ animation: "spin 0.8s linear infinite" }} width="20" height="20"
                    viewBox="0 0 24 24" fill="none" stroke="#25CED1" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                </div>
                <p className="text-sm text-[#b0b8c4]">Loading session…</p>
              </div>
            </div>
          )}

          {/* ── Error ── */}
          {error && !loading && (
            <div className="card-appear bg-white rounded-2xl border border-[#FF8A5B]/25 shadow-sm overflow-hidden">
              <div style={{ height: 3, background: "#FF8A5B" }} />
              <div className="flex items-start gap-4 px-7 py-6">
                <div className="w-10 h-10 rounded-xl bg-[#FF8A5B]/10 border border-[#FF8A5B]/20
                                flex items-center justify-center flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="#FF8A5B" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1a1a2e] mb-0.5">Something went wrong</p>
                  <p className="text-xs text-[#b0b8c4]">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Main Card ── */}
          {!loading && !error && session && (
            <div className="card-appear bg-white rounded-2xl overflow-hidden border border-[#25CED1]/10
                            shadow-[0_4px_28px_rgba(37,206,209,0.09),0_1px_4px_rgba(0,0,0,0.04)]">
              <div className="shimmer-top" />

              {/* Header */}
              <div className="px-7 pt-7 pb-5 border-b border-[#F4F4F4]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="icon-pulse w-14 h-14 rounded-2xl bg-[#25CED1]/10 border border-[#25CED1]/20
                                    flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-[#25CED1]"
                        style={{ fontFamily: "'DM Serif Display', serif", fontStyle: "italic" }}>
                        {getInitials(session.patient_id?.name ?? "")}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#25CED1] mb-1">
                        ◆ Patient
                      </p>
                      <h2 className="text-2xl text-[#1a1a2e] leading-tight"
                        style={{ fontFamily: "'DM Serif Display', serif", fontStyle: "italic" }}>
                        {session.patient_id?.name}
                      </h2>
                      <p className="text-xs text-[#b0b8c4] mt-1">
                        Unit <span className="font-semibold text-[#1a1a2e]">{session.patient_id?.unit_id}</span>
                        <span className="mx-2 text-[#e5e7eb]">·</span>
                        Dry weight <span className="font-semibold text-[#1a1a2e]">{session.patient_id?.dry_weight_kg} kg</span>
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={session.status} />
                </div>
              </div>

              {/* Body */}
              <div className="px-7 py-6 space-y-7">

                {/* Timestamps */}
                <div className="section-appear" style={{ animationDelay: "60ms" }}>
                  <div className="grid grid-cols-3 gap-3">
                    <VitalPill
                      label="Start"
                      value={new Date(session.timestamps.start).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    />
                    <VitalPill
                      label="End"
                      value={new Date(session.timestamps.end).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    />
                    <VitalPill label="Duration" value={`${duration} hrs`} accent />
                  </div>
                </div>

                {/* Pre-session vitals */}
                <div className="section-appear" style={{ animationDelay: "120ms" }}>
                  <SectionLabel
                    label="Pre-Session Vitals"
                    icon={
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke="#25CED1" strokeWidth="2" strokeLinecap="round">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                      </svg>
                    }
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <VitalPill label="Weight" value={`${session.vitals.pre_weight} kg`} accent />
                    <VitalPill
                      label="Blood Pressure"
                      value={`${session.vitals.pre_bp_sys}/${session.vitals.pre_bp_dia} mmHg`}
                    />
                  </div>
                </div>

                {/* Post vitals (if completed) */}
                {session.status === "completed" &&
                  session.vitals.post_weight !== undefined && (
                  <div className="section-appear" style={{ animationDelay: "180ms" }}>
                    <SectionLabel
                      label="Post-Session Vitals"
                      icon={
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                          stroke="#25CED1" strokeWidth="2" strokeLinecap="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <path d="M22 4 12 14.01l-3-3" />
                        </svg>
                      }
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <VitalPill label="Post Weight" value={`${session.vitals.post_weight} kg`} accent />
                      <VitalPill
                        label="Post BP"
                        value={`${session.vitals.post_bp_sys}/${session.vitals.post_bp_dia} mmHg`}
                      />
                    </div>
                  </div>
                )}

                {/* Nurse notes (read-only if completed) */}
                {session.status === "completed" && session.nurse_notes && (
                  <div className="section-appear" style={{ animationDelay: "220ms" }}>
                    <SectionLabel
                      label="Nurse Notes"
                      icon={
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                          stroke="#25CED1" strokeWidth="2" strokeLinecap="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                        </svg>
                      }
                    />
                    <p className="text-sm text-[#374151] bg-[#F4F4F4] rounded-xl px-4 py-3 leading-relaxed">
                      {session.nurse_notes}
                    </p>
                  </div>
                )}

                {/* ── Start Session Button ── */}
                {!session.status || (!["in_progress", "completed"].includes(session.status)) ? (
                  <div className="section-appear pt-1" style={{ animationDelay: "180ms" }}>
                    <button
                      onClick={handleStartSession}
                      disabled={actionLoading}
                      className="btn-start w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl
                                 text-white text-sm font-bold tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{
                        background: "linear-gradient(135deg, #25CED1 0%, #1db8bb 100%)",
                        boxShadow: "0 4px 16px rgba(37,206,209,0.28)",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {actionLoading ? (
                        <>
                          <svg style={{ animation: "spin 0.8s linear infinite" }} width="14" height="14"
                            viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                          </svg>
                          Starting…
                        </>
                      ) : (
                        <>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                          Start Session
                        </>
                      )}
                    </button>
                  </div>
                ) : null}

                {/* ── End Session Form ── */}
                {session.status === "in_progress" && (
                  <div className="section-appear space-y-6" style={{ animationDelay: "180ms" }}>
                    <SectionLabel
                      label="End Session — Post Vitals"
                      icon={
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                          stroke="#FF8A5B" strokeWidth="2" strokeLinecap="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <path d="M9 12h6M12 9v6" />
                        </svg>
                      }
                    />

                    {/* Form error */}
                    {formError && (
                      <div className="form-error flex items-center gap-2.5 bg-[#FF8A5B]/8 border border-[#FF8A5B]/25
                                      rounded-xl px-4 py-3">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                          stroke="#FF8A5B" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        </svg>
                        <p className="text-xs font-medium text-[#FF8A5B]">{formError}</p>
                      </div>
                    )}

                    {/* Inputs grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                      <FloatingInput
                        label="Post Weight"
                        value={postWeight}
                        onChange={setPostWeight}
                        suffix="kg"
                      />
                      <FloatingInput
                        label="Systolic BP"
                        value={postBpSys}
                        onChange={setPostBpSys}
                        suffix="mmHg"
                      />
                      <FloatingInput
                        label="Diastolic BP"
                        value={postBpDia}
                        onChange={setPostBpDia}
                        suffix="mmHg"
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#25CED1] mb-3">
                        Nurse Notes
                      </p>
                      <textarea
                        placeholder="Add observations, concerns, or care notes…"
                        value={nurseNotes}
                        rows={3}
                        onChange={(e) => setNurseNotes(e.target.value)}
                        onFocus={() => setNotesFocused(true)}
                        onBlur={() => setNotesFocused(false)}
                        className="notes-area w-full bg-[#F4F4F4] rounded-2xl px-4 py-3.5 text-sm text-[#374151]
                                   placeholder-[#c4cdd6] resize-none transition-all duration-250"
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          border: `1.5px solid ${notesFocused ? "#25CED1" : "transparent"}`,
                          lineHeight: 1.7,
                        }}
                      />
                    </div>

                    {/* End session button */}
                    <button
                      onClick={handleEndSession}
                      disabled={actionLoading}
                      className="btn-end w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl
                                 text-white text-sm font-bold tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{
                        background: "linear-gradient(135deg, #FF8A5B 0%, #f06030 100%)",
                        boxShadow: "0 4px 16px rgba(255,138,91,0.28)",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {actionLoading ? (
                        <>
                          <svg style={{ animation: "spin 0.8s linear infinite" }} width="14" height="14"
                            viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                          </svg>
                          Ending…
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <path d="M9 9l6 6M15 9l-6 6" />
                          </svg>
                          End Session
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-7 py-4 border-t border-[#F4F4F4] flex items-center justify-between
                              bg-gradient-to-b from-transparent to-[#F4F4F4]/40">
                <p className="text-[10px] text-[#b0b8c4] font-medium uppercase tracking-widest">
                  Session ID: <span className="text-[#1a1a2e]">{sessionId?.slice(-8)}</span>
                </p>
                <div className="flex gap-1.5 items-center">
                  <div className="w-5 h-1.5 rounded-full bg-[#25CED1]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#25CED1]/20" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#25CED1]/20" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SessionDetails;