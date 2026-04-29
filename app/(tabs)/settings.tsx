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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { ScreenContainer } from "@/components/common/screen-container";
import { ScreenTransition } from "@/components/animations/screen-transition";
import { useTaskContext } from "@/lib/context/task-context";
import { useI18n } from "@/lib/context/i18n-context";
import { useThemeContext } from "@/lib/theme/theme-provider";
import { useColors } from "@/hooks/use-colors";
import { sendTestNotification } from "@/lib/services/notification/notification-scheduler";
import { useAchievements } from "@/lib/context/achievement-context";
import { getThemeNeonColor } from "@/lib/theme/theme-neon-colors";
import type { MotivationalSettings } from "@/lib/domain/types";
import type { ColorScheme } from "@/lib/_core/theme";
import { useState } from "react";
import { useOnboarding } from "@/components/modals/onboarding-tutorial";
import { AppVersionFooter } from "@/components/layout/app-version-footer";
import { AppAboutSection } from "@/components/layout/app-about-section";
import { QuadrantColorsSettings } from "@/components/customization/quadrant-colors-settings";
import { NotificationSettings } from "@/components/customization/notification-settings";
import { DeadlineHighlightSettings } from "@/components/customization/deadline-highlight-settings";
import { useCustomization } from "@/lib/context/customization-context";
import Slider from "@react-native-community/slider";
import { CollapsibleSection } from "@/components/customization/collapsible-section";
import { HeartbeatEmoji } from "@/components/animations/heartbeat-emoji";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import { BackupService } from "@/lib/services/backup/backup-service";
import { validateBackupData } from "@/lib/services/backup/backup-validation";


