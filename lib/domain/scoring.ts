import type { Metrics, ScoringWeights, Thresholds, ScoringOutput } from "./types";

/**
 * Scoring Service
 * Calculates Eisenhower quadrant, priority score, and next action hint
 */

/**
 * Determines if a metric value exceeds a threshold
 */
function meetsThreshold(value: number, threshold: number): boolean {
  return value >= threshold;
}

/**
 * Determines the Eisenhower quadrant based on importance and urgency flags
 */
function getQuadrant(
  importantFlag: boolean,
  urgentFlag: boolean
): "Q1" | "Q2" | "Q3" | "Q4" {
  if (importantFlag && urgentFlag) return "Q1";
  if (importantFlag && !urgentFlag) return "Q2";
  if (!importantFlag && urgentFlag) return "Q3";
  return "Q4";
}

/**
 * Determines the next action hint based on quadrant
 */
function getNextActionHint(
  quadrant: "Q1" | "Q2" | "Q3" | "Q4"
): "Do Now" | "Schedule" | "Delegate" | "Delete" {
  switch (quadrant) {
    case "Q1":
      return "Do Now";
    case "Q2":
      return "Schedule";
    case "Q3":
      return "Delegate";
    case "Q4":
      return "Delete";
  }
}

/**
 * Calculates priority score using weighted formula
 * Formula: priorityScore = scale(wI*I + wU*U + wImp*Impact + wR*Risk - wE*Effort)
 * Where scale normalizes to 0-100 range
 */
function calculatePriorityScore(
  metrics: Metrics,
  weights: ScoringWeights
): number {
  const {
    importanceScore: I,
    urgencyScore: U,
    impactScore: Impact,
    riskScore: Risk,
    effortScore: Effort,
  } = metrics;

  const { wImportance, wUrgency, wImpact, wRisk, wEffort } = weights;

  // Raw weighted sum
  const rawScore =
    wImportance * I +
    wUrgency * U +
    wImpact * Impact +
    wRisk * Risk -
    wEffort * Effort;

  // Normalize to 0-100 range
  // Max possible: 0.30*10 + 0.25*10 + 0.25*10 + 0.15*10 - 0.05*1
  // = 3 + 2.5 + 2.5 + 1.5 - 0.05 = 9.45
  // Min possible: 0.30*1 + 0.25*1 + 0.25*1 + 0.15*1 - 0.05*10
  // = 0.3 + 0.25 + 0.25 + 0.15 - 0.5 = 0.45

  const maxPossible =
    wImportance * 10 +
    wUrgency * 10 +
    wImpact * 10 +
    wRisk * 10 -
    wEffort * 1;
  const minPossible =
    wImportance * 1 +
    wUrgency * 1 +
    wImpact * 1 +
    wRisk * 1 -
    wEffort * 10;

  const range = maxPossible - minPossible;
  const normalized = (rawScore - minPossible) / range;
  const scaled = Math.max(0, Math.min(100, normalized * 100));

  // Round to 1 decimal place
  return Math.round(scaled * 10) / 10;
}

/**
 * Main scoring function that calculates all derived fields
 */
export function calculateScoring(
  metrics: Metrics,
  weights: ScoringWeights,
  thresholds: Thresholds
): ScoringOutput {
  const importantFlag = meetsThreshold(
    metrics.importanceScore,
    thresholds.importanceThreshold
  );
  const urgentFlag = meetsThreshold(
    metrics.urgencyScore,
    thresholds.urgencyThreshold
  );

  const quadrant = getQuadrant(importantFlag, urgentFlag);
  const priorityScore = calculatePriorityScore(metrics, weights);
  const nextActionHint = getNextActionHint(quadrant);

  return {
    importantFlag,
    urgentFlag,
    quadrant,
    priorityScore,
    nextActionHint,
  };
}

/**
 * Validates that weights sum to approximately 1.0
 */
export function validateWeights(weights: ScoringWeights): boolean {
  const sum =
    weights.wImportance +
    weights.wUrgency +
    weights.wImpact +
    weights.wRisk +
    weights.wEffort;

  // Allow small floating point error
  return Math.abs(sum - 1.0) < 0.01;
}
