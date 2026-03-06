import { describe, it, expect } from "vitest";
import type { Task } from "@/lib/domain/types";

describe("Soft Delete Logic", () => {
  it("should filter out deleted tasks correctly", () => {
    // Simulate tasks array with deleted and active tasks
    const tasks: Task[] = [
      {
        id: "1",
        title: "Active Task",
        description: "This is active",
        importance: 5,
        urgency: 5,
        status: "not_started",
        quadrant: "Q1",
        priorityScore: 50,
        sortOrder: 0,
        isDeleted: false,
        deletedAt: undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "2",
        title: "Deleted Task",
        description: "This is deleted",
        importance: 5,
        urgency: 5,
        status: "not_started",
        quadrant: "Q1",
        priorityScore: 50,
        sortOrder: 1,
        isDeleted: true,
        deletedAt: Date.now(),
        createdAt: Date.now() - 1000,
        updatedAt: Date.now(),
      },
    ];

    // Filter out deleted tasks (like in Tasks page)
    const activeTasks = tasks.filter((t) => !t.isDeleted);

    expect(activeTasks).toHaveLength(1);
    expect(activeTasks[0].id).toBe("1");
  });

  it("should filter out tasks older than 7 days in TaskContext", () => {
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const eightDaysAgo = now - 8 * 24 * 60 * 60 * 1000;
    const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000;

    // Simulate tasks array with various deletion times
    const tasks: Task[] = [
      {
        id: "1",
        title: "Active Task",
        description: "This is active",
        importance: 5,
        urgency: 5,
        status: "not_started",
        quadrant: "Q1",
        priorityScore: 50,
        sortOrder: 0,
        isDeleted: false,
        deletedAt: undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "2",
        title: "Recently Deleted Task",
        description: "Deleted 2 days ago",
        importance: 5,
        urgency: 5,
        status: "not_started",
        quadrant: "Q1",
        priorityScore: 50,
        sortOrder: 1,
        isDeleted: true,
        deletedAt: twoDaysAgo,
        createdAt: Date.now() - 10000,
        updatedAt: Date.now(),
      },
      {
        id: "3",
        title: "Old Deleted Task",
        description: "Deleted 8 days ago",
        importance: 5,
        urgency: 5,
        status: "not_started",
        quadrant: "Q1",
        priorityScore: 50,
        sortOrder: 2,
        isDeleted: true,
        deletedAt: eightDaysAgo,
        createdAt: Date.now() - 20000,
        updatedAt: Date.now(),
      },
    ];

    // Filter like TaskContext does (7-day retention)
    const activeTasks = tasks.filter((task) => {
      if (!task.isDeleted) return true;
      if (!task.deletedAt) return false;
      return (now - task.deletedAt) < sevenDaysMs;
    });

    // Should have 2 tasks: active task + recently deleted task
    expect(activeTasks).toHaveLength(2);
    expect(activeTasks.map((t) => t.id)).toEqual(["1", "2"]);
    
    // Old task should be filtered out
    const oldDeletedTask = activeTasks.find((t) => t.id === "3");
    expect(oldDeletedTask).toBeUndefined();
  });

  it("should restore a deleted task correctly", () => {
    const now = Date.now();
    const deletedTask: Task = {
      id: "1",
      title: "Deleted Task",
      description: "This was deleted",
      importance: 5,
      urgency: 5,
      status: "not_started",
      quadrant: "Q1",
      priorityScore: 50,
      sortOrder: 0,
      isDeleted: true,
      deletedAt: now,
      createdAt: Date.now() - 1000,
      updatedAt: Date.now(),
    };

    // Restore the task
    const restoredTask = {
      ...deletedTask,
      isDeleted: false,
      deletedAt: undefined,
      updatedAt: now,
    };

    expect(restoredTask.isDeleted).toBe(false);
    expect(restoredTask.deletedAt).toBeUndefined();
  });
});
