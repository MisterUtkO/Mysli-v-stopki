import { Tabs, useRouter } from "expo-router";
import type { RelativePathString } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HapticTabWithGlow } from "@/components/animations/haptic-tab-with-glow";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Platform, View } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useI18n } from "@/lib/context/i18n-context";
import { useTaskContext } from "@/lib/context/task-context";
import { useEffect, useState } from "react";

export default function TabLayout() {
  const colors = useColors();
  const { t, language } = useI18n();
  const { settings, loading } = useTaskContext();
  const router = useRouter();
  const isRu = language === "ru";
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;
  const [hasNavigated, setHasNavigated] = useState(false);

  // Navigate to start screen after settings are loaded
  useEffect(() => {
    if (!loading && !hasNavigated && settings.startScreen) {
      const screenMap: Record<string, string> = {
        index: "index",
        matrix: "matrix",
        kanban: "kanban",
        achievements: "achievements",
        settings: "settings",
        statistics: "index",
      };
      const targetScreen = screenMap[settings.startScreen] || "index";
      
      console.log("[TabLayout] Attempting navigation to:", targetScreen);
      
      // Use setTimeout to ensure navigation stack is ready
      setTimeout(() => {
        try {
          // Use router.replace to navigate within the tabs
          const paths: Record<string, any> = {
            index: "/(tabs)/",
            matrix: "/(tabs)/matrix",
            kanban: "/(tabs)/kanban",
            achievements: "/(tabs)/achievements",
            settings: "/(tabs)/settings",
          };
          router.replace(paths[targetScreen] || "/(tabs)/");
          setHasNavigated(true);
          console.log("[TabLayout] Navigation successful to:", targetScreen);
        } catch (error) {
          console.error("[TabLayout] Navigation error:", error);
        }
      }, 200);
    }
  }, [loading, settings.startScreen, hasNavigated, router]);

  // Show loading state while settings are being loaded
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }} />
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerShown: false,
        tabBarButton: HapticTabWithGlow,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
        },
      }}
      screenListeners={{
        tabPress: () => {
          // Allow normal tab navigation
        },
      }}
      initialRouteName="index"
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.home.title,
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="matrix"
        options={{
          title: isRu ? "Матрица" : "Matrix",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="square.grid.2x2.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="kanban"
        options={{
          title: isRu ? "Канбан" : "Kanban",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="square.grid.3x3.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: isRu ? "Достижения" : "Achievements",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="trophy.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t.settings.title,
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="gear" color={color} />,
        }}
      />
    </Tabs>
  );
}
