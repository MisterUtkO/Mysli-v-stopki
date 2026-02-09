import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useTaskContext } from "@/lib/context/task-context";
import { useI18n } from "@/lib/context/i18n-context";
import type { Task, TaskStatus } from "@/lib/domain/types";
import { updateTaskOrder } from "@/lib/database/db";

const QUADRANT_BG: Record<string, string> = {
  Q1: "#FF6B6B",
  Q2: "#FFA94D",
  Q3: "#74C0FC",
  Q4: "#51CF66",
};

const STATUS_ICONS: Record<string, string> = {
  not_started: "○",
  in_progress: "◐",
  completed: "●",
};

export default function HomeScreen() {
  const router = useRouter();
  const { tasks, deleteTask, updateTask } = useTaskContext();
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    let filtered = [...tasks];

    if (search.trim()) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(search.toLowerCase()) ||
          task.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter((task) => task.status === selectedStatus);
    }

    // Sort by sortOrder first, then by priority
    filtered.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return b.priorityScore - a.priorityScore;
    });

    setFilteredTasks(filtered);
  }, [tasks, search, selectedStatus]);

  const handleStatusChange = async (taskId: string, currentStatus: TaskStatus) => {
    const statusCycle: TaskStatus[] = ["not_started", "in_progress", "completed"];
    const currentIndex = statusCycle.indexOf(currentStatus);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
    await updateTask(taskId, { status: nextStatus });
  };

  const handleDelete = (taskId: string, taskTitle: string) => {
    Alert.alert(
      t.home.deleteConfirm || "Удалить задачу?",
      taskTitle,
      [
        { text: t.common.cancel || "Отмена", style: "cancel" },
        {
          text: t.home.delete || "Удалить",
          style: "destructive",
          onPress: () => deleteTask(taskId),
        },
      ]
    );
  };

  const moveTask = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= filteredTasks.length) return;

    const updatedTasks = [...filteredTasks];
    const [moved] = updatedTasks.splice(index, 1);
    updatedTasks.splice(newIndex, 0, moved);

    // Update sort orders
    const orders = updatedTasks.map((task, i) => ({
      id: task.id,
      sortOrder: i + 1,
    }));

    await updateTaskOrder(orders);

    // Update each task's sortOrder in context
    for (const order of orders) {
      await updateTask(order.id, { sortOrder: order.sortOrder });
    }
  };

  const getStatusLabel = (status: TaskStatus): string => {
    switch (status) {
      case "not_started":
        return t.home.notStarted || "Не начато";
      case "in_progress":
        return t.home.inProgress || "В процессе";
      case "completed":
        return t.home.completed || "Выполнено";
    }
  };

  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case "not_started":
        return "#9CA3AF";
      case "in_progress":
        return "#3B82F6";
      case "completed":
        return "#22C55E";
    }
  };

  return (
    <ScreenContainer className="p-4">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-foreground">
            {t.home.title}
          </Text>
          <Pressable
            onPress={() => setEditMode(!editMode)}
            style={({ pressed }) => [
              {
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: editMode ? "#3B82F6" : "transparent",
                borderWidth: 1,
                borderColor: editMode ? "#3B82F6" : "#9CA3AF",
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: editMode ? "#FFFFFF" : "#9CA3AF",
              }}
            >
              {editMode ? "✓" : "↕"}
            </Text>
          </Pressable>
        </View>

        {/* Search */}
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={t.home.search}
          placeholderTextColor="#999"
          className="bg-surface border border-border rounded-xl p-3.5 text-foreground mb-3"
          style={{ fontSize: 16 }}
        />

        {/* Status filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-3"
          contentContainerStyle={{ gap: 8 }}
        >
          <Pressable
            onPress={() => setSelectedStatus(null)}
            style={({ pressed }) => [
              {
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: selectedStatus === null ? "#0a7ea4" : "transparent",
                borderWidth: 1,
                borderColor: selectedStatus === null ? "#0a7ea4" : "#9CA3AF",
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: selectedStatus === null ? "#FFFFFF" : "#9CA3AF",
              }}
            >
              {t.home.all || "Все"}
            </Text>
          </Pressable>
          {(["not_started", "in_progress", "completed"] as TaskStatus[]).map(
            (status) => (
              <Pressable
                key={status}
                onPress={() =>
                  setSelectedStatus(selectedStatus === status ? null : status)
                }
                style={({ pressed }) => [
                  {
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor:
                      selectedStatus === status
                        ? getStatusColor(status)
                        : "transparent",
                    borderWidth: 1,
                    borderColor:
                      selectedStatus === status
                        ? getStatusColor(status)
                        : "#9CA3AF",
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color:
                      selectedStatus === status ? "#FFFFFF" : "#9CA3AF",
                  }}
                >
                  {STATUS_ICONS[status]} {getStatusLabel(status)}
                </Text>
              </Pressable>
            )
          )}
        </ScrollView>

        {/* Task list */}
        {filteredTasks.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-muted text-center text-lg">
              {t.home.noTasks}
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 80 }}
          >
            {filteredTasks.map((task, index) => (
              <View key={task.id} className="mb-3">
                <Pressable
                  onPress={() => router.push(`/task-detail/${task.id}`)}
                  onLongPress={() => handleDelete(task.id, task.title)}
                  style={({ pressed }) => [
                    {
                      backgroundColor: pressed ? "rgba(0,0,0,0.05)" : "transparent",
                      borderRadius: 16,
                    },
                  ]}
                >
                  <View
                    style={{
                      borderLeftWidth: 5,
                      borderLeftColor: QUADRANT_BG[task.quadrant],
                      borderRadius: 16,
                      overflow: "hidden",
                    }}
                    className="bg-surface border border-border rounded-2xl"
                  >
                    <View className="p-4">
                      {/* Top row: emoji + title + quadrant */}
                      <View className="flex-row items-start justify-between mb-2">
                        <View className="flex-row items-center flex-1 mr-2">
                          {task.emoji && (
                            <Text style={{ fontSize: 24, marginRight: 8 }}>
                              {task.emoji}
                            </Text>
                          )}
                          <Text
                            className="text-foreground font-bold flex-1"
                            style={{
                              fontSize: 17,
                              lineHeight: 22,
                              textDecorationLine:
                                task.status === "completed"
                                  ? "line-through"
                                  : "none",
                              opacity: task.status === "completed" ? 0.6 : 1,
                            }}
                            numberOfLines={2}
                          >
                            {task.title}
                          </Text>
                        </View>

                        <View
                          style={{
                            backgroundColor: QUADRANT_BG[task.quadrant],
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 8,
                          }}
                        >
                          <Text
                            style={{
                              color: "#FFFFFF",
                              fontSize: 12,
                              fontWeight: "700",
                            }}
                          >
                            {task.quadrant}
                          </Text>
                        </View>
                      </View>

                      {/* Description */}
                      {task.description && task.description !== task.title && (
                        <Text
                          className="text-muted mb-2"
                          style={{ fontSize: 14, lineHeight: 20 }}
                          numberOfLines={2}
                        >
                          {task.description}
                        </Text>
                      )}

                      {/* Bottom row: status + metrics + due date */}
                      <View className="flex-row items-center justify-between mt-1">
                        <Pressable
                          onPress={() =>
                            handleStatusChange(task.id, task.status)
                          }
                          style={({ pressed }) => [
                            {
                              flexDirection: "row",
                              alignItems: "center",
                              backgroundColor: getStatusColor(task.status) + "20",
                              paddingHorizontal: 10,
                              paddingVertical: 5,
                              borderRadius: 12,
                              opacity: pressed ? 0.7 : 1,
                            },
                          ]}
                        >
                          <Text
                            style={{
                              color: getStatusColor(task.status),
                              fontSize: 13,
                              fontWeight: "600",
                            }}
                          >
                            {STATUS_ICONS[task.status]}{" "}
                            {getStatusLabel(task.status)}
                          </Text>
                        </Pressable>

                        <View className="flex-row items-center gap-3">
                          <Text className="text-muted" style={{ fontSize: 12 }}>
                            ⚡{task.importance}/7 🔥{task.urgency}/7
                          </Text>
                          {task.dueDate && (
                            <Text
                              className="text-muted"
                              style={{ fontSize: 12 }}
                            >
                              📅 {task.dueDate}
                              {task.dueTime ? ` ${task.dueTime}` : ""}
                            </Text>
                          )}
                        </View>
                      </View>

                      {/* Edit mode: reorder buttons */}
                      {editMode && (
                        <View className="flex-row justify-end gap-2 mt-3 pt-3 border-t border-border">
                          <Pressable
                            onPress={() => moveTask(index, "up")}
                            style={({ pressed }) => [
                              {
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                                borderRadius: 8,
                                backgroundColor:
                                  index === 0 ? "#E5E7EB" : "#3B82F6",
                                opacity: pressed ? 0.7 : 1,
                              },
                            ]}
                            disabled={index === 0}
                          >
                            <Text
                              style={{
                                color: index === 0 ? "#9CA3AF" : "#FFFFFF",
                                fontSize: 16,
                                fontWeight: "700",
                              }}
                            >
                              ↑
                            </Text>
                          </Pressable>
                          <Pressable
                            onPress={() => moveTask(index, "down")}
                            style={({ pressed }) => [
                              {
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                                borderRadius: 8,
                                backgroundColor:
                                  index === filteredTasks.length - 1
                                    ? "#E5E7EB"
                                    : "#3B82F6",
                                opacity: pressed ? 0.7 : 1,
                              },
                            ]}
                            disabled={index === filteredTasks.length - 1}
                          >
                            <Text
                              style={{
                                color:
                                  index === filteredTasks.length - 1
                                    ? "#9CA3AF"
                                    : "#FFFFFF",
                                fontSize: 16,
                                fontWeight: "700",
                              }}
                            >
                              ↓
                            </Text>
                          </Pressable>
                          <Pressable
                            onPress={() => handleDelete(task.id, task.title)}
                            style={({ pressed }) => [
                              {
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                                borderRadius: 8,
                                backgroundColor: "#EF4444",
                                opacity: pressed ? 0.7 : 1,
                              },
                            ]}
                          >
                            <Text
                              style={{
                                color: "#FFFFFF",
                                fontSize: 16,
                                fontWeight: "700",
                              }}
                            >
                              ✕
                            </Text>
                          </Pressable>
                        </View>
                      )}
                    </View>
                  </View>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Add task button */}
        <Pressable
          onPress={() => router.push("/add-task")}
          style={({ pressed }) => [
            {
              backgroundColor: "#0a7ea4",
              borderRadius: 16,
              padding: 16,
              marginTop: 8,
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
              fontSize: 18,
            }}
          >
            + {t.home.addTask}
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
