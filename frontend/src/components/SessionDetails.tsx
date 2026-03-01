import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import axios from "axios";

// FloatingInput Component
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
        }}
      />
      <label
        className={`absolute left-0 top-0 text-xs font-semibold transition-all duration-300 pointer-events-none ${
          lifted
            ? "-translate-y-2.5 text-[#25CED1] text-[11px]"
            : "translate-y-3 text-[#b0b8c4] text-xs"
        }`}
      >
        {label} {suffix && <span className="text-[#b0b8c4]">{suffix}</span>}
      </label>
    </div>
  );
};

// Dummy components for missing ones
const VitalPill: React.FC<{ label: string; value: string; accent?: boolean }> = ({
  label,
  value,
  accent,
}) => (
  <div className={`p-3 rounded-xl border ${accent ? "border-[#25CED1]" : "border-gray-200"}`}>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-sm font-semibold">{value}</p>
  </div>
);

const SectionLabel: React.FC<{ label: string; icon?: React.ReactNode }> = ({ label, icon }) => (
  <div className="flex items-center gap-2 mb-2">
    {icon}
    <p className="text-sm font-bold text-[#25CED1]">{label}</p>
  </div>
);

const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  if (!status) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase bg-[#F4F4F4] text-[#9ca3af]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#9ca3af]" />
        PENDING
      </span>
    );
  }

  const cfg: Record<string, string> = {
    completed: "bg-[#25CED1]/10 text-[#0f766e] border border-[#25CED1]/30",
    in_progress: "bg-[#FF8A5B]/10 text-[#b45309] border border-[#FF8A5B]/35",
    scheduled: "bg-[#F4F4F4] text-[#6b7280] border border-[#e5e7eb]",
  };

  const label =
    status === "scheduled"
      ? "NOT STARTED"
      : status.replace("_", " ").toUpperCase();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase ${cfg[status] ?? cfg.scheduled}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === "completed"
            ? "bg-[#25CED1]"
            : status === "in_progress"
            ? "bg-[#FF8A5B] animate-pulse"
            : "bg-[#9ca3af]"
        }`}
      />
      {label}
    </span>
  );
};

// Session type
interface Session {
  _id: string;
  patient_id: {
    _id: string;
    name: string;
    email?: string;
    unit_id: string;
    dry_weight_kg: number;
  };
  machine_id: string;
  timestamps: { start: string; end: string };
  vitals: {
    pre_weight: number;
    post_weight?: number;
    pre_bp_sys: number;
    post_bp_sys?: number;
    pre_bp_dia: number;
    post_bp_dia?: number;
  };
  status?: string;
  nurse_notes?: string;
}

const SessionDetails: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [postWeight, setPostWeight] = useState<number>(0);
  const [postBpSys, setPostBpSys] = useState<number>(0);
  const [postBpDia, setPostBpDia] = useState<number>(0);
  const [nurseNotes, setNurseNotes] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState<string>("");

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/session/${sessionId}`);
        setSession(response.data.data || response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load session");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  const handleStartSession = async () => {
    if (!sessionId) return;
    setActionLoading(true);
    try {
      await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/schedule/update/${sessionId}`, {
        status: "in_progress",
      });
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
      await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/schedule/update/${sessionId}`, {
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
        (new Date(session.timestamps.end).getTime() -
          new Date(session.timestamps.start).getTime()) /
          3600000
      )
    : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');

        @keyframes sd-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes sd-blob-a {
          0%,100% { transform: translate3d(-40%, -40%, 0) scale(1);   filter: blur(40px); }
          50%     { transform: translate3d(-30%, -50%, 0) scale(1.08); filter: blur(44px); }
        }
        @keyframes sd-blob-b {
          0%,100% { transform: translate3d(40%, 40%, 0) scale(1);   filter: blur(44px); }
          50%     { transform: translate3d(30%, 50%, 0) scale(1.05); filter: blur(48px); }
        }
        .sd-card {
          animation: sd-fade-up 0.4s ease both;
        }
        .sd-blob-a {
          position: absolute;
          inset: auto auto 20% -10%;
          width: 260px;
          height: 260px;
          background: radial-gradient(circle at 30% 30%, rgba(37,206,209,0.6), transparent 60%);
          opacity: 0.7;
          animation: sd-blob-a 16s ease-in-out infinite;
        }
        .sd-blob-b {
          position: absolute;
          inset: 5% -8% auto auto;
          width: 260px;
          height: 260px;
          background: radial-gradient(circle at 70% 70%, rgba(255,138,91,0.55), transparent 60%);
          opacity: 0.7;
          animation: sd-blob-b 18s ease-in-out infinite;
        }
      `}</style>

      <div
        className="min-h-screen bg-gradient-to-b from-[#f5f5f7] via-[#ecf7ff] to-[#f5f5f7] relative overflow-hidden"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="sd-blob-a" />
        <div className="sd-blob-b" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 py-10">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#9ca3af] hover:text-[#25CED1] transition-colors duration-200 mb-4"
          >
            <span className="w-5 h-5 rounded-full bg-white/80 border border-black/5 flex items-center justify-center shadow-sm">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </span>
            Back to Sessions
          </button>

          {loading && (
            <div className="sd-card mt-6 bg-white/80 backdrop-blur-xl border border-white/70 rounded-3xl px-6 py-10 shadow-[0_18px_60px_rgba(15,23,42,0.08)] flex flex-col items-center gap-3">
              <div className="w-9 h-9 rounded-full border-2 border-[#25CED1]/60 border-t-transparent animate-spin" />
              <p className="text-xs text-[#6b7280] font-medium tracking-wide uppercase">
                Loading session…
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="sd-card mt-6 bg-[#FF8A5B]/6 border border-[#FF8A5B]/25 rounded-2xl px-4 py-3 flex items-center gap-2.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FF8A5B"
                strokeWidth="2.3"
                strokeLinecap="round"
              >
                <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <p className="text-xs text-[#b45309] font-medium">{error}</p>
            </div>
          )}

          {!loading && session && (
            <div className="sd-card mt-4 bg-white/80 backdrop-blur-xl border border-white/70 rounded-3xl shadow-[0_18px_60px_rgba(15,23,42,0.08)] overflow-hidden">
              {/* Header */}
              <div className="px-6 pt-6 pb-5 border-b border-black/[0.04] bg-gradient-to-r from-[#f5f5f7] via-[#ecf7ff] to-[#fdf2ec]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-[#25CED1]/10 border border-[#25CED1]/35 flex items-center justify-center text-[12px] font-bold text-[#0f766e]">
                      {getInitials(session.patient_id.name)}
                    </div>
                    <div>
                      <p
                        className="text-[22px] text-[#111827] leading-none tracking-[-0.02em]"
                        style={{ fontFamily: "'DM Serif Display', serif", fontStyle: "italic" }}
                      >
                        {session.patient_id.name}
                      </p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[#9ca3af] font-semibold">
                        Unit {session.patient_id.unit_id}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={session.status} />
                    <p className="text-[11px] text-[#9ca3af]">
                      Dry weight{" "}
                      <span className="font-semibold text-[#111827]">
                        {session.patient_id.dry_weight_kg}
                      </span>
                      <span className="text-[10px] text-[#9ca3af] ml-0.5">kg</span>
                    </p>
                    {session.machine_id && (
                      <p className="text-[11px] text-[#9ca3af]">
                        Machine{" "}
                        <span className="font-semibold text-[#111827]">
                          {session.machine_id}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-6">
                {/* Timing pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <VitalPill
                    label="Start"
                    value={new Date(session.timestamps.start).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  />
                  <VitalPill
                    label="End"
                    value={new Date(session.timestamps.end).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  />
                  <VitalPill label="Duration" value={`${duration} hrs`} accent />
                </div>

                {/* Actions */}
                {session.status !== "in_progress" && session.status !== "completed" && (
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <p className="text-[11px] text-[#9ca3af]">
                      Session has not yet started. Once the patient is on the machine, mark it{" "}
                      <span className="font-semibold text-[#374151]">In Progress</span>.
                    </p>
                    <button
                      onClick={handleStartSession}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold text-white bg-gradient-to-r from-[#25CED1] to-[#1db8bb] shadow-[0_8px_18px_rgba(37,206,209,0.45)] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {actionLoading ? (
                        <>
                          <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          Starting…
                        </>
                      ) : (
                        <>
                          Start Session
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {session.status === "in_progress" && (
                  <div className="mt-1 space-y-4">
                    <SectionLabel
                      label="Post‑session vitals"
                      icon={
                        <span className="w-5 h-5 rounded-full bg-[#25CED1]/10 border border-[#25CED1]/40 flex items-center justify-center">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#25CED1"
                            strokeWidth="2.3"
                            strokeLinecap="round"
                          >
                            <path d="M4 12h3l2 7 4-14 2 7h3" />
                          </svg>
                        </span>
                      }
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FloatingInput
                        label="Post Weight"
                        value={postWeight || ""}
                        onChange={setPostWeight}
                        suffix="kg"
                      />
                      <FloatingInput
                        label="Systolic BP"
                        value={postBpSys || ""}
                        onChange={setPostBpSys}
                        suffix="mmHg"
                      />
                      <FloatingInput
                        label="Diastolic BP"
                        value={postBpDia || ""}
                        onChange={setPostBpDia}
                        suffix="mmHg"
                      />
                    </div>

                    <div>
                      <SectionLabel label="Nurse notes" />
                      <textarea
                        placeholder="Summarise events, complications, access, and hand‑off notes…"
                        value={nurseNotes}
                        onChange={(e) => setNurseNotes(e.target.value)}
                        rows={3}
                        className="w-full mt-1 text-sm text-[#111827] placeholder-[#c4cdd6] rounded-2xl border border-black/10 bg-black/[0.02] px-3.5 py-2.5 outline-none focus:border-[#25CED1] focus:ring-2 focus:ring-[#25CED1]/15 transition-all duration-200"
                      />
                    </div>

                    {formError && (
                      <p className="text-[11px] text-[#b91c1c] bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                        {formError}
                      </p>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={handleEndSession}
                        disabled={actionLoading}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold text-white bg-gradient-to-r from-[#f97373] to-[#ef4444] shadow-[0_8px_18px_rgba(248,113,113,0.45)] disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {actionLoading ? (
                          <>
                            <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                            Ending…
                          </>
                        ) : (
                          <>
                            End Session
                            <svg
                              width="11"
                              height="11"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              strokeWidth="2.3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M5 12h14" />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {session.status === "completed" && session.nurse_notes && (
                  <div className="pt-1">
                    <SectionLabel label="Nurse notes" />
                    <p className="mt-1 text-sm text-[#374151] leading-relaxed bg-black/[0.02] rounded-2xl px-3.5 py-2.5">
                      {session.nurse_notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SessionDetails;