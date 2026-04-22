import { Modal, View, Text, Pressable, ScrollView, Platform, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColors } from "@/hooks/use-colors";
import { useI18n } from "@/lib/context/i18n-context";
import type { Task } from "@/lib/domain/types";
import * as Haptics from "expo-haptics";
import { useState } from "react";

interface KanbanStickerDetailModalProps {
  visible: boolean;
  sticker: Task | null;
  onClose: () => void;
  onEdit?: (sticker: any) => void;
  onDelete?: (taskId: string) => void;
  onSave?: (stickerId: string, text: string, bgColor: string, textColor: string) => void;
  stickerBgColor?: string;
  stickerTextColor?: string;
}

const BG_COLORS = ["#FFEB3B", "#FF9800", "#F44336", "#4CAF50", "#2196F3", "#9C27B0"];
const TEXT_COLORS = ["#000000", "#FFFFFF"];

export function KanbanStickerDetailModal({
  visible,
  sticker,
  onClose,
  onEdit,
  onDelete,
  onSave,
  stickerBgColor = "#FFEB3B",
  stickerTextColor = "#000000",
}: KanbanStickerDetailModalProps) {
  const colors = useColors();
  const { language } = useI18n();
  const isRu = language === "ru";

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(sticker?.title || "");
  const [editBgColor, setEditBgColor] = useState(stickerBgColor);
  const [editTextColor, setEditTextColor] = useState(stickerTextColor);

  if (!sticker) return null;

  const handleEdit = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsEditing(true);
  };

  const handleSave = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (editText.trim()) {
      onSave?.(sticker.id, editText.trim(), editBgColor, editTextColor);
      setIsEditing(false);
      onClose();
    }
  };

  const handleCancel = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsEditing(false);
    setEditText(sticker?.title || "");
    setEditBgColor(stickerBgColor);
    setEditTextColor(stickerTextColor);
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
            {isEditing ? (
              <>
                {/* Edit Mode */}
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.foreground,
                    marginBottom: 12,
                  }}
                >
                  {isRu ? "Редактировать стикер" : "Edit Sticker"}
                </Text>

                {/* Text Input */}
                <TextInput
                  value={editText}
                  onChangeText={setEditText}
                  placeholder={isRu ? "Текст стикера" : "Sticker text"}
                  placeholderTextColor={colors.muted}
                  multiline
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.foreground,
                    fontSize: 14,
                    marginBottom: 12,
                    minHeight: 80,
                  }}
                />

                {/* Background Color Picker */}
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: colors.foreground,
                    marginBottom: 8,
                  }}
                >
                  {isRu ? "Цвет фона" : "Background Color"}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    gap: 8,
                    marginBottom: 12,
                    flexWrap: "wrap",
                  }}
                >
                  {BG_COLORS.map((color) => (
                    <Pressable
                      key={color}
                      onPress={() => setEditBgColor(color)}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        backgroundColor: color,
                        borderWidth: editBgColor === color ? 3 : 0,
                        borderColor: colors.primary,
                      }}
                    />
                  ))}
                </View>

                {/* Text Color Picker */}
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: colors.foreground,
                    marginBottom: 8,
                  }}
                >
                  {isRu ? "Цвет текста" : "Text Color"}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  {TEXT_COLORS.map((color) => (
                    <Pressable
                      key={color}
                      onPress={() => setEditTextColor(color)}
                      style={{
                        flex: 1,
                        height: 40,
                        borderRadius: 8,
                        backgroundColor: color,
                        borderWidth: editTextColor === color ? 3 : 0,
                        borderColor: colors.primary,
                      }}
                    />
                  ))}
                </View>

                {/* Preview */}
                <View
                  style={{
                    backgroundColor: editBgColor,
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                    minHeight: 60,
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: editTextColor,
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    {editText || (isRu ? "Предпросмотр" : "Preview")}
                  </Text>
                </View>
              </>
            ) : (
              <>
                {/* View Mode - Only show text */}
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: colors.foreground,
                    lineHeight: 24,
                  }}
                >
                  {sticker.title}
                </Text>
              </>
            )}
          </ScrollView>

          {/* Action buttons */}
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              marginTop: 12,
            }}
          >
            {isEditing ? (
              <>
                <Pressable
                  onPress={handleCancel}
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
                    {isRu ? "Отмена" : "Cancel"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleSave}
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
                    {isRu ? "Сохранить" : "Save"}
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
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
                      {isRu ? "Удалить" : "Delete"}
                    </Text>
                  </Pressable>
                )}

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
                      {isRu ? "Редактировать" : "Edit"}
                    </Text>
                  </Pressable>
                )}
              </>
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
