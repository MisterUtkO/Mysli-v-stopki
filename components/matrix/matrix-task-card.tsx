import { View, Text, Pressable, Platform } from "react-native";
import type { Task } from "@/lib/domain/types";
import * as Haptics from "expo-haptics";
import { isTaskOverdue } from "@/components/task/swipeable-task-card";
import { OverdueTaskWrapper, OverdueIndicator } from "@/components/overdue/overdue-task-wrapper";

interface MatrixTaskCardProps {
  task: Task;
  isRu: boolean;
  onPress: (task: Task) => void;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case "completed":   return "#22c55e";
    case "in_progress": return "#3b82f6";
    case "on_hold":     return "#f59e0b";
    default:            return "#6b7280"; // not_started
  }
};

const getStatusIcon = (status: string): string => {
  switch (status) {
    case "completed":   return "✅";
    case "in_progress": return "⏳";
    case "on_hold":     return "⏸️";
    default:            return "○";
  }
};

const getStatusLabel = (status: string, isRu: boolean): string => {
  switch (status) {
    case "completed":   return isRu ? "Готово"   : "Done";
    case "in_progress": return isRu ? "В работе" : "In Progress";
    case "on_hold":     return isRu ? "Пауза"    : "On Hold";
    default:            return isRu ? "Не начато" : "Todo";
  }
};

export function MatrixTaskCard({ task, isRu, onPress }: MatrixTaskCardProps) {
  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress(task);
  };

  // Priority icon based on importance score (1-7)
  const getPriorityIcon = (importance: number) => {
    if (importance >= 5) return "⚡"; // High priority
    if (importance >= 3) return "⭐"; // Medium priority
    return "○"; // Low priority
  };

  // Priority label
  const getPriorityLabel = (importance: number) => {
    if (importance >= 5) return isRu ? "Высокий" : "High";
    if (importance >= 3) return isRu ? "Средний" : "Medium";
    return isRu ? "Низкий" : "Low";
  };

  const priorityIcon = getPriorityIcon(task.importance);
  const priorityLabel = getPriorityLabel(task.importance);
  const isOverdue = isTaskOverdue(task);

  return (
    <OverdueTaskWrapper isOverdue={isOverdue}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          {
            marginBottom: 6,
            marginHorizontal: 6,
            borderRadius: 6,
            overflow: "hidden",
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        {/* Semi-transparent dark background */}
        <View
          style={{
            backgroundColor: isOverdue ? "rgba(239, 68, 68, 0.35)" : "rgba(0, 0, 0, 0.25)",
            paddingVertical: 8,
            paddingHorizontal: 8,
            borderRadius: 6,
            gap: 4,
            position: "relative",
          }}
        >
          {/* Overdue indicator */}
          <OverdueIndicator isOverdue={isOverdue} />

          {/* Top row: priority icon + title */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            {/* Priority Icon */}
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                minWidth: 20,
                textAlign: "center",
              }}
            >
              {priorityIcon}
            </Text>

            {/* Task Title */}
            <Text
              numberOfLines={2}
              style={{
                flex: 1,
                fontSize: 13,
                fontWeight: "600",
                color: "#FFFFFF",
                lineHeight: 16,
              }}
            >
              {task.title}
            </Text>
          </View>

          {/* Status badge */}
          <View style={{
            backgroundColor: getStatusColor(task.status),
            borderRadius: 999,
            paddingHorizontal: 7,
            paddingVertical: 2,
            alignSelf: "flex-start",
            marginLeft: 26, // align with title (after icon)
          }}>
            <Text style={{ color: "#fff", fontSize: 9, fontWeight: "700" }}>
              {getStatusIcon(task.status)} {getStatusLabel(task.status, isRu)}
            </Text>
          </View>
        </View>
      </Pressable>
    </OverdueTaskWrapper>
  );
}
