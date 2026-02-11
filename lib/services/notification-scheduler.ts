import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { Task, Settings } from "@/lib/domain/types";

/**
 * Notification Scheduler Service
 * Handles:
 * 1. Per-task recurring notifications based on individual or global frequency
 * 2. Motivational reminder notifications with custom text and schedule
 */

// Frequency to seconds mapping
const FREQUENCY_SECONDS: Record<string, number> = {
  "10min": 600,
  "30min": 1800,
  "hourly": 3600,
  "daily": 86400,
  "weekly": 604800,
};

// Global frequency mapping (settings level)
const GLOBAL_FREQUENCY_SECONDS: Record<string, number> = {
  "hourly": 3600,
  "daily": 86400,
  "weekly": 604800,
  "always": 1800, // "always" = every 30 min
};

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    console.log("Failed to cancel notifications:", e);
  }
}

/**
 * Schedule per-task notifications based on task frequency or global setting
 */
export async function scheduleTaskNotifications(
  tasks: Task[],
  settings: Settings
): Promise<void> {
  if (Platform.OS === "web") return;
  if (!settings.notificationsEnabled) return;

  // Cancel existing task notifications first
  await cancelAllScheduledNotifications();

  const activeTasks = tasks.filter((t) => t.status !== "completed");

  for (const task of activeTasks) {
    // Determine frequency: per-task override or global
    const taskFreq = task.notificationFrequency;
    let intervalSeconds: number | null = null;

    if (taskFreq && taskFreq !== "global" && taskFreq !== "never") {
      intervalSeconds = FREQUENCY_SECONDS[taskFreq] || null;
    } else if (taskFreq === "never") {
      continue; // Skip this task
    } else {
      // Use global setting
      const globalFreq = settings.notificationFrequency;
      if (globalFreq === "never") continue;
      intervalSeconds = GLOBAL_FREQUENCY_SECONDS[globalFreq] || null;
    }

    if (!intervalSeconds) continue;

    try {
      const emoji = task.emoji ? `${task.emoji} ` : "";
      const quadrantLabel = task.quadrant;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${emoji}${task.title}`,
          body: task.dueDate
            ? `[${quadrantLabel}] ⚡${task.importance}/7 🔥${task.urgency}/7 — ${task.dueDate}`
            : `[${quadrantLabel}] ⚡${task.importance}/7 🔥${task.urgency}/7`,
          sound: true,
          data: { taskId: task.id, type: "task_reminder" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: intervalSeconds,
          repeats: true,
        },
      });
    } catch (e) {
      console.log(`Failed to schedule notification for task ${task.id}:`, e);
    }
  }
}

/**
 * Schedule a motivational reminder notification
 */
export async function scheduleMotivationalNotification(
  text: string,
  frequency: string,
  exactTime?: string // HH:MM format
): Promise<void> {
  if (Platform.OS === "web") return;
  if (!text.trim()) return;

  // Cancel existing motivational notifications
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.content.data?.type === "motivational") {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }

  if (frequency === "never") return;

  try {
    if (exactTime) {
      // Schedule at exact time daily
      const [hours, minutes] = exactTime.split(":").map(Number);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "💪 SDVGNote",
          body: text,
          sound: true,
          data: { type: "motivational" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
        },
      });
    } else {
      // Schedule at interval
      const intervalSeconds = FREQUENCY_SECONDS[frequency] || GLOBAL_FREQUENCY_SECONDS[frequency];
      if (!intervalSeconds) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "💪 SDVGNote",
          body: text,
          sound: true,
          data: { type: "motivational" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: intervalSeconds,
          repeats: true,
        },
      });
    }
  } catch (e) {
    console.log("Failed to schedule motivational notification:", e);
  }
}

/**
 * Send an immediate test notification
 */
export async function sendTestNotification(isRu: boolean): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: isRu ? "🔔 Тестовое уведомление" : "🔔 Test notification",
        body: isRu
          ? "Уведомления работают корректно!"
          : "Notifications are working correctly!",
        sound: true,
        data: { type: "test" },
      },
      trigger: null,
    });
  } catch (e) {
    console.log("Failed to send test notification:", e);
  }
}
