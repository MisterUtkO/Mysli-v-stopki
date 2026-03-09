"use client";
import {
  View,
  Text,
  Pressable,
  Image,
  Platform,
  LayoutAnimation,
  UIManager,
  Alert,
} from "react-native";
import { addTaskToKanban } from "@/lib/kanban-sync";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { useState, useRef } from "react";
import * as Haptics from "expo-haptics";
import type { Task, TaskStatus } from "@/lib/domain/types";
import { AnimatedEmoji } from "@/components/animated-emoji";
import { TaskCardGlow } from "@/components/task-card-glow";
import { getTaskGlowType } from "@/lib/glow-colors";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const STATUS_ICONS: Record<string, string> = {
  not_started: "○",
  in_progress: "◐",
  completed: "●",
};

const SWIPE_THRESHOLD = 60;

/**
 * Check if a task is overdue (has dueDate and it's in the past)
 */
export function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate) return false;
  const now = new Date();
  const dueDate = new Date(task.dueDate);
  return dueDate < now;
}

/**
 * Check if a task is old (no dueDate and created >3 days ago)
 */
export function isTaskOld(task: Task): boolean {
  if (task.dueDate) return false;
  const now = new Date();
  const createdDate = new Date(task.createdAt);
  const daysDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff > 3;
}

export function getPriorityGradientColor(importance: number, urgency: number): string {
  const score = importance + urgency;
  if (score >= 14) return "#C62828";
  if (score >= 13) return "#D32F2F";
  if (score >= 12) return "#E53935";
  if (score >= 11) return "#EF4444";
  if (score >= 10) return "#F97316";
  if (score >= 9)  return "#FB923C";
  if (score >= 8)  return "#F59E0B";
  if (score >= 7)  return "#FBBF24";
  if (score >= 6)  return "#A3E635";
  if (score >= 5)  return "#84CC16";
  if (score >= 4)  return "#22C55E";
  if (score >= 3)  return "#4ADE80";
  return "#64B5F6";
}

function getPriorityBgTint(importance: number, urgency: number): string {
  const score = importance + urgency;
  if (score >= 12) return "rgba(239, 68, 68, 0.08)";
  if (score >= 10) return "rgba(249, 115, 22, 0.07)";
  if (score >= 8)  return "rgba(245, 158, 11, 0.06)";
  if (score >= 6)  return "rgba(132, 204, 22, 0.05)";
  if (score >= 4)  return "rgba(34, 197, 94, 0.04)";
  return "rgba(100, 181, 246, 0.04)";
}

interface SwipeableTaskCardProps {
  task: Task;
  isExpanded: boolean;
  isRu: boolean;
  onToggleExpand: (taskId: string, position?: { x: number; y: number }) => void;
  onStatusChange: (taskId: string, currentStatus: TaskStatus) => void;
  onDelete: (taskId: string, taskTitle: string) => void;
  onExportToCalendar?: (task: Task) => void;
  isMatrixView?: boolean;
}

