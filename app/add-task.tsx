import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Modal } from "react-native";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ScreenContainer } from "@/components/screen-container";
import { useTaskContext } from "@/lib/context/task-context";
import { useI18n } from "@/lib/context/i18n-context";
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

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
    if (!input.trim()) return;

    setLoading(true);
    try {
      const title = input.substring(0, 50);
      const dueDateStr = dueDate ? dueDate.toISOString().split("T")[0] : undefined;
      const dueTimeStr = dueTime ? dueTime.toTimeString().substring(0, 5) : undefined;

      await createTask({
        title,
        description: input,
        importance,
        urgency,
        dueDate: dueDateStr,
        dueTime: dueTimeStr,
        status: "not_started",
      });

      router.back();
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Title */}
          <Text className="text-2xl font-bold text-foreground">Add Task</Text>

          {/* Input */}
          <View>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Enter task description..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              className="bg-surface border border-border rounded-lg p-3 text-foreground"
            />
          </View>

          {/* Importance Slider */}
          <View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm font-semibold text-foreground">Importance</Text>
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

          {/* Urgency Slider */}
          <View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm font-semibold text-foreground">Urgency</Text>
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

          {/* Date/Time Section */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Deadline (Optional)</Text>

            {/* Date Button */}
            <Pressable
              onPress={() => setShowDatePicker(true)}
              className="bg-surface border border-border rounded-lg p-3"
            >
              <Text className="text-foreground">
                {dueDate ? dueDate.toDateString() : "Select date"}
              </Text>
            </Pressable>

            {/* Time Button */}
            <Pressable
              onPress={() => setShowTimePicker(true)}
              className="bg-surface border border-border rounded-lg p-3"
            >
              <Text className="text-foreground">
                {dueTime ? dueTime.toTimeString().substring(0, 5) : "Select time"}
              </Text>
            </Pressable>
          </View>

          {/* Date/Time Pickers */}
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

          {/* Buttons */}
          <View className="flex-row gap-3 mt-4">
            <Pressable
              onPress={() => router.back()}
              className="flex-1 bg-surface border border-border rounded-lg p-3"
            >
              <Text className="text-center text-foreground font-semibold">Cancel</Text>
            </Pressable>

            <Pressable
              onPress={handleAddTask}
              disabled={!input.trim() || loading}
              className="flex-1 bg-primary rounded-lg p-3 disabled:opacity-50"
            >
              <Text className="text-center text-white font-semibold">
                {loading ? "Adding..." : "Add Task"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
