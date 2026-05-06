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

  // Status color helper
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "completed":
        return "#22C55E";
      case "in_progress":
        return "#F59E0B";
      case "not_started":
        return "#6B7280";
      default:
        return "#6B7280";
    }
  };

  // Status icon helper
  const getStatusIcon = (status: string): string => {
    switch (status) {
      case "completed":
        return "✓";
      case "in_progress":
        return "⟳";
      case "not_started":
        return "○";
      default:
        return "○";
    }
  };

  // Status label helper
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "completed":
        return isRu ? "Завершено" : "Done";
      case "in_progress":
        return isRu ? "В процессе" : "In Progress";
      case "not_started":
        return isRu ? "Не начато" : "Not Started";
      default:
        return "";
    }
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
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            position: "relative",
          }}
        >
          {/* Overdue indicator */}
          <OverdueIndicator isOverdue={isOverdue} />
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

        {/* Task Title and Priority */}
        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={2}
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: "#FFFFFF",
              lineHeight: 16,
            }}
          >
            {task.title}
          </Text>
          <Text
            style={{
              fontSize: 11,
              color: "rgba(255, 255, 255, 0.7)",
              marginTop: 2,
            }}
          >
            {priorityLabel}
          </Text>
          <View
            style={{
              marginTop: 6,
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 999,
              backgroundColor: getStatusColor(task.status),
              alignSelf: "flex-start",
            }}
          >
            <Text
              style={{
                fontSize: 9,
                fontWeight: "700",
                color: "#FFFFFF",
              }}
            >
              {getStatusIcon(task.status)} {getStatusLabel(task.status)}
            </Text>
          </View>
        </View>
      </View>
      </Pressable>
    </OverdueTaskWrapper>
  );
}
