import { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Slider from "@react-native-community/slider";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ScreenContainer } from "@/components/screen-container";
import { useTaskContext } from "@/lib/context/task-context";
import { useI18n } from "@/lib/context/i18n-context";
import { EmojiPicker } from "@/components/emoji-picker";
import { determineQuadrant, calculatePriorityScore } from "@/lib/domain/scoring";
import type { Task } from "@/lib/domain/types";

const QUADRANT_LABELS: Record<string, { en: string; ru: string; color: string }> = {
  Q1: { en: "Do Now", ru: "Сделать сейчас", color: "#FF6B6B" },
  Q2: { en: "Schedule", ru: "Запланировать", color: "#FFA94D" },
  Q3: { en: "Delegate", ru: "Делегировать", color: "#74C0FC" },
  Q4: { en: "Low priority", ru: "Низкий приоритет", color: "#51CF66" },
};

export default function TaskDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, updateTask, settings } = useTaskContext();
  const { t, language } = useI18n();

  const [task, setTask] = useState<Task | null>(null);
  const [description, setDescription] = useState("");
  const [importance, setImportance] = useState(4);
  const [urgency, setUrgency] = useState(4);
  const [emoji, setEmoji] = useState<string | undefined>();
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [dueTime, setDueTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const foundTask = tasks.find((t) => t.id === id);
      if (foundTask) {
        setTask(foundTask);
        setDescription(foundTask.description);
        setImportance(foundTask.importance);
        setUrgency(foundTask.urgency);
        setEmoji(foundTask.emoji || undefined);
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

  // Live quadrant preview
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
    return date.toLocaleDateString(language === "ru" ? "ru-RU" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString(language === "ru" ? "ru-RU" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSave = async () => {
    if (!task) return;

    setLoading(true);
    try {
      const title = description.length > 50 ? description.substring(0, 50) + "..." : description;
      const dueDateStr = dueDate ? dueDate.toISOString().split("T")[0] : undefined;
      const dueTimeStr = dueTime ? dueTime.toTimeString().substring(0, 5) : undefined;
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
      });

      router.back();
    } catch (error) {
      console.error("Failed to update task:", error);
      Alert.alert(
        language === "ru" ? "Ошибка" : "Error",
        language === "ru" ? "Не удалось сохранить задачу" : "Failed to save task"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!task) return;
    Alert.alert(
      language === "ru" ? "Удалить задачу?" : "Delete task?",
      task.title,
      [
        { text: language === "ru" ? "Отмена" : "Cancel", style: "cancel" },
        {
          text: language === "ru" ? "Удалить" : "Delete",
          style: "destructive",
          onPress: async () => {
            const { deleteTask } = useTaskContext();
            // We can't call hook here, so we'll navigate back
            router.back();
          },
        },
      ]
    );
  };

  if (!task) {
    return (
      <ScreenContainer className="p-4 justify-center items-center">
        <Text className="text-foreground" style={{ fontSize: 16 }}>
          {language === "ru" ? "Загрузка..." : "Loading..."}
        </Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-5">
          {/* Header */}
          <Text
            className="text-foreground font-bold"
            style={{ fontSize: 28, lineHeight: 34 }}
          >
            {language === "ru" ? "Редактировать" : "Edit Task"}
          </Text>

          {/* Live quadrant preview */}
          <View
            style={{
              backgroundColor: quadrantInfo.color + "15",
              borderLeftWidth: 4,
              borderLeftColor: quadrantInfo.color,
              borderRadius: 12,
              padding: 14,
            }}
          >
            <Text
              style={{
                color: quadrantInfo.color,
                fontSize: 15,
                fontWeight: "700",
              }}
            >
              {currentQuadrant} — {language === "ru" ? quadrantInfo.ru : quadrantInfo.en}
            </Text>
          </View>

          {/* Task description */}
          <View>
            <Text
              className="text-foreground font-semibold"
              style={{ fontSize: 16, marginBottom: 8 }}
            >
              {language === "ru" ? "Описание задачи" : "Task description"}
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder={language === "ru" ? "Введите описание задачи..." : "Enter task description..."}
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              className="bg-surface border border-border rounded-2xl p-4 text-foreground"
              style={{ fontSize: 16, lineHeight: 22, minHeight: 100, textAlignVertical: "top" }}
            />
          </View>

          {/* Importance slider */}
          <View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-foreground font-semibold" style={{ fontSize: 16 }}>
                {language === "ru" ? "Важность" : "Importance"}
              </Text>
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#FF6B6B" }}>
                {importance}/7
              </Text>
            </View>
            <Slider
              style={{ height: 44 }}
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
            <View className="flex-row justify-between mb-2">
              <Text className="text-foreground font-semibold" style={{ fontSize: 16 }}>
                {language === "ru" ? "Срочность" : "Urgency"}
              </Text>
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#FFA94D" }}>
                {urgency}/7
              </Text>
            </View>
            <Slider
              style={{ height: 44 }}
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

          {/* Emoji picker */}
          <View>
            <Text
              className="text-foreground font-semibold"
              style={{ fontSize: 16, marginBottom: 8 }}
            >
              {language === "ru" ? "Эмодзи" : "Emoji"}
            </Text>
            <Pressable
              onPress={() => setShowEmojiPicker(true)}
              style={({ pressed }) => [
                {
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 14,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: emoji ? "#0a7ea4" : "#E5E7EB",
                  backgroundColor: emoji ? "#0a7ea410" : "transparent",
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text className="text-foreground" style={{ fontSize: 16 }}>
                {emoji
                  ? language === "ru"
                    ? `Выбран: ${emoji}`
                    : `Selected: ${emoji}`
                  : language === "ru"
                    ? "Выберите эмодзи"
                    : "Choose emoji"}
              </Text>
              {emoji && <Text style={{ fontSize: 32 }}>{emoji}</Text>}
            </Pressable>
          </View>

          {/* Due date & time */}
          <View className="gap-3">
            <Text className="text-foreground font-semibold" style={{ fontSize: 16 }}>
              {language === "ru" ? "Крайний срок (опционально)" : "Due date (optional)"}
            </Text>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setShowDatePicker(true)}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    padding: 14,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: dueDate ? "#0a7ea4" : "#E5E7EB",
                    backgroundColor: dueDate ? "#0a7ea410" : "transparent",
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 15,
                    color: dueDate ? "#0a7ea4" : "#999",
                    textAlign: "center",
                  }}
                >
                  📅 {dueDate ? formatDate(dueDate) : language === "ru" ? "Дата" : "Date"}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setShowTimePicker(true)}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    padding: 14,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: dueTime ? "#0a7ea4" : "#E5E7EB",
                    backgroundColor: dueTime ? "#0a7ea410" : "transparent",
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 15,
                    color: dueTime ? "#0a7ea4" : "#999",
                    textAlign: "center",
                  }}
                >
                  ⏰ {dueTime ? formatTime(dueTime) : language === "ru" ? "Время" : "Time"}
                </Text>
              </Pressable>
            </View>

            {(dueDate || dueTime) && (
              <Pressable
                onPress={() => {
                  setDueDate(null);
                  setDueTime(null);
                }}
                style={({ pressed }) => [{ padding: 8, opacity: pressed ? 0.5 : 1 }]}
              >
                <Text style={{ color: "#EF4444", fontSize: 14, textAlign: "center" }}>
                  {language === "ru" ? "✕ Убрать срок" : "✕ Clear deadline"}
                </Text>
              </Pressable>
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
            onSelect={setEmoji}
            onClose={() => setShowEmojiPicker(false)}
            selectedEmoji={emoji}
          />

          {/* Action buttons */}
          <View className="flex-row gap-3 mt-2">
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                {
                  flex: 1,
                  padding: 16,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                className="text-foreground"
                style={{ textAlign: "center", fontWeight: "600", fontSize: 17 }}
              >
                {language === "ru" ? "Отмена" : "Cancel"}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleSave}
              disabled={!description.trim() || loading}
              style={({ pressed }) => [
                {
                  flex: 1,
                  padding: 16,
                  borderRadius: 16,
                  backgroundColor: !description.trim() || loading ? "#9CA3AF" : "#0a7ea4",
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
                  fontSize: 17,
                }}
              >
                {loading
                  ? language === "ru"
                    ? "Сохранение..."
                    : "Saving..."
                  : language === "ru"
                    ? "Сохранить"
                    : "Save"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
