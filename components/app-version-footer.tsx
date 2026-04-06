import { View, Text } from "react-native";
import { useAppVersion } from "@/lib/context/app-version-context";

interface AppVersionFooterProps {
  showBuild?: boolean;
}

/**
 * AppVersionFooter — displays version at the bottom of Settings
 * Uses centralized AppVersionProvider for single source of truth
 */
export function AppVersionFooter({ showBuild = false }: AppVersionFooterProps) {
  const { versionName, versionCode } = useAppVersion();

  return (
    <View className="items-center py-6 border-t border-border mt-6">
      <Text className="text-sm text-muted">
        SDVGNote • {versionName}
        {showBuild && ` (${versionCode})`}
      </Text>
    </View>
  );
}
