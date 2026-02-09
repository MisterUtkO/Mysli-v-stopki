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

export interface Settings {
  language: "en" | "ru";
  theme: "light" | "dark" | "system";
  importanceThreshold: number; // 1-7, default 4
  urgencyThreshold: number; // 1-7, default 4
  notificationsEnabled: boolean;
  notificationFrequency: "never" | "hourly" | "daily" | "weekly" | "always";
}

export interface QuadrantColor {
  background: string;
  border: string;
  text: string;
  label: string;
}

export const TASK_EMOJIS = [
  "🔥", // Fire - urgent
  "🧊", // Ice - cold/frozen
  "🤢", // Nausea - disgusting
  "⚡", // Lightning - energy
  "💎", // Diamond - valuable
  "🎯", // Target - goal
  "🚀", // Rocket - fast
  "🐢", // Turtle - slow
  "🎨", // Art - creative
  "🔧", // Tools - technical
  "📚", // Books - learning
  "💪", // Muscle - strength
  "🌟", // Star - important
  "⏰", // Clock - time-sensitive
  "🎪", // Circus - fun
];

export const QUADRANT_COLORS: Record<Quadrant, QuadrantColor> = {
  Q1: {
    background: "#FF6B6B", // Red
    border: "#C92A2A",
    text: "#FFFFFF",
    label: "Do Now",
  },
  Q2: {
    background: "#FFA94D", // Orange
    border: "#E67700",
    text: "#FFFFFF",
    label: "Schedule",
  },
  Q3: {
    background: "#74C0FC", // Blue
    border: "#1971C2",
    text: "#FFFFFF",
    label: "Delegate",
  },
  Q4: {
    background: "#51CF66", // Green
    border: "#2B8A3E",
    text: "#FFFFFF",
    label: "Delete",
  },
};
