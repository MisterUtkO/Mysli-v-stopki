import * as Notifications from "expo-notifications";
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
  dailyReminderTime?: string; // HH:MM format for daily reminders
  highPriorityOnly?: boolean; // Only notify for priority score >= 70
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  q1Enabled: true,
  q2Enabled: true,
  q3Enabled: false,
  reminderTime: 60, // 1 hour before
  dailyReminderTime: "09:00",
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
   * Check if notifications are enabled
   */
  static async getPermissionStatus(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Failed to check notification permissions:", error);
      return false;
    }
  }

  /**
   * Schedule a notification for a task
   */
  static async scheduleTaskNotification(
    task: Task,
    settings: NotificationSettings
  ): Promise<string | null> {
    try {
      if (!settings.enabled) return null;

      // Check if this quadrant should get notifications
      if (task.eisenhower.quadrant === "Q1" && !settings.q1Enabled) return null;
      if (task.eisenhower.quadrant === "Q2" && !settings.q2Enabled) return null;
      if (task.eisenhower.quadrant === "Q3" && !settings.q3Enabled) return null;
      if (task.eisenhower.quadrant === "Q4") return null; // Never notify for Q4

      // Only schedule if task has a due date
      if (!task.dueDate) return null;

      // Calculate notification time
      const dueDate = new Date(task.dueDate);
      const notificationTime = new Date(
        dueDate.getTime() - settings.reminderTime * 60 * 1000
      );

      // Don't schedule if notification time is in the past
      if (notificationTime < new Date()) return null;

      // Schedule the notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `📌 ${task.title}`,
          body: `Due in ${settings.reminderTime} minutes`,
          data: {
            taskId: task.id,
            quadrant: task.eisenhower.quadrant,
            priorityScore: task.priorityScore,
          },
          badge: 1,
          sound: true,
        },
        trigger: notificationTime as any,
      });

      return notificationId;
    } catch (error) {
      console.error("Failed to schedule notification:", error);
      return null;
    }
  }

  /**
   * Schedule daily reminder notification
   */
  static async scheduleDailyReminder(
    time: string, // HH:MM format
    settings: NotificationSettings
  ): Promise<string | null> {
    try {
      if (!settings.enabled) return null;

      const [hours, minutes] = time.split(":").map(Number);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "✅ Daily Review",
          body: "Time to review your tasks and priorities",
          data: {
            type: "daily_reminder",
          },
          badge: 1,
          sound: true,
        },
        trigger: {
          type: "daily",
          hour: hours,
          minute: minutes,
        } as any,
      });

      return notificationId;
    } catch (error) {
      console.error("Failed to schedule daily reminder:", error);
      return null;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  static async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error("Failed to cancel notification:", error);
    }
  }

  /**
   * Cancel all scheduled notifications
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
  static async getScheduledNotifications(): Promise<
    Notifications.NotificationRequest[]
  > {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Failed to get scheduled notifications:", error);
      return [];
    }
  }

  /**
   * Send a test notification immediately
   */
  static async sendTestNotification(
    title: string = "Test Notification",
    body: string = "This is a test notification"
  ): Promise<void> {
    try {
      const triggerDate = new Date();
      triggerDate.setSeconds(triggerDate.getSeconds() + 1);

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: "test" },
          badge: 1,
          sound: true,
        },
        trigger: triggerDate as any,
      });
    } catch (error) {
      console.error("Failed to send test notification:", error);
    }
  }

  /**
   * Handle notification response (when user taps notification)
   */
  static onNotificationResponse(
    callback: (taskId: string) => void
  ): () => void {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const taskId = response.notification.request.content.data?.taskId as string | undefined;
        if (taskId) {
          callback(taskId);
        }
      }
    );

    return () => subscription.remove();
  }

  /**
   * Handle notification received while app is in foreground
   */
  static onNotificationReceived(
    callback: (notification: Notifications.Notification) => void
  ): () => void {
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        callback(notification);
      }
    );

    return () => subscription.remove();
  }

  /**
   * Reschedule all task notifications
   */
  static async rescheduleAllNotifications(
    tasks: Task[],
    settings: NotificationSettings
  ): Promise<void> {
    try {
      // Cancel all existing notifications
      await this.cancelAllNotifications();

      // Schedule new notifications for all active tasks
      for (const task of tasks) {
        if (task.status === "active") {
          await this.scheduleTaskNotification(task, settings);
        }
      }

      // Schedule daily reminder if enabled
      if (settings.dailyReminderTime && settings.enabled) {
        await this.scheduleDailyReminder(settings.dailyReminderTime, settings);
      }
    } catch (error) {
      console.error("Failed to reschedule notifications:", error);
    }
  }

  /**
   * Get default notification settings
   */
  static getDefaultSettings(): NotificationSettings {
    return { ...DEFAULT_SETTINGS };
  }
}
