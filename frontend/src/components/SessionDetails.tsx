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
  timestamps: {
    start: string;
    end: string;
  };
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
      await axios.patch(
        `http://localhost:3001/api/schedule/update/${sessionId}`,
        { status: "in_progress" }
      );
      window.location.reload();
    } catch {
      alert("Failed to start session");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!postWeight || !postBpSys || !postBpDia) {
      alert("Please fill all post-session vitals");
      return;
    }

    setActionLoading(true);
    try {
      await axios.patch(
        `http://localhost:3001/api/schedule/update/${sessionId}`,
        {
          status: "completed",
          vitals: {
            post_weight: postWeight,
            post_bp_sys: postBpSys,
            post_bp_dia: postBpDia,
          },
          nurse_notes: nurseNotes,
        }
      );
      navigate("/");
    } catch {
      alert("Failed to end session");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading)
    return <div className="p-6 text-gray-600">Loading session...</div>;

  if (error)
    return <div className="p-6 text-red-500 font-medium">{error}</div>;

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="bg-white shadow-lg rounded-xl w-full max-w-2xl p-6">
        <h2 className="text-2xl font-bold mb-4">Session Details</h2>

        <div className="mb-4">
          <p className="text-lg font-semibold">
            Patient: {session.patient_id?.name}
          </p>
          <p className="text-sm text-gray-500">
            Status:{" "}
            <span className="font-medium text-blue-600">
              {session.status || "Not Started"}
            </span>
          </p>
        </div>

        <div className="border rounded-lg p-4 bg-gray-50 mb-4">
          <h4 className="font-semibold mb-2">Pre Session Vitals</h4>
          <p>Weight: {session.vitals.pre_weight} kg</p>
          <p>
            BP: {session.vitals.pre_bp_sys}/{session.vitals.pre_bp_dia}
          </p>
        </div>

        {/* Start Button */}
        {session.status !== "in_progress" &&
          session.status !== "completed" && (
            <button
              onClick={handleStartSession}
              disabled={actionLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition disabled:opacity-50"
            >
              {actionLoading ? "Starting..." : "Start Session"}
            </button>
          )}

        {/* End Session Form */}
        {session.status === "in_progress" && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">End Session</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="number"
                placeholder="Post Weight"
                value={postWeight}
                onChange={(e) => setPostWeight(Number(e.target.value))}
                className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
              />

              <input
                type="number"
                placeholder="Post BP Sys"
                value={postBpSys}
                onChange={(e) => setPostBpSys(Number(e.target.value))}
                className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
              />

              <input
                type="number"
                placeholder="Post BP Dia"
                value={postBpDia}
                onChange={(e) => setPostBpDia(Number(e.target.value))}
                className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            <textarea
              placeholder="Nurse Notes"
              value={nurseNotes}
              onChange={(e) => setNurseNotes(e.target.value)}
              className="w-full border rounded-lg p-2 mb-4 focus:ring-2 focus:ring-blue-400 outline-none"
              rows={4}
            />

            <button
              onClick={handleEndSession}
              disabled={actionLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition disabled:opacity-50"
            >
              {actionLoading ? "Ending..." : "End Session"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionDetails;