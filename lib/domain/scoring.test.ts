import { describe, it, expect } from "vitest";
import { calculateScoring, validateWeights } from "./scoring";
import type { Metrics, ScoringWeights, Thresholds } from "./types";

describe("Scoring Service", () => {
  const defaultWeights: ScoringWeights = {
    wImportance: 0.30,
    wUrgency: 0.25,
    wImpact: 0.25,
    wRisk: 0.15,
    wEffort: 0.05,
  };

  const defaultThresholds: Thresholds = {
    importanceThreshold: 6,
    urgencyThreshold: 6,
  };

  describe("calculateScoring", () => {
    it("should classify Q1 (Important & Urgent)", () => {
      const metrics: Metrics = {
        importanceScore: 9,
        urgencyScore: 9,
        impactScore: 8,
        effortScore: 5,
        riskScore: 7,
      };

      const result = calculateScoring(metrics, defaultWeights, defaultThresholds);

      expect(result.importantFlag).toBe(true);
      expect(result.urgentFlag).toBe(true);
      expect(result.quadrant).toBe("Q1");
      expect(result.nextActionHint).toBe("Do Now");
      expect(result.priorityScore).toBeGreaterThan(70);
    });

    it("should classify Q2 (Important & Not Urgent)", () => {
      const metrics: Metrics = {
        importanceScore: 8,
        urgencyScore: 3,
        impactScore: 9,
        effortScore: 4,
        riskScore: 6,
      };

      const result = calculateScoring(metrics, defaultWeights, defaultThresholds);

      expect(result.importantFlag).toBe(true);
      expect(result.urgentFlag).toBe(false);
      expect(result.quadrant).toBe("Q2");
      expect(result.nextActionHint).toBe("Schedule");
    });

    it("should classify Q3 (Not Important & Urgent)", () => {
      const metrics: Metrics = {
        importanceScore: 4,
        urgencyScore: 8,
        impactScore: 3,
        effortScore: 2,
        riskScore: 3,
      };

      const result = calculateScoring(metrics, defaultWeights, defaultThresholds);

      expect(result.importantFlag).toBe(false);
      expect(result.urgentFlag).toBe(true);
      expect(result.quadrant).toBe("Q3");
      expect(result.nextActionHint).toBe("Delegate");
    });

    it("should classify Q4 (Not Important & Not Urgent)", () => {
      const metrics: Metrics = {
        importanceScore: 2,
        urgencyScore: 2,
        impactScore: 1,
        effortScore: 8,
        riskScore: 1,
      };

      const result = calculateScoring(metrics, defaultWeights, defaultThresholds);

      expect(result.importantFlag).toBe(false);
      expect(result.urgentFlag).toBe(false);
      expect(result.quadrant).toBe("Q4");
      expect(result.nextActionHint).toBe("Delete");
    });

    it("should respect custom thresholds", () => {
      const metrics: Metrics = {
        importanceScore: 7,
        urgencyScore: 5,
        impactScore: 6,
        effortScore: 3,
        riskScore: 5,
      };

      const customThresholds: Thresholds = {
        importanceThreshold: 8,
        urgencyThreshold: 6,
      };

      const result = calculateScoring(metrics, defaultWeights, customThresholds);

      expect(result.importantFlag).toBe(false); // 7 < 8
      expect(result.urgentFlag).toBe(false); // 5 < 6
      expect(result.quadrant).toBe("Q4");
    });

    it("should calculate priority score between 0 and 100", () => {
      const metrics: Metrics = {
        importanceScore: 5,
        urgencyScore: 5,
        impactScore: 5,
        effortScore: 5,
        riskScore: 5,
      };

      const result = calculateScoring(metrics, defaultWeights, defaultThresholds);

      expect(result.priorityScore).toBeGreaterThanOrEqual(0);
      expect(result.priorityScore).toBeLessThanOrEqual(100);
    });

    it("should decrease priority with higher effort", () => {
      const baseMetrics: Metrics = {
        importanceScore: 8,
        urgencyScore: 7,
        impactScore: 8,
        effortScore: 3,
        riskScore: 6,
      };

      const highEffortMetrics: Metrics = {
        ...baseMetrics,
        effortScore: 10,
      };

      const baseResult = calculateScoring(baseMetrics, defaultWeights, defaultThresholds);
      const highEffortResult = calculateScoring(
        highEffortMetrics,
        defaultWeights,
        defaultThresholds
      );

      expect(highEffortResult.priorityScore).toBeLessThan(baseResult.priorityScore);
    });

    it("should increase priority with higher impact and risk", () => {
      const baseMetrics: Metrics = {
        importanceScore: 7,
        urgencyScore: 6,
        impactScore: 5,
        effortScore: 3,
        riskScore: 5,
      };

      const highImpactMetrics: Metrics = {
        ...baseMetrics,
        impactScore: 10,
        riskScore: 10,
      };

      const baseResult = calculateScoring(baseMetrics, defaultWeights, defaultThresholds);
      const highImpactResult = calculateScoring(
        highImpactMetrics,
        defaultWeights,
        defaultThresholds
      );

      expect(highImpactResult.priorityScore).toBeGreaterThan(baseResult.priorityScore);
    });
  });

  describe("validateWeights", () => {
    it("should validate correct weights", () => {
      const weights: ScoringWeights = {
        wImportance: 0.30,
        wUrgency: 0.25,
        wImpact: 0.25,
        wRisk: 0.15,
        wEffort: 0.05,
      };

      expect(validateWeights(weights)).toBe(true);
    });

    it("should reject weights that don't sum to 1.0", () => {
      const weights: ScoringWeights = {
        wImportance: 0.50,
        wUrgency: 0.25,
        wImpact: 0.25,
        wRisk: 0.15,
        wEffort: 0.05,
      };

      expect(validateWeights(weights)).toBe(false);
    });

    it("should allow small floating point errors", () => {
      const weights: ScoringWeights = {
        wImportance: 0.30,
        wUrgency: 0.25,
        wImpact: 0.25,
        wRisk: 0.15,
        wEffort: 0.050000001,
      };

      expect(validateWeights(weights)).toBe(true);
    });
  });
});
