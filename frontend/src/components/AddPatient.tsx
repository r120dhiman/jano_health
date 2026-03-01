import React, { useEffect, useState } from "react";
import axios from "axios";

interface Patient {
  _id: string;
  name: string;
  email: string;
  dob: string;
  dry_weight_kg: number;
  unit_id: string;
  createdAt: string;
  __v: number;
}

const getInitials = (name: string) =>
  name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() ?? "?";

const avatarColors = [
  "bg-[#25CED1]/10 text-[#25CED1] border-[#25CED1]/25",
  "bg-[#FF8A5B]/10 text-[#FF8A5B] border-[#FF8A5B]/25",
  "bg-[#1db8bb]/10 text-[#1db8bb] border-[#1db8bb]/25",
];

const SkeletonRow = () => (
  <tr className="border-b border-[#F4F4F4]">
    <td className="px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#F4F4F4] animate-pulse flex-shrink-0" />
        <div className="space-y-1.5">
          <div className="h-3 bg-[#F4F4F4] rounded-full w-28 animate-pulse" />
          <div className="h-2.5 bg-[#F4F4F4] rounded-full w-36 animate-pulse" />
        </div>
      </div>
    </td>
    {[80, 70, 60, 55].map((w, i) => (
      <td key={i} className="px-5 py-4">
        <div className="h-3 bg-[#F4F4F4] rounded-full animate-pulse" style={{ width: `${w}%` }} />
      </td>
    ))}
  </tr>
);

