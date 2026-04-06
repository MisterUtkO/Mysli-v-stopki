import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useAppVersion } from "@/lib/context/app-version-context";
import { useI18n } from "@/lib/context/i18n-context";

export default function AboutScreen() {
  const { version } = useAppVersion();
  const { language } = useI18n();
  const isRu = language === "ru";

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="items-center gap-2">
            <Text className="text-3xl font-bold text-foreground">SDVGNote</Text>
            <Text className="text-sm text-muted">
              {isRu ? "Заметки для самоорганизации" : "Notes for self-organization"}
            </Text>
          </View>

          {/* Version Card */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-4">
              {isRu ? "Информация о версии" : "Version Information"}
            </Text>

            <View className="gap-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-base text-muted">
                  {isRu ? "Версия:" : "Version:"}
                </Text>
                <Text className="text-base font-semibold text-foreground">
                  v{version}
                </Text>
              </View>
            </View>
          </View>

          {/* Footer spacer */}
          <View className="h-4" />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
