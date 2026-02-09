import { describe, it, expect } from "vitest";
import { calculatePriorityScore, determineQuadrant, sortTasksByPriority, createTaskWithScoring } from "./scoring";
import type { Task, ScoringConfig } from "./types";

const defaultConfig: ScoringConfig = {
  importanceThreshold: 4,
  urgencyThreshold: 4,
};

describe("Scoring Service", () => {
  describe("calculatePriorityScore", () => {
    it("should return 0 for minimum values (1, 1)", () => {
      const score = calculatePriorityScore(1, 1);
      expect(score).toBe(0);
    });

    it("should return 100 for maximum values (7, 7)", () => {
      const score = calculatePriorityScore(7, 7);
      expect(score).toBe(100);
    });

    it("should return 50 for middle values (4, 4)", () => {
      const score = calculatePriorityScore(4, 4);
      expect(score).toBe(50);
    });

    it("should average importance and urgency", () => {
      const score = calculatePriorityScore(7, 1);
      expect(score).toBe(50); // (1.0 + 0.0) / 2 * 100
    });
  });

  describe("determineQuadrant", () => {
    it("should return Q1 for high importance and urgency", () => {
      const quadrant = determineQuadrant(5, 5, defaultConfig);
      expect(quadrant).toBe("Q1");
    });

    it("should return Q2 for high importance, low urgency", () => {
      const quadrant = determineQuadrant(5, 2, defaultConfig);
      expect(quadrant).toBe("Q2");
    });

    it("should return Q3 for low importance, high urgency", () => {
      const quadrant = determineQuadrant(2, 5, defaultConfig);
      expect(quadrant).toBe("Q3");
    });

    it("should return Q4 for low importance and urgency", () => {
      const quadrant = determineQuadrant(2, 2, defaultConfig);
      expect(quadrant).toBe("Q4");
    });

    it("should use threshold for boundary", () => {
      const quadrant = determineQuadrant(4, 4, defaultConfig);
      expect(quadrant).toBe("Q1"); // >= threshold
    });
  });

  describe("sortTasksByPriority", () => {
    it("should sort tasks by priority score descending", () => {
      const tasks: Task[] = [
        {
          id: "1",
          title: "Low priority",
          description: "",
          importance: 1,
          urgency: 1,
          status: "not_started",
          quadrant: "Q4",
          priorityScore: 0,
          sortOrder: 1,
          notificationFrequency: "global",
          attachments: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: "2",
          title: "High priority",
          description: "",
          importance: 7,
          urgency: 7,
          status: "not_started",
          quadrant: "Q1",
          priorityScore: 100,
          sortOrder: 2,
          notificationFrequency: "global",
          attachments: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const sorted = sortTasksByPriority(tasks);
      expect(sorted[0].priorityScore).toBe(100);
      expect(sorted[1].priorityScore).toBe(0);
    });
  });

  describe("createTaskWithScoring", () => {
    it("should create task with default notificationFrequency and attachments", () => {
      const result = createTaskWithScoring(
        {
          title: "Test task",
          description: "Test description",
          importance: 5,
          urgency: 6,
          status: "not_started",
        },
        defaultConfig
      );

      expect(result.title).toBe("Test task");
      expect(result.notificationFrequency).toBe("global");
      expect(result.attachments).toEqual([]);
      expect(result.quadrant).toBe("Q1");
      expect(result.priorityScore).toBeGreaterThan(0);
    });

    it("should pass through custom notificationFrequency", () => {
      const result = createTaskWithScoring(
        {
          title: "Urgent",
          description: "Urgent task",
          importance: 7,
          urgency: 7,
          status: "not_started",
          notificationFrequency: "10min",
        },
        defaultConfig
      );

      expect(result.notificationFrequency).toBe("10min");
    });

    it("should pass through attachments", () => {
      const attachments = [
        { uri: "file://photo.jpg", type: "image" as const, name: "photo.jpg" },
        { uri: "file://doc.pdf", type: "file" as const, name: "doc.pdf" },
      ];

      const result = createTaskWithScoring(
        {
          title: "With files",
          description: "Task with attachments",
          importance: 3,
          urgency: 2,
          status: "not_started",
          attachments,
        },
        defaultConfig
      );

      expect(result.attachments).toHaveLength(2);
      expect(result.attachments![0].type).toBe("image");
      expect(result.attachments![1].type).toBe("file");
    });

    it("should calculate Q4 for low importance and urgency", () => {
      const result = createTaskWithScoring(
        {
          title: "Low",
          description: "Low priority",
          importance: 1,
          urgency: 1,
          status: "not_started",
        },
        defaultConfig
      );

      expect(result.quadrant).toBe("Q4");
      expect(result.priorityScore).toBe(0);
    });
  });
});
