import { Modal, View, Text, Pressable, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColors } from "@/hooks/use-colors";
import { useI18n } from "@/lib/context/i18n-context";
import type { Task } from "@/lib/domain/types";
import * as Haptics from "expo-haptics";

interface KanbanStickerDetailModalProps {
  visible: boolean;
  sticker: Task | null;
  onClose: () => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export function KanbanStickerDetailModal({
  visible,
  sticker,
  onClose,
  onEdit,
  onDelete,
}: KanbanStickerDetailModalProps) {
  const colors = useColors();
  const { language } = useI18n();
  const isRu = language === "ru";

  if (!sticker) return null;

  const handleEdit = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onEdit?.(sticker);
    onClose();
  };

  const handleDelete = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onDelete?.(sticker.id);
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
          justifyContent: "center",
          alignItems: "center",
        }}
        edges={["top", "left", "right", "bottom"]}
      >
        <Pressable
          style={{ flex: 1, width: "100%" }}
          onPress={onClose}
        />

        <View
          style={{
            backgroundColor: colors.background,
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 16,
            marginHorizontal: 16,
            maxHeight: "70%",
            width: "90%",
            maxWidth: 400,
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
              marginBottom: 12,
            }}
          />

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Title */}
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: colors.foreground,
                marginBottom: 12,
              }}
            >
              {sticker.title}
            </Text>

            {/* Description */}
            {sticker.description && (
              <View style={{ marginBottom: 12 }}>
                <Text
                  style={{
                    fontSize: 11,
                    color: colors.muted,
                    marginBottom: 6,
                  }}
                >
                  {isRu ? "Описание" : "Description"}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    lineHeight: 18,
                    color: colors.foreground,
                  }}
                >
                  {sticker.description}
                </Text>
              </View>
            )}

            {/* Due Date */}
            {sticker.dueDate && (
              <View style={{ marginBottom: 10 }}>
                <Text
                  style={{
                    fontSize: 11,
                    color: colors.muted,
                    marginBottom: 4,
                  }}
                >
                  {isRu ? "Срок" : "Due Date"}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.foreground,
                  }}
                >
                  {new Date(sticker.dueDate).toLocaleDateString(isRu ? "ru-RU" : "en-US")}
                </Text>
              </View>
            )}

            {/* Priority */}
            <View style={{ marginBottom: 12 }}>
              <Text
                style={{
                  fontSize: 11,
                  color: colors.muted,
                  marginBottom: 4,
                }}
              >
                {isRu ? "Приоритет" : "Priority"}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.foreground,
                }}
              >
                {isRu ? "Важность" : "Importance"}: {sticker.importance} | {isRu ? "Срочность" : "Urgency"}: {sticker.urgency}
              </Text>
            </View>

            {/* Status */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 11,
                  color: colors.muted,
                  marginBottom: 4,
                }}
              >
                {isRu ? "Статус" : "Status"}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.foreground,
                  textTransform: "capitalize",
                }}
              >
                {sticker.status === "not_started"
                  ? isRu ? "Не начато" : "Not started"
                  : sticker.status === "in_progress"
                  ? isRu ? "В процессе" : "In progress"
                  : isRu ? "Выполнено" : "Completed"}
              </Text>
            </View>
          </ScrollView>

          {/* Action buttons */}
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginTop: 12,
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
                  fontSize: 13,
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
                    fontSize: 13,
                    fontWeight: "600",
                    color: "#FFFFFF",
                  }}
                >
                  {isRu ? "Ред." : "Edit"}
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
                    fontSize: 13,
                    fontWeight: "600",
                    color: "#FFFFFF",
                  }}
                >
                  {isRu ? "Удал." : "Delete"}
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        <Pressable
          style={{ flex: 1, width: "100%" }}
          onPress={onClose}
        />
      </SafeAreaView>
    </Modal>
  );
}
