import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AppState } from "react-native";
import type { Task, Settings, NotificationFrequency, TaskAttachment, MotivationalSettings } from "@/lib/domain/types";
import {
  createTask as dbCreateTask,
  getAllTasks,
  updateTask as dbUpdateTask,
  deleteTask as dbDeleteTask,
  permanentlyDeleteTask as dbPermanentlyDeleteTask,
  restoreTask as dbRestoreTask,
  getSetting,
  setSetting,
  exportTasks as dbExportTasks,
  importTasks as dbImportTasks,
  clearAllData as dbClearAllData,
  initializeDatabase,
} from "@/lib/database/db";
import { createTaskWithScoring } from "@/lib/domain/scoring";
import {
  resolveQuadrant,
  mapQuadrantTypeToUI,
  buildPriorityReason,
  calculateDeadlineUrgency,
  calculateFinalUrgency,
} from "@/lib/domain/quadrant-logic";
import { migrateAllTasksToNewLogic } from "@/lib/services/task/task-migration";
import { migrateExistingTasks } from "@/lib/services/task/migration-trigger";
import {
  scheduleTaskNotifications,
  scheduleMotivationalNotification,
  cancelAllScheduledNotifications,
} from "@/lib/services/notification/notification-scheduler";
import {
  syncTaskToCalendar,
  formatTaskForCalendar,
  deleteCalendarEventByTaskId,
} from "@/lib/integrations/calendar/calendar-sync";
import { syncTaskToKanban, removeTaskFromKanban, KANBAN_STORAGE_KEY } from "@/lib/integrations/kanban/kanban-sync";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  scheduleTaskReminder,
  rescheduleTaskReminder,
  cancelTaskReminder,
  getReminderSettings,
  requestNotificationPermissions,
} from "@/lib/services/notification/reminders";
import { scheduleTaskCleanup } from "@/lib/services/task/task-cleanup";
import * as SplashScreen from "expo-splash-screen";

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
  permanentlyDeleteTask: (id: string) => Promise<void>;
  restoreTask: (id: string) => Promise<void>;
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
      const now = Date.now();
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      const activeTasks = loadedTasks.filter((task) => {
        if (!task.isDeleted) return true;
        if (!task.deletedAt) return false;
        return (now - task.deletedAt) < sevenDaysMs;
      });
      setTasks(activeTasks);
    } catch (error) {
      console.error("Failed to refresh tasks:", error);
    }
  }, []);

  // Подписка на AppState — обновляем задачи при возврате в приложение (задача #1)
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        refreshTasks();
      }
    });
    return () => subscription.remove();
  }, [refreshTasks]);

  const rescheduleNotifications = useCallback(async (currentTasks: Task[], currentSettings: Settings) => {
    try {
      console.log("[TaskContext] Rescheduling notifications...");
      console.log("[TaskContext] Active tasks:", currentTasks.filter(t => t.status !== "completed").length);
      console.log("[TaskContext] Notifications enabled:", currentSettings.notificationsEnabled);
      console.log("[TaskContext] Global frequency:", currentSettings.notificationFrequency);
      
      await scheduleTaskNotifications(currentTasks, currentSettings);
      
      if (currentSettings.motivational?.enabled && currentSettings.motivational.text) {
        console.log("[TaskContext] Scheduling motivational:", currentSettings.motivational.frequency);
        await scheduleMotivationalNotification(
          currentSettings.motivational.text,
          currentSettings.motivational.frequency,
          currentSettings.motivational.exactTime
        );
      }
      console.log("[TaskContext] Notifications rescheduled successfully");
    } catch (e) {
      console.log("Failed to reschedule notifications:", e);
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeDatabase();
        const loadedTasks = await getAllTasks();
        
        const now = Date.now();
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        const activeTasks = loadedTasks.filter((task) => {
          if (!task.isDeleted) return true;
          if (!task.deletedAt) return false;
          return (now - task.deletedAt) < sevenDaysMs;
        });
        
        console.log("[TaskContext] Running migration for existing tasks");
        const migratedTasks = await migrateExistingTasks(activeTasks, async (id, updates) => {
          await dbUpdateTask(id, updates);
        });
        
        const finalTasks = migratedTasks.length > 0 ? await getAllTasks() : activeTasks;
        setTasks(finalTasks);

        const language = (await getSetting("language")) as "en" | "ru" | null;
        const theme = (await getSetting("theme")) as "light" | "dark" | "amoled" | "pastel" | "system" | null;
        const impThreshold = await getSetting("importanceThreshold");
        const urgThreshold = await getSetting("urgencyThreshold");
        const notifEnabled = await getSetting("notificationsEnabled");
        const notifFreq = await getSetting("notificationFrequency");
        const motivationalJson = await getSetting("motivational");
        const startScreen = (await getSetting("startScreen")) as "index" | "matrix" | "kanban" | "statistics" | "achievements" | "settings" | null;
        console.log("[TaskContext] Loaded startScreen:", startScreen);

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
          startScreen: startScreen || undefined,
        };

        setSettings(loadedSettings);

        console.log("[TaskContext] Scheduling notifications in background");
        rescheduleNotifications(loadedTasks, loadedSettings).catch(e => {
          console.error("[TaskContext] Background notification scheduling failed:", e);
        });
        
        console.log("[TaskContext] Scheduling task cleanup in background");
        scheduleTaskCleanup().catch(e => {
          console.error("[TaskContext] Background task cleanup failed:", e);
        });
        
        try {
          const { WidgetSync } = await import("@/lib/integrations/widget/widget-sync");
          await WidgetSync.syncTasksToWidget(finalTasks);
          console.log("[TaskContext] Synced tasks to widget on app launch");
        } catch (error) {
          console.error("[TaskContext] Failed to sync to widget on launch:", error);
        }
      } catch (error) {
        console.error("Failed to initialize database:", error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const createTask = async (input: CreateTaskInput): Promise<Task> => {
    const importance = Math.max(1, Math.min(7, Math.round(input.importance)));
    const urgencyManual = Math.max(1, Math.min(7, Math.round(input.urgency)));
    
    const now = new Date();
    const urgencyDeadline = calculateDeadlineUrgency(
      input.dueDate ? `${input.dueDate}T${input.dueTime || "00:00"}` : null,
      now
    );
    const urgencyFinal = calculateFinalUrgency(urgencyManual, urgencyDeadline);
    
    const quadrantType = resolveQuadrant(
      importance,
      urgencyManual,
      input.dueDate ? `${input.dueDate}T${input.dueTime || "00:00"}` : null,
      now
    );
    const quadrant = mapQuadrantTypeToUI(quadrantType);
    const priorityReason = buildPriorityReason(
      importance,
      urgencyManual,
      input.dueDate ? `${input.dueDate}T${input.dueTime || "00:00"}` : null,
      quadrantType,
      now
    );
    
    const taskData = createTaskWithScoring({
      title: input.title,
      description: input.description,
      importance: importance,
      urgency: urgencyFinal,
      dueDate: input.dueDate,
      dueTime: input.dueTime,
      status: input.status,
      emoji: input.emoji,
      notificationFrequency: input.notificationFrequency || "global",
      attachments: input.attachments || [],
    }, {
      importanceThreshold: settings.importanceThreshold,
      urgencyThreshold: settings.urgencyThreshold,
    });

    const newTask = await dbCreateTask(taskData);
    const updatedTasks = await getAllTasks();
    setTasks(updatedTasks);
    
    console.log("[TaskContext] Task created, rescheduling notifications");
    await rescheduleNotifications(updatedTasks, settings);
    
    try {
      const reminderSettings = await getReminderSettings();
      await scheduleTaskReminder(newTask, reminderSettings);
      console.log("[TaskContext] Reminder scheduled for new task");
    } catch (error) {
      console.error("[TaskContext] Failed to schedule reminder:", error);
    }
    
    const calendarEvent = formatTaskForCalendar(newTask);
    if (calendarEvent) {
      try {
        await syncTaskToCalendar(calendarEvent);
        console.log("[TaskContext] Task synced to calendar");
      } catch (error) {
        console.error("[TaskContext] Failed to sync task to calendar:", error);
      }
    }
    
    try {
      const { WidgetSync } = await import("@/lib/integrations/widget/widget-sync");
      await WidgetSync.syncTasksToWidget(updatedTasks);
      console.log("[TaskContext] Synced to widget after task creation");
    } catch (error) {
      console.error("[TaskContext] Failed to sync to widget:", error);
    }
    
    return newTask;
  };

  const updateTask = async (id: string, updates: Partial<Task>): Promise<void> => {
    await dbUpdateTask(id, updates);
    const updatedTasks = await getAllTasks();
    setTasks(updatedTasks);
    if (updates.status || updates.notificationFrequency) {
      console.log("[TaskContext] Task updated, rescheduling notifications");
      await rescheduleNotifications(updatedTasks, settings);
    }
    
    if (updates.dueDate || updates.dueTime) {
      const updatedTask = updatedTasks.find(t => t.id === id);
      if (updatedTask) {
        try {
          const reminderSettings = await getReminderSettings();
          await rescheduleTaskReminder(updatedTask, reminderSettings);
          console.log("[TaskContext] Reminder rescheduled for updated task");
        } catch (error) {
          console.error("[TaskContext] Failed to reschedule reminder:", error);
        }
      }
    }
    
    if (updates.dueDate || updates.dueTime) {
      const updatedTask = updatedTasks.find(t => t.id === id);
      if (updatedTask) {
        const calendarEvent = formatTaskForCalendar(updatedTask);
        if (calendarEvent) {
          try {
            await syncTaskToCalendar(calendarEvent);
            console.log("[TaskContext] Task updated in calendar");
          } catch (error) {
            console.error("[TaskContext] Failed to sync task to calendar:", error);
          }
        }
      }
    }

    try {
      const { WidgetSync } = await import("@/lib/integrations/widget/widget-sync");
      await WidgetSync.syncTasksToWidget(updatedTasks);
      console.log("[TaskContext] Synced to widget after task update");
    } catch (error) {
      console.error("[TaskContext] Failed to sync to widget:", error);
    }

    const updatedTask = updatedTasks.find(t => t.id === id);
    if (updatedTask) {
      try {
        await syncTaskToKanban(updatedTask);
      } catch (e) {
        console.error("[TaskContext] Failed to sync task to kanban:", e);
      }
    }
  };

  const deleteTask = async (id: string): Promise<void> => {
    const now = Date.now();
    await dbUpdateTask(id, { isDeleted: true, deletedAt: now });
    const updatedTasks = tasks.map((task) => 
      task.id === id ? { ...task, isDeleted: true, deletedAt: now } : task
    );
    setTasks(updatedTasks);
    console.log("[TaskContext] Task moved to trash, will be permanently deleted in 7 days");
    await rescheduleNotifications(updatedTasks, settings);
    
    try {
      await cancelTaskReminder(id);
      console.log("[TaskContext] Reminder cancelled for deleted task");
    } catch (error) {
      console.error("[TaskContext] Failed to cancel reminder:", error);
    }
    
    try {
      await deleteCalendarEventByTaskId(id);
      console.log("[TaskContext] Task removed from calendar");
    } catch (error) {
      console.error("[TaskContext] Failed to remove task from calendar:", error);
    }

    try {
      await removeTaskFromKanban(id);
      console.log("[TaskContext] Task sticker removed from kanban");
    } catch (e) {
      console.error("[TaskContext] Failed to remove task from kanban:", e);
    }
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
    if (newSettings.startScreen !== undefined) {
      console.log("[TaskContext] Saving startScreen:", newSettings.startScreen);
      await setSetting("startScreen", newSettings.startScreen);
    }

    console.log("[TaskContext] Settings updated, rescheduling notifications");
    await rescheduleNotifications(tasks, updated);

    if (newSettings.motivational) {
      if (newSettings.motivational.enabled && newSettings.motivational.text) {
        await scheduleMotivationalNotification(
          newSettings.motivational.text,
          newSettings.motivational.frequency,
          newSettings.motivational.exactTime
        );
      }
    }

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

  const permanentlyDeleteTask = async (id: string): Promise<void> => {
    await dbPermanentlyDeleteTask(id);
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    console.log("[TaskContext] Task permanently deleted");
  };

  const restoreTask = async (id: string): Promise<void> => {
    await dbRestoreTask(id);
    const updatedTasks = tasks.map((task) => 
      task.id === id ? { ...task, isDeleted: false, deletedAt: undefined } : task
    );
    setTasks(updatedTasks);
    console.log("[TaskContext] Task restored from trash");
    await rescheduleNotifications(updatedTasks, settings);
  };

  const clearAllData = async (): Promise<void> => {
    await dbClearAllData();
    setTasks([]);
    await cancelAllScheduledNotifications();
    await AsyncStorage.removeItem(KANBAN_STORAGE_KEY);
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
        permanentlyDeleteTask,
        restoreTask,
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
