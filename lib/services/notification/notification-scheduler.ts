import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { Task, Settings } from "@/lib/domain/types";

/**
 * Notification Scheduler Service
 * Handles:
 * 1. Per-task recurring notifications based on individual or global frequency
 * 2. Motivational reminder notifications with custom text and schedule
 * 
 * IMPORTANT: Notifications only work on native iOS/Android (not web).
 * The foreground handler must be set BEFORE any scheduling calls.
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
 * Request notification permissions and set up foreground handler.
 * Call this once at app startup.
 */
export async function initializeNotifications(): Promise<boolean> {
  if (Platform.OS === "web") return false;

  try {
    // Set foreground handler — this MUST be called for notifications to show when app is open
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Notification permissions not granted");
      return false;
    }

    // Set up Android channels
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("task-reminders", {
        name: "Task Reminders",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF6B6B",
        sound: "default",
        enableVibrate: true,
        showBadge: true,
      });

      await Notifications.setNotificationChannelAsync("motivational", {
        name: "Motivational Reminders",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250],
        lightColor: "#22C55E",
        sound: "default",
        enableVibrate: true,
        showBadge: true,
      });
    }

    console.log("Notifications initialized successfully");
    return true;
  } catch (e) {
    console.log("Failed to initialize notifications:", e);
    return false;
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("All scheduled notifications cancelled");
  } catch (e) {
    console.log("Failed to cancel notifications:", e);
  }
}

/**
 * Cancel only task-related notifications (preserve motivational)
 */
async function cancelTaskNotifications(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.content.data?.type === "task_reminder") {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }
  } catch (e) {
    console.log("Failed to cancel task notifications:", e);
  }
}

/**
 * Cancel only motivational notifications
 */
async function cancelMotivationalNotifications(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.content.data?.type === "motivational") {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }
  } catch (e) {
    console.log("Failed to cancel motivational notifications:", e);
  }
}

/**
 * Get the appropriate trigger based on frequency
 * Uses DAILY/WEEKLY for better background support, TIME_INTERVAL for shorter intervals
 */
function getTriggerForFrequency(frequency: string): Notifications.NotificationTriggerInput | null {
  switch (frequency) {
    case "daily":
      // Daily at 9:00 AM
      return {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 9,
        minute: 0,
      };
    case "weekly":
      // Every Monday at 9:00 AM
      return {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 1, // Monday
        hour: 9,
        minute: 0,
      };
    case "hourly":
      // Every hour
      return {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 3600,
        repeats: true,
      };
    case "always":
    case "30min":
      // Every 30 minutes
      return {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1800,
        repeats: true,
      };
    case "10min":
      // Every 10 minutes
      return {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 600,
        repeats: true,
      };
    default:
      return null;
  }
}

/**
 * Schedule per-task notifications based on task frequency or global setting.
 * Cancels existing task notifications first, then reschedules all active tasks.
 */
export async function scheduleTaskNotifications(
  tasks: Task[],
  settings: Settings
): Promise<void> {
  if (Platform.OS === "web") return;
  if (!settings.notificationsEnabled) {
    await cancelTaskNotifications();
    return;
  }

  // Cancel existing task notifications first
  await cancelTaskNotifications();

  const activeTasks = tasks.filter((t) => t.status !== "completed");
  let scheduledCount = 0;

  for (const task of activeTasks) {
    // Determine frequency: per-task override or global
    const taskFreq = task.notificationFrequency;
    let frequency: string | null = null;

    if (taskFreq && taskFreq !== "global" && taskFreq !== "never") {
      frequency = taskFreq;
    } else if (taskFreq === "never") {
      continue; // Skip this task
    } else {
      // Use global setting
      const globalFreq = settings.notificationFrequency;
      if (globalFreq === "never") continue;
      frequency = globalFreq;
    }

    if (!frequency) continue;

    const trigger = getTriggerForFrequency(frequency);
    if (!trigger) continue;

    try {
      const emoji = task.emoji ? `${task.emoji} ` : "";
      const quadrantLabel = task.quadrant;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${emoji}${task.title}`,
          body: task.dueDate
            ? `[${quadrantLabel}] ⚡${task.importance}/7 🔥${task.urgency}/7 — ${task.dueDate}${task.dueTime ? ` ${task.dueTime}` : ""}`
            : `[${quadrantLabel}] ⚡${task.importance}/7 🔥${task.urgency}/7`,
          sound: true,
          data: { taskId: task.id, type: "task_reminder" },
          ...(Platform.OS === "android" ? { channelId: "task-reminders", icon: "icon" } : {}),
        },
        trigger,
      });
      scheduledCount++;
      console.log(`[Notifications] Scheduled task "${task.title}" with frequency: ${frequency}`);
    } catch (e) {
      console.log(`Failed to schedule notification for task ${task.id}:`, e);
    }
  }

  console.log(`[Notifications] Scheduled ${scheduledCount} task notifications`);
}

/**
 * Schedule a motivational reminder notification.
 * Supports both interval-based and exact-time-based scheduling.
 */
export async function scheduleMotivationalNotification(
  text: string,
  frequency: string,
  exactTime?: string // HH:MM format
): Promise<void> {
  if (Platform.OS === "web") return;
  if (!text.trim()) return;

  // Cancel existing motivational notifications
  await cancelMotivationalNotifications();

  if (frequency === "never") return;

  try {
    if (exactTime && exactTime.includes(":")) {
      // Schedule at exact time daily
      const [hours, minutes] = exactTime.split(":").map(Number);
      if (isNaN(hours) || isNaN(minutes)) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: text,
          body: "",
          sound: true,
          data: { type: "motivational_reminder" },
          ...(Platform.OS === "android" ? { channelId: "motivational", icon: "icon" } : {}),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
        },
      });
      console.log(`[Notifications] Motivational notification scheduled daily at ${hours}:${minutes}`);
    } else {
      // Schedule at interval
      const trigger = getTriggerForFrequency(frequency);
      if (!trigger) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "💪 Мысли в стопки",
          body: text,
          sound: true,
          data: { type: "motivational" },
          ...(Platform.OS === "android" ? { channelId: "motivational", icon: "icon" } : {}),
        },
        trigger,
      });
      console.log(`[Notifications] Motivational notification scheduled with frequency: ${frequency}`);
    }
  } catch (e) {
    console.log("Failed to schedule motivational notification:", e);
  }
}

/**
 * Send an immediate test notification (for testing purposes)
 */
export async function sendTestNotification(isRu: boolean): Promise<void> {
  if (Platform.OS === "web") {
    // On web, show an alert instead
    return;
  }
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: isRu ? "🔔 Тестовое уведомление" : "🔔 Test notification",
        body: isRu
          ? "Уведомления работают корректно! Вы будете получать напоминания о задачах."
          : "Notifications are working correctly! You will receive task reminders.",
        sound: true,
        data: { type: "test" },
      },
      trigger: null, // null = immediate
    });
    console.log("[Notifications] Test notification sent");
  } catch (e) {
    console.log("Failed to send test notification:", e);
  }
}

/**
 * Debug: List all currently scheduled notifications
 */
export async function listScheduledNotifications(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`[Notifications] Currently scheduled: ${scheduled.length} notifications`);
    for (const n of scheduled) {
      console.log(`  - ${n.content.title} (type: ${n.content.data?.type})`);
    }
  } catch (e) {
    console.log("Failed to list notifications:", e);
  }
}
