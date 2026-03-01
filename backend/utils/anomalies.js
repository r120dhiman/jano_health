export const ANOMALY_DEFINITIONS = {
  EXCESSIVE_WEIGHT_GAIN: {
    threshold: "> 5% of Dry Weight",
    justification: "Interdialytic weight gain (IDWG) exceeding 5% is associated with higher cardiovascular mortality.",
    reference: "https://pubmed.ncbi.nlm.nih.gov/28532454/" // Example: KDOQI guidelines
  },
  HIGH_POST_BP: {
    threshold: "Systolic > 160 mmHg",
    justification: "Post-dialysis hypertension may indicate extracellular volume expansion or sympathetic overactivity.",
    reference: "https://www.ajkd.org/article/S0272-6386(19)30113-1/fulltext"
  }
};