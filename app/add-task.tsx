import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ScreenContainer } from "@/components/screen-container";
import { useTaskContext } from "@/lib/context/task-context";
import { useI18n } from "@/lib/context/i18n-context";
import { EmojiPicker } from "@/components/emoji-picker";
import Slider from "@react-native-community/slider";

export default function AddTaskScreen() {
  const router = useRouter();
  const { createTask } = useTaskContext();
  const { t } = useI18n();

  const [input, setInput] = useState("");
  const [importance, setImportance] = useState(4);
  const [urgency, setUrgency] = useState(4);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [dueTime, setDueTime] = useState<Date | null>(null);
  const [emoji, setEmoji] = useState<string | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setDueTime(selectedTime);
    }
  };

  const handleAddTask = async () => {
    if (!input.trim()) {
      setError("Пожалуйста, введите описание задачи");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const title = input.substring(0, 50);
      const dueDateStr = dueDate ? dueDate.toISOString().split("T")[0] : undefined;
      const dueTimeStr = dueTime ? dueTime.toTimeString().substring(0, 5) : undefined;

      console.log("Creating task with:", {
        title,
        description: input,
        importance,
        urgency,
        dueDate: dueDateStr,
        dueTime: dueTimeStr,
        emoji,
        status: "not_started",
      });

      await createTask({
        title,
        description: input,
        importance,
        urgency,
        dueDate: dueDateStr,
        dueTime: dueTimeStr,
        emoji,
        status: "not_started",
      });

      router.back();
    } catch (error) {
      console.error("Failed to create task:", error);
      const errorMessage = error instanceof Error ? error.message : "Ошибка при создании задачи";
      setError(errorMessage);
      Alert.alert("Ошибка", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          <Text className="text-2xl font-bold text-foreground">Добавить задачу</Text>

          {error && (
            <View className="bg-error/10 border border-error rounded-lg p-3">
              <Text className="text-error text-sm">{error}</Text>
            </View>
          )}

          <View>
            <TextInput
              value={input}
              onChangeText={(text) => {
                setInput(text);
                setError(null);
              }}
              placeholder="Введите описание задачи..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              className="bg-surface border border-border rounded-lg p-3 text-foreground"
            />
          </View>

          <View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm font-semibold text-foreground">Важность</Text>
              <Text className="text-sm font-bold text-primary">{importance}/7</Text>
            </View>
            <Slider
              style={{ height: 40 }}
              minimumValue={1}
              maximumValue={7}
              step={1}
              value={importance}
              onValueChange={setImportance}
              minimumTrackTintColor="#FF6B6B"
              maximumTrackTintColor="#E5E7EB"
            />
          </View>

          <View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm font-semibold text-foreground">Срочность</Text>
              <Text className="text-sm font-bold text-primary">{urgency}/7</Text>
            </View>
            <Slider
              style={{ height: 40 }}
              minimumValue={1}
              maximumValue={7}
              step={1}
              value={urgency}
              onValueChange={setUrgency}
              minimumTrackTintColor="#FFA94D"
              maximumTrackTintColor="#E5E7EB"
            />
          </View>

          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Эмодзи</Text>
            <Pressable
              onPress={() => setShowEmojiPicker(true)}
              className="bg-surface border border-border rounded-lg p-3 flex-row items-center justify-between"
            >
              <Text className="text-foreground">
                {emoji ? `Выбран: ${emoji}` : "Выберите эмодзи"}
              </Text>
              {emoji && <Text className="text-3xl">{emoji}</Text>}
            </Pressable>
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Крайний срок (опционально)</Text>

            <Pressable
              onPress={() => setShowDatePicker(true)}
              className="bg-surface border border-border rounded-lg p-3"
            >
              <Text className="text-foreground">
                {dueDate ? dueDate.toDateString() : "Выберите дату"}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setShowTimePicker(true)}
              className="bg-surface border border-border rounded-lg p-3"
            >
              <Text className="text-foreground">
                {dueTime ? dueTime.toTimeString().substring(0, 5) : "Выберите время"}
              </Text>
            </Pressable>
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

          <View className="flex-row gap-3 mt-4">
            <Pressable
              onPress={() => router.back()}
              className="flex-1 bg-surface border border-border rounded-lg p-3"
            >
              <Text className="text-center text-foreground font-semibold">Отмена</Text>
            </Pressable>

            <Pressable
              onPress={handleAddTask}
              disabled={!input.trim() || loading}
              className="flex-1 bg-primary rounded-lg p-3 disabled:opacity-50"
            >
              <Text className="text-center text-white font-semibold">
                {loading ? "Добавление..." : "Добавить"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
