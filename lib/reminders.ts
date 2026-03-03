import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Task type definition
interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  status: string;
  importance?: number;
  urgency?: number;
}

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface ReminderSettings {
  enabled: boolean;
  intervalMinutes: number; // Default interval if no due date/time
  reminderBeforeMinutes: number; // Minutes before due time to show reminder
}

const REMINDER_SETTINGS_KEY = "reminder_settings";
const SCHEDULED_REMINDERS_KEY = "scheduled_reminders";

export const defaultReminderSettings: ReminderSettings = {
  enabled: true,
  intervalMinutes: 60, // Default: remind every hour
  reminderBeforeMinutes: 15, // Default: remind 15 min before due time
};

/**
 * Get reminder settings from storage
 */
export async function getReminderSettings(): Promise<ReminderSettings> {
  try {
    const stored = await AsyncStorage.getItem(REMINDER_SETTINGS_KEY);
    return stored ? JSON.parse(stored) : defaultReminderSettings;
  } catch {
    return defaultReminderSettings;
  }
}

/**
 * Save reminder settings to storage
 */
export async function saveReminderSettings(
  settings: ReminderSettings
): Promise<void> {
  try {
    await AsyncStorage.setItem(REMINDER_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save reminder settings:", error);
  }
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "web") return false;

  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Failed to request notification permissions:", error);
    return false;
  }
}

/**
 * Schedule reminder for a task
 */
export async function scheduleTaskReminder(
  task: Task,
  settings: ReminderSettings
): Promise<string | null> {
  if (!settings.enabled || Platform.OS === "web") return null;

  try {
    let triggerDate: Date | null = null;

    // If task has due date/time, schedule reminder before that time
    if (task.dueDate) {
      const dueDateTime = new Date(task.dueDate);
      if (task.dueTime) {
        const [hours, minutes] = task.dueTime.split(":").map(Number);
        dueDateTime.setHours(hours, minutes, 0);
      }

      // Schedule reminder X minutes before due time
      triggerDate = new Date(
        dueDateTime.getTime() - settings.reminderBeforeMinutes * 60 * 1000
      );

      // Don't schedule if reminder time is in the past
      if (triggerDate < new Date()) {
        triggerDate = null;
      }
    }

    // If no due date/time, use default interval
    if (!triggerDate) {
      triggerDate = new Date(
        Date.now() + settings.intervalMinutes * 60 * 1000
      );
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Task Reminder",
        body: task.title,
        data: { taskId: task.id, taskTitle: task.title },
        badge: 1,
      },
      trigger: {
        seconds: Math.max(
          1,
          Math.floor((triggerDate.getTime() - Date.now()) / 1000)
        ),
      } as any,
    });

    // Store scheduled reminder ID
    await storeScheduledReminder(task.id, notificationId);

    return notificationId;
  } catch (error) {
    console.error("Failed to schedule reminder:", error);
    return null;
  }
}

/**
 * Cancel reminder for a task
 */
export async function cancelTaskReminder(taskId: string): Promise<void> {
  try {
    const reminderId = await getScheduledReminderId(taskId);
    if (reminderId) {
      await Notifications.cancelScheduledNotificationAsync(reminderId);
      await removeScheduledReminder(taskId);
    }
  } catch (error) {
    console.error("Failed to cancel reminder:", error);
  }
}

/**
 * Reschedule reminder for a task (when task is updated)
 */
export async function rescheduleTaskReminder(
  task: Task,
  settings: ReminderSettings
): Promise<string | null> {
  await cancelTaskReminder(task.id);
  return scheduleTaskReminder(task, settings);
}

/**
 * Store scheduled reminder ID in storage
 */
async function storeScheduledReminder(
  taskId: string,
  notificationId: string
): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(SCHEDULED_REMINDERS_KEY);
    const reminders = stored ? JSON.parse(stored) : {};
    reminders[taskId] = notificationId;
    await AsyncStorage.setItem(
      SCHEDULED_REMINDERS_KEY,
      JSON.stringify(reminders)
    );
  } catch (error) {
    console.error("Failed to store scheduled reminder:", error);
  }
}

/**
 * Get scheduled reminder ID for a task
 */
async function getScheduledReminderId(taskId: string): Promise<string | null> {
  try {
    const stored = await AsyncStorage.getItem(SCHEDULED_REMINDERS_KEY);
    const reminders = stored ? JSON.parse(stored) : {};
    return reminders[taskId] || null;
  } catch {
    return null;
  }
}

/**
 * Remove scheduled reminder ID from storage
 */
async function removeScheduledReminder(taskId: string): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(SCHEDULED_REMINDERS_KEY);
    const reminders = stored ? JSON.parse(stored) : {};
    delete reminders[taskId];
    await AsyncStorage.setItem(
      SCHEDULED_REMINDERS_KEY,
      JSON.stringify(reminders)
    );
  } catch (error) {
    console.error("Failed to remove scheduled reminder:", error);
  }
}

/**
 * Cancel all reminders
 */
export async function cancelAllReminders(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(SCHEDULED_REMINDERS_KEY);
    const reminders = stored ? JSON.parse(stored) : {};

    for (const notificationId of Object.values(reminders)) {
      await Notifications.cancelScheduledNotificationAsync(
        notificationId as string
      );
    }

    await AsyncStorage.removeItem(SCHEDULED_REMINDERS_KEY);
  } catch (error) {
    console.error("Failed to cancel all reminders:", error);
  }
}
