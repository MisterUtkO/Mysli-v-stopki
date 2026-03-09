import { useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  Animated,
  PanResponder,
  Platform,
  LayoutAnimation,
  UIManager,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import type { Task, TaskStatus } from "@/lib/domain/types";
import { AnimatedEmoji } from "@/components/animated-emoji";
import { AnimatedTaskBorder } from "@/components/animated-task-border";
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

// Simplified thresholds for more reliable swipe detection
const SWIPE_THRESHOLD = 30; // Distance to trigger swipe action
const MIN_HORIZONTAL_MOVEMENT = 3; // Minimum horizontal movement to start detecting

/**
 * Returns a gradient color based on the combined priority score (importance + urgency).
 * Score range: 2 (min: 1+1) to 14 (max: 7+7)
 * 
 * Psychological color gradient:
 * 14 (max) → Deep red — extreme urgency, danger
 * 12-13    → Bright red — very high priority
 * 10-11    → Red-orange — high priority, attention
 * 8-9      → Orange-amber — moderate-high, caution
 * 6-7      → Yellow-green — moderate, balanced
 * 4-5      → Green — low priority, calm
 * 2-3      → Cool blue-gray — minimal priority, relaxed
 */
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
  if (task.dueDate) return false; // Only check tasks without due date
  const now = new Date();
  const createdDate = new Date(task.createdAt);
  const daysDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff > 3;
}

export function getPriorityGradientColor(importance: number, urgency: number): string {
  const score = importance + urgency; // 2-14
  
  if (score >= 14) return "#C62828"; // Deep crimson red
  if (score >= 13) return "#D32F2F"; // Dark red
  if (score >= 12) return "#E53935"; // Red
  if (score >= 11) return "#EF4444"; // Bright red
  if (score >= 10) return "#F97316"; // Orange
  if (score >= 9)  return "#FB923C"; // Light orange
  if (score >= 8)  return "#F59E0B"; // Amber
  if (score >= 7)  return "#FBBF24"; // Yellow-amber
  if (score >= 6)  return "#A3E635"; // Yellow-green
  if (score >= 5)  return "#84CC16"; // Lime green
  if (score >= 4)  return "#22C55E"; // Green
  if (score >= 3)  return "#4ADE80"; // Light green
  return "#64B5F6"; // Cool blue — minimal priority
}

