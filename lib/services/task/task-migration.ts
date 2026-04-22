/**
 * Task Migration Service
 * 
 * Handles migration of existing tasks to use new quadrant logic
 * and applies interface improvements to existing data
 */

import type { Task, Quadrant } from "@/lib/domain/types";
import {
  resolveQuadrant,
  mapQuadrantTypeToUI,
  buildPriorityReason,
  calculateDeadlineUrgency,
  calculateFinalUrgency,
} from "@/lib/domain/quadrant-logic";

/**
 * Extended task with computed urgency fields
 */
export interface TaskWithComputedUrgency extends Task {
  urgencyManual: number; // The original urgency field
  urgencyDeadline: number; // Computed from deadline
  urgencyFinal: number; // Max of manual and deadline
  priorityReason: string; // Human-readable reason for quadrant
}

/**
 * Migrate a single task to use new quadrant logic
 * 
 * This function:
 * 1. Computes deadline-based urgency
 * 2. Calculates final urgency
 * 3. Determines new quadrant using hybrid logic
 * 4. Generates priority reason for UI
 */
export function migrateTaskToNewLogic(
  task: Task,
  now: Date = new Date()
): Partial<Task> & { priorityReason?: string } {
  const urgencyManual = task.urgency; // Use existing urgency as manual urgency
  const urgencyDeadline = calculateDeadlineUrgency(
    task.dueDate ? `${task.dueDate}T${task.dueTime || "00:00"}` : null,
    now
  );
  const urgencyFinal = calculateFinalUrgency(urgencyManual, urgencyDeadline);

  // Resolve new quadrant using hybrid logic
  const newQuadrantType = resolveQuadrant(
    task.importance,
    urgencyManual,
    task.dueDate ? `${task.dueDate}T${task.dueTime || "00:00"}` : null,
    now
  );
  const newQuadrant = mapQuadrantTypeToUI(newQuadrantType);

  // Build priority reason
  const priorityReason = buildPriorityReason(
    task.importance,
    urgencyManual,
    task.dueDate ? `${task.dueDate}T${task.dueTime || "00:00"}` : null,
    newQuadrantType,
    now
  );

  return {
    quadrant: newQuadrant,
    urgency: urgencyFinal, // Update urgency to final value
    priorityReason,
  };
}

/**
 * Migrate all tasks to use new quadrant logic
 * 
 * Returns array of tasks with updated quadrants and urgency values
 */
export function migrateAllTasksToNewLogic(
  tasks: Task[],
  now: Date = new Date()
): Array<Partial<Task> & { id: string; priorityReason?: string }> {
  return tasks.map((task) => ({
    id: task.id,
    ...migrateTaskToNewLogic(task, now),
  }));
}

/**
 * Get computed urgency fields for a task
 */
export function getComputedUrgency(
  task: Task,
  now: Date = new Date()
): {
  urgencyManual: number;
  urgencyDeadline: number;
  urgencyFinal: number;
} {
  const urgencyManual = task.urgency;
  const urgencyDeadline = calculateDeadlineUrgency(
    task.dueDate ? `${task.dueDate}T${task.dueTime || "00:00"}` : null,
    now
  );
  const urgencyFinal = calculateFinalUrgency(urgencyManual, urgencyDeadline);

  return {
    urgencyManual,
    urgencyDeadline,
    urgencyFinal,
  };
}

/**
 * Sort tasks within a quadrant according to business rules
 * 
 * DO_NOW: urgencyFinal desc, dueAt asc (nearest first), importance desc
 * SCHEDULE: importance desc, dueAt asc
 * DELEGATE: urgencyFinal desc, dueAt asc
 * ELIMINATE: importance asc, urgencyFinal asc
 */
