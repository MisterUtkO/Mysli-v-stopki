import { useState, useEffect, useCallback } from "react";
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
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useTaskContext } from "@/lib/context/task-context";
import { useI18n } from "@/lib/context/i18n-context";
import type { Task, TaskStatus } from "@/lib/domain/types";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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

  const toggleExpand = (taskId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  const getStatusLabel = (status: TaskStatus): string => {
    switch (status) {
      case "not_started":
        return isRu ? "Не начато" : "Not started";
      case "in_progress":
        return isRu ? "В процессе" : "In progress";
      case "completed":
        return isRu ? "Выполнено" : "Completed";
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

  const getNotifFreqLabel = (freq?: string): string => {
    if (!freq || freq === "global") return isRu ? "По умолч." : "Default";
    switch (freq) {
      case "never": return isRu ? "Никогда" : "Never";
      case "10min": return isRu ? "10 мин" : "10 min";
      case "30min": return isRu ? "30 мин" : "30 min";
      case "hourly": return isRu ? "Час" : "Hourly";
      case "daily": return isRu ? "День" : "Daily";
      case "weekly": return isRu ? "Неделя" : "Weekly";
      default: return freq;
    }
  };

  return (
    <ScreenContainer className="p-4">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-3">
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

        {/* Compact status filters - single row of small pills */}
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
            {filteredTasks.map((task) => {
              const isExpanded = expandedTaskId === task.id;
              const hasAttachments = task.attachments && task.attachments.length > 0;

              return (
                <View key={task.id} className="mb-2">
                  <Pressable
                    onPress={() => toggleExpand(task.id)}
                    onLongPress={() => handleDelete(task.id, task.title)}
                    style={({ pressed }) => [
                      {
                        opacity: pressed ? 0.9 : 1,
                        borderRadius: 14,
                      },
                    ]}
                  >
                    <View
                      style={{
                        borderLeftWidth: 4,
                        borderLeftColor: QUADRANT_BG[task.quadrant],
                        borderRadius: 14,
                        overflow: "hidden",
                      }}
                      className="bg-surface border border-border rounded-2xl"
                    >
                      {/* COLLAPSED VIEW: emoji + title + quadrant badge + status */}
                      <View style={{ paddingHorizontal: 12, paddingVertical: 10 }}>
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center flex-1 mr-2">
                            {/* Status dot */}
                            <Pressable
                              onPress={() => handleStatusChange(task.id, task.status)}
                              style={({ pressed }) => [
                                {
                                  marginRight: 8,
                                  opacity: pressed ? 0.5 : 1,
                                },
                              ]}
                            >
                              <Text
                                style={{
                                  fontSize: 16,
                                  color: getStatusColor(task.status),
                                }}
                              >
                                {STATUS_ICONS[task.status]}
                              </Text>
                            </Pressable>

                            {/* Emoji */}
                            {task.emoji && (
                              <Text style={{ fontSize: 18, marginRight: 6 }}>
                                {task.emoji}
                              </Text>
                            )}

                            {/* Title */}
                            <Text
                              className="text-foreground font-semibold flex-1"
                              style={{
                                fontSize: 15,
                                lineHeight: 20,
                                textDecorationLine:
                                  task.status === "completed"
                                    ? "line-through"
                                    : "none",
                                opacity: task.status === "completed" ? 0.5 : 1,
                              }}
                              numberOfLines={1}
                            >
                              {task.title}
                            </Text>
                          </View>

                          {/* Right side: metrics + quadrant badge */}
                          <View className="flex-row items-center gap-1">
                            <Text style={{ fontSize: 10, color: "#9CA3AF" }}>
                              ⚡{task.importance} 🔥{task.urgency}
                            </Text>
                            <View
                              style={{
                                backgroundColor: QUADRANT_BG[task.quadrant],
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                                borderRadius: 6,
                                marginLeft: 4,
                              }}
                            >
                              <Text
                                style={{
                                  color: "#FFFFFF",
                                  fontSize: 10,
                                  fontWeight: "700",
                                }}
                              >
                                {task.quadrant}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>

                      {/* EXPANDED VIEW */}
                      {isExpanded && (
                        <View
                          style={{
                            paddingHorizontal: 12,
                            paddingBottom: 12,
                            borderTopWidth: 1,
                            borderTopColor: "rgba(128,128,128,0.15)",
                          }}
                        >
                          {/* Description */}
                          {task.description && task.description !== task.title && (
                            <Text
                              className="text-muted"
                              style={{ fontSize: 13, lineHeight: 18, marginTop: 8 }}
                              numberOfLines={4}
                            >
                              {task.description}
                            </Text>
                          )}

                          {/* Metrics row */}
                          <View className="flex-row items-center gap-3 mt-2">
                            <Text style={{ fontSize: 12, color: "#FF6B6B" }}>
                              {isRu ? "Важность" : "Imp"}: {task.importance}/7
                            </Text>
                            <Text style={{ fontSize: 12, color: "#FFA94D" }}>
                              {isRu ? "Срочность" : "Urg"}: {task.urgency}/7
                            </Text>
                            {task.dueDate && (
                              <Text style={{ fontSize: 12, color: "#9CA3AF" }}>
                                📅 {task.dueDate}
                                {task.dueTime ? ` ${task.dueTime}` : ""}
                              </Text>
                            )}
                          </View>

                          {/* Notification frequency if custom */}
                          {task.notificationFrequency && task.notificationFrequency !== "global" && (
                            <View className="flex-row items-center mt-2">
                              <Text style={{ fontSize: 11, color: "#0a7ea4" }}>
                                🔔 {getNotifFreqLabel(task.notificationFrequency)}
                              </Text>
                            </View>
                          )}

                          {/* File attachments preview */}
                          {hasAttachments && (
                            <View className="flex-row flex-wrap gap-2 mt-2">
                              {task.attachments!.map((att, idx) => (
                                <View
                                  key={idx}
                                  style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 8,
                                    backgroundColor: "rgba(128,128,128,0.15)",
                                    overflow: "hidden",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  {att.type === "image" ? (
                                    <Image
                                      source={{ uri: att.uri }}
                                      style={{ width: 48, height: 48 }}
                                      resizeMode="cover"
                                    />
                                  ) : (
                                    <Text style={{ fontSize: 20 }}>📎</Text>
                                  )}
                                </View>
                              ))}
                            </View>
                          )}

                          {/* Status + Edit button row */}
                          <View className="flex-row items-center justify-between mt-3">
                            {/* Status badge */}
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
                                  paddingVertical: 4,
                                  borderRadius: 10,
                                  opacity: pressed ? 0.7 : 1,
                                },
                              ]}
                            >
                              <Text
                                style={{
                                  color: getStatusColor(task.status),
                                  fontSize: 12,
                                  fontWeight: "600",
                                }}
                              >
                                {STATUS_ICONS[task.status]}{" "}
                                {getStatusLabel(task.status)}
                              </Text>
                            </Pressable>

                            {/* Three-dot menu → Edit */}
                            <Pressable
                              onPress={() =>
                                router.push(`/task-detail/${task.id}`)
                              }
                              style={({ pressed }) => [
                                {
                                  paddingHorizontal: 12,
                                  paddingVertical: 6,
                                  borderRadius: 8,
                                  opacity: pressed ? 0.5 : 1,
                                },
                              ]}
                            >
                              <Text
                                style={{
                                  fontSize: 20,
                                  fontWeight: "700",
                                  color: "#9CA3AF",
                                  letterSpacing: 2,
                                }}
                              >
                                ⋮
                              </Text>
                            </Pressable>
                          </View>
                        </View>
                      )}
                    </View>
                  </Pressable>
                </View>
              );
            })}
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
