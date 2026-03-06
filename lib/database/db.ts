import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Task, Settings } from "@/lib/domain/types";

// Import SQLite only for native platforms
// Use dynamic require wrapped in try-catch to prevent web bundler from resolving
let SQLite: any = null;
function loadSQLite() {
  if (Platform.OS !== "web" && !SQLite) {
    try {
      // @ts-ignore - dynamic require for native only
      SQLite = require("expo-sqlite");
    } catch (e) {
      console.log("SQLite not available on this platform");
    }
  }
  return SQLite;
}

// Simple ID generator to avoid crypto.getRandomValues() issues
function generateId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

const DB_NAME = "eisenhower_v2.db";
const DB_VERSION_KEY = "db_schema_version";
const CURRENT_VERSION = 4;
const TASKS_STORAGE_KEY = "eisenhower_tasks";
const SETTINGS_STORAGE_KEY = "eisenhower_settings";

let db: any = null;

async function getDB() {
  // Use AsyncStorage for web, SQLite for native
  if (Platform.OS === "web") {
    return null; // Web uses AsyncStorage directly
  }

  const sqlite = loadSQLite();
  if (!db && sqlite) {
    db = await sqlite.openDatabaseAsync(DB_NAME);
    // Enable WAL mode for better performance
    await db.execAsync("PRAGMA journal_mode = WAL;");
  }
  return db;
}

export async function initializeDatabase() {
  if (Platform.OS === "web") {
    // Web version: just initialize AsyncStorage
    const storedVersion = await AsyncStorage.getItem(DB_VERSION_KEY);
    const version = storedVersion ? parseInt(storedVersion, 10) : 0;
    
    if (version < CURRENT_VERSION) {
      // Ensure tasks and settings exist
      const tasksData = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (!tasksData) {
        await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify([]));
      }
      
      const settingsData = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!settingsData) {
        await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({}));
      }
      
      await AsyncStorage.setItem(DB_VERSION_KEY, String(CURRENT_VERSION));
    }
    return;
  }

  // Native version: use SQLite
  const database = await getDB();
  if (!database) return;

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

  if (version < 3) {
    // Migration v3: add notificationFrequency and attachments columns
    try {
      await database.execAsync(`ALTER TABLE tasks ADD COLUMN notificationFrequency TEXT DEFAULT 'global';`);
    } catch (e) {
      // Column may already exist
    }
    try {
      await database.execAsync(`ALTER TABLE tasks ADD COLUMN attachments TEXT DEFAULT '[]';`);
    } catch (e) {
      // Column may already exist
    }
  }

  if (version < 4) {
    // Migration v4: add isDeleted and deletedAt columns for soft delete
    try {
      await database.execAsync(`ALTER TABLE tasks ADD COLUMN isDeleted INTEGER DEFAULT 0;`);
    } catch (e) {
      // Column may already exist
    }
    try {
      await database.execAsync(`ALTER TABLE tasks ADD COLUMN deletedAt INTEGER;`);
    } catch (e) {
      // Column may already exist
    }
  }

  await AsyncStorage.setItem(DB_VERSION_KEY, String(CURRENT_VERSION));
}