export function SwipeableTaskCard({
  task,
  isExpanded,
  isRu,
  onToggleExpand,
  onStatusChange,
  onDelete,
  onExportToCalendar,
  isMatrixView = false,
}: SwipeableTaskCardProps) {
  const router = useRouter();
  const translateX = useSharedValue(0);
  const flashOpacity = useSharedValue(0);
  const [flashColor, setFlashColor] = useState("#22C55E");
  const isSwiping = useSharedValue(false);

  const getNextStatusColor = (currentStatus: TaskStatus): string => {
    switch (currentStatus) {
      case "not_started": return "#3B82F6";
      case "in_progress": return "#22C55E";
      case "completed": return "#9CA3AF";
    }
  };

  const triggerFlash = (currentStatus: TaskStatus) => {
    setFlashColor(getNextStatusColor(currentStatus));
    flashOpacity.value = 0.35;
    flashOpacity.value = withTiming(0, { duration: 400 });
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

  const getNextStatusLabel = (status: TaskStatus): string => {
    switch (status) {
      case "not_started": return isRu ? "В процессе →" : "In progress →";
      case "in_progress": return isRu ? "Выполнено →" : "Complete →";
      case "completed": return isRu ? "Не начато →" : "Not started →";
    }
  };

  // Callbacks that run on JS thread
  const handleSwipeRight = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    triggerFlash(task.status);
    onStatusChange(task.id, task.status);
  };

  const handleSwipeLeft = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    onDelete(task.id, task.title);
  };

  // Gesture.Pan with simultaneousWithExternalGesture disabled
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-15, 15])
    .onStart(() => {
      isSwiping.value = true;
    })
    .onUpdate((event) => {
      translateX.value = Math.max(-120, Math.min(120, event.translationX));
    })
    .onEnd((event) => {
      isSwiping.value = false;
      if (event.translationX > SWIPE_THRESHOLD) {
        // Swipe right → change status
        translateX.value = withTiming(120, { duration: 120 }, () => {
          runOnJS(handleSwipeRight)();
          translateX.value = withSpring(0, { damping: 15, stiffness: 200 });
        });
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        // Swipe left → delete
        translateX.value = withTiming(-120, { duration: 120 }, () => {
          runOnJS(handleSwipeLeft)();
          translateX.value = withSpring(0, { damping: 15, stiffness: 200 });
        });
      } else {
        // Snap back
        translateX.value = withSpring(0, { damping: 15, stiffness: 200 });
      }
    })
    .onFinalize(() => {
      isSwiping.value = false;
    });

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const rightBgOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));

  const leftBgOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0], Extrapolation.CLAMP),
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const priorityColor = getPriorityGradientColor(task.importance, task.urgency);
  const bgTint = getPriorityBgTint(task.importance, task.urgency);
  const hasAttachments = task.attachments && task.attachments.length > 0;

  // ─── MATRIX VIEW ───────────────────────────────────────────────────────────
  if (isMatrixView) {
    return (
      <GestureDetector gesture={panGesture}>
        <View style={{ marginBottom: 6, borderRadius: 8, position: "relative" }}>
          {/* Background actions */}
          <View style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, flexDirection: "row", borderRadius: 8, overflow: "hidden" }}>
            <Animated.View style={[{ flex: 1, backgroundColor: "#22C55E", justifyContent: "center", paddingLeft: 12 }, rightBgOpacity]}>
              <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 11 }}>
                {getNextStatusLabel(task.status)}
              </Text>
            </Animated.View>
            <Animated.View style={[{ flex: 1, backgroundColor: "#EF4444", justifyContent: "center", alignItems: "flex-end", paddingRight: 12 }, leftBgOpacity]}>
              <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 11 }}>
                {isRu ? "Удалить" : "Delete"}
              </Text>
            </Animated.View>
          </View>

          {/* Card */}
          <Animated.View style={cardAnimStyle}>
            <Pressable
              onPress={(e) => {
                const { pageX, pageY } = e.nativeEvent;
                onToggleExpand(task.id, { x: pageX, y: pageY });
              }}
              style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1, borderRadius: 8 }]}
            >
              <View
                style={{
                  borderLeftWidth: 3,
                  borderLeftColor: priorityColor,
                  borderRadius: 8,
                  overflow: "hidden",
                  backgroundColor: bgTint,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                }}
                className="bg-surface"
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Pressable
                    onPress={() => onStatusChange(task.id, task.status)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                  >
                    <Text style={{ fontSize: 20, color: getStatusColor(task.status), lineHeight: 24 }}>
                      {STATUS_ICONS[task.status]}
                    </Text>
                  </Pressable>
                  {task.emoji && <Text style={{ fontSize: 14 }}>{task.emoji}</Text>}
                  <Text
                    style={{
                      fontSize: 13,
                      lineHeight: 18,
                      fontWeight: "500",
                      flex: 1,
                      textDecorationLine: task.status === "completed" ? "line-through" : "none",
                      opacity: task.status === "completed" ? 0.5 : 1,
                    }}
                    className="text-foreground"
                    numberOfLines={1}
                  >
                    {task.title}
                  </Text>
                </View>
              </View>
            </Pressable>
          </Animated.View>
        </View>
      </GestureDetector>
    );
  }

  // ─── REGULAR VIEW ──────────────────────────────────────────────────────────
  const glowType = getTaskGlowType(task);
  return (
    <GestureDetector gesture={panGesture}>
      <View style={{ marginBottom: 8, borderRadius: 14, position: "relative" }}>
        <TaskCardGlow glowType={glowType} borderRadius={14} intensity="high" />

        {/* Background actions */}
        <View style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, flexDirection: "row", borderRadius: 14, overflow: "hidden" }}>
          <Animated.View style={[{ flex: 1, backgroundColor: "#22C55E", justifyContent: "center", paddingLeft: 16, borderRadius: 14 }, rightBgOpacity]}>
            <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>
              {getNextStatusLabel(task.status)}
            </Text>
          </Animated.View>
          <Animated.View style={[{ flex: 1, backgroundColor: "#EF4444", justifyContent: "center", alignItems: "flex-end", paddingRight: 16, borderRadius: 14 }, leftBgOpacity]}>
            <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>
              {isRu ? "Удалить 🗑" : "Delete 🗑"}
            </Text>
          </Animated.View>
        </View>

        {/* Swipeable card */}
        <Animated.View style={[cardAnimStyle, { borderRadius: 14, overflow: "hidden" }]}>
          <Pressable
            onPress={() => onToggleExpand(task.id)}
            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1, borderRadius: 14 }]}
          >
            <View
              style={{
                borderLeftWidth: 4,
                borderLeftColor: priorityColor,
                borderRadius: 14,
                overflow: "hidden",
                backgroundColor: bgTint,
              }}
              className="bg-surface border border-border rounded-2xl"
            >
              {/* Flash overlay */}
              <Animated.View
                pointerEvents="none"
                style={[{
                  position: "absolute",
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: flashColor,
                  borderRadius: 14,
                  zIndex: 10,
                }, flashStyle]}
              />

              {/* COLLAPSED VIEW */}
              <View style={{ paddingHorizontal: 12, paddingVertical: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 8 }}>
                    <Pressable
                      onPress={() => {
                        triggerFlash(task.status);
                        if (Platform.OS !== "web") {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        }
                        onStatusChange(task.id, task.status);
                      }}
                      style={({ pressed }) => [{ marginRight: 10, opacity: pressed ? 0.6 : 1 }]}
                    >
                      <Text style={{ fontSize: 28, color: getStatusColor(task.status), lineHeight: 32 }}>
                        {STATUS_ICONS[task.status]}
                      </Text>
                    </Pressable>

                    {task.emoji && (
                      <View style={{ marginRight: 6 }}>
                        <AnimatedEmoji emoji={task.emoji} size={18} />
                      </View>
                    )}

                    <Text
                      style={{
                        fontSize: 15,
                        lineHeight: 20,
                        fontWeight: "600",
                        flex: 1,
                        textDecorationLine: task.status === "completed" ? "line-through" : "none",
                        opacity: task.status === "completed" ? 0.5 : 1,
                      }}
                      className="text-foreground"
                      numberOfLines={1}
                    >
                      {task.title}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: priorityColor, marginRight: 2 }} />
                    <Text style={{ fontSize: 10, color: "#9CA3AF" }}>
                      ⚡{task.importance} 🔥{task.urgency}
                    </Text>
                    <View style={{ backgroundColor: priorityColor, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 2 }}>
                      <Text style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "700" }}>
                        {task.quadrant}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* EXPANDED VIEW */}
              {isExpanded && (
                <View style={{ paddingHorizontal: 12, paddingBottom: 12, borderTopWidth: 1, borderTopColor: "rgba(128,128,128,0.15)" }}>
                  {task.description && task.description !== task.title && (
                    <Text className="text-muted" style={{ fontSize: 13, lineHeight: 18, marginTop: 8 }} numberOfLines={4}>
                      {task.description}
                    </Text>
                  )}

                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#FF6B6B", marginRight: 4 }} />
                      <Text style={{ fontSize: 12, color: "#FF6B6B" }}>
                        {isRu ? "Важность" : "Imp"}: {task.importance}/7
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#FFA94D", marginRight: 4 }} />
                      <Text style={{ fontSize: 12, color: "#FFA94D" }}>
                        {isRu ? "Срочность" : "Urg"}: {task.urgency}/7
                      </Text>
                    </View>
                    {task.dueDate && (
                      <Text style={{ fontSize: 12, color: "#9CA3AF" }}>
                        📅 {task.dueDate}{task.dueTime ? ` ${task.dueTime}` : ""}
                      </Text>
                    )}
                  </View>

                  {/* Priority bar */}
                  <View style={{ marginTop: 8 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Text style={{ fontSize: 10, color: "#9CA3AF", width: 60 }}>
                        {isRu ? "Приоритет" : "Priority"}
                      </Text>
                      <View style={{ flex: 1, height: 6, backgroundColor: "rgba(128,128,128,0.15)", borderRadius: 3, overflow: "hidden" }}>
                        <View style={{ width: `${((task.importance + task.urgency) / 14) * 100}%`, height: 6, backgroundColor: priorityColor, borderRadius: 3 }} />
                      </View>
                      <Text style={{ fontSize: 10, color: priorityColor, fontWeight: "700", width: 30, textAlign: "right" }}>
                        {task.importance + task.urgency}/14
                      </Text>
                    </View>
                  </View>

                  {task.notificationFrequency && task.notificationFrequency !== "global" && (
                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
                      <Text style={{ fontSize: 11, color: "#0a7ea4" }}>
                        🔔 {getNotifFreqLabel(task.notificationFrequency)}
                      </Text>
                    </View>
                  )}

                  {hasAttachments && (
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                      {task.attachments!.map((att, idx) => (
                        <View key={idx} style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: "rgba(128,128,128,0.15)", overflow: "hidden", alignItems: "center", justifyContent: "center" }}>
                          {att.type === "image" ? (
                            <Image source={{ uri: att.uri }} style={{ width: 48, height: 48 }} resizeMode="cover" />
                          ) : (
                            <Text style={{ fontSize: 20 }}>📎</Text>
                          )}
                        </View>
                      ))}
                    </View>
                  )}

                  <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", marginTop: 10, gap: 6 }}>
                    <Pressable
                      onPress={() => {
                        triggerFlash(task.status);
                        if (Platform.OS !== "web") {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        }
                        onStatusChange(task.id, task.status);
                      }}
                      style={({ pressed }) => [{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: getStatusColor(task.status) + "30",
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 12,
                        opacity: pressed ? 0.7 : 1,
                      }]}
                    >
                      <Text style={{ color: getStatusColor(task.status), fontSize: 18, fontWeight: "700", lineHeight: 22 }}>
                        {STATUS_ICONS[task.status]}
                      </Text>
                      <Text style={{ color: getStatusColor(task.status), fontSize: 13, fontWeight: "600", marginLeft: 6 }}>
                        {getStatusLabel(task.status)}
                      </Text>
                    </Pressable>

                    {!task.dueDate && onExportToCalendar && (
                      <Pressable
                        onPress={() => onExportToCalendar(task)}
                        style={({ pressed }) => [{
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 8,
                          backgroundColor: "#3B82F6" + (pressed ? "99" : "33"),
                          opacity: pressed ? 0.7 : 1,
                        }]}
                      >
                        <Text style={{ fontSize: 11, fontWeight: "600", color: "#3B82F6" }}>{isRu ? "в календарь" : "to calendar"}</Text>
                      </Pressable>
                    )}

                    <Pressable
                      onPress={async () => {
                        if (Platform.OS !== "web") {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                        const added = await addTaskToKanban(task, isRu);
                        Alert.alert(
                          added
                            ? (isRu ? "Добавлено" : "Added")
                            : (isRu ? "Уже есть" : "Already added"),
                          added
                            ? (isRu ? `"​${task.title}"​ добавлено в канбан` : `"​${task.title}"​ added to Kanban`)
                            : (isRu ? "Задача уже есть на доске" : "Task is already on the board")
                        );
                      }}
                      style={({ pressed }) => [{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 8,
                        backgroundColor: "#8B5CF6" + (pressed ? "99" : "33"),
                        opacity: pressed ? 0.7 : 1,
                      }]}
                    >
                      <Text style={{ fontSize: 11, fontWeight: "600", color: "#8B5CF6" }}>{isRu ? "в канбан" : "to kanban"}</Text>
                    </Pressable>

                    <Pressable
                      onPress={() => router.push(`/task-detail/${task.id}`)}
                      style={({ pressed }) => [{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, opacity: pressed ? 0.5 : 1 }]}
                    >
                      <Text style={{ fontSize: 20, fontWeight: "700", color: "#9CA3AF", letterSpacing: 2 }}>⋮</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          </Pressable>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}
