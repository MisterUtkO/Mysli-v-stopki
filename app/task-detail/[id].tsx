import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import Slider from "@react-native-community/slider";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { ScreenContainer } from "@/components/common/screen-container";
import { useTaskContext } from "@/lib/context/task-context";
import { useI18n } from "@/lib/context/i18n-context";
import { EmojiPicker } from "@/components/modals/emoji-picker";
import { FilePreviewModal } from "@/components/modals/file-preview-modal";
import {
  determineQuadrant,
  calculatePriorityScore,
} from "@/lib/domain/scoring";
import type {
  Task,
  NotificationFrequency,
  TaskAttachment,
} from "@/lib/domain/types";

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

// Helpers for slider labels
function getImportanceLabel(value: number, isRu: boolean): string {
  if (value <= 3) return isRu ? "Низкая" : "Low";
  if (value <= 6) return isRu ? "Средняя" : "Medium";
  if (value <= 9) return isRu ? "Высокая" : "High";
  return isRu ? "Максимальная" : "Critical";
}

function getUrgencyLabel(value: number, isRu: boolean): string {
  if (value <= 3) return isRu ? "Низкая" : "Low";
  if (value <= 6) return isRu ? "Средняя" : "Medium";
  if (value <= 9) return isRu ? "Высокая" : "High";
  return isRu ? "Максимальная" : "Critical";
}

function getImportanceHint(value: number, isRu: boolean): string {
  if (value <= 3)
    return isRu
      ? "Задача не критична для целей"
      : "Not critical for your goals";
  if (value <= 6)
    return isRu ? "Важная, но не горит" : "Important but not burning";
  if (value <= 9)
    return isRu
      ? "Важная задача, влияет на цели"
      : "Important task, affects goals";
  return isRu
    ? "Критически важна для успеха"
    : "Critical for success";
}

function getUrgencyHint(value: number, isRu: boolean): string {
  if (value <= 3)
    return isRu ? "Можно отложить" : "Can be postponed";
  if (value <= 6)
    return isRu ? "Желательно сделать скоро" : "Should be done soon";
  if (value <= 9)
    return isRu
      ? "Нужно сделать в ближайшее время"
      : "Needs to be done soon";
  return isRu
    ? "Срочно! Требует немедленных действий"
    : "Urgent! Requires immediate action";
}

