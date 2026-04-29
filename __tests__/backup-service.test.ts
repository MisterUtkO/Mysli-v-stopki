import { describe, it, expect } from "vitest";
import {
  validateBackupData,
  isBackupTooOld,
  getBackupSizeInMB,
  sanitizeBackupData,
} from "../lib/services/backup/backup-validation";
import type { BackupData } from "../lib/services/backup/backup-service";

describe("Backup Service", () => {
  describe("validateBackupData", () => {
    it("should validate a correct backup file", () => {
      const validBackup: BackupData = {
        version: "1.1.0",
        timestamp: Date.now(),
        tasks: [
          {
            id: "1",
            title: "Test Task",
            description: "",
            importance: 5,
            urgency: 5,
            dueDate: undefined,
            status: "not_started",
            quadrant: "Q1",
            priorityScore: 50,
            sortOrder: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
        settings: {
          language: "en",
          theme: "light",
          initialScreen: "tasks",
          notificationsEnabled: true,
          soundEnabled: true,
        },
        achievements: {},
      };

      const result = validateBackupData(validBackup);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.stats.taskCount).toBe(1);
    });

    it("should reject backup with missing version", () => {
      const invalidBackup = {
        timestamp: Date.now(),
        tasks: [],
        settings: {},
        achievements: {},
      };

      const result = validateBackupData(invalidBackup);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Missing required field: version");
    });

    it("should reject backup with invalid tasks array", () => {
      const invalidBackup = {
        version: "1.1.0",
        timestamp: Date.now(),
        tasks: "not-an-array",
        settings: {},
        achievements: {},
      };

      const result = validateBackupData(invalidBackup);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("tasks"))).toBe(true);
    });

    it("should warn about invalid importance values", () => {
      const backupWithInvalidImportance: BackupData = {
        version: "1.1.0",
        timestamp: Date.now(),
        tasks: [
          {
            id: "1",
            title: "Test",
            description: "",
            importance: 10, // Invalid: should be 1-7
            urgency: 5,
            dueDate: undefined,
            status: "not_started",
            quadrant: "Q1",
            priorityScore: 50,
            sortOrder: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
        settings: {
          language: "en",
          theme: "light",
          initialScreen: "tasks",
          notificationsEnabled: true,
          soundEnabled: true,
        },
        achievements: {},
      };

      const result = validateBackupData(backupWithInvalidImportance);
      expect(result.warnings.some((w) => w.includes("importance"))).toBe(true);
    });
  });

  describe("isBackupTooOld", () => {
    it("should return false for recent backup", () => {
      const now = Date.now();
      const result = isBackupTooOld(now, 30);
      expect(result).toBe(false);
    });

    it("should return true for old backup", () => {
      const thirtyOneDaysAgo = Date.now() - 31 * 24 * 60 * 60 * 1000;
      const result = isBackupTooOld(thirtyOneDaysAgo, 30);
      expect(result).toBe(true);
    });

    it("should respect custom day threshold", () => {
      const fiveDaysAgo = Date.now() - 5 * 24 * 60 * 60 * 1000;
      expect(isBackupTooOld(fiveDaysAgo, 3)).toBe(true);
      expect(isBackupTooOld(fiveDaysAgo, 7)).toBe(false);
    });
  });

  describe("getBackupSizeInMB", () => {
    it("should calculate backup size correctly", () => {
      const smallBackup = JSON.stringify({ version: "1.0.0", tasks: [] });
      const size = getBackupSizeInMB(smallBackup);
      expect(size).toBeGreaterThan(0);
      expect(size).toBeLessThan(1); // Should be less than 1 MB
    });

    it("should handle large backups", () => {
      const largeTasks = Array.from({ length: 1000 }, (_, i) => ({
        id: `task-${i}`,
        title: `Task ${i}`,
        description: "Lorem ipsum dolor sit amet",
      }));
      const largeBackup = JSON.stringify({
        version: "1.0.0",
        tasks: largeTasks,
      });
      const size = getBackupSizeInMB(largeBackup);
      expect(size).toBeGreaterThan(0);
    });
  });

  describe("sanitizeBackupData", () => {
    it("should remove tasks without required fields", () => {
      const backup: BackupData = {
        version: "1.1.0",
        timestamp: Date.now(),
        tasks: [
          {
            id: "1",
            title: "Valid Task",
            description: "",
            importance: 5,
            urgency: 5,
            dueDate: undefined,
            status: "not_started",
            quadrant: "Q1",
            priorityScore: 50,
            sortOrder: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          {
            id: "2",
            title: "", // Invalid: empty title
            description: "",
            importance: 5,
            urgency: 5,
            dueDate: undefined,
            status: "not_started",
            quadrant: "Q1",
            priorityScore: 50,
            sortOrder: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
        settings: {
          language: "en",
          theme: "light",
          initialScreen: "tasks",
          notificationsEnabled: true,
          soundEnabled: true,
        },
        achievements: {},
      };

      const sanitized = sanitizeBackupData(backup);
      expect(sanitized.tasks).toHaveLength(1);
      expect(sanitized.tasks[0].title).toBe("Valid Task");
    });

    it("should clamp importance and urgency to valid range", () => {
      const backup: BackupData = {
        version: "1.1.0",
        timestamp: Date.now(),
        tasks: [
          {
            id: "1",
            title: "Task with invalid values",
            description: "",
            importance: 10, // Should be clamped to 7
            urgency: 0, // Should be clamped to 1
            dueDate: undefined,
            status: "not_started",
            quadrant: "Q1",
            priorityScore: 50,
            sortOrder: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
        settings: {
          language: "en",
          theme: "light",
          initialScreen: "tasks",
          notificationsEnabled: true,
          soundEnabled: true,
        },
        achievements: {},
      };

      const sanitized = sanitizeBackupData(backup);
      expect(sanitized.tasks[0].importance).toBe(7);
      expect(sanitized.tasks[0].urgency).toBe(1);
    });
  });
});
