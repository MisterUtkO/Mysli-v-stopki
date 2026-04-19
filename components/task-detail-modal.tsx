import { Modal, View, Text, Pressable, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColors } from "@/hooks/use-colors";
import { useI18n } from "@/lib/context/i18n-context";
import type { Task } from "@/lib/domain/types";
import * as Haptics from "expo-haptics";

interface TaskDetailModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export function TaskDetailModal({
  visible,
  task,
  onClose,
  onEdit,
  onDelete,
}: TaskDetailModalProps) {
  const colors = useColors();
  const { language } = useI18n();
  const isRu = language === "ru";

  if (!task) return null;

  const handleEdit = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onEdit?.(task);
    onClose();
  };

  const handleDelete = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onDelete?.(task.id);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "flex-end",
        }}
        edges={["top", "left", "right"]}
      >
        <Pressable
          style={{ flex: 1 }}
          onPress={onClose}
        />

        <View
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 24,
            maxHeight: "80%",
          }}
        >
          {/* Handle bar */}
          <View
            style={{
              alignSelf: "center",
              width: 40,
              height: 4,
              backgroundColor: colors.border,
              borderRadius: 2,
              marginBottom: 16,
            }}
          />

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Title */}
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: colors.foreground,
                marginBottom: 12,
              }}
            >
              {task.title}
            </Text>

            {/* Description */}
            {task.description && (
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.muted,
                    marginBottom: 8,
                  }}
                >
                  {isRu ? "Описание" : "Description"}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    lineHeight: 20,
                    color: colors.foreground,
                  }}
                >
                  {task.description}
                </Text>
              </View>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <View style={{ marginBottom: 12 }}>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.muted,
                    marginBottom: 4,
                  }}
                >
                  {isRu ? "Срок" : "Due Date"}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.foreground,
                  }}
                >
                  {new Date(task.dueDate).toLocaleDateString(isRu ? "ru-RU" : "en-US")}
                </Text>
              </View>
            )}

            {/* Priority */}
            <View style={{ marginBottom: 12 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.muted,
                  marginBottom: 4,
                }}
              >
                {isRu ? "Приоритет" : "Priority"}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.foreground,
                }}
              >
                {isRu ? "Важность" : "Importance"}: {task.importance} | {isRu ? "Срочность" : "Urgency"}: {task.urgency}
              </Text>
            </View>

            {/* Status */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.muted,
                  marginBottom: 4,
                }}
              >
                {isRu ? "Статус" : "Status"}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.foreground,
                  textTransform: "capitalize",
                }}
              >
                {task.status === "not_started"
                  ? isRu ? "Не начато" : "Not started"
                  : task.status === "in_progress"
                  ? isRu ? "В процессе" : "In progress"
                  : isRu ? "Выполнено" : "Completed"}
              </Text>
            </View>
          </ScrollView>

          {/* Action buttons */}
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              marginTop: 16,
            }}
          >
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                {
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: colors.surface,
                  opacity: pressed ? 0.7 : 1,
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.foreground,
                }}
              >
                {isRu ? "Закрыть" : "Close"}
              </Text>
            </Pressable>

            {onEdit && (
              <Pressable
                onPress={handleEdit}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 8,
                    backgroundColor: colors.primary,
                    opacity: pressed ? 0.8 : 1,
                    justifyContent: "center",
                    alignItems: "center",
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#FFFFFF",
                  }}
                >
                  {isRu ? "Редактировать" : "Edit"}
                </Text>
              </Pressable>
            )}

            {onDelete && (
              <Pressable
                onPress={handleDelete}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 8,
                    backgroundColor: "#EF4444",
                    opacity: pressed ? 0.8 : 1,
                    justifyContent: "center",
                    alignItems: "center",
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#FFFFFF",
                  }}
                >
                  {isRu ? "Удалить" : "Delete"}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
