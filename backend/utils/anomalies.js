export const ANOMALY_CONFIG = {
  EXCESSIVE_WEIGHT_GAIN_PERCENT: 0.05,
  HIGH_POST_BP_SYSTOLIC: 160,
  SESSION_DURATION_MIN_MINUTES: 180, // 3 hours
  SESSION_DURATION_MAX_MINUTES: 300, // 5 hours
};

export const ANOMALY_DEFINITIONS = {
  EXCESSIVE_WEIGHT_GAIN: {
    threshold: "> 5% of dry weight",
    justification:
      "Interdialytic weight gain (IDWG) exceeding ~5% of dry weight is associated with higher cardiovascular and all‑cause mortality in hemodialysis cohorts.",
    reference: "https://pubmed.ncbi.nlm.nih.gov/28532454/",
  },
  HIGH_POST_BP: {
    threshold: "Post‑dialysis systolic > 160 mmHg",
    justification:
      "Persistent post‑dialysis hypertension (SBP > 160 mmHg) may indicate inadequate volume removal or sympathetic over‑activity and is associated with adverse outcomes.",
    reference: "https://www.ajkd.org/article/S0272-6386(19)30113-1/fulltext",
  },
  SHORT_SESSION: {
    threshold: "< 3 hours (target 4 hours)",
    justification:
      "Standard thrice‑weekly hemodialysis is typically prescribed for ~4 hours; sessions < 3 hours may reflect intolerance or under‑dialysis.",
  },
  LONG_SESSION: {
    threshold: "> 5 hours (target 4 hours)",
    justification:
      "Very prolonged treatments (> 5 hours) may indicate intradialytic complications, difficult volume removal, or scheduling issues.",
  },
};
