import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useTaskContext } from "@/lib/context/task-context";
import { useI18n } from "@/lib/context/i18n-context";

export default function SettingsScreen() {
  const { settings, updateSettings, exportTasks, importTasks, clearAllData } = useTaskContext();
  const { language, setLanguage } = useI18n();

  const handleLanguageToggle = async () => {
    const newLang = language === "en" ? "ru" : "en";
    await setLanguage(newLang);
    await updateSettings({ language: newLang });
  };

  const handleThemeToggle = async () => {
    const themes = ["light", "dark", "system"] as const;
    const currentIndex = themes.indexOf(settings.theme);
    const newTheme = themes[(currentIndex + 1) % themes.length];
    await updateSettings({ theme: newTheme });
  };

  const handleExport = async () => {
    try {
      const data = await exportTasks();
      Alert.alert("Export Successful", `Exported ${data.length} bytes of data`);
    } catch (error) {
      Alert.alert("Export Failed", String(error));
    }
  };

  const handleClearData = () => {
    Alert.alert("Clear All Data", "This cannot be undone!", [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Clear",
        onPress: async () => {
          await clearAllData();
          Alert.alert("Success", "All data cleared");
        },
        style: "destructive",
      },
    ]);
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Text className="text-2xl font-bold text-foreground mb-6">Settings</Text>

        {/* Language */}
        <View className="bg-surface rounded-lg p-4 mb-4 border border-border">
          <View className="flex-row justify-between items-center">
            <Text className="text-foreground font-semibold">Language</Text>
            <Pressable
              onPress={handleLanguageToggle}
              className="bg-primary rounded-lg px-4 py-2"
            >
              <Text className="text-white font-semibold">
                {language === "en" ? "English" : "Русский"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Theme */}
        <View className="bg-surface rounded-lg p-4 mb-4 border border-border">
          <View className="flex-row justify-between items-center">
            <Text className="text-foreground font-semibold">Theme</Text>
            <Pressable
              onPress={handleThemeToggle}
              className="bg-primary rounded-lg px-4 py-2"
            >
              <Text className="text-white font-semibold capitalize">
                {settings.theme}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Importance Threshold */}
        <View className="bg-surface rounded-lg p-4 mb-4 border border-border">
          <View className="flex-row justify-between items-center">
            <Text className="text-foreground font-semibold">Importance Threshold</Text>
            <Text className="text-primary font-bold">{settings.importanceThreshold}/7</Text>
          </View>
        </View>

        {/* Urgency Threshold */}
        <View className="bg-surface rounded-lg p-4 mb-4 border border-border">
          <View className="flex-row justify-between items-center">
            <Text className="text-foreground font-semibold">Urgency Threshold</Text>
            <Text className="text-primary font-bold">{settings.urgencyThreshold}/7</Text>
          </View>
        </View>

        {/* Export */}
        <Pressable
          onPress={handleExport}
          className="bg-surface rounded-lg p-4 mb-4 border border-border"
        >
          <Text className="text-foreground font-semibold text-center">Export Tasks</Text>
        </Pressable>

        {/* Clear Data */}
        <Pressable
          onPress={handleClearData}
          className="bg-error rounded-lg p-4 mb-4"
        >
          <Text className="text-white font-semibold text-center">Clear All Data</Text>
        </Pressable>

        {/* About */}
        <View className="bg-surface rounded-lg p-4 border border-border">
          <Text className="text-foreground font-semibold mb-2">About</Text>
          <Text className="text-muted text-sm">Eisenhower Priority App v1.0</Text>
          <Text className="text-muted text-sm">Simplified task prioritization</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
