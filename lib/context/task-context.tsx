import React, { createContext, useContext, useEffect, useState } from "react";
import type { Task, Settings } from "@/lib/domain/types";
import {
  createTask as dbCreateTask,
  getAllTasks,
  updateTask as dbUpdateTask,
  deleteTask as dbDeleteTask,
  getSetting,
  setSetting,
  exportTasks as dbExportTasks,
  importTasks as dbImportTasks,
  clearAllData as dbClearAllData,
  initializeDatabase,
} from "@/lib/database/db";
import { createTaskWithScoring } from "@/lib/domain/scoring";

interface TaskContextType {
  tasks: Task[];
  settings: Settings;
  loading: boolean;
  createTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "priorityScore" | "quadrant">) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  exportTasks: () => Promise<string>;
  importTasks: (jsonData: string) => Promise<void>;
  clearAllData: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const DEFAULT_SETTINGS: Settings = {
  language: "en",
  theme: "system",
  importanceThreshold: 4,
  urgencyThreshold: 4,
  notificationsEnabled: true,
  notificationFrequency: "daily",
};

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Initialize database and load data
  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeDatabase();
        const loadedTasks = await getAllTasks();
        setTasks(loadedTasks);

        // Load settings
        const language = (await getSetting("language")) as "en" | "ru" | null;
        const theme = (await getSetting("theme")) as "light" | "dark" | "system" | null;
        const impThreshold = await getSetting("importanceThreshold");
        const urgThreshold = await getSetting("urgencyThreshold");
        const notifEnabled = await getSetting("notificationsEnabled");
        const notifFreq = await getSetting("notificationFrequency");

        setSettings({
          language: language || DEFAULT_SETTINGS.language,
          theme: theme || DEFAULT_SETTINGS.theme,
          importanceThreshold: impThreshold ? parseInt(impThreshold) : DEFAULT_SETTINGS.importanceThreshold,
          urgencyThreshold: urgThreshold ? parseInt(urgThreshold) : DEFAULT_SETTINGS.urgencyThreshold,
          notificationsEnabled: notifEnabled ? notifEnabled === "true" : DEFAULT_SETTINGS.notificationsEnabled,
          notificationFrequency: (notifFreq as any) || DEFAULT_SETTINGS.notificationFrequency,
        });
      } catch (error) {
        console.error("Failed to initialize database:", error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const createTask = async (
    task: Omit<Task, "id" | "createdAt" | "updatedAt" | "priorityScore" | "quadrant">
  ): Promise<Task> => {
    const taskWithScoring = createTaskWithScoring(task as Omit<Task, "quadrant" | "priorityScore">, {
      importanceThreshold: settings.importanceThreshold,
      urgencyThreshold: settings.urgencyThreshold,
    });

    const newTask = await dbCreateTask(taskWithScoring);
    setTasks((prev) => [newTask, ...prev].sort((a, b) => b.priorityScore - a.priorityScore));
    return newTask;
  };

  const updateTask = async (id: string, updates: Partial<Task>): Promise<void> => {
    await dbUpdateTask(id, updates);
    const updatedTasks = await getAllTasks();
    setTasks(updatedTasks);
  };

  const deleteTask = async (id: string): Promise<void> => {
    await dbDeleteTask(id);
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const updateSettings = async (newSettings: Partial<Settings>): Promise<void> => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    if (newSettings.language) await setSetting("language", newSettings.language);
    if (newSettings.theme) await setSetting("theme", newSettings.theme);
    if (newSettings.importanceThreshold) await setSetting("importanceThreshold", String(newSettings.importanceThreshold));
    if (newSettings.urgencyThreshold) await setSetting("urgencyThreshold", String(newSettings.urgencyThreshold));
    if (newSettings.notificationsEnabled !== undefined) await setSetting("notificationsEnabled", String(newSettings.notificationsEnabled));
    if (newSettings.notificationFrequency) await setSetting("notificationFrequency", newSettings.notificationFrequency);
  };

  const exportTasks = async (): Promise<string> => {
    return dbExportTasks();
  };

  const importTasks = async (jsonData: string): Promise<void> => {
    await dbImportTasks(jsonData);
    const loadedTasks = await getAllTasks();
    setTasks(loadedTasks);
  };

  const clearAllData = async (): Promise<void> => {
    await dbClearAllData();
    setTasks([]);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        settings,
        loading,
        createTask,
        updateTask,
        deleteTask,
        updateSettings,
        exportTasks,
        importTasks,
        clearAllData,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskContext must be used within TaskProvider");
  }
  return context;
}
