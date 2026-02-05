import { ScrollView, View, Text, Pressable, FlatList, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { TaskCard } from "@/components/task-card";
import { useTaskContext } from "@/lib/context/task-context";
import * as Haptics from "expo-haptics";
import { cn } from "@/lib/utils";

export default function HomeScreen() {
  const router = useRouter();
  const { tasks, markTaskDone, deleteTask, archiveTask, searchTasks } = useTaskContext();

  const [filteredTasks, setFilteredTasks] = useState(tasks);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuadrant, setSelectedQuadrant] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"priority" | "dueDate" | "created">("priority");

  useEffect(() => {
    let result = tasks;

    // Filter by quadrant
    if (selectedQuadrant) {
      result = result.filter((t) => t.eisenhower.quadrant === selectedQuadrant);
    }

    // Search
    if (searchQuery.trim()) {
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    if (sortBy === "priority") {
      result.sort((a, b) => b.priorityScore - a.priorityScore);
    } else if (sortBy === "dueDate") {
      result.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate - b.dueDate;
      });
    } else if (sortBy === "created") {
      result.sort((a, b) => b.createdAt - a.createdAt);
    }

    setFilteredTasks(result);
  }, [tasks, selectedQuadrant, searchQuery, sortBy]);

  const handleCreateTask = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/task-detail");
  };

  const handleTaskPress = (taskId: string) => {
    router.push({
      pathname: "/task-detail",
      params: { id: taskId },
    });
  };

  const handleMarkDone = async (taskId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await markTaskDone(taskId);
    } catch (error) {
      console.error("Failed to mark task as done:", error);
    }
  };

  const handleDelete = async (taskId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleArchive = async (taskId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await archiveTask(taskId);
    } catch (error) {
      console.error("Failed to archive task:", error);
    }
  };

  const quadrantCounts = {
    Q1: tasks.filter((t) => t.eisenhower.quadrant === "Q1").length,
    Q2: tasks.filter((t) => t.eisenhower.quadrant === "Q2").length,
    Q3: tasks.filter((t) => t.eisenhower.quadrant === "Q3").length,
    Q4: tasks.filter((t) => t.eisenhower.quadrant === "Q4").length,
  };

  const QUADRANTS = [
    { id: "Q1", label: "Do Now", color: "#EF4444" },
    { id: "Q2", label: "Schedule", color: "#F59E0B" },
    { id: "Q3", label: "Delegate", color: "#3B82F6" },
    { id: "Q4", label: "Delete", color: "#9CA3AF" },
  ];

  return (
    <ScreenContainer className="p-4 pb-0">
      {/* Header */}
      <View className="mb-4">
        <Text className="text-3xl font-bold text-foreground">Tasks</Text>
        <Text className="text-sm text-muted mt-1">
          {filteredTasks.length} of {tasks.length} tasks
        </Text>
      </View>

      {/* Search Bar */}
      <View className="mb-4 bg-surface rounded-lg border border-border px-3 py-2 flex-row items-center">
        <Text className="text-muted mr-2">🔍</Text>
        <TextInput
          placeholder="Search tasks..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 text-foreground"
          placeholderTextColor="#9BA1A6"
        />
      </View>

      {/* Quadrant Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        <Pressable
          onPress={() => setSelectedQuadrant(null)}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
        >
          <View
            className={cn(
              "px-4 py-2 rounded-full mr-2 border",
              selectedQuadrant === null
                ? "bg-primary border-primary"
                : "bg-surface border-border"
            )}
          >
            <Text
              className={cn(
                "font-semibold text-sm",
                selectedQuadrant === null ? "text-white" : "text-foreground"
              )}
            >
              All ({tasks.length})
            </Text>
          </View>
        </Pressable>

        {QUADRANTS.map((quad) => (
          <Pressable
            key={quad.id}
            onPress={() => setSelectedQuadrant(quad.id)}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <View
              className={cn(
                "px-4 py-2 rounded-full mr-2 border",
                selectedQuadrant === quad.id
                  ? "border-2"
                  : "bg-surface border-border"
              )}
              style={
                selectedQuadrant === quad.id
                  ? { backgroundColor: quad.color, borderColor: quad.color }
                  : {}
              }
            >
              <Text
                className={cn(
                  "font-semibold text-sm",
                  selectedQuadrant === quad.id ? "text-white" : "text-foreground"
                )}
              >
                {quad.label} ({quadrantCounts[quad.id as keyof typeof quadrantCounts]})
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Sort Options */}
      <View className="flex-row gap-2 mb-4">
        {(["priority", "dueDate", "created"] as const).map((sort) => (
          <Pressable
            key={sort}
            onPress={() => setSortBy(sort)}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <View
              className={cn(
                "px-3 py-1.5 rounded-full border text-xs",
                sortBy === sort
                  ? "bg-primary border-primary"
                  : "bg-surface border-border"
              )}
            >
              <Text
                className={cn(
                  "text-xs font-medium",
                  sortBy === sort ? "text-white" : "text-foreground"
                )}
              >
                {sort === "priority"
                  ? "Priority"
                  : sort === "dueDate"
                    ? "Due Date"
                    : "Created"}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Tasks List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => handleTaskPress(item.id)}
          />
        )}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-12">
            <Text className="text-muted text-base">No tasks found</Text>
            <Text className="text-muted text-sm mt-2">
              {selectedQuadrant ? "Try a different filter" : "Create your first task"}
            </Text>
          </View>
        }
        scrollEnabled={false}
      />

      {/* Floating Action Button */}
      <Pressable
        onPress={handleCreateTask}
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.8 : 1,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          },
        ]}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary items-center justify-center shadow-lg"
      >
        <Text className="text-white text-3xl font-bold">+</Text>
      </Pressable>
    </ScreenContainer>
  );
}
