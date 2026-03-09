import "@/global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { Platform } from "react-native";
import "@/lib/_core/nativewind-pressable";
import { ThemeProvider } from "@/lib/theme-provider";
import {
  SafeAreaFrameContext,
  SafeAreaInsetsContext,
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import type { EdgeInsets, Metrics, Rect } from "react-native-safe-area-context";

import { trpc, createTRPCClient } from "@/lib/trpc";
import { initManusRuntime, subscribeSafeAreaInsets } from "@/lib/_core/manus-runtime";
import { TaskProvider } from "@/lib/context/task-context";
import { I18nProvider } from "@/lib/context/i18n-context";
import { AchievementProvider, useAchievements } from "@/lib/context/achievement-context";
import { AchievementCelebration } from "@/components/achievement-celebration";
import { OnboardingTutorial } from "@/components/onboarding-tutorial";
import { useTaskContext } from "@/lib/context/task-context";
import { useI18n } from "@/lib/context/i18n-context";
import { initializeNotifications } from "@/lib/services/notification-scheduler";
import { Alert } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

// Global navigation ref for reliable navigation from anywhere in the app
export const navigationRef = React.createRef<any>();

const DEFAULT_WEB_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_WEB_FRAME: Rect = { x: 0, y: 0, width: 0, height: 0 };

// Helper function for navigation from root
export function navigateToScreen(screenName: string) {
  if (navigationRef.current) {
    navigationRef.current.navigate(screenName);
  }
}

export const unstable_settings = {
  anchor: "(tabs)",
};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_API_URL?: string;
    }
  }
}

/**
 * Component that checks achievements whenever tasks change
 * and shows celebration overlay for newly unlocked achievements
 */
function AchievementChecker() {
  const { tasks } = useTaskContext();
  const { language } = useI18n();
  const { newlyUnlocked, dismissNewAchievement, checkAndUnlock } = useAchievements();
  const isRu = language === "ru";
  const prevTaskCountRef = useRef(tasks.length);

  useEffect(() => {
    // Check achievements whenever tasks change
    if (tasks.length > 0) {
      checkAndUnlock(tasks);
    }
    prevTaskCountRef.current = tasks.length;
  }, [tasks]);

  if (!newlyUnlocked) return null;

  return (
    <AchievementCelebration
      achievement={newlyUnlocked}
      isRu={isRu}
      onDismiss={dismissNewAchievement}
    />
  );
}

export default function RootLayout() {
  const initialInsets = initialWindowMetrics?.insets ?? DEFAULT_WEB_INSETS;
  const initialFrame = initialWindowMetrics?.frame ?? DEFAULT_WEB_FRAME;

  const [insets, setInsets] = useState<EdgeInsets>(initialInsets);
  const [frame, setFrame] = useState<Rect>(initialFrame);

  useEffect(() => {
    initManusRuntime();
  }, []);

  // Initialize notifications (permissions + foreground handler + channels)
  useEffect(() => {
    initializeNotifications();
  }, []);

  // Reschedule notifications when app comes to foreground
  // This ensures notifications are always up-to-date even if app was closed
  useFocusEffect(
    React.useCallback(() => {
      console.log("[App] App came to foreground, rescheduling notifications");
      // Notifications will be rescheduled by TaskContext when it loads
      return () => {};
    }, [])
  );

  const handleSafeAreaUpdate = useCallback((metrics: Metrics) => {
    setInsets(metrics.insets);
    setFrame(metrics.frame);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const unsubscribe = subscribeSafeAreaInsets(handleSafeAreaUpdate);
    return () => unsubscribe();
  }, [handleSafeAreaUpdate]);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );
  const [trpcClient] = useState(() => createTRPCClient());

  const providerInitialMetrics = useMemo(() => {
    const metrics = initialWindowMetrics ?? { insets: initialInsets, frame: initialFrame };
    return {
      ...metrics,
      insets: {
        ...metrics.insets,
        top: Math.max(metrics.insets.top, 16),
        bottom: Math.max(metrics.insets.bottom, 12),
      },
    };
  }, [initialInsets, initialFrame]);

  const content = (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <I18nProvider>
            <TaskProvider>
                <AchievementProvider>
                <OnboardingTutorial />
                <AchievementChecker />
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="add-task" options={{ presentation: "modal", title: "Add Task" }} />
                  <Stack.Screen name="task-detail/[id]" options={{ presentation: "modal", title: "Task Details" }} />
                  <Stack.Screen name="statistics" options={{ presentation: "modal", title: "Statistics" }} />
                  <Stack.Screen name="about" options={{ presentation: "modal", title: "About" }} />
                  <Stack.Screen name="oauth/callback" />
                </Stack>
                <StatusBar style="auto" hidden={Platform.OS !== "web"} />
                </AchievementProvider>
            </TaskProvider>
          </I18nProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </GestureHandlerRootView>
  );

  const shouldOverrideSafeArea = Platform.OS === "web";

  if (shouldOverrideSafeArea) {
    return (
      <ThemeProvider>
        <SafeAreaProvider initialMetrics={providerInitialMetrics}>
          <SafeAreaFrameContext.Provider value={frame}>
            <SafeAreaInsetsContext.Provider value={insets}>
              {content}
            </SafeAreaInsetsContext.Provider>
          </SafeAreaFrameContext.Provider>
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider initialMetrics={providerInitialMetrics}>{content}</SafeAreaProvider>
    </ThemeProvider>
  );
}
