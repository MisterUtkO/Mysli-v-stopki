import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Task, Settings, NotificationFrequency, TaskAttachment, MotivationalSettings } from "@/lib/domain/types";
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
import {
  scheduleTaskNotifications,
  scheduleMotivationalNotification,
  cancelAllScheduledNotifications,
} from "@/lib/services/notification-scheduler";

interface CreateTaskInput {
  title: string;
  description: string;
  importance: number;
  urgency: number;
  dueDate?: string;
  dueTime?: string;
  status: "not_started" | "in_progress" | "completed";
  emoji?: string;
  notificationFrequency?: NotificationFrequency;
  attachments?: TaskAttachment[];
}

interface TaskContextType {
  tasks: Task[];
  settings: Settings;
  loading: boolean;
  createTask: (task: CreateTaskInput) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  exportTasks: () => Promise<string>;
  importTasks: (jsonData: string) => Promise<void>;
  clearAllData: () => Promise<void>;
  refreshTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const DEFAULT_MOTIVATIONAL: MotivationalSettings = {
  enabled: false,
  text: "",
  frequency: "daily",
  exactTime: undefined,
};

const DEFAULT_SETTINGS: Settings = {
  language: "en",
  theme: "system",
  importanceThreshold: 4,
  urgencyThreshold: 4,
  notificationsEnabled: true,
  notificationFrequency: "daily",
  motivational: DEFAULT_MOTIVATIONAL,
};

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refreshTasks = useCallback(async () => {
    try {
      const loadedTasks = await getAllTasks();
      setTasks(loadedTasks);
    } catch (error) {
      console.error("Failed to refresh tasks:", error);
    }
  }, []);

  // Schedule notifications whenever tasks or settings change
  const rescheduleNotifications = useCallback(async (currentTasks: Task[], currentSettings: Settings) => {
    try {
      await scheduleTaskNotifications(currentTasks, currentSettings);
      // Also reschedule motivational if enabled
      if (currentSettings.motivational?.enabled && currentSettings.motivational.text) {
        await scheduleMotivationalNotification(
          currentSettings.motivational.text,
          currentSettings.motivational.frequency,
          currentSettings.motivational.exactTime
        );
      }
    } catch (e) {
      console.log("Failed to reschedule notifications:", e);
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeDatabase();
        const loadedTasks = await getAllTasks();
        setTasks(loadedTasks);

        const language = (await getSetting("language")) as "en" | "ru" | null;
        const theme = (await getSetting("theme")) as "light" | "dark" | "system" | null;
        const impThreshold = await getSetting("importanceThreshold");
        const urgThreshold = await getSetting("urgencyThreshold");
        const notifEnabled = await getSetting("notificationsEnabled");
        const notifFreq = await getSetting("notificationFrequency");
        const motivationalJson = await getSetting("motivational");

        let motivational = DEFAULT_MOTIVATIONAL;
        if (motivationalJson) {
          try { motivational = JSON.parse(motivationalJson); } catch {}
        }

        const loadedSettings: Settings = {
          language: language || DEFAULT_SETTINGS.language,
          theme: theme || DEFAULT_SETTINGS.theme,
          importanceThreshold: impThreshold ? parseInt(impThreshold) : DEFAULT_SETTINGS.importanceThreshold,
          urgencyThreshold: urgThreshold ? parseInt(urgThreshold) : DEFAULT_SETTINGS.urgencyThreshold,
          notificationsEnabled: notifEnabled ? notifEnabled === "true" : DEFAULT_SETTINGS.notificationsEnabled,
          notificationFrequency: (notifFreq as Settings["notificationFrequency"]) || DEFAULT_SETTINGS.notificationFrequency,
          motivational,
        };

        setSettings(loadedSettings);

        // Schedule notifications on startup
        await rescheduleNotifications(loadedTasks, loadedSettings);
      } catch (error) {
        console.error("Failed to initialize database:", error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const createTask = async (input: CreateTaskInput): Promise<Task> => {
    const taskWithScoring = createTaskWithScoring(
      {
        title: input.title,
        description: input.description,
        importance: input.importance,
        urgency: input.urgency,
        dueDate: input.dueDate,
        dueTime: input.dueTime,
        status: input.status,
        emoji: input.emoji,
        notificationFrequency: input.notificationFrequency,
        attachments: input.attachments,
      },
      {
        importanceThreshold: settings.importanceThreshold,
        urgencyThreshold: settings.urgencyThreshold,
      }
    );

    const newTask = await dbCreateTask(taskWithScoring);
    const updatedTasks = await getAllTasks();
    setTasks(updatedTasks);
    // Reschedule notifications with new task
    await rescheduleNotifications(updatedTasks, settings);
    return newTask;
  };

  const updateTask = async (id: string, updates: Partial<Task>): Promise<void> => {
    await dbUpdateTask(id, updates);
    const updatedTasks = await getAllTasks();
    setTasks(updatedTasks);
    // Reschedule if status or notification frequency changed
    if (updates.status || updates.notificationFrequency) {
      await rescheduleNotifications(updatedTasks, settings);
    }
  };

  const deleteTask = async (id: string): Promise<void> => {
    await dbDeleteTask(id);
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    await rescheduleNotifications(updatedTasks, settings);
  };

  const updateSettings = async (newSettings: Partial<Settings>): Promise<void> => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    if (newSettings.language !== undefined) await setSetting("language", newSettings.language);
    if (newSettings.theme !== undefined) await setSetting("theme", newSettings.theme);
    if (newSettings.importanceThreshold !== undefined) await setSetting("importanceThreshold", String(newSettings.importanceThreshold));
    if (newSettings.urgencyThreshold !== undefined) await setSetting("urgencyThreshold", String(newSettings.urgencyThreshold));
    if (newSettings.notificationsEnabled !== undefined) await setSetting("notificationsEnabled", String(newSettings.notificationsEnabled));
    if (newSettings.notificationFrequency !== undefined) await setSetting("notificationFrequency", newSettings.notificationFrequency);
    if (newSettings.motivational !== undefined) await setSetting("motivational", JSON.stringify(newSettings.motivational));

    // Reschedule notifications with updated settings
    await rescheduleNotifications(tasks, updated);

    // Handle motivational separately
    if (newSettings.motivational) {
      if (newSettings.motivational.enabled && newSettings.motivational.text) {
        await scheduleMotivationalNotification(
          newSettings.motivational.text,
          newSettings.motivational.frequency,
          newSettings.motivational.exactTime
        );
      } else if (!newSettings.motivational.enabled) {
        // Cancel motivational notifications (they'll be excluded in reschedule)
      }
    }

    // If notifications disabled, cancel all
    if (newSettings.notificationsEnabled === false) {
      await cancelAllScheduledNotifications();
    }
  };

  const exportTasks = async (): Promise<string> => {
    return dbExportTasks();
  };

  const importTasks = async (jsonData: string): Promise<void> => {
    await dbImportTasks(jsonData);
    await refreshTasks();
  };

  const clearAllData = async (): Promise<void> => {
    await dbClearAllData();
    setTasks([]);
    await cancelAllScheduledNotifications();
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
        refreshTasks,
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
