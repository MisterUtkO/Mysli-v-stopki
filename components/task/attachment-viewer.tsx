import { Modal, View, Text, Pressable, ScrollView, Image, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColors } from "@/hooks/use-colors";
import { useI18n } from "@/lib/context/i18n-context";
import type { TaskAttachment } from "@/lib/domain/types";
import * as Haptics from "expo-haptics";
import { useState } from "react";

interface AttachmentViewerProps {
  visible: boolean;
  attachments: TaskAttachment[];
  onClose: () => void;
}

export function AttachmentViewer({
  visible,
  attachments,
  onClose,
}: AttachmentViewerProps) {
  const colors = useColors();
  const { language } = useI18n();
  const isRu = language === "ru";
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!attachments || attachments.length === 0) return null;

  const currentAttachment = attachments[selectedIndex];

  const handlePrevious = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : attachments.length - 1));
  };

  const handleNext = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedIndex((prev) => (prev < attachments.length - 1 ? prev + 1 : 0));
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
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          justifyContent: "center",
          alignItems: "center",
        }}
        edges={["top", "left", "right", "bottom"]}
      >
        {/* Close button */}
        <View
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 1000,
          }}
        >
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              {
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                justifyContent: "center",
                alignItems: "center",
                opacity: pressed ? 0.6 : 1,
              },
            ]}
          >
            <Text style={{ fontSize: 24, color: "#FFFFFF" }}>✕</Text>
          </Pressable>
        </View>

        {/* Image viewer */}
        {currentAttachment.type === "image" && (
          <View
            style={{
              width: "100%",
              height: "70%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={{ uri: currentAttachment.uri }}
              style={{
                width: "90%",
                height: "100%",
                resizeMode: "contain",
              }}
            />
          </View>
        )}

        {/* File info */}
        <View
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 8,
            marginBottom: 16,
            width: "90%",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#FFFFFF",
              marginBottom: 4,
            }}
            numberOfLines={1}
          >
            {currentAttachment.name}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: "rgba(255, 255, 255, 0.7)",
            }}
          >
            {selectedIndex + 1} / {attachments.length}
          </Text>
        </View>

        {/* Navigation buttons */}
        {attachments.length > 1 && (
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              width: "90%",
              justifyContent: "center",
            }}
          >
            <Pressable
              onPress={handlePrevious}
              style={({ pressed }) => [
                {
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  justifyContent: "center",
                  alignItems: "center",
                  opacity: pressed ? 0.6 : 1,
                },
              ]}
            >
              <Text style={{ fontSize: 16, color: "#FFFFFF" }}>← {isRu ? "Назад" : "Prev"}</Text>
            </Pressable>

            <Pressable
              onPress={handleNext}
              style={({ pressed }) => [
                {
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  justifyContent: "center",
                  alignItems: "center",
                  opacity: pressed ? 0.6 : 1,
                },
              ]}
            >
              <Text style={{ fontSize: 16, color: "#FFFFFF" }}>{isRu ? "Далее" : "Next"} →</Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}
