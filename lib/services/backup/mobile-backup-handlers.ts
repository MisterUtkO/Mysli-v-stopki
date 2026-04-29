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
import { Platform } from "react-native";

export const MobileBackupHandlers = {
  /**
   * Export backup to file system and share it
   * On Android: Saves to Downloads folder directly
   * On iOS: Uses native share dialog
   */
  async exportBackup(tasks: Task[], settings: any): Promise<string> {
    try {
      // Create backup data structure
      const backup: BackupData = {
        version: "1.3.0",
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

      // Create file name with date
      const fileName = `tasks-backup-${new Date().toISOString().split("T")[0]}.json`;

      // Platform-specific handling
      if (Platform.OS === "android") {
        // On Android, save directly to Downloads folder
        const downloadsDir = `${FileSystem.documentDirectory}../../../Download/`;
        const filePath = `${downloadsDir}${fileName}`;

        try {
          // Try to write to Downloads
          await FileSystem.writeAsStringAsync(filePath, backupJson);
          console.log("[MobileBackupHandlers] Backup saved to Downloads:", filePath);
          return filePath;
        } catch (downloadError) {
          // Fallback: Save to app's document directory and share
          console.warn("[MobileBackupHandlers] Failed to save to Downloads, using share dialog:", downloadError);
          return await exportViaSharing(backupJson, fileName);
        }
      } else if (Platform.OS === "ios") {
        // On iOS, use native share dialog
        return await exportViaSharing(backupJson, fileName);
      } else {
        throw new Error("Unsupported platform for mobile backup");
      }
    } catch (error) {
      console.error("[MobileBackupHandlers] Export backup error:", error);
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
      console.error("[MobileBackupHandlers] Import backup error:", error);
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
      console.error("[MobileBackupHandlers] Get backup info error:", error);
      return null;
    }
  },
};

/**
 * Helper function to export via native share dialog
 */
async function exportViaSharing(backupJson: string, fileName: string): Promise<string> {
  // Check if sharing is available
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error("Sharing is not available on this device");
  }

  // Create temporary file in cache directory
  const cacheDir = (FileSystem as any).cacheDirectory;
  if (!cacheDir) throw new Error("Cache directory not available");
  const tempFilePath = `${cacheDir}${fileName}`;

  // Write to temporary file
  await FileSystem.writeAsStringAsync(tempFilePath, backupJson);

  // Share the file (user can choose where to save)
  try {
    await Sharing.shareAsync(tempFilePath, {
      mimeType: "application/json",
      dialogTitle: "Export Tasks Backup",
      UTI: "public.json",
    });
  } catch (shareError) {
    // If sharing fails, provide a more helpful error message
    const errorMsg = shareError instanceof Error ? shareError.message : String(shareError);

    // Check if it's a permission error
    if (errorMsg.includes("Permission") || errorMsg.includes("getFilePermission")) {
      throw new Error(
        "File sharing permission denied. Please check app permissions in settings and try again."
      );
    }

    throw shareError;
  }

  return tempFilePath;
}
