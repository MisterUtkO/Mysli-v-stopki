"use client";
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
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { ScreenContainer } from "@/components/screen-container";
import { useTaskContext } from "@/lib/context/task-context";
import { useI18n } from "@/lib/context/i18n-context";
import { useThemeContext } from "@/lib/theme-provider";
import { useColors } from "@/hooks/use-colors";
import { sendTestNotification } from "@/lib/services/notification-scheduler";
import { useAchievements } from "@/lib/context/achievement-context";
import { getThemeNeonColor } from "@/lib/theme-neon-colors";
import type { MotivationalSettings } from "@/lib/domain/types";
import type { ColorScheme } from "@/lib/_core/theme";
import { useState } from "react";


type NotifFrequency = "never" | "hourly" | "daily" | "weekly" | "always";
type MotivFrequency = "never" | "10min" | "30min" | "hourly" | "daily" | "weekly";

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, updateSettings, exportTasks, clearAllData, tasks } = useTaskContext();
  const { language, setLanguage, t } = useI18n();
  const { colorScheme, setColorScheme } = useThemeContext();
  const { triggerCustomFlag, unlocked } = useAchievements();
  const colors = useColors();

  const [exporting, setExporting] = useState(false);
  const [copiedCard, setCopiedCard] = useState(false);
  const [aboutTapCount, setAboutTapCount] = useState(0);
  const [amoledTapCount, setAmoledTapCount] = useState(0);

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
    { key: "notebook" as const, emoji: "📓", labelEn: "Notebook", labelRu: "Тетрадь" },

  ];

  const handleThemeChange = async (theme: "light" | "dark" | "amoled" | "pastel" | "notebook") => {
    if (theme === "amoled" && !hasExplorerAchievement) {
      // Count taps on AMOLED button to unlock achievement
      const newCount = amoledTapCount + 1;
      setAmoledTapCount(newCount);
      
      if (newCount >= 10) {
        triggerCustomFlag("persistent_explorer", tasks);
        setAmoledTapCount(0);
        Alert.alert(
          isRu ? "🎉 Достижение разблокировано!" : "🎉 Achievement Unlocked!",
          isRu
            ? "Вы разблокировали AMOLED тему! Теперь вы можете использовать эту тему."
            : "You unlocked the AMOLED theme! You can now use this theme."
        );
      } else {
        Alert.alert(
          isRu ? "🔒 Заблокировано" : "🔒 Locked",
          isRu
            ? `Нажмите ещё ${10 - newCount} раз на AMOLED, чтобы разблокировать тему.`
            : `Tap AMOLED ${10 - newCount} more times to unlock the theme.`
        );
      }
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

  const handleMotivationalToggle = async () => {
    const newValue = !motivational.enabled;
    await updateSettings({
      motivational: { ...motivational, enabled: newValue },
    });
  };

  const handleMotivationalFrequencyChange = async (freq: MotivFrequency) => {
    await updateSettings({
      motivational: { ...motivational, frequency: freq },
    });
  };

  const handleMotivationalTextChange = async (text: string) => {
    setMotivText(text);
    await updateSettings({
      motivational: { ...motivational, text },
    });
  };

  const handleExactTimeChange = async (hour: number, minute: number) => {
    const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    await updateSettings({
      motivational: { ...motivational, exactTime: timeStr },
    });
  };

  const handleExportTasks = async () => {
    setExporting(true);
    try {
      const data = await exportTasks();
      if (Platform.OS === "web") {
        const element = document.createElement("a");
        const file = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        element.href = URL.createObjectURL(file);
        element.download = `tasks-export-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
      Alert.alert(isRu ? "Успешно" : "Success", isRu ? "Данные экспортированы" : "Data exported");
    } catch (error) {
      Alert.alert(isRu ? "Ошибка" : "Error", isRu ? "Не удалось экспортировать" : "Failed to export");
    } finally {
      setExporting(false);
    }
  };

  const handleClearAllData = async () => {
    Alert.alert(
      isRu ? "Очистить все?" : "Clear all?",
      isRu ? "Это удалит все задачи и настройки. Это действие необратимо." : "This will delete all tasks and settings. This is irreversible.",
      [
        { text: isRu ? "Отмена" : "Cancel", onPress: () => {} },
        {
          text: isRu ? "Очистить" : "Clear",
          onPress: async () => {
            await clearAllData();
            Alert.alert(isRu ? "Готово" : "Done", isRu ? "Все данные удалены" : "All data cleared");
          },
        },
      ]
    );
  };

  const handleCardNumberCopy = async () => {
    const cardNumber = "2200 7006 3018 0684";
    let copied = false;

    if (Platform.OS === "web") {
      try {
        await navigator.clipboard.writeText(cardNumber);
        copied = true;
      } catch {
        try {
          const textArea = document.createElement("textarea");
          textArea.value = cardNumber;
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
                const themeNeonColor = getThemeNeonColor(opt.key as ColorScheme);

                return (
                  <Pressable
                    key={opt.key}
                    onPress={() => handleThemeChange(opt.key)}
                    style={({ pressed }) => [{
                      flex: 1,
                      minWidth: 70,
                      backgroundColor: isActive ? (opt.key === "amoled" ? "#000000" : colors.surface) : isLocked ? `${colors.border}80` : colors.surface,
                      borderRadius: 12,
                      paddingVertical: 10,
                      alignItems: "center",
                      borderWidth: isActive ? 3 : 1,
                      borderColor: isActive ? themeNeonColor : colors.border,
                      opacity: pressed ? 0.7 : isLocked ? 0.5 : 1,
                      shadowColor: isActive ? themeNeonColor : 'transparent',
                      shadowOpacity: isActive ? 1 : 0,
                      shadowRadius: isActive ? 16 : 0,
                      shadowOffset: { width: 0, height: 0 },
                      elevation: isActive ? 16 : 0,
                    }]}
                  >
                    <Text style={{ fontSize: 20, marginBottom: 4 }}>{isLocked ? "🔒" : opt.emoji}</Text>
                    <Text style={{
                      fontSize: 12,
                      fontWeight: isActive ? "800" : "600",
                      color: isActive ? themeNeonColor : isLocked ? colors.muted : colors.foreground,
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
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
            {settings.notificationsEnabled && (
              <View style={{ gap: 8, marginTop: 8 }}>
                {frequencyOptions.map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => handleFrequencyChange(opt.value)}
                    style={({ pressed }) => [{
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      backgroundColor: (settings.notificationFrequency as string) === opt.value ? colors.primary : colors.background,
                      opacity: pressed ? 0.7 : 1,
                    }]}
                  >
                    <Text style={{ color: (settings.notificationFrequency as string) === opt.value ? "#FFF" : colors.foreground, fontWeight: "600", fontSize: 14 }}>
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Test Notification */}
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") {
                sendTestNotification(isRu);
              } else {
                Alert.alert(isRu ? "Уведомление" : "Notification", isRu ? "Тестовое уведомление отправлено" : "Test notification sent");
              }
            }}
            style={({ pressed }) => [{
              backgroundColor: colors.primary,
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: "center",
              opacity: pressed ? 0.7 : 1,
            }]}
          >
            <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 16 }}>
              🔔 {isRu ? "Тест" : "Test"}
            </Text>
          </Pressable>

          {/* Motivational */}
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
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
            {motivational.enabled && (
              <View style={{ gap: 8, marginTop: 8 }}>
                <TextInput
                  placeholder={isRu ? "Ваше сообщение..." : "Your message..."}
                  value={motivText}
                  onChangeText={handleMotivationalTextChange}
                  placeholderTextColor={colors.muted}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    color: colors.foreground,
                    minHeight: 80,
                    textAlignVertical: "top",
                  }}
                  multiline
                />
                <View style={{ gap: 6 }}>
                  {motivFreqOptions.map((opt) => (
                    <Pressable
                      key={opt.value}
                      onPress={() => handleMotivationalFrequencyChange(opt.value)}
                      style={({ pressed }) => [{
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        backgroundColor: motivational.frequency === opt.value ? colors.primary : colors.background,
                        opacity: pressed ? 0.7 : 1,
                      }]}
                    >
                      <Text style={{ color: motivational.frequency === opt.value ? "#FFF" : colors.foreground, fontWeight: "600", fontSize: 14 }}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Reminders */}
          <View className={sectionStyle}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <Text style={{ fontSize: 22 }}>⏰</Text>
              <Text className="text-foreground font-semibold" style={{ fontSize: 16 }}>
                {isRu ? "Напоминания" : "Reminders"}
              </Text>
            </View>
            <View style={{ gap: 8 }}>

            </View>
          </View>

          {/* Data Management */}
          <View style={{ gap: 8 }}>
            <Pressable
              onPress={handleExportTasks}
              disabled={exporting}
              style={({ pressed }) => [{
                backgroundColor: colors.primary,
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: "center",
                opacity: pressed || exporting ? 0.7 : 1,
              }]}
            >
              <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 16 }}>
                📤 {isRu ? "Экспортировать" : "Export data"}
              </Text>
            </Pressable>
            <Pressable
              onPress={handleClearAllData}
              style={({ pressed }) => [{
                backgroundColor: colors.error,
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: "center",
                opacity: pressed ? 0.7 : 1,
              }]}
            >
              <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 16 }}>
                🗑 {isRu ? "Очистить все" : "Clear all data"}
              </Text>
            </Pressable>
          </View>

          {/* Telegram Link */}
          <Pressable
            onPress={() => {
              Linking.openURL("https://t.me/misterutko").catch(() => {
                Alert.alert(isRu ? "Ошибка" : "Error", isRu ? "Не удалось открыть Telegram" : "Failed to open Telegram");
              });
            }}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <View className={sectionStyle}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Text style={{ fontSize: 22 }}>✈️</Text>
                  <View>
                    <Text className="text-foreground font-semibold" style={{ fontSize: 16 }}>@misterutko</Text>
                    <Text className="text-muted" style={{ fontSize: 12 }}>SDVGNote Creator</Text>
                  </View>
                </View>
              </View>
            </View>
          </Pressable>

          {/* About Button */}
          <Pressable
            onPress={() => {
              router.push("/about");
            }}
            style={({ pressed }) => [{
              backgroundColor: colors.primary,
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 16,
              opacity: pressed ? 0.7 : 1,
            }]}
          >
            <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 16, textAlign: "center" }}>
              ℹ️ {isRu ? "О приложении" : "About"}
            </Text>
          </Pressable>

          {/* Support Developer - Copy card and show bank app chooser */}

          {/* Home Screen Selection */}
          <View className={sectionStyle}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <Text style={{ fontSize: 22 }}>🏠</Text>
              <Text className="text-foreground font-semibold" style={{ fontSize: 16 }}>
                {isRu ? "Начальный экран" : "Home Screen"}
              </Text>
            </View>
            <View style={{ gap: 8 }}>
              {[
                { value: "index", label: isRu ? "Задачи" : "Tasks", emoji: "📋" },
                { value: "matrix", label: isRu ? "Матрица" : "Matrix", emoji: "📊" },
                { value: "kanban", label: isRu ? "Канбан" : "Kanban", emoji: "📌" },
                { value: "achievements", label: isRu ? "Достижения" : "Achievements", emoji: "🏆" },
              ].map((screen) => (
                <Pressable
                  key={screen.value}
                  onPress={() => updateSettings({ startScreen: screen.value as any })}
                  style={({ pressed }) => [{
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    backgroundColor: (settings.startScreen as string) === screen.value ? colors.primary : colors.background,
                    borderWidth: 1,
                    borderColor: (settings.startScreen as string) === screen.value ? colors.primary : colors.border,
                    opacity: pressed ? 0.7 : 1,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }]}
                >
                  <Text style={{ fontSize: 16 }}>{screen.emoji}</Text>
                  <Text style={{ color: (settings.startScreen as string) === screen.value ? "#FFF" : colors.foreground, fontWeight: "600", fontSize: 14 }}>
                    {screen.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Privacy Policy Button */}
          <Pressable
            onPress={() => {
              router.push("/privacy-policy");
            }}
            style={({ pressed }) => [{
              backgroundColor: colors.surface,
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderWidth: 1,
              borderColor: colors.border,
              opacity: pressed ? 0.7 : 1,
            }]}
          >
            <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 14, textAlign: "center" }}>
              {isRu ? "🔒 Политика конфиденциальности" : "🔒 Privacy Policy"}
            </Text>
          </Pressable>

          {/* Terms of Service Button */}
          <Pressable
            onPress={() => {
              router.push("/terms-of-service");
            }}
            style={({ pressed }) => [{
              backgroundColor: colors.surface,
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderWidth: 1,
              borderColor: colors.border,
              opacity: pressed ? 0.7 : 1,
            }]}
          >
            <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 14, textAlign: "center" }}>
              {isRu ? "⚖️ Условия использования" : "⚖️ Terms of Service"}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              // First, copy card number to clipboard
              const cardNumber = "2200 7006 3018 0684";
              Clipboard.setStringAsync(cardNumber);
              setCopiedCard(true);
              setTimeout(() => setCopiedCard(false), 2000);
              
              // Then show bank app options
              const bankApps = [
                { name: isRu ? "Сбербанк" : "Sberbank", url: "sberbank://" },
                { name: isRu ? "Яндекс.Касса" : "Yandex.Kassa", url: "https://yandex.ru/kassa/" },
                { name: isRu ? "Телеграм" : "Telegram", url: "https://t.me/misterutko" },
              ];
              
              Alert.alert(
                isRu ? "❤️ Спасибо за поддержку!" : "❤️ Thank you for support!",
                isRu
                  ? "Номер карты скопирован. Выберите приложение банка для перевода:"
                  : "Card number copied. Choose your bank app to transfer:",
                [
                  ...bankApps.map((app) => ({
                    text: app.name,
                    onPress: () => {
                      Linking.openURL(app.url).catch(() => {
                        Alert.alert(
                          isRu ? "Ошибка" : "Error",
                          isRu
                            ? `Не удалось открыть ${app.name}. Пожалуйста, установите приложение.`
                            : `Failed to open ${app.name}. Please install the app.`
                        );
                      });
                    },
                  })),
                  {
                    text: isRu ? "Отмена" : "Cancel",
                    onPress: () => {},
                    style: "cancel",
                  },
                ]
              );
            }}
            style={({ pressed }) => [{
              backgroundColor: colors.success,
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 16,
              opacity: pressed ? 0.7 : 1,
            }]}
          >
            <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 16, textAlign: "center" }}>
              ❤️ {isRu ? "Поддержать разработчика" : "Support Developer"}
            </Text>
          </Pressable>

          {/* Card */}
          <Pressable
            onPress={handleCardNumberCopy}
            style={({ pressed }) => [{
              backgroundColor: copiedCard ? colors.success : colors.primary,
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 16,
              opacity: pressed ? 0.7 : 1,
            }]}
          >
            <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 16, textAlign: "center" }}>
              {copiedCard ? "✅ Copied!" : "💳 2200 7006 3018 0684 Tap to copy"}
            </Text>
          </Pressable>

          {/* Footer */}
          <View style={{ alignItems: "center", marginTop: 20, marginBottom: 20 }}>
            <Text className="text-muted" style={{ fontSize: 12 }}>
              v1.0.3 • SDVGNote
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
