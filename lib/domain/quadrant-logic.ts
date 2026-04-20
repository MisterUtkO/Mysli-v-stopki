/**
 * Quadrant Logic - Hybrid Prioritization System
 * 
 * Combines manual urgency with deadline-based urgency to determine task quadrant.
 * - importance: fully manual (1-7)
 * - urgency: combination of manual urgency and deadline-based urgency
 * - deadline affects urgency only, never importance
 */

import type { Quadrant } from "./types";

export type QuadrantType = "DO_NOW" | "SCHEDULE" | "DELEGATE" | "ELIMINATE";

/**
 * Calculate urgency based on deadline
 * 
 * Rules:
 * - if dueAt is null -> urgencyDeadline = 1
 * - if dueAt is overdue -> urgencyDeadline = 7
 * - if time remaining <= 2 hours -> urgencyDeadline = 7
 * - if time remaining <= 12 hours -> urgencyDeadline = 6
 * - if time remaining <= 24 hours -> urgencyDeadline = 6
 * - if time remaining <= 3 days -> urgencyDeadline = 5
 * - if time remaining <= 7 days -> urgencyDeadline = 4
 * - if time remaining <= 14 days -> urgencyDeadline = 3
 * - if time remaining <= 30 days -> urgencyDeadline = 2
 * - if time remaining > 30 days -> urgencyDeadline = 1
 */
export function calculateDeadlineUrgency(
  dueAt: string | null | undefined,
  now: Date = new Date()
): number {
  if (!dueAt) return 1;

  const dueDate = new Date(dueAt);
  const timeRemaining = dueDate.getTime() - now.getTime();

  // Overdue
  if (timeRemaining < 0) return 7;

  // Convert milliseconds to hours and days
  const hoursRemaining = timeRemaining / (1000 * 60 * 60);
  const daysRemaining = hoursRemaining / 24;

  if (hoursRemaining <= 2) return 7;
  if (hoursRemaining <= 12) return 6;
  if (hoursRemaining <= 24) return 6;
  if (daysRemaining <= 3) return 5;
  if (daysRemaining <= 7) return 4;
  if (daysRemaining <= 14) return 3;
  if (daysRemaining <= 30) return 2;
  return 1;
}

/**
 * Calculate final urgency as max of manual and deadline-based urgency
 * 
 * Rule: urgencyFinal = max(urgencyManual, urgencyDeadline)
 * Do not average them. Do not let deadline reduce the manually selected urgency.
 */
export function calculateFinalUrgency(
  urgencyManual: number,
  urgencyDeadline: number
): number {
  return Math.max(urgencyManual, urgencyDeadline);
}

/**
 * Check if task is overdue
 */
export function isOverdue(
  dueAt: string | null | undefined,
  now: Date = new Date()
): boolean {
  if (!dueAt) return false;
  const dueDate = new Date(dueAt);
  return dueDate.getTime() < now.getTime();
}

/**
 * Resolve quadrant based on importance, urgency, and deadline
 * 
 * Quadrant Rules:
 * 1. DO_NOW: if importance >= 6 AND urgencyFinal >= 6
 * 2. SCHEDULE: if importance >= 5 AND urgencyFinal <= 5
 * 3. DELEGATE: if importance <= 4 AND urgencyFinal >= 5
 * 4. ELIMINATE: everything else
 * 
 * Special Overrides:
 * - if importance == 5 AND urgencyFinal == 5 -> force SCHEDULE
 * - if task is overdue AND importance >= 5 -> force DO_NOW
 */
export function resolveQuadrant(
  importance: number,
  urgencyManual: number,
  dueAt: string | null | undefined,
  now: Date = new Date()
): QuadrantType {
  const urgencyDeadline = calculateDeadlineUrgency(dueAt, now);
  const urgencyFinal = calculateFinalUrgency(urgencyManual, urgencyDeadline);
  const overdue = isOverdue(dueAt, now);

  // Special override: overdue + importance >= 5 -> DO_NOW
  if (overdue && importance >= 5) {
    return "DO_NOW";
  }

  // Special override: importance == 5 AND urgencyFinal == 5 -> SCHEDULE
  if (importance === 5 && urgencyFinal === 5) {
    return "SCHEDULE";
  }

  // Standard rules
  if (importance >= 6 && urgencyFinal >= 6) {
    return "DO_NOW";
  }

  if (importance >= 5 && urgencyFinal <= 5) {
    return "SCHEDULE";
  }

  if (importance <= 4 && urgencyFinal >= 5) {
    return "DELEGATE";
  }

  return "ELIMINATE";
}

/**
 * Build human-readable reason for quadrant assignment
 */
export function buildPriorityReason(
  importance: number,
  urgencyManual: number,
  dueAt: string | null | undefined,
  quadrant: QuadrantType,
  now: Date = new Date()
): string {
  const urgencyDeadline = calculateDeadlineUrgency(dueAt, now);
  const urgencyFinal = calculateFinalUrgency(urgencyManual, urgencyDeadline);
  const overdue = isOverdue(dueAt, now);

  // Check special overrides first
  if (overdue && importance >= 5) {
    return "Overdue & Important";
  }

  if (importance === 5 && urgencyFinal === 5) {
    return "Important & Urgent (Balanced)";
  }

  // Build reason based on quadrant
  switch (quadrant) {
    case "DO_NOW":
      if (overdue) return "Overdue";
      if (urgencyDeadline >= 6 && urgencyManual >= 6) return "High importance & urgency";
      if (urgencyDeadline >= 6) return `Due in ${getTimeUntilDue(dueAt, now)}`;
      return "High importance & urgency";

    case "SCHEDULE":
      if (urgencyManual > urgencyDeadline) return "Manual urgency is higher than deadline urgency";
      return "Important, not yet critical";

    case "DELEGATE":
      if (urgencyDeadline >= 5) return `Due in ${getTimeUntilDue(dueAt, now)}`;
      return "Urgent but not important";

    case "ELIMINATE":
      if (!dueAt) return "No deadline";
      return "Low priority";

    default:
      return "Unassigned";
  }
}

/**
 * Get human-readable time until due
 */
function getTimeUntilDue(
  dueAt: string | null | undefined,
  now: Date = new Date()
): string {
  if (!dueAt) return "No deadline";

  const dueDate = new Date(dueAt);
  const timeRemaining = dueDate.getTime() - now.getTime();

  if (timeRemaining < 0) return "Overdue";

  const hoursRemaining = timeRemaining / (1000 * 60 * 60);
  const daysRemaining = hoursRemaining / 24;

  if (hoursRemaining < 1) return "< 1 hour";
  if (hoursRemaining < 24) return `${Math.round(hoursRemaining)} hours`;
  if (daysRemaining < 7) return `${Math.round(daysRemaining)} days`;
  return `${Math.round(daysRemaining / 7)} weeks`;
}

/**
 * Map QuadrantType to Quadrant UI enum
 */
export function mapQuadrantTypeToUI(quadrantType: QuadrantType): Quadrant {
  switch (quadrantType) {
    case "DO_NOW":
      return "Q1";
    case "SCHEDULE":
      return "Q2";
    case "DELEGATE":
      return "Q3";
    case "ELIMINATE":
      return "Q4";
    default:
      return "Q4";
  }
}
