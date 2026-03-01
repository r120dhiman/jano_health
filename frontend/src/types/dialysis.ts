export type SessionStatus = 'not started' | 'in progress' | 'completed';

export interface Vitals {
  pre_weight: number;
  post_weight: number;
  systolic_bp_pre: number;
  systolic_bp_post: number;
  diastolic_bp_pre: number;
  diastolic_bp_post: number;
}

export interface DialysisSession {
  _id: string;
  patient_id: {
    _id: string;
    name: string;
    dry_weight_kg: number;
    unit_id: string;
  };
  status: SessionStatus;
  vitals: Vitals;
  timestamps: {
    start: string; // ISO Date String
    end: string;   // ISO Date String
  };
  anomalies: string[]; // e.g., ["EXCESSIVE_WEIGHT_GAIN"]
  nurse_notes: string;
}