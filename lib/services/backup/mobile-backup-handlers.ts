/**
 * Mobile-compatible backup handlers for export/import
 * Uses expo-file-system and expo-document-picker
 */

import * as FileSystem from "expo-file-system/legacy";
import * as DocumentPicker from "expo-document-picker";
import { validateBackupData, sanitizeBackupData } from "./backup-validation";
import type { Task } from "@/lib/domain/types";
import type { BackupData } from "./backup-service";

export const MobileBackupHandlers = {
  /**
   * Export backup to file system
   */
  async exportBackup(tasks: Task[], settings: any): Promise<string> {
    try {
      // Create backup data
      // Create backup data structure
      const backup: BackupData = {
        version: "1.2.0",
        timestamp: Date.now(),
        tasks,
        settings: {
          language: settings.language || "en",
          theme: settings.theme || "light",
          initialScreen: settings.initialScreen || "home",
          notificationsEnabled: settings.notificationsEnabled !== false,
          soundEnabled: settings.soundEnabled !== false,
        },
        achievements: settings.achievements || {},
      };
      const backup_data = backup;
      const backupJson = JSON.stringify(backup_data, null, 2);

      // Save to file system
      const fileName = `tasks-backup-${new Date().toISOString().split("T")[0]}.json`;
      const documentDir = (FileSystem as any).documentDirectory;
      if (!documentDir) throw new Error("Document directory not available");
      const filePath = `${documentDir}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, backupJson);

      return filePath;
    } catch (error) {
      console.error("Export backup error:", error);
      throw new Error("Failed to export backup");
    }
  },

  /**
   * Import backup from file picker
   */
  async importBackup(): Promise<{ tasks: Task[]; settings: any } | null> {
    try {
      // Pick document
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return null;
      }

      const file = result.assets[0];
      if (!file.uri) {
        throw new Error("No file URI");
      }

      // Read file content
      const content = await FileSystem.readAsStringAsync(file.uri);
      const backup = JSON.parse(content);

      // Validate backup
      if (!validateBackupData(backup)) {
        throw new Error("Invalid backup file format");
      }

      // Sanitize data
      const sanitized = sanitizeBackupData(backup);

      return {
        tasks: sanitized.tasks,
        settings: sanitized.settings as any,
      };
    } catch (error) {
      console.error("Import backup error:", error);
      throw new Error("Failed to import backup");
    }
  },

  /**
   * Get backup file info
   */
  async getBackupFileInfo(filePath: string): Promise<{
    name: string;
    size: number;
    created: number;
  } | null> {
    try {
      const info = await FileSystem.getInfoAsync(filePath);

      if (!info.exists) {
        return null;
      }

      return {
        name: filePath.split("/").pop() || "backup.json",
        size: info.size || 0,
        created: info.modificationTime ? info.modificationTime * 1000 : Date.now(),
      };
    } catch (error) {
      console.error("Get backup info error:", error);
      return null;
    }
  },
};
