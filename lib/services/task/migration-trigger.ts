/**
 * Migration Trigger Service
 * 
 * Handles one-time migration of existing tasks to new quadrant logic
 * Runs on app startup and only migrates tasks that haven't been migrated yet
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Task } from "@/lib/domain/types";
import { migrateTaskToNewLogic } from "./task-migration";

const MIGRATION_VERSION_KEY = "migration_quadrant_logic_v1";
const CURRENT_MIGRATION_VERSION = "1.0.87"; // Should match app version

/**
 * Check if migration has already been run
 */
export async function hasMigrationRun(): Promise<boolean> {
  try {
    const version = await AsyncStorage.getItem(MIGRATION_VERSION_KEY);
    return version === CURRENT_MIGRATION_VERSION;
  } catch (error) {
    console.error("[Migration] Error checking migration status:", error);
    return false;
  }
}

/**
 * Mark migration as complete
 */
export async function markMigrationComplete(): Promise<void> {
  try {
    await AsyncStorage.setItem(MIGRATION_VERSION_KEY, CURRENT_MIGRATION_VERSION);
    console.log("[Migration] Migration marked as complete");
  } catch (error) {
    console.error("[Migration] Error marking migration complete:", error);
  }
}

/**
 * Migrate existing tasks to new quadrant logic
 * 
 * This function:
 * 1. Checks if migration has already run
 * 2. If not, applies new quadrant logic to all tasks
 * 3. Marks migration as complete
 * 
 * Returns the migrated tasks (or empty array if already migrated)
 */
export async function migrateExistingTasks(
  tasks: Task[],
  updateTaskFn: (id: string, updates: Partial<Task>) => Promise<void>
): Promise<Task[]> {
  try {
    // Check if already migrated
    const alreadyMigrated = await hasMigrationRun();
    if (alreadyMigrated) {
      console.log("[Migration] Tasks already migrated, skipping");
      return [];
    }

    if (tasks.length === 0) {
      console.log("[Migration] No tasks to migrate");
      await markMigrationComplete();
      return [];
    }

    console.log(`[Migration] Starting migration of ${tasks.length} tasks`);

    const now = new Date();
    const migratedTasks: Task[] = [];

    // Migrate each task
    for (const task of tasks) {
      try {
        const updates = migrateTaskToNewLogic(task, now);
        await updateTaskFn(task.id, updates);
        migratedTasks.push({ ...task, ...updates } as Task);
        console.log(`[Migration] Migrated task: ${task.id}`);
      } catch (error) {
        console.error(`[Migration] Error migrating task ${task.id}:`, error);
      }
    }

    // Mark migration as complete
    await markMigrationComplete();

    console.log(`[Migration] Migration complete. Migrated ${migratedTasks.length} tasks`);
    return migratedTasks;
  } catch (error) {
    console.error("[Migration] Error during migration:", error);
    return [];
  }
}

/**
 * Force re-run migration (for testing or manual updates)
 */
export async function resetMigrationStatus(): Promise<void> {
  try {
    await AsyncStorage.removeItem(MIGRATION_VERSION_KEY);
    console.log("[Migration] Migration status reset");
  } catch (error) {
    console.error("[Migration] Error resetting migration status:", error);
  }
}
