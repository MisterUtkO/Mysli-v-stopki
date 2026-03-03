import { useState, useEffect, useRef, useMemo } from "react";
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
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useTaskContext } from "@/lib/context/task-context";
import { useI18n } from "@/lib/context/i18n-context";
import { SwipeableTaskCard } from "@/components/swipeable-task-card";
import { syncTaskToCalendar, formatTaskForCalendar } from "@/lib/calendar-sync";
import type { Task, TaskStatus } from "@/lib/domain/types";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const STATUS_ICONS: Record<string, string> = {
  not_started: "○",
  in_progress: "◐",
  completed: "●",
};

/** Check if a task is relevant for "Today" filter */
function isTaskForToday(task: Task): boolean {
  // Tasks with no due date are always shown in Today
  if (!task.dueDate) return true;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return task.dueDate <= todayStr;
}

export default function HomeScreen() {
  const router = useRouter();
  const { tasks, deleteTask, updateTask } = useTaskContext();
  const { t, language } = useI18n();
  const isRu = language === "ru";
  const [search, setSearch] = useState("");
  const [searchVisible, setSearchVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showToday, setShowToday] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const searchInputRef = useRef<TextInput>(null);

  // Compute task counts for each filter
  const taskCounts = useMemo(() => {
    let base = [...tasks];
    if (showToday) {
      base = base.filter(isTaskForToday);
    }
    if (search.trim()) {
      base = base.filter(
        (task) =>
          task.title.toLowerCase().includes(search.toLowerCase()) ||
          task.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    return {
      all: base.length,
      not_started: base.filter((t) => t.status === "not_started").length,
      in_progress: base.filter((t) => t.status === "in_progress").length,
      completed: base.filter((t) => t.status === "completed").length,
      today: tasks.filter(isTaskForToday).length,
    };
  }, [tasks, search, showToday]);

  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];
    if (showToday) {
      filtered = filtered.filter(isTaskForToday);
    }
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
    filtered.sort((a, b) => b.priorityScore - a.priorityScore);
    return filtered;
  }, [tasks, search, selectedStatus, showToday]);

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

  const toggleSearch = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (searchVisible) {
      setSearch("");
      setSearchVisible(false);
    } else {
      setSearchVisible(true);
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  const handleExportToCalendar = async (task: Task) => {
    try {
      const calendarEvent = formatTaskForCalendar(task);
      if (!calendarEvent) {
        Alert.alert(
          isRu ? "Ошибка" : "Error",
          isRu ? "Задача должна иметь дату" : "Task must have a due date"
        );
        return;
      }
      
      const eventId = await syncTaskToCalendar(calendarEvent);
      if (eventId) {
        Alert.alert(
          isRu ? "Успешно" : "Success",
          isRu ? "Задача добавлена в календарь" : "Task added to calendar"
        );
      } else {
        Alert.alert(
          isRu ? "Ошибка" : "Error",
          isRu ? "Не удалось добавить в календарь" : "Failed to add to calendar"
        );
      }
    } catch (error) {
      console.error("Export to calendar error:", error);
      Alert.alert(
        isRu ? "Ошибка" : "Error",
        isRu ? "Ошибка при добавлении в календарь" : "Error adding to calendar"
      );
    }
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
        {/* Header: + button left, title center, search icon right */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          {/* Add task button (top-left) */}
          <Pressable
            onPress={() => router.push("/add-task")}
            style={({ pressed }) => [
              {
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#0a7ea4",
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
            ]}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 24, fontWeight: "700", lineHeight: 28, marginTop: -1 }}>+</Text>
          </Pressable>

          {/* Title */}
          <Text className="text-xl font-bold text-foreground">
            {t.home.title}
          </Text>

          {/* Search icon (top-right) */}
          <Pressable
            onPress={toggleSearch}
            style={({ pressed }) => [
              {
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: searchVisible ? "#0a7ea4" : "transparent",
                borderWidth: searchVisible ? 0 : 1.5,
                borderColor: "#9CA3AF",
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text style={{ fontSize: 18, color: searchVisible ? "#FFFFFF" : "#9CA3AF" }}>🔍</Text>
          </Pressable>
        </View>

        {/* Search field (hidden by default) */}
        {searchVisible && (
          <TextInput
            ref={searchInputRef}
            value={search}
            onChangeText={setSearch}
            placeholder={t.home.search}
            placeholderTextColor="#999"
            returnKeyType="done"
            className="bg-surface border border-border rounded-xl p-3 text-foreground mb-2"
            style={{ fontSize: 15 }}
          />
        )}

        {/* Today toggle */}
        <View style={{ flexDirection: "row", gap: 6, marginBottom: 6 }}>
          <Pressable
            onPress={() => { setShowToday(false); }}
            style={({ pressed }) => [
              {
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 14,
                backgroundColor: !showToday ? "#0a7ea4" : "transparent",
                borderWidth: 1,
                borderColor: !showToday ? "#0a7ea4" : "#9CA3AF",
                opacity: pressed ? 0.7 : 1,
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              },
            ]}
          >
            <Text style={{ fontSize: 13, fontWeight: "700", color: !showToday ? "#FFFFFF" : "#9CA3AF" }}>
              📋 {isRu ? "Все" : "All"}
            </Text>
            <View style={{
              backgroundColor: !showToday ? "rgba(255,255,255,0.3)" : "rgba(156,163,175,0.2)",
              borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1, minWidth: 20, alignItems: "center",
            }}>
              <Text style={{ fontSize: 11, fontWeight: "700", color: !showToday ? "#FFFFFF" : "#9CA3AF" }}>
                {tasks.length}
              </Text>
            </View>
          </Pressable>
          <Pressable
            onPress={() => { setShowToday(true); }}
            style={({ pressed }) => [
              {
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 14,
                backgroundColor: showToday ? "#F59E0B" : "transparent",
                borderWidth: 1,
                borderColor: showToday ? "#F59E0B" : "#9CA3AF",
                opacity: pressed ? 0.7 : 1,
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              },
            ]}
          >
            <Text style={{ fontSize: 13, fontWeight: "700", color: showToday ? "#FFFFFF" : "#9CA3AF" }}>
              ☀️ {t.home.today}
            </Text>
            <View style={{
              backgroundColor: showToday ? "rgba(255,255,255,0.3)" : "rgba(156,163,175,0.2)",
              borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1, minWidth: 20, alignItems: "center",
            }}>
              <Text style={{ fontSize: 11, fontWeight: "700", color: showToday ? "#FFFFFF" : "#9CA3AF" }}>
                {taskCounts.today}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Compact status filters with counts */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8, maxHeight: 36 }}>
          <View style={{ flexDirection: "row", gap: 6 }}>
            <Pressable
              onPress={() => setSelectedStatus(null)}
              style={({ pressed }) => [
                {
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 12,
                  backgroundColor: selectedStatus === null ? "#0a7ea4" : "transparent",
                  borderWidth: 1,
                  borderColor: selectedStatus === null ? "#0a7ea4" : "#9CA3AF",
                  opacity: pressed ? 0.7 : 1,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                },
              ]}
            >
              <Text style={{ fontSize: 12, fontWeight: "600", color: selectedStatus === null ? "#FFFFFF" : "#9CA3AF" }}>
                {isRu ? "Все" : "All"}
              </Text>
              <View style={{
                backgroundColor: selectedStatus === null ? "rgba(255,255,255,0.3)" : "rgba(156,163,175,0.2)",
                borderRadius: 7, paddingHorizontal: 4, paddingVertical: 0, minWidth: 18, alignItems: "center",
              }}>
                <Text style={{ fontSize: 10, fontWeight: "700", color: selectedStatus === null ? "#FFFFFF" : "#9CA3AF" }}>
                  {taskCounts.all}
                </Text>
              </View>
            </Pressable>
            {(["not_started", "in_progress", "completed"] as TaskStatus[]).map((status) => {
              const count = taskCounts[status];
              return (
                <Pressable
                  key={status}
                  onPress={() => setSelectedStatus(selectedStatus === status ? null : status)}
                  style={({ pressed }) => [
                    {
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 12,
                      backgroundColor: selectedStatus === status ? getStatusColor(status) : "transparent",
                      borderWidth: 1,
                      borderColor: selectedStatus === status ? getStatusColor(status) : "#9CA3AF",
                      opacity: pressed ? 0.7 : 1,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 12, fontWeight: "600", color: selectedStatus === status ? "#FFFFFF" : "#9CA3AF" }}>
                    {STATUS_ICONS[status]} {getStatusLabel(status)}
                  </Text>
                  <View style={{
                    backgroundColor: selectedStatus === status ? "rgba(255,255,255,0.3)" : "rgba(156,163,175,0.2)",
                    borderRadius: 7, paddingHorizontal: 4, paddingVertical: 0, minWidth: 18, alignItems: "center",
                  }}>
                    <Text style={{ fontSize: 10, fontWeight: "700", color: selectedStatus === status ? "#FFFFFF" : "#9CA3AF" }}>
                      {count}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Swipe hint */}
        {filteredTasks.length > 0 && (
          <Text style={{ fontSize: 10, color: "#9CA3AF", textAlign: "center", marginBottom: 4 }}>
            {isRu ? "← удалить | изменить статус →" : "← delete | change status →"}
          </Text>
        )}

        {/* Task list */}
        {filteredTasks.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-muted text-center text-lg">{t.home.noTasks}</Text>
          </View>
        ) : (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            {filteredTasks.map((task) => (
              <SwipeableTaskCard
                key={task.id}
                task={task}
                isExpanded={expandedTaskId === task.id}
                isRu={isRu}
                onToggleExpand={toggleExpand}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                onExportToCalendar={handleExportToCalendar}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </ScreenContainer>
  );
}
