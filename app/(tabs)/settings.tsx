import { useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  Switch,
  Platform,
  TextInput,
  Linking,
  Modal,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { ScreenContainer } from "@/components/screen-container";
import { useTaskContext } from "@/lib/context/task-context";
import { useI18n } from "@/lib/context/i18n-context";
import { useThemeContext } from "@/lib/theme-provider";
import { useColors } from "@/hooks/use-colors";
import { sendTestNotification } from "@/lib/services/notification-scheduler";
import { useAchievements } from "@/lib/context/achievement-context";
import type { MotivationalSettings } from "@/lib/domain/types";

type NotifFrequency = "never" | "hourly" | "daily" | "weekly" | "always";
type MotivFrequency = "never" | "10min" | "30min" | "hourly" | "daily" | "weekly";

export default function SettingsScreen() {
  const { settings, updateSettings, exportTasks, clearAllData, tasks } = useTaskContext();
  const { language, setLanguage, t } = useI18n();
  const { colorScheme, setColorScheme } = useThemeContext();
  const { triggerCustomFlag, unlocked } = useAchievements();
  const colors = useColors();
  const [exporting, setExporting] = useState(false);
  const [copiedCard, setCopiedCard] = useState(false);
  const [aboutTapCount, setAboutTapCount] = useState(0);

  // Check if persistent_explorer achievement is unlocked (for AMOLED)
  const hasExplorerAchievement = unlocked.some((u) => u.achievementId === "persistent_explorer");

  const isRu = language === "ru";

  // Motivational state
  const motivational = settings.motivational || { enabled: false, text: "", frequency: "daily" as MotivFrequency, exactTime: undefined };
  const [motivText, setMotivText] = useState(motivational.text);

  // Time picker state
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerHour, setPickerHour] = useState(() => {
    if (motivational.exactTime) {
      const [h] = motivational.exactTime.split(":");
      return parseInt(h) || 9;
    }
    return 9;
  });
  const [pickerMinute, setPickerMinute] = useState(() => {
    if (motivational.exactTime) {
      const parts = motivational.exactTime.split(":");
      return parseInt(parts[1]) || 0;
    }
    return 0;
  });

  const handleLanguageToggle = async () => {
    const newLang = language === "en" ? "ru" : "en";
    await setLanguage(newLang);
    await updateSettings({ language: newLang });
  };

  const themeOptions = [
    { key: "light" as const, emoji: "☀️", labelEn: "Light", labelRu: "Светлая" },
    { key: "dark" as const, emoji: "🌙", labelEn: "Dark", labelRu: "Тёмная" },
    { key: "amoled" as const, emoji: "🖤", labelEn: "AMOLED", labelRu: "AMOLED" },
    { key: "pastel" as const, emoji: "🌸", labelEn: "Pastel", labelRu: "Пастель" },
  ];

  const handleThemeChange = async (theme: "light" | "dark" | "amoled" | "pastel") => {
    if (theme === "amoled" && !hasExplorerAchievement) {
      Alert.alert(
        isRu ? "🔒 Заблокировано" : "🔒 Locked",
        isRu
          ? "Получите достижение \"Упорный исследователь\" чтобы разблокировать AMOLED тему. Подсказка: изучите раздел \"О приложении\"."
          : "Earn the \"Persistent Explorer\" achievement to unlock the AMOLED theme. Hint: explore the About section."
      );
      return;
    }
    await setColorScheme(theme);
    await updateSettings({ theme });
  };

  const handleNotificationsToggle = async () => {
    const newValue = !settings.notificationsEnabled;
    await updateSettings({ notificationsEnabled: newValue });
  };

  const handleFrequencyChange = async (frequency: NotifFrequency) => {
    await updateSettings({ notificationFrequency: frequency });
  };

  const handleTestNotification = async () => {
    await sendTestNotification(isRu);
    if (Platform.OS === "web") {
      Alert.alert(
        isRu ? "Информация" : "Info",
        isRu ? "Уведомления работают только на устройстве (iOS/Android)" : "Notifications only work on device (iOS/Android)"
      );
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

  const handleTimePickerConfirm = async () => {
    const timeStr = `${String(pickerHour).padStart(2, "0")}:${String(pickerMinute).padStart(2, "0")}`;
    const updated: MotivationalSettings = { ...motivational, exactTime: timeStr };
    await updateSettings({ motivational: updated });
    setShowTimePicker(false);
  };

  const handleClearExactTime = async () => {
    const updated: MotivationalSettings = { ...motivational, exactTime: undefined };
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

  const handleOpenTelegram = () => {
    Linking.openURL("https://t.me/MisterUtkO");
    triggerCustomFlag("contact_dev", tasks);
  };

  const handleCopyCard = async () => {
    const cardNumber = "2200 7006 3018 0684";
    let copied = false;
    try {
      // Primary: expo-clipboard
      await Clipboard.setStringAsync(cardNumber);
      copied = true;
    } catch {
      // Fallback 1: Web navigator.clipboard
      if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(cardNumber);
          copied = true;
        } catch {
          // Fallback 2: legacy execCommand
          try {
            const textArea = document.createElement("textarea");
            textArea.value = cardNumber;
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            textArea.style.top = "-9999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            copied = document.execCommand("copy");
            document.body.removeChild(textArea);
          } catch {
            copied = false;
          }
        }
      }
    }
    if (copied) {
      setCopiedCard(true);
      setTimeout(() => setCopiedCard(false), 2500);
      triggerCustomFlag("copy_card", tasks);
    } else {
      Alert.alert(
        isRu ? "Номер карты" : "Card number",
        cardNumber + "\n\n" + (isRu ? "Скопируйте вручную" : "Copy manually")
      );
    }
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
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <Text style={{ fontSize: 22 }}>
                {themeOptions.find(o => o.key === colorScheme)?.emoji || "🎨"}
              </Text>
              <Text className="text-foreground font-semibold" style={{ fontSize: 16 }}>{t.settings.theme}</Text>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {themeOptions.map((opt) => {
                const isActive = colorScheme === opt.key;
                const isLocked = opt.key === "amoled" && !hasExplorerAchievement;
                return (
                  <Pressable
                    key={opt.key}
                    onPress={() => handleThemeChange(opt.key)}
                    style={({ pressed }) => [{
                      flex: 1,
                      minWidth: 70,
                      backgroundColor: isActive ? colors.primary : isLocked ? `${colors.border}80` : colors.surface,
                      borderRadius: 12,
                      paddingVertical: 10,
                      alignItems: "center",
                      borderWidth: isActive ? 2 : 1,
                      borderColor: isActive ? colors.primary : colors.border,
                      opacity: pressed ? 0.7 : isLocked ? 0.5 : 1,
                    }]}
                  >
                    <Text style={{ fontSize: 20, marginBottom: 4 }}>{isLocked ? "🔒" : opt.emoji}</Text>
                    <Text style={{
                      fontSize: 12,
                      fontWeight: isActive ? "800" : "600",
                      color: isActive ? "#FFF" : isLocked ? colors.muted : colors.foreground,
                    }}>
                      {isRu ? opt.labelRu : opt.labelEn}
                    </Text>
                  </Pressable>
                );
              })}
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

                {/* Exact time picker */}
                <Text className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>
                  {isRu ? "Или точное время ежедневно:" : "Or exact daily time:"}
                </Text>
                <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                  <Pressable
                    onPress={() => setShowTimePicker(true)}
                    style={({ pressed }) => [{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: motivational.exactTime ? "#22C55E15" : "transparent",
                      borderWidth: 1.5,
                      borderColor: motivational.exactTime ? "#22C55E" : "#D1D5DB",
                      borderRadius: 12,
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      opacity: pressed ? 0.7 : 1,
                    }]}
                  >
                    <Text style={{ fontSize: 18, marginRight: 8 }}>⏰</Text>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: motivational.exactTime ? "#22C55E" : "#9CA3AF",
                    }}>
                      {motivational.exactTime || (isRu ? "Выбрать время" : "Set time")}
                    </Text>
                  </Pressable>

                  {motivational.exactTime && (
                    <Pressable
                      onPress={handleClearExactTime}
                      style={({ pressed }) => [{
                        paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10,
                        backgroundColor: "#EF444420", opacity: pressed ? 0.7 : 1,
                      }]}
                    >
                      <Text style={{ color: "#EF4444", fontSize: 13, fontWeight: "600" }}>✕</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* Start Screen */}
          <View className={sectionStyle}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <Text style={{ fontSize: 22 }}>🚀</Text>
              <Text className="text-foreground font-semibold" style={{ fontSize: 16 }}>
                {isRu ? "Начальный экран" : "Start Screen"}
              </Text>
            </View>
            <Text className="text-muted" style={{ fontSize: 13, marginBottom: 8 }}>
              {isRu ? "Какой экран открывается при запуске:" : "Which screen opens on app launch:"}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {[
                { key: "index" as const, emoji: "📋", labelEn: "Tasks", labelRu: "Задачи" },
                { key: "matrix" as const, emoji: "📊", labelEn: "Matrix", labelRu: "Матрица" },
                { key: "statistics" as const, emoji: "📈", labelEn: "Stats", labelRu: "Статистика" },
                { key: "achievements" as const, emoji: "🏆", labelEn: "Achievements", labelRu: "Достижения" },
                { key: "settings" as const, emoji: "⚙️", labelEn: "Settings", labelRu: "Настройки" },
              ].map((opt) => {
                const isActive = settings.startScreen === opt.key;
                return (
                  <Pressable
                    key={opt.key}
                    onPress={() => updateSettings({ startScreen: opt.key })}
                    style={({ pressed }) => [{
                      flex: 1,
                      minWidth: 60,
                      backgroundColor: isActive ? colors.primary : colors.surface,
                      borderRadius: 12,
                      paddingVertical: 10,
                      alignItems: "center",
                      borderWidth: isActive ? 2 : 1,
                      borderColor: isActive ? colors.primary : colors.border,
                      opacity: pressed ? 0.7 : 1,
                    }]}
                  >
                    <Text style={{ fontSize: 18, marginBottom: 2 }}>{opt.emoji}</Text>
                    <Text style={{
                      fontSize: 11,
                      fontWeight: isActive ? "800" : "600",
                      color: isActive ? "#FFF" : colors.foreground,
                    }}>
                      {isRu ? opt.labelRu : opt.labelEn}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
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
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <Text style={{ fontSize: 22 }}>ℹ️</Text>
              <Text className="text-foreground font-semibold" style={{ fontSize: 16 }}>{t.settings.about}</Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 4 }}>
              <Pressable
                onPress={() => {
                  const newCount = aboutTapCount + 1;
                  setAboutTapCount(newCount);
                  if (newCount >= 10) {
                    triggerCustomFlag("persistent_explorer", tasks);
                    Alert.alert(
                      isRu ? "🔍 Упорный исследователь!" : "🔍 Persistent Explorer!",
                      isRu ? "Вы разблокировали AMOLED тему!" : "You unlocked the AMOLED theme!"
                    );
                    setAboutTapCount(0);
                  }
                }}
                style={({ pressed }) => [{
                  opacity: pressed ? 0.6 : 1,
                  transform: [{ scale: pressed ? 0.9 : 1 }],
                }]}
              >
                <Image
                  source={require("@/assets/images/icon.png")}
                  style={{ width: 52, height: 52, borderRadius: 12 }}
                />
              </Pressable>
              <View>
                <Text className="text-foreground font-bold" style={{ fontSize: 18 }}>SDVGNote</Text>
                <Text className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>
                  {t.settings.version}: 1.0.2
                </Text>
              </View>
            </View>

            {/* Telegram */}
            <View style={{ marginTop: 12 }}>
              <Text className="text-muted" style={{ fontSize: 13, marginBottom: 4 }}>
                {isRu ? "Написать разработчику в TG —" : "Contact developer on TG —"}
              </Text>
              <Pressable
                onPress={handleOpenTelegram}
                style={({ pressed }) => [{
                  flexDirection: "row",
                  alignItems: "center",
                  opacity: pressed ? 0.6 : 1,
                }]}
              >
                <Text style={{ fontSize: 16, marginRight: 6 }}>✈️</Text>
                <Text style={{ fontSize: 15, fontWeight: "700", color: "#0088CC", textDecorationLine: "underline" }}>
                  @MisterUtkO
                </Text>
              </Pressable>
            </View>

            {/* Support card */}
            <View style={{ marginTop: 12 }}>
              <Text className="text-muted" style={{ fontSize: 13, marginBottom: 4 }}>
                {isRu ? "Поддержать разработчика — Т-Банк" : "Support developer — T-Bank"}
              </Text>
              <Pressable
                onPress={handleCopyCard}
                style={({ pressed }) => [{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: copiedCard ? "#22C55E15" : "#F59E0B15",
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  opacity: pressed ? 0.7 : 1,
                  borderWidth: 1,
                  borderColor: copiedCard ? "#22C55E" : "#F59E0B40",
                }]}
              >
                <Text style={{ fontSize: 15, marginRight: 8 }}>{copiedCard ? "✅" : "💳"}</Text>
                <Text style={{
                  fontSize: 15,
                  fontWeight: "700",
                  fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
                  color: copiedCard ? "#22C55E" : "#F59E0B",
                  letterSpacing: 1,
                }}>
                  2200 7006 3018 0684
                </Text>
                <Text style={{ marginLeft: 8, fontSize: 12, color: "#9CA3AF" }}>
                  {copiedCard ? (isRu ? "Скопировано!" : "Copied!") : (isRu ? "Нажмите для копирования" : "Tap to copy")}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Time Picker Modal */}
      <Modal visible={showTimePicker} transparent animationType="fade">
        <Pressable
          onPress={() => setShowTimePicker(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 24,
              width: 280,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 10,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#1E293B", marginBottom: 20 }}>
              {isRu ? "Выберите время" : "Select time"}
            </Text>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 24 }}>
              {/* Hours */}
              <View style={{ alignItems: "center" }}>
                <Pressable
                  onPress={() => setPickerHour((h) => (h + 1) % 24)}
                  style={({ pressed }) => [{ padding: 8, opacity: pressed ? 0.5 : 1 }]}
                >
                  <Text style={{ fontSize: 20, color: "#6B7280" }}>▲</Text>
                </Pressable>
                <View style={{
                  backgroundColor: "#F1F5F9",
                  borderRadius: 12,
                  width: 64,
                  height: 56,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 2,
                  borderColor: "#0a7ea4",
                }}>
                  <Text style={{ fontSize: 28, fontWeight: "800", color: "#1E293B" }}>
                    {String(pickerHour).padStart(2, "0")}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setPickerHour((h) => (h - 1 + 24) % 24)}
                  style={({ pressed }) => [{ padding: 8, opacity: pressed ? 0.5 : 1 }]}
                >
                  <Text style={{ fontSize: 20, color: "#6B7280" }}>▼</Text>
                </Pressable>
              </View>

              <Text style={{ fontSize: 28, fontWeight: "800", color: "#1E293B" }}>:</Text>

              {/* Minutes */}
              <View style={{ alignItems: "center" }}>
                <Pressable
                  onPress={() => setPickerMinute((m) => (m + 5) % 60)}
                  style={({ pressed }) => [{ padding: 8, opacity: pressed ? 0.5 : 1 }]}
                >
                  <Text style={{ fontSize: 20, color: "#6B7280" }}>▲</Text>
                </Pressable>
                <View style={{
                  backgroundColor: "#F1F5F9",
                  borderRadius: 12,
                  width: 64,
                  height: 56,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 2,
                  borderColor: "#0a7ea4",
                }}>
                  <Text style={{ fontSize: 28, fontWeight: "800", color: "#1E293B" }}>
                    {String(pickerMinute).padStart(2, "0")}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setPickerMinute((m) => (m - 5 + 60) % 60)}
                  style={({ pressed }) => [{ padding: 8, opacity: pressed ? 0.5 : 1 }]}
                >
                  <Text style={{ fontSize: 20, color: "#6B7280" }}>▼</Text>
                </Pressable>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable
                onPress={() => setShowTimePicker(false)}
                style={({ pressed }) => [{
                  flex: 1,
                  backgroundColor: "#F1F5F9",
                  borderRadius: 12,
                  paddingVertical: 12,
                  alignItems: "center",
                  opacity: pressed ? 0.7 : 1,
                }]}
              >
                <Text style={{ fontSize: 15, fontWeight: "600", color: "#6B7280" }}>
                  {isRu ? "Отмена" : "Cancel"}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleTimePickerConfirm}
                style={({ pressed }) => [{
                  flex: 1,
                  backgroundColor: "#22C55E",
                  borderRadius: 12,
                  paddingVertical: 12,
                  alignItems: "center",
                  opacity: pressed ? 0.7 : 1,
                }]}
              >
                <Text style={{ fontSize: 15, fontWeight: "700", color: "#FFFFFF" }}>
                  {isRu ? "Готово" : "Done"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}