export function sortTasksByQuadrant(
  tasks: Task[],
  quadrant: Quadrant,
  now: Date = new Date()
): Task[] {
  const sorted = [...tasks];

  switch (quadrant) {
    case "Q1": // DO_NOW
      return sorted.sort((a, b) => {
        const aUrgency = calculateFinalUrgency(a.urgency, calculateDeadlineUrgency(a.dueDate ? `${a.dueDate}T${a.dueTime || "00:00"}` : null, now));
        const bUrgency = calculateFinalUrgency(b.urgency, calculateDeadlineUrgency(b.dueDate ? `${b.dueDate}T${b.dueTime || "00:00"}` : null, now));

        // urgencyFinal descending
        if (aUrgency !== bUrgency) return bUrgency - aUrgency;

        // dueAt ascending (nearest first, nulls last)
        const aDue = a.dueDate ? new Date(`${a.dueDate}T${a.dueTime || "00:00"}`).getTime() : Infinity;
        const bDue = b.dueDate ? new Date(`${b.dueDate}T${b.dueTime || "00:00"}`).getTime() : Infinity;
        if (aDue !== bDue) return aDue - bDue;

        // importance descending
        return b.importance - a.importance;
      });

    case "Q2": // SCHEDULE
      return sorted.sort((a, b) => {
        // importance descending
        if (a.importance !== b.importance) return b.importance - a.importance;

        // dueAt ascending (nulls last)
        const aDue = a.dueDate ? new Date(`${a.dueDate}T${a.dueTime || "00:00"}`).getTime() : Infinity;
        const bDue = b.dueDate ? new Date(`${b.dueDate}T${b.dueTime || "00:00"}`).getTime() : Infinity;
        return aDue - bDue;
      });

    case "Q3": // DELEGATE
      return sorted.sort((a, b) => {
        const aUrgency = calculateFinalUrgency(a.urgency, calculateDeadlineUrgency(a.dueDate ? `${a.dueDate}T${a.dueTime || "00:00"}` : null, now));
        const bUrgency = calculateFinalUrgency(b.urgency, calculateDeadlineUrgency(b.dueDate ? `${b.dueDate}T${b.dueTime || "00:00"}` : null, now));

        // urgencyFinal descending
        if (aUrgency !== bUrgency) return bUrgency - aUrgency;

        // dueAt ascending (nulls last)
        const aDue = a.dueDate ? new Date(`${a.dueDate}T${a.dueTime || "00:00"}`).getTime() : Infinity;
        const bDue = b.dueDate ? new Date(`${b.dueDate}T${b.dueTime || "00:00"}`).getTime() : Infinity;
        return aDue - bDue;
      });

    case "Q4": // ELIMINATE
      return sorted.sort((a, b) => {
        // importance ascending
        if (a.importance !== b.importance) return a.importance - b.importance;

        const aUrgency = calculateFinalUrgency(a.urgency, calculateDeadlineUrgency(a.dueDate ? `${a.dueDate}T${a.dueTime || "00:00"}` : null, now));
        const bUrgency = calculateFinalUrgency(b.urgency, calculateDeadlineUrgency(b.dueDate ? `${b.dueDate}T${b.dueTime || "00:00"}` : null, now));

        // urgencyFinal ascending
        return aUrgency - bUrgency;
      });

    default:
      return sorted;
  }
}

/**
 * Group tasks by quadrant and sort within each quadrant
 */
export function groupAndSortTasksByQuadrant(
  tasks: Task[],
  now: Date = new Date()
): Record<Quadrant, Task[]> {
  const quadrants: Record<Quadrant, Task[]> = {
    Q1: [],
    Q2: [],
    Q3: [],
    Q4: [],
  };

  // Group tasks
  tasks.forEach((task) => {
    quadrants[task.quadrant].push(task);
  });

  // Sort within each quadrant
  Object.keys(quadrants).forEach((q) => {
    quadrants[q as Quadrant] = sortTasksByQuadrant(
      quadrants[q as Quadrant],
      q as Quadrant,
      now
    );
  });

  return quadrants;
}
