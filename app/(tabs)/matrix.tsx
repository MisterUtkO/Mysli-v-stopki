import { useState, useMemo, useCallback } from "react";
import { View, Text, ScrollView, Dimensions, FlatList, Pressable, Modal } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useTaskContext } from "@/lib/context/task-context";
import { useColors } from "@/hooks/use-colors";
import { useI18n } from "@/lib/context/i18n-context";
import { SwipeableTaskCard } from "@/components/swipeable-task-card";
import { TaskPopupBubble } from "@/components/task-popup-bubble";
import { cn } from "@/lib/utils";

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
    label: "Eliminate",
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
  Q4: { label: isRu ? "Исключи" : "Eliminate", description: isRu ? "Не срочно и не важно" : "Not Urgent & Not Important", color: "#22C55E", importance: [1, 2, 3], urgency: [1, 2, 3] },
});

export default function MatrixScreen() {
  const { tasks, updateTask, deleteTask } = useTaskContext();
  const colors = useColors();
  const { t, language } = useI18n();
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

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const quadrantWidth = screenWidth / 2;
  const quadrantHeight = (screenHeight * 0.85) / 2;

  const quadrantTasks = useMemo(() => {
    const result: Record<QuadrantKey, typeof tasks> = {
      Q1: [],
      Q2: [],
      Q3: [],
      Q4: [],
    };

    tasks.forEach((task) => {
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

  const handleToggleExpand = useCallback((taskId: string) => {
    setPopupVisible(true);
    setSelectedTaskId(taskId);
  }, []);

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
    const quadrantTaskList = quadrantTasks[quadrant];
    const hasScroll = scrollStates[quadrant];

    return (
      <View
        key={quadrant}
        style={{
          width: quadrantWidth,
          height: quadrantHeight,
          backgroundColor: config.color,
          borderWidth: 2,
          borderColor: "#000000",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <View className="bg-black/20 px-3 py-2">
          <Text className="text-sm font-bold text-white">{config.label}</Text>
          <Text className="text-xs text-white/80">{config.description}</Text>
        </View>

        {/* Tasks List */}
        <FlatList
          data={quadrantTaskList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="px-2 py-1">
              <SwipeableTaskCard
                task={item}
                isExpanded={expandedTasks.has(item.id)}
                isRu={isRu}
                onToggleExpand={handleToggleExpand}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                isMatrixView={true}
              />
            </View>
          )}
          scrollEnabled={true}
          onScroll={(event) => {
            const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
            const hasMore = contentSize.height > layoutMeasurement.height;
            handleScroll(quadrant, hasMore && contentOffset.y > 0);
          }}
          scrollEventThrottle={16}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 8 }}
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
    <ScreenContainer className="p-0">
      <View className="flex-1 flex-row flex-wrap bg-black">
        {/* Row 1: Q1 and Q2 */}
        <View className="flex-row">
          {renderQuadrant("Q1")}
          {renderQuadrant("Q2")}
        </View>

        {/* Row 2: Q3 and Q4 */}
        <View className="flex-row">
          {renderQuadrant("Q3")}
          {renderQuadrant("Q4")}
        </View>
      </View>

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
    </ScreenContainer>
  );
}
