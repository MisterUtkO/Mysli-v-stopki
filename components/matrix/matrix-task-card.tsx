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

  const getPriorityIcon = (importance: number) => {
    if (importance >= 5) return "⚡";
    if (importance >= 3) return "⭐";
    return "○";
  };

  const getPriorityLabel = (importance: number) => {
    if (importance >= 5) return isRu ? "Высокий" : "High";
    if (importance >= 3) return isRu ? "Средний" : "Medium";
    return isRu ? "Низкий" : "Low";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "not_started": return "#6B7280";
      case "in_progress": return "#3B82F6";
      case "completed": return "#10B981";
      default: return "#6B7280";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "not_started": return "○";
      case "in_progress": return "◐";
      case "completed": return "●";
      default: return "○";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "not_started": return isRu ? "Не начато" : "Not started";
      case "in_progress": return isRu ? "В процессе" : "In progress";
      case "completed": return isRu ? "Готово" : "Done";
      default: return status;
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
          <OverdueIndicator isOverdue={isOverdue} />

          {/* Top row: priority icon + title */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
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
          <View
            style={{
              backgroundColor: getStatusColor(task.status),
              borderRadius: 999,
              paddingHorizontal: 7,
              paddingVertical: 2,
              alignSelf: "flex-start",
              marginLeft: 26,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 9, fontWeight: "700" }}>
              {getStatusIcon(task.status)} {getStatusLabel(task.status)}
            </Text>
          </View>
        </View>
      </Pressable>
    </OverdueTaskWrapper>
  );
}
