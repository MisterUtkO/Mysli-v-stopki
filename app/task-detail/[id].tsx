import { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Slider from "@react-native-community/slider";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ScreenContainer } from "@/components/screen-container";
import { useTaskContext } from "@/lib/context/task-context";
import type { Task } from "@/lib/domain/types";

export default function TaskDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, updateTask } = useTaskContext();

  const [task, setTask] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [importance, setImportance] = useState(4);
  const [urgency, setUrgency] = useState(4);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [dueTime, setDueTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const foundTask = tasks.find((t) => t.id === id);
      if (foundTask) {
        setTask(foundTask);
        setTitle(foundTask.title);
        setDescription(foundTask.description);
        setImportance(foundTask.importance);
        setUrgency(foundTask.urgency);
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

  const handleSave = async () => {
    if (!task) return;

    setLoading(true);
    try {
      const dueDateStr = dueDate ? dueDate.toISOString().split("T")[0] : undefined;
      const dueTimeStr = dueTime ? dueTime.toTimeString().substring(0, 5) : undefined;

      await updateTask(task.id, {
        title,
        description,
        importance,
        urgency,
        dueDate: dueDateStr,
        dueTime: dueTimeStr,
      });

      router.back();
    } catch (error) {
      console.error("Failed to update task:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!task) {
    return (
      <ScreenContainer className="p-4 justify-center items-center">
        <Text className="text-foreground">Loading...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          <Text className="text-2xl font-bold text-foreground">Edit Task</Text>

          <View>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Task title..."
              placeholderTextColor="#999"
              className="bg-surface border border-border rounded-lg p-3 text-foreground font-semibold"
            />
          </View>

          <View>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Task description..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              className="bg-surface border border-border rounded-lg p-3 text-foreground"
            />
          </View>

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

          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Deadline</Text>

            <Pressable
              onPress={() => setShowDatePicker(true)}
              className="bg-surface border border-border rounded-lg p-3"
            >
              <Text className="text-foreground">
                {dueDate ? dueDate.toDateString() : "Select date"}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setShowTimePicker(true)}
              className="bg-surface border border-border rounded-lg p-3"
            >
              <Text className="text-foreground">
                {dueTime ? dueTime.toTimeString().substring(0, 5) : "Select time"}
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

          <View className="flex-row gap-3 mt-4">
            <Pressable
              onPress={() => router.back()}
              className="flex-1 bg-surface border border-border rounded-lg p-3"
            >
              <Text className="text-center text-foreground font-semibold">Cancel</Text>
            </Pressable>

            <Pressable
              onPress={handleSave}
              disabled={loading}
              className="flex-1 bg-primary rounded-lg p-3 disabled:opacity-50"
            >
              <Text className="text-center text-white font-semibold">
                {loading ? "Saving..." : "Save"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
