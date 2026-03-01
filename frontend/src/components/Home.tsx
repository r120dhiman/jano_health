import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";

interface Patient {
  _id: string;
  name: string;
  dry_weight_kg: number;
  unit_id: string;
}

interface Session {
  _id: string;
  timestamps: {
    start: string;
    end: string;
  };
  vitals: {
    pre_weight: number;
    pre_bp_sys: number;
    pre_bp_dia: number;
  };
  patient_id: Patient;
  unit_id: string;
  nurse_notes: string;
  anomalies: string[];
  createdAt: string;
}

interface ApiResponse {
  count: number;
  sessions: Session[];
}

const Home: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/session");
        if (!response.ok) {
          throw new Error("Failed to fetch sessions");
        }

        const data: ApiResponse = await response.json();
        setSessions(data.sessions);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (loading) return <div style={{ padding: "20px" }}>Loading sessions...</div>;
  if (error) return <div style={{ padding: "20px", color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>All Sessions ({sessions.length})</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
          <thead>
            <tr style={{ background: '#f3f3f3' }}>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>Patient</th>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>Status</th>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>Session Start</th>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>Pre BP</th>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>Pre Weight</th>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>Post BP</th>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>Post Weight</th>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr
                key={session._id}
                onClick={() => navigate(`/session/${session._id}`)}
                style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'white')}
              >
                <td style={{ padding: 8, border: '1px solid #ddd' }}>{session.patient_id?.name}</td>
                <td style={{ padding: 8, border: '1px solid #ddd', textTransform: 'capitalize' }}>{session.status || 'N/A'}</td>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>{new Date(session.timestamps.start).toLocaleString()}</td>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>{session.vitals.pre_bp_sys}/{session.vitals.pre_bp_dia}</td>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>{session.vitals.pre_weight}</td>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>{session.vitals.post_bp_sys !== undefined && session.vitals.post_bp_dia !== undefined ? `${session.vitals.post_bp_sys}/${session.vitals.post_bp_dia}` : '-'}</td>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>{session.vitals.post_weight !== undefined ? session.vitals.post_weight : '-'}</td>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>{session.nurse_notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;