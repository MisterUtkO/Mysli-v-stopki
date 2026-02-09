import { useState } from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useTaskContext } from "@/lib/context/task-context";
import { useI18n } from "@/lib/context/i18n-context";
import { useThemeContext } from "@/lib/theme-provider";

export default function SettingsScreen() {
  const { exportTasks, clearAllData } = useTaskContext();
  const { language, setLanguage, t } = useI18n();
  const { colorScheme, setColorScheme } = useThemeContext();
  const [exporting, setExporting] = useState(false);

  const handleLanguageToggle = async () => {
    const newLang = language === "en" ? "ru" : "en";
    await setLanguage(newLang);
  };

  const handleThemeToggle = async () => {
    const newTheme = colorScheme === "light" ? "dark" : "light";
    await setColorScheme(newTheme);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await exportTasks();
      Alert.alert("Успешно", "Данные экспортированы");
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось экспортировать данные");
    } finally {
      setExporting(false);
    }
  };

  const handleClearData = () => {
    Alert.alert("Очистить все данные?", "Это действие нельзя отменить!", [
      { text: "Отмена", onPress: () => {} },
      {
        text: "Удалить",
        onPress: async () => {
          try {
            await clearAllData();
            Alert.alert("Успешно", "Все данные удалены");
          } catch (error) {
            Alert.alert("Ошибка", "Не удалось очистить данные");
          }
        },
        style: "destructive",
      },
    ]);
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          <Text className="text-2xl font-bold text-foreground mb-2">
            {t.settings.title}
          </Text>

          {/* Language Section */}
          <View className="bg-surface rounded-lg p-4 border border-border">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-semibold text-foreground">
                {t.settings.language}
              </Text>
              <View className="bg-primary px-3 py-1 rounded">
                <Text className="text-white font-bold text-sm">
                  {language === "en" ? "EN" : "РУ"}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={handleLanguageToggle}
              className="bg-primary rounded-lg p-3"
            >
              <Text className="text-center text-white font-semibold">
                {language === "en"
                  ? "Переключить на русский"
                  : "Switch to English"}
              </Text>
            </Pressable>
          </View>

          {/* Theme Section */}
          <View className="bg-surface rounded-lg p-4 border border-border">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-semibold text-foreground">
                {t.settings.theme}
              </Text>
              <View className="bg-primary px-3 py-1 rounded">
                <Text className="text-white font-bold text-sm">
                  {colorScheme === "light" ? "☀️" : "🌙"}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={handleThemeToggle}
              className="bg-primary rounded-lg p-3"
            >
              <Text className="text-center text-white font-semibold">
                {colorScheme === "light"
                  ? "Включить темную тему"
                  : "Включить светлую тему"}
              </Text>
            </Pressable>
          </View>

          {/* Data Management Section */}
          <View className="bg-surface rounded-lg p-4 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-3">
              {t.settings.dataManagement}
            </Text>

            <Pressable
              onPress={handleExport}
              disabled={exporting}
              className="bg-blue-500 rounded-lg p-3 mb-2 disabled:opacity-50"
            >
              <Text className="text-center text-white font-semibold">
                {exporting ? "Экспортирование..." : t.settings.exportData}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleClearData}
              className="bg-red-500 rounded-lg p-3"
            >
              <Text className="text-center text-white font-semibold">
                {t.settings.clearAllData}
              </Text>
            </Pressable>
          </View>

          {/* About Section */}
          <View className="bg-surface rounded-lg p-4 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-2">
              {t.settings.about}
            </Text>
            <Text className="text-sm text-muted mb-1">
              Eisenhower Priority App
            </Text>
            <Text className="text-xs text-muted">
              {t.settings.version}: 1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