function AddPatient() {
  const [allPatient, setAllPatient] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/patients");
        setAllPatient(response.data.data || response.data);
      } catch (err: any) {
        setError("Failed to fetch patients");
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const filtered = allPatient.filter((p) =>
    [p.name, p.email, p.unit_id].some((v) =>
      v?.toLowerCase().includes(search.toLowerCase())
    )
  );

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
        @keyframes fade-down {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
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
        .blob-a { animation: morph-a 10s ease-in-out infinite; }
        .blob-b { animation: morph-b 13s ease-in-out infinite; }
        .header-appear { animation: fade-down 0.4s ease both; }
        .table-appear  { animation: fade-up 0.45s ease both 0.1s; }
        .row-appear    { animation: row-in 0.35s ease both; }

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
        }
      `}</style>

      <div className="min-h-screen bg-[#F4F4F4] relative overflow-hidden"
        style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-10">

          {/* Header */}
          <div className="header-appear flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#25CED1] mb-1">
                ◆ Dialysis Center
              </p>
              <h1 className="text-4xl text-[#1a1a2e] leading-tight"
                style={{ fontFamily: "'DM Serif Display', serif", fontStyle: "italic" }}>
                All Patients
              </h1>
              <p className="text-xs text-[#b0b8c4] mt-1.5">
                {loading ? "Fetching records…" : `${allPatient.length} patient${allPatient.length !== 1 ? "s" : ""} registered`}
              </p>
            </div>

            {/* Stat chip */}
            {!loading && (
              <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-[#25CED1]/15 shadow-sm self-start">
                <div className="w-7 h-7 rounded-lg bg-[#25CED1]/8 border border-[#25CED1]/15 flex items-center justify-center">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#25CED1" strokeWidth="2" strokeLinecap="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-[#1a1a2e]">{allPatient.length}</span>
                <span className="text-xs text-[#b0b8c4]">Patients</span>
              </div>
            )}
          </div>

          {/* Table card */}
          <div className="table-appear bg-white rounded-2xl overflow-hidden border border-[#25CED1]/10
                          shadow-[0_4px_24px_rgba(37,206,209,0.08),0_1px_4px_rgba(0,0,0,0.04)]">
            <div className="shimmer-top" />

            {/* Search bar */}
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[#F4F4F4]">
              <div className={`flex items-center gap-2.5 bg-[#F4F4F4] rounded-xl px-3.5 py-2 border transition-all duration-300 w-72
                               ${searchFocused ? "border-[#25CED1] bg-white shadow-[0_0_0_4px_rgba(37,206,209,0.1)]" : "border-transparent"}`}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke={searchFocused ? "#25CED1" : "#9ca3af"} strokeWidth="2" strokeLinecap="round"
                  className="flex-shrink-0 transition-colors duration-200">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, email or unit…"
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
              {!loading && (
                <p className="text-xs text-[#b0b8c4] shrink-0">
                  <span className="font-semibold text-[#25CED1]">{filtered.length}</span> result{filtered.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 mx-6 my-4 bg-[#FF8A5B]/6 border border-[#FF8A5B]/25 rounded-xl px-4 py-3">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF8A5B" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <p className="text-xs font-medium text-[#FF8A5B]">{error}</p>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    {["Patient", "Unit", "Date of Birth", "Dry Weight", "Added"].map((h) => (
                      <th key={h} className="th-cell">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-[#25CED1]/8 border border-[#25CED1]/15 flex items-center justify-center">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#25CED1" strokeWidth="1.6" strokeLinecap="round">
                              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                            </svg>
                          </div>
                          <p className="text-base text-[#1a1a2e]"
                            style={{ fontFamily: "'DM Serif Display', serif", fontStyle: "italic" }}>
                            No patients found
                          </p>
                          <p className="text-xs text-[#b0b8c4]">
                            {search ? `No results matching "${search}"` : "No patients registered yet"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((patient, i) => {
                      const isHovered = hoveredRow === patient._id;
                      return (
                        <tr
                          key={patient._id}
                          className="row-appear transition-colors duration-150 cursor-default"
                          style={{
                            animationDelay: `${i * 45}ms`,
                            background: isHovered ? "rgba(37,206,209,0.04)" : "transparent",
                          }}
                          onMouseEnter={() => setHoveredRow(patient._id)}
                          onMouseLeave={() => setHoveredRow(null)}
                        >
                          {/* Patient name + email */}
                          <td className="td-cell">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                                               text-[11px] font-bold border ${avatarColors[i % avatarColors.length]}`}>
                                {getInitials(patient.name)}
                              </div>
                              <div>
                                <p className="font-semibold text-[#1a1a2e] text-sm leading-tight">{patient.name}</p>
                                <p className="text-[10px] text-[#b0b8c4] mt-0.5">{patient.email || "—"}</p>
                              </div>
                            </div>
                          </td>

                          {/* Unit */}
                          <td className="td-cell">
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg
                                             transition-all duration-200
                                             ${isHovered
                                               ? "bg-[#FF8A5B]/10 text-[#FF8A5B]"
                                               : "bg-[#F4F4F4] text-[#9ca3af]"}`}>
                              {patient.unit_id}
                            </span>
                          </td>

                          {/* DOB */}
                          <td className="td-cell">
                            <span className="text-sm text-[#374151]">
                              {new Date(patient.dob).toLocaleDateString("en-GB", {
                                day: "2-digit", month: "short", year: "numeric",
                              })}
                            </span>
                          </td>

                          {/* Dry weight */}
                          <td className="td-cell">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold
                                             transition-all duration-200
                                             ${isHovered
                                               ? "bg-[#25CED1]/12 text-[#25CED1]"
                                               : "bg-[#25CED1]/7 text-[#25CED1] border border-[#25CED1]/20"}`}>
                              {patient.dry_weight_kg}
                              <span className="text-[10px] font-normal opacity-70">kg</span>
                            </span>
                          </td>

                          {/* Added */}
                          <td className="td-cell">
                            <div>
                              <p className="text-sm text-[#374151]">
                                {new Date(patient.createdAt).toLocaleDateString("en-GB", {
                                  day: "2-digit", month: "short", year: "numeric",
                                })}
                              </p>
                              <p className="text-[10px] text-[#b0b8c4] mt-0.5">
                                {new Date(patient.createdAt).toLocaleTimeString("en-GB", {
                                  hour: "2-digit", minute: "2-digit",
                                })}
                              </p>
                            </div>
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
                  Showing{" "}
                  <span className="font-semibold text-[#25CED1]">{filtered.length}</span>{" "}
                  of{" "}
                  <span className="font-semibold text-[#1a1a2e]">{allPatient.length}</span>{" "}
                  patients
                </p>
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
}

export default AddPatient;