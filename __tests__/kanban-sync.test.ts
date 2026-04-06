/**
 * Tests for kanban-sync two-way sync utility
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock AsyncStorage
const store: Record<string, string> = {};
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(async (key: string) => store[key] ?? null),
    setItem: vi.fn(async (key: string, value: string) => { store[key] = value; }),
  },
}));

import {
  addTaskToKanban,
  syncTaskToKanban,
  removeTaskFromKanban,
  getTaskStatusFromKanban,
  isTaskOnKanban,
  KANBAN_STORAGE_KEY,
} from "../lib/kanban-sync";
import type { Task } from "../lib/domain/types";

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: "task-abc-123",
  title: "Test task",
  description: "",
  importance: 5,
  urgency: 5,
  status: "not_started",
  quadrant: "Q1",
  priorityScore: 50,
  sortOrder: 0,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
});

beforeEach(() => {
  // Clear store before each test
  Object.keys(store).forEach((k) => delete store[k]);
});

describe("addTaskToKanban", () => {
  it("adds a not_started task to the first column (index 0)", async () => {
    const task = makeTask({ status: "not_started" });
    const result = await addTaskToKanban(task, false);
    expect(result).toBe(true);

    const data = JSON.parse(store[KANBAN_STORAGE_KEY]);
    expect(data.columns[0].stickers).toHaveLength(1);
    expect(data.columns[0].stickers[0].text).toBe("Test task");
    expect(data.columns[1].stickers).toHaveLength(0);
    expect(data.columns[2].stickers).toHaveLength(0);
  });

  it("adds an in_progress task to the second column (index 1)", async () => {
    const task = makeTask({ status: "in_progress" });
    await addTaskToKanban(task, false);

    const data = JSON.parse(store[KANBAN_STORAGE_KEY]);
    expect(data.columns[0].stickers).toHaveLength(0);
    expect(data.columns[1].stickers).toHaveLength(1);
    expect(data.columns[2].stickers).toHaveLength(0);
  });

  it("adds a completed task to the third column (index 2)", async () => {
    const task = makeTask({ status: "completed" });
    await addTaskToKanban(task, false);

    const data = JSON.parse(store[KANBAN_STORAGE_KEY]);
    expect(data.columns[2].stickers).toHaveLength(1);
  });

  it("returns false if task is already on the board", async () => {
    const task = makeTask();
    await addTaskToKanban(task, false);
    const second = await addTaskToKanban(task, false);
    expect(second).toBe(false);
  });
});

describe("syncTaskToKanban (forward sync)", () => {
  it("updates sticker text when task title changes", async () => {
    const task = makeTask({ status: "not_started" });
    await addTaskToKanban(task, false);

    const updated = { ...task, title: "Updated title" };
    await syncTaskToKanban(updated);

    const data = JSON.parse(store[KANBAN_STORAGE_KEY]);
    expect(data.columns[0].stickers[0].text).toBe("Updated title");
  });

  it("moves sticker to correct column when status changes", async () => {
    const task = makeTask({ status: "not_started" });
    await addTaskToKanban(task, false);

    const updated = { ...task, status: "in_progress" as const };
    await syncTaskToKanban(updated);

    const data = JSON.parse(store[KANBAN_STORAGE_KEY]);
    expect(data.columns[0].stickers).toHaveLength(0);
    expect(data.columns[1].stickers).toHaveLength(1);
    expect(data.columns[1].stickers[0].text).toBe("Test task");
  });

  it("does nothing if task is not on the board", async () => {
    const task = makeTask();
    // Don't add to board first
    await syncTaskToKanban(task);
    // Store should still be empty
    expect(store[KANBAN_STORAGE_KEY]).toBeUndefined();
  });
});

describe("removeTaskFromKanban", () => {
  it("removes the sticker from the board", async () => {
    const task = makeTask({ status: "not_started" });
    await addTaskToKanban(task, false);

    await removeTaskFromKanban(task.id);

    const data = JSON.parse(store[KANBAN_STORAGE_KEY]);
    const allStickers = data.columns.flatMap((c: { stickers: unknown[] }) => c.stickers);
    expect(allStickers).toHaveLength(0);
  });
});

describe("getTaskStatusFromKanban", () => {
  it("returns the correct status based on column position", async () => {
    const task = makeTask({ status: "not_started" });
    await addTaskToKanban(task, false);

    const status = await getTaskStatusFromKanban(task.id);
    expect(status).toBe("not_started");
  });

  it("returns updated status after sync moves the sticker", async () => {
    const task = makeTask({ status: "not_started" });
    await addTaskToKanban(task, false);
    await syncTaskToKanban({ ...task, status: "completed" });

    const status = await getTaskStatusFromKanban(task.id);
    expect(status).toBe("completed");
  });

  it("returns null if task is not on the board", async () => {
    const status = await getTaskStatusFromKanban("nonexistent-id");
    expect(status).toBeNull();
  });
});

describe("isTaskOnKanban", () => {
  it("returns true after adding task", async () => {
    const task = makeTask();
    await addTaskToKanban(task, false);
    expect(await isTaskOnKanban(task.id)).toBe(true);
  });

  it("returns false before adding task", async () => {
    expect(await isTaskOnKanban("nonexistent-id")).toBe(false);
  });

  it("returns false after removing task", async () => {
    const task = makeTask();
    await addTaskToKanban(task, false);
    await removeTaskFromKanban(task.id);
    expect(await isTaskOnKanban(task.id)).toBe(false);
  });
});


describe("Color-coded stickers by quadrant", () => {
  it("uses red color for Q1 tasks", async () => {
    const task = makeTask({ quadrant: "Q1" });
    await addTaskToKanban(task, false);

    const data = JSON.parse(store[KANBAN_STORAGE_KEY]);
    const sticker = data.columns[0].stickers[0];
    expect(sticker.bgColor).toBe("#EF4444"); // red
    expect(sticker.textColor).toBe("#FFFFFF"); // white text
  });

  it("uses orange color for Q2 tasks", async () => {
    const task = makeTask({ quadrant: "Q2" });
    await addTaskToKanban(task, false);

    const data = JSON.parse(store[KANBAN_STORAGE_KEY]);
    const sticker = data.columns[0].stickers[0];
    expect(sticker.bgColor).toBe("#F97316"); // orange
    expect(sticker.textColor).toBe("#FFFFFF");
  });

  it("uses blue color for Q3 tasks", async () => {
    const task = makeTask({ quadrant: "Q3" });
    await addTaskToKanban(task, false);

    const data = JSON.parse(store[KANBAN_STORAGE_KEY]);
    const sticker = data.columns[0].stickers[0];
    expect(sticker.bgColor).toBe("#3B82F6"); // blue
    expect(sticker.textColor).toBe("#FFFFFF");
  });

  it("uses green color for Q4 tasks", async () => {
    const task = makeTask({ quadrant: "Q4" });
    await addTaskToKanban(task, false);

    const data = JSON.parse(store[KANBAN_STORAGE_KEY]);
    const sticker = data.columns[0].stickers[0];
    expect(sticker.bgColor).toBe("#22C55E"); // green
    expect(sticker.textColor).toBe("#FFFFFF");
  });

  it("updates sticker color when task quadrant changes", async () => {
    const task = makeTask({ quadrant: "Q1" });
    await addTaskToKanban(task, false);

    // Change quadrant from Q1 to Q2
    const updated = { ...task, quadrant: "Q2" as const };
    await syncTaskToKanban(updated);

    const data = JSON.parse(store[KANBAN_STORAGE_KEY]);
    const sticker = data.columns[0].stickers[0];
    expect(sticker.bgColor).toBe("#F97316"); // should now be orange
  });
});
