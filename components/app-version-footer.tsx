import { View, Text } from "react-native";
import { useAppVersion } from "@/lib/context/app-version-context";

/**
 * AppVersionFooter — displays version at the bottom of Settings
 * Uses AppVersionProvider for single source of truth
 */
export function AppVersionFooter() {
  const { version } = useAppVersion();

  return (
    <View className="items-center py-6 border-t border-border mt-6">
      <Text className="text-sm text-muted">
        Мысли в стопки • v{version}
      </Text>
    </View>
  );
}
