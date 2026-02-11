import type { Task, AchievementDefinition, UnlockedAchievement } from "@/lib/domain/types";
import { ACHIEVEMENTS } from "./definitions";

/**
 * Achievement Checker
 * Evaluates all achievement conditions against current task data
 * Returns newly unlocked achievements
 */

function getStartOfDay(timestamp: number): number {
  const d = new Date(timestamp);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function getTodayStart(): number {
  return getStartOfDay(Date.now());
}

interface CheckContext {
  tasks: Task[];
  allUnlocked: Set<string>;
  streakDays: number;
}

function checkCondition(achievement: AchievementDefinition, ctx: CheckContext): boolean {
  const { tasks } = ctx;
  const todayStart = getTodayStart();

  switch (achievement.conditionType) {
    case "tasks_completed_total": {
      if (achievement.id === "first_task") {
        // Special: first task created
        return tasks.length >= 1;
      }
      const completedCount = tasks.filter((t) => t.status === "completed").length;
      return completedCount >= achievement.conditionValue;
    }

    case "tasks_created_day": {
      const todayTasks = tasks.filter((t) => getStartOfDay(t.createdAt) === todayStart);
      return todayTasks.length >= achievement.conditionValue;
    }

    case "tasks_completed_day": {
      // Count tasks completed today (updatedAt is when status changed)
      const todayCompleted = tasks.filter(
        (t) => t.status === "completed" && getStartOfDay(t.updatedAt) === todayStart
      );
      return todayCompleted.length >= achievement.conditionValue;
    }

    case "streak_days": {
      return ctx.streakDays >= achievement.conditionValue;
    }

    case "q1_completed": {
      const q1Completed = tasks.filter((t) => t.quadrant === "Q1" && t.status === "completed");
      return q1Completed.length >= achievement.conditionValue;
    }

    case "all_quadrants": {
      const quadrants = new Set(tasks.filter((t) => t.status !== "completed").map((t) => t.quadrant));
      return quadrants.size >= 4;
    }

    case "custom":
      return false; // Custom achievements require manual implementation

    default:
      return false;
  }
}

/**
 * Calculate streak days based on task activity
 */
export function calculateStreakDays(tasks: Task[]): number {
  if (tasks.length === 0) return 0;

  // Get unique days with activity (created or updated)
  const activityDays = new Set<number>();
  for (const task of tasks) {
    activityDays.add(getStartOfDay(task.createdAt));
    activityDays.add(getStartOfDay(task.updatedAt));
  }

  const sortedDays = Array.from(activityDays).sort((a, b) => b - a);
  const today = getTodayStart();
  const oneDayMs = 86400000;

  // Check if today or yesterday has activity
  if (sortedDays[0] < today - oneDayMs) return 0;

  let streak = 1;
  let currentDay = sortedDays[0];

  for (let i = 1; i < sortedDays.length; i++) {
    if (currentDay - sortedDays[i] === oneDayMs) {
      streak++;
      currentDay = sortedDays[i];
    } else if (currentDay - sortedDays[i] > oneDayMs) {
      break;
    }
  }

  return streak;
}

/**
 * Check all achievements and return newly unlocked ones
 */
export function checkAchievements(
  tasks: Task[],
  alreadyUnlocked: UnlockedAchievement[]
): AchievementDefinition[] {
  const unlockedIds = new Set(alreadyUnlocked.map((u) => u.achievementId));
  const streakDays = calculateStreakDays(tasks);

  const ctx: CheckContext = {
    tasks,
    allUnlocked: unlockedIds,
    streakDays,
  };

  const newlyUnlocked: AchievementDefinition[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (unlockedIds.has(achievement.id)) continue;
    if (checkCondition(achievement, ctx)) {
      newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
}
