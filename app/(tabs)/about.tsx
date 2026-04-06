import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useAppVersion } from "@/lib/context/app-version-context";
import { useTaskContext } from "@/lib/context/task-context";
import { getReleaseNotesForVersion } from "@/lib/repositories/release-notes-repository";
import { useEffect, useState } from "react";

export default function AboutScreen() {
  const { versionName, versionCode, uiVersionText } = useAppVersion();
  const { settings } = useTaskContext();
  const language = settings.language;
  const [releaseNotes, setReleaseNotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const isRu = language === "ru";

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const notes = await getReleaseNotesForVersion(versionName, language as "ru" | "en");
        setReleaseNotes(notes);
      } catch (error) {
        console.error("[AboutScreen] Failed to load release notes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, [versionName, language]);

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
                  {versionName}
                </Text>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-base text-muted">
                  {isRu ? "Сборка:" : "Build:"}
                </Text>
                <Text className="text-base font-semibold text-foreground">
                  {versionCode}
                </Text>
              </View>
            </View>
          </View>

          {/* Release Notes Card */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-4">
              {isRu ? "Последние изменения" : "What's new"}
            </Text>

            {loading ? (
              <Text className="text-base text-muted">
                {isRu ? "Загрузка..." : "Loading..."}
              </Text>
            ) : releaseNotes.length > 0 ? (
              <View className="gap-2">
                {releaseNotes.map((note, index) => (
                  <View key={index} className="flex-row gap-3">
                    <Text className="text-primary font-bold">•</Text>
                    <Text className="flex-1 text-base text-foreground leading-relaxed">
                      {note}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-base text-muted italic">
                {isRu
                  ? "Информация о последних изменениях скоро появится."
                  : "Release notes will be available soon."}
              </Text>
            )}
          </View>

          {/* Footer spacer */}
          <View className="h-4" />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
