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

const StatusBadge: React.FC<{ status?: string }> = ({ status }) => (
  <span
    className={`px-2 py-1 rounded-lg text-xs font-bold ${
      status === "completed"
        ? "bg-green-100 text-green-700"
        : status === "in_progress"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-gray-100 text-gray-700"
    }`}
  >
    {status || "pending"}
  </span>
);

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
    <div className="min-h-screen bg-[#F4F4F4] relative overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-xs font-semibold text-[#9ca3af] hover:text-[#25CED1] transition-colors duration-200 mb-6"
        >
          Back
        </button>

        {loading && <p>Loading session…</p>}
        {error && !loading && <p className="text-red-500">{error}</p>}

        {!loading && session && (
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold">{session.patient_id.name}</h2>
            <p>Unit: {session.patient_id.unit_id}</p>
            <p>Dry Weight: {session.patient_id.dry_weight_kg} kg</p>
            <p>Status: {session.status}</p>

            <div className="mt-4 grid grid-cols-3 gap-3">
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

            {session.status !== "in_progress" && session.status !== "completed" && (
              <button onClick={handleStartSession} className="mt-4 px-4 py-2 bg-teal-500 text-white rounded">
                Start Session
              </button>
            )}

            {session.status === "in_progress" && (
              <div className="mt-4 space-y-4">
                <FloatingInput label="Post Weight" value={postWeight} onChange={setPostWeight} suffix="kg" />
                <FloatingInput label="Systolic BP" value={postBpSys} onChange={setPostBpSys} suffix="mmHg" />
                <FloatingInput label="Diastolic BP" value={postBpDia} onChange={setPostBpDia} suffix="mmHg" />
                <textarea
                  placeholder="Nurse notes"
                  value={nurseNotes}
                  onChange={(e) => setNurseNotes(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                {formError && <p className="text-red-500">{formError}</p>}
                <button onClick={handleEndSession} className="px-4 py-2 bg-red-500 text-white rounded">
                  End Session
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionDetails;