import { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  Alert,
  Animated,
  PanResponder,
  Platform,
  ScrollView,
  Modal,
  Dimensions,
  findNodeHandle,
  UIManager,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useTaskContext } from "@/lib/context/task-context";
import { useI18n } from "@/lib/context/i18n-context";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";
import { KanbanBoard } from "@/components/kanban-board";
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

type ViewMode = "matrix" | "kanban";

interface DraggingTask {
  task: Task;
}

// Absolute page coordinates for hit testing
interface AbsoluteRect {
  pageX: number;
  pageY: number;
  width: number;
  height: number;
}

const MAX_VISIBLE_TASKS = 4;

export default function MatrixScreen() {
  const { tasks, updateTask, deleteTask } = useTaskContext();
  const { t, language } = useI18n();
  const colors = useColors();
  const router = useRouter();
  const isRu = language === "ru";

  const [viewMode, setViewMode] = useState<ViewMode>("matrix");
  const [draggingTask, setDraggingTask] = useState<DraggingTask | null>(null);
  const [highlightedQuadrant, setHighlightedQuadrant] = useState<Quadrant | "trash" | null>(null);
  const dragPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // Fallback modal for moving tasks
  const [moveModalTask, setMoveModalTask] = useState<Task | null>(null);

  // Absolute page coordinates for each quadrant and trash
  const quadrantRects = useRef<Record<string, AbsoluteRect>>({});
  const trashRect = useRef<AbsoluteRect | null>(null);
  const quadrantViewRefs = useRef<Record<string, View | null>>({});
  const trashViewRef = useRef<View | null>(null);

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

  // Measure absolute page coordinates for all zones
  const measureAllZones = useCallback(() => {
    const quadrants: Quadrant[] = ["Q1", "Q2", "Q3", "Q4"];
    for (const q of quadrants) {
      const ref = quadrantViewRefs.current[q];
      if (ref) {
        try {
          if (Platform.OS === "web") {
            // On web, use getBoundingClientRect via findNodeHandle
            const node = findNodeHandle(ref);
            if (node) {
              (ref as any).measure?.((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
                quadrantRects.current[q] = { pageX, pageY, width, height };
              });
            }
          } else {
            ref.measure((x, y, width, height, pageX, pageY) => {
              quadrantRects.current[q] = { pageX, pageY, width, height };
            });
          }
        } catch {
          // skip
        }
      }
    }
    if (trashViewRef.current) {
      try {
        trashViewRef.current.measure((x, y, width, height, pageX, pageY) => {
          trashRect.current = { pageX, pageY, width, height };
        });
      } catch {
        // skip
      }
    }
  }, []);

  // Hit test using absolute page coordinates
  const hitTest = (pageX: number, pageY: number): Quadrant | "trash" | null => {
    // Check trash first
    if (trashRect.current) {
      const r = trashRect.current;
      if (pageX >= r.pageX && pageX <= r.pageX + r.width && pageY >= r.pageY && pageY <= r.pageY + r.height) {
        return "trash";
      }
    }
    // Check quadrants
    for (const q of ["Q1", "Q2", "Q3", "Q4"] as Quadrant[]) {
      const r = quadrantRects.current[q];
      if (r) {
        if (pageX >= r.pageX && pageX <= r.pageX + r.width && pageY >= r.pageY && pageY <= r.pageY + r.height) {
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
          { text: isRu ? "Удалить" : "Delete", style: "destructive", onPress: () => deleteTask(task.id) },
        ]
      );
      return;
    }
    if (target !== task.quadrant) {
      let newImportance = task.importance;
      let newUrgency = task.urgency;
      switch (target) {
        case "Q1": newImportance = Math.max(newImportance, 5); newUrgency = Math.max(newUrgency, 5); break;
        case "Q2": newImportance = Math.max(newImportance, 5); newUrgency = Math.min(newUrgency, 3); break;
        case "Q3": newImportance = Math.min(newImportance, 3); newUrgency = Math.max(newUrgency, 5); break;
        case "Q4": newImportance = Math.min(newImportance, 3); newUrgency = Math.min(newUrgency, 3); break;
      }
      await updateTask(task.id, { quadrant: target, importance: newImportance, urgency: newUrgency });
    }
  };

  // Fallback: move via modal
  const handleMoveViaModal = async (task: Task, target: Quadrant) => {
    await handleDrop(task, target);
    setMoveModalTask(null);
  };

  // Start drag: measure zones, then set dragging state
  const startDrag = useCallback((task: Task) => {
    measureAllZones();
    // Small delay to let measurements complete
    setTimeout(() => {
      setDraggingTask({ task });
    }, 50);
  }, [measureAllZones]);

  const renderTaskChip = (task: Task, quadrant: Quadrant) => {
    const config = QUADRANT_CONFIG[quadrant];
    return (
      <Pressable
        key={task.id}
        onLongPress={() => startDrag(task)}
        delayLongPress={300}
        onPress={() => router.push(`/task-detail/${task.id}`)}
        style={({ pressed }) => [{
          flexDirection: "row", alignItems: "center",
          backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 8,
          paddingHorizontal: 8, paddingVertical: 5, marginBottom: 3,
          opacity: pressed ? 0.7 : 1,
        }]}
      >
        {task.emoji && <Text style={{ fontSize: 12, marginRight: 3 }}>{task.emoji}</Text>}
        <Text style={{ color: config.color, fontSize: 11, fontWeight: "600", flex: 1, lineHeight: 15 }} numberOfLines={1}>
          {task.title}
        </Text>
        <Pressable
          onPress={() => setMoveModalTask(task)}
          style={({ pressed }) => [{ opacity: pressed ? 0.5 : 0.6, paddingLeft: 4 }]}
        >
          <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.8)" }}>↔</Text>
        </Pressable>
      </Pressable>
    );
  };

  const renderQuadrant = (quadrant: Quadrant, taskList: Task[]) => {
    const config = QUADRANT_CONFIG[quadrant];
    const isHighlighted = highlightedQuadrant === quadrant;
    const hasMore = taskList.length > MAX_VISIBLE_TASKS;

    return (
      <View
        key={quadrant}
        ref={(ref) => { quadrantViewRefs.current[quadrant] = ref; }}
        collapsable={false}
        onLayout={() => setTimeout(measureAllZones, 150)}
        style={{
          flex: 1, backgroundColor: config.bgColor, borderRadius: 12,
          padding: 6, margin: 3, minHeight: 100,
          borderWidth: isHighlighted ? 3 : 0, borderColor: "#FFFFFF",
          opacity: isHighlighted ? 1 : draggingTask ? 0.85 : 1,
          overflow: "hidden",
        }}
      >
        <Text style={{ color: config.color, fontSize: 11, fontWeight: "800", marginBottom: 1 }}>{quadrant}</Text>
        <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 9, fontWeight: "600", marginBottom: 1 }}>{getQuadrantLabel(quadrant)}</Text>
        <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 7, marginBottom: 4 }}>{getQuadrantSubLabel(quadrant)}</Text>

        <View style={{ flex: 1 }}>
          {taskList.length === 0 ? (
            <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontStyle: "italic", textAlign: "center", marginTop: 6 }}>
              {isRu ? "Пусто" : "Empty"}
            </Text>
          ) : (
            <View style={{ flex: 1, position: "relative" }}>
              <ScrollView
                style={{ maxHeight: 120 }}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
              >
                {taskList.map((task) => renderTaskChip(task, quadrant))}
              </ScrollView>
              {/* Gradient fade indicator when there are more tasks */}
              {hasMore && (
                <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 28, pointerEvents: "none" }}>
                  <View style={{
                    flex: 1,
                    backgroundColor: "transparent",
                    // Use semi-transparent overlay as gradient fallback
                  }}>
                    <View style={{
                      position: "absolute", bottom: 0, left: 0, right: 0, height: 28,
                      backgroundColor: config.bgColor,
                      opacity: 0.85,
                    }} />
                    <View style={{
                      position: "absolute", bottom: 0, left: 0, right: 0,
                      alignItems: "center", paddingBottom: 2,
                    }}>
                      <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 9, fontWeight: "700" }}>
                        ↓ {isRu ? "ещё" : "more"} {taskList.length - MAX_VISIBLE_TASKS} ↓
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
        <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 9, textAlign: "right", marginTop: 2 }}>{taskList.length}</Text>
      </View>
    );
  };

  // PanResponder for drag overlay — uses pageX/pageY directly
  const dragPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        // Set initial position
        dragPosition.setValue({ x: evt.nativeEvent.pageX - 60, y: evt.nativeEvent.pageY - 30 });
      },
      onPanResponderMove: (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        dragPosition.setValue({ x: pageX - 60, y: pageY - 30 });
        const target = hitTest(pageX, pageY);
        setHighlightedQuadrant(target);
      },
      onPanResponderRelease: (evt) => {
        const { pageX, pageY } = evt.nativeEvent;
        const target = hitTest(pageX, pageY);
        if (draggingTask) handleDrop(draggingTask.task, target);
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
      {/* View Mode Toggle */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 6, gap: 4 }}>
        <Pressable
          onPress={() => setViewMode("matrix")}
          style={({ pressed }) => [{
            paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
            backgroundColor: viewMode === "matrix" ? colors.primary : colors.surface,
            opacity: pressed ? 0.7 : 1,
          }]}
        >
          <Text style={{
            fontSize: 13, fontWeight: "700",
            color: viewMode === "matrix" ? "#FFF" : colors.muted,
          }}>
            📊 {t.matrix.matrixView}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setViewMode("kanban")}
          style={({ pressed }) => [{
            paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
            backgroundColor: viewMode === "kanban" ? colors.primary : colors.surface,
            opacity: pressed ? 0.7 : 1,
          }]}
        >
          <Text style={{
            fontSize: 13, fontWeight: "700",
            color: viewMode === "kanban" ? "#FFF" : colors.muted,
          }}>
            📋 {t.matrix.kanbanView}
          </Text>
        </Pressable>
      </View>

      {viewMode === "kanban" ? (
        <KanbanBoard />
      ) : (
        <View style={{ flex: 1 }}>
          {/* Axis labels */}
          <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 2 }}>
            <Text style={{ fontSize: 10, color: colors.muted, fontWeight: "600" }}>
              ← {isRu ? "НЕ СРОЧНО" : "NOT URGENT"}  |  {isRu ? "СРОЧНО" : "URGENT"} →
            </Text>
          </View>

          {/* Matrix Grid */}
          <View style={{ flex: 1 }}>
            {/* Top row */}
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2, flex: 1 }}>
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
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
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
            ref={(ref) => { trashViewRef.current = ref; }}
            collapsable={false}
            onLayout={() => setTimeout(measureAllZones, 150)}
            style={{
              alignItems: "center", justifyContent: "center",
              paddingVertical: 8, marginTop: 4, borderRadius: 14,
              backgroundColor: isTrashHighlighted ? "#EF4444" : "rgba(239, 68, 68, 0.1)",
              borderWidth: 2,
              borderColor: isTrashHighlighted ? "#DC2626" : "rgba(239, 68, 68, 0.3)",
              borderStyle: "dashed",
            }}
          >
            <Text style={{ fontSize: 18 }}>🗑</Text>
            <Text style={{ fontSize: 10, fontWeight: "700", color: isTrashHighlighted ? "#FFFFFF" : "#EF4444", marginTop: 1 }}>
              {isRu ? "Перетащите для удаления" : "Drag here to delete"}
            </Text>
          </View>

          {/* Summary */}
          <View style={{ flexDirection: "row", justifyContent: "space-around", paddingVertical: 4 }}>
            <Text style={{ fontSize: 10, color: colors.muted }}>{isRu ? "Всего" : "Total"}: {activeTasks.length}</Text>
            <Text style={{ fontSize: 10, color: "#EF4444" }}>Q1: {q1Tasks.length}</Text>
            <Text style={{ fontSize: 10, color: "#F59E0B" }}>Q2: {q2Tasks.length}</Text>
            <Text style={{ fontSize: 10, color: "#3B82F6" }}>Q3: {q3Tasks.length}</Text>
            <Text style={{ fontSize: 10, color: "#22C55E" }}>Q4: {q4Tasks.length}</Text>
          </View>

          {/* Drag overlay — covers entire screen */}
          {draggingTask && (
            <View
              style={{
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
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
                  paddingHorizontal: 12, paddingVertical: 8,
                  shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3, shadowRadius: 8, elevation: 10,
                  maxWidth: 180,
                }}
              >
                <Text style={{ color: "#FFF", fontSize: 13, fontWeight: "700" }} numberOfLines={1}>
                  {draggingTask.task.emoji ? `${draggingTask.task.emoji} ` : ""}{draggingTask.task.title}
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 9, marginTop: 2 }}>
                  {isRu ? "Отпустите в нужный квадрант" : "Drop into target quadrant"}
                </Text>
              </Animated.View>
            </View>
          )}
        </View>
      )}

      {/* Fallback Move Modal */}
      <Modal visible={!!moveModalTask} transparent animationType="fade" onRequestClose={() => setMoveModalTask(null)}>
        {moveModalTask && (
          <Pressable onPress={() => setMoveModalTask(null)} style={{
            flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center",
          }}>
            <Pressable onPress={() => {}} style={{
              width: "88%", maxWidth: 380, borderRadius: 20, padding: 20, backgroundColor: colors.surface,
            }}>
              {/* Task preview */}
              <View style={{
                backgroundColor: QUADRANT_CONFIG[moveModalTask.quadrant].bgColor,
                borderRadius: 10, padding: 12, marginBottom: 14, alignItems: "center",
              }}>
                <Text style={{ color: "#FFF", fontSize: 14, fontWeight: "700" }} numberOfLines={2}>
                  {moveModalTask.emoji ? `${moveModalTask.emoji} ` : ""}{moveModalTask.title}
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, marginTop: 2 }}>
                  {isRu ? `Сейчас: ${moveModalTask.quadrant}` : `Current: ${moveModalTask.quadrant}`}
                </Text>
              </View>

              <Text style={{ fontSize: 14, fontWeight: "700", color: colors.muted, textAlign: "center", marginBottom: 10 }}>
                {isRu ? "Переместить в:" : "Move to:"}
              </Text>

              <View style={{ gap: 6 }}>
                {(["Q1", "Q2", "Q3", "Q4"] as Quadrant[]).map((q) => {
                  const isCurrent = moveModalTask.quadrant === q;
                  const config = QUADRANT_CONFIG[q];
                  return (
                    <Pressable
                      key={q}
                      onPress={() => !isCurrent && handleMoveViaModal(moveModalTask, q)}
                      disabled={isCurrent}
                      style={({ pressed }) => [{
                        flexDirection: "row", alignItems: "center",
                        backgroundColor: isCurrent ? `${colors.border}40` : pressed ? `${config.bgColor}30` : colors.background,
                        borderRadius: 12, padding: 12,
                        borderWidth: isCurrent ? 2 : 1.5,
                        borderColor: isCurrent ? colors.muted : config.bgColor,
                        borderStyle: isCurrent ? "solid" : "dashed",
                        opacity: isCurrent ? 0.4 : 1,
                        gap: 10,
                      }]}
                    >
                      <View style={{
                        width: 28, height: 28, borderRadius: 6,
                        backgroundColor: config.bgColor, alignItems: "center", justifyContent: "center",
                      }}>
                        <Text style={{ color: "#FFF", fontSize: 11, fontWeight: "800" }}>{q}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "700" }}>
                          {getQuadrantLabel(q)}
                        </Text>
                        <Text style={{ color: colors.muted, fontSize: 10 }}>
                          {getQuadrantSubLabel(q)}
                        </Text>
                      </View>
                      <Text style={{ color: colors.muted, fontSize: 11 }}>
                        {isCurrent ? (isRu ? "текущий" : "current") : ""}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Delete option */}
              <Pressable
                onPress={() => {
                  setMoveModalTask(null);
                  handleDrop(moveModalTask, "trash");
                }}
                style={({ pressed }) => [{
                  flexDirection: "row", alignItems: "center", justifyContent: "center",
                  backgroundColor: pressed ? "#EF444430" : "rgba(239,68,68,0.1)",
                  borderRadius: 12, padding: 12, marginTop: 8,
                  borderWidth: 1.5, borderColor: "#EF4444", borderStyle: "dashed",
                  gap: 8,
                }]}
              >
                <Text style={{ fontSize: 16 }}>🗑</Text>
                <Text style={{ color: "#EF4444", fontSize: 13, fontWeight: "700" }}>
                  {isRu ? "Удалить задачу" : "Delete task"}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setMoveModalTask(null)}
                style={({ pressed }) => [{
                  paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10,
                  alignItems: "center", backgroundColor: colors.border, marginTop: 8,
                  opacity: pressed ? 0.7 : 1,
                }]}
              >
                <Text style={{ color: colors.foreground, fontWeight: "600" }}>{isRu ? "Отмена" : "Cancel"}</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        )}
      </Modal>
    </ScreenContainer>
  );
}
