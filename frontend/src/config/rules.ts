export const CLINICAL_RULES = {
  // Threshold: > 5% of dry weight
  // Justification: KDOQI Clinical Practice Guidelines
  WEIGHT_GAIN_THRESHOLD_PERCENTAGE: 5,

  // Threshold: > 160 mmHg
  // Justification: Risk of post-dialysis hypertensive crisis
  HIGH_SYSTOLIC_THRESHOLD: 160,

  // Threshold: < 3 hours or > 5 hours
  // Justification: Standard dialysis shift is 4 hours; extremes indicate intolerance or inefficiency
  MIN_DURATION_HOURS: 3,
  MAX_DURATION_HOURS: 5,
} as const;