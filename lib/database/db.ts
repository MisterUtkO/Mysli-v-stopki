import * as SQLite from "expo-sqlite";
import { v4 as uuidv4 } from "uuid";
import type { Task, Settings, Metrics } from "@/lib/domain/types";
import { calculateScoring } from "@/lib/domain/scoring";

/**
 * Database service for task and settings management
 * Uses expo-sqlite for local storage
 */

const DB_NAME = "eisenhower.db";
const DB_VERSION = 1;

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize database connection
 */
export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync(DB_NAME);
  await createTables();
  return db;
}

/**
 * Create database tables
 */
async function createTables(): Promise<void> {
  if (!db) throw new Error("Database not initialized");

  // Tasks table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      dueDate INTEGER,
      tags TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      importantFlag INTEGER NOT NULL,
      urgentFlag INTEGER NOT NULL,
      quadrant TEXT NOT NULL,
      importanceScore INTEGER NOT NULL,
      urgencyScore INTEGER NOT NULL,
      impactScore INTEGER NOT NULL,
      effortScore INTEGER NOT NULL,
      riskScore INTEGER NOT NULL,
      priorityScore REAL NOT NULL,
      nextActionHint TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY DEFAULT 'default',
      theme TEXT NOT NULL DEFAULT 'system',
      wImportance REAL NOT NULL DEFAULT 0.30,
      wUrgency REAL NOT NULL DEFAULT 0.25,
      wImpact REAL NOT NULL DEFAULT 0.25,
      wRisk REAL NOT NULL DEFAULT 0.15,
      wEffort REAL NOT NULL DEFAULT 0.05,
      importanceThreshold INTEGER NOT NULL DEFAULT 6,
      urgencyThreshold INTEGER NOT NULL DEFAULT 6
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_quadrant ON tasks(quadrant);
    CREATE INDEX IF NOT EXISTS idx_tasks_priorityScore ON tasks(priorityScore DESC);
    CREATE INDEX IF NOT EXISTS idx_tasks_dueDate ON tasks(dueDate);
  `);

  // Initialize default settings
  await ensureDefaultSettings();
}

/**
 * Ensure default settings exist
 */
async function ensureDefaultSettings(): Promise<void> {
  if (!db) throw new Error("Database not initialized");

  const result = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM settings WHERE id = 'default'"
  );

  if (!result || result.count === 0) {
    await db.runAsync(
      `INSERT INTO settings (id, theme, wImportance, wUrgency, wImpact, wRisk, wEffort, importanceThreshold, urgencyThreshold)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ["default", "system", 0.30, 0.25, 0.25, 0.15, 0.05, 6, 6]
    );
  }
}

// ============================================================================
// Task Operations
// ============================================================================

/**
 * Create a new task
 */