type NotifFrequency = "never" | "hourly" | "daily" | "weekly" | "always";
type MotivFrequency = "never" | "10min" | "30min" | "hourly" | "daily" | "weekly";

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, exportTasks, clearAllData, tasks } = useTaskContext();
  const { language, setLanguage, t } = useI18n();
  const { colorScheme, setColorScheme } = useThemeContext();
  const { triggerCustomFlag, unlocked } = useAchievements();
  const colors = useColors();
  const { showOnboarding } = useOnboarding();

  const [exporting, setExporting] = useState(false);
  const [showAboutSection, setShowAboutSection] = useState(false);
  const [showCustomizationModal, setShowCustomizationModal] = useState<'quadrant' | 'notification' | 'deadline' | null>(null);
  const customization = useCustomization();

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
    // Trigger multilingual achievement
    triggerCustomFlag("multilingual", tasks);
  };

  const themeOptions = [
    { key: "light" as const, emoji: "☀️", labelEn: "Light", labelRu: "Светлая" },
    { key: "dark" as const, emoji: "🌙", labelEn: "Dark", labelRu: "Тёмная" },
    { key: "amoled" as const, emoji: "🖤", labelEn: "AMOLED", labelRu: "AMOLED" },
    { key: "pastel" as const, emoji: "🌸", labelEn: "Pastel", labelRu: "Пастель" },
    { key: "notebook" as const, emoji: "📓", labelEn: "Notebook", labelRu: "Тетрадь" },
  ];

  // Track which themes have been tried for theme_explorer achievement
  const [triedThemes, setTriedThemes] = useState<Set<string>>(new Set([settings.theme ?? "light"]));

  const handleThemeChange = async (theme: "light" | "dark" | "amoled" | "pastel" | "notebook") => {
    if (theme === "amoled" && !hasExplorerAchievement) {
      const newCount = amoledTapCount + 1;
      setAmoledTapCount(newCount);
      
      if (newCount >= 10) {
        setColorScheme("amoled");
        await updateSettings({ theme: "amoled" });
        Alert.alert(
          isRu ? "🖤 AMOLED разблокирована!" : "🖤 AMOLED Unlocked!",
          isRu ? "Тема успешно разблокирована!" : "Theme successfully unlocked!"
        );
        setAmoledTapCount(0);
      } else {
        Alert.alert(
          isRu ? "Разблокировка AMOLED" : "Unlock AMOLED",
          isRu ? `Нажмите ещё ${10 - newCount} раз(а)` : `Tap ${10 - newCount} more time(s)`
        );
      }
      return;
    }
    setColorScheme(theme);
    await updateSettings({ theme });
    // Track theme_explorer achievement
    const newTried = new Set(triedThemes);
    newTried.add(theme);
    setTriedThemes(newTried);
    // All 5 base themes tried
    if (newTried.size >= 5) {
      triggerCustomFlag("theme_explorer", tasks);
    }
  };

  const handleNotificationsToggle = async (value: boolean) => {
    await updateSettings({ notificationsEnabled: value });
  };

  const handleFrequencyChange = async (freq: NotifFrequency) => {
    await updateSettings({ notificationFrequency: freq });
  };

  const handleMotivationalToggle = async (value: boolean) => {
    await updateSettings({ motivational: { ...motivational, enabled: value } });
  };

  const handleMotivationalTextChange = (text: string) => {
    setMotivText(text);
  };

  const handleMotivationalFrequencyChange = async (freq: MotivFrequency) => {
    await updateSettings({ motivational: { ...motivational, frequency: freq } });
  };

  const handleExactTimeChange = async (hour: number, minute: number) => {
    const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    await updateSettings({ motivational: { ...motivational, exactTime: timeStr } });
  };

  const handleMotivationalSave = async () => {
    await updateSettings({ motivational: { ...motivational, text: motivText } });
    Alert.alert(isRu ? "Сохранено" : "Saved", isRu ? "Мотивационное сообщение обновлено" : "Motivational message updated");
  };

  const handleExportTasks = async () => {
    setExporting(true);
    try {
      if (Platform.OS === "web") {
        const data = await exportTasks();
        const element = document.createElement("a");
        element.setAttribute("href", `data:text/plain;charset=utf-8,${encodeURIComponent(data)}`);
        element.setAttribute("download", `tasks-export-${new Date().toISOString().split("T")[0]}.json`);
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        Alert.alert(
          isRu ? "Успешно" : "Success",
          isRu ? "Резервная копия загружена в папку Downloads" : "Backup downloaded to Downloads folder"
        );
      } else {
        const { MobileBackupHandlers } = await import("@/lib/services/backup/mobile-backup-handlers");
        await MobileBackupHandlers.exportBackup(tasks, settings);
        // Success message shown after user completes share action
        Alert.alert(
          isRu ? "Успешно" : "Success",
          isRu ? "Выберите, куда сохранить файл (Downloads, Google Drive, облако и т.д.)" : "Choose where to save the file (Downloads, Google Drive, cloud, etc.)"
        );
      }
    } catch (error) {
      console.error("Export error:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      Alert.alert(
        isRu ? "Ошибка" : "Error",
        isRu ? `Не удалось экспортировать: ${errorMsg}` : `Failed to export: ${errorMsg}`
      );
    } finally {
      setExporting(false);
    }
  };

  const handleImportData = async () => {
    try {
      const { MobileBackupHandlers } = await import("@/lib/services/backup/mobile-backup-handlers");
      const result = await MobileBackupHandlers.importBackup();
      
      if (!result) {
        return;
      }
      
      Alert.alert(
        isRu ? "Восстановить данные?" : "Restore data?",
        isRu ? `Будут восстановлены ${result.tasks.length} задач` : `Will restore ${result.tasks.length} tasks`,
        [
          {
            text: isRu ? "Отмена" : "Cancel",
            onPress: () => {},
            style: "cancel",
          },
          {
            text: isRu ? "Восстановить" : "Restore",
            onPress: async () => {
              try {
                const { addTask } = useTaskContext();
                for (const task of result.tasks) {
                  await addTask(task);
                }
                Alert.alert(isRu ? "Успешно" : "Success", isRu ? "Данные восстановлены" : "Data restored");
              } catch (err) {
                Alert.alert(isRu ? "Ошибка" : "Error", isRu ? "Не удалось восстановить" : "Failed to restore");
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error importing data:", error);
      Alert.alert(isRu ? "Ошибка" : "Error", isRu ? "Ошибка при импорте данных" : "Error importing data");
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      isRu ? "Очистить все данные?" : "Clear all data?",
      isRu ? "Это действие необратимо. Все задачи будут удалены." : "This action is irreversible. All tasks will be deleted.",
      [
        { text: isRu ? "Отмена" : "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: isRu ? "Удалить" : "Delete",
          onPress: async () => {
            await clearAllData();
            Alert.alert(isRu ? "Удалено" : "Deleted", isRu ? "Все данные удалены" : "All data deleted");
          },
          style: "destructive",
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
  const sectionTitleStyle = "text-foreground font-bold text-lg mb-4 mt-6";

  return (
    <ScreenTransition>
      <ScreenContainer className="p-4">
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View className="gap-4">
            <Text className="text-foreground font-bold" style={{ fontSize: 28, lineHeight: 34, marginBottom: 8 }}>
              {t.settings.title}
            </Text>

            {/* ========== SECTION 1: LANGUAGE ========== */}
            <Text className={sectionTitleStyle}>{isRu ? "1. Язык" : "1. Language"}</Text>
            <View className={sectionStyle}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Text style={{ fontSize: 24 }}>🌐</Text>
                  <View>
                    <Text className="text-foreground font-semibold" style={{ fontSize: 16 }}>{t.settings.language}</Text>
                    <Text className="text-muted" style={{ fontSize: 12 }}>{isRu ? "Выберите язык интерфейса" : "Choose interface language"}</Text>
                  </View>
                </View>
                <Pressable
                  onPress={handleLanguageToggle}
                  style={({ pressed }) => [{ backgroundColor: "#0a7ea4", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, opacity: pressed ? 0.7 : 1 }]}
                >
                  <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 14 }}>
                    {language === "en" ? "РУС" : "ENG"}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* ========== SECTION 2: THEME ========== */}
            <Text className={sectionTitleStyle}>{isRu ? "2. Тема оформления" : "2. Theme"}</Text>
            <View className={sectionStyle}>
              <Text className="text-muted" style={{ fontSize: 13, marginBottom: 12 }}>
                {isRu ? "Выберите цветовую схему приложения" : "Choose the app color scheme"}
              </Text>
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

            {/* ========== SECTION 3: START SCREEN ========== */}
            <CollapsibleSection title={isRu ? "3. Начальный экран" : "3. Start Screen"} emoji="🏠">
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
                      paddingVertical: 12,
                      paddingHorizontal: 14,
                      borderRadius: 10,
                      backgroundColor: (settings.startScreen as string) === screen.value ? colors.primary : colors.background,
                      borderWidth: 2,
                      borderColor: (settings.startScreen as string) === screen.value ? colors.primary : colors.border,
                      opacity: pressed ? 0.7 : 1,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }]}
                  >
                    <Text style={{ fontSize: 18 }}>{screen.emoji}</Text>
                    <Text style={{ color: (settings.startScreen as string) === screen.value ? "#FFF" : colors.foreground, fontWeight: "600", fontSize: 15 }}>
                      {screen.label}
                    </Text>
                    {(settings.startScreen as string) === screen.value && (
                      <Text style={{ marginLeft: "auto", fontSize: 16 }}>✓</Text>
                    )}
                  </Pressable>
                ))}
              </View>
            </CollapsibleSection>

            {/* ========== SECTION 4: TASK NOTIFICATIONS ========== */}
            <CollapsibleSection title={isRu ? "4. Уведомления о задачах" : "4. Task Notifications"} emoji="🔔">
              {/* Task Notifications Toggle */}
              <View style={{ backgroundColor: colors.background, borderRadius: 10, padding: 12, marginBottom: 8 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                  <Text style={{ fontSize: 24 }}>🔔</Text>
                  <View style={{ flex: 1 }}>
                    <Text className="text-foreground font-semibold" style={{ fontSize: 16 }}>
                      {isRu ? "Включить уведомления" : "Enable Notifications"}
                    </Text>
                    <Text className="text-muted" style={{ fontSize: 12 }}>
                      {isRu ? "Получайте напоминания о задачах" : "Get task reminders"}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.notificationsEnabled}
                  onValueChange={handleNotificationsToggle}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>

              {settings.notificationsEnabled && (
                <View style={{ gap: 8, marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
                  <Text className="text-muted" style={{ fontSize: 12, marginBottom: 4 }}>
                    {isRu ? "Частота уведомлений:" : "Notification frequency:"}
                  </Text>
                  {frequencyOptions.map((opt) => (
                    <Pressable
                      key={opt.value}
                      onPress={() => handleFrequencyChange(opt.value)}
                      style={({ pressed }) => [{
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        backgroundColor: (settings.notificationFrequency as string) === opt.value ? colors.primary : colors.background,
                        borderWidth: 1,
                        borderColor: (settings.notificationFrequency as string) === opt.value ? colors.primary : colors.border,
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

              {/* Test Notification Button */}
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
                🔔 {isRu ? "Отправить тестовое уведомление" : "Send Test Notification"}
              </Text>
            </Pressable>
            </CollapsibleSection>

            {/* ========== SECTION 5: MOTIVATION ========== */}
            <CollapsibleSection title={isRu ? "5. Мотивационные сообщения" : "5. Motivation"} emoji="💪">
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                  <Text style={{ fontSize: 24 }}>💪</Text>
                  <View style={{ flex: 1 }}>
                    <Text className="text-foreground font-semibold" style={{ fontSize: 16 }}>
                      {isRu ? "Включить мотивацию" : "Enable Motivation"}
                    </Text>
                    <Text className="text-muted" style={{ fontSize: 12 }}>
                      {isRu ? "Периодические вдохновляющие сообщения" : "Periodic inspiring messages"}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={motivational.enabled}
                  onValueChange={handleMotivationalToggle}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>

              {motivational.enabled && (
                <View style={{ gap: 12, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
                  <View>
                    <Text className="text-muted" style={{ fontSize: 12, marginBottom: 6 }}>
                      {isRu ? "Ваше сообщение:" : "Your message:"}
                    </Text>
                    <TextInput
                      placeholder={isRu ? "Введите вдохновляющее сообщение..." : "Enter an inspiring message..."}
                      value={motivText}
                      onChangeText={handleMotivationalTextChange}
                      placeholderTextColor={colors.muted}
                      style={{
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: 10,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        color: colors.foreground,
                        minHeight: 80,
                        textAlignVertical: "top",
                        fontSize: 14,
                      }}
                      multiline
                    />
                  </View>

                  <View>
                    <Text className="text-muted" style={{ fontSize: 12, marginBottom: 6 }}>
                      {isRu ? "Частота:" : "Frequency:"}
                    </Text>
                    <View style={{ gap: 6 }}>
                      {motivFreqOptions.map((opt) => (
                        <Pressable
                          key={opt.value}
                          onPress={() => handleMotivationalFrequencyChange(opt.value)}
                          style={({ pressed }) => [{
                            paddingVertical: 10,
                            paddingHorizontal: 12,
                            borderRadius: 8,
                            backgroundColor: motivational.frequency === opt.value ? colors.primary : colors.background,
                            borderWidth: 1,
                            borderColor: motivational.frequency === opt.value ? colors.primary : colors.border,
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

                  {/* Exact Time Picker */}
                  <View>
                    <Text className="text-muted" style={{ fontSize: 12, marginBottom: 6 }}>
                      {isRu ? "Точное время:" : "Exact time:"}
                    </Text>
                    <Pressable
                      onPress={() => setShowTimePicker(!showTimePicker)}
                      style={({ pressed }) => [{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingVertical: 12,
                        paddingHorizontal: 14,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: showTimePicker ? colors.primary : colors.border,
                        backgroundColor: colors.background,
                        opacity: pressed ? 0.7 : 1,
                      }]}
                    >
                      <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 16 }}>
                        ⏰ {String(pickerHour).padStart(2, "0")}:{String(pickerMinute).padStart(2, "0")}
                      </Text>
                      <Text style={{ color: colors.muted, fontSize: 14 }}>
                        {showTimePicker ? "▲" : "▼"}
                      </Text>
                    </Pressable>

                    {showTimePicker && (
                      <View style={{ marginTop: 12, padding: 14, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                        {/* Hour selector */}
                        <Text className="text-muted" style={{ fontSize: 12, marginBottom: 8, fontWeight: "600" }}>
                          {isRu ? "Час (0–23):" : "Hour (0–23):"}
                        </Text>
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                          {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                            <Pressable
                              key={h}
                              onPress={() => {
                                setPickerHour(h);
                                handleExactTimeChange(h, pickerMinute);
                              }}
                              style={({ pressed }) => [{
                                width: 38,
                                height: 38,
                                borderRadius: 8,
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: pickerHour === h ? colors.primary : colors.background,
                                borderWidth: 1,
                                borderColor: pickerHour === h ? colors.primary : colors.border,
                                opacity: pressed ? 0.7 : 1,
                              }]}
                            >
                              <Text style={{ color: pickerHour === h ? "#FFF" : colors.foreground, fontWeight: "600", fontSize: 12 }}>
                                {String(h).padStart(2, "0")}
                              </Text>
                            </Pressable>
                          ))}
                        </View>

                        {/* Minute selector */}
                        <Text className="text-muted" style={{ fontSize: 12, marginBottom: 8, fontWeight: "600" }}>
                          {isRu ? "Минуты:" : "Minutes:"}
                        </Text>
                        <View style={{ flexDirection: "row", gap: 6 }}>
                          {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                            <Pressable
                              key={m}
                              onPress={() => {
                                setPickerMinute(m);
                                handleExactTimeChange(pickerHour, m);
                              }}
                              style={({ pressed }) => [{
                                flex: 1,
                                paddingVertical: 10,
                                borderRadius: 8,
                                alignItems: "center",
                                backgroundColor: pickerMinute === m ? colors.primary : colors.background,
                                borderWidth: 1,
                                borderColor: pickerMinute === m ? colors.primary : colors.border,
                                opacity: pressed ? 0.7 : 1,
                              }]}
                            >
                              <Text style={{ color: pickerMinute === m ? "#FFF" : colors.foreground, fontWeight: "600", fontSize: 11 }}>
                                :{String(m).padStart(2, "0")}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>

                  <Pressable
                    onPress={handleMotivationalSave}
                    style={({ pressed }) => [{
                      backgroundColor: colors.success,
                      borderRadius: 10,
                      paddingVertical: 12,
                      alignItems: "center",
                      opacity: pressed ? 0.7 : 1,
                      marginTop: 4,
                    }]}
                  >
                    <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 15 }}>
                      {isRu ? "✓ Сохранить" : "✓ Save"}
                    </Text>
                  </Pressable>
                </View>
              )}
            </CollapsibleSection>

            {/* ========== SECTION 6: CUSTOMIZATION ========== */}
            <Text className={sectionTitleStyle}>{isRu ? "6. Кастомизация" : "6. Customization"}</Text>
            <View style={{ gap: 8 }}>
              <Pressable
                onPress={() => setShowCustomizationModal('quadrant')}
                style={({ pressed }) => [{
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  opacity: pressed ? 0.7 : 1,
                }]}
              >
                <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 16, textAlign: "center" }}>
                  {isRu ? "🎨 Цвета квадрантов" : "🎨 Quadrant Colors"}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setShowCustomizationModal('notification')}
                style={({ pressed }) => [{
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  opacity: pressed ? 0.7 : 1,
                }]}
              >
                <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 16, textAlign: "center" }}>
                  {isRu ? "🔊 Звуки и вибрация" : "🔊 Sound & Vibration"}
                </Text>
               </Pressable>
            </View>

            {/* Deadline Highlighting Button */}
            <Pressable
              onPress={() => setShowCustomizationModal('deadline')}
                style={({ pressed }) => [{
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  opacity: pressed ? 0.7 : 1,
                }]}
              >
                <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 16, textAlign: "center" }}>
                  {isRu ? "⏰ Подсветка сроков" : "⏰ Deadline Highlighting"}
                </Text>
              </Pressable>

              {/* Matrix Brightness Slider */}
              <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, gap: 12 }}>
                <Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 14 }}>
                  {isRu ? "🔆 Яркость фона матрицы" : "🔆 Matrix Background Brightness"}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>Dim</Text>
                  <Slider
                    style={{ flex: 1, height: 40 }}
                    minimumValue={0}
                    maximumValue={1}
                    step={0.1}
                    value={customization.matrixBrightness}
                    onValueChange={(value) => customization.setMatrixBrightness(value)}
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.border}
                  />
                  <Text style={{ color: colors.muted, fontSize: 12 }}>Bright</Text>
                </View>
                <Text style={{ color: colors.muted, fontSize: 12 }}>
                  {isRu ? "Регулирует насыщенность фонов квадрантов матрицы" : "Adjusts quadrant background saturation"}
                </Text>
              </View>

              {/* Animation Intensity Selector */}
              <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, gap: 12 }}>
                <Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 14 }}>
                  {isRu ? "✨ Интенсивность анимаций" : "✨ Animation Intensity"}
                </Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {(['off', 'low', 'medium'] as const).map((intensity) => (
                    <Pressable
                      key={intensity}
                      onPress={() => customization.setAnimationIntensity(intensity)}
                      style={({ pressed }) => [{
                        flex: 1,
                        paddingVertical: 10,
                        paddingHorizontal: 8,
                        borderRadius: 8,
                        backgroundColor: customization.animationIntensity === intensity ? colors.primary : colors.background,
                        borderWidth: 1,
                        borderColor: customization.animationIntensity === intensity ? colors.primary : colors.border,
                        opacity: pressed ? 0.7 : 1,
                      }]}
                    >
                      <Text style={{
                        color: customization.animationIntensity === intensity ? "#FFF" : colors.foreground,
                        fontWeight: "600",
                        fontSize: 12,
                        textAlign: "center",
                      }}>
                        {intensity === 'off' ? (isRu ? "Выкл" : "Off") : intensity === 'low' ? (isRu ? "Слабо" : "Low") : (isRu ? "Средне" : "Med")}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={{ color: colors.muted, fontSize: 12 }}>
                  {isRu ? "Контролирует анимации стикеров и эффекты" : "Controls sticker animations and effects"}
                </Text>
              </View>

            {/* ========== SECTION 7: INFORMATION & SUPPORT ========== */}
            <Text className={sectionTitleStyle}>{isRu ? "7. Информация и поддержка" : "7. Information & Support"}</Text>

            {/* Tutorial Button */}
            <Pressable
              onPress={() => {
                showOnboarding();
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
                {isRu ? "📚 Показать обучение" : "📚 Show Tutorial"}
              </Text>
            </Pressable>

            {/* About App Button */}
            <Pressable
              onPress={() => {
                setShowAboutSection(!showAboutSection);
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
                {isRu ? "ℹ️ О приложении" : "ℹ️ About App"}
              </Text>
            </Pressable>

            {/* About Section Content */}
            {showAboutSection && (
              <View className="mt-4 bg-surface rounded-2xl p-4">
                <AppAboutSection />
              </View>
            )}

            {/* Developer Contact */}
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
                    <Text style={{ fontSize: 24 }}>✈️</Text>
                    <View>
                      <Text className="text-foreground font-semibold" style={{ fontSize: 16 }}>@misterutko</Text>
                      <Text className="text-muted" style={{ fontSize: 12 }}>Мысли в стопки</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 18 }}>→</Text>
                </View>
              </View>
            </Pressable>

            {/* Support Developer Button */}
            <Pressable
              onPress={() => {
                router.push("/support-developer");
              }}
              style={({ pressed }) => [{
                backgroundColor: colors.success,
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 16,
                opacity: pressed ? 0.7 : 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }]}
            >
              <HeartbeatEmoji emoji="❤️" size={20} />
              <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 16, textAlign: "center" }}>
                {isRu ? "Поддержать разработчика" : "Support Developer"}
              </Text>
            </Pressable>

            {/* Privacy & Legal */}
            <View style={{ gap: 8 }}>
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
            </View>

            {/* ========== SECTION 8: DATA MANAGEMENT ========== */}
            <Text className={sectionTitleStyle}>{isRu ? "8. Управление данными" : "8. Data Management"}</Text>
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
                  📤 {isRu ? "Экспортировать данные" : "Export Data"}
                </Text>
              </Pressable>

              <Pressable
                onPress={handleImportData}
                style={({ pressed }) => [{
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  paddingVertical: 12,
                  alignItems: "center",
                  opacity: pressed ? 0.7 : 1,
                }]}
              >
                <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 16 }}>
                  📥 {isRu ? "Импортировать данные" : "Import Data"}
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
                  🗑 {isRu ? "Очистить все данные" : "Clear All Data"}
                </Text>
              </Pressable>
            </View>

            {/* Footer with Version */}
            <AppVersionFooter />
          </View>
        </ScrollView>

        {/* Customization Modals */}
        <Modal
          visible={showCustomizationModal === 'quadrant'}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setShowCustomizationModal(null)}
        >
          <View style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Safe header respecting notch/camera cutout */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingTop: Platform.OS === 'web' ? 20 : Math.max(insets.top, 16),
              paddingBottom: 12,
              borderBottomWidth: 0.5,
              borderBottomColor: colors.border,
            }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.foreground, flex: 1, marginRight: 8 }} numberOfLines={1}>
                {isRu ? '🎨 Цвета квадрантов' : '🎨 Quadrant Colors'}
              </Text>
              <Pressable
                onPress={() => setShowCustomizationModal(null)}
                style={({ pressed }) => [{
                  width: 32, height: 32, borderRadius: 16,
                  backgroundColor: colors.surface,
                  alignItems: 'center', justifyContent: 'center',
                  opacity: pressed ? 0.6 : 1,
                }]}
              >
                <Text style={{ fontSize: 16, color: colors.foreground, fontWeight: '600' }}>✕</Text>
              </Pressable>
            </View>
            <QuadrantColorsSettings />
          </View>
        </Modal>

        <Modal
          visible={showCustomizationModal === 'notification'}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setShowCustomizationModal(null)}
        >
          <View style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingTop: Platform.OS === 'web' ? 20 : Math.max(insets.top, 16),
              paddingBottom: 12,
              borderBottomWidth: 0.5,
              borderBottomColor: colors.border,
            }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.foreground, flex: 1, marginRight: 8 }} numberOfLines={1}>
                {isRu ? '🔊 Звуки и вибрация' : '🔊 Sound & Vibration'}
              </Text>
              <Pressable
                onPress={() => setShowCustomizationModal(null)}
                style={({ pressed }) => [{
                  width: 32, height: 32, borderRadius: 16,
                  backgroundColor: colors.surface,
                  alignItems: 'center', justifyContent: 'center',
                  opacity: pressed ? 0.6 : 1,
                }]}
              >
                <Text style={{ fontSize: 16, color: colors.foreground, fontWeight: '600' }}>✕</Text>
              </Pressable>
            </View>
            <NotificationSettings />
          </View>
        </Modal>

        <Modal
          visible={showCustomizationModal === 'deadline'}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setShowCustomizationModal(null)}
        >
          <View style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingTop: Platform.OS === 'web' ? 20 : Math.max(insets.top, 16),
              paddingBottom: 12,
              borderBottomWidth: 0.5,
              borderBottomColor: colors.border,
            }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.foreground, flex: 1, marginRight: 8 }} numberOfLines={1}>
                {isRu ? '⏰ Подсветка сроков' : '⏰ Deadline Highlighting'}
              </Text>
              <Pressable
                onPress={() => setShowCustomizationModal(null)}
                style={({ pressed }) => [{
                  width: 32, height: 32, borderRadius: 16,
                  backgroundColor: colors.surface,
                  alignItems: 'center', justifyContent: 'center',
                  opacity: pressed ? 0.6 : 1,
                }]}
              >
                <Text style={{ fontSize: 16, color: colors.foreground, fontWeight: '600' }}>✕</Text>
              </Pressable>
            </View>
            <DeadlineHighlightSettings />
          </View>
        </Modal>
      </ScreenContainer>
    </ScreenTransition>
  );
}
