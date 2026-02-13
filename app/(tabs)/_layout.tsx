import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useI18n } from "@/lib/context/i18n-context";
import { useTaskContext } from "@/lib/context/task-context";

export default function TabLayout() {
  const colors = useColors();
  const { t, language } = useI18n();
  const { settings } = useTaskContext();
  const isRu = language === "ru";
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;
  
  // Map startScreen setting to tab name
  const getInitialRouteName = (): string => {
    const screenMap: Record<string, string> = {
      index: "index",
      matrix: "matrix",
      achievements: "achievements",
      settings: "settings",
      statistics: "index", // statistics is not a tab, default to index
    };
    return screenMap[settings.startScreen || "index"] || "index";
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerShown: false,
        tabBarButton: HapticTab,
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
      initialRouteName={getInitialRouteName()}
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
