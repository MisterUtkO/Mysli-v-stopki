import type { Task, Quadrant, NotificationFrequency, TaskAttachment } from "./types";

export interface ScoringConfig {
  importanceThreshold: number; // 1-7
  urgencyThreshold: number; // 1-7
}

/**
 * Calculate priority score based on importance and urgency (1-7 scale)
 * Score is normalized to 0-100 range
 */
export function calculatePriorityScore(
  importance: number,
  urgency: number
): number {
  // Normalize 1-7 scale to 0-1 range
  const normalizedImportance = (importance - 1) / 6;
  const normalizedUrgency = (urgency - 1) / 6;

  // Average of both metrics
  const avgScore = (normalizedImportance + normalizedUrgency) / 2;

  // Scale to 0-100
  return Math.round(avgScore * 100);
}

/**
 * Determine quadrant based on importance and urgency thresholds
 */
export function determineQuadrant(
  importance: number,
  urgency: number,
  config: ScoringConfig
): Quadrant {
  const isImportant = importance >= config.importanceThreshold;
  const isUrgent = urgency >= config.urgencyThreshold;

  if (isImportant && isUrgent) return "Q1"; // Do Now - Red
  if (isImportant && !isUrgent) return "Q2"; // Schedule - Orange
  if (!isImportant && isUrgent) return "Q3"; // Delegate - Blue
  return "Q4"; // Delete - Green
}

/**
 * Create a task with calculated priority score and quadrant.
 * Accepts partial task data (without id, createdAt, updatedAt, priorityScore, quadrant, sortOrder)
 * and returns the data enriched with priorityScore and quadrant.
 */
export function createTaskWithScoring(
  taskInput: {
    title: string;
    description: string;
    importance: number;
    urgency: number;
    dueDate?: string;
    dueTime?: string;
    status: string;
    emoji?: string;
    notificationFrequency?: NotificationFrequency;
    attachments?: TaskAttachment[];
  },
  config: ScoringConfig
): Omit<Task, "id" | "createdAt" | "updatedAt"> {
  const priorityScore = calculatePriorityScore(taskInput.importance, taskInput.urgency);
  const quadrant = determineQuadrant(taskInput.importance, taskInput.urgency, config);

  return {
    title: taskInput.title,
    description: taskInput.description,
    importance: taskInput.importance,
    urgency: taskInput.urgency,
    dueDate: taskInput.dueDate,
    dueTime: taskInput.dueTime,
    status: taskInput.status as Task["status"],
    emoji: taskInput.emoji,
    sortOrder: 0, // Will be overridden by db
    notificationFrequency: taskInput.notificationFrequency || "global",
    attachments: taskInput.attachments || [],
    priorityScore,
    quadrant,
  };
}

/**
 * Sort tasks by priority score (highest first)
 */
export function sortTasksByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => b.priorityScore - a.priorityScore);
}

/**
 * Filter tasks by quadrant
 */
export function filterTasksByQuadrant(tasks: Task[], quadrant: Quadrant): Task[] {
  return tasks.filter((task) => task.quadrant === quadrant);
}
