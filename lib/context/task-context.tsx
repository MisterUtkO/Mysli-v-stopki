import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as db from "@/lib/database/db";
import { NotificationService, type NotificationSettings } from "@/lib/services/notification-service";
import type { Task, Settings, Metrics } from "@/lib/domain/types";
import { useRouter } from "expo-router";

interface TaskContextType {
  tasks: Task[];
  settings: Settings | null;
  notificationSettings: NotificationSettings | null;
  loading: boolean;
  error: string | null;
  createTask: (title: string, metrics: Metrics, options?: { description?: string; dueDate?: number; tags?: string[] }) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  archiveTask: (id: string) => Promise<Task>;
  restoreTask: (id: string) => Promise<Task>;
  markTaskDone: (id: string) => Promise<Task>;
  searchTasks: (query: string) => Promise<Task[]>;
  getTasks: (options?: { status?: string; quadrant?: string; sortBy?: "priority" | "dueDate" | "created"; sortOrder?: "asc" | "desc" }) => Promise<Task[]>;
  updateSettings: (updates: Partial<Omit<Settings, "id">>) => Promise<Settings>;
  exportTasks: () => Promise<string>;
  importTasks: (jsonData: string) => Promise<number>;
  clearAllData: () => Promise<void>;
  requestNotificationPermissions: () => Promise<boolean>;
  updateNotificationSettings: (updates: Partial<NotificationSettings>) => Promise<void>;
  rescheduleNotifications: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await db.initDatabase();
        const loadedSettings = await db.getSettings();
        setSettings(loadedSettings);
        const loadedTasks = await db.getTasks({ status: "active" });
        setTasks(loadedTasks);
        const notifSettings = NotificationService.getDefaultSettings();
        setNotificationSettings(notifSettings);
        const hasPermission = await NotificationService.requestPermissions();
        if (hasPermission && loadedTasks.length > 0) {
          await NotificationService.rescheduleAllNotifications(loadedTasks, notifSettings);
        }
        const unsubscribe = NotificationService.onNotificationResponse((taskId) => {
          router.push({ pathname: "/task-detail", params: { id: taskId } });
        });
        return () => unsubscribe();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        console.error("Failed to initialize:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const createTask = useCallback(async (title: string, metrics: Metrics, options?: { description?: string; dueDate?: number; tags?: string[] }): Promise<Task> => {
    try {
      const newTask = await db.createTask(title, metrics, options);
      setTasks((prev) => [newTask, ...prev]);
      if (notificationSettings) {
        await NotificationService.scheduleTaskNotification(newTask, notificationSettings);
      }
      return newTask;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create task";
      setError(message);
      throw err;
    }
  }, [notificationSettings]);

  const updateTask = useCallback(async (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>): Promise<Task> => {
    try {
      const updated = await db.updateTask(id, updates);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      if (notificationSettings && (updates.dueDate || updates.metrics)) {
        const scheduled = await NotificationService.getScheduledNotifications();
        const taskNotif = scheduled.find((n) => n.content.data?.taskId === id);
        if (taskNotif) {
          await NotificationService.cancelNotification(taskNotif.identifier);
        }
        await NotificationService.scheduleTaskNotification(updated, notificationSettings);
      }
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update task";
      setError(message);
      throw err;
    }
  }, [notificationSettings]);

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    try {
      await db.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      const scheduled = await NotificationService.getScheduledNotifications();
      const taskNotif = scheduled.find((n) => n.content.data?.taskId === id);
      if (taskNotif) {
        await NotificationService.cancelNotification(taskNotif.identifier);
      }
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
      const scheduled = await NotificationService.getScheduledNotifications();
      const taskNotif = scheduled.find((n) => n.content.data?.taskId === id);
      if (taskNotif) {
        await NotificationService.cancelNotification(taskNotif.identifier);
      }
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
      const scheduled = await NotificationService.getScheduledNotifications();
      const taskNotif = scheduled.find((n) => n.content.data?.taskId === id);
      if (taskNotif) {
        await NotificationService.cancelNotification(taskNotif.identifier);
      }
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

  const getTasks = useCallback(async (options?: { status?: string; quadrant?: string; sortBy?: "priority" | "dueDate" | "created"; sortOrder?: "asc" | "desc" }): Promise<Task[]> => {
    try {
      return await db.getTasks(options);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to get tasks";
      setError(message);
      throw err;
    }
  }, []);

  const updateSettings = useCallback(async (updates: Partial<Omit<Settings, "id">>): Promise<Settings> => {
    try {
      const updated = await db.updateSettings(updates);
      setSettings(updated);
      const reloaded = await db.getTasks({ status: "active" });
      setTasks(reloaded);
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update settings";
      setError(message);
      throw err;
    }
  }, []);

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
      await NotificationService.cancelAllNotifications();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to clear data";
      setError(message);
      throw err;
    }
  }, []);

  const requestNotificationPermissions = useCallback(async (): Promise<boolean> => {
    try {
      return await NotificationService.requestPermissions();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to request permissions";
      setError(message);
      return false;
    }
  }, []);

  const updateNotificationSettings = useCallback(async (updates: Partial<NotificationSettings>): Promise<void> => {
    try {
      const newSettings = { ...notificationSettings, ...updates } as NotificationSettings;
      setNotificationSettings(newSettings);
      await NotificationService.rescheduleAllNotifications(tasks, newSettings);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update notification settings";
      setError(message);
      throw err;
    }
  }, [tasks, notificationSettings]);

  const rescheduleNotifications = useCallback(async (): Promise<void> => {
    try {
      if (notificationSettings) {
        await NotificationService.rescheduleAllNotifications(tasks, notificationSettings);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reschedule notifications";
      setError(message);
      throw err;
    }
  }, [tasks, notificationSettings]);

  const sendTestNotification = useCallback(async (): Promise<void> => {
    try {
      await NotificationService.sendTestNotification("📌 Test Notification", "This is a test notification from Eisenhower Priority");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send test notification";
      setError(message);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (notificationSettings && tasks.length > 0) {
      rescheduleNotifications().catch((err) => {
        console.error("Failed to reschedule notifications:", err);
      });
    }
  }, [tasks, notificationSettings, rescheduleNotifications]);

  const value: TaskContextType = {
    tasks, settings, notificationSettings, loading, error,
    createTask, updateTask, deleteTask, archiveTask, restoreTask, markTaskDone, searchTasks, getTasks,
    updateSettings, exportTasks, importTasks, clearAllData,
    requestNotificationPermissions, updateNotificationSettings, rescheduleNotifications, sendTestNotification,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTaskContext(): TaskContextType {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
}
