import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ANOMALY_LABELS } from "../config/rules";

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
    post_bp_sys?: number;
    post_bp_dia?: number;
    post_weight?: number;
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


const getInitials = (name: string) =>
  name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() ?? "?";

const avatarColors = [
  "bg-[#25CED1]/10 text-[#25CED1] border-[#25CED1]/25",
  "bg-[#FF8A5B]/10 text-[#FF8A5B] border-[#FF8A5B]/25",
  "bg-[#1db8bb]/10 text-[#1db8bb] border-[#1db8bb]/25",
];

const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  if (!status || status === "N/A")
    return <span className="text-xs text-[#b0b8c4] font-medium">—</span>;

  const cfg: Record<string, string> = {
    completed:   "bg-[#25CED1]/10 text-[#25CED1]   border border-[#25CED1]/25",
    in_progress: "bg-[#FF8A5B]/10 text-[#FF8A5B]   border border-[#FF8A5B]/25",
    scheduled:   "bg-[#F4F4F4]    text-[#9ca3af]   border border-[#e5e7eb]",
  };
  const icons: Record<string, React.ReactNode> = {
    completed:   <span className="w-1.5 h-1.5 rounded-full bg-[#25CED1] inline-block" />,
    in_progress: <span className="w-1.5 h-1.5 rounded-full bg-[#FF8A5B] inline-block animate-pulse" />,
    scheduled:   <span className="w-1.5 h-1.5 rounded-full bg-[#9ca3af] inline-block" />,
  };

  const label =
    status === "scheduled"
      ? "NOT STARTED"
      : status.replace("_", " ").toUpperCase();

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${cfg[status] ?? cfg.scheduled}`}>
      {icons[status]}
      {label}
    </span>
  );
};

const BPDisplay: React.FC<{ sys?: number; dia?: number }> = ({ sys, dia }) =>
  sys !== undefined && dia !== undefined ? (
    <span className="font-semibold text-[#1a1a2e] text-sm">
      {sys}<span className="text-[#b0b8c4] font-normal">/</span>{dia}
      <span className="text-[10px] text-[#b0b8c4] font-normal ml-1">mmHg</span>
    </span>
  ) : (
    <span className="text-[#b0b8c4] text-sm">—</span>
  );

const SkeletonRow = () => (
  <tr className="border-b border-[#F4F4F4]">
    {Array.from({ length: 8 }).map((_, i) => (
      <td key={i} className="px-5 py-4">
        <div className="h-3.5 bg-[#F4F4F4] rounded-full animate-pulse" style={{ width: `${50 + (i * 17) % 40}%` }} />
      </td>
    ))}
  </tr>
);


const Home: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [showAnomaliesOnly, setShowAnomaliesOnly] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/session`);
        if (!res.ok) throw new Error("Failed to fetch sessions");
        const data: ApiResponse = await res.json();
        setSessions(data.sessions);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  let filtered = sessions.filter((s) =>
    [s.patient_id?.name, s.unit_id, s.status, s.nurse_notes].some((v) =>
      v?.toLowerCase().includes(search.toLowerCase())
    )
  );
  if (showAnomaliesOnly) {
    filtered = filtered.filter((s) => Array.isArray(s.anomalies) && s.anomalies.length > 0);
  }

  const completed   = sessions.filter((s) => s.status === "completed").length;
  const inProgress  = sessions.filter((s) => s.status === "in_progress").length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');

        @keyframes shimmer-bar {
          0%   { background-position: -400% center; }
          100% { background-position: 400% center; }
        }
        @keyframes fade-down {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
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
        @keyframes row-in {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .shimmer-top {
          height: 3px;
          background: linear-gradient(90deg, #25CED1 0%, #FF8A5B 40%, #25CED1 80%, #FF8A5B 100%);
          background-size: 400% 100%;
          animation: shimmer-bar 3.5s linear infinite;
        }
        .header-appear { animation: fade-down 0.4s ease both; }
        .table-appear  { animation: fade-up 0.45s ease both 0.1s; }
        .blob-a { animation: morph-a 10s ease-in-out infinite; }
        .blob-b { animation: morph-b 13s ease-in-out infinite; }
        .session-row { animation: row-in 0.35s ease both; }

        .th-cell {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #b0b8c4;
          padding: 14px 20px;
          text-align: left;
          white-space: nowrap;
          border-bottom: 1px solid rgba(37,206,209,0.1);
        }
        .td-cell {
          padding: 14px 20px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #374151;
          white-space: nowrap;
          border-bottom: 1px solid #F4F4F4;
          transition: background 0.2s;
        }
      `}</style>

      <div className="min-h-screen bg-[#F4F4F4] relative overflow-hidden"
        style={{ fontFamily: "'DM Sans', sans-serif" }}>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-10">

          <div className="header-appear mb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#25CED1] mb-1">
                  ◆ Dialysis Center
                </p>
                <h1 className="text-4xl text-[#1a1a2e] leading-tight"
                  style={{ fontFamily: "'DM Serif Display', serif", fontStyle: "italic" }}>
                  Sessions
                </h1>
                <p className="text-xs text-[#b0b8c4] mt-1.5">
                  {loading ? "Fetching records…" : `${sessions.length} total session${sessions.length !== 1 ? "s" : ""}`}
                </p>
              </div>

              {!loading && (
                <div className="flex gap-3 flex-wrap">
                  <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-[#25CED1]/15 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-[#25CED1]" />
                    <span className="text-xs font-semibold text-[#1a1a2e]">{completed}</span>
                    <span className="text-xs text-[#b0b8c4]">Completed</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-[#FF8A5B]/15 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-[#FF8A5B] animate-pulse" />
                    <span className="text-xs font-semibold text-[#1a1a2e]">{inProgress}</span>
                    <span className="text-xs text-[#b0b8c4]">In Progress</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-[#e5e7eb] shadow-sm">
                    <span className="text-xs font-semibold text-[#1a1a2e]">{sessions.length}</span>
                    <span className="text-xs text-[#b0b8c4]">Total</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="table-appear bg-white rounded-2xl overflow-hidden border border-[#25CED1]/10
                          shadow-[0_4px_24px_rgba(37,206,209,0.08),0_1px_4px_rgba(0,0,0,0.04)]">
            <div className="shimmer-top" />

            <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[#F4F4F4]">
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2.5 bg-[#F4F4F4] rounded-xl px-3.5 py-2 border transition-all duration-300 w-72
                                 ${searchFocused ? "border-[#25CED1] bg-white shadow-[0_0_0_4px_rgba(37,206,209,0.1)]" : "border-transparent"}`}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke={searchFocused ? "#25CED1" : "#9ca3af"} strokeWidth="2" strokeLinecap="round"
                    className="flex-shrink-0 transition-colors duration-200">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search sessions…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className="flex-1 bg-transparent text-xs text-[#1a1a2e] placeholder-[#c4cdd6] outline-none"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  />
                  {search && (
                    <button onClick={() => setSearch("")}
                      className="text-[#9ca3af] hover:text-[#FF8A5B] transition-colors text-base leading-none">×</button>
                  )}
                </div>
                <button
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg border text-xs font-semibold transition
                    ${showAnomaliesOnly ? 'bg-[#FF8A5B]/10 border-[#FF8A5B] text-[#FF8A5B]' : 'bg-[#F4F4F4] border-[#e5e7eb] text-[#b0b8c4] hover:border-[#25CED1] hover:text-[#25CED1]'}`}
                  onClick={() => setShowAnomaliesOnly((v) => !v)}
                  title="Show only sessions with anomalies"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="inline-block">
                    <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  Anomalies
                </button>
              </div>
              {!loading && (
                <p className="text-xs text-[#b0b8c4] shrink-0">
                  <span className="font-semibold text-[#25CED1]">{filtered.length}</span> result{filtered.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-3 mx-6 my-4 bg-[#FF8A5B]/6 border border-[#FF8A5B]/25 rounded-xl px-4 py-3">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF8A5B" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <p className="text-xs font-medium text-[#FF8A5B]">{error}</p>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    {["Patient", "Status", "Session Start", "Pre BP", "Pre Weight", "Post BP", "Post Weight", "Notes"].map((h) => (
                      <th key={h} className="th-cell">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-[#25CED1]/8 border border-[#25CED1]/15 flex items-center justify-center">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#25CED1" strokeWidth="1.6" strokeLinecap="round">
                              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                            </svg>
                          </div>
                          <p className="text-base text-[#1a1a2e]"
                            style={{ fontFamily: "'DM Serif Display', serif", fontStyle: "italic" }}>
                            No sessions found
                          </p>
                          <p className="text-xs text-[#b0b8c4]">
                            {search ? `No results matching "${search}"` : "No sessions have been recorded yet"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((session, i) => {
                      const isHovered = hoveredRow === session._id;
                      const hasAnomalies = Array.isArray(session.anomalies) && session.anomalies.length > 0;
                      return (
                        <tr
                          key={session._id}
                          className={`session-row cursor-pointer transition-colors duration-150 ${hasAnomalies ? 'bg-[#FF8A5B]/10 border-l-4 border-[#FF8A5B]' : ''}`}
                          style={{
                            animationDelay: `${i * 40}ms`,
                            background: isHovered ? "rgba(37,206,209,0.04)" : undefined,
                          }}
                          onMouseEnter={() => setHoveredRow(session._id)}
                          onMouseLeave={() => setHoveredRow(null)}
                          onClick={() => navigate(`/session/${session._id}`)}
                        >
                          <td className="td-cell">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-bold border ${avatarColors[i % avatarColors.length]}`}>
                                {getInitials(session.patient_id?.name ?? "")}
                              </div>
                              <div>
                                <p className="font-semibold text-[#1a1a2e] text-sm leading-tight">
                                  {session.patient_id?.name ?? "—"}
                                </p>
                                <p className="text-[10px] text-[#b0b8c4] font-medium uppercase tracking-wider mt-0.5">
                                  {session.unit_id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="td-cell">
                            <div className="flex items-center gap-1.5">
                              <StatusBadge status={session.status} />
                              {hasAnomalies && (
                                <span className="ml-1 px-2 py-0.5 bg-[#FF8A5B] text-white text-[10px] rounded-full font-bold animate-pulse" title={session.anomalies.map(a => ANOMALY_LABELS[a] || a).join(', ')}>
                                  !
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="td-cell">
                            <div>
                              <p className="text-[#1a1a2e] font-medium text-sm">
                                {new Date(session.timestamps.start).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                              </p>
                              <p className="text-[10px] text-[#b0b8c4] mt-0.5">
                                {new Date(session.timestamps.start).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </td>

                          <td className="td-cell">
                            <BPDisplay sys={session.vitals.pre_bp_sys} dia={session.vitals.pre_bp_dia} />
                          </td>

                          <td className="td-cell">
                            <span className="font-semibold text-[#1a1a2e] text-sm">{session.vitals.pre_weight}</span>
                            <span className="text-[10px] text-[#b0b8c4] ml-1">kg</span>
                          </td>

                          <td className="td-cell">
                            <BPDisplay sys={session.vitals.post_bp_sys} dia={session.vitals.post_bp_dia} />
                          </td>

                          <td className="td-cell">
                            {session.vitals.post_weight !== undefined ? (
                              <>
                                <span className="font-semibold text-[#1a1a2e] text-sm">{session.vitals.post_weight}</span>
                                <span className="text-[10px] text-[#b0b8c4] ml-1">kg</span>
                              </>
                            ) : (
                              <span className="text-[#b0b8c4] text-sm">—</span>
                            )}
                          </td>

                          {/* Notes */}
                          <td className="td-cell max-w-[180px]">
                            {session.nurse_notes ? (
                              <span className="block truncate text-[#374151] text-xs" title={session.nurse_notes}>
                                {session.nurse_notes}
                              </span>
                            ) : (
                              <span className="text-[#b0b8c4] text-sm">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            {!loading && filtered.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-[#F4F4F4]">
                <p className="text-xs text-[#b0b8c4]">
                  Showing <span className="font-semibold text-[#25CED1]">{filtered.length}</span> of{" "}
                  <span className="font-semibold text-[#1a1a2e]">{sessions.length}</span> sessions
                </p>
                {/* Progress dots */}
                <div className="flex gap-1.5 items-center">
                  <div className="w-5 h-1.5 rounded-full bg-[#25CED1]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#25CED1]/20" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#25CED1]/20" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;