/**
 * Mobile-compatible backup handlers for export/import
 * Uses expo-file-system StorageAccessFramework for Android (proper permission request)
 * Uses expo-sharing for iOS
 */

import * as FileSystem from "expo-file-system/legacy";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { validateBackupData, sanitizeBackupData } from "./backup-validation";
import type { Task } from "@/lib/domain/types";
import type { BackupData } from "./backup-service";
import { Platform, Alert } from "react-native";

// StorageAccessFramework from expo-file-system
const SAF = (FileSystem as any).StorageAccessFramework;

export const MobileBackupHandlers = {
  /**
   * Export backup to file system
   * On Android: Uses StorageAccessFramework to let user choose save location
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
        return await exportAndroid(backupJson, fileName);
      } else if (Platform.OS === "ios") {
        return await exportIOS(backupJson, fileName);
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
 * Export for Android - Uses StorageAccessFramework to request directory permission
 * This shows a native file picker dialog where user chooses where to save
 */
async function exportAndroid(backupJson: string, fileName: string): Promise<string> {
  try {
    // Use StorageAccessFramework to request permission and save file
    // This opens a native directory picker dialog
    const permissions = await SAF.requestDirectoryPermissionsAsync();
    
    if (!permissions.granted) {
      throw new Error("Доступ к файлам не предоставлен. Пожалуйста, разрешите доступ для сохранения резервной копии.");
    }

    // Create file in the selected directory
    const fileUri = await SAF.createFileAsync(
      permissions.directoryUri,
      fileName,
      "application/json"
    );

    // Write content to the file
    await FileSystem.writeAsStringAsync(fileUri, backupJson, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    console.log("[MobileBackupHandlers] Backup saved via SAF:", fileUri);
    
    Alert.alert(
      "Успешно",
      `Резервная копия сохранена:\n${fileName}`,
      [{ text: "OK" }]
    );

    return fileUri;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[MobileBackupHandlers] Android SAF export error:", errorMsg);
    
    // If SAF fails, try sharing as fallback
    if (errorMsg.includes("not granted") || errorMsg.includes("Доступ")) {
      throw error;
    }
    
    console.log("[MobileBackupHandlers] Falling back to share dialog");
    return await exportViaSharing(backupJson, fileName);
  }
}

/**
 * Export for iOS - uses native share dialog
 */
async function exportIOS(backupJson: string, fileName: string): Promise<string> {
  return await exportViaSharing(backupJson, fileName);
}

/**
 * Helper function to export via native share dialog (fallback)
 */
async function exportViaSharing(backupJson: string, fileName: string): Promise<string> {
  // Check if sharing is available
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error("Sharing is not available on this device");
  }

  // Create temporary file in cache directory
  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) throw new Error("Cache directory not available");
  const tempFilePath = `${cacheDir}${fileName}`;

  // Write to temporary file
  await FileSystem.writeAsStringAsync(tempFilePath, backupJson);

  // Share the file (user can choose where to save)
  await Sharing.shareAsync(tempFilePath, {
    mimeType: "application/json",
    dialogTitle: "Export Tasks Backup",
    UTI: "public.json",
  });

  return tempFilePath;
}
