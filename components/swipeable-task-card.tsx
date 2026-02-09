import { useRef } from "react";
import { View, Text, Pressable, Animated } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import type { Task, TaskStatus } from "@/lib/domain/types";

const QUADRANT_COLORS: Record<string, string> = {
  Q1: "bg-red-500",
  Q2: "bg-orange-400",
  Q3: "bg-blue-400",
  Q4: "bg-green-500",
};

const STATUS_COLORS: Record<string, string> = {
  not_started: "border-l-4 border-gray-400",
  in_progress: "border-l-4 border-blue-500",
  completed: "border-l-4 border-green-500",
};

interface SwipeableTaskCardProps {
  task: Task;
  emoji?: string;
  onPress: () => void;
  onStatusChange: (newStatus: TaskStatus) => void;
  onDelete: () => void;
}

export function SwipeableTaskCard({
  task,
  emoji,
  onPress,
  onStatusChange,
  onDelete,
}: SwipeableTaskCardProps) {
  const translateX = useRef(new Animated.Value(0)).current;

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationX < 0) {
        translateX.setValue(Math.max(event.translationX, -120));
      }
    })
    .onEnd((event) => {
      if (event.translationX < -60) {
        // Swipe left - show delete
        Animated.timing(translateX, {
          toValue: -120,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else {
        // Reset
        Animated.timing(translateX, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    });

  const handleDelete = () => {
    Animated.timing(translateX, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onDelete();
    });
  };

  const handleToggleComplete = () => {
    const newStatus: TaskStatus =
      task.status === "completed" ? "not_started" : "completed";
    onStatusChange(newStatus);
    Animated.timing(translateX, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <GestureDetector gesture={panGesture}>
      <View className="mb-3 relative overflow-hidden rounded-lg">
        {/* Background action buttons */}
        <View className="absolute right-0 top-0 bottom-0 flex-row bg-red-500 rounded-lg overflow-hidden">
          <Pressable
            onPress={handleDelete}
            className="flex-1 justify-center items-center bg-red-600"
          >
            <Text className="text-white text-lg font-bold">✕ Удалить</Text>
          </Pressable>
        </View>

        {/* Main card */}
        <Animated.View
          style={{ transform: [{ translateX }] }}
          className={`bg-surface border border-border rounded-lg p-4 ${STATUS_COLORS[task.status]}`}
        >
          <Pressable onPress={onPress} className="flex-1">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-1">
                  {emoji && <Text className="text-2xl">{emoji}</Text>}
                  <Text className="text-lg font-bold text-foreground flex-1">
                    {task.title}
                  </Text>
                </View>
                <Text className="text-sm text-muted">{task.description}</Text>
              </View>
              <View className={`${QUADRANT_COLORS[task.quadrant]} px-2 py-1 rounded`}>
                <Text className="text-white text-xs font-bold">{task.quadrant}</Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center mt-3">
              <Pressable
                onPress={handleToggleComplete}
                className={`px-3 py-1 rounded ${
                  task.status === "completed" ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <Text className="text-xs font-semibold text-white">
                  {task.status === "completed" ? "✓" : "○"}
                </Text>
              </Pressable>

              {task.dueDate && (
                <Text className="text-xs text-muted">{task.dueDate}</Text>
              )}
            </View>
          </Pressable>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}
