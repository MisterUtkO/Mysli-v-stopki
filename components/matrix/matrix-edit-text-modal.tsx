import { Modal, View, Text, TextInput, Pressable, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColors } from "@/hooks/use-colors";
import { useI18n } from "@/lib/context/i18n-context";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import type { Task } from "@/lib/domain/types";

interface MatrixEditTextModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (taskId: string, newTitle: string) => Promise<void>;
}

export function MatrixEditTextModal({
  visible,
  task,
  onClose,
  onSave,
}: MatrixEditTextModalProps) {
  const colors = useColors();
  const { language } = useI18n();
  const isRu = language === "ru";
  const [editedTitle, setEditedTitle] = useState(task?.title || "");

  if (!task) return null;

  const handleSave = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (editedTitle.trim()) {
      await onSave(task.id, editedTitle.trim());
    }
    onClose();
  };

  const handleCancel = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setEditedTitle(task?.title || "");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
      presentationStyle="overFullScreen"
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
        <View
          style={{
            backgroundColor: colors.background,
            borderRadius: 12,
            padding: 20,
            width: "85%",
            maxWidth: 400,
            gap: 16,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: colors.foreground,
            }}
          >
            {isRu ? "Редактировать задачу" : "Edit Task"}
          </Text>

          <TextInput
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
              color: colors.foreground,
              backgroundColor: colors.surface,
              minHeight: 100,
              textAlignVertical: "top",
            }}
            placeholder={isRu ? "Текст задачи..." : "Task text..."}
            placeholderTextColor={colors.muted}
            value={editedTitle}
            onChangeText={setEditedTitle}
            multiline
            maxLength={500}
          />

          <View style={{ flexDirection: "row", gap: 12, justifyContent: "flex-end" }}>
            <Pressable
              onPress={handleCancel}
              style={({ pressed }) => ({
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: colors.surface,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ color: colors.foreground, fontWeight: "500" }}>
                {isRu ? "Отмена" : "Cancel"}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleSave}
              style={({ pressed }) => ({
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: colors.primary,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ color: colors.background, fontWeight: "600" }}>
                {isRu ? "Сохранить" : "Save"}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
