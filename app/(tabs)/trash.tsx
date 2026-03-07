import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { ScreenWithBackground } from "@/components/screen-with-background";
import { useTaskContext } from "@/lib/context/task-context";
import { useI18n } from "@/lib/context/i18n-context";
import { SwipeableTaskCard } from "@/components/swipeable-task-card";
import type { Task, TaskStatus } from "@/lib/domain/types";
import { useState, useMemo } from "react";

export default function TrashScreen() {
  const router = useRouter();
  const { tasks, permanentlyDeleteTask, restoreTask } = useTaskContext();
  const { t, language } = useI18n();
  const isRu = language === "ru";
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Get deleted tasks
  const deletedTasks = useMemo(() => {
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    
    return tasks
      .filter((t) => t.isDeleted && t.deletedAt)
      .map((t) => ({
        task: t,
        daysUntilPermanent: Math.ceil((sevenDaysMs - (now - (t.deletedAt || 0))) / (1000 * 60 * 60 * 24)),
      }))
      .sort((a, b) => (b.task.deletedAt || 0) - (a.task.deletedAt || 0));
  }, [tasks]);

  const toggleExpand = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  const handleRestore = (taskId: string) => {
    restoreTask(taskId);
  };

  const handlePermanentDelete = (taskId: string, taskTitle: string) => {
    Alert.alert(
      isRu ? "Удалить навсегда?" : "Delete permanently?",
      isRu ? "Это действие невозможно отменить" : "This action cannot be undone",
      [
        { text: isRu ? "Отмена" : "Cancel", style: "cancel" },
        {
          text: isRu ? "Удалить" : "Delete",
          style: "destructive",
          onPress: () => permanentlyDeleteTask(taskId),
        },
      ]
    );
  };

  const handleStatusChange = async (taskId: string, currentStatus: TaskStatus) => {
    // Trash tasks can't change status
    Alert.alert(
      isRu ? "Восстановите задачу" : "Restore task",
      isRu ? "Восстановите задачу из корзины, чтобы изменить её статус" : "Restore the task from trash to change its status"
    );
  };

  return (
    <ScreenWithBackground>
      <ScreenContainer className="p-4">
        <View className="flex-1">
        {/* Header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          {/* Back button */}
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              {
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "transparent",
                borderWidth: 1.5,
                borderColor: "#9CA3AF",
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text style={{ fontSize: 18, color: "#9CA3AF" }}>←</Text>
          </Pressable>

          {/* Title */}
          <Text className="text-xl font-bold text-foreground">
            {isRu ? "Корзина" : "Trash"}
          </Text>

          {/* Spacer */}
          <View style={{ width: 40 }} />
        </View>

        {/* 7-day retention info */}
        <View style={{
          backgroundColor: "#FEF3C7",
          borderRadius: 12,
          padding: 12,
          marginBottom: 12,
          borderLeftWidth: 4,
          borderLeftColor: "#F59E0B",
        }}>
          <Text style={{ fontSize: 12, fontWeight: "600", color: "#92400E", marginBottom: 4 }}>
            ⏰ {isRu ? "Автоматическое удаление" : "Auto-delete"}
          </Text>
          <Text style={{ fontSize: 12, color: "#B45309" }}>
            {isRu 
              ? "Задачи удаляются навсегда через 7 дней. Восстановите нужные задачи до истечения срока."
              : "Tasks are permanently deleted after 7 days. Restore needed tasks before the deadline."}
          </Text>
        </View>

        {/* Deleted tasks list */}
        {deletedTasks.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>🗑️</Text>
            <Text className="text-muted text-center text-lg">
              {isRu ? "Корзина пуста" : "Trash is empty"}
            </Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ gap: 8, paddingBottom: 16 }}>
              {deletedTasks.map(({ task, daysUntilPermanent }) => (
                <View
                  key={task.id}
                  style={{
                    backgroundColor: "#FEF2F2",
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: "#FECACA",
                  }}
                >
                  {/* Task title and days remaining */}
                  <View style={{ marginBottom: 8 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: "#1F2937", flex: 1 }}>
                        {task.title}
                      </Text>
                      <View style={{
                        backgroundColor: daysUntilPermanent <= 2 ? "#EF4444" : "#F97316",
                        borderRadius: 6,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                      }}>
                        <Text style={{ fontSize: 11, fontWeight: "700", color: "#FFFFFF" }}>
                          {daysUntilPermanent} {isRu ? "дн" : "d"}
                        </Text>
                      </View>
                    </View>
                    {task.description && (
                      <Text style={{ fontSize: 12, color: "#6B7280" }}>
                        {task.description}
                      </Text>
                    )}
                  </View>

                  {/* Action buttons */}
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    {/* Restore button */}
                    <Pressable
                      onPress={() => handleRestore(task.id)}
                      style={({ pressed }) => [
                        {
                          flex: 1,
                          paddingVertical: 8,
                          borderRadius: 8,
                          backgroundColor: "#10B981",
                          alignItems: "center",
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 12, fontWeight: "600", color: "#FFFFFF" }}>
                        {isRu ? "Восстановить" : "Restore"}
                      </Text>
                    </Pressable>

                    {/* Permanent delete button */}
                    <Pressable
                      onPress={() => handlePermanentDelete(task.id, task.title)}
                      style={({ pressed }) => [
                        {
                          flex: 1,
                          paddingVertical: 8,
                          borderRadius: 8,
                          backgroundColor: "#EF4444",
                          alignItems: "center",
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 12, fontWeight: "600", color: "#FFFFFF" }}>
                        {isRu ? "Удалить" : "Delete"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
        </View>
      </ScreenContainer>
    </ScreenWithBackground>
  );
}