import { View, Text, Pressable, ScrollView, Modal } from "react-native";
import { TASK_EMOJIS } from "@/lib/domain/types";

interface EmojiPickerProps {
  visible: boolean;
  onSelect: (emoji: string) => void;
  onClose: () => void;
  selectedEmoji?: string;
}

export function EmojiPicker({
  visible,
  onSelect,
  onClose,
  selectedEmoji,
}: EmojiPickerProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-surface rounded-lg p-4 w-full max-w-sm">
          <Text className="text-lg font-bold text-foreground mb-4">
            Выберите эмодзи
          </Text>

          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            className="mb-4"
          >
            <View className="flex-row flex-wrap gap-2 justify-center">
              {TASK_EMOJIS.map((emoji) => (
                <Pressable
                  key={emoji}
                  onPress={() => {
                    onSelect(emoji);
                    onClose();
                  }}
                  className={`w-16 h-16 rounded-lg items-center justify-center ${
                    selectedEmoji === emoji
                      ? "bg-primary"
                      : "bg-surface border border-border"
                  }`}
                >
                  <Text className="text-4xl">{emoji}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <Pressable
            onPress={onClose}
            className="bg-surface border border-border rounded-lg p-3"
          >
            <Text className="text-center text-foreground font-semibold">
              Закрыть
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
