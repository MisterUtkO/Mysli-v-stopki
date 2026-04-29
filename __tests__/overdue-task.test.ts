import { describe, it, expect } from "vitest";
import type { Task } from "@/lib/domain/types";

/**
 * Check if a task is overdue (has dueDate and it's in the past)
 */
function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate) return false;
  const now = new Date();
  const dueDate = new Date(task.dueDate);
  return dueDate < now;
}

describe("Overdue Task Detection", () => {
  it("should detect task as overdue when dueDate is in the past", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1); // Yesterday

    const task: Partial<Task> = {
      id: "1",
      title: "Test Task",
      dueDate: pastDate.toISOString(),
      importance: 5,
      urgency: 5,
      status: "not_started",
      createdAt: Date.now(),
    };

    expect(isTaskOverdue(task as Task)).toBe(true);
  });

  it("should not detect task as overdue when dueDate is in the future", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1); // Tomorrow

    const task: Partial<Task> = {
      id: "2",
      title: "Test Task",
      dueDate: futureDate.toISOString(),
      importance: 5,
      urgency: 5,
      status: "not_started",
      createdAt: Date.now(),
    };

    expect(isTaskOverdue(task as Task)).toBe(false);
  });

  it("should not detect task as overdue when no dueDate is set", () => {
    const task: Partial<Task> = {
      id: "3",
      title: "Test Task",
      dueDate: undefined,
      importance: 5,
      urgency: 5,
      status: "not_started",
      createdAt: Date.now(),
    };

    expect(isTaskOverdue(task as Task)).toBe(false);
  });

  it("should detect task as overdue when dueDate is today but time has passed", () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today

    const task: Partial<Task> = {
      id: "4",
      title: "Test Task",
      dueDate: today.toISOString(),
      importance: 5,
      urgency: 5,
      status: "not_started",
      createdAt: Date.now(),
    };

    // This test depends on current time, so we check if it's past midnight
    const now = new Date();
    const isAfterMidnight = now.getHours() > 0 || now.getMinutes() > 0;

    if (isAfterMidnight) {
      expect(isTaskOverdue(task as Task)).toBe(true);
    }
  });
});
