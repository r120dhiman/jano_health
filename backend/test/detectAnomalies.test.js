import test from 'node:test';
import assert from 'node:assert/strict';

import { ANOMALY_CONFIG } from '../utils/anomalies.js';
import { detectSessionAnomaliesForPatient } from '../utils/detectAnomalies.js';

test('detectSessionAnomaliesForPatient flags excessive interdialytic weight gain', () => {
  const patient = { dry_weight_kg: 70 };
  const session = {
    vitals: {
      pre_weight: 70 * (1 + ANOMALY_CONFIG.EXCESSIVE_WEIGHT_GAIN_PERCENT) + 0.5,
    },
    timestamps: {
      start: new Date().toISOString(),
      end: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    },
  };

  const anomalies = detectSessionAnomaliesForPatient(session, patient);
  assert(anomalies.includes('EXCESSIVE_WEIGHT_GAIN'));
});

test('detectSessionAnomaliesForPatient flags short and long session durations', () => {
  const patient = { dry_weight_kg: 70 };

  const shortSession = {
    vitals: { pre_weight: 70 },
    timestamps: {
      start: new Date().toISOString(),
      end: new Date(Date.now() + (ANOMALY_CONFIG.SESSION_DURATION_MIN_MINUTES - 30) * 60000).toISOString(),
    },
  };

  const longSession = {
    vitals: { pre_weight: 70 },
    timestamps: {
      start: new Date().toISOString(),
      end: new Date(Date.now() + (ANOMALY_CONFIG.SESSION_DURATION_MAX_MINUTES + 30) * 60000).toISOString(),
    },
  };

  assert(detectSessionAnomaliesForPatient(shortSession, patient).includes('SHORT_SESSION'));
  assert(detectSessionAnomaliesForPatient(longSession, patient).includes('LONG_SESSION'));
});

test('detectSessionAnomaliesForPatient flags high post-dialysis systolic BP', () => {
  const patient = { dry_weight_kg: 70 };
  const session = {
    vitals: {
      pre_weight: 70,
      post_bp_sys: ANOMALY_CONFIG.HIGH_POST_BP_SYSTOLIC + 5,
    },
    timestamps: {
      start: new Date().toISOString(),
      end: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    },
  };

  const anomalies = detectSessionAnomaliesForPatient(session, patient);
  assert(anomalies.includes('HIGH_POST_BP'));
});

