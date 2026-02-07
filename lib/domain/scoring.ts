import type { Metrics, ScoringWeights, Thresholds, ScoringOutput } from "./types";

/**
 * Scoring Service (Simplified)
 * Calculates Eisenhower quadrant, priority score, and next action hint
 * Based only on importance and urgency metrics
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
 * Calculates priority score using weighted formula (simplified)
 * Formula: priorityScore = scale(wImportance * importance + wUrgency * urgency)
 * Normalized to 0-100 range
 */
function calculatePriorityScore(
  metrics: Metrics,
  weights: ScoringWeights
): number {
  const { importanceScore, urgencyScore } = metrics;
  const { wImportance, wUrgency } = weights;

  // Raw weighted sum
  const rawScore = wImportance * importanceScore + wUrgency * urgencyScore;

  // Calculate max and min possible values
  // Max: 0.5 * 10 + 0.5 * 10 = 10
  // Min: 0.5 * 1 + 0.5 * 1 = 1
  const maxPossible = wImportance * 10 + wUrgency * 10;
  const minPossible = wImportance * 1 + wUrgency * 1;

  // Normalize to 0-100 range
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
  const sum = weights.wImportance + weights.wUrgency;

  // Allow small floating point error
  return Math.abs(sum - 1.0) < 0.01;
}
