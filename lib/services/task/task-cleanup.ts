/**
 * Task Cleanup Service
 * Handles permanent deletion of soft-deleted tasks after 7 days
 */

import { getAllTasks, permanentlyDeleteTask as dbPermanentlyDeleteTask } from "@/lib/database/db";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Clean up permanently deleted tasks (older than 7 days)
 * Should be called periodically (e.g., on app startup, daily)
 */
export async function cleanupDeletedTasks(): Promise<number> {
  try {
    const allTasks = await getAllTasks();
    const now = Date.now();
    let deletedCount = 0;

    for (const task of allTasks) {
      if (task.isDeleted && task.deletedAt) {
        const timeSinceDelete = now - task.deletedAt;
        if (timeSinceDelete > SEVEN_DAYS_MS) {
          // Permanently delete this task
          await dbPermanentlyDeleteTask(task.id);
          deletedCount++;
          console.log(`[TaskCleanup] Permanently deleted task: ${task.id}`);
        }
      }
    }

    if (deletedCount > 0) {
      console.log(`[TaskCleanup] Cleaned up ${deletedCount} tasks`);
    }

    return deletedCount;
  } catch (error) {
    console.error("[TaskCleanup] Error during cleanup:", error);
    return 0;
  }
}

/**
 * Schedule periodic cleanup
 * Run this on app startup to clean up any tasks that should have been deleted
 */
export async function scheduleTaskCleanup(): Promise<void> {
  // Run cleanup immediately on app startup
  await cleanupDeletedTasks();

  // Schedule daily cleanup (at midnight)
  // In a real app, you'd use a background task scheduler like expo-task-manager
  // For now, we'll just run it on app startup
}
