import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";
import { Task } from "@/lib/domain/types";

export interface BackupData {
  version: string;
  timestamp: number;
  tasks: Task[];
  settings: {
    language: string;
    theme: string;
    initialScreen: string;
    notificationsEnabled: boolean;
    soundEnabled: boolean;
  };
  achievements: Record<string, unknown>;
}

const BACKUP_FILENAME = "eisenhower-backup.json";

/**
 * Get the backup file path based on platform
 */
export async function getBackupFilePath(): Promise<string> {
  if (Platform.OS === "web") {
    throw new Error("Backup not supported on web platform");
  }

  const documentDir = (FileSystem as any).documentDirectory;
  if (!documentDir) {
    throw new Error("Document directory not available");
  }

  return `${documentDir}${BACKUP_FILENAME}`;
}

/**
 * Export all app data to a backup file
 */
export async function exportAppData(appVersion: string): Promise<string> {
  try {
    // Get all tasks from AsyncStorage
    const tasksJson = await AsyncStorage.getItem("tasks");
    const tasks: Task[] = tasksJson ? JSON.parse(tasksJson) : [];

    // Get all settings
    const language = await AsyncStorage.getItem("language");
    const theme = await AsyncStorage.getItem("theme");
    const initialScreen = await AsyncStorage.getItem("initialScreen");
    const notificationsEnabled = await AsyncStorage.getItem("notificationsEnabled");
    const soundEnabled = await AsyncStorage.getItem("soundEnabled");

    // Get achievements
    const achievementsJson = await AsyncStorage.getItem("achievements");
    const achievements = achievementsJson ? JSON.parse(achievementsJson) : {};

    const backupData: BackupData = {
      version: appVersion,
      timestamp: Date.now(),
      tasks,
      settings: {
        language: language || "en",
        theme: theme || "light",
        initialScreen: initialScreen || "tasks",
        notificationsEnabled: notificationsEnabled === "true",
        soundEnabled: soundEnabled !== "false", // default true
      },
      achievements,
    };

    // Write backup file
    const filePath = await getBackupFilePath();
    await FileSystem.writeAsStringAsync(
      filePath,
      JSON.stringify(backupData, null, 2)
    );

    return filePath;
  } catch (error) {
    console.error("Error exporting app data:", error);
    throw error;
  }
}

/**
 * Import app data from a backup file
 */
export async function importAppData(filePath: string): Promise<BackupData> {
  try {
    // Read backup file
    const fileContent = await FileSystem.readAsStringAsync(filePath);

    const backupData: BackupData = JSON.parse(fileContent);

    // Validate backup data structure
    if (!backupData.version || !backupData.tasks || !backupData.settings) {
      throw new Error("Invalid backup file format");
    }

    // Restore tasks
    if (Array.isArray(backupData.tasks) && backupData.tasks.length > 0) {
      await AsyncStorage.setItem("tasks", JSON.stringify(backupData.tasks));
    }

    // Restore settings
    await AsyncStorage.setItem("language", backupData.settings.language);
    await AsyncStorage.setItem("theme", backupData.settings.theme);
    await AsyncStorage.setItem("initialScreen", backupData.settings.initialScreen);
    await AsyncStorage.setItem(
      "notificationsEnabled",
      backupData.settings.notificationsEnabled ? "true" : "false"
    );
    await AsyncStorage.setItem(
      "soundEnabled",
      backupData.settings.soundEnabled ? "true" : "false"
    );

    // Restore achievements
    if (Object.keys(backupData.achievements).length > 0) {
      await AsyncStorage.setItem("achievements", JSON.stringify(backupData.achievements));
    }

    return backupData;
  } catch (error) {
    console.error("Error importing app data:", error);
    throw error;
  }
}

/**
 * Check if backup file exists
 */
export async function backupFileExists(): Promise<boolean> {
  try {
    const filePath = await getBackupFilePath();
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    return fileInfo.exists;
  } catch (error) {
    console.error("Error checking backup file:", error);
    return false;
  }
}

/**
 * Delete backup file
 */
export async function deleteBackupFile(): Promise<void> {
  try {
    const filePath = await getBackupFilePath();
    if (await backupFileExists()) {
      await FileSystem.deleteAsync(filePath);
    }
  } catch (error) {
    console.error("Error deleting backup file:", error);
    throw error;
  }
}

/**
 * Get backup file info (size, creation date, etc.)
 */
export async function getBackupFileInfo(): Promise<FileSystem.FileInfo | null> {
  try {
    const filePath = await getBackupFilePath();
    if (await backupFileExists()) {
      return await FileSystem.getInfoAsync(filePath);
    }
    return null;
  } catch (error) {
    console.error("Error getting backup file info:", error);
    return null;
  }
}
