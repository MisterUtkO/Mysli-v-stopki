import { useState, useCallback, useMemo } from "react";
import { View, Text, ScrollView, Dimensions, FlatList, Pressable, Modal, Alert } from "react-native";
import { ScreenContainer } from "@/components/common/screen-container";
import { ScreenTransition } from "@/components/animations/screen-transition";
import { useTaskContext } from "@/lib/context/task-context";
import { useColors } from "@/hooks/use-colors";
import { useI18n } from "@/lib/context/i18n-context";
import { useCustomization } from "@/lib/context/customization-context";
import type { Task } from "@/lib/domain/types";
import { SwipeableTaskCard } from "@/components/task/swipeable-task-card";
import { MatrixTaskCard } from "@/components/matrix/matrix-task-card";
import { TaskPopupBubble } from "@/components/task/task-popup-bubble";
import { TaskDetailModal } from "@/components/task/task-detail-modal";
import { MatrixEditTextModal } from "@/components/matrix/matrix-edit-text-modal";
import { cn } from "@/lib/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KANBAN_STORAGE_KEY } from "@/lib/integrations/kanban/kanban-sync";
import { syncTaskToCalendar, formatTaskForCalendar } from "@/lib/integrations/calendar/calendar-sync";

const QUADRANT_CONFIG = {
  Q1: {
    label: "Do Now",
    description: "Urgent & Important",
    color: "#EF4444",
    importance: [4, 5, 6, 7],
    urgency: [4, 5, 6, 7],
  },
  Q2: {
    label: "Schedule",
    description: "Important, Not Urgent",
    color: "#F97316",
    importance: [4, 5, 6, 7],
    urgency: [1, 2, 3],
  },
  Q3: {
    label: "Delegate",
    description: "Urgent, Not Important",
    color: "#3B82F6",
    importance: [1, 2, 3],
    urgency: [4, 5, 6, 7],
  },
  Q4: {
    label: "Postpone",
    description: "Not Urgent & Not Important",
    color: "#22C55E",
    importance: [1, 2, 3],
    urgency: [1, 2, 3],
  },
};

type QuadrantKey = "Q1" | "Q2" | "Q3" | "Q4";

const getQuadrantConfig = (isRu: boolean) => ({
  Q1: { label: isRu ? "Делай сейчас" : "Do Now", description: isRu ? "Срочно и важно" : "Urgent & Important", color: "#EF4444", importance: [4, 5, 6, 7], urgency: [4, 5, 6, 7] },
  Q2: { label: isRu ? "Запланируй" : "Schedule", description: isRu ? "Важно, но не срочно" : "Important, Not Urgent", color: "#F97316", importance: [4, 5, 6, 7], urgency: [1, 2, 3] },
  Q3: { label: isRu ? "Делегируй" : "Delegate", description: isRu ? "Срочно, но не важно" : "Urgent, Not Important", color: "#3B82F6", importance: [1, 2, 3], urgency: [4, 5, 6, 7] },
  Q4: { label: isRu ? "Отложи" : "Postpone", description: isRu ? "Не срочно и не важно" : "Not Urgent & Not Important", color: "#22C55E", importance: [1, 2, 3], urgency: [1, 2, 3] },
});

