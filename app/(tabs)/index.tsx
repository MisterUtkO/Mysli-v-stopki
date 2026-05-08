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
import { useFocusEffect } from "expo-router";
import { ScreenContainer } from "@/components/common/screen-container";
import { ScreenTransition } from "@/components/animations/screen-transition";
import { useTaskContext } from "@/lib/context/task-context";
import { useI18n } from "@/lib/context/i18n-context";
import { SwipeableTaskCard } from "@/components/task/swipeable-task-card";
import { SwipeHint } from "@/components/swipe-hint";
import { TaskDetailModal } from "@/components/task/task-detail-modal";
import {
  syncTaskToCalendar,
  formatTaskForCalendar,
} from "@/lib/integrations/calendar/calendar-sync";
import type { Task, TaskStatus } from "@/lib/domain/types";
import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KANBAN_STORAGE_KEY } from "@/lib/integrations/kanban/kanban-sync";

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
  const { tasks, deleteTask, updateTask, refreshTasks } = useTaskContext();
  const { t, language } = useI18n();
  const isRu = language === "ru";

  const [search, setSearch] = useState("");
  const [searchVisible, setSearchVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] =
    useState<Task | null>(null);

  const searchInputRef = useRef<TextInput>(null);

  // Обновляем задачи при переключении на вкладку (задача #1)
  useFocusEffect(
    useCallback(() => {
      refreshTasks();
    }, [refreshTasks])
  );

  // Filter out deleted tasks from display
  const activeTasks = useMemo(() => tasks.filter((t) => !t.isDeleted), [tasks]);
  const deletedTasksCount = useMemo(
    () => tasks.filter((t) => t.isDeleted).length,
    [tasks]
  );

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

  const handleStatusChange = async (
    taskId: string,
    currentStatus: TaskStatus
  ) => {
    const statusCycle: TaskStatus[] = [
      "not_started",
      "in_progress",
      "completed",
    ];
    const currentIndex = statusCycle.indexOf(currentStatus);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
    await updateTask(taskId, { status: nextStatus });
  };

  const handleDelete = (taskId: string, taskTitle: string) => {
    deleteTask(taskId);
  };

  // Задача #2: только открываем модал, аккордеон в карточке не раскрываем
  const openTaskDetail = useCallback((taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setSelectedTaskForDetail(task);
    }
  }, [tasks]);

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
        isRu
          ? "Ошибка при добавлении в календарь"
          : "Error adding to calendar"
      );
    }
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
        return "#6B7280";
      case "in_progress":
        return "#3B82F6";
      case "completed":
        return "#10B981";
    }
  };

  const getStatusIcon = (status: TaskStatus): string => {
    switch (status) {
      case "not_started":
        return "○";
      case "in_progress":
        return "◐";
      case "completed":
        return "●";
    }
  };

  return (
    <ScreenContainer>
      <ScreenTransition>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 12,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "700", color: "#1F2937" }}>
            {t.home.title}
          </Text>

          <View style={{ flexDirection: "row", gap: 12 }}>
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
              <Text style={{ fontSize: 18 }}>🔍</Text>
            </Pressable>

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
              <Text style={{ fontSize: 18, color: deletedTasksCount > 0 ? "#FFFFFF" : "#9CA3AF" }}>🗑️</Text>
              {deletedTasksCount > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    backgroundColor: "#FEE2E2",
                    borderRadius: 10,
                    paddingHorizontal: 5,
                    paddingVertical: 1,
                    minWidth: 20,
                  }}
                >
                  <Text style={{ fontSize: 10, color: "#EF4444", fontWeight: "700" }}>
                    {deletedTasksCount}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {/* Задача #3: поисковая строка с явным белым фоном и чёрным текстом */}
        {searchVisible && (
          <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
            <TextInput
              ref={searchInputRef}
              style={{
                fontSize: 15,
                backgroundColor: "#FFFFFF",
                color: "#000000",
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderWidth: 1,
                borderColor: "#E5E7EB",
              }}
              placeholder={isRu ? "Поиск задач..." : "Search tasks..."}
              placeholderTextColor="#999"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        )}

        {/* Status filter tabs */}
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            paddingHorizontal: 16,
            marginBottom: 16,
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
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
                width: "48%",
                height: 56,
              },
            ]}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: selectedStatus === null ? "#FFFFFF" : "#6B7280",
              }}
            >
              {isRu ? "Все" : "All"}
            </Text>
            <View
              style={{
                paddingHorizontal: 6,
                paddingVertical: 1,
                borderRadius: 8,
                backgroundColor:
                  selectedStatus === null ? "#FFFFFF20" : "#F3F4F6",
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  color: selectedStatus === null ? "#FFFFFF" : "#6B7280",
                }}
              >
                {taskCounts.all}
              </Text>
            </View>
          </Pressable>

          {(["not_started", "in_progress", "completed"] as TaskStatus[]).map((status) => {
            const count = taskCounts[status];
            const color = getStatusColor(status);
            const icon = getStatusIcon(status);
            return (
              <Pressable
                key={status}
                onPress={() =>
                  setSelectedStatus(selectedStatus === status ? null : status)
                }
                style={({ pressed }) => [
                  {
                    paddingHorizontal: 10,
                    paddingVertical: 0,
                    borderRadius: 12,
                    backgroundColor:
                      selectedStatus === status ? color : "transparent",
                    borderWidth: 1,
                    borderColor:
                      selectedStatus === status ? color : "#D1D5DB",
                    opacity: pressed ? 0.6 : 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 3,
                width: "48%",
                height: 56,
              },
            ]}
          >
            <Text
              style={{
                fontSize: 14,
                color: selectedStatus === status ? "#FFFFFF" : color,
              }}
            >
              {icon}
            </Text>
            <Text
              style={{
                fontSize: 10,
                fontWeight: "600",
                color: selectedStatus === status ? "#FFFFFF" : "#6B7280",
                textAlign: "center",
              }}
            >
              {getStatusLabel(status)}
            </Text>
                <View
                  style={{
                    paddingHorizontal: 5,
                    paddingVertical: 1,
                    borderRadius: 8,
                    backgroundColor:
                      selectedStatus === status ? "#FFFFFF20" : "#F3F4F6",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "700",
                      color: selectedStatus === status ? "#FFFFFF" : "#6B7280",
                    }}
                  >
                    {count}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Task list */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        >
          {filteredTasks.length === 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingTop: 60,
              }}
            >
              <Text style={{ fontSize: 48, marginBottom: 16 }}>📝</Text>
              <Text style={{ fontSize: 16, color: "#9CA3AF", textAlign: "center" }}>
                {selectedStatus === "completed"
                  ? isRu ? "Нет выполненных задач" : "No completed tasks"
                  : selectedStatus === "in_progress"
                  ? isRu ? "Нет задач в процессе выполнения" : "No tasks in progress"
                  : isRu ? "Нет задач. Создайте первую!" : "No tasks yet. Create your first!"}
              </Text>
            </View>
          ) : (
            <>
              <SwipeHint isRu={isRu} hasTask={filteredTasks.length > 0} />
              {filteredTasks.map((task) => (
                <SwipeableTaskCard
                  key={task.id}
                  task={task}
                  isExpanded={false}
                  isRu={isRu}
                  onToggleExpand={openTaskDetail}
                  onStatusChange={(taskId, currentStatus) =>
                    handleStatusChange(taskId, currentStatus)
                  }
                  onDelete={(taskId, taskTitle) => handleDelete(taskId, taskTitle)}
                  onExportToCalendar={(task) => handleExportToCalendar(task)}
                />
              ))}
            </>
          )}
        </ScrollView>

        <TaskDetailModal
          task={selectedTaskForDetail}
          visible={!!selectedTaskForDetail}
          onClose={() => setSelectedTaskForDetail(null)}
          onEdit={(task) => {
            setSelectedTaskForDetail(null);
            router.push({
              pathname: "/task-detail/[id]",
              params: { id: task.id },
            });
          }}
          onDelete={(taskId) => handleDelete(taskId, "")}
          onExportToCalendar={(task) => handleExportToCalendar(task)}
          onExportToKanban={async (task) => {
            try {
              const stored = await AsyncStorage.getItem(KANBAN_STORAGE_KEY);
              const data = stored
                ? JSON.parse(stored)
                : {
                    columns: [
                      { id: "col_1", title: "Start", stickers: [] },
                      { id: "col_2", title: "In Progress", stickers: [] },
                      { id: "col_3", title: "Done", stickers: [] },
                    ],
                  };

              const newSticker = {
                id: `sticker_${Date.now()}`,
                text: task.description || task.title,
                bgColor: "#FFEB3B",
                textColor: "#000000",
              };

              data.columns[0].stickers.push(newSticker);
              await AsyncStorage.setItem(
                KANBAN_STORAGE_KEY,
                JSON.stringify(data)
              );

              Alert.alert(
                isRu ? "Успешно" : "Success",
                isRu ? "Задача добавлена в канбан" : "Task added to Kanban"
              );

              setSelectedTaskForDetail(null);
              router.push({ pathname: "/(tabs)/kanban" });
            } catch (error) {
              console.error("Export to Kanban error:", error);
              Alert.alert(
                isRu ? "Ошибка" : "Error",
                isRu ? "Ошибка при добавлении в канбан" : "Error adding to Kanban"
              );
            }
          }}
        />

        {/* FAB */}
        <Pressable
          onPress={() => router.push("/add-task")}
          style={({ pressed }) => [
            {
              position: "absolute",
              bottom: 24,
              right: 24,
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: "#0a7ea4",
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.8 : 1,
              elevation: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            },
          ]}
        >
          <Text style={{ fontSize: 32, color: "#FFFFFF", fontWeight: "300" }}>+</Text>
        </Pressable>
      </ScreenTransition>
    </ScreenContainer>
  );
}
