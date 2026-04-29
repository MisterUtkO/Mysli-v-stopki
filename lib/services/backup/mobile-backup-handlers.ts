/**
 * Mobile-compatible backup handlers for export/import
 * Uses expo-file-system, expo-document-picker, and expo-sharing
 */

import * as FileSystem from "expo-file-system/legacy";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { validateBackupData, sanitizeBackupData } from "./backup-validation";
import type { Task } from "@/lib/domain/types";
import type { BackupData } from "./backup-service";

export const MobileBackupHandlers = {
  /**
   * Export backup to file system and share it
   * Uses expo-sharing to allow user to save to Downloads, Drive, etc.
   */
  async exportBackup(tasks: Task[], settings: any): Promise<string> {
    try {
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
      const backupJson = JSON.stringify(backup, null, 2);

      // Create temporary file in cache directory
      const fileName = `tasks-backup-${new Date().toISOString().split("T")[0]}.json`;
      const cacheDir = (FileSystem as any).cacheDirectory;
      if (!cacheDir) throw new Error("Cache directory not available");
      const tempFilePath = `${cacheDir}${fileName}`;

      // Write to temporary file
      await FileSystem.writeAsStringAsync(tempFilePath, backupJson);

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        throw new Error("Sharing is not available on this device");
      }

      // Share the file (user can choose where to save)
      await Sharing.shareAsync(tempFilePath, {
        mimeType: "application/json",
        dialogTitle: "Export Tasks Backup",
        UTI: "public.json",
      });

      return tempFilePath;
    } catch (error) {
      console.error("Export backup error:", error);
      throw new Error(`Failed to export backup: ${error instanceof Error ? error.message : "Unknown error"}`);
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
