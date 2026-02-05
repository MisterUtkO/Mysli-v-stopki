import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as db from "@/lib/database/db";
import type { Task, Settings, Metrics } from "@/lib/domain/types";

interface TaskContextType {
  // State
  tasks: Task[];
  settings: Settings | null;
  loading: boolean;
  error: string | null;

  // Task operations
  createTask: (
    title: string,
    metrics: Metrics,
    options?: {
      description?: string;
      dueDate?: number;
      tags?: string[];
    }
  ) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  archiveTask: (id: string) => Promise<Task>;
  restoreTask: (id: string) => Promise<Task>;
  markTaskDone: (id: string) => Promise<Task>;
  searchTasks: (query: string) => Promise<Task[]>;
  getTasks: (options?: {
    status?: string;
    quadrant?: string;
    sortBy?: "priority" | "dueDate" | "created";
    sortOrder?: "asc" | "desc";
  }) => Promise<Task[]>;

  // Settings operations
  updateSettings: (updates: Partial<Omit<Settings, "id">>) => Promise<Settings>;

  // Data management
  exportTasks: () => Promise<string>;
  importTasks: (jsonData: string) => Promise<number>;
  clearAllData: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize database and load data
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await db.initDatabase();
        const loadedSettings = await db.getSettings();
        setSettings(loadedSettings);
        const loadedTasks = await db.getTasks({ status: "active" });
        setTasks(loadedTasks);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        console.error("Failed to initialize database:", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // Task operations
  const createTask = useCallback(
    async (
      title: string,
      metrics: Metrics,
      options?: {
        description?: string;
        dueDate?: number;
        tags?: string[];
      }
    ): Promise<Task> => {
      try {
        const newTask = await db.createTask(title, metrics, options);
        setTasks((prev) => [newTask, ...prev]);
        return newTask;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create task";
        setError(message);
        throw err;
      }
    },
    []
  );

  const updateTask = useCallback(
    async (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>): Promise<Task> => {
      try {
        const updated = await db.updateTask(id, updates);
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? updated : t))
        );
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update task";
        setError(message);
        throw err;
      }
    },
    []
  );

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    try {
      await db.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete task";
      setError(message);
      throw err;
    }
  }, []);

  const archiveTask = useCallback(async (id: string): Promise<Task> => {
    try {
      const archived = await db.archiveTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      return archived;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to archive task";
      setError(message);
      throw err;
    }
  }, []);

  const restoreTask = useCallback(async (id: string): Promise<Task> => {
    try {
      const restored = await db.restoreTask(id);
      setTasks((prev) => [restored, ...prev]);
      return restored;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to restore task";
      setError(message);
      throw err;
    }
  }, []);

  const markTaskDone = useCallback(async (id: string): Promise<Task> => {
    try {
      const done = await db.markTaskDone(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      return done;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to mark task as done";
      setError(message);
      throw err;
    }
  }, []);

  const searchTasks = useCallback(async (query: string): Promise<Task[]> => {
    try {
      return await db.searchTasks(query);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to search tasks";
      setError(message);
      throw err;
    }
  }, []);

  const getTasks = useCallback(
    async (options?: {
      status?: string;
      quadrant?: string;
      sortBy?: "priority" | "dueDate" | "created";
      sortOrder?: "asc" | "desc";
    }): Promise<Task[]> => {
      try {
        return await db.getTasks(options);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to get tasks";
        setError(message);
        throw err;
      }
    },
    []
  );

  // Settings operations
  const updateSettings = useCallback(
    async (updates: Partial<Omit<Settings, "id">>): Promise<Settings> => {
      try {
        const updated = await db.updateSettings(updates);
        setSettings(updated);
        // Reload tasks to reflect new scoring
        const reloaded = await db.getTasks({ status: "active" });
        setTasks(reloaded);
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update settings";
        setError(message);
        throw err;
      }
    },
    []
  );

  // Data management
  const exportTasks = useCallback(async (): Promise<string> => {
    try {
      return await db.exportTasks();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to export tasks";
      setError(message);
      throw err;
    }
  }, []);

  const importTasks = useCallback(async (jsonData: string): Promise<number> => {
    try {
      const count = await db.importTasks(jsonData);
      // Reload tasks
      const reloaded = await db.getTasks({ status: "active" });
      setTasks(reloaded);
      return count;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to import tasks";
      setError(message);
      throw err;
    }
  }, []);

  const clearAllData = useCallback(async (): Promise<void> => {
    try {
      await db.clearAllData();
      setTasks([]);
      const resetSettings = await db.getSettings();
      setSettings(resetSettings);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to clear data";
      setError(message);
      throw err;
    }
  }, []);

  const value: TaskContextType = {
    tasks,
    settings,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    archiveTask,
    restoreTask,
    markTaskDone,
    searchTasks,
    getTasks,
    updateSettings,
    exportTasks,
    importTasks,
    clearAllData,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTaskContext(): TaskContextType {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskContext must be used within TaskProvider");
  }
  return context;
}
