import { View, Text, ScrollView, Pressable } from "react-native";
import { TaskCard } from "./task-card";
import type { Task } from "@/lib/domain/types";

interface MatrixQuadrantProps {
  quadrant: "Q1" | "Q2" | "Q3" | "Q4";
  tasks: Task[];
  onTaskPress?: (taskId: string) => void;
}

const QUADRANT_INFO = {
  Q1: {
    color: "#EF4444",
    title: "Do Now",
    subtitle: "Important & Urgent",
    description: "Do these tasks immediately",
  },
  Q2: {
    color: "#F59E0B",
    title: "Schedule",
    subtitle: "Important & Not Urgent",
    description: "Plan these for later",
  },
  Q3: {
    color: "#3B82F6",
    title: "Delegate",
    subtitle: "Not Important & Urgent",
    description: "Delegate or defer these",
  },
  Q4: {
    color: "#9CA3AF",
    title: "Delete",
    subtitle: "Not Important & Not Urgent",
    description: "Eliminate or skip these",
  },
};

export function MatrixQuadrant({
  quadrant,
  tasks,
  onTaskPress,
}: MatrixQuadrantProps) {
  const info = QUADRANT_INFO[quadrant];

  return (
    <View className="flex-1 bg-surface rounded-lg border-2 overflow-hidden" style={{ borderColor: info.color }}>
      {/* Header */}
      <View className="p-3" style={{ backgroundColor: info.color }}>
        <Text className="text-white font-bold text-base">{info.title}</Text>
        <Text className="text-white/80 text-xs">{info.subtitle}</Text>
        <View className="bg-white/20 px-2 py-1 rounded mt-1 self-start">
          <Text className="text-white text-xs font-semibold">{tasks.length} tasks</Text>
        </View>
      </View>

      {/* Tasks List */}
      <ScrollView className="flex-1 p-2">
        {tasks.length === 0 ? (
          <View className="flex-1 items-center justify-center py-6">
            <Text className="text-muted text-sm text-center">{info.description}</Text>
          </View>
        ) : (
          tasks.map((task) => (
            <Pressable
              key={task.id}
              onPress={() => onTaskPress?.(task.id)}
              className="mb-2"
            >
              <View className="bg-background rounded p-2 border border-border">
                <Text className="text-sm font-semibold text-foreground" numberOfLines={2}>
                  {task.title}
                </Text>
                <View className="flex-row items-center justify-between mt-1">
                  <View className="flex-row gap-1">
                    {task.tags.slice(0, 2).map((tag, idx) => (
                      <View key={idx} className="bg-primary/10 px-1.5 py-0.5 rounded">
                        <Text className="text-xs text-primary">#{tag}</Text>
                      </View>
                    ))}
                  </View>
                  <View
                    className="w-6 h-6 rounded-full items-center justify-center"
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
                      {Math.round(task.priorityScore / 10)}
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}
