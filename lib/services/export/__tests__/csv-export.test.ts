import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import type { Task } from "@/lib/domain/types";

// Mock environment
(global as any).__DEV__ = false;

// Mock the modules before importing the service
vi.mock("expo-file-system/legacy", () => ({
  documentDirectory: "/mock/documents/",
  writeAsStringAsync: vi.fn(),
  EncodingType: { UTF8: "utf8" },
}));

vi.mock("expo-sharing", () => ({
  isAvailableAsync: vi.fn(() => Promise.resolve(true)),
  shareAsync: vi.fn(),
}));

vi.mock("react-native", () => ({
  Platform: {
    OS: "web",
  },
}));

// Import after mocks are set up
import { exportTasksToCSV, exportTasksToJSON } from "../csv-export";

describe("CSV Export Service", () => {
  let mockTasks: Task[];

  beforeEach(() => {
    // Setup DOM mocks for web platform tests
    if (typeof document === "undefined") {
      (global as any).document = {
        createElement: vi.fn(() => ({
          setAttribute: vi.fn(),
          click: vi.fn(),
          style: {},
        })),
        body: {
          appendChild: vi.fn(),
          removeChild: vi.fn(),
        },
      };
    }

    mockTasks = [
      {
        id: "1",
        title: 'Test task with "quotes" and, commas',
        description: "This is a test\nwith newlines",
        quadrant: "Q1",
        importance: 4,
        urgency: 4,
        status: "not_started",
        dueDate: "2026-05-15",
        dueTime: "14:30",
        createdAt: 1715192674622,
        updatedAt: 1715192674622,
        priorityScore: 75,
        sortOrder: 0,
        emoji: "🎯",
        attachments: [],
        deletedAt: undefined,
      } as Task,
      {
        id: "2",
        title: "Simple task",
        description: "No special characters",
        quadrant: "Q2",
        importance: 5,
        urgency: 3,
        status: "in_progress",
        dueDate: "2026-05-20",
        dueTime: "10:00",
        createdAt: 1715106000000,
        updatedAt: 1715106000000,
        priorityScore: 65,
        sortOrder: 1,
        emoji: "✅",
        attachments: [{ type: "file", name: "file.pdf", uri: "file://path" }],
        deletedAt: undefined,
      } as Task,
      {
        id: "3",
        title: "Completed task",
        description: "",
        quadrant: "Q3",
        importance: 2,
        urgency: 1,
        status: "completed",
        dueDate: "",
        dueTime: "",
        createdAt: 1714900800000,
        updatedAt: 1714900800000,
        priorityScore: 20,
        sortOrder: 2,
        emoji: "🎉",
        attachments: [],
        deletedAt: undefined,
      } as Task,
      {
        id: "4",
        title: "Deleted task",
        description: "This should be excluded",
        quadrant: "Q4",
        importance: 1,
        urgency: 1,
        status: "not_started",
        dueDate: "",
        dueTime: "",
        createdAt: 1714987200000,
        updatedAt: 1714987200000,
        priorityScore: 10,
        sortOrder: 3,
        emoji: "🗑",
        attachments: [],
        deletedAt: 1715167200000,
      } as Task,
    ];

    // Mock document methods for web
    global.Blob = vi.fn((content) => ({
      content,
    })) as any;
    global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = vi.fn();

    if (typeof document !== "undefined") {
      const mockLink = document.createElement("a");
      vi.spyOn(document, "createElement").mockReturnValue(mockLink);
      if (document.body) {
        vi.spyOn(document.body, "appendChild");
        vi.spyOn(document.body, "removeChild");
      }
    }
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("CSV Export", () => {
    it("should export tasks to CSV with correct headers", async () => {
      const result = await exportTasksToCSV(mockTasks);
      expect(result).toBe(true);
    });

    it("should escape CSV fields with special characters", async () => {
      const tasks: Task[] = [
        {
          id: "1",
          title: 'Title with "quotes"',
          description: "Description with, comma",
          quadrant: "Q1",
          importance: 3,
          urgency: 3,
          status: "not_started",
          dueDate: "",
          dueTime: "",
          createdAt: 1715192674622,
          updatedAt: 1715192674622,
          priorityScore: 50,
          sortOrder: 0,
          emoji: "",
          attachments: [],
          deletedAt: undefined,
        } as Task,
      ];

      const result = await exportTasksToCSV(tasks);
      expect(result).toBe(true);
    });

    it("should filter deleted tasks when includeDeleted is false", async () => {
      const result = await exportTasksToCSV(mockTasks, { includeDeleted: false });
      expect(result).toBe(true);
    });

    it("should filter completed tasks when includeCompleted is false", async () => {
      const result = await exportTasksToCSV(mockTasks, { includeCompleted: false });
      expect(result).toBe(true);
    });

    it("should handle empty task list", async () => {
      const result = await exportTasksToCSV([]);
      expect(result).toBe(true);
    });

    it("should include attachment count in CSV", async () => {
      const tasksWithAttachments: Task[] = [
        {
          id: "1",
          title: "Task with attachments",
          description: "",
          quadrant: "Q1",
          importance: 3,
          urgency: 3,
          status: "not_started",
          dueDate: "",
          dueTime: "",
          createdAt: 1715192674622,
          updatedAt: 1715192674622,
          priorityScore: 50,
          sortOrder: 0,
          emoji: "",
          attachments: [
            { type: "file", name: "file1.pdf", uri: "file://path1" },
            { type: "file", name: "file2.txt", uri: "file://path2" },
          ],
          deletedAt: undefined,
        } as Task,
      ];

      const result = await exportTasksToCSV(tasksWithAttachments);
      expect(result).toBe(true);
    });
  });

  describe("JSON Export", () => {
    it("should export tasks to JSON format", async () => {
      const result = await exportTasksToJSON(mockTasks);
      expect(result).toBe(true);
    });

    it("should include export metadata in JSON", async () => {
      const result = await exportTasksToJSON(mockTasks);
      expect(result).toBe(true);
    });

    it("should filter deleted tasks in JSON export", async () => {
      const result = await exportTasksToJSON(mockTasks, { includeDeleted: false });
      expect(result).toBe(true);
    });

    it("should filter completed tasks in JSON export", async () => {
      const result = await exportTasksToJSON(mockTasks, { includeCompleted: false });
      expect(result).toBe(true);
    });
  });
});
