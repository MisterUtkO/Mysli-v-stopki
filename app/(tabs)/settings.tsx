import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  Switch,
  Platform,
} from "react-native";
import * as Notifications from "expo-notifications";
import { ScreenContainer } from "@/components/screen-container";
import { useTaskContext } from "@/lib/context/task-context";
import { useI18n } from "@/lib/context/i18n-context";
import { useThemeContext } from "@/lib/theme-provider";

type NotifFrequency = "never" | "hourly" | "daily" | "weekly" | "always";

export default function SettingsScreen() {
  const { settings, updateSettings, exportTasks, clearAllData } =
    useTaskContext();
  const { language, setLanguage, t } = useI18n();
  const { colorScheme, setColorScheme } = useThemeContext();
  const [exporting, setExporting] = useState(false);

  const isRu = language === "ru";

  const handleLanguageToggle = async () => {
    const newLang = language === "en" ? "ru" : "en";
    await setLanguage(newLang);
    await updateSettings({ language: newLang });
  };

  const handleThemeToggle = async () => {
    const newTheme = colorScheme === "light" ? "dark" : "light";
    await setColorScheme(newTheme);
    await updateSettings({ theme: newTheme });
  };

  const handleNotificationsToggle = async () => {
    const newValue = !settings.notificationsEnabled;

    if (newValue && Platform.OS !== "web") {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        const { status: newStatus } =
          await Notifications.requestPermissionsAsync();
        if (newStatus !== "granted") {
          Alert.alert(
            isRu ? "Разрешение не получено" : "Permission denied",
            isRu
              ? "Включите уведомления в настройках устройства"
              : "Enable notifications in device settings"
          );
          return;
        }
      }
    }

    await updateSettings({ notificationsEnabled: newValue });
  };

  const handleFrequencyChange = async (frequency: NotifFrequency) => {
    await updateSettings({ notificationFrequency: frequency });
  };

  const handleTestNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: isRu ? "🔔 Тестовое уведомление" : "🔔 Test notification",
          body: isRu
            ? "Уведомления работают корректно!"
            : "Notifications are working correctly!",
          sound: true,
        },
        trigger: null,
      });
    } catch (e) {
      Alert.alert(
        isRu ? "Ошибка" : "Error",
        isRu
          ? "Не удалось отправить уведомление"
          : "Failed to send notification"
      );
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportTasks();
      Alert.alert(
        isRu ? "Успешно" : "Success",
        isRu ? "Данные экспортированы" : "Data exported"
      );
    } catch (error) {
      Alert.alert(
        isRu ? "Ошибка" : "Error",
        isRu
          ? "Не удалось экспортировать данные"
          : "Failed to export data"
      );
    } finally {
      setExporting(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      isRu ? "Очистить все данные?" : "Clear all data?",
      isRu ? "Это действие нельзя отменить!" : "This action cannot be undone!",
      [
        { text: isRu ? "Отмена" : "Cancel", style: "cancel" },
        {
          text: isRu ? "Удалить" : "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await clearAllData();
              Alert.alert(
                isRu ? "Успешно" : "Success",
                isRu ? "Все данные удалены" : "All data cleared"
              );
            } catch (error) {
              Alert.alert(
                isRu ? "Ошибка" : "Error",
                isRu
                  ? "Не удалось очистить данные"
                  : "Failed to clear data"
              );
            }
          },
        },
      ]
    );
  };

  const frequencyOptions: { value: NotifFrequency; label: string }[] = [
    {
      value: "never",
      label: isRu ? "Никогда" : "Never",
    },
    {
      value: "hourly",
      label: isRu ? "Каждый час" : "Hourly",
    },
    {
      value: "daily",
      label: isRu ? "Ежедневно" : "Daily",
    },
    {
      value: "weekly",
      label: isRu ? "Еженедельно" : "Weekly",
    },
    {
      value: "always",
      label: isRu ? "Всегда" : "Always",
    },
  ];

  return (
    <ScreenContainer className="p-4">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-5">
          <Text
            className="text-foreground font-bold"
            style={{ fontSize: 28, lineHeight: 34, marginBottom: 4 }}
          >
            {t.settings.title}
          </Text>

          {/* Language Section */}
          <View className="bg-surface rounded-2xl p-5 border border-border">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center gap-3">
                <Text style={{ fontSize: 24 }}>🌐</Text>
                <Text
                  className="text-foreground font-semibold"
                  style={{ fontSize: 17 }}
                >
                  {t.settings.language}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: "#0a7ea4",
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}
              >
                <Text
                  style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 14 }}
                >
                  {language === "en" ? "EN" : "РУ"}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={handleLanguageToggle}
              style={({ pressed }) => [
                {
                  backgroundColor: "#0a7ea4",
                  borderRadius: 14,
                  padding: 14,
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: "#FFFFFF",
                  fontWeight: "600",
                  fontSize: 16,
                }}
              >
                {language === "en"
                  ? "Переключить на русский"
                  : "Switch to English"}
              </Text>
            </Pressable>
          </View>

          {/* Theme Section */}
          <View className="bg-surface rounded-2xl p-5 border border-border">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center gap-3">
                <Text style={{ fontSize: 24 }}>
                  {colorScheme === "light" ? "☀️" : "🌙"}
                </Text>
                <Text
                  className="text-foreground font-semibold"
                  style={{ fontSize: 17 }}
                >
                  {t.settings.theme}
                </Text>
              </View>
              <Text
                className="text-muted"
                style={{ fontSize: 14, fontWeight: "500" }}
              >
                {colorScheme === "light"
                  ? isRu
                    ? "Светлая"
                    : "Light"
                  : isRu
                    ? "Тёмная"
                    : "Dark"}
              </Text>
            </View>
            <Pressable
              onPress={handleThemeToggle}
              style={({ pressed }) => [
                {
                  backgroundColor: colorScheme === "light" ? "#1E293B" : "#F8FAFC",
                  borderRadius: 14,
                  padding: 14,
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: colorScheme === "light" ? "#FFFFFF" : "#1E293B",
                  fontWeight: "600",
                  fontSize: 16,
                }}
              >
                {colorScheme === "light"
                  ? isRu
                    ? "🌙 Включить тёмную тему"
                    : "🌙 Switch to dark"
                  : isRu
                    ? "☀️ Включить светлую тему"
                    : "☀️ Switch to light"}
              </Text>
            </Pressable>
          </View>

          {/* Notifications Section */}
          <View className="bg-surface rounded-2xl p-5 border border-border">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center gap-3">
                <Text style={{ fontSize: 24 }}>🔔</Text>
                <Text
                  className="text-foreground font-semibold"
                  style={{ fontSize: 17 }}
                >
                  {isRu ? "Уведомления" : "Notifications"}
                </Text>
              </View>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: "#9CA3AF", true: "#0a7ea4" }}
                thumbColor="#FFFFFF"
              />
            </View>

            {settings.notificationsEnabled && (
              <View className="gap-4">
                <Text
                  className="text-foreground font-semibold"
                  style={{ fontSize: 15 }}
                >
                  {isRu ? "Частота напоминаний:" : "Reminder frequency:"}
                </Text>

                <View className="gap-2">
                  {frequencyOptions.map((freq) => (
                    <Pressable
                      key={freq.value}
                      onPress={() => handleFrequencyChange(freq.value)}
                      style={({ pressed }) => [
                        {
                          padding: 14,
                          borderRadius: 12,
                          borderWidth: 2,
                          borderColor:
                            settings.notificationFrequency === freq.value
                              ? "#0a7ea4"
                              : "#E5E7EB",
                          backgroundColor:
                            settings.notificationFrequency === freq.value
                              ? "#0a7ea410"
                              : "transparent",
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight:
                            settings.notificationFrequency === freq.value
                              ? "700"
                              : "500",
                          color:
                            settings.notificationFrequency === freq.value
                              ? "#0a7ea4"
                              : "#687076",
                        }}
                      >
                        {settings.notificationFrequency === freq.value
                          ? "● "
                          : "○ "}
                        {freq.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Test notification button */}
                <Pressable
                  onPress={handleTestNotification}
                  style={({ pressed }) => [
                    {
                      backgroundColor: "#FFA94D",
                      borderRadius: 14,
                      padding: 14,
                      marginTop: 4,
                      opacity: pressed ? 0.8 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    },
                  ]}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      color: "#FFFFFF",
                      fontWeight: "600",
                      fontSize: 16,
                    }}
                  >
                    {isRu
                      ? "🔔 Тестовое уведомление"
                      : "🔔 Test notification"}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Data Management Section */}
          <View className="bg-surface rounded-2xl p-5 border border-border">
            <View className="flex-row items-center gap-3 mb-4">
              <Text style={{ fontSize: 24 }}>💾</Text>
              <Text
                className="text-foreground font-semibold"
                style={{ fontSize: 17 }}
              >
                {t.settings.dataManagement}
              </Text>
            </View>

            <View className="gap-3">
              <Pressable
                onPress={handleExport}
                disabled={exporting}
                style={({ pressed }) => [
                  {
                    backgroundColor: exporting ? "#9CA3AF" : "#3B82F6",
                    borderRadius: 14,
                    padding: 14,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: "#FFFFFF",
                    fontWeight: "600",
                    fontSize: 16,
                  }}
                >
                  {exporting
                    ? isRu
                      ? "Экспорт..."
                      : "Exporting..."
                    : isRu
                      ? "📤 Экспорт данных"
                      : "📤 Export data"}
                </Text>
              </Pressable>

              <Pressable
                onPress={handleClearData}
                style={({ pressed }) => [
                  {
                    backgroundColor: "#EF4444",
                    borderRadius: 14,
                    padding: 14,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: "#FFFFFF",
                    fontWeight: "600",
                    fontSize: 16,
                  }}
                >
                  {isRu ? "🗑 Очистить все данные" : "🗑 Clear all data"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* About Section */}
          <View className="bg-surface rounded-2xl p-5 border border-border">
            <View className="flex-row items-center gap-3 mb-3">
              <Text style={{ fontSize: 24 }}>ℹ️</Text>
              <Text
                className="text-foreground font-semibold"
                style={{ fontSize: 17 }}
              >
                {t.settings.about}
              </Text>
            </View>
            <Text className="text-foreground" style={{ fontSize: 15 }}>
              Eisenhower Priority
            </Text>
            <Text className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>
              {t.settings.version}: 1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
