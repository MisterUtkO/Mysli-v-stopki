// lib/integrations/widget/quick-task-handler.ts

import { WIDGET_STORAGE_KEYS, QUICK_TASK_DEFAULTS } from "./widget-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface QuickTaskInput {
  title: string;
  importance: number;
  urgency: number;
}

export interface QuickTaskResult {
  success: boolean;
  taskId?: string;
  error?: string;
}

export class QuickTaskHandler {
  /**
   * Store pending quick task from widget
   * Widget calls this before launching app
   */
  static async storePendingTask(input: QuickTaskInput): Promise<void> {
    try {
      // Validate input
      if (!input.title || input.title.trim().length === 0) {
        throw new Error("Task title is required");
      }

      if (input.importance < 1 || input.importance > 7) {
        throw new Error("Importance must be between 1 and 7");
      }

      if (input.urgency < 1 || input.urgency > 7) {
        throw new Error("Urgency must be between 1 and 7");
      }

      const taskData = {
        title: input.title.trim(),
        importance: Math.round(input.importance),
        urgency: Math.round(input.urgency),
        timestamp: Date.now(),
      };

      await AsyncStorage.setItem(
        WIDGET_STORAGE_KEYS.QUICK_TASK_DATA,
        JSON.stringify(taskData)
      );

      console.log("[QuickTaskHandler] Stored pending task:", taskData);
    } catch (error) {
      console.error("[QuickTaskHandler] Failed to store pending task:", error);
      throw error;
    }
  }

  /**
   * Retrieve pending quick task in app
   * App calls this on startup to check for widget-created tasks
   */
  static async getPendingTask(): Promise<QuickTaskInput | null> {
    try {
      const data = await AsyncStorage.getItem(
        WIDGET_STORAGE_KEYS.QUICK_TASK_DATA
      );
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("[QuickTaskHandler] Failed to get pending task:", error);
      return null;
    }
  }

  /**
   * Clear pending task after processing
   */
  static async clearPendingTask(): Promise<void> {
    try {
      await AsyncStorage.removeItem(WIDGET_STORAGE_KEYS.QUICK_TASK_DATA);
      console.log("[QuickTaskHandler] Cleared pending task");
    } catch (error) {
      console.error("[QuickTaskHandler] Failed to clear pending task:", error);
    }
  }
}
