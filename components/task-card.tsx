import { View, Text, Pressable } from "react-native";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/domain/types";

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
}

const QUADRANT_COLORS = {
  Q1: "#EF4444", // Red
  Q2: "#F59E0B", // Amber
  Q3: "#3B82F6", // Blue
  Q4: "#9CA3AF", // Gray
};

const QUADRANT_LABELS = {
  Q1: "Do Now",
  Q2: "Schedule",
  Q3: "Delegate",
  Q4: "Delete",
};

export function TaskCard({ task, onPress }: TaskCardProps) {
  const quadrantColor = QUADRANT_COLORS[task.eisenhower.quadrant];
  const quadrantLabel = QUADRANT_LABELS[task.eisenhower.quadrant];

  const dueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  const isOverdue =
    task.dueDate && task.dueDate < Date.now() && task.status === "active";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View className="bg-surface rounded-lg p-4 mb-3 border border-border">
        {/* Header */}
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1 mr-2">
            <Text
              className="text-base font-semibold text-foreground"
              numberOfLines={2}
            >
              {task.title}
            </Text>
          </View>

          {/* Quadrant Badge */}
          <View
            className="px-2 py-1 rounded"
            style={{ backgroundColor: quadrantColor }}
          >
            <Text className="text-xs font-bold text-white">{task.eisenhower.quadrant}</Text>
          </View>
        </View>

        {/* Description */}
        {task.description && (
          <Text
            className="text-sm text-muted mb-2"
            numberOfLines={1}
          >
            {task.description}
          </Text>
        )}

        {/* Tags */}
        {task.tags.length > 0 && (
          <View className="flex-row flex-wrap gap-1 mb-2">
            {task.tags.slice(0, 3).map((tag, idx) => (
              <View key={idx} className="bg-primary/10 px-2 py-1 rounded">
                <Text className="text-xs text-primary font-medium">#{tag}</Text>
              </View>
            ))}
            {task.tags.length > 3 && (
              <Text className="text-xs text-muted self-center">
                +{task.tags.length - 3}
              </Text>
            )}
          </View>
        )}

        {/* Footer */}
        <View className="flex-row items-center justify-between">
          {/* Priority Score */}
          <View className="flex-row items-center gap-2">
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{
                backgroundColor:
                  task.priorityScore >= 70
                    ? "#EF4444"
                    : task.priorityScore >= 40
                      ? "#F59E0B"
                      : "#9CA3AF",
              }}
            >
              <Text className="text-white font-bold text-xs">
                {Math.round(task.priorityScore)}
              </Text>
            </View>
            <Text className="text-xs text-muted">{quadrantLabel}</Text>
          </View>

          {/* Due Date */}
          {dueDate && (
            <Text
              className={cn(
                "text-xs font-medium",
                isOverdue ? "text-error" : "text-muted"
              )}
            >
              {isOverdue ? "⚠ " : ""}
              {dueDate}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}
