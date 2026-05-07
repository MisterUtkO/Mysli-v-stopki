import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Platform,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { ScreenContainer } from "@/components/common/screen-container";
import { useTaskContext } from "@/lib/context/task-context";
import { useI18n } from "@/lib/context/i18n-context";
import { EmojiPicker } from "@/components/modals/emoji-picker";
import { determineQuadrant } from "@/lib/domain/scoring";
import Slider from "@react-native-community/slider";
import type { NotificationFrequency, TaskAttachment } from "@/lib/domain/types";

const QUADRANT_LABELS: Record<string, { en: string; ru: string; color: string }> = {
  Q1: { en: "Do Now", ru: "Сделать сейчас", color: "#FF6B6B" },
  Q2: { en: "Schedule", ru: "Запланировать", color: "#FFA94D" },
  Q3: { en: "Delegate", ru: "Делегировать", color: "#74C0FC" },
  Q4: { en: "Low priority", ru: "Низкий приоритет", color: "#51CF66" },
};

const NOTIF_OPTIONS: { value: NotificationFrequency; en: string; ru: string }[] = [
  { value: "global", en: "Default", ru: "По умолч." },
  { value: "never", en: "Never", ru: "Никогда" },
  { value: "10min", en: "Every 10 min", ru: "Каждые 10 мин" },
  { value: "30min", en: "Every 30 min", ru: "Каждые 30 мин" },
  { value: "hourly", en: "Hourly", ru: "Каждый час" },
  { value: "daily", en: "Daily", ru: "Ежедневно" },
  { value: "weekly", en: "Weekly", ru: "Еженедельно" },
];