export async function createTask(
  title: string,
  metrics: Metrics,
  options?: {
    description?: string;
    dueDate?: number;
    tags?: string[];
  }
): Promise<Task> {
  if (!db) throw new Error("Database not initialized");

  const id = uuidv4();
  const now = Date.now();
  const settings = await getSettings();

  const scoring = calculateScoring(metrics, settings.weights, settings.thresholds);

  const task: Task = {
    id,
    title,
    description: options?.description || "",
    createdAt: now,
    updatedAt: now,
    dueDate: options?.dueDate,
    tags: options?.tags || [],
    status: "active",
    eisenhower: {
      importantFlag: scoring.importantFlag,
      urgentFlag: scoring.urgentFlag,
      quadrant: scoring.quadrant,
    },
    metrics,
    priorityScore: scoring.priorityScore,
    nextActionHint: scoring.nextActionHint,
  };

  await db.runAsync(
    `INSERT INTO tasks (id, title, description, createdAt, updatedAt, dueDate, tags, status, importantFlag, urgentFlag, quadrant, importanceScore, urgencyScore, impactScore, effortScore, riskScore, priorityScore, nextActionHint)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      task.id,
      task.title,
      task.description,
      task.createdAt,
      task.updatedAt,
      task.dueDate || null,
      JSON.stringify(task.tags),
      task.status,
      task.eisenhower.importantFlag ? 1 : 0,
      task.eisenhower.urgentFlag ? 1 : 0,
      task.eisenhower.quadrant,
      task.metrics.importanceScore,
      task.metrics.urgencyScore,
      task.priorityScore,
      task.nextActionHint,
    ]
  );

  return task;
}

/**
 * Get task by ID
 */
export async function getTask(id: string): Promise<Task | null> {
  if (!db) throw new Error("Database not initialized");

  const row = await db.getFirstAsync<any>(
    "SELECT * FROM tasks WHERE id = ?",
    [id]
  );

  if (!row) return null;

  return rowToTask(row);
}

/**
 * Get all tasks with optional filtering
 */
export async function getTasks(options?: {
  status?: string;
  quadrant?: string;
  sortBy?: "priority" | "dueDate" | "created";
  sortOrder?: "asc" | "desc";
}): Promise<Task[]> {
  if (!db) throw new Error("Database not initialized");

  let query = "SELECT * FROM tasks WHERE 1=1";
  const params: any[] = [];

  if (options?.status) {
    query += " AND status = ?";
    params.push(options.status);
  }

  if (options?.quadrant) {
    query += " AND quadrant = ?";
    params.push(options.quadrant);
  }

  // Sorting
  let orderBy = "priorityScore DESC";
  if (options?.sortBy === "dueDate") {
    orderBy = "dueDate ASC NULLS LAST";
  } else if (options?.sortBy === "created") {
    orderBy = `createdAt ${options?.sortOrder === "asc" ? "ASC" : "DESC"}`;
  } else if (options?.sortBy === "priority") {
    orderBy = `priorityScore ${options?.sortOrder === "asc" ? "ASC" : "DESC"}`;
  }

  query += ` ORDER BY ${orderBy}`;

  const rows = await db.getAllAsync<any>(query, params);
  return rows.map(rowToTask);
}

/**
 * Update task
 */
export async function updateTask(
  id: string,
  updates: Partial<Omit<Task, "id" | "createdAt">>
): Promise<Task> {
  if (!db) throw new Error("Database not initialized");

  const task = await getTask(id);
  if (!task) throw new Error(`Task ${id} not found`);

  const settings = await getSettings();

  // Merge updates
  const updatedTask: Task = {
    ...task,
    ...updates,
    updatedAt: Date.now(),
  };

  // Recalculate scoring if metrics changed
  if (updates.metrics) {
    const scoring = calculateScoring(
      updatedTask.metrics,
      settings.weights,
      settings.thresholds
    );
    updatedTask.eisenhower = {
      importantFlag: scoring.importantFlag,
      urgentFlag: scoring.urgentFlag,
      quadrant: scoring.quadrant,
    };
    updatedTask.priorityScore = scoring.priorityScore;
    updatedTask.nextActionHint = scoring.nextActionHint;
  }

  await db.runAsync(
    `UPDATE tasks SET title = ?, description = ?, dueDate = ?, tags = ?, status = ?, importantFlag = ?, urgentFlag = ?, quadrant = ?, importanceScore = ?, urgencyScore = ?, impactScore = ?, effortScore = ?, riskScore = ?, priorityScore = ?, nextActionHint = ?, updatedAt = ?
     WHERE id = ?`,
    [
      updatedTask.title,
      updatedTask.description,
      updatedTask.dueDate || null,
      JSON.stringify(updatedTask.tags),
      updatedTask.status,
      updatedTask.eisenhower.importantFlag ? 1 : 0,
      updatedTask.eisenhower.urgentFlag ? 1 : 0,
      updatedTask.eisenhower.quadrant,
      updatedTask.metrics.importanceScore,
      updatedTask.metrics.urgencyScore,
      updatedTask.priorityScore,
      updatedTask.nextActionHint,
      updatedTask.updatedAt,
      id,
    ]
  );

  return updatedTask;
}

/**
 * Delete task
 */
export async function deleteTask(id: string): Promise<void> {
  if (!db) throw new Error("Database not initialized");

  await db.runAsync("DELETE FROM tasks WHERE id = ?", [id]);
}

/**
 * Archive task
 */
export async function archiveTask(id: string): Promise<Task> {
  return updateTask(id, { status: "archived" });
}

/**
 * Restore task from archive
 */
export async function restoreTask(id: string): Promise<Task> {
  return updateTask(id, { status: "active" });
}

/**
 * Mark task as done
 */
export async function markTaskDone(id: string): Promise<Task> {
  return updateTask(id, { status: "done" });
}

/**
 * Search tasks by title or description
 */
export async function searchTasks(query: string): Promise<Task[]> {
  if (!db) throw new Error("Database not initialized");

  const searchQuery = `%${query}%`;
  const rows = await db.getAllAsync<any>(
    "SELECT * FROM tasks WHERE title LIKE ? OR description LIKE ? ORDER BY priorityScore DESC",
    [searchQuery, searchQuery]
  );

  return rows.map(rowToTask);
}

// ============================================================================
// Settings Operations
// ============================================================================

/**
 * Get current settings
 */
export async function getSettings(): Promise<Settings> {
  if (!db) throw new Error("Database not initialized");

  const row = await db.getFirstAsync<any>(
    "SELECT * FROM settings WHERE id = 'default'"
  );

  if (!row) {
    throw new Error("Default settings not found");
  }

  return {
    id: "default",
    theme: row.theme,
    language: row.language || "en",
    weights: {
      wImportance: row.wImportance,
      wUrgency: row.wUrgency,
    },
    thresholds: {
      importanceThreshold: row.importanceThreshold,
      urgencyThreshold: row.urgencyThreshold,
    },
  };
}

/**
 * Update settings
 */
export async function updateSettings(
  updates: Partial<Omit<Settings, "id">>
): Promise<Settings> {
  if (!db) throw new Error("Database not initialized");

  const current = await getSettings();
  const updated: Settings = { ...current, ...updates };

  await db.runAsync(
    `UPDATE settings SET theme = ?, language = ?, wImportance = ?, wUrgency = ?, importanceThreshold = ?, urgencyThreshold = ?
     WHERE id = 'default'`,
    [
      updated.theme,
      updated.language,
      updated.weights.wImportance,
      updated.weights.wUrgency,
      updated.thresholds.importanceThreshold,
      updated.thresholds.urgencyThreshold,
    ]
  );

  // Recalculate all tasks if weights or thresholds changed
  if (updates.weights || updates.thresholds) {
    await recalculateAllTasks(updated);
  }

  return updated;
}

/**
 * Recalculate all tasks with new settings
 */
async function recalculateAllTasks(settings: Settings): Promise<void> {
  if (!db) throw new Error("Database not initialized");

  const tasks = await getTasks();

  for (const task of tasks) {
    const scoring = calculateScoring(task.metrics, settings.weights, settings.thresholds);

    await db.runAsync(
      `UPDATE tasks SET importantFlag = ?, urgentFlag = ?, quadrant = ?, priorityScore = ?, nextActionHint = ?, updatedAt = ?
       WHERE id = ?`,
      [
        scoring.importantFlag ? 1 : 0,
        scoring.urgentFlag ? 1 : 0,
        scoring.quadrant,
        scoring.priorityScore,
        scoring.nextActionHint,
        Date.now(),
        task.id,
      ]
    );
  }
}

// ============================================================================
// Data Export/Import
// ============================================================================

/**
 * Export all tasks as JSON
 */
export async function exportTasks(): Promise<string> {
  if (!db) throw new Error("Database not initialized");

  const tasks = await getTasks();
  return JSON.stringify(tasks, null, 2);
}

/**
 * Import tasks from JSON
 */
export async function importTasks(jsonData: string): Promise<number> {
  if (!db) throw new Error("Database not initialized");

  const tasks = JSON.parse(jsonData) as Task[];
  let imported = 0;

  for (const task of tasks) {
    try {
      await db.runAsync(
        `INSERT INTO tasks (id, title, description, createdAt, updatedAt, dueDate, tags, status, importantFlag, urgentFlag, quadrant, importanceScore, urgencyScore, impactScore, effortScore, riskScore, priorityScore, nextActionHint)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          task.id,
          task.title,
          task.description,
          task.createdAt,
          task.updatedAt,
          task.dueDate || null,
          JSON.stringify(task.tags),
          task.status,
          task.eisenhower.importantFlag ? 1 : 0,
          task.eisenhower.urgentFlag ? 1 : 0,
          task.eisenhower.quadrant,
          task.metrics.importanceScore,
          task.metrics.urgencyScore,
          task.priorityScore,
          task.nextActionHint,
        ]
      );
      imported++;
    } catch (error) {
      console.warn(`Failed to import task ${task.id}:`, error);
    }
  }

  return imported;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert database row to Task object
 */
function rowToTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    dueDate: row.dueDate,
    tags: row.tags ? JSON.parse(row.tags) : [],
    status: row.status,
    eisenhower: {
      importantFlag: row.importantFlag === 1,
      urgentFlag: row.urgentFlag === 1,
      quadrant: row.quadrant,
    },
    metrics: {
      importanceScore: row.importanceScore,
      urgencyScore: row.urgencyScore,
    },
    priorityScore: row.priorityScore,
    nextActionHint: row.nextActionHint,
  };
}

/**
 * Clear all data (for testing or reset)
 */
export async function clearAllData(): Promise<void> {
  if (!db) throw new Error("Database not initialized");

  await db.execAsync("DELETE FROM tasks; DELETE FROM settings;");
  await ensureDefaultSettings();
}
