/**
 * SDVGNote — Task Priority App Types
 * Uses 7-point scale for importance and urgency
 */

export type TaskStatus = "not_started" | "in_progress" | "completed";

export type Quadrant = "Q1" | "Q2" | "Q3" | "Q4";

export type NotificationFrequency = "global" | "never" | "10min" | "30min" | "hourly" | "daily" | "weekly";

export interface ScoringConfig {
  importanceThreshold: number; // 1-7
  urgencyThreshold: number; // 1-7
}

export interface TaskAttachment {
  uri: string;
  type: "image" | "file";
  name: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  importance: number; // 1-7 scale
  urgency: number; // 1-7 scale
  dueDate?: string; // ISO 8601 date (YYYY-MM-DD)
  dueTime?: string; // HH:MM format
  status: TaskStatus;
  quadrant: Quadrant;
  priorityScore: number; // 0-100
  emoji?: string; // Optional emoji for visual identification
  sortOrder: number; // Custom sort order for drag-and-drop
  notificationFrequency?: NotificationFrequency; // Per-task notification override
  attachments?: TaskAttachment[]; // File attachments
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

export interface MotivationalSettings {
  enabled: boolean;
  text: string; // Custom motivational message
  frequency: "never" | "10min" | "30min" | "hourly" | "daily" | "weekly";
  exactTime?: string; // HH:MM format for daily notification at exact time
}

export interface Settings {
  language: "en" | "ru";
  theme: "light" | "dark" | "amoled" | "pastel" | "system";
  importanceThreshold: number; // 1-7, default 4
  urgencyThreshold: number; // 1-7, default 4
  notificationsEnabled: boolean;
  notificationFrequency: "never" | "hourly" | "daily" | "weekly" | "always";
  motivational?: MotivationalSettings;
}

// Achievement system types
export interface AchievementDefinition {
  id: string;
  emoji: string; // Emoji used as sticker visual
  titleEn: string;
  titleRu: string;
  descriptionEn: string;
  descriptionRu: string;
  conditionType: "tasks_created_day" | "tasks_completed_day" | "tasks_completed_total" | "streak_days" | "q1_completed" | "all_quadrants" | "contact_dev" | "copy_card" | "secret" | "custom";
  conditionValue: number; // Threshold value for the condition
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: number; // timestamp
}

export interface QuadrantColor {
  background: string;
  border: string;
  text: string;
  label: string;
}

export const TASK_EMOJIS = [
  "🔥", "🧊", "🤢", "⚡", "💎", "🎯", "🚀", "🐢", "🎨", "🔧", "📚", "💪", "🌟", "⏰", "🎪",
];

export const QUADRANT_COLORS: Record<Quadrant, QuadrantColor> = {
  Q1: { background: "#FF6B6B", border: "#C92A2A", text: "#FFFFFF", label: "Do Now" },
  Q2: { background: "#FFA94D", border: "#E67700", text: "#FFFFFF", label: "Schedule" },
  Q3: { background: "#74C0FC", border: "#1971C2", text: "#FFFFFF", label: "Delegate" },
  Q4: { background: "#51CF66", border: "#2B8A3E", text: "#FFFFFF", label: "Delete" },
};
