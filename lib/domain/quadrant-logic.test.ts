import { describe, it, expect, beforeEach } from "vitest";
import {
  calculateDeadlineUrgency,
  calculateFinalUrgency,
  isOverdue,
  resolveQuadrant,
  buildPriorityReason,
  mapQuadrantTypeToUI,
} from "./quadrant-logic";

describe("Quadrant Logic - Deadline-Based Urgency", () => {
  let now: Date;

  beforeEach(() => {
    now = new Date("2026-04-20T12:00:00Z");
  });

  describe("calculateDeadlineUrgency", () => {
    describe("null/undefined due date", () => {
      it("should return 1 for null dueAt", () => {
        expect(calculateDeadlineUrgency(null, now)).toBe(1);
      });

      it("should return 1 for undefined dueAt", () => {
        expect(calculateDeadlineUrgency(undefined, now)).toBe(1);
      });
    });

    describe("overdue tasks", () => {
      it("should return 7 for overdue task (1 day past)", () => {
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        expect(calculateDeadlineUrgency(yesterday.toISOString(), now)).toBe(7);
      });

      it("should return 7 for overdue task (1 hour past)", () => {
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        expect(calculateDeadlineUrgency(oneHourAgo.toISOString(), now)).toBe(7);
      });

      it("should return 7 for overdue task (1 minute past)", () => {
        const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
        expect(calculateDeadlineUrgency(oneMinuteAgo.toISOString(), now)).toBe(7);
      });
    });

    describe("boundary case: 2 hours", () => {
      it("should return 7 for exactly 2 hours remaining", () => {
        const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        expect(calculateDeadlineUrgency(twoHoursLater.toISOString(), now)).toBe(7);
      });

      it("should return 7 for 1 hour 59 minutes remaining", () => {
        const almostTwoHours = new Date(now.getTime() + (2 * 60 * 60 * 1000 - 60 * 1000));
        expect(calculateDeadlineUrgency(almostTwoHours.toISOString(), now)).toBe(7);
      });

      it("should return 6 for 2 hours 1 minute remaining", () => {
        const slightlyMoreThanTwoHours = new Date(now.getTime() + (2 * 60 * 60 * 1000 + 60 * 1000));
        expect(calculateDeadlineUrgency(slightlyMoreThanTwoHours.toISOString(), now)).toBe(6);
      });
    });

    describe("boundary case: 12 hours", () => {
      it("should return 6 for exactly 12 hours remaining", () => {
        const twelveHoursLater = new Date(now.getTime() + 12 * 60 * 60 * 1000);
        expect(calculateDeadlineUrgency(twelveHoursLater.toISOString(), now)).toBe(6);
      });

      it("should return 6 for 11 hours 59 minutes remaining", () => {
        const almostTwelveHours = new Date(now.getTime() + (12 * 60 * 60 * 1000 - 60 * 1000));
        expect(calculateDeadlineUrgency(almostTwelveHours.toISOString(), now)).toBe(6);
      });

      it("should return 5 for 12 hours 1 minute remaining", () => {
        const slightlyMoreThanTwelveHours = new Date(now.getTime() + (12 * 60 * 60 * 1000 + 60 * 1000));
        expect(calculateDeadlineUrgency(slightlyMoreThanTwelveHours.toISOString(), now)).toBe(6);
      });
    });

    describe("boundary case: 24 hours", () => {
      it("should return 6 for exactly 24 hours remaining", () => {
        const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        expect(calculateDeadlineUrgency(oneDayLater.toISOString(), now)).toBe(6);
      });

      it("should return 6 for 23 hours 59 minutes remaining", () => {
        const almostOneDay = new Date(now.getTime() + (24 * 60 * 60 * 1000 - 60 * 1000));
        expect(calculateDeadlineUrgency(almostOneDay.toISOString(), now)).toBe(6);
      });

      it("should return 5 for 24 hours 1 minute remaining", () => {
        const slightlyMoreThanOneDay = new Date(now.getTime() + (24 * 60 * 60 * 1000 + 60 * 1000));
        expect(calculateDeadlineUrgency(slightlyMoreThanOneDay.toISOString(), now)).toBe(5);
      });
    });

    describe("boundary case: 3 days", () => {
      it("should return 5 for exactly 3 days remaining", () => {
        const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        expect(calculateDeadlineUrgency(threeDaysLater.toISOString(), now)).toBe(5);
      });

      it("should return 5 for 2 days 23 hours 59 minutes remaining", () => {
        const almostThreeDays = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000 - 60 * 1000));
        expect(calculateDeadlineUrgency(almostThreeDays.toISOString(), now)).toBe(5);
      });

      it("should return 4 for 3 days 1 minute remaining", () => {
        const slightlyMoreThanThreeDays = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000 + 60 * 1000));
        expect(calculateDeadlineUrgency(slightlyMoreThanThreeDays.toISOString(), now)).toBe(4);
      });
    });

    describe("boundary case: 7 days", () => {
      it("should return 4 for exactly 7 days remaining", () => {
        const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        expect(calculateDeadlineUrgency(sevenDaysLater.toISOString(), now)).toBe(4);
      });

      it("should return 4 for 6 days 23 hours 59 minutes remaining", () => {
        const almostSevenDays = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000 - 60 * 1000));
        expect(calculateDeadlineUrgency(almostSevenDays.toISOString(), now)).toBe(4);
      });

      it("should return 3 for 7 days 1 minute remaining", () => {
        const slightlyMoreThanSevenDays = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000 + 60 * 1000));
        expect(calculateDeadlineUrgency(slightlyMoreThanSevenDays.toISOString(), now)).toBe(3);
      });
    });

    describe("boundary case: 14 days", () => {
      it("should return 3 for exactly 14 days remaining", () => {
        const fourteenDaysLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        expect(calculateDeadlineUrgency(fourteenDaysLater.toISOString(), now)).toBe(3);
      });

      it("should return 3 for 13 days 23 hours 59 minutes remaining", () => {
        const almostFourteenDays = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000 - 60 * 1000));
        expect(calculateDeadlineUrgency(almostFourteenDays.toISOString(), now)).toBe(3);
      });

      it("should return 2 for 14 days 1 minute remaining", () => {
        const slightlyMoreThanFourteenDays = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000 + 60 * 1000));
        expect(calculateDeadlineUrgency(slightlyMoreThanFourteenDays.toISOString(), now)).toBe(2);
      });
    });

    describe("boundary case: 30 days", () => {
      it("should return 2 for exactly 30 days remaining", () => {
        const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        expect(calculateDeadlineUrgency(thirtyDaysLater.toISOString(), now)).toBe(2);
      });

      it("should return 2 for 29 days 23 hours 59 minutes remaining", () => {
        const almostThirtyDays = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000 - 60 * 1000));
        expect(calculateDeadlineUrgency(almostThirtyDays.toISOString(), now)).toBe(2);
      });

      it("should return 1 for 30 days 1 minute remaining", () => {
        const slightlyMoreThanThirtyDays = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000 + 60 * 1000));
        expect(calculateDeadlineUrgency(slightlyMoreThanThirtyDays.toISOString(), now)).toBe(1);
      });

      it("should return 1 for 60 days remaining", () => {
        const sixtyDaysLater = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
        expect(calculateDeadlineUrgency(sixtyDaysLater.toISOString(), now)).toBe(1);
      });
    });
  });

  describe("calculateFinalUrgency", () => {
    it("should return max of manual and deadline urgency", () => {
      expect(calculateFinalUrgency(3, 5)).toBe(5);
      expect(calculateFinalUrgency(5, 3)).toBe(5);
      expect(calculateFinalUrgency(5, 5)).toBe(5);
      expect(calculateFinalUrgency(1, 1)).toBe(1);
    });

    it("should not let deadline reduce manual urgency", () => {
      expect(calculateFinalUrgency(7, 1)).toBe(7);
      expect(calculateFinalUrgency(6, 2)).toBe(6);
    });
  });

  describe("isOverdue", () => {
    it("should return true for past date", () => {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      expect(isOverdue(yesterday.toISOString(), now)).toBe(true);
    });

    it("should return false for future date", () => {
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      expect(isOverdue(tomorrow.toISOString(), now)).toBe(false);
    });

    it("should return false for null/undefined", () => {
      expect(isOverdue(null, now)).toBe(false);
      expect(isOverdue(undefined, now)).toBe(false);
    });
  });

  describe("resolveQuadrant", () => {
    describe("standard quadrant rules", () => {
      it("should return DO_NOW for importance >= 6 AND urgencyFinal >= 6", () => {
        const result = resolveQuadrant(6, 6, null, now);
        expect(result).toBe("DO_NOW");
      });

      it("should return DO_NOW for importance 7, urgencyFinal 6", () => {
        const result = resolveQuadrant(7, 6, null, now);
        expect(result).toBe("DO_NOW");
      });

      it("should return SCHEDULE for importance >= 5 AND urgencyFinal <= 5", () => {
        const result = resolveQuadrant(5, 3, null, now);
        expect(result).toBe("SCHEDULE");
      });

      it("should return SCHEDULE for importance 6, urgencyFinal 5", () => {
        const result = resolveQuadrant(6, 5, null, now);
        expect(result).toBe("SCHEDULE");
      });

      it("should return DELEGATE for importance <= 4 AND urgencyFinal >= 5", () => {
        const result = resolveQuadrant(4, 5, null, now);
        expect(result).toBe("DELEGATE");
      });

      it("should return DELEGATE for importance 1, urgencyFinal 7", () => {
        const result = resolveQuadrant(1, 7, null, now);
        expect(result).toBe("DELEGATE");
      });

      it("should return ELIMINATE for low importance and urgency", () => {
        const result = resolveQuadrant(2, 2, null, now);
        expect(result).toBe("ELIMINATE");
      });
    });

    describe("special override: importance == 5 AND urgencyFinal == 5 -> SCHEDULE", () => {
      it("should force SCHEDULE for importance 5, urgencyFinal 5", () => {
        const result = resolveQuadrant(5, 5, null, now);
        expect(result).toBe("SCHEDULE");
      });

      it("should force SCHEDULE even with deadline urgency", () => {
        // Manual urgency 3, deadline urgency 2, final = 3, but importance 5
        const result = resolveQuadrant(5, 3, null, now);
        expect(result).toBe("SCHEDULE");
      });
    });

    describe("special override: overdue AND importance >= 5 -> DO_NOW", () => {
      it("should force DO_NOW for overdue task with importance 5", () => {
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const result = resolveQuadrant(5, 1, yesterday.toISOString(), now);
        expect(result).toBe("DO_NOW");
      });

      it("should force DO_NOW for overdue task with importance 6", () => {
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const result = resolveQuadrant(6, 1, yesterday.toISOString(), now);
        expect(result).toBe("DO_NOW");
      });

      it("should force DO_NOW for overdue task with importance 7", () => {
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const result = resolveQuadrant(7, 1, yesterday.toISOString(), now);
        expect(result).toBe("DO_NOW");
      });

      it("should NOT force DO_NOW for overdue task with importance 4", () => {
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const result = resolveQuadrant(4, 1, yesterday.toISOString(), now);
        // importance 4, urgencyFinal 7 (overdue) -> DELEGATE
        expect(result).toBe("DELEGATE");
      });
    });

    describe("deadline-based urgency integration", () => {
      it("should use deadline urgency when it exceeds manual urgency", () => {
        // Manual urgency 2, but due in 1 hour -> deadline urgency 7 -> final 7
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
        const result = resolveQuadrant(6, 2, oneHourLater.toISOString(), now);
        // importance 6, urgencyFinal 7 -> DO_NOW
        expect(result).toBe("DO_NOW");
      });

      it("should not reduce urgency when manual is higher", () => {
        // Manual urgency 7, due in 60 days -> deadline urgency 1 -> final 7
        const sixtyDaysLater = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
        const result = resolveQuadrant(1, 7, sixtyDaysLater.toISOString(), now);
        // importance 1, urgencyFinal 7 -> DELEGATE
        expect(result).toBe("DELEGATE");
      });
    });
  });

  describe("buildPriorityReason", () => {
    it("should return 'Overdue' for overdue important task", () => {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const reason = buildPriorityReason(5, 1, yesterday.toISOString(), "DO_NOW", now);
      expect(reason).toBe("Overdue & Important");
    });

    it("should return 'Important & Urgent (Balanced)' for importance 5, urgencyFinal 5", () => {
      const reason = buildPriorityReason(5, 5, null, "SCHEDULE", now);
      expect(reason).toBe("Important & Urgent (Balanced)");
    });

    it("should return reason for SCHEDULE quadrant", () => {
      const reason = buildPriorityReason(6, 3, null, "SCHEDULE", now);
      expect(reason).toBeTruthy();
      expect(["Manual urgency is higher than deadline urgency", "Important, not yet critical", "High importance & urgency"].some(r => reason.includes(r.split(" ")[0]))).toBe(true);
    });

    it("should return reason for DELEGATE quadrant", () => {
      const reason = buildPriorityReason(2, 6, null, "DELEGATE", now);
      expect(reason).toContain("Urgent");
    });

    it("should return 'No deadline' for ELIMINATE without due date", () => {
      const reason = buildPriorityReason(1, 1, null, "ELIMINATE", now);
      expect(reason).toBe("No deadline");
    });
  });

  describe("mapQuadrantTypeToUI", () => {
    it("should map DO_NOW to Q1", () => {
      expect(mapQuadrantTypeToUI("DO_NOW")).toBe("Q1");
    });

    it("should map SCHEDULE to Q2", () => {
      expect(mapQuadrantTypeToUI("SCHEDULE")).toBe("Q2");
    });

    it("should map DELEGATE to Q3", () => {
      expect(mapQuadrantTypeToUI("DELEGATE")).toBe("Q3");
    });

    it("should map ELIMINATE to Q4", () => {
      expect(mapQuadrantTypeToUI("ELIMINATE")).toBe("Q4");
    });
  });

  describe("integration tests", () => {
    it("should handle complex scenario: important task due soon", () => {
      // importance 6, manual urgency 3, due in 6 hours
      const sixHoursLater = new Date(now.getTime() + 6 * 60 * 60 * 1000);
      const result = resolveQuadrant(6, 3, sixHoursLater.toISOString(), now);
      // urgencyDeadline = 6, urgencyFinal = max(3, 6) = 6
      // importance 6, urgencyFinal 6 -> DO_NOW
      expect(result).toBe("DO_NOW");
    });

    it("should handle complex scenario: important task with far deadline", () => {
      // importance 6, manual urgency 3, due in 60 days
      const sixtyDaysLater = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
      const result = resolveQuadrant(6, 3, sixtyDaysLater.toISOString(), now);
      // urgencyDeadline = 1, urgencyFinal = max(3, 1) = 3
      // importance 6, urgencyFinal 3 -> SCHEDULE
      expect(result).toBe("SCHEDULE");
    });

    it("should handle complex scenario: low importance, urgent deadline", () => {
      // importance 2, manual urgency 1, due in 1 hour
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      const result = resolveQuadrant(2, 1, oneHourLater.toISOString(), now);
      // urgencyDeadline = 7, urgencyFinal = max(1, 7) = 7
      // importance 2, urgencyFinal 7 -> DELEGATE
      expect(result).toBe("DELEGATE");
    });

    it("should avoid urgency trap: important task with no deadline", () => {
      // importance 6, manual urgency 2, no deadline
      const result = resolveQuadrant(6, 2, null, now);
      // urgencyDeadline = 1, urgencyFinal = max(2, 1) = 2
      // importance 6, urgencyFinal 2 -> SCHEDULE (not DO_NOW)
      expect(result).toBe("SCHEDULE");
    });
  });
});