/** Returns a slightly transparent version for card background tint */
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
  onExportToCalendar?: (task: Task) => void; // Manual export to calendar
  isMatrixView?: boolean; // If true, show minimal info (text only)
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
  const translateX = useRef(new Animated.Value(0)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const [flashColor, setFlashColor] = useState<string>("#22C55E");
  const isSwipingRef = useRef(false);
  const startXRef = useRef(0);

  // Get the color for the NEXT status (what the task will become)
  const getNextStatusColor = (currentStatus: TaskStatus): string => {
    switch (currentStatus) {
      case "not_started": return "#3B82F6";  // blue for in_progress
      case "in_progress": return "#22C55E";  // green for completed
      case "completed": return "#9CA3AF";    // gray for not_started
    }
  };

  // Trigger a brief color flash on the card
  const triggerFlash = (currentStatus: TaskStatus) => {
    setFlashColor(getNextStatusColor(currentStatus));
    flashOpacity.setValue(0.35);
    Animated.timing(flashOpacity, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only detect horizontal swipes: significant horizontal movement, minimal vertical
        const isHorizontal = 
          Math.abs(gestureState.dx) > MIN_HORIZONTAL_MOVEMENT &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 2;
        
        if (isHorizontal) {
          startXRef.current = gestureState.x0;
          isSwipingRef.current = true;
        }
        return isHorizontal;
      },
      onPanResponderMove: (_, gestureState) => {
        if (isSwipingRef.current) {
          // Clamp movement to prevent over-swiping
          const clampedDx = Math.max(-100, Math.min(100, gestureState.dx));
          translateX.setValue(clampedDx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        isSwipingRef.current = false;
        
        // Simple distance-based detection (no velocity)
        const isSwipeLeft = gestureState.dx < -SWIPE_THRESHOLD;
        const isSwipeRight = gestureState.dx > SWIPE_THRESHOLD;
        
        if (isSwipeLeft) {
          // Swipe left → Delete
          if (Platform.OS !== "web") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
          Animated.timing(translateX, {
            toValue: -100,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            onDelete(task.id, task.title);
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              tension: 40,
              friction: 8,
            }).start();
          });
        } else if (isSwipeRight) {
          // Swipe right → Change status
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          triggerFlash(task.status);
          Animated.timing(translateX, {
            toValue: 100,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            onStatusChange(task.id, task.status);
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              tension: 40,
              friction: 8,
            }).start();
          });
        } else {
          // Snap back to original position
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 40,
            friction: 8,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        isSwipingRef.current = false;
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 40,
          friction: 8,
        }).start();
      },
    })
  ).current;

  const priorityColor = getPriorityGradientColor(task.importance, task.urgency);
  const bgTint = getPriorityBgTint(task.importance, task.urgency);
  const hasAttachments = task.attachments && task.attachments.length > 0;

  const leftActionOpacity = translateX.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const rightActionOpacity = translateX.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // MATRIX VIEW: Minimal display (text only)
  if (isMatrixView) {
    const overdue = isTaskOverdue(task);
    const old = isTaskOld(task);
    
    return (
      <View style={{ marginBottom: 6, borderRadius: 8, position: "relative" }}>
        {/* Background swipe actions */}
        <View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            flexDirection: "row",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          {/* Right swipe background (status change) */}
          <Animated.View
            style={{
              flex: 1,
              backgroundColor: "#22C55E",
              justifyContent: "center",
              paddingLeft: 12,
              opacity: leftActionOpacity,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 11 }}>
              {getNextStatusLabel(task.status)}
            </Text>
          </Animated.View>

          {/* Left swipe background (delete) */}
          <Animated.View
            style={{
              flex: 1,
              backgroundColor: "#EF4444",
              justifyContent: "center",
              alignItems: "flex-end",
              paddingRight: 12,
              opacity: rightActionOpacity,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 11 }}>
              {isRu ? "Удалить" : "Delete"}
            </Text>
          </Animated.View>
        </View>

        {/* Swipeable card */}
        <Animated.View
          style={{ transform: [{ translateX }] }}
          {...panResponder.panHandlers}
        >
          <Pressable
            onPress={(e) => {
              if (!isSwipingRef.current) {
                const { pageX, pageY } = e.nativeEvent;
                onToggleExpand(task.id, isMatrixView ? { x: pageX, y: pageY } : undefined);
              }
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
              {/* Minimal view: only text + status */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Pressable
                  onPress={() => onStatusChange(task.id, task.status)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                >
                  <Text style={{ fontSize: 20, color: getStatusColor(task.status), lineHeight: 24 }}>
                    {STATUS_ICONS[task.status]}
                  </Text>
                </Pressable>

                {task.emoji && (
                  <Text style={{ fontSize: 14 }}>
                    {task.emoji}
                  </Text>
                )}

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
    );
  }

  // REGULAR VIEW: Full details
  const glowType = getTaskGlowType(task);
  return (
    <View style={{ marginBottom: 8, borderRadius: 14, overflow: "hidden", position: "relative" }}>
    <TaskCardGlow
      glowType={glowType}
      borderRadius={14}
      intensity="high"
    />
      {/* Background swipe actions */}
      <View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          flexDirection: "row",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        {/* Right swipe background (status change) */}
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: "#22C55E",
            justifyContent: "center",
            paddingLeft: 16,
            opacity: leftActionOpacity,
            borderRadius: 14,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>
            {getNextStatusLabel(task.status)}
          </Text>
        </Animated.View>

        {/* Left swipe background (delete) */}
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: "#EF4444",
            justifyContent: "center",
            alignItems: "flex-end",
            paddingRight: 16,
            opacity: rightActionOpacity,
            borderRadius: 14,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>
            {isRu ? "Удалить 🗑" : "Delete 🗑"}
          </Text>
        </Animated.View>
      </View>

      {/* Swipeable card */}
      <Animated.View
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        <Pressable
          onPress={() => {
            if (!isSwipingRef.current) {
              onToggleExpand(task.id);
            }
          }}
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
            {/* Flash overlay for status change animation */}
            <Animated.View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: flashColor,
                opacity: flashOpacity,
                borderRadius: 14,
                zIndex: 10,
              }}
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
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: priorityColor,
                      marginRight: 2,
                    }}
                  />
                  <Text style={{ fontSize: 10, color: "#9CA3AF" }}>
                    ⚡{task.importance} 🔥{task.urgency}
                  </Text>
                  <View
                    style={{
                      backgroundColor: priorityColor,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 6,
                      marginLeft: 2,
                    }}
                  >
                    <Text style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "700" }}>
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
                {task.description && task.description !== task.title && (
                  <Text
                    className="text-muted"
                    style={{ fontSize: 13, lineHeight: 18, marginTop: 8 }}
                    numberOfLines={4}
                  >
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
                      <View
                        style={{
                          width: `${((task.importance + task.urgency) / 14) * 100}%`,
                          height: 6,
                          backgroundColor: priorityColor,
                          borderRadius: 3,
                        }}
                      />
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

                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10, gap: 8 }}>
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
                      <Text style={{ fontSize: 13, fontWeight: "600", color: "#3B82F6" }}>
                        Cal
                      </Text>
                    </Pressable>
                  )}

                  <Pressable
                    onPress={() => router.push(`/task-detail/${task.id}`)}
                    style={({ pressed }) => [
                      {
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                        opacity: pressed ? 0.5 : 1,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 20, fontWeight: "700", color: "#9CA3AF", letterSpacing: 2 }}>
                      ⋮
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}
