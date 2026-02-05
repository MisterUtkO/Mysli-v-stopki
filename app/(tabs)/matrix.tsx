import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { MatrixQuadrant } from "@/components/matrix-quadrant";
import { useTaskContext } from "@/lib/context/task-context";

export default function MatrixScreen() {
  const router = useRouter();
  const { tasks } = useTaskContext();

  const q1Tasks = tasks.filter((t) => t.eisenhower.quadrant === "Q1");
  const q2Tasks = tasks.filter((t) => t.eisenhower.quadrant === "Q2");
  const q3Tasks = tasks.filter((t) => t.eisenhower.quadrant === "Q3");
  const q4Tasks = tasks.filter((t) => t.eisenhower.quadrant === "Q4");

  const handleTaskPress = (taskId: string) => {
    router.push({
      pathname: "/task-detail",
      params: { id: taskId },
    });
  };

  return (
    <ScreenContainer className="p-4 pb-0">
      {/* Header */}
      <View className="mb-4">
        <Text className="text-3xl font-bold text-foreground">Eisenhower Matrix</Text>
        <Text className="text-sm text-muted mt-1">
          Organize tasks by importance and urgency
        </Text>
      </View>

      {/* Matrix Grid */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Top Row */}
        <View className="flex-row gap-2 mb-2">
          {/* Q1 - Important & Urgent */}
          <View className="flex-1">
            <MatrixQuadrant
              quadrant="Q1"
              tasks={q1Tasks}
              onTaskPress={handleTaskPress}
            />
          </View>

          {/* Q2 - Important & Not Urgent */}
          <View className="flex-1">
            <MatrixQuadrant
              quadrant="Q2"
              tasks={q2Tasks}
              onTaskPress={handleTaskPress}
            />
          </View>
        </View>

        {/* Bottom Row */}
        <View className="flex-row gap-2 mb-6">
          {/* Q3 - Not Important & Urgent */}
          <View className="flex-1">
            <MatrixQuadrant
              quadrant="Q3"
              tasks={q3Tasks}
              onTaskPress={handleTaskPress}
            />
          </View>

          {/* Q4 - Not Important & Not Urgent */}
          <View className="flex-1">
            <MatrixQuadrant
              quadrant="Q4"
              tasks={q4Tasks}
              onTaskPress={handleTaskPress}
            />
          </View>
        </View>

        {/* Summary */}
        <View className="bg-surface rounded-lg p-4 border border-border mb-6">
          <Text className="text-base font-bold text-foreground mb-3">Summary</Text>
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Total Tasks:</Text>
              <Text className="text-sm font-semibold text-foreground">{tasks.length}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Do Now (Q1):</Text>
              <Text className="text-sm font-semibold text-error">{q1Tasks.length}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Schedule (Q2):</Text>
              <Text className="text-sm font-semibold text-warning">{q2Tasks.length}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Delegate (Q3):</Text>
              <Text className="text-sm font-semibold" style={{ color: "#3B82F6" }}>
                {q3Tasks.length}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Delete (Q4):</Text>
              <Text className="text-sm font-semibold text-muted">{q4Tasks.length}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