export async function createTask(task: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task> {
  const id = generateId();
  const now = Date.now();

  const newTask: Task = {
    ...task,
    id,
    sortOrder: task.sortOrder || 0,
    createdAt: now,
    updatedAt: now,
  };

  if (Platform.OS === "web") {
    // Web: use AsyncStorage
    const tasksData = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    const tasks = tasksData ? JSON.parse(tasksData) : [];
    
    // Get max sortOrder
    const maxOrder = tasks.length > 0 ? Math.max(...tasks.map((t: Task) => t.sortOrder || 0)) : 0;
    newTask.sortOrder = maxOrder + 1;
    
    tasks.push(newTask);
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } else {
    // Native: use SQLite
    const database = await getDB();
    if (!database) throw new Error("Database not initialized");

    const maxResult = await database.getFirstAsync(
      "SELECT COALESCE(MAX(sortOrder), 0) as maxOrder FROM tasks"
    ) as { maxOrder: number } | undefined;
    newTask.sortOrder = (maxResult?.maxOrder || 0) + 1;

    await database.runAsync(
      `INSERT INTO tasks (id, title, description, importance, urgency, dueDate, dueTime, status, quadrant, priorityScore, emoji, sortOrder, notificationFrequency, attachments, isDeleted, deletedAt, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        newTask.notificationFrequency || 'global',
        JSON.stringify(newTask.attachments || []),
        0,
        null,
        newTask.createdAt,
        newTask.updatedAt,
      ]
    );
  }

  return newTask;
}

export async function getAllTasks(): Promise<Task[]> {
  if (Platform.OS === "web") {
    // Web: use AsyncStorage
    const tasksData = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    const tasks = tasksData ? JSON.parse(tasksData) : [];
    return tasks.sort((a: Task, b: Task) => {
      const aOrder = a.sortOrder || 0;
      const bOrder = b.sortOrder || 0;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return b.priorityScore - a.priorityScore;
    });
  } else {
    // Native: use SQLite
    const database = await getDB();
    if (!database) return [];
    const result = await database.getAllAsync(
      "SELECT * FROM tasks ORDER BY sortOrder ASC, priorityScore DESC"
    ) as any[];
    return (result || []).map((row: any) => ({
      ...row,
      attachments: row.attachments ? JSON.parse(row.attachments) : [],
    })) as Task[];
  }
}

export async function getTaskById(id: string): Promise<Task | null> {
  if (Platform.OS === "web") {
    // Web: use AsyncStorage
    const tasksData = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    const tasks = tasksData ? JSON.parse(tasksData) : [];
    return tasks.find((t: Task) => t.id === id) || null;
  } else {
    // Native: use SQLite
    const database = await getDB();
    if (!database) return null;
    const result = await database.getFirstAsync("SELECT * FROM tasks WHERE id = ?", [id]) as Task | undefined;
    return result || null;
  }
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<void> {
  const now = Date.now();

  if (Platform.OS === "web") {
    // Web: use AsyncStorage
    const tasksData = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    const tasks = tasksData ? JSON.parse(tasksData) : [];
    
    const index = tasks.findIndex((t: Task) => t.id === id);
    if (index !== -1) {
      tasks[index] = {
        ...tasks[index],
        ...updates,
        updatedAt: now,
      };
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    }
  } else {
    // Native: use SQLite
    const database = await getDB();
    if (!database) return;

    const allowedFields = [
      "title", "description", "importance", "urgency",
      "dueDate", "dueTime", "status", "quadrant",
      "priorityScore", "emoji", "sortOrder",
      "notificationFrequency"
    ];

    const setClauses: string[] = [];
    const values: any[] = [];

    // Handle attachments separately (JSON serialization)
    if ("attachments" in updates) {
      setClauses.push("attachments = ?");
      values.push(JSON.stringify(updates.attachments || []));
    }

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
}

export async function updateTaskOrder(taskOrders: { id: string; sortOrder: number }[]): Promise<void> {
  if (Platform.OS === "web") {
    // Web: use AsyncStorage
    const tasksData = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    const tasks = tasksData ? JSON.parse(tasksData) : [];
    
    for (const { id, sortOrder } of taskOrders) {
      const task = tasks.find((t: Task) => t.id === id);
      if (task) {
        task.sortOrder = sortOrder;
      }
    }
    
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } else {
    // Native: use SQLite
    const database = await getDB();
    if (!database) return;
    
    for (const { id, sortOrder } of taskOrders) {
      await database.runAsync(
        "UPDATE tasks SET sortOrder = ? WHERE id = ?",
        [sortOrder, id]
      );
    }
  }
}

export async function deleteTask(id: string): Promise<void> {
  const now = Date.now();
  
  if (Platform.OS === "web") {
    // Web: use AsyncStorage - soft delete
    const tasksData = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    const tasks = tasksData ? JSON.parse(tasksData) : [];
    
    const task = tasks.find((t: Task) => t.id === id);
    if (task) {
      task.isDeleted = true;
      task.deletedAt = now;
      task.updatedAt = now;
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    }
  } else {
    // Native: use SQLite - soft delete
    const database = await getDB();
    if (!database) return;
    await database.runAsync(
      "UPDATE tasks SET isDeleted = 1, deletedAt = ?, updatedAt = ? WHERE id = ?",
      [now, now, id]
    );
  }
}

export async function getSetting(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    // Web: use AsyncStorage
    const settingsData = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    const settings = settingsData ? JSON.parse(settingsData) : {};
    return settings[key] || null;
  } else {
    // Native: use SQLite
    const database = await getDB();
    if (!database) return null;
    const result = await database.getFirstAsync(
      "SELECT value FROM settings WHERE key = ?",
      [key]
    ) as { value: string } | undefined;
    return result?.value || null;
  }
}

export async function setSetting(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    // Web: use AsyncStorage
    const settingsData = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    const settings = settingsData ? JSON.parse(settingsData) : {};
    settings[key] = value;
    await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } else {
    // Native: use SQLite
    const database = await getDB();
    if (!database) return;
    await database.runAsync(
      "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
      [key, value]
    );
  }
}

export async function exportTasks(): Promise<string> {
  const tasks = await getAllTasks();
  return JSON.stringify(tasks, null, 2);
}

export async function importTasks(jsonData: string): Promise<void> {
  try {
    const tasks: Task[] = JSON.parse(jsonData);

    if (Platform.OS === "web") {
      // Web: use AsyncStorage
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } else {
      // Native: use SQLite
      const database = await getDB();
      if (!database) throw new Error("Database not initialized");

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
    }
  } catch (error) {
    console.error("Failed to import tasks:", error);
    throw error;
  }
}

export async function clearAllData(): Promise<void> {
  if (Platform.OS === "web") {
    // Web: use AsyncStorage
    await AsyncStorage.removeItem(TASKS_STORAGE_KEY);
    await AsyncStorage.removeItem(SETTINGS_STORAGE_KEY);
    await AsyncStorage.removeItem(DB_VERSION_KEY);
  } else {
    // Native: use SQLite
    const database = await getDB();
    if (!database) return;
    await database.execAsync("DELETE FROM tasks; DELETE FROM settings;");
    await AsyncStorage.removeItem(DB_VERSION_KEY);
  }
}

export async function permanentlyDeleteTask(id: string): Promise<void> {
  if (Platform.OS === "web") {
    // Web: use AsyncStorage - permanent delete
    const tasksData = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    const tasks = tasksData ? JSON.parse(tasksData) : [];
    
    const index = tasks.findIndex((t: Task) => t.id === id);
    if (index !== -1) {
      tasks.splice(index, 1);
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    }
  } else {
    // Native: use SQLite - permanent delete
    const database = await getDB();
    if (!database) return;
    await database.runAsync("DELETE FROM tasks WHERE id = ?", [id]);
  }
}

export async function restoreTask(id: string): Promise<void> {
  const now = Date.now();
  
  if (Platform.OS === "web") {
    // Web: use AsyncStorage - restore from trash
    const tasksData = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    const tasks = tasksData ? JSON.parse(tasksData) : [];
    
    const task = tasks.find((t: Task) => t.id === id);
    if (task) {
      task.isDeleted = false;
      task.deletedAt = null;
      task.updatedAt = now;
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    }
  } else {
    // Native: use SQLite - restore from trash
    const database = await getDB();
    if (!database) return;
    await database.runAsync(
      "UPDATE tasks SET isDeleted = 0, deletedAt = NULL, updatedAt = ? WHERE id = ?",
      [now, id]
    );
  }
}
