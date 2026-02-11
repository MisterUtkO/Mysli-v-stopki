import { describe, it, expect } from "vitest";
import { checkAchievements, calculateStreakDays } from "./checker";
import type { Task, UnlockedAchievement } from "@/lib/domain/types";

function makeTask(overrides: Partial<Task> = {}): Task {
  const now = Date.now();
  return {
    id: Math.random().toString(36).slice(2),
    title: "Test task",
    description: "",
    importance: 4,
    urgency: 4,
    status: "not_started",
    quadrant: "Q1",
    priorityScore: 50,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("checkAchievements", () => {
  it("unlocks first_task when at least 1 task exists", () => {
    const tasks = [makeTask()];
    const result = checkAchievements(tasks, []);
    const ids = result.map((a) => a.id);
    expect(ids).toContain("first_task");
  });

  it("does not re-unlock already unlocked achievements", () => {
    const tasks = [makeTask()];
    const alreadyUnlocked: UnlockedAchievement[] = [
      { achievementId: "first_task", unlockedAt: Date.now() },
    ];
    const result = checkAchievements(tasks, alreadyUnlocked);
    const ids = result.map((a) => a.id);
    expect(ids).not.toContain("first_task");
  });

  it("unlocks five_done when 5 tasks are completed", () => {
    const tasks = Array.from({ length: 5 }, () =>
      makeTask({ status: "completed" })
    );
    const result = checkAchievements(tasks, []);
    const ids = result.map((a) => a.id);
    expect(ids).toContain("five_done");
  });

  it("unlocks workhorse when 10 tasks created today", () => {
    const tasks = Array.from({ length: 10 }, () => makeTask());
    const result = checkAchievements(tasks, []);
    const ids = result.map((a) => a.id);
    expect(ids).toContain("workhorse");
  });

  it("unlocks all_quadrants when tasks in all 4 quadrants", () => {
    const tasks = [
      makeTask({ quadrant: "Q1" }),
      makeTask({ quadrant: "Q2" }),
      makeTask({ quadrant: "Q3" }),
      makeTask({ quadrant: "Q4" }),
    ];
    const result = checkAchievements(tasks, []);
    const ids = result.map((a) => a.id);
    expect(ids).toContain("all_quadrants");
  });

  it("does not unlock all_quadrants with only 3 quadrants", () => {
    const tasks = [
      makeTask({ quadrant: "Q1" }),
      makeTask({ quadrant: "Q2" }),
      makeTask({ quadrant: "Q3" }),
    ];
    const result = checkAchievements(tasks, []);
    const ids = result.map((a) => a.id);
    expect(ids).not.toContain("all_quadrants");
  });

  it("unlocks q1_master when 10 Q1 tasks completed", () => {
    const tasks = Array.from({ length: 10 }, () =>
      makeTask({ quadrant: "Q1", status: "completed" })
    );
    const result = checkAchievements(tasks, []);
    const ids = result.map((a) => a.id);
    expect(ids).toContain("q1_master");
  });
});

describe("calculateStreakDays", () => {
  it("returns 0 for empty tasks", () => {
    expect(calculateStreakDays([])).toBe(0);
  });

  it("returns 1 for tasks created today", () => {
    const tasks = [makeTask()];
    expect(calculateStreakDays(tasks)).toBe(1);
  });

  it("returns 3 for tasks on 3 consecutive days", () => {
    const now = Date.now();
    const oneDay = 86400000;
    const tasks = [
      makeTask({ createdAt: now, updatedAt: now }),
      makeTask({ createdAt: now - oneDay, updatedAt: now - oneDay }),
      makeTask({ createdAt: now - 2 * oneDay, updatedAt: now - 2 * oneDay }),
    ];
    expect(calculateStreakDays(tasks)).toBe(3);
  });

  it("breaks streak on gap day", () => {
    const now = Date.now();
    const oneDay = 86400000;
    const tasks = [
      makeTask({ createdAt: now, updatedAt: now }),
      // Skip one day
      makeTask({ createdAt: now - 2 * oneDay, updatedAt: now - 2 * oneDay }),
    ];
    expect(calculateStreakDays(tasks)).toBe(1);
  });
});
