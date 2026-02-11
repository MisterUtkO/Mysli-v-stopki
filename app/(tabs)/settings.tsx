import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  Switch,
  Platform,
  TextInput,
} from "react-native";
import * as Notifications from "expo-notifications";
import { ScreenContainer } from "@/components/screen-container";
import { useTaskContext } from "@/lib/context/task-context";
import { useI18n } from "@/lib/context/i18n-context";
import { useThemeContext } from "@/lib/theme-provider";
import type { MotivationalSettings } from "@/lib/domain/types";

type NotifFrequency = "never" | "hourly" | "daily" | "weekly" | "always";
type MotivFrequency = "never" | "10min" | "30min" | "hourly" | "daily" | "weekly";

export default function SettingsScreen() {
  const { settings, updateSettings, exportTasks, clearAllData } = useTaskContext();
  const { language, setLanguage, t } = useI18n();
  const { colorScheme, setColorScheme } = useThemeContext();
  const [exporting, setExporting] = useState(false);

  const isRu = language === "ru";

  // Motivational state
  const motivational = settings.motivational || { enabled: false, text: "", frequency: "daily" as MotivFrequency, exactTime: undefined };
  const [motivText, setMotivText] = useState(motivational.text);
  const [motivTime, setMotivTime] = useState(motivational.exactTime || "");

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
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== "granted") {
          Alert.alert(
            isRu ? "Разрешение не получено" : "Permission denied",
            isRu ? "Включите уведомления в настройках устройства" : "Enable notifications in device settings"
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
          body: isRu ? "Уведомления работают корректно!" : "Notifications are working correctly!",
          sound: true,
        },
        trigger: null,
      });
    } catch (e) {
      Alert.alert(isRu ? "Ошибка" : "Error", isRu ? "Не удалось отправить" : "Failed to send");
    }
  };

  const handleMotivationalToggle = async () => {
    const updated: MotivationalSettings = { ...motivational, enabled: !motivational.enabled };
    await updateSettings({ motivational: updated });
  };

  const handleMotivationalFrequency = async (freq: MotivFrequency) => {
    const updated: MotivationalSettings = { ...motivational, frequency: freq };
    await updateSettings({ motivational: updated });
  };

  const handleMotivationalTextSave = async () => {
    const updated: MotivationalSettings = { ...motivational, text: motivText };
    await updateSettings({ motivational: updated });
  };

  const handleMotivationalTimeSave = async () => {
    // Validate HH:MM format
    if (motivTime && !/^\d{1,2}:\d{2}$/.test(motivTime)) {
      Alert.alert(isRu ? "Ошибка" : "Error", isRu ? "Формат: ЧЧ:ММ" : "Format: HH:MM");
      return;
    }
    const updated: MotivationalSettings = { ...motivational, exactTime: motivTime || undefined };
    await updateSettings({ motivational: updated });
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportTasks();
      Alert.alert(isRu ? "Успешно" : "Success", isRu ? "Данные экспортированы" : "Data exported");
    } catch {
      Alert.alert(isRu ? "Ошибка" : "Error", isRu ? "Не удалось экспортировать" : "Failed to export");
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
              Alert.alert(isRu ? "Успешно" : "Success", isRu ? "Все данные удалены" : "All data cleared");
            } catch {
              Alert.alert(isRu ? "Ошибка" : "Error", isRu ? "Не удалось очистить" : "Failed to clear");
            }
          },
        },
      ]
    );
  };

  const frequencyOptions: { value: NotifFrequency; label: string }[] = [
    { value: "never", label: isRu ? "Никогда" : "Never" },
    { value: "hourly", label: isRu ? "Каждый час" : "Hourly" },
    { value: "daily", label: isRu ? "Ежедневно" : "Daily" },
    { value: "weekly", label: isRu ? "Еженедельно" : "Weekly" },
    { value: "always", label: isRu ? "Каждые 30 мин" : "Every 30 min" },
  ];

  const motivFreqOptions: { value: MotivFrequency; label: string }[] = [
    { value: "never", label: isRu ? "Выкл" : "Off" },
    { value: "10min", label: isRu ? "10 мин" : "10 min" },
    { value: "30min", label: isRu ? "30 мин" : "30 min" },
    { value: "hourly", label: isRu ? "1 час" : "1 hour" },
    { value: "daily", label: isRu ? "1 день" : "1 day" },
    { value: "weekly", label: isRu ? "1 неделя" : "1 week" },
  ];

  const sectionStyle = "bg-surface rounded-2xl p-4 border border-border";

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          <Text className="text-foreground font-bold" style={{ fontSize: 28, lineHeight: 34, marginBottom: 2 }}>
            {t.settings.title}
          </Text>

          {/* Language */}
          <View className={sectionStyle}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Text style={{ fontSize: 22 }}>🌐</Text>
                <Text className="text-foreground font-semibold" style={{ fontSize: 16 }}>{t.settings.language}</Text>
              </View>
              <Pressable
                onPress={handleLanguageToggle}
                style={({ pressed }) => [{ backgroundColor: "#0a7ea4", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 7, opacity: pressed ? 0.7 : 1 }]}
              >
                <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 14 }}>
                  {language === "en" ? "РУС" : "ENG"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Theme */}
          <View className={sectionStyle}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Text style={{ fontSize: 22 }}>{colorScheme === "light" ? "☀️" : "🌙"}</Text>
                <Text className="text-foreground font-semibold" style={{ fontSize: 16 }}>{t.settings.theme}</Text>
              </View>
              <Pressable
                onPress={handleThemeToggle}
                style={({ pressed }) => [{
                  backgroundColor: colorScheme === "light" ? "#1E293B" : "#F8FAFC",
                  borderRadius: 12, paddingHorizontal: 14, paddingVertical: 7, opacity: pressed ? 0.7 : 1,
                }]}
              >
                <Text style={{ color: colorScheme === "light" ? "#FFF" : "#1E293B", fontWeight: "700", fontSize: 14 }}>
                  {colorScheme === "light" ? (isRu ? "Тёмная" : "Dark") : (isRu ? "Светлая" : "Light")}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Task Notifications */}
          <View className={sectionStyle}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Text style={{ fontSize: 22 }}>🔔</Text>
                <Text className="text-foreground font-semibold" style={{ fontSize: 16 }}>
                  {isRu ? "Уведомления о задачах" : "Task Notifications"}
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
              <View className="gap-2">
                <Text className="text-muted" style={{ fontSize: 13, marginBottom: 2 }}>
                  {isRu ? "Частота по умолчанию (можно переопределить в каждой задаче):" : "Default frequency (can override per task):"}
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                  {frequencyOptions.map((freq) => (
                    <Pressable
                      key={freq.value}
                      onPress={() => handleFrequencyChange(freq.value)}
                      style={({ pressed }) => [{
                        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12,
                        borderWidth: 1.5,
                        borderColor: settings.notificationFrequency === freq.value ? "#0a7ea4" : "#D1D5DB",
                        backgroundColor: settings.notificationFrequency === freq.value ? "#0a7ea410" : "transparent",
                        opacity: pressed ? 0.7 : 1,
                      }]}
                    >
                      <Text style={{
                        fontSize: 13, fontWeight: settings.notificationFrequency === freq.value ? "700" : "500",
                        color: settings.notificationFrequency === freq.value ? "#0a7ea4" : "#6B7280",
                      }}>
                        {freq.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Pressable
                  onPress={handleTestNotification}
                  style={({ pressed }) => [{
                    backgroundColor: "#FFA94D", borderRadius: 12, padding: 10, marginTop: 6,
                    opacity: pressed ? 0.8 : 1,
                  }]}
                >
                  <Text style={{ textAlign: "center", color: "#FFF", fontWeight: "600", fontSize: 14 }}>
                    {isRu ? "🔔 Тест" : "🔔 Test"}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Motivational Reminders */}
          <View className={sectionStyle}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Text style={{ fontSize: 22 }}>💪</Text>
                <Text className="text-foreground font-semibold" style={{ fontSize: 16 }}>
                  {isRu ? "Мотивация" : "Motivation"}
                </Text>
              </View>
              <Switch
                value={motivational.enabled}
                onValueChange={handleMotivationalToggle}
                trackColor={{ false: "#9CA3AF", true: "#22C55E" }}
                thumbColor="#FFFFFF"
              />
            </View>

            {motivational.enabled && (
              <View className="gap-3">
                <Text className="text-muted" style={{ fontSize: 13 }}>
                  {isRu ? "Текст уведомления:" : "Notification text:"}
                </Text>
                <TextInput
                  value={motivText}
                  onChangeText={setMotivText}
                  onBlur={handleMotivationalTextSave}
                  placeholder={isRu ? "А ты ни о чём не забыл сегодня?" : "Did you forget anything today?"}
                  placeholderTextColor="#999"
                  multiline
                  returnKeyType="done"
                  className="bg-background border border-border rounded-xl p-3 text-foreground"
                  style={{ fontSize: 14, minHeight: 50 }}
                />

                <Text className="text-muted" style={{ fontSize: 13 }}>
                  {isRu ? "Частота:" : "Frequency:"}
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                  {motivFreqOptions.map((freq) => (
                    <Pressable
                      key={freq.value}
                      onPress={() => handleMotivationalFrequency(freq.value)}
                      style={({ pressed }) => [{
                        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12,
                        borderWidth: 1.5,
                        borderColor: motivational.frequency === freq.value ? "#22C55E" : "#D1D5DB",
                        backgroundColor: motivational.frequency === freq.value ? "#22C55E10" : "transparent",
                        opacity: pressed ? 0.7 : 1,
                      }]}
                    >
                      <Text style={{
                        fontSize: 13, fontWeight: motivational.frequency === freq.value ? "700" : "500",
                        color: motivational.frequency === freq.value ? "#22C55E" : "#6B7280",
                      }}>
                        {freq.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text className="text-muted" style={{ fontSize: 13 }}>
                  {isRu ? "Или точное время (ЧЧ:ММ):" : "Or exact time (HH:MM):"}
                </Text>
                <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                  <TextInput
                    value={motivTime}
                    onChangeText={setMotivTime}
                    placeholder="09:00"
                    placeholderTextColor="#999"
                    keyboardType="numbers-and-punctuation"
                    returnKeyType="done"
                    onSubmitEditing={handleMotivationalTimeSave}
                    className="bg-background border border-border rounded-xl p-3 text-foreground"
                    style={{ fontSize: 14, width: 100, textAlign: "center" }}
                  />
                  <Pressable
                    onPress={handleMotivationalTimeSave}
                    style={({ pressed }) => [{
                      backgroundColor: "#22C55E", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8,
                      opacity: pressed ? 0.7 : 1,
                    }]}
                  >
                    <Text style={{ color: "#FFF", fontWeight: "600", fontSize: 13 }}>
                      {isRu ? "Сохранить" : "Save"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>

          {/* Data Management */}
          <View className={sectionStyle}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <Text style={{ fontSize: 22 }}>💾</Text>
              <Text className="text-foreground font-semibold" style={{ fontSize: 16 }}>{t.settings.dataManagement}</Text>
            </View>
            <View className="gap-2">
              <Pressable
                onPress={handleExport}
                disabled={exporting}
                style={({ pressed }) => [{
                  backgroundColor: exporting ? "#9CA3AF" : "#3B82F6", borderRadius: 12, padding: 12,
                  opacity: pressed ? 0.8 : 1,
                }]}
              >
                <Text style={{ textAlign: "center", color: "#FFF", fontWeight: "600", fontSize: 14 }}>
                  {exporting ? (isRu ? "Экспорт..." : "Exporting...") : (isRu ? "📤 Экспорт данных" : "📤 Export data")}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleClearData}
                style={({ pressed }) => [{
                  backgroundColor: "#EF4444", borderRadius: 12, padding: 12,
                  opacity: pressed ? 0.8 : 1,
                }]}
              >
                <Text style={{ textAlign: "center", color: "#FFF", fontWeight: "600", fontSize: 14 }}>
                  {isRu ? "🗑 Очистить все данные" : "🗑 Clear all data"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* About */}
          <View className={sectionStyle}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <Text style={{ fontSize: 22 }}>ℹ️</Text>
              <Text className="text-foreground font-semibold" style={{ fontSize: 16 }}>{t.settings.about}</Text>
            </View>
            <Text className="text-foreground" style={{ fontSize: 14 }}>SDVGNote</Text>
            <Text className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>{t.settings.version}: 1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
