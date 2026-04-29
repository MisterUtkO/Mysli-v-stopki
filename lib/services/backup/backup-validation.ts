import { BackupData } from "./backup-service";
import { Task } from "@/lib/domain/types";

/**
 * Validation schema for backup files
 */
export interface BackupValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    taskCount: number;
    backupDate: string;
    appVersion: string;
  };
}

/**
 * Validate backup file structure and content
 */
export function validateBackupData(data: unknown): BackupValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const stats = {
    taskCount: 0,
    backupDate: "Unknown",
    appVersion: "Unknown",
  };

  // Type check
  if (!data || typeof data !== "object") {
    errors.push("Backup data is not a valid object");
    return { isValid: false, errors, warnings, stats };
  }

  const backup = data as any;

  // Required fields
  if (!backup.version) {
    errors.push("Missing required field: version");
  } else {
    stats.appVersion = backup.version;
  }

  if (!backup.timestamp) {
    errors.push("Missing required field: timestamp");
  } else if (typeof backup.timestamp !== "number") {
    errors.push("Field 'timestamp' must be a number");
  } else {
    const date = new Date(backup.timestamp);
    stats.backupDate = date.toISOString();
  }

  if (!Array.isArray(backup.tasks)) {
    errors.push("Field 'tasks' must be an array");
  } else {
    stats.taskCount = backup.tasks.length;
    
    // Validate each task
    backup.tasks.forEach((task: any, index: number) => {
      if (!task.id) {
        errors.push(`Task ${index}: Missing required field 'id'`);
      }
      if (!task.title) {
        errors.push(`Task ${index}: Missing required field 'title'`);
      }
      if (typeof task.importance !== "number" || task.importance < 1 || task.importance > 7) {
        warnings.push(`Task ${index}: Invalid importance value (should be 1-7)`);
      }
      if (typeof task.urgency !== "number" || task.urgency < 1 || task.urgency > 7) {
        warnings.push(`Task ${index}: Invalid urgency value (should be 1-7)`);
      }
    });
  }

  if (!backup.settings || typeof backup.settings !== "object") {
    errors.push("Field 'settings' must be an object");
  } else {
    // Validate settings
    const validLanguages = ["en", "ru"];
    if (backup.settings.language && !validLanguages.includes(backup.settings.language)) {
      warnings.push(`Invalid language: ${backup.settings.language}`);
    }

    const validThemes = ["light", "dark", "amoled", "pastel", "notebook"];
    if (backup.settings.theme && !validThemes.includes(backup.settings.theme)) {
      warnings.push(`Invalid theme: ${backup.settings.theme}`);
    }
  }

  if (backup.achievements && typeof backup.achievements !== "object") {
    warnings.push("Field 'achievements' should be an object");
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    warnings,
    stats,
  };
}

/**
 * Get human-readable error message from validation result
 */
export function getValidationErrorMessage(result: BackupValidationResult, isRu: boolean): string {
  if (result.isValid) {
    return isRu ? "Резервная копия валидна" : "Backup is valid";
  }

  const errorList = result.errors.map((e) => `• ${e}`).join("\n");
  const title = isRu ? "Ошибки в резервной копии:" : "Backup errors:";
  return `${title}\n${errorList}`;
}

/**
 * Check if backup file is too old (older than 30 days)
 */
export function isBackupTooOld(timestamp: number, days: number = 30): boolean {
  const backupDate = new Date(timestamp);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - backupDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > days;
}

/**
 * Get backup file size in MB
 */
export function getBackupSizeInMB(jsonString: string): number {
  const bytes = new Blob([jsonString]).size;
  return bytes / (1024 * 1024);
}

/**
 * Sanitize backup data before import (remove invalid tasks, etc.)
 */
export function sanitizeBackupData(backup: BackupData): BackupData {
  return {
    ...backup,
    tasks: backup.tasks.filter((task) => {
      // Ensure task has required fields
      return task.id && task.title;
    }).map((task) => {
      // Clamp importance and urgency to valid range (1-7)
      const importance = task.importance !== undefined ? task.importance : 4;
      const urgency = task.urgency !== undefined ? task.urgency : 4;
      return {
        ...task,
        importance: Math.max(1, Math.min(7, importance)),
        urgency: Math.max(1, Math.min(7, urgency)),
      };
    }),
  };
}