export default function TaskDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, updateTask, deleteTask, settings } = useTaskContext();
  const { language } = useI18n();
  const isRu = language === "ru";

  const [task, setTask] = useState<Task | null>(null);
  const [description, setDescription] = useState("");
  const [importance, setImportance] = useState(4);
  const [urgency, setUrgency] = useState(4);
  const [emoji, setEmoji] = useState<string | undefined>();
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [dueTime, setDueTime] = useState<Date | null>(null);
  const [notifFrequency, setNotifFrequency] =
    useState<NotificationFrequency>("global");
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [showFilePreview, setShowFilePreview] = useState(false);
  const [selectedAttachment, setSelectedAttachment] =
    useState<TaskAttachment | null>(null);

  // Auto-save after 1.5s of inactivity
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      const foundTask = tasks.find((t) => t.id === id);
      if (foundTask) {
        setTask(foundTask);
        setDescription(foundTask.description);
        setImportance(foundTask.importance);
        setUrgency(foundTask.urgency);
        setEmoji(foundTask.emoji || undefined);
        setNotifFrequency(foundTask.notificationFrequency || "global");
        setAttachments(foundTask.attachments || []);

        if (foundTask.dueDate) {
          setDueDate(new Date(foundTask.dueDate));
        }
        if (foundTask.dueTime) {
          const [hours, minutes] = foundTask.dueTime.split(":").map(Number);
          const time = new Date();
          time.setHours(hours, minutes);
          setDueTime(time);
        }
      }
    }
  }, [id, tasks]);

  // Auto-save logic
  const triggerAutoSave = () => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
    setIsSaving(true);
    autoSaveTimer.current = setTimeout(() => {
      performAutoSave();
    }, 1500) as unknown as NodeJS.Timeout;
  };

  const performAutoSave = async () => {
    if (!task || !description.trim()) {
      setIsSaving(false);
      return;
    }
    try {
      const title =
        description.length > 50
          ? description.substring(0, 50) + "..."
          : description;
      const dueDateStr = dueDate
        ? dueDate.toISOString().split("T")[0]
        : undefined;
      const dueTimeStr = dueTime
        ? dueTime.toTimeString().substring(0, 5)
        : undefined;
      const priorityScore = calculatePriorityScore(importance, urgency);
      const quadrant = determineQuadrant(importance, urgency, {
        importanceThreshold: settings.importanceThreshold,
        urgencyThreshold: settings.urgencyThreshold,
      });

      await updateTask(task.id, {
        title,
        description,
        importance,
        urgency,
        dueDate: dueDateStr,
        dueTime: dueTimeStr,
        emoji,
        priorityScore,
        quadrant,
        notificationFrequency: notifFrequency,
        attachments,
      });
      setIsSaving(false);
    } catch (error) {
      console.error("Auto-save failed:", error);
      setIsSaving(false);
    }
  };

  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, []);

  const currentQuadrant = determineQuadrant(importance, urgency, {
    importanceThreshold: settings.importanceThreshold,
    urgencyThreshold: settings.urgencyThreshold,
  });
  const quadrantInfo = QUADRANT_LABELS[currentQuadrant];

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
      triggerAutoSave();
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setDueTime(selectedTime);
      triggerAutoSave();
    }
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

  const handlePickImage = async () => {
    try {
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
        triggerAutoSave();
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
        triggerAutoSave();
      }
    } catch (e) {
      console.log("Document picker error:", e);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    triggerAutoSave();
  };

  const handleDelete = () => {
    if (!task) return;
    Alert.alert(
      isRu ? "Удалить задачу?" : "Delete task?",
      task.title,
      [
        { text: isRu ? "Отмена" : "Cancel", style: "cancel" },
        {
          text: isRu ? "Удалить" : "Delete",
          style: "destructive",
          onPress: async () => {
            router.back();
            setTimeout(async () => {
              await deleteTask(task.id);
            }, 100);
          },
        },
      ]
    );
  };

  if (!task) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ fontSize: 16, color: "#9CA3AF" }}>
            {isRu ? "Загрузка..." : "Loading..."}
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "600", color: "#1F2937" }}>
            {isRu ? "Редактировать" : "Edit Task"}
          </Text>
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
              backgroundColor: quadrantInfo.color + "20",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: quadrantInfo.color,
              }}
            >
              {currentQuadrant}
            </Text>
          </View>
        </View>

        {/* Auto-save indicator */}
        {isSaving && (
          <View
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              backgroundColor: "#FEF3C7",
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 12, color: "#92400E" }}>
              💾 {isRu ? "Сохранение..." : "Saving..."}
            </Text>
          </View>
        )}

        {/* Description */}
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "#E5E7EB",
            borderRadius: 12,
            padding: 12,
            fontSize: 15,
            minHeight: 100,
            textAlignVertical: "top",
            marginBottom: 16,
          }}
          placeholder={isRu ? "Описание задачи" : "Task description"}
          placeholderTextColor="#9CA3AF"
          value={description}
          onChangeText={(text) => {
            setDescription(text);
            triggerAutoSave();
          }}
          multiline
        />

        {/* Quick emoji + date row */}
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            marginBottom: 20,
            alignItems: "center",
          }}
        >
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
            <Text style={{ fontSize: 20 }}>{emoji || "😀"}</Text>
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
            <Text style={{ fontSize: 13, color: "#1F2937" }}>
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
            <Text style={{ fontSize: 13, color: "#1F2937" }}>
              ⏰ {dueTime ? formatTime(dueTime) : isRu ? "Время" : "Time"}
            </Text>
          </Pressable>

          {(dueDate || dueTime) && (
            <Pressable
              onPress={() => {
                setDueDate(null);
                setDueTime(null);
                triggerAutoSave();
              }}
              style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
            >
              <Text style={{ fontSize: 16, color: "#EF4444" }}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* Importance slider */}
        <View style={{ marginBottom: 20 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: "500", color: "#1F2937" }}>
              🔥 {isRu ? "Важность" : "Importance"}
            </Text>
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#0a7ea4" }}>
              {getImportanceLabel(importance, isRu)}
            </Text>
          </View>
          <Slider
            style={{ width: "100%", height: 40 }}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={importance}
            onValueChange={(val) => {
              setImportance(val);
              triggerAutoSave();
            }}
            minimumTrackTintColor="#0a7ea4"
            maximumTrackTintColor="#E5E7EB"
            thumbTintColor="#0a7ea4"
          />
          <Text
            style={{
              fontSize: 12,
              color: "#6B7280",
              fontStyle: "italic",
              marginTop: 4,
            }}
          >
            {getImportanceHint(importance, isRu)}
          </Text>
        </View>

        {/* Urgency slider */}
        <View style={{ marginBottom: 20 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: "500", color: "#1F2937" }}>
              ⚡ {isRu ? "Срочность" : "Urgency"}
            </Text>
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#0a7ea4" }}>
              {getUrgencyLabel(urgency, isRu)}
            </Text>
          </View>
          <Slider
            style={{ width: "100%", height: 40 }}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={urgency}
            onValueChange={(val) => {
              setUrgency(val);
              triggerAutoSave();
            }}
            minimumTrackTintColor="#0a7ea4"
            maximumTrackTintColor="#E5E7EB"
            thumbTintColor="#0a7ea4"
          />
          <Text
            style={{
              fontSize: 12,
              color: "#6B7280",
              fontStyle: "italic",
              marginTop: 4,
            }}
          >
            {getUrgencyHint(urgency, isRu)}
          </Text>
        </View>

        {/* File attachments */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "500",
              color: "#1F2937",
              marginBottom: 8,
            }}
          >
            📎 {isRu ? "Вложения" : "Attachments"}
          </Text>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
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
              <Text style={{ fontSize: 13, color: "#0a7ea4" }}>
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
              <Text style={{ fontSize: 13, color: "#0a7ea4" }}>
                📄 {isRu ? "Файл" : "File"}
              </Text>
            </Pressable>
          </View>

          {attachments.length > 0 && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {attachments.map((att: TaskAttachment, idx: number) => (
                <Pressable
                  key={idx}
                  onPress={() => {
                    setSelectedAttachment(att);
                    setShowFilePreview(true);
                  }}
                  style={{ position: "relative" }}
                >
                  {att.type === "image" ? (
                    <Image
                      source={{ uri: att.uri }}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 8,
                        backgroundColor: "#F3F4F6",
                      }}
                    />
                  ) : (
                    <View
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 8,
                        backgroundColor: "#E5E7EB",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontSize: 20 }}>📄</Text>
                      <Text
                        style={{
                          fontSize: 8,
                          color: "#6B7280",
                          marginTop: 2,
                          textAlign: "center",
                        }}
                        numberOfLines={1}
                      >
                        {att.name}
                      </Text>
                    </View>
                  )}
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
                    <Text style={{ fontSize: 10, color: "#FFFFFF" }}>✕</Text>
                  </Pressable>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Advanced: per-task notification frequency */}
        <View style={{ marginBottom: 20 }}>
          <Pressable
            onPress={() => setShowAdvanced(!showAdvanced)}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, paddingVertical: 4 }]}
          >
            <Text style={{ fontSize: 14, color: "#6B7280" }}>
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
            <View style={{ marginTop: 12 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: "#1F2937",
                  marginBottom: 8,
                }}
              >
                🔔 {isRu ? "Частота уведомлений" : "Notification frequency"}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {NOTIF_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => {
                      setNotifFrequency(opt.value);
                      triggerAutoSave();
                    }}
                    style={({ pressed }) => [
                      {
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 10,
                        borderWidth: 1.5,
                        borderColor:
                          notifFrequency === opt.value ? "#0a7ea4" : "#E5E7EB",
                        backgroundColor:
                          notifFrequency === opt.value
                            ? "#0a7ea420"
                            : "transparent",
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color:
                          notifFrequency === opt.value ? "#0a7ea4" : "#6B7280",
                      }}
                    >
                      {isRu ? opt.ru : opt.en}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>

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
          onClose={() => setShowEmojiPicker(false)}
          onSelect={(selected) => {
            setEmoji(selected);
            setShowEmojiPicker(false);
            triggerAutoSave();
          }}
          selectedEmoji={emoji}
        />

        {/* Action buttons */}
        <View
          style={{
            flexDirection: "row",
            gap: 12,
            marginTop: 12,
            marginBottom: 16,
          }}
        >
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
              style={{
                textAlign: "center",
                fontSize: 15,
                fontWeight: "600",
                color: "#6B7280",
              }}
            >
              {isRu ? "Назад" : "Back"}
            </Text>
          </Pressable>
        </View>

        {/* Delete button */}
        <Pressable
          onPress={handleDelete}
          style={({ pressed }) => [
            {
              padding: 14,
              borderRadius: 16,
              backgroundColor: "#EF444420",
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text
            style={{
              textAlign: "center",
              fontSize: 15,
              fontWeight: "600",
              color: "#EF4444",
            }}
          >
            🗑 {isRu ? "Удалить задачу" : "Delete task"}
          </Text>
        </Pressable>

        {/* File Preview Modal */}
        <FilePreviewModal
          visible={showFilePreview}
          attachment={selectedAttachment}
          onClose={() => setShowFilePreview(false)}
        />
      </ScrollView>
    </ScreenContainer>
  );
}
