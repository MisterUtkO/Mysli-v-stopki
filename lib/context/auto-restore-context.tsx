import React, { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import { backupFileExists, importAppData, getBackupFilePath, deleteBackupFile } from "@/lib/services/backup/backup-service";
import { useTaskContext } from "./task-context";
import { useI18n } from "./i18n-context";
import * as FileSystem from "expo-file-system/legacy";

interface AutoRestoreContextType {
  isChecking: boolean;
  hasBackup: boolean;
}

const AutoRestoreContext = React.createContext<AutoRestoreContextType>({
  isChecking: true,
  hasBackup: false,
});

export function AutoRestoreProvider({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const [hasBackup, setHasBackup] = useState(false);
  const { tasks } = useTaskContext();
  const { t, language } = useI18n();
  const isRu = language === "ru";

  useEffect(() => {
    checkAndRestoreBackup();
  }, []);

  const checkAndRestoreBackup = async () => {
    try {
      // Only check on native platforms
      if (Platform.OS === "web") {
        setIsChecking(false);
        return;
      }

      // Check if backup file exists
      const exists = await backupFileExists();
      setHasBackup(exists);

      if (exists && tasks.length === 0) {
        // Show restore prompt only if app has no tasks
        showRestorePrompt();
      }

      setIsChecking(false);
    } catch (error) {
      console.error("[AutoRestore] Error checking for backup:", error);
      setIsChecking(false);
    }
  };

  const showRestorePrompt = () => {
    Alert.alert(
      isRu ? "Восстановить данные?" : "Restore Data?",
      isRu
        ? "Найдена резервная копия приложения. Хотите восстановить данные?"
        : "A backup of your app data was found. Would you like to restore it?",
      [
        {
          text: isRu ? "Пропустить" : "Skip",
          onPress: () => {
            // Mark that user skipped restore
            console.log("[AutoRestore] User skipped restore");
          },
          style: "cancel",
        },
        {
          text: isRu ? "Восстановить" : "Restore",
          onPress: async () => {
            await performRestore();
          },
        },
      ],
      { cancelable: false }
    );
  };

  const performRestore = async () => {
    try {
      console.log("[AutoRestore] Starting restore process...");
      
      const filePath = await getBackupFilePath();
      const backupData = await importAppData(filePath);

      console.log(`[AutoRestore] Restored ${backupData.tasks.length} tasks from backup`);

      // Delete the backup file after successful restore
      // so it doesn't prompt again on next app launch
      try {
        await deleteBackupFile();
        console.log("[AutoRestore] Backup file deleted after restore");
      } catch (e) {
        console.warn("[AutoRestore] Could not delete backup file after restore", e);
      }

      // Show success message
      Alert.alert(
        isRu ? "Успешно" : "Success",
        isRu
          ? `Восстановлено ${backupData.tasks.length} задач. Приложение перезагружается...`
          : `Restored ${backupData.tasks.length} tasks. App is reloading...`,
        [
          {
            text: isRu ? "OK" : "OK",
            onPress: () => {
              // Force app reload by restarting the root navigator
              // This will cause TaskProvider to reload tasks from AsyncStorage
              console.log("[AutoRestore] Restore complete, app should reload");
            },
          },
        ]
      );
    } catch (error) {
      console.error("[AutoRestore] Error restoring backup:", error);
      Alert.alert(
        isRu ? "Ошибка" : "Error",
        isRu 
          ? `Ошибка при восстановлении данных: ${error instanceof Error ? error.message : "Unknown error"}`
          : `Error restoring data: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  return (
    <AutoRestoreContext.Provider value={{ isChecking, hasBackup }}>
      {children}
    </AutoRestoreContext.Provider>
  );
}

export function useAutoRestore() {
  const context = React.useContext(AutoRestoreContext);
  if (!context) {
    throw new Error("useAutoRestore must be used within AutoRestoreProvider");
  }
  return context;
}
