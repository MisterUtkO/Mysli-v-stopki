import { useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useTaskContext } from "@/lib/context/task-context";
import { useI18n } from "@/lib/context/i18n-context";
import { useColors } from "@/hooks/use-colors";
import type { Task, Quadrant } from "@/lib/domain/types";

const QUADRANT_CONFIG: Record<Quadrant, { bgColor: string; label: { en: string; ru: string }; subLabel: { en: string; ru: string } }> = {
  Q1: { bgColor: "#EF4444", label: { en: "Do Now", ru: "Сделать" }, subLabel: { en: "Urgent & Important", ru: "Срочно и Важно" } },
  Q2: { bgColor: "#F59E0B", label: { en: "Schedule", ru: "Запланировать" }, subLabel: { en: "Important, Not Urgent", ru: "Важно, Не срочно" } },
  Q3: { bgColor: "#3B82F6", label: { en: "Delegate", ru: "Делегировать" }, subLabel: { en: "Urgent, Not Important", ru: "Срочно, Не важно" } },
  Q4: { bgColor: "#22C55E", label: { en: "Eliminate", ru: "Исключить" }, subLabel: { en: "Not Urgent & Not Important", ru: "Не срочно, Не важно" } },
};

interface ScrollState {
  Q1: { canScrollUp: boolean; canScrollDown: boolean };
  Q2: { canScrollUp: boolean; canScrollDown: boolean };
  Q3: { canScrollUp: boolean; canScrollDown: boolean };
  Q4: { canScrollUp: boolean; canScrollDown: boolean };
}

