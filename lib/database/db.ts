import * as SQLite from "expo-sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Task, Settings } from "@/lib/domain/types";
import { v4 as uuidv4 } from "uuid";

const DB_NAME = "eisenhower.db";

let db: SQLite.SQLiteDatabase | null = null;

async function getDB() {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DB_NAME);
  }
  return db;
}

export async function initializeDatabase() {
  const database = await getDB();

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      importance INTEGER NOT NULL,
      urgency INTEGER NOT NULL,
      dueDate TEXT,
      dueTime TEXT,
      status TEXT NOT NULL,
      quadrant TEXT NOT NULL,
      priorityScore INTEGER NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

export async function createTask(task: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task> {
  const database = await getDB();
  const id = uuidv4();
  const now = Date.now();

  const newTask: Task = {
    ...task,
    id,
    createdAt: now,
    updatedAt: now,
  };

  await database.runAsync(
    `INSERT INTO tasks (id, title, description, importance, urgency, dueDate, dueTime, status, quadrant, priorityScore, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      newTask.createdAt,
      newTask.updatedAt,
    ]
  );

  return newTask;
}

export async function getAllTasks(): Promise<Task[]> {
  const database = await getDB();
  const result = await database.getAllAsync<Task>("SELECT * FROM tasks ORDER BY priorityScore DESC");
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

  const fields = Object.keys(updates)
    .filter((key) => key !== "id")
    .map((key) => `${key} = ?`);

  const values = Object.values(updates).filter((_, i) => Object.keys(updates)[i] !== "id");
  values.push(now);
  values.push(id);

  await database.runAsync(
    `UPDATE tasks SET ${fields.join(", ")}, updatedAt = ? WHERE id = ?`,
    values
  );
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
      const { id, createdAt, updatedAt, ...rest } = task;
      await database.runAsync(
        `INSERT OR REPLACE INTO tasks (id, title, description, importance, urgency, dueDate, dueTime, status, quadrant, priorityScore, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          rest.title,
          rest.description,
          rest.importance,
          rest.urgency,
          rest.dueDate || null,
          rest.dueTime || null,
          rest.status,
          rest.quadrant,
          rest.priorityScore,
          createdAt,
          updatedAt,
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
}
