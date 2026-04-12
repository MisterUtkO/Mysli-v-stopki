import { View, Text, FlatList, Pressable, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { ScreenTransition } from "@/components/screen-transition";
import { useTaskContext } from "@/lib/context/task-context";
import { useI18n } from "@/lib/context/i18n-context";
import type { Task } from "@/lib/domain/types";
import { useMemo } from "react";

export default function TrashScreen() {
  const router = useRouter();
  const { tasks, restoreTask, permanentlyDeleteTask } = useTaskContext();
  const { t, language } = useI18n();
  const isRu = language === "ru";

  // Get deleted tasks
  const deletedTasks = useMemo(() => tasks.filter((t) => t.isDeleted), [tasks]);

  const handleRestore = (taskId: string, taskTitle: string) => {
    Alert.alert(
      isRu ? "Восстановить?" : "Restore?",
      isRu
        ? `Восстановить задачу "${taskTitle}"?`
        : `Restore task "${taskTitle}"?`,
      [
        {
          text: isRu ? "Отмена" : "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: isRu ? "Восстановить" : "Restore",
          onPress: async () => {
            if (restoreTask) {
              await restoreTask(taskId);
              if (Platform.OS === "android") {
                Alert.alert(
                  isRu ? "Восстановлено" : "Restored",
                  isRu ? "Задача восстановлена" : "Task restored"
                );
              }
            }
          },
          style: "default",
        },
      ]
    );
  };

  const handlePermanentDelete = (taskId: string, taskTitle: string) => {
    Alert.alert(
      isRu ? "Удалить навсегда?" : "Delete permanently?",
      isRu
        ? `Это действие нельзя отменить. Задача "${taskTitle}" будет удалена навсегда.`
        : `This action cannot be undone. Task "${taskTitle}" will be deleted permanently.`,
      [
        {
          text: isRu ? "Отмена" : "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: isRu ? "Удалить" : "Delete",
          onPress: async () => {
            if (permanentlyDeleteTask) {
              await permanentlyDeleteTask(taskId);
              if (Platform.OS === "android") {
                Alert.alert(
                  isRu ? "Удалено" : "Deleted",
                  isRu ? "Задача удалена навсегда" : "Task deleted permanently"
                );
              }
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleClearTrash = async () => {
    if (deletedTasks.length === 0) return;

    Alert.alert(
      isRu ? "Очистить корзину?" : "Clear trash?",
      isRu
        ? `Это действие удалит ${deletedTasks.length} задач(и) навсегда.`
        : `This will permanently delete ${deletedTasks.length} task(s).`,
      [
        {
          text: isRu ? "Отмена" : "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: isRu ? "Очистить" : "Clear",
          onPress: async () => {
            if (permanentlyDeleteTask) {
              for (const task of deletedTasks) {
                await permanentlyDeleteTask(task.id);
              }
              if (Platform.OS === "android") {
                Alert.alert(
                  isRu ? "Корзина очищена" : "Trash cleared",
                  isRu ? "Все задачи удалены навсегда" : "All tasks deleted permanently"
                );
              }
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const renderDeletedTask = ({ item }: { item: Task }) => (
    <View
      style={{
        backgroundColor: "#f5f5f5",
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: "#EF4444",
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#11181C", marginBottom: 4 }}>
            {item.title}
          </Text>
          {item.description && (
            <Text style={{ fontSize: 13, color: "#687076", marginBottom: 4 }} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          {item.dueDate && (
            <Text style={{ fontSize: 12, color: "#9CA3AF" }}>
              {isRu ? "Срок: " : "Due: "}
              {new Date(item.dueDate).toLocaleDateString(isRu ? "ru-RU" : "en-US")}
            </Text>
          )}
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <Pressable
          onPress={() => handleRestore(item.id, item.title)}
          style={({ pressed }) => [
            {
              flex: 1,
              backgroundColor: "#10B981",
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8,
              alignItems: "center",
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 13 }}>
            {isRu ? "Восстановить" : "Restore"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => handlePermanentDelete(item.id, item.title)}
          style={({ pressed }) => [
            {
              flex: 1,
              backgroundColor: "#EF4444",
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8,
              alignItems: "center",
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 13 }}>
            {isRu ? "Удалить" : "Delete"}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <ScreenTransition>
      <ScreenContainer className="p-4">
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
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
                  opacity: pressed ? 0.6 : 1,
                },
              ]}
            >
              <Text style={{ fontSize: 18, color: "#9CA3AF" }}>←</Text>
            </Pressable>

            <Text style={{ fontSize: 18, fontWeight: "700", color: "#11181C" }}>
              {isRu ? "Корзина" : "Trash"}
            </Text>

            {deletedTasks.length > 0 && (
              <Pressable
                onPress={handleClearTrash}
                style={({ pressed }) => [
                  {
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "#EF4444",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text style={{ fontSize: 18, color: "#FFFFFF" }}>🗑️</Text>
              </Pressable>
            )}

            {deletedTasks.length === 0 && (
              <View style={{ width: 40, height: 40 }} />
            )}
          </View>

          {/* Content */}
          {deletedTasks.length === 0 ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontSize: 16, color: "#9CA3AF", textAlign: "center" }}>
                {isRu ? "Корзина пуста" : "Trash is empty"}
              </Text>
            </View>
          ) : (
            <FlatList
              data={deletedTasks}
              renderItem={renderDeletedTask}
              keyExtractor={(item) => item.id}
              scrollEnabled={true}
              contentContainerStyle={{ paddingBottom: 16 }}
            />
          )}
        </View>
      </ScreenContainer>
    </ScreenTransition>
  );
}
