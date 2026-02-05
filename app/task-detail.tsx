import {
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { MetricSlider } from "@/components/metric-slider";
import { PriorityDisplay } from "@/components/priority-display";
import { useTaskContext } from "@/lib/context/task-context";
import { calculateScoring } from "@/lib/domain/scoring";
import type { Task, Metrics } from "@/lib/domain/types";
import * as Haptics from "expo-haptics";

export default function TaskDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { createTask, updateTask, deleteTask, tasks, settings } = useTaskContext();

  const [task, setTask] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<"active" | "done" | "archived">("active");

  const [metrics, setMetrics] = useState<Metrics>({
    importanceScore: 5,
    urgencyScore: 5,
    impactScore: 5,
    effortScore: 5,
    riskScore: 5,
  });

  const [scoring, setScoring] = useState(
    calculateScoring(metrics, settings?.weights || {
      wImportance: 0.30,
      wUrgency: 0.25,
      wImpact: 0.25,
      wRisk: 0.15,
      wEffort: 0.05,
    }, settings?.thresholds || {
      importanceThreshold: 6,
      urgencyThreshold: 6,
    })
  );

  const [loading, setLoading] = useState(false);

  // Load task if editing
  useEffect(() => {
    if (id) {
      const existingTask = tasks.find((t) => t.id === id);
      if (existingTask) {
        setTask(existingTask);
        setTitle(existingTask.title);
        setDescription(existingTask.description);
        setDueDate(
          existingTask.dueDate
            ? new Date(existingTask.dueDate).toISOString().split("T")[0]
            : ""
        );
        setTags(existingTask.tags.join(", "));
        setStatus(existingTask.status);
        setMetrics(existingTask.metrics);
        setScoring(calculateScoring(
          existingTask.metrics,
          settings?.weights || {
            wImportance: 0.30,
            wUrgency: 0.25,
            wImpact: 0.25,
            wRisk: 0.15,
            wEffort: 0.05,
          },
          settings?.thresholds || {
            importanceThreshold: 6,
            urgencyThreshold: 6,
          }
        ));
      }
    }
  }, [id, tasks, settings]);

  // Recalculate scoring when metrics change
  useEffect(() => {
    if (settings) {
      const newScoring = calculateScoring(metrics, settings.weights, settings.thresholds);
      setScoring(newScoring);
    }
  }, [metrics, settings]);

  const handleMetricChange = (key: keyof Metrics, value: number) => {
    setMetrics((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a task title");
      return;
    }

    setLoading(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const dueDateTimestamp = dueDate
        ? new Date(dueDate).getTime()
        : undefined;
      const tagArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      if (task) {
        // Update existing task
        await updateTask(task.id, {
          title,
          description,
          dueDate: dueDateTimestamp,
          tags: tagArray,
          status,
          metrics,
        });
      } else {
        // Create new task
        await createTask(title, metrics, {
          description,
          dueDate: dueDateTimestamp,
          tags: tagArray,
        });
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error("Failed to save task:", error);
      Alert.alert("Error", "Failed to save task");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!task) return;

    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Delete",
        onPress: async () => {
          setLoading(true);
          try {
            await deleteTask(task.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
          } catch (error) {
            console.error("Failed to delete task:", error);
            Alert.alert("Error", "Failed to delete task");
          } finally {
            setLoading(false);
          }
        },
        style: "destructive",
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScreenContainer className="p-4">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-muted mb-2">Title *</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter task title"
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              placeholderTextColor="#9BA1A6"
            />
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-muted mb-2">Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Enter task description (optional)"
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              placeholderTextColor="#9BA1A6"
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Due Date */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-muted mb-2">Due Date</Text>
            <TextInput
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="YYYY-MM-DD"
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              placeholderTextColor="#9BA1A6"
            />
          </View>

          {/* Tags */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-muted mb-2">Tags</Text>
            <TextInput
              value={tags}
              onChangeText={setTags}
              placeholder="Separate tags with commas"
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              placeholderTextColor="#9BA1A6"
            />
          </View>

          {/* Metrics Section */}
          <View className="mb-6 bg-surface rounded-lg p-4 border border-border">
            <Text className="text-base font-bold text-foreground mb-4">Metrics</Text>

            <MetricSlider
              label="Importance"
              value={metrics.importanceScore}
              onChange={(value) => handleMetricChange("importanceScore", value)}
              description="How important is this task?"
            />

            <MetricSlider
              label="Urgency"
              value={metrics.urgencyScore}
              onChange={(value) => handleMetricChange("urgencyScore", value)}
              description="How urgent is this task?"
            />

            <MetricSlider
              label="Impact"
              value={metrics.impactScore}
              onChange={(value) => handleMetricChange("impactScore", value)}
              description="What's the potential impact?"
            />

            <MetricSlider
              label="Effort"
              value={metrics.effortScore}
              onChange={(value) => handleMetricChange("effortScore", value)}
              description="How much effort is required?"
            />

            <MetricSlider
              label="Risk"
              value={metrics.riskScore}
              onChange={(value) => handleMetricChange("riskScore", value)}
              description="What's the risk if not done?"
            />
          </View>

          {/* Priority Display */}
          <PriorityDisplay
            score={scoring.priorityScore}
            quadrant={scoring.quadrant}
            hint={scoring.nextActionHint}
          />

          {/* Status */}
          {task && (
            <View className="mt-6 mb-6">
              <Text className="text-sm font-semibold text-muted mb-3">Status</Text>
              <View className="flex-row gap-2">
                {(["active", "done", "archived"] as const).map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => setStatus(s)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  >
                    <View
                      className={`px-4 py-2 rounded-lg border ${
                        status === s
                          ? "bg-primary border-primary"
                          : "bg-surface border-border"
                      }`}
                    >
                      <Text
                        className={`font-medium capitalize ${
                          status === s ? "text-white" : "text-foreground"
                        }`}
                      >
                        {s}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row gap-3 mt-6 mb-6">
            <Pressable
              onPress={handleSave}
              disabled={loading}
              style={({ pressed }) => [
                { opacity: pressed ? 0.8 : 1, flex: 1 },
              ]}
              className="bg-primary rounded-lg py-3 items-center"
            >
              <Text className="text-white font-semibold">
                {loading ? "Saving..." : task ? "Update" : "Create"}
              </Text>
            </Pressable>

            {task && (
              <Pressable
                onPress={handleDelete}
                disabled={loading}
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                className="bg-error px-6 rounded-lg py-3 items-center"
              >
                <Text className="text-white font-semibold">Delete</Text>
              </Pressable>
            )}
          </View>

          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            className="py-3 items-center mb-6"
          >
            <Text className="text-primary font-semibold">Cancel</Text>
          </Pressable>
        </ScrollView>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}
