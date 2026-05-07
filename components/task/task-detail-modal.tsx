import { Modal, View, Text, Pressable, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColors } from "@/hooks/use-colors";
import { useI18n } from "@/lib/context/i18n-context";
import type { Task } from "@/lib/domain/types";
import * as Haptics from "expo-haptics";
import { AttachmentViewer } from "./attachment-viewer";
import { useState } from "react";

interface TaskDetailModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onMarkComplete?: (taskId: string) => void;
  onExportToCalendar?: (task: Task) => void;
  onExportToKanban?: (task: Task) => void;
}

export function TaskDetailModal({
  visible,
  task,
  onClose,
  onEdit,
  onDelete,
  onMarkComplete,
  onExportToCalendar,
  onExportToKanban,
}: TaskDetailModalProps) {
  const colors = useColors();
  const { language } = useI18n();
  const isRu = language === "ru";
  const [attachmentViewerVisible, setAttachmentViewerVisible] = useState(false);

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

  const handleMarkComplete = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onMarkComplete?.(task.id);
    onClose();
  };

  const handleExportToCalendar = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onExportToCalendar?.(task);
  };

  const handleExportToKanban = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onExportToKanban?.(task);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
    >
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "flex-end",
        }}
        edges={["top", "left", "right"]}
      >
        {/* Overlay background - tappable to close */}
        <Pressable
          style={{ flex: 1 }}
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        />

        {/* Modal content */}
        <View
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 24,
            maxHeight: "80%",
            zIndex: 1000,
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

          {/* Scrollable content */}
          <ScrollView 
            showsVerticalScrollIndicator={false}
            scrollEnabled={true}
            nestedScrollEnabled={true}
          >
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

            {/* Attachments */}
            {task.attachments && task.attachments.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.muted,
                    marginBottom: 8,
                  }}
                >
                  {isRu ? "Вложения" : "Attachments"} ({task.attachments.length})
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  {task.attachments.map((attachment, index) => (
                    <Pressable
                      key={index}
                      onPress={() => {
                        if (Platform.OS !== "web") {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                        setAttachmentViewerVisible(true);
                      }}
                      style={({ pressed }) => [{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 6,
                        backgroundColor: colors.surface,
                        opacity: pressed ? 0.7 : 1,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }]}
                    >
                      <Text style={{ fontSize: 14 }}>📎</Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.foreground,
                          maxWidth: 100,
                        }}
                        numberOfLines={1}
                      >
                        {attachment.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Action buttons - Row 1 */}
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              marginTop: 16,
              zIndex: 1001,
            }}
          >
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                {
                  flex: 1,
                  paddingVertical: 10,
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
                  fontSize: 12,
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
                    paddingVertical: 10,
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
                    fontSize: 12,
                    fontWeight: "600",
                    color: "#FFFFFF",
                  }}
                >
                  {isRu ? "Редактировать" : "Edit"}
                </Text>
              </Pressable>
            )}

            {onMarkComplete && (
              <Pressable
                onPress={handleMarkComplete}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 8,
                    backgroundColor: "#22C55E",
                    opacity: pressed ? 0.8 : 1,
                    justifyContent: "center",
                    alignItems: "center",
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: "#FFFFFF",
                  }}
                >
                  {isRu ? "Выполнено" : "Complete"}
                </Text>
              </Pressable>
            )}

            {onDelete && (
              <Pressable
                onPress={handleDelete}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    paddingVertical: 10,
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
                    fontSize: 12,
                    fontWeight: "600",
                    color: "#FFFFFF",
                  }}
                >
                  {isRu ? "Удалить" : "Delete"}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Action buttons - Row 2 (Export buttons) */}
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              marginTop: 8,
              zIndex: 1001,
            }}
          >
            {onExportToCalendar && (
              <Pressable
                onPress={handleExportToCalendar}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 8,
                    backgroundColor: "#3B82F6",
                    opacity: pressed ? 0.8 : 1,
                    justifyContent: "center",
                    alignItems: "center",
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: "#FFFFFF",
                  }}
                >
                  {isRu ? "📅 Календарь" : "📅 Calendar"}
                </Text>
              </Pressable>
            )}

            {onExportToKanban && (
              <Pressable
                onPress={handleExportToKanban}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 8,
                    backgroundColor: "#8B5CF6",
                    opacity: pressed ? 0.8 : 1,
                    justifyContent: "center",
                    alignItems: "center",
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: "#FFFFFF",
                  }}
                >
                  {isRu ? "📌 Канбан" : "📌 Kanban"}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </SafeAreaView>

      {/* Attachment Viewer Modal */}
      {task.attachments && task.attachments.length > 0 && (
        <AttachmentViewer
          visible={attachmentViewerVisible}
          attachments={task.attachments}
          onClose={() => setAttachmentViewerVisible(false)}
        />
      )}
    </Modal>
  );
}