export default function MatrixScreen() {
  const { tasks, updateTask, deleteTask, refreshTasks } = useTaskContext();
  const colors = useColors();
  const { t, language } = useI18n();
  const customization = useCustomization();
  const isRu = language === "ru";
  const QUADRANT_CONFIG = getQuadrantConfig(isRu);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [scrollStates, setScrollStates] = useState<Record<QuadrantKey, boolean>>({
    Q1: false,
    Q2: false,
    Q3: false,
    Q4: false,
  });
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState({ top: 100, left: 20 });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<Task | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<Task | null>(null);

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const quadrantWidth = screenWidth / 2;
  const TAB_BAR_HEIGHT = 60;
  const quadrantHeight = (screenHeight - TAB_BAR_HEIGHT) / 2;

  const quadrantTasks = useMemo(() => {
    const result: Record<QuadrantKey, typeof tasks> = {
      Q1: [],
      Q2: [],
      Q3: [],
      Q4: [],
    };

    tasks.forEach((task) => {
      if (task.status === "completed" || task.deletedAt) return;
      const quadrantKey = task.quadrant as QuadrantKey;
      if (result[quadrantKey]) {
        result[quadrantKey].push(task);
      }
    });

    return result;
  }, [tasks]);

  const handleScroll = useCallback(
    (quadrant: QuadrantKey, hasMoreContent: boolean) => {
      setScrollStates((prev) => ({
        ...prev,
        [quadrant]: hasMoreContent,
      }));
    },
    []
  );

  const handleToggleExpand = useCallback((taskId: string, position?: { x: number; y: number }) => {
    setPopupVisible(true);
    setSelectedTaskId(taskId);
    
    if (position) {
      const maxWidth = 280;
      const maxHeight = 300;
      
      let top = position.y - maxHeight - 10;
      let left = position.x - maxWidth / 2;
      
      if (top < 20) top = position.y + 40;
      if (left < 10) left = 10;
      if (left + maxWidth > screenWidth - 10) left = screenWidth - maxWidth - 10;
      
      setPopupPosition({ top, left });
    }
  }, [screenWidth]);

  const handleStatusChange = useCallback(
    async (taskId: string, currentStatus: string) => {
      const statusMap: Record<string, string> = {
        not_started: "in_progress",
        in_progress: "completed",
        completed: "not_started",
      };
      const newStatus = statusMap[currentStatus] || "not_started";
      await updateTask(taskId, { status: newStatus as any });
    },
    [updateTask]
  );

  const handleDelete = useCallback(
    async (taskId: string, taskTitle: string) => {
      await deleteTask(taskId);
    },
    [deleteTask]
  );

  const renderQuadrant = (quadrant: QuadrantKey) => {
    const config = QUADRANT_CONFIG[quadrant];
    const quadrantTaskList = quadrantTasks[quadrant] || [];
    const hasScroll = scrollStates[quadrant];
    
    const quadrantColorKey = quadrant.toLowerCase() as keyof typeof customization.quadrantColors;
    const quadrantColor = customization?.quadrantColors?.[quadrantColorKey] || config.color;
    const brightness = customization?.matrixBrightness ?? 0.7;

    return (
      <View
        key={quadrant}
        style={{
          width: quadrantWidth,
          height: quadrantHeight,
          backgroundColor: quadrantColor,
          opacity: 0.2 + brightness * 0.8,
          borderWidth: 2,
          borderColor: quadrantColor,
          overflow: "hidden",
          shadowColor: quadrantColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        {/* Header */}
        <View className="bg-black/20 px-3 py-2" style={{ marginBottom: 6 }}>
          <Text className="text-sm font-bold text-white">{config.label}</Text>
          <Text className="text-xs text-white/80">{config.description}</Text>
        </View>

        {/* Tasks List — правка #5: paddingTop + увеличенный paddingBottom */}
        <FlatList
          data={quadrantTaskList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MatrixTaskCard
              task={item}
              isRu={isRu}
              onPress={(task) => {
                setSelectedTaskForDetail(task);
                setDetailModalVisible(true);
              }}
            />
          )}
          scrollEnabled={true}
          onScroll={(event) => {
            const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
            const hasMore = contentSize.height > layoutMeasurement.height;
            handleScroll(quadrant, hasMore && contentOffset.y > 0);
          }}
          scrollEventThrottle={16}
          style={{ flex: 1, marginTop: 2 }}
          contentContainerStyle={{ paddingTop: 6, paddingBottom: 16 }}
        />

        {/* Scroll Indicator */}
        {hasScroll && (
          <View className="absolute right-1 bottom-2 items-center gap-0.5">
            <Text className="text-white text-xs">▼</Text>
          </View>
        )}
      </View>
    );
  };

  const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : null;

  return (
    <ScreenTransition>
      <ScreenContainer className="p-0">
        <View className="flex-1 bg-black" style={{ width: screenWidth, height: screenHeight - TAB_BAR_HEIGHT }}>
          {/* Row 1: Q1 and Q2 */}
          <View className="flex-row" style={{ flex: 1 }}>
            {renderQuadrant("Q1")}
            {renderQuadrant("Q2")}
          </View>

          {/* Row 2: Q3 and Q4 */}
          <View className="flex-row" style={{ flex: 1 }}>
            {renderQuadrant("Q3")}
            {renderQuadrant("Q4")}
          </View>
        </View>

        {/* Task Detail Modal */}
        {selectedTaskForDetail && (
          <TaskDetailModal
            visible={detailModalVisible}
            task={selectedTaskForDetail}
            onClose={() => {
              setDetailModalVisible(false);
              setSelectedTaskForDetail(null);
            }}
            onEdit={undefined}
            onMarkComplete={async (taskId) => {
              await updateTask(taskId, { status: "completed" });
              await refreshTasks();
              setDetailModalVisible(false);
              setSelectedTaskForDetail(null);
            }}
            onExportToCalendar={async (task) => {
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
                  setDetailModalVisible(false);
                  setSelectedTaskForDetail(null);
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
            }}
            onExportToKanban={async (task) => {
              try {
                const stored = await AsyncStorage.getItem(KANBAN_STORAGE_KEY);
                const data = stored ? JSON.parse(stored) : { columns: [{ id: "col_1", title: "Start", stickers: [] }, { id: "col_2", title: "In Progress", stickers: [] }, { id: "col_3", title: "Done", stickers: [] }] };
                
                const newSticker = {
                  id: `sticker_${Date.now()}`,
                  text: task.description || task.title,
                  bgColor: "#FFEB3B",
                  textColor: "#000000",
                };
                
                data.columns[0].stickers.push(newSticker);
                await AsyncStorage.setItem(KANBAN_STORAGE_KEY, JSON.stringify(data));
                
                Alert.alert(
                  isRu ? "Успешно" : "Success",
                  isRu ? "Задача добавлена в канбан" : "Task added to Kanban"
                );
                
                setDetailModalVisible(false);
                setSelectedTaskForDetail(null);
              } catch (error) {
                console.error("Export to Kanban error:", error);
                Alert.alert(
                  isRu ? "Ошибка" : "Error",
                  isRu ? "Ошибка при добавлении в канбан" : "Error adding to Kanban"
                );
              }
            }}
            onDelete={async (taskId) => {
              Alert.alert(
                isRu ? "Удалить задачу?" : "Delete task?",
                isRu ? "Это действие нельзя отменить" : "This action cannot be undone",
                [
                  { text: isRu ? "Отмена" : "Cancel", style: "cancel" },
                  {
                    text: isRu ? "Удалить" : "Delete",
                    style: "destructive",
                    onPress: async () => {
                      await deleteTask(taskId);
                      await refreshTasks();
                      setDetailModalVisible(false);
                      setSelectedTaskForDetail(null);
                    },
                  },
                ]
              );
            }}
          />
        )}

        {/* Task Detail Popup Bubble */}
        {popupVisible && selectedTask && (
          <Pressable
            className="absolute inset-0 z-40"
            onPress={() => setPopupVisible(false)}
          >
            <TaskPopupBubble
              title={selectedTask.title}
              description={selectedTask.description}
              importance={selectedTask.importance}
              urgency={selectedTask.urgency}
              dueDate={selectedTask.dueDate}
              dueTime={selectedTask.dueTime}
              status={selectedTask.status}
              isRu={isRu}
              position={popupPosition}
              onClose={() => setPopupVisible(false)}
            />
          </Pressable>
        )}

        {/* Matrix Edit Text Modal */}
        {selectedTaskForEdit && (
          <MatrixEditTextModal
            visible={editModalVisible}
            task={selectedTaskForEdit}
            onClose={() => {
              setEditModalVisible(false);
              setSelectedTaskForEdit(null);
            }}
            onSave={async (taskId, newTitle) => {
              await updateTask(taskId, { title: newTitle });
              await refreshTasks();
              setEditModalVisible(false);
              setSelectedTaskForEdit(null);
            }}
          />
        )}
      </ScreenContainer>
    </ScreenTransition>
  );
}
