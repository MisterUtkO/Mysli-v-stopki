import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Platform,
  LayoutAnimation,
  UIManager,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useTaskContext } from "@/lib/context/task-context";
import { useI18n } from "@/lib/context/i18n-context";
import { SwipeableTaskCard } from "@/components/swipeable-task-card";
import type { Task, TaskStatus } from "@/lib/domain/types";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const STATUS_ICONS: Record<string, string> = {
  not_started: "○",
  in_progress: "◐",
  completed: "●",
};

export default function HomeScreen() {
  const router = useRouter();
  const { tasks, deleteTask, updateTask } = useTaskContext();
  const { t, language } = useI18n();
  const isRu = language === "ru";
  const [search, setSearch] = useState("");
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

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

    // Auto-sort by priority score (highest first = most urgent+important first)
    filtered.sort((a, b) => b.priorityScore - a.priorityScore);

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
      isRu ? "Удалить задачу?" : "Delete task?",
      taskTitle,
      [
        { text: isRu ? "Отмена" : "Cancel", style: "cancel" },
        {
          text: isRu ? "Удалить" : "Delete",
          style: "destructive",
          onPress: () => deleteTask(taskId),
        },
      ]
    );
  };

  const toggleExpand = (taskId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  const getStatusLabel = (status: TaskStatus): string => {
    switch (status) {
      case "not_started": return isRu ? "Не начато" : "Not started";
      case "in_progress": return isRu ? "В процессе" : "In progress";
      case "completed": return isRu ? "Выполнено" : "Completed";
    }
  };

  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case "not_started": return "#9CA3AF";
      case "in_progress": return "#3B82F6";
      case "completed": return "#22C55E";
    }
  };

  return (
    <ScreenContainer className="p-4">
      <View className="flex-1">
        {/* Header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Text className="text-2xl font-bold text-foreground">
            {t.home.title}
          </Text>
        </View>

        {/* Search */}
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={t.home.search}
          placeholderTextColor="#999"
          className="bg-surface border border-border rounded-xl p-3 text-foreground mb-2"
          style={{ fontSize: 15 }}
        />

        {/* Compact status filters */}
        <View style={{ flexDirection: "row", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
          <Pressable
            onPress={() => setSelectedStatus(null)}
            style={({ pressed }) => [
              {
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 14,
                backgroundColor: selectedStatus === null ? "#0a7ea4" : "transparent",
                borderWidth: 1,
                borderColor: selectedStatus === null ? "#0a7ea4" : "#9CA3AF",
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: selectedStatus === null ? "#FFFFFF" : "#9CA3AF",
              }}
            >
              {isRu ? "Все" : "All"}
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
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 14,
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
                    fontSize: 13,
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
        </View>

        {/* Swipe hint */}
        {filteredTasks.length > 0 && (
          <Text style={{ fontSize: 10, color: "#9CA3AF", textAlign: "center", marginBottom: 4 }}>
            {isRu ? "← удалить | изменить статус →" : "← delete | change status →"}
          </Text>
        )}

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
            {filteredTasks.map((task) => (
              <SwipeableTaskCard
                key={task.id}
                task={task}
                isExpanded={expandedTaskId === task.id}
                isRu={isRu}
                onToggleExpand={toggleExpand}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
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
              padding: 14,
              marginTop: 6,
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
            + {t.home.addTask}
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
