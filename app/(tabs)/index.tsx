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
import { ScreenTransition } from "@/components/screen-transition";
import { useTaskContext } from "@/lib/context/task-context";
import { useI18n } from "@/lib/context/i18n-context";
import { SwipeableTaskCard } from "@/components/swipeable-task-card";
import { SwipeHint } from "@/components/swipe-hint";
import { syncTaskToCalendar, formatTaskForCalendar } from "@/lib/calendar-sync";
import type { Task, TaskStatus } from "@/lib/domain/types";
import { useState, useRef, useMemo, useCallback } from "react";

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
  const [searchVisible, setSearchVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const searchInputRef = useRef<TextInput>(null);

  // Filter out deleted tasks from display
  const activeTasks = useMemo(() => tasks.filter((t) => !t.isDeleted), [tasks]);
  const deletedTasksCount = useMemo(() => tasks.filter((t) => t.isDeleted).length, [tasks]);

  // Compute task counts for each filter (only active tasks)
  const taskCounts = useMemo(() => {
    let base = [...activeTasks];
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
    };
  }, [activeTasks, search]);

  const filteredTasks = useMemo(() => {
    let filtered = [...activeTasks];
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
  }, [activeTasks, search, selectedStatus]);

  const handleStatusChange = async (taskId: string, currentStatus: TaskStatus) => {
    const statusCycle: TaskStatus[] = ["not_started", "in_progress", "completed"];
    const currentIndex = statusCycle.indexOf(currentStatus);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
    await updateTask(taskId, { status: nextStatus });
  };

  const handleDelete = (taskId: string, taskTitle: string) => {
    // Direct soft delete (no confirmation) - user can restore from trash
    deleteTask(taskId);
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
      case "not_started": return isRu ? "Начать" : "Start";
      case "in_progress": return isRu ? "В процессе" : "In progress";
      case "completed": return isRu ? "Сделано" : "Done";
    }
  };

  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case "not_started": return "#6B7280";
      case "in_progress": return "#3B82F6";
      case "completed": return "#10B981";
    }
  };

  const getStatusIcon = (status: TaskStatus): string => {
    switch (status) {
      case "not_started": return "○";
      case "in_progress": return "◐";
      case "completed": return "●";
    }
  };

  return (
    <ScreenTransition>
      <ScreenContainer className="p-4">
      <View className="flex-1">
        {/* Header: + button left, title center, search + trash icons right */}
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
                opacity: pressed ? 0.6 : 1,
              },
            ]}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 24, fontWeight: "700", lineHeight: 28, marginTop: -1 }}>+</Text>
          </Pressable>

          {/* Title */}
          <Text className="text-xl font-bold text-foreground">
            {t.home.title}
          </Text>

          {/* Right icons container */}
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            {/* Search icon */}
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
                  opacity: pressed ? 0.6 : 1,
                },
              ]}
            >
              <Text style={{ fontSize: 18, color: searchVisible ? "#FFFFFF" : "#9CA3AF" }}>🔍</Text>
            </Pressable>

            {/* Trash icon */}
            <Pressable
              onPress={() => router.push("/trash")}
              style={({ pressed }) => [
                {
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: deletedTasksCount > 0 ? "#EF4444" : "transparent",
                  borderWidth: deletedTasksCount > 0 ? 0 : 1.5,
                  borderColor: "#9CA3AF",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.6 : 1,
                },
              ]}
            >
              <Text style={{ fontSize: 18 }}>🗑️</Text>
            </Pressable>
          </View>
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

        {/* Compact status filter tabs */}
        <View style={{ marginBottom: 8, height: 40, alignItems: "center" }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 6, paddingRight: 8, paddingLeft: 0, height: 40, alignItems: "center", justifyContent: "flex-start" }}>
            {/* All filter */}
            <Pressable
              onPress={() => setSelectedStatus(null)}
              style={({ pressed }) => [
                {
                  paddingHorizontal: 10,
                  paddingVertical: 0,
                  borderRadius: 12,
                  backgroundColor: selectedStatus === null ? "#0a7ea4" : "transparent",
                  borderWidth: 1,
                  borderColor: selectedStatus === null ? "#0a7ea4" : "#D1D5DB",
                  opacity: pressed ? 0.6 : 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  minWidth: 50,
                  height: 28,
                },
              ]}
            >
              <Text style={{ fontSize: 12, fontWeight: "600", color: selectedStatus === null ? "#FFFFFF" : "#6B7280" }}>
                {isRu ? "Все" : "All"}
              </Text>
              <View style={{
                backgroundColor: selectedStatus === null ? "rgba(255,255,255,0.3)" : "rgba(107,114,128,0.2)",
                borderRadius: 6, paddingHorizontal: 4, paddingVertical: 1, minWidth: 16, alignItems: "center",
              }}>
                <Text style={{ fontSize: 10, fontWeight: "700", color: selectedStatus === null ? "#FFFFFF" : "#6B7280" }}>
                  {taskCounts.all}
                </Text>
              </View>
            </Pressable>

            {/* Status filters */}
            {(["not_started", "in_progress", "completed"] as TaskStatus[]).map((status) => {
              const count = taskCounts[status];
              const color = getStatusColor(status);
              const icon = getStatusIcon(status);
              return (
                <Pressable
                  key={status}
                  onPress={() => setSelectedStatus(selectedStatus === status ? null : status)}
                  style={({ pressed }) => [
                    {
                      paddingHorizontal: 10,
                      paddingVertical: 0,
                      borderRadius: 12,
                      backgroundColor: selectedStatus === status ? color : "transparent",
                      borderWidth: 1,
                      borderColor: selectedStatus === status ? color : "#D1D5DB",
                      opacity: pressed ? 0.6 : 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 3,
                      minWidth: 65,
                      height: 28,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 13, fontWeight: "600", color: selectedStatus === status ? "#FFFFFF" : color }}>
                    {icon}
                  </Text>
                  <Text style={{ fontSize: 11, fontWeight: "600", color: selectedStatus === status ? "#FFFFFF" : color }}>
                    {getStatusLabel(status)}
                  </Text>
                  <View style={{
                    backgroundColor: selectedStatus === status ? "rgba(255,255,255,0.3)" : "rgba(107,114,128,0.2)",
                    borderRadius: 6, paddingHorizontal: 3, paddingVertical: 1, minWidth: 14, alignItems: "center",
                  }}>
                    <Text style={{ fontSize: 9, fontWeight: "700", color: selectedStatus === status ? "#FFFFFF" : color }}>
                      {count}
                    </Text>
                  </View>
                </Pressable>
              );
            })}


            </View>
          </ScrollView>
        </View>

        {/* Task list */}
        {filteredTasks.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text className="text-muted text-center text-lg">
              {selectedStatus === "completed" 
                ? (isRu ? "Нет выполненных задач" : "No completed tasks")
                : selectedStatus === "in_progress"
                ? (isRu ? "Нет задач в процессе выполнения" : "No tasks in progress")
                : (isRu ? "Нет задач. Создайте первую!" : "No tasks yet. Create your first!")}
            </Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <SwipeHint isRu={isRu} hasTask={filteredTasks.length > 0} />
            <View style={{ gap: 8, paddingBottom: 16, paddingTop: 8 }}>
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
            </View>
          </ScrollView>
        )}
      </View>
      </ScreenContainer>
    </ScreenTransition>
  );
}
