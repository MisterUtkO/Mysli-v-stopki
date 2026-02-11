import { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  Alert,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
  ScrollView,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useTaskContext } from "@/lib/context/task-context";
import { useI18n } from "@/lib/context/i18n-context";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";
import type { Task, Quadrant } from "@/lib/domain/types";

const QUADRANT_CONFIG: Record<
  Quadrant,
  { color: string; bgColor: string; borderColor: string }
> = {
  Q1: { color: "#FFFFFF", bgColor: "#EF4444", borderColor: "#DC2626" },
  Q2: { color: "#FFFFFF", bgColor: "#F59E0B", borderColor: "#D97706" },
  Q3: { color: "#FFFFFF", bgColor: "#3B82F6", borderColor: "#2563EB" },
  Q4: { color: "#FFFFFF", bgColor: "#22C55E", borderColor: "#16A34A" },
};

interface DraggingTask {
  task: Task;
  startX: number;
  startY: number;
}

export default function MatrixScreen() {
  const { tasks, updateTask, deleteTask } = useTaskContext();
  const { t, language } = useI18n();
  const colors = useColors();
  const router = useRouter();
  const isRu = language === "ru";

  const [draggingTask, setDraggingTask] = useState<DraggingTask | null>(null);
  const [highlightedQuadrant, setHighlightedQuadrant] = useState<Quadrant | "trash" | null>(null);
  const dragPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // Layout refs for quadrant hit-testing
  const quadrantLayouts = useRef<Record<string, { x: number; y: number; width: number; height: number }>>({});
  const trashLayout = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const containerLayout = useRef<{ x: number; y: number } | null>(null);

  const activeTasks = tasks.filter((t) => t.status !== "completed");
  const q1Tasks = activeTasks.filter((t) => t.quadrant === "Q1");
  const q2Tasks = activeTasks.filter((t) => t.quadrant === "Q2");
  const q3Tasks = activeTasks.filter((t) => t.quadrant === "Q3");
  const q4Tasks = activeTasks.filter((t) => t.quadrant === "Q4");

  const getQuadrantLabel = (q: Quadrant): string => {
    switch (q) {
      case "Q1": return isRu ? "Делать сейчас" : "Do Now";
      case "Q2": return isRu ? "Запланировать" : "Schedule";
      case "Q3": return isRu ? "Делегировать" : "Delegate";
      case "Q4": return isRu ? "Удалить/Отложить" : "Delete/Defer";
    }
  };

  const getQuadrantSubLabel = (q: Quadrant): string => {
    switch (q) {
      case "Q1": return isRu ? "Срочно + Важно" : "Urgent + Important";
      case "Q2": return isRu ? "Важно, не срочно" : "Important, Not Urgent";
      case "Q3": return isRu ? "Срочно, не важно" : "Urgent, Not Important";
      case "Q4": return isRu ? "Не срочно, не важно" : "Not Urgent, Not Important";
    }
  };

  const hitTest = (pageX: number, pageY: number): Quadrant | "trash" | null => {
    const container = containerLayout.current;
    if (!container) return null;

    // Check trash first
    if (trashLayout.current) {
      const t = trashLayout.current;
      if (pageX >= t.x && pageX <= t.x + t.width && pageY >= t.y && pageY <= t.y + t.height) {
        return "trash";
      }
    }

    // Check quadrants
    for (const q of ["Q1", "Q2", "Q3", "Q4"] as Quadrant[]) {
      const layout = quadrantLayouts.current[q];
      if (layout) {
        if (pageX >= layout.x && pageX <= layout.x + layout.width && pageY >= layout.y && pageY <= layout.y + layout.height) {
          return q;
        }
      }
    }
    return null;
  };

  const handleDrop = async (task: Task, target: Quadrant | "trash" | null) => {
    if (!target) return;

    if (target === "trash") {
      Alert.alert(
        isRu ? "Удалить задачу?" : "Delete task?",
        `"${task.title}"`,
        [
          { text: isRu ? "Отмена" : "Cancel", style: "cancel" },
          {
            text: isRu ? "Удалить" : "Delete",
            style: "destructive",
            onPress: () => deleteTask(task.id),
          },
        ]
      );
      return;
    }

    if (target !== task.quadrant) {
      // Recalculate importance/urgency based on target quadrant
      let newImportance = task.importance;
      let newUrgency = task.urgency;

      switch (target) {
        case "Q1": // Urgent + Important
          newImportance = Math.max(newImportance, 5);
          newUrgency = Math.max(newUrgency, 5);
          break;
        case "Q2": // Important, not urgent
          newImportance = Math.max(newImportance, 5);
          newUrgency = Math.min(newUrgency, 3);
          break;
        case "Q3": // Urgent, not important
          newImportance = Math.min(newImportance, 3);
          newUrgency = Math.max(newUrgency, 5);
          break;
        case "Q4": // Neither
          newImportance = Math.min(newImportance, 3);
          newUrgency = Math.min(newUrgency, 3);
          break;
      }

      await updateTask(task.id, {
        quadrant: target,
        importance: newImportance,
        urgency: newUrgency,
      });
    }
  };

  const renderTaskChip = (task: Task) => {
    const config = QUADRANT_CONFIG[task.quadrant];

    return (
      <Pressable
        key={task.id}
        onLongPress={() => {
          setDraggingTask({ task, startX: 0, startY: 0 });
        }}
        onPress={() => router.push(`/task-detail/${task.id}`)}
        style={({ pressed }) => [
          {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.25)",
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 5,
            marginBottom: 4,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        {task.emoji && (
          <Text style={{ fontSize: 13, marginRight: 4 }}>{task.emoji}</Text>
        )}
        <Text
          style={{
            color: config.color,
            fontSize: 12,
            fontWeight: "600",
            flex: 1,
            lineHeight: 16,
          }}
          numberOfLines={1}
        >
          {task.title}
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 9, marginLeft: 4 }}>
          ⚡{task.importance} 🔥{task.urgency}
        </Text>
      </Pressable>
    );
  };

  const renderQuadrant = (quadrant: Quadrant, taskList: Task[]) => {
    const config = QUADRANT_CONFIG[quadrant];
    const isHighlighted = highlightedQuadrant === quadrant;

    return (
      <View
        key={quadrant}
        onLayout={(e) => {
          e.target.measureInWindow((x, y, width, height) => {
            quadrantLayouts.current[quadrant] = { x, y, width, height };
          });
        }}
        style={{
          flex: 1,
          backgroundColor: config.bgColor,
          borderRadius: 12,
          padding: 8,
          margin: 3,
          minHeight: 120,
          borderWidth: isHighlighted ? 3 : 0,
          borderColor: "#FFFFFF",
          opacity: isHighlighted ? 1 : draggingTask ? 0.85 : 1,
        }}
      >
        <Text
          style={{
            color: config.color,
            fontSize: 12,
            fontWeight: "800",
            marginBottom: 2,
          }}
        >
          {quadrant}
        </Text>
        <Text
          style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: 10,
            fontWeight: "600",
            marginBottom: 2,
          }}
        >
          {getQuadrantLabel(quadrant)}
        </Text>
        <Text
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 8,
            marginBottom: 6,
          }}
        >
          {getQuadrantSubLabel(quadrant)}
        </Text>

        <View style={{ flex: 1 }}>
          {taskList.length === 0 ? (
            <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontStyle: "italic", textAlign: "center", marginTop: 8 }}>
              {isRu ? "Пусто" : "Empty"}
            </Text>
          ) : (
            taskList.slice(0, 5).map(renderTaskChip)
          )}
          {taskList.length > 5 && (
            <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, textAlign: "center", marginTop: 2 }}>
              +{taskList.length - 5} {isRu ? "ещё" : "more"}
            </Text>
          )}
        </View>

        <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, textAlign: "right", marginTop: 4 }}>
          {taskList.length}
        </Text>
      </View>
    );
  };

  // Drag overlay PanResponder
  const dragPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        dragPosition.setValue({ x: gestureState.moveX - 60, y: gestureState.moveY - 30 });
        const target = hitTest(gestureState.moveX, gestureState.moveY);
        setHighlightedQuadrant(target);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const target = hitTest(gestureState.moveX, gestureState.moveY);
        if (draggingTask) {
          handleDrop(draggingTask.task, target);
        }
        setDraggingTask(null);
        setHighlightedQuadrant(null);
        dragPosition.setValue({ x: 0, y: 0 });
      },
      onPanResponderTerminate: () => {
        setDraggingTask(null);
        setHighlightedQuadrant(null);
        dragPosition.setValue({ x: 0, y: 0 });
      },
    })
  ).current;

  const isTrashHighlighted = highlightedQuadrant === "trash";

  return (
    <ScreenContainer className="p-2">
      <View
        style={{ flex: 1 }}
        onLayout={(e) => {
          e.target.measureInWindow((x, y) => {
            containerLayout.current = { x, y };
          });
        }}
      >
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 8, paddingHorizontal: 4 }}>
          <Text className="text-foreground font-bold" style={{ fontSize: 20, lineHeight: 26 }}>
            {t.matrix.title}
          </Text>
        </View>

        {/* Axis labels */}
        <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 2 }}>
          <Text style={{ fontSize: 10, color: colors.muted, fontWeight: "600" }}>
            ← {isRu ? "НЕ СРОЧНО" : "NOT URGENT"}  |  {isRu ? "СРОЧНО" : "URGENT"} →
          </Text>
        </View>

        {/* Matrix Grid */}
        <View style={{ flex: 1 }}>
          {/* Top label */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
            <View style={{ width: 14, alignItems: "center" }}>
              <Text style={{ fontSize: 8, color: colors.muted, fontWeight: "600", transform: [{ rotate: "-90deg" }], width: 60 }}>
                {isRu ? "ВАЖНО ↑" : "IMPORTANT ↑"}
              </Text>
            </View>
            <View style={{ flex: 1, flexDirection: "row" }}>
              {renderQuadrant("Q2", q2Tasks)}
              {renderQuadrant("Q1", q1Tasks)}
            </View>
          </View>

          {/* Bottom row */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 14, alignItems: "center" }}>
              <Text style={{ fontSize: 8, color: colors.muted, fontWeight: "600", transform: [{ rotate: "-90deg" }], width: 60 }}>
                {isRu ? "НЕ ВАЖНО ↓" : "NOT IMP ↓"}
              </Text>
            </View>
            <View style={{ flex: 1, flexDirection: "row" }}>
              {renderQuadrant("Q4", q4Tasks)}
              {renderQuadrant("Q3", q3Tasks)}
            </View>
          </View>
        </View>

        {/* Trash bin */}
        <View
          onLayout={(e) => {
            e.target.measureInWindow((x, y, width, height) => {
              trashLayout.current = { x, y, width, height };
            });
          }}
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 12,
            marginTop: 6,
            borderRadius: 14,
            backgroundColor: isTrashHighlighted ? "#EF4444" : "rgba(239, 68, 68, 0.1)",
            borderWidth: 2,
            borderColor: isTrashHighlighted ? "#DC2626" : "rgba(239, 68, 68, 0.3)",
            borderStyle: "dashed",
          }}
        >
          <Text style={{ fontSize: 22 }}>🗑</Text>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: isTrashHighlighted ? "#FFFFFF" : "#EF4444",
              marginTop: 2,
            }}
          >
            {isRu ? "Перетащите сюда для удаления" : "Drag here to delete"}
          </Text>
        </View>

        {/* Summary */}
        <View style={{ flexDirection: "row", justifyContent: "space-around", paddingVertical: 8 }}>
          <Text style={{ fontSize: 11, color: colors.muted }}>
            {isRu ? "Всего" : "Total"}: {activeTasks.length}
          </Text>
          <Text style={{ fontSize: 11, color: "#EF4444" }}>Q1: {q1Tasks.length}</Text>
          <Text style={{ fontSize: 11, color: "#F59E0B" }}>Q2: {q2Tasks.length}</Text>
          <Text style={{ fontSize: 11, color: "#3B82F6" }}>Q3: {q3Tasks.length}</Text>
          <Text style={{ fontSize: 11, color: "#22C55E" }}>Q4: {q4Tasks.length}</Text>
        </View>

        {/* Drag overlay */}
        {draggingTask && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
            {...dragPanResponder.panHandlers}
          >
            <Animated.View
              style={{
                position: "absolute",
                left: dragPosition.x,
                top: dragPosition.y,
                backgroundColor: QUADRANT_CONFIG[draggingTask.task.quadrant].bgColor,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 10,
                maxWidth: 180,
              }}
            >
              <Text style={{ color: "#FFF", fontSize: 13, fontWeight: "700" }} numberOfLines={1}>
                {draggingTask.task.emoji ? `${draggingTask.task.emoji} ` : ""}{draggingTask.task.title}
              </Text>
            </Animated.View>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}
