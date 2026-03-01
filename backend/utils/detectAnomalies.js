// Utility to detect anomalies in a session based on clinical rules
// Returns an array of anomaly keys
import { ANOMALY_DEFINITIONS } from './anomalies.js';
import { Patient } from '../Model/patient.js';

export async function detectSessionAnomalies(session, patientId) {
  const anomalies = [];
  // Fetch patient for dry weight
  let patient = null;
  if (patientId) {
    patient = await Patient.findById(patientId);
  }
  if (!patient) return anomalies;

  // 1. Excessive interdialytic weight gain (>5% of dry weight)
  if (
    session.vitals?.pre_weight &&
    patient.dry_weight_kg &&
    session.vitals.pre_weight > patient.dry_weight_kg * 1.05
  ) {
    anomalies.push('EXCESSIVE_WEIGHT_GAIN');
  }

  // 2. High post-dialysis systolic BP (>160 mmHg)
  if (
    session.vitals?.post_bp_sys &&
    session.vitals.post_bp_sys > 160
  ) {
    anomalies.push('HIGH_POST_BP');
  }

  // 3. Short/Long session duration (optional, can add)
  if (session.timestamps?.start && session.timestamps?.end) {
    const durationMs = new Date(session.timestamps.end) - new Date(session.timestamps.start);
    const durationMin = durationMs / 60000;
    if (durationMin < 180) anomalies.push('SHORT_SESSION');
    if (durationMin > 300) anomalies.push('LONG_SESSION');
  }

  return anomalies;
}
