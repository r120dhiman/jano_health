import React, { useState, useMemo } from 'react';
import{ useFetchSchedule } from '../hooks/Fetchscheudle';
import { ANOMALY_LABELS } from '../config/rules';

const ScheduleDashboard: React.FC<{ unitId: string }> = ({ unitId }) => {
  const { data, loading, error, refetch } = useFetchSchedule(unitId);
  const [filterAnomalies, setFilterAnomalies] = useState(false);

  // Logic: Filter data based on the "Anomalies Only" toggle
  const displaySessions = useMemo(() => {
    return filterAnomalies ? data.filter(s => s.anomalies.length > 0) : data;
  }, [data, filterAnomalies]);

  // 1. Handle Loading State
  if (loading) return <div className="p-10 text-center">Loading unit schedule...</div>;

  // 2. Handle Error State
  if (error) return (
    <div className="bg-red-50 p-4 border border-red-200 text-red-700 rounded m-4">
      <strong>Error:</strong> {error}
      <button onClick={refetch} className="ml-4 underline">Retry</button>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Unit: {unitId}</h1>
        
        <label className="flex items-center space-x-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={filterAnomalies}
            onChange={(e) => setFilterAnomalies(e.target.checked)}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-gray-700 font-medium">Show Anomalies Only</span>
        </label>
      </div>

      {/* 3. Handle Empty State */}
      {displaySessions.length === 0 ? (
        <div className="bg-gray-50 p-10 text-center border-2 border-dashed rounded">
          {filterAnomalies ? "No sessions with anomalies found." : "No sessions scheduled for today."}
        </div>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left">Patient</th>
                <th className="px-6 py-3 text-left">Weight (Pre/Post)</th>
                <th className="px-6 py-3 text-left">Post-BP</th>
                <th className="px-6 py-3 text-left">Duration</th>
                <th className="px-6 py-3 text-left">Alerts</th>
              </tr>
            </thead>
            <tbody>
              {displaySessions.map(session => (
                <tr 
                  key={session._id} 
                  className={`border-b hover:bg-gray-50 ${session.anomalies.length > 0 ? 'bg-red-50' : ''}`}
                >
                  <td className="px-6 py-4 font-medium">{session.patient_id.name}</td>
                  <td className="px-6 py-4">
                    {session.vitals.pre_weight}kg → {session.vitals.post_weight}kg
                  </td>
                  <td className={`px-6 py-4 ${session.anomalies.includes('HIGH_POST_BP') ? 'text-red-600 font-bold' : ''}`}>
                    {session.vitals.systolic_bp_post}/{session.vitals.diastolic_bp_post}
                  </td>
                  <td className="px-6 py-4">
                    {/* Simplified duration display */}
                    {Math.round((new Date(session.timestamps.end).getTime() - new Date(session.timestamps.start).getTime()) / 3600000)} hrs
                  </td>
                  <td className="px-6 py-4">
                    {session.anomalies.map(key => (
                      <span 
                        key={key} 
                        className="inline-block bg-red-600 text-white text-xs px-2 py-1 rounded-full mr-1 mb-1"
                        title={ANOMALY_LABELS[key]}
                      >
                        ⚠️ {key.replace('_', ' ')}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ScheduleDashboard;