export default function AddTaskScreen() {
  const router = useRouter();
  const { createTask, settings } = useTaskContext();
  const { t, language } = useI18n();
  const isRu = language === "ru";

  const [input, setInput] = useState("");
  const [importance, setImportance] = useState(4);
  const [urgency, setUrgency] = useState(4);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [dueTime, setDueTime] = useState<Date | null>(null);
  const [emoji, setEmoji] = useState<string | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [notifFrequency, setNotifFrequency] = useState<NotificationFrequency>("global");
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentQuadrant = determineQuadrant(importance, urgency, {
    importanceThreshold: settings.importanceThreshold,
    urgencyThreshold: settings.urgencyThreshold,
  });
  const quadrantInfo = QUADRANT_LABELS[currentQuadrant];

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDueDate(selectedDate);
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) setDueTime(selectedTime);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString(isRu ? "ru-RU" : "en-US", {
      day: "numeric",
      month: "short",
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString(isRu ? "ru-RU" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Правка #4: явный запрос разрешений перед открытием галереи (Android 13+)
  const handlePickImage = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            isRu ? "Нет доступа" : "Permission denied",
            isRu
              ? "Разрешите доступ к фото в настройках устройства"
              : "Please allow photo access in device settings"
          );
          return;
        }
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.7,
        allowsMultipleSelection: true,
      });
      if (!result.canceled && result.assets) {
        const newAttachments: TaskAttachment[] = result.assets.map(
          (asset: { uri: string; fileName?: string | null }) => ({
            uri: asset.uri,
            type: "image" as const,
            name: asset.fileName || "photo.jpg",
          })
        );
        setAttachments((prev) => [...prev, ...newAttachments]);
      }
    } catch (e) {
      console.log("Image picker error:", e);
    }
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
      });
      if (!result.canceled && result.assets) {
        const newAttachments: TaskAttachment[] = result.assets.map(
          (asset: { uri: string; name?: string }) => ({
            uri: asset.uri,
            type: "file" as const,
            name: asset.name || "file",
          })
        );
        setAttachments((prev) => [...prev, ...newAttachments]);
      }
    } catch (e) {
      console.log("Document picker error:", e);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const showNotificationPreview = async (title: string, quadrant: string) => {
    try {
      const qInfo = QUADRANT_LABELS[quadrant];
      const qLabel = isRu ? qInfo.ru : qInfo.en;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: isRu ? "✅ Задача создана" : "✅ Task created",
          body: `${emoji || ""} ${title}\n${isRu ? "Квадрант" : "Quadrant"}: ${quadrant} — ${qLabel}`,
          sound: true,
        },
        trigger: null,
      });
    } catch (e) {
      console.log("Notification preview failed:", e);
    }
  };

  const handleAddTask = async () => {
    if (!input.trim()) {
      setError(isRu ? "Пожалуйста, введите описание задачи" : "Please enter a task description");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const title = input.length > 50 ? input.substring(0, 50) + "..." : input;
      const dueDateStr = dueDate ? dueDate.toISOString().split("T")[0] : undefined;
      const dueTimeStr = dueTime ? dueTime.toTimeString().substring(0, 5) : undefined;

      await createTask({
        title,
        description: input,
        importance,
        urgency,
        dueDate: dueDateStr,
        dueTime: dueTimeStr,
        emoji,
        status: "not_started",
        notificationFrequency: notifFrequency,
        attachments,
      });

      await showNotificationPreview(title, currentQuadrant);
      router.back();
    } catch (err) {
      console.error("Failed to create task:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : isRu
          ? "Ошибка при создании задачи"
          : "Error creating task";
      setError(errorMessage);
      Alert.alert(t.common.error, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-4">
          {/* Header with quadrant preview */}
          <View className="flex-row items-center justify-between">
            <Text className="text-foreground font-bold" style={{ fontSize: 24, lineHeight: 30 }}>
              {isRu ? "Новая задача" : "New Task"}
            </Text>
            <View
              style={{
                backgroundColor: quadrantInfo.color,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "700" }}>
                {currentQuadrant}
              </Text>
            </View>
          </View>

          {/* Error */}
          {error && (
            <View
              style={{
                backgroundColor: "#FEE2E2",
                borderWidth: 1,
                borderColor: "#EF4444",
                borderRadius: 12,
                padding: 10,
              }}
            >
              <Text style={{ color: "#EF4444", fontSize: 13 }}>{error}</Text>
            </View>
          )}

          {/* Task description */}
          <TextInput
            value={input}
            onChangeText={(text) => {
              setInput(text);
              setError(null);
            }}
            placeholder={isRu ? "Что нужно сделать?" : "What needs to be done?"}
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            className="bg-surface border border-border rounded-2xl p-4 text-foreground"
            style={{ fontSize: 16, lineHeight: 22, minHeight: 80, textAlignVertical: "top" }}
            autoFocus
            returnKeyType="done"
          />

          {/* Quick emoji row */}
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => setShowEmojiPicker(true)}
              style={({ pressed }) => [
                {
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: emoji ? "#0a7ea4" : "#E5E7EB",
                  backgroundColor: emoji ? "#0a7ea410" : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text style={{ fontSize: 22 }}>{emoji || "😀"}</Text>
            </Pressable>

            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={({ pressed }) => [
                {
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: dueDate ? "#0a7ea4" : "#E5E7EB",
                  backgroundColor: dueDate ? "#0a7ea410" : "transparent",
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text style={{ fontSize: 13, color: dueDate ? "#0a7ea4" : "#999" }}>
                📅 {dueDate ? formatDate(dueDate) : isRu ? "Дата" : "Date"}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setShowTimePicker(true)}
              style={({ pressed }) => [
                {
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: dueTime ? "#0a7ea4" : "#E5E7EB",
                  backgroundColor: dueTime ? "#0a7ea410" : "transparent",
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text style={{ fontSize: 13, color: dueTime ? "#0a7ea4" : "#999" }}>
                ⏰ {dueTime ? formatTime(dueTime) : isRu ? "Время" : "Time"}
              </Text>
            </Pressable>

            {(dueDate || dueTime) && (
              <Pressable
                onPress={() => {
                  setDueDate(null);
                  setDueTime(null);
                }}
                style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
              >
                <Text style={{ color: "#EF4444", fontSize: 16 }}>✕</Text>
              </Pressable>
            )}
          </View>

          {/* Importance slider */}
          <View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-foreground font-semibold" style={{ fontSize: 14 }}>
                🔥 {isRu ? "Важность" : "Importance"}
              </Text>
              <Text style={{ fontSize: 16, fontWeight: "800", color: "#FF6B6B" }}>
                {importance}/7
              </Text>
            </View>
            <Slider
              style={{ height: 36 }}
              minimumValue={1}
              maximumValue={7}
              step={1}
              value={importance}
              onValueChange={setImportance}
              minimumTrackTintColor="#FF6B6B"
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor="#FF6B6B"
            />
          </View>

          {/* Urgency slider */}
          <View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-foreground font-semibold" style={{ fontSize: 14 }}>
                ⚡ {isRu ? "Срочность" : "Urgency"}
              </Text>
              <Text style={{ fontSize: 16, fontWeight: "800", color: "#FFA94D" }}>
                {urgency}/7
              </Text>
            </View>
            <Slider
              style={{ height: 36 }}
              minimumValue={1}
              maximumValue={7}
              step={1}
              value={urgency}
              onValueChange={setUrgency}
              minimumTrackTintColor="#FFA94D"
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor="#FFA94D"
            />
          </View>

          {/* File attachments */}
          <View>
            <View className="flex-row items-center gap-2 mb-2">
              <Text className="text-foreground font-semibold" style={{ fontSize: 14 }}>
                📎 {isRu ? "Вложения" : "Attachments"}
              </Text>
              <Pressable
                onPress={handlePickImage}
                style={({ pressed }) => [
                  {
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 10,
                    backgroundColor: "#0a7ea420",
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text style={{ fontSize: 12, color: "#0a7ea4", fontWeight: "600" }}>
                  🖼 {isRu ? "Фото" : "Photo"}
                </Text>
              </Pressable>
              <Pressable
                onPress={handlePickFile}
                style={({ pressed }) => [
                  {
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 10,
                    backgroundColor: "#0a7ea420",
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text style={{ fontSize: 12, color: "#0a7ea4", fontWeight: "600" }}>
                  📄 {isRu ? "Файл" : "File"}
                </Text>
              </Pressable>
            </View>

            {attachments.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {attachments.map((att, idx) => (
                  <View key={idx} style={{ position: "relative" }}>
                    <View
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 10,
                        backgroundColor: "rgba(128,128,128,0.15)",
                        overflow: "hidden",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {att.type === "image" ? (
                        <Image
                          source={{ uri: att.uri }}
                          style={{ width: 60, height: 60 }}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={{ alignItems: "center" }}>
                          <Text style={{ fontSize: 24 }}>📄</Text>
                          <Text
                            style={{ fontSize: 8, color: "#999" }}
                            numberOfLines={1}
                          >
                            {att.name}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Pressable
                      onPress={() => removeAttachment(idx)}
                      style={({ pressed }) => [
                        {
                          position: "absolute",
                          top: -4,
                          right: -4,
                          width: 18,
                          height: 18,
                          borderRadius: 9,
                          backgroundColor: "#EF4444",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "700" }}>✕</Text>
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Advanced toggle */}
          <Pressable
            onPress={() => setShowAdvanced(!showAdvanced)}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, paddingVertical: 4 }]}
          >
            <Text style={{ fontSize: 13, color: "#0a7ea4", fontWeight: "600" }}>
              {showAdvanced
                ? isRu
                  ? "▲ Скрыть доп. настройки"
                  : "▲ Hide advanced"
                : isRu
                ? "▼ Доп. настройки (уведомления)"
                : "▼ Advanced (notifications)"}
            </Text>
          </Pressable>

          {showAdvanced && (
            <View className="bg-surface rounded-2xl p-3 border border-border">
              <Text
                className="text-foreground font-semibold"
                style={{ fontSize: 13, marginBottom: 8 }}
              >
                🔔 {isRu ? "Частота уведомлений" : "Notification frequency"}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {NOTIF_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => setNotifFrequency(opt.value)}
                    style={({ pressed }) => [
                      {
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 10,
                        borderWidth: 1.5,
                        borderColor:
                          notifFrequency === opt.value ? "#0a7ea4" : "#E5E7EB",
                        backgroundColor:
                          notifFrequency === opt.value ? "#0a7ea420" : "transparent",
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: notifFrequency === opt.value ? "700" : "500",
                        color: notifFrequency === opt.value ? "#0a7ea4" : "#9CA3AF",
                      }}
                    >
                      {isRu ? opt.ru : opt.en}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {showDatePicker && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={dueTime || new Date()}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}

          <EmojiPicker
            visible={showEmojiPicker}
            onSelect={setEmoji}
            onClose={() => setShowEmojiPicker(false)}
            selectedEmoji={emoji}
          />

          {/* Action buttons */}
          <View className="flex-row gap-3 mt-1">
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                {
                  flex: 1,
                  padding: 14,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                className="text-foreground"
                style={{ textAlign: "center", fontWeight: "600", fontSize: 16 }}
              >
                {t.common.cancel}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleAddTask}
              disabled={!input.trim() || loading}
              style={({ pressed }) => [
                {
                  flex: 1,
                  padding: 14,
                  borderRadius: 16,
                  backgroundColor:
                    !input.trim() || loading ? "#9CA3AF" : "#0a7ea4",
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: "#FFFFFF",
                  fontWeight: "700",
                  fontSize: 16,
                }}
              >
                {loading
                  ? isRu
                    ? "Добавление..."
                    : "Adding..."
                  : t.common.add}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
