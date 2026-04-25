/**
 * App Shortcuts Integration
 * Provides quick access to common actions via long-press on app icon
 * Works on iOS (13+) and Android (7.1+)
 */

import * as Linking from "expo-linking";
import { Platform } from "react-native";

export interface AppShortcut {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  userInfo?: Record<string, any>;
}

/**
 * Initialize app shortcuts for iOS and Android
 * Called on app startup
 */
export async function initializeAppShortcuts() {
  if (Platform.OS === "ios") {
    await initializeIOSShortcuts();
  } else if (Platform.OS === "android") {
    await initializeAndroidShortcuts();
  }
}

/**
 * Initialize iOS App Shortcuts (via deep linking)
 * iOS doesn't have native app shortcuts API in Expo, so we use deep linking
 */
async function initializeIOSShortcuts() {
  try {
    // iOS shortcuts are configured via app.config.ts intentFilters
    // We handle the deep links in the app navigation
    console.log("[AppShortcuts] iOS shortcuts initialized");
  } catch (error) {
    console.error("[AppShortcuts] Failed to initialize iOS shortcuts:", error);
  }
}

/**
 * Initialize Android App Shortcuts
 * Android 7.1+ supports app shortcuts via Intent
 */
async function initializeAndroidShortcuts() {
  try {
    // Android shortcuts are configured via app.config.ts intentFilters
    // We handle the deep links in the app navigation
    console.log("[AppShortcuts] Android shortcuts initialized");
  } catch (error) {
    console.error("[AppShortcuts] Failed to initialize Android shortcuts:", error);
  }
}

/**
 * Handle app shortcut deep link
 * Called when user taps a shortcut
 */
export function handleAppShortcutDeepLink(url: string): { action: string; params?: Record<string, any> } | null {
  try {
    const parsed = Linking.parse(url);
    const path = parsed.path?.split("/").filter(Boolean) || [];
    
    if (path[0] === "create-task") {
      return {
        action: "create-task",
        params: {
          importance: parseInt(parsed.queryParams?.importance as string) || 5,
          urgency: parseInt(parsed.queryParams?.urgency as string) || 5,
          quadrant: parsed.queryParams?.quadrant as string,
        },
      };
    }

    if (path[0] === "view-matrix") {
      return { action: "view-matrix" };
    }

    if (path[0] === "view-kanban") {
      return { action: "view-kanban" };
    }

    if (path[0] === "view-statistics") {
      return { action: "view-statistics" };
    }

    return null;
  } catch (error) {
    console.error("[AppShortcuts] Failed to handle deep link:", error);
    return null;
  }
}

/**
 * Get app shortcuts for current platform
 */
export function getAvailableShortcuts(): AppShortcut[] {
  return [
    {
      id: "create-task",
      title: "Создать задачу",
      subtitle: "Быстро добавить новую задачу",
      icon: "plus",
    },
    {
      id: "view-matrix",
      title: "Матрица",
      subtitle: "Просмотр матрицы Эйзенхауэра",
      icon: "square.grid.2x2",
    },
    {
      id: "view-kanban",
      title: "Канбан",
      subtitle: "Просмотр канбан доски",
      icon: "rectangle.grid.1x2",
    },
    {
      id: "view-statistics",
      title: "Статистика",
      subtitle: "Просмотр статистики",
      icon: "chart.bar",
    },
  ];
}