export default function MatrixScreen() {
  const { tasks, updateTask } = useTaskContext();
  const { t, language } = useI18n();
  const colors = useColors();
  const isRu = language === "ru";

  const [moveModalTask, setMoveModalTask] = useState<Task | null>(null);
  const [scrollState, setScrollState] = useState<ScrollState>({
    Q1: { canScrollUp: false, canScrollDown: false },
    Q2: { canScrollUp: false, canScrollDown: false },
    Q3: { canScrollUp: false, canScrollDown: false },
    Q4: { canScrollUp: false, canScrollDown: false },
  });

  const scrollRefs = useRef({
    Q1: null as ScrollView | null,
    Q2: null as ScrollView | null,
    Q3: null as ScrollView | null,
    Q4: null as ScrollView | null,
  });

  const activeTasks = useMemo(() => tasks.filter((t) => t.status !== "completed"), [tasks]);

  const q1Tasks = useMemo(() => activeTasks.filter((t) => t.quadrant === "Q1"), [activeTasks]);
  const q2Tasks = useMemo(() => activeTasks.filter((t) => t.quadrant === "Q2"), [activeTasks]);
  const q3Tasks = useMemo(() => activeTasks.filter((t) => t.quadrant === "Q3"), [activeTasks]);
  const q4Tasks = useMemo(() => activeTasks.filter((t) => t.quadrant === "Q4"), [activeTasks]);

  const getQuadrantLabel = (q: Quadrant) => isRu ? QUADRANT_CONFIG[q].label.ru : QUADRANT_CONFIG[q].label.en;
  const getQuadrantSubLabel = (q: Quadrant) => isRu ? QUADRANT_CONFIG[q].subLabel.ru : QUADRANT_CONFIG[q].subLabel.en;

  const handleMoveViaModal = async (task: Task, targetQuadrant: Quadrant) => {
    if (task.quadrant === targetQuadrant) return;
    let newImportance = task.importance;
    let newUrgency = task.urgency;
    const threshold = 4;
    if (targetQuadrant === "Q1") { newImportance = Math.max(threshold, task.importance); newUrgency = Math.max(threshold, task.urgency); }
    else if (targetQuadrant === "Q2") { newImportance = Math.max(threshold, task.importance); newUrgency = Math.min(threshold - 1, task.urgency); }
    else if (targetQuadrant === "Q3") { newImportance = Math.min(threshold - 1, task.importance); newUrgency = Math.max(threshold, task.urgency); }
    else if (targetQuadrant === "Q4") { newImportance = Math.min(threshold - 1, task.importance); newUrgency = Math.min(threshold - 1, task.urgency); }
    await updateTask(task.id, { quadrant: targetQuadrant, importance: newImportance, urgency: newUrgency });
    setMoveModalTask(null);
  };

  const handleScroll = (quadrant: Quadrant, event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const canScrollUp = contentOffset.y > 0;
    const canScrollDown = contentOffset.y < contentSize.height - layoutMeasurement.height - 5;
    
    setScrollState((prev) => ({
      ...prev,
      [quadrant]: { canScrollUp, canScrollDown },
    }));
  };

  const renderScrollIndicator = (quadrant: Quadrant) => {
    const state = scrollState[quadrant];
    if (!state.canScrollUp && !state.canScrollDown) return null;

    return (
      <View style={{
        position: "absolute",
        right: 2,
        top: 0,
        bottom: 0,
        width: 5,
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
      }}>
        {state.canScrollUp && (
          <Text style={{ fontSize: 8, color: "rgba(255,255,255,0.6)", fontWeight: "800" }}>▲</Text>
        )}
        {state.canScrollDown && (
          <Text style={{ fontSize: 8, color: "rgba(255,255,255,0.6)", fontWeight: "800" }}>▼</Text>
        )}
      </View>
    );
  };

  const renderQuadrant = (quadrant: Quadrant, taskList: Task[]) => {
    const config = QUADRANT_CONFIG[quadrant];

    return (
      <View style={{ flex: 1, margin: 0.5, position: "relative" }}>
        <View style={{
          backgroundColor: config.bgColor,
          borderRadius: 6,
          padding: 6,
          flex: 1,
          minHeight: 80,
          position: "relative",
        }}>
          {/* Header with label and count */}
          <View style={{ marginBottom: 4 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "rgba(255,255,255,0.95)", fontSize: 11, fontWeight: "800" }}>
                  {getQuadrantLabel(quadrant)}
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 7, fontWeight: "600", marginTop: 1 }}>
                  {getQuadrantSubLabel(quadrant)}
                </Text>
              </View>
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 9, fontWeight: "700", marginLeft: 4 }}>
                {taskList.length}
              </Text>
            </View>
          </View>

          {/* Tasks - scrollable */}
          {taskList.length === 0 ? (
            <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, fontStyle: "italic", textAlign: "center", paddingVertical: 8 }}>
              {isRu ? "Пусто" : "Empty"}
            </Text>
          ) : (
            <View style={{ flex: 1, position: "relative" }}>
              <ScrollView
                ref={(ref) => { scrollRefs.current[quadrant] = ref; }}
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                scrollIndicatorInsets={{ right: 6 }}
                nestedScrollEnabled
                onScroll={(e) => handleScroll(quadrant, e)}
                scrollEventThrottle={16}
              >
                {taskList.map((task) => (
                  <Pressable
                    key={task.id}
                    onPress={() => setMoveModalTask(task)}
                    style={({ pressed }) => [{
                      backgroundColor: "rgba(255,255,255,0.2)",
                      borderRadius: 4,
                      paddingHorizontal: 6,
                      paddingVertical: 4,
                      marginBottom: 3,
                      opacity: pressed ? 0.6 : 1,
                    }]}
                  >
                    <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "600" }} numberOfLines={2}>
                      {task.emoji ? `${task.emoji} ` : ""}{task.title}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              {renderScrollIndicator(quadrant)}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer className="p-0">
      <View style={{ flex: 1, paddingHorizontal: 2, paddingVertical: 2 }}>
        {/* Axis labels - minimal */}
        <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 0.5 }}>
          <Text style={{ fontSize: 8, color: colors.muted, fontWeight: "600" }}>
            ← {isRu ? "НЕ СРОЧНО" : "NOT URGENT"}  |  {isRu ? "СРОЧНО" : "URGENT"} →
          </Text>
        </View>

        {/* Matrix Grid - vertical layout for mobile */}
        <View style={{ flex: 1 }}>
          {/* Row 1: Q2 and Q1 */}
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginBottom: 0.5 }}>
            <View style={{ width: 10, alignItems: "center" }}>
              <Text style={{ fontSize: 6, color: colors.muted, fontWeight: "600", transform: [{ rotate: "-90deg" }], width: 40 }}>
                {isRu ? "ВАЖНО ↑" : "IMP ↑"}
              </Text>
            </View>
            <View style={{ flex: 1, flexDirection: "row" }}>
              {renderQuadrant("Q2", q2Tasks)}
              {renderQuadrant("Q1", q1Tasks)}
            </View>
          </View>

          {/* Row 2: Q4 and Q3 */}
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <View style={{ width: 10, alignItems: "center" }}>
              <Text style={{ fontSize: 6, color: colors.muted, fontWeight: "600", transform: [{ rotate: "-90deg" }], width: 40 }}>
                {isRu ? "НЕ ВАЖНО ↓" : "NOT IMP ↓"}
              </Text>
            </View>
            <View style={{ flex: 1, flexDirection: "row" }}>
              {renderQuadrant("Q4", q4Tasks)}
              {renderQuadrant("Q3", q3Tasks)}
            </View>
          </View>
        </View>

        {/* Summary - minimal */}
        <View style={{ flexDirection: "row", justifyContent: "space-around", paddingVertical: 1.5 }}>
          <Text style={{ fontSize: 7, color: colors.muted }}>{isRu ? "Всего" : "T"}: {activeTasks.length}</Text>
          <Text style={{ fontSize: 7, color: "#EF4444" }}>Q1: {q1Tasks.length}</Text>
          <Text style={{ fontSize: 7, color: "#F59E0B" }}>Q2: {q2Tasks.length}</Text>
          <Text style={{ fontSize: 7, color: "#3B82F6" }}>Q3: {q3Tasks.length}</Text>
          <Text style={{ fontSize: 7, color: "#22C55E" }}>Q4: {q4Tasks.length}</Text>
        </View>
      </View>

      {/* Move Modal */}
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

              <Pressable
                onPress={() => setMoveModalTask(null)}
                style={({ pressed }) => [{
                  paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10,
                  alignItems: "center", backgroundColor: colors.border, marginTop: 10,
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
