import type { ColorScheme } from "@/lib/_core/theme";

export type GlowType = "overdue" | "old";

/**
 * Theme-specific contrast colors for glow effects
 * Similar to AMOLED neon effect - bright, high-contrast colors
 */
export const GlowColorsByTheme: Record<ColorScheme, Record<GlowType, string>> = {
  light: {
    overdue: "#EF4444", // Bright red for overdue
    old: "#F59E0B", // Amber for old tasks
  },
  dark: {
    overdue: "#FF6B6B", // Vibrant red for overdue
    old: "#FFB84D", // Vibrant amber for old tasks
  },
  amoled: {
    overdue: "#FF1744", // Neon pink/red for overdue
    old: "#FFD600", // Neon yellow for old tasks
  },
  pastel: {
    overdue: "#E8A0A0", // Soft red for overdue
    old: "#F0C987", // Soft amber for old tasks
  },
  notebook: {
    overdue: "#DC2626", // School notebook red for overdue
    old: "#D97706", // School notebook amber for old tasks
  },
  darkMatte: {
    overdue: "#EF4444", // Bright red for overdue
    old: "#F59E0B", // Bright amber for old tasks
  },
};

/**
 * Get glow color for a task based on theme and glow type
 */
export function getGlowColor(theme: ColorScheme, glowType: GlowType): string {
  return GlowColorsByTheme[theme]?.[glowType] || GlowColorsByTheme.light[glowType];
}

/**
 * Determine which glow type should be applied to a task
 * Returns null if no glow should be shown
 */
export function getTaskGlowType(
  task: { dueDate?: string; createdAt: number | string }
): GlowType | null {
  // Check if task is overdue
  if (task.dueDate) {
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    if (dueDate < now) {
      return "overdue";
    }
  }

  // Check if task is old (no dueDate and created >3 days ago)
  if (!task.dueDate) {
    const now = new Date();
    const createdDate = typeof task.createdAt === "number"
      ? new Date(task.createdAt)
      : new Date(task.createdAt);
    const daysDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 3) {
      return "old";
    }
  }

  return null;
}
