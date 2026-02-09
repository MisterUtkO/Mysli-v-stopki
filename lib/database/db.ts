import * as SQLite from "expo-sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Task, Settings } from "@/lib/domain/types";

// Simple ID generator to avoid crypto.getRandomValues() issues
function generateId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

const DB_NAME = "eisenhower_v2.db";
const DB_VERSION_KEY = "db_schema_version";
const CURRENT_VERSION = 2;

let db: SQLite.SQLiteDatabase | null = null;

async function getDB() {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    // Enable WAL mode for better performance
    await db.execAsync("PRAGMA journal_mode = WAL;");
  }
  return db;
}

export async function initializeDatabase() {
  const database = await getDB();
  const storedVersion = await AsyncStorage.getItem(DB_VERSION_KEY);
  const version = storedVersion ? parseInt(storedVersion, 10) : 0;

  if (version < 1) {
    // Initial schema creation
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        importance INTEGER NOT NULL DEFAULT 4,
        urgency INTEGER NOT NULL DEFAULT 4,
        dueDate TEXT,
        dueTime TEXT,
        status TEXT NOT NULL DEFAULT 'not_started',
        quadrant TEXT NOT NULL DEFAULT 'Q4',
        priorityScore INTEGER NOT NULL DEFAULT 0,
        emoji TEXT,
        sortOrder INTEGER NOT NULL DEFAULT 0,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
  }

  if (version < 2) {
    // Migration v2: add emoji and sortOrder columns if missing
    try {
      await database.execAsync(`ALTER TABLE tasks ADD COLUMN emoji TEXT;`);
    } catch (e) {
      // Column may already exist
    }
    try {
      await database.execAsync(`ALTER TABLE tasks ADD COLUMN sortOrder INTEGER NOT NULL DEFAULT 0;`);
    } catch (e) {
      // Column may already exist
    }
  }

  await AsyncStorage.setItem(DB_VERSION_KEY, String(CURRENT_VERSION));
}

export async function createTask(task: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task> {
  const database = await getDB();
  const id = generateId();
  const now = Date.now();

  // Get max sortOrder to put new task at the end
  const maxResult = await database.getFirstAsync<{ maxOrder: number }>(
    "SELECT COALESCE(MAX(sortOrder), 0) as maxOrder FROM tasks"
  );
  const sortOrder = (maxResult?.maxOrder || 0) + 1;

  const newTask: Task = {
    ...task,
    id,
    sortOrder,
    createdAt: now,
    updatedAt: now,
  };

  await database.runAsync(
    `INSERT INTO tasks (id, title, description, importance, urgency, dueDate, dueTime, status, quadrant, priorityScore, emoji, sortOrder, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      newTask.id,
      newTask.title,
      newTask.description,
      newTask.importance,
      newTask.urgency,
      newTask.dueDate || null,
      newTask.dueTime || null,
      newTask.status,
      newTask.quadrant,
      newTask.priorityScore,
      newTask.emoji || null,
      newTask.sortOrder,
      newTask.createdAt,
      newTask.updatedAt,
    ]
  );

  return newTask;
}

export async function getAllTasks(): Promise<Task[]> {
  const database = await getDB();
  const result = await database.getAllAsync<Task>(
    "SELECT * FROM tasks ORDER BY sortOrder ASC, priorityScore DESC"
  );
  return result || [];
}

export async function getTaskById(id: string): Promise<Task | null> {
  const database = await getDB();
  const result = await database.getFirstAsync<Task>("SELECT * FROM tasks WHERE id = ?", [id]);
  return result || null;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<void> {
  const database = await getDB();
  const now = Date.now();

  // Build SET clause safely
  const allowedFields = [
    "title", "description", "importance", "urgency",
    "dueDate", "dueTime", "status", "quadrant",
    "priorityScore", "emoji", "sortOrder"
  ];

  const setClauses: string[] = [];
  const values: any[] = [];

  for (const field of allowedFields) {
    if (field in updates) {
      setClauses.push(`${field} = ?`);
      values.push((updates as any)[field] ?? null);
    }
  }

  if (setClauses.length === 0) return;

  setClauses.push("updatedAt = ?");
  values.push(now);
  values.push(id);

  await database.runAsync(
    `UPDATE tasks SET ${setClauses.join(", ")} WHERE id = ?`,
    values
  );
}

export async function updateTaskOrder(taskOrders: { id: string; sortOrder: number }[]): Promise<void> {
  const database = await getDB();
  for (const { id, sortOrder } of taskOrders) {
    await database.runAsync(
      "UPDATE tasks SET sortOrder = ? WHERE id = ?",
      [sortOrder, id]
    );
  }
}

export async function deleteTask(id: string): Promise<void> {
  const database = await getDB();
  await database.runAsync("DELETE FROM tasks WHERE id = ?", [id]);
}

export async function getSetting(key: string): Promise<string | null> {
  const database = await getDB();
  const result = await database.getFirstAsync<{ value: string }>(
    "SELECT value FROM settings WHERE key = ?",
    [key]
  );
  return result?.value || null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const database = await getDB();
  await database.runAsync(
    "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
    [key, value]
  );
}

export async function exportTasks(): Promise<string> {
  const tasks = await getAllTasks();
  return JSON.stringify(tasks, null, 2);
}

export async function importTasks(jsonData: string): Promise<void> {
  try {
    const tasks: Task[] = JSON.parse(jsonData);
    const database = await getDB();

    for (const task of tasks) {
      await database.runAsync(
        `INSERT OR REPLACE INTO tasks (id, title, description, importance, urgency, dueDate, dueTime, status, quadrant, priorityScore, emoji, sortOrder, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          task.id,
          task.title,
          task.description,
          task.importance,
          task.urgency,
          task.dueDate || null,
          task.dueTime || null,
          task.status,
          task.quadrant,
          task.priorityScore,
          task.emoji || null,
          task.sortOrder || 0,
          task.createdAt,
          task.updatedAt,
        ]
      );
    }
  } catch (error) {
    console.error("Failed to import tasks:", error);
    throw error;
  }
}

export async function clearAllData(): Promise<void> {
  const database = await getDB();
  await database.execAsync("DELETE FROM tasks; DELETE FROM settings;");
  await AsyncStorage.removeItem(DB_VERSION_KEY);
}
