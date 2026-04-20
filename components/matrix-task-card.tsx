import { View, Text, Pressable, Platform } from "react-native";
import type { Task } from "@/lib/domain/types";
import * as Haptics from "expo-haptics";

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

  const priorityIcon = getPriorityIcon(task.importance);
  const priorityLabel = getPriorityLabel(task.importance);

  return (
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
          backgroundColor: "rgba(0, 0, 0, 0.25)", // Slightly transparent dark
          paddingVertical: 8,
          paddingHorizontal: 8,
          borderRadius: 6,
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
        }}
      >
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
        </View>
      </View>
    </Pressable>
  );
}
