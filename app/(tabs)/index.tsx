import { View, Text, FlatList, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useTaskContext } from "@/lib/context/task-context";
import { QUADRANT_COLORS } from "@/lib/domain/types";
import type { Task, TaskStatus } from "@/lib/domain/types";

export default function HomeScreen() {
  const router = useRouter();
  const { tasks, deleteTask, updateTask } = useTaskContext();

  const handleStatusChange = async (task: Task) => {
    const statuses: TaskStatus[] = ["not_started", "in_progress", "completed"];
    const currentIndex = statuses.indexOf(task.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];

    await updateTask(task.id, { status: nextStatus });
  };

  const handleDelete = (task: Task) => {
    Alert.alert("Delete Task", "Are you sure?", [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Delete",
        onPress: async () => {
          await deleteTask(task.id);
        },
        style: "destructive",
      },
    ]);
  };

  const renderTask = ({ item: task }: { item: Task }) => {
    const colors = QUADRANT_COLORS[task.quadrant];
    const statusLabels = {
      not_started: "Not Started",
      in_progress: "In Progress",
      completed: "Completed",
    };

    return (
      <Pressable
        onPress={() => router.push(`/task-detail/${task.id}`)}
        className="mb-3 rounded-lg p-4 border"
        style={{
          backgroundColor: colors.background,
          borderColor: colors.border,
        }}
      >
        <View className="gap-2">
          {/* Title and Status */}
          <View className="flex-row justify-between items-start">
            <Text className="flex-1 text-lg font-bold" style={{ color: colors.text }}>
              {task.title}
            </Text>
            <Text className="text-xs font-semibold ml-2" style={{ color: colors.text }}>
              {colors.label}
            </Text>
          </View>

          {/* Metrics */}
          <View className="flex-row gap-4">
            <Text className="text-sm" style={{ color: colors.text }}>
              Importance: {task.importance}/7
            </Text>
            <Text className="text-sm" style={{ color: colors.text }}>
              Urgency: {task.urgency}/7
            </Text>
          </View>

          {/* Due Date */}
          {task.dueDate && (
            <Text className="text-xs" style={{ color: colors.text }}>
              Due: {task.dueDate}
              {task.dueTime && ` at ${task.dueTime}`}
            </Text>
          )}

          {/* Status and Actions */}
          <View className="flex-row justify-between items-center mt-2">
            <Pressable
              onPress={() => handleStatusChange(task)}
              className="flex-1 bg-black/20 rounded px-3 py-2 mr-2"
            >
              <Text className="text-xs font-semibold text-center" style={{ color: colors.text }}>
                {statusLabels[task.status]}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleDelete(task)}
              className="bg-black/20 rounded px-3 py-2"
            >
              <Text className="text-xs font-semibold" style={{ color: colors.text }}>
                Delete
              </Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <ScreenContainer className="p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-bold text-foreground">Tasks</Text>
        <Pressable
          onPress={() => router.push("/add-task")}
          className="bg-primary rounded-lg px-4 py-2"
        >
          <Text className="text-white font-semibold">+ Add</Text>
        </Pressable>
      </View>

      {tasks.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-muted text-center">No tasks yet. Add one to get started!</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      )}
    </ScreenContainer>
  );
}
