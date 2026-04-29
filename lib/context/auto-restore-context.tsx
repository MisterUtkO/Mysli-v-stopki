import React, { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import { backupFileExists, importAppData } from "@/lib/services/backup/backup-service";
import { useTaskContext } from "./task-context";
import { useI18n } from "./i18n-context";

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
      console.error("Error checking for backup:", error);
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
          onPress: () => {},
          style: "cancel",
        },
        {
          text: isRu ? "Восстановить" : "Restore",
          onPress: async () => {
            await performRestore();
          },
        },
      ]
    );
  };

  const performRestore = async () => {
    try {
      // This will be implemented with actual file picker
      // For now, just show a message
      Alert.alert(
        isRu ? "Информация" : "Info",
        isRu
          ? "Восстановление будет реализовано в следующем обновлении"
          : "Restore feature coming in next update"
      );
    } catch (error) {
      console.error("Error restoring backup:", error);
      Alert.alert(
        isRu ? "Ошибка" : "Error",
        isRu ? "Ошибка при восстановлении данных" : "Error restoring data"
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
