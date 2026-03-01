import { ANOMALY_CONFIG } from './anomalies.js';
import { Patient } from '../Model/patient.js';

export function detectSessionAnomaliesForPatient(session, patient) {
  const anomalies = [];
  if (!session || !patient) return anomalies;

  const { vitals = {}, timestamps = {} } = session;
  const { dry_weight_kg } = patient;

  if (
    typeof vitals.pre_weight === 'number' &&
    typeof dry_weight_kg === 'number' &&
    dry_weight_kg > 0 &&
    vitals.pre_weight > dry_weight_kg * (1 + ANOMALY_CONFIG.EXCESSIVE_WEIGHT_GAIN_PERCENT)
  ) {
    anomalies.push('EXCESSIVE_WEIGHT_GAIN');
  }

  if (
    typeof vitals.post_bp_sys === 'number' &&
    vitals.post_bp_sys > ANOMALY_CONFIG.HIGH_POST_BP_SYSTOLIC
  ) {
    anomalies.push('HIGH_POST_BP');
  }

  if (timestamps.start && timestamps.end) {
    const durationMs = new Date(timestamps.end) - new Date(timestamps.start);
    const durationMin = durationMs / 60000;
    if (durationMin < ANOMALY_CONFIG.SESSION_DURATION_MIN_MINUTES) {
      anomalies.push('SHORT_SESSION');
    }
    if (durationMin > ANOMALY_CONFIG.SESSION_DURATION_MAX_MINUTES) {
      anomalies.push('LONG_SESSION');
    }
  }

  return anomalies;
}

export async function detectSessionAnomalies(session, patientId) {
  if (!patientId) return [];
  const patient = await Patient.findById(patientId);
  if (!patient) return [];
  return detectSessionAnomaliesForPatient(session, patient);
}

