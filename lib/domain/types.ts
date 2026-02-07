import { z } from "zod";

/**
 * Domain models for the Eisenhower Priority app (Simplified)
 */

// ============================================================================
// Task Domain
// ============================================================================

export const MetricsSchema = z.object({
  importanceScore: z.number().min(1).max(10),
  urgencyScore: z.number().min(1).max(10),
});

export type Metrics = z.infer<typeof MetricsSchema>;

export const EisenhowerSchema = z.object({
  importantFlag: z.boolean(),
  urgentFlag: z.boolean(),
  quadrant: z.enum(["Q1", "Q2", "Q3", "Q4"]),
});

export type Eisenhower = z.infer<typeof EisenhowerSchema>;

export const TaskStatusSchema = z.enum(["active", "done", "archived"]);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().optional().default(""),
  createdAt: z.number(), // Unix timestamp
  updatedAt: z.number(), // Unix timestamp
  dueDate: z.number().optional(), // Unix timestamp
  tags: z.array(z.string()).default([]),
  status: TaskStatusSchema.default("active"),
  
  // Eisenhower matrix
  eisenhower: EisenhowerSchema,
  
  // Metrics (simplified: only importance and urgency)
  metrics: MetricsSchema,
  
  // Derived fields
  priorityScore: z.number().min(0).max(100),
  nextActionHint: z.enum(["Do Now", "Schedule", "Delegate", "Delete"]),
});

export type Task = z.infer<typeof TaskSchema>;

// ============================================================================
// Settings Domain
// ============================================================================

export const ScoringWeightsSchema = z.object({
  wImportance: z.number().min(0).max(1).default(0.5),
  wUrgency: z.number().min(0).max(1).default(0.5),
});

export type ScoringWeights = z.infer<typeof ScoringWeightsSchema>;

export const ThresholdsSchema = z.object({
  importanceThreshold: z.number().min(1).max(10).default(6),
  urgencyThreshold: z.number().min(1).max(10).default(6),
});

export type Thresholds = z.infer<typeof ThresholdsSchema>;

export const SettingsSchema = z.object({
  id: z.literal("default"),
  theme: z.enum(["light", "dark", "system"]).default("system"),
  language: z.enum(["en", "ru"]).default("en"),
  weights: ScoringWeightsSchema,
  thresholds: ThresholdsSchema,
});

export type Settings = z.infer<typeof SettingsSchema>;

// ============================================================================
// Scoring Service Types
// ============================================================================

export interface ScoringInput {
  metrics: Metrics;
  weights: ScoringWeights;
  thresholds: Thresholds;
}

export interface ScoringOutput {
  importantFlag: boolean;
  urgentFlag: boolean;
  quadrant: "Q1" | "Q2" | "Q3" | "Q4";
  priorityScore: number;
  nextActionHint: "Do Now" | "Schedule" | "Delegate" | "Delete";
}
