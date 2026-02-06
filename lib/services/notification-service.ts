import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";
import { Platform } from "react-native";
import type { Task } from "@/lib/domain/types";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationSettings {
  enabled: boolean;
  q1Enabled: boolean; // Do Now - urgent & important
  q2Enabled: boolean; // Schedule - important but not urgent
  q3Enabled: boolean; // Delegate - urgent but not important
  reminderTime: number; // Minutes before due date (e.g., 60 = 1 hour)
  dailyReminderEnabled: boolean; // Enable daily task review reminders
  dailyReminderTime: string; // HH:MM format for daily reminders (e.g., "09:00")
  dailyReminderDays: number[]; // Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
  highPriorityOnly?: boolean; // Only notify for priority score >= 70
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  q1Enabled: true,
  q2Enabled: true,
  q3Enabled: false,
  reminderTime: 60, // 1 hour before
  dailyReminderEnabled: true,
  dailyReminderTime: "09:00", // 9:00 AM
  dailyReminderDays: [1, 2, 3, 4, 5], // Monday to Friday
};

/**
 * Notification Service - Manages all notification scheduling and permissions
 */
export class NotificationService {
  /**
   * Request notification permissions from user
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Failed to request notification permissions:", error);
      return false;
    }
  }

  /**
   * Get default notification settings
   */
  static getDefaultSettings(): NotificationSettings {
    return { ...DEFAULT_SETTINGS };
  }

  /**
   * Schedule a notification for a specific task
   */
  static async scheduleTaskNotification(
    task: Task,
    settings: NotificationSettings
  ): Promise<string | null> {
    if (!settings.enabled || !task.dueDate) return null;

    const quadrant = task.eisenhower.quadrant;
    const isNotifiable =
      (quadrant === "Q1" && settings.q1Enabled) ||
      (quadrant === "Q2" && settings.q2Enabled) ||
      (quadrant === "Q3" && settings.q3Enabled);

    if (!isNotifiable) return null;

    try {
      const dueDate = new Date(task.dueDate);
      const triggerDate = new Date(dueDate.getTime() - settings.reminderTime * 60 * 1000);

      if (triggerDate <= new Date()) return null;

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: `📌 ${task.title}`,
          body: `Priority: ${task.priorityScore}/100 (${quadrant})`,
          data: { taskId: task.id },
          sound: "default",
          badge: 1,
        },
        trigger: {
          type: SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: Math.floor((triggerDate.getTime() - Date.now()) / 1000),
        },
      });

      return identifier;
    } catch (error) {
      console.error("Failed to schedule task notification:", error);
      return null;
    }
  }

  /**
   * Schedule daily reminder notification
   */
  static async scheduleDailyReminder(
    settings: NotificationSettings,
    taskCount: number,
    q1Count: number,
    q2Count: number
  ): Promise<string[]> {
    if (!settings.enabled || !settings.dailyReminderEnabled) return [];

    const identifiers: string[] = [];

    try {
      const [hours, minutes] = settings.dailyReminderTime.split(":").map(Number);

      for (const dayOfWeek of settings.dailyReminderDays) {
        const identifier = await Notifications.scheduleNotificationAsync({
          content: {
            title: "📋 Daily Task Review",
            body: `You have ${taskCount} active task(s): ${q1Count} urgent, ${q2Count} important`,
            data: { type: "daily_review" },
            sound: "default",
            badge: 1,
          },
          trigger: {
            type: SchedulableTriggerInputTypes.WEEKLY,
            weekday: dayOfWeek === 0 ? 7 : dayOfWeek, // Convert Sunday from 0 to 7 for Expo
            hour: hours,
            minute: minutes,
          } as any,
        });

        identifiers.push(identifier);
      }

      return identifiers;
    } catch (error) {
      console.error("Failed to schedule daily reminder:", error);
      return [];
    }
  }

  /**
   * Reschedule all notifications for tasks
   */
  static async rescheduleAllNotifications(
    tasks: Task[],
    settings: NotificationSettings
  ): Promise<void> {
    try {
      // Cancel all existing task notifications
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const taskNotifications = scheduled.filter((n) => (n.content.data as any)?.taskId);

      for (const notif of taskNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }

      // Reschedule all tasks
      for (const task of tasks) {
        await this.scheduleTaskNotification(task, settings);
      }

      // Reschedule daily reminders
      await this.rescheduleDailyReminders(tasks, settings);
    } catch (error) {
      console.error("Failed to reschedule notifications:", error);
    }
  }

  /**
   * Reschedule daily reminders
   */
  static async rescheduleDailyReminders(
    tasks: Task[],
    settings: NotificationSettings
  ): Promise<void> {
    try {
      // Cancel existing daily reminders
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const dailyReminders = scheduled.filter((n) => (n.content.data as any)?.type === "daily_review");

      for (const notif of dailyReminders) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }

      // Reschedule daily reminders
      if (settings.dailyReminderEnabled) {
        const q1Count = tasks.filter((t) => t.eisenhower.quadrant === "Q1").length;
        const q2Count = tasks.filter((t) => t.eisenhower.quadrant === "Q2").length;

        await this.scheduleDailyReminder(settings, tasks.length, q1Count, q2Count);
      }
    } catch (error) {
      console.error("Failed to reschedule daily reminders:", error);
    }
  }

  /**
   * Cancel a specific notification
   */
  static async cancelNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.error("Failed to cancel notification:", error);
    }
  }

  /**
   * Cancel all notifications
   */
  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Failed to cancel all notifications:", error);
    }
  }

  /**
   * Get all scheduled notifications
   */
  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Failed to get scheduled notifications:", error);
      return [];
    }
  }

  /**
   * Send a test notification
   */
  static async sendTestNotification(title: string, body: string): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: "default",
          badge: 1,
        },
        trigger: {
          type: SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 2,
        },
      });
    } catch (error) {
      console.error("Failed to send test notification:", error);
    }
  }

  /**
   * Set up notification response listener
   */
  static onNotificationResponse(callback: (taskId: string) => void): () => void {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const taskId = (response.notification.request.content.data as any)?.taskId;
      if (taskId) {
        callback(taskId);
      }
    });

    return () => subscription.remove();
  }
}
