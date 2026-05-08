// lib/integrations/widget/widget-sync.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Task } from "@/lib/domain/types";
import { WIDGET_STORAGE_KEYS, WIDGET_CONFIG } from "./widget-constants";

interface WidgetTask {
  id: string;
  title: string;
  importance: number;
  urgency: number;
  priorityScore: number;
  quadrant: string;
  status: "not_started" | "in_progress" | "completed";
  createdAt: number;
}

export class WidgetSync {
  /**
   * Save recent tasks to shared storage for widget display
   * Called by app after task creation or update
   */
  static async syncTasksToWidget(allTasks: Task[]): Promise<void> {
    try {
      // Filter active tasks (not deleted), sort by creation date
      const activeTasks = allTasks
        .filter((t) => !t.deletedAt)
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, WIDGET_CONFIG.MAX_RECENT_TASKS);

      // Convert to widget-compatible format
      const widgetTasks: WidgetTask[] = activeTasks.map((task) => ({
        id: task.id,
        title: task.title,
        importance: task.importance,
        urgency: task.urgency,
        priorityScore: task.priorityScore,
        quadrant: task.quadrant,
        status: task.status,
        createdAt: task.createdAt,
      }));

      // Save to AsyncStorage
      await AsyncStorage.setItem(
        WIDGET_STORAGE_KEYS.RECENT_TASKS,
        JSON.stringify(widgetTasks)
      );

      // Update sync timestamp
      await AsyncStorage.setItem(
        WIDGET_STORAGE_KEYS.SYNC_TIMESTAMP,
        String(Date.now())
      );

      console.log("[WidgetSync] Synced", widgetTasks.length, "tasks to widget");
    } catch (error) {
      console.error("[WidgetSync] Failed to sync tasks to widget:", error);
    }
  }

  /**
   * Retrieve task data from widget storage
   * Called by widget to display recent tasks
   */
  static async getRecentTasksFromApp(): Promise<WidgetTask[]> {
    try {
      const data = await AsyncStorage.getItem(
        WIDGET_STORAGE_KEYS.RECENT_TASKS
      );
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("[WidgetSync] Failed to read recent tasks:", error);
      return [];
    }
  }

  /**
   * Check if widget-app sync is enabled
   */
  static async isWidgetEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(
        WIDGET_STORAGE_KEYS.WIDGET_ENABLED
      );
      return enabled === "true";
    } catch {
      return true; // Default to enabled
    }
  }

  /**
   * Enable/disable widget sync
   */
  static async setWidgetEnabled(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(
        WIDGET_STORAGE_KEYS.WIDGET_ENABLED,
        String(enabled)
      );
      console.log("[WidgetSync] Widget sync set to:", enabled);
    } catch (error) {
      console.error("[WidgetSync] Failed to set widget enabled:", error);
    }
  }

  /**
   * Get last sync timestamp
   */
  static async getLastSyncTime(): Promise<number> {
    try {
      const timestamp = await AsyncStorage.getItem(
        WIDGET_STORAGE_KEYS.SYNC_TIMESTAMP
      );
      return timestamp ? parseInt(timestamp) : 0;
    } catch {
      return 0;
    }
  }
}
