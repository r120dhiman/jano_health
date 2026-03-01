export const CLINICAL_RULES = {

  WEIGHT_GAIN_THRESHOLD_PERCENTAGE: 5,


  HIGH_SYSTOLIC_THRESHOLD: 160,

  MIN_DURATION_HOURS: 3,
  MAX_DURATION_HOURS: 5,
} as const;


export const ANOMALY_LABELS: Record<string, string> = {
  EXCESSIVE_WEIGHT_GAIN: "Excessive Interdialytic Weight Gain (>5%)",
  HIGH_POST_BP: "High Post-Dialysis Systolic BP (>160 mmHg)",
  SHORT_SESSION: "Short Session Duration (<3 Hours)",
  LONG_SESSION: "Extended Session Duration (>5 Hours)",
};


export const CLINICAL_THRESHOLDS = {
  WEIGHT_GAIN_PERCENTAGE: 5,
  SYSTOLIC_BP_LIMIT: 160,
  MIN_DURATION_MINUTES: 180, // 3 hours
  MAX_DURATION_MINUTES: 300, // 5 hours
} as const;