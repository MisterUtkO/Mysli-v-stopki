import { View, Text, ScrollView } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useTaskContext } from "@/lib/context/task-context";

export default function StatisticsScreen() {
  const { tasks } = useTaskContext();

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const activeTasks = tasks.filter((t) => t.status === "active").length;
  const archivedTasks = tasks.filter((t) => t.status === "archived").length;

  const q1Count = tasks.filter((t) => t.eisenhower.quadrant === "Q1").length;
  const q2Count = tasks.filter((t) => t.eisenhower.quadrant === "Q2").length;
  const q3Count = tasks.filter((t) => t.eisenhower.quadrant === "Q3").length;
  const q4Count = tasks.filter((t) => t.eisenhower.quadrant === "Q4").length;

  const overdueTasks = tasks.filter(
    (t) => t.dueDate && t.dueDate < Date.now() && t.status === "active"
  );

  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Top 10 tasks by priority
  const topTasks = [...tasks]
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 10);

  // Average metrics
  const avgImportance =
    tasks.length > 0
      ? (
          tasks.reduce((sum, t) => sum + t.metrics.importanceScore, 0) /
          tasks.length
        ).toFixed(1)
      : "0";

  const avgUrgency =
    tasks.length > 0
      ? (
          tasks.reduce((sum, t) => sum + t.metrics.urgencyScore, 0) /
          tasks.length
        ).toFixed(1)
      : "0";



  return (
    <ScreenContainer className="p-4 pb-0">
      {/* Header */}
      <View className="mb-4">
        <Text className="text-3xl font-bold text-foreground">Statistics</Text>
        <Text className="text-sm text-muted mt-1">
          Overview of your task management
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View className="flex-row gap-2 mb-4">
          <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
            <Text className="text-xs text-muted mb-1">Total Tasks</Text>
            <Text className="text-3xl font-bold text-foreground">{totalTasks}</Text>
          </View>
          <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
            <Text className="text-xs text-muted mb-1">Active</Text>
            <Text className="text-3xl font-bold text-primary">{activeTasks}</Text>
          </View>
          <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
            <Text className="text-xs text-muted mb-1">Completed</Text>
            <Text className="text-3xl font-bold text-success">{completedTasks}</Text>
          </View>
        </View>

        {/* Completion Rate */}
        <View className="bg-surface rounded-lg p-4 border border-border mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-semibold text-foreground">Completion Rate</Text>
            <Text className="text-2xl font-bold text-primary">{completionRate}%</Text>
          </View>
          <View className="h-2 bg-background rounded-full overflow-hidden">
            <View
              className="h-full bg-primary"
              style={{ width: `${completionRate}%` }}
            />
          </View>
        </View>

        {/* Quadrant Distribution */}
        <View className="bg-surface rounded-lg p-4 border border-border mb-4">
          <Text className="text-sm font-semibold text-foreground mb-3">
            Quadrant Distribution
          </Text>
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: "#EF4444" }} />
                <Text className="text-sm text-muted">Do Now (Q1)</Text>
              </View>
              <Text className="text-sm font-semibold text-foreground">{q1Count}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: "#F59E0B" }} />
                <Text className="text-sm text-muted">Schedule (Q2)</Text>
              </View>
              <Text className="text-sm font-semibold text-foreground">{q2Count}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: "#3B82F6" }} />
                <Text className="text-sm text-muted">Delegate (Q3)</Text>
              </View>
              <Text className="text-sm font-semibold text-foreground">{q3Count}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: "#9CA3AF" }} />
                <Text className="text-sm text-muted">Delete (Q4)</Text>
              </View>
              <Text className="text-sm font-semibold text-foreground">{q4Count}</Text>
            </View>
          </View>
        </View>

        {/* Average Metrics */}
        <View className="bg-surface rounded-lg p-4 border border-border mb-4">
          <Text className="text-sm font-semibold text-foreground mb-3">
            Average Metrics
          </Text>
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Importance</Text>
              <Text className="text-sm font-semibold text-foreground">{avgImportance}/10</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Urgency</Text>
              <Text className="text-sm font-semibold text-foreground">{avgUrgency}/10</Text>
            </View>

          </View>
        </View>

        {/* Overdue Tasks */}
        {overdueTasks.length > 0 && (
          <View className="bg-error/10 rounded-lg p-4 border border-error mb-4">
            <Text className="text-sm font-semibold text-error mb-2">
              ⚠ {overdueTasks.length} Overdue Task{overdueTasks.length !== 1 ? "s" : ""}
            </Text>
            <View className="gap-1">
              {overdueTasks.slice(0, 5).map((task) => (
                <Text key={task.id} className="text-xs text-error" numberOfLines={1}>
                  • {task.title}
                </Text>
              ))}
              {overdueTasks.length > 5 && (
                <Text className="text-xs text-error">
                  +{overdueTasks.length - 5} more
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Top 10 Tasks */}
        {topTasks.length > 0 && (
          <View className="bg-surface rounded-lg p-4 border border-border mb-6">
            <Text className="text-sm font-semibold text-foreground mb-3">
              Top {Math.min(10, topTasks.length)} Priority Tasks
            </Text>
            <View className="gap-2">
              {topTasks.map((task, idx) => (
                <View key={task.id} className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-xs text-muted mb-0.5">
                      {idx + 1}. {task.title}
                    </Text>
                    <View className="flex-row gap-1">
                      <View
                        className="px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor:
                            task.eisenhower.quadrant === "Q1"
                              ? "#EF4444"
                              : task.eisenhower.quadrant === "Q2"
                                ? "#F59E0B"
                                : task.eisenhower.quadrant === "Q3"
                                  ? "#3B82F6"
                                  : "#9CA3AF",
                        }}
                      >
                        <Text className="text-xs text-white font-bold">
                          {task.eisenhower.quadrant}
                        </Text>
                      </View>
                    </View>
                  </View>
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
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
