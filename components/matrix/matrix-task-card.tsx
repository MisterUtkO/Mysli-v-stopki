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

// Правка #7: хелперы для бейджей статусов
const getStatusColor = (status: string): string => {
  switch (status) {
    case "completed":  return "#22c55e";
    case "in_progress": return "#3b82f6";
    case "on_hold":    return "#f59e0b";
    default:           return "#6b7280"; // not_started
  }
};

const getStatusIcon = (status: string): string => {
  switch (status) {
    case "completed":  return "●";
    case "in_progress": return "◐";
    case "on_hold":    return "⏸";
    default:           return "○";
  }
};

const getStatusLabel = (status: string, isRu: boolean): string => {
  switch (status) {
    case "completed":  return isRu ? "Готово" : "Done";
    case "in_progress": return isRu ? "В работе" : "In Progress";
    case "on_hold":    return isRu ? "Пауза" : "On Hold";
    default:           return isRu ? "Не начато" : "Todo";
  }
};

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

          {/* Верхняя строка: иконка + название */}
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
            </View>
          </View>

          {/* Нижняя строка: бейдж статуса (правка #7) */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginLeft: 26 }}>
            <View
              style={{
                backgroundColor: getStatusColor(task.status),
                borderRadius: 999,
                paddingHorizontal: 7,
                paddingVertical: 2,
                alignSelf: "flex-start",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 9, fontWeight: "700" }}>
                {getStatusIcon(task.status)} {getStatusLabel(task.status, isRu)}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </OverdueTaskWrapper>
  );
}
