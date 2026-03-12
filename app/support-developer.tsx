import { View, Text, Pressable, ScrollView, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { ScreenContainer } from "@/components/screen-container";
import { ScreenTransition } from "@/components/screen-transition";
import { useI18n } from "@/lib/context/i18n-context";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";

export default function SupportDeveloperScreen() {
  const router = useRouter();
  const { language, t } = useI18n();
  const colors = useColors();
  const [copiedCard, setCopiedCard] = useState(false);

  const isRu = language === "ru";
  const cardNumber = "2200 7006 3018 0684";

  const handleCopyCard = async () => {
    try {
      if (Platform.OS === "web") {
        try {
          await navigator.clipboard.writeText(cardNumber);
        } catch {
          const textArea = document.createElement("textarea");
          textArea.value = cardNumber;
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
        }
      } else {
        await Clipboard.setStringAsync(cardNumber);
      }
      setCopiedCard(true);
      setTimeout(() => setCopiedCard(false), 2500);
    } catch (error) {
      Alert.alert(
        isRu ? "Ошибка" : "Error",
        isRu ? "Не удалось скопировать номер карты" : "Failed to copy card number"
      );
    }
  };

  return (
    <ScreenTransition>
      <ScreenContainer className="p-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ gap: 24 }}>
            {/* Header */}
            <View style={{ gap: 8, alignItems: "center" }}>
              <Text style={{ fontSize: 40 }}>❤️</Text>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "700",
                  color: colors.foreground,
                  textAlign: "center",
                }}
              >
                {isRu ? "Поддержать разработчика" : "Support Developer"}
              </Text>
            </View>

            {/* Thank You Message */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: colors.foreground,
                  lineHeight: 24,
                  textAlign: "center",
                }}
              >
                {isRu
                  ? "Спасибо за использование SDVGNote! Ваша поддержка помогает развивать приложение и добавлять новые функции."
                  : "Thank you for using SDVGNote! Your support helps develop the app and add new features."}
              </Text>
            </View>

            {/* Disclaimer */}
            <View
              style={{
                backgroundColor: colors.primary,
                borderRadius: 12,
                padding: 12,
                opacity: 0.15,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: colors.foreground,
                  lineHeight: 20,
                  textAlign: "center",
                }}
              >
                {isRu
                  ? "⚠️ Поддержка полностью добровольна и не даёт дополнительных функций, контента или отключения рекламы."
                  : "⚠️ Support is completely voluntary and does not provide additional features, content, or ad removal."}
              </Text>
            </View>

            {/* Card Info Section */}
            <View style={{ gap: 12 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: colors.foreground,
                  textAlign: "center",
                }}
              >
                {isRu ? "Номер карты" : "Card Number"}
              </Text>

              {/* Card Display */}
              <Pressable
                onPress={handleCopyCard}
                style={({ pressed }) => ({
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                  opacity: pressed ? 0.8 : 1,
                  borderWidth: 2,
                  borderColor: copiedCard ? colors.success : colors.primary,
                })}
              >
                <View style={{ gap: 8, alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "700",
                      color: "#FFF",
                      letterSpacing: 2,
                      fontFamily: Platform.OS === "web" ? "monospace" : "Courier New",
                    }}
                  >
                    {cardNumber}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#FFF",
                      opacity: 0.9,
                    }}
                  >
                    {copiedCard
                      ? isRu
                        ? "✓ Скопировано!"
                        : "✓ Copied!"
                      : isRu
                        ? "Нажмите для копирования"
                        : "Tap to copy"}
                  </Text>
                </View>
              </Pressable>

              {/* Instructions */}
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.foreground,
                    lineHeight: 20,
                  }}
                >
                  {isRu
                    ? "1. Нажмите на номер карты выше, чтобы скопировать его\n2. Откройте приложение вашего банка\n3. Выполните перевод на скопированный номер карты\n4. Спасибо за поддержку! 🙏"
                    : "1. Tap the card number above to copy it\n2. Open your bank app\n3. Transfer to the copied card number\n4. Thank you for your support! 🙏"}
                </Text>
              </View>
            </View>

            {/* Back Button */}
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => ({
                backgroundColor: colors.surface,
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text
                style={{
                  color: colors.foreground,
                  fontWeight: "600",
                  fontSize: 14,
                  textAlign: "center",
                }}
              >
                {isRu ? "← Вернуться" : "← Back"}
              </Text>
            </Pressable>

            {/* Spacer */}
            <View style={{ height: 20 }} />
          </View>
        </ScrollView>
      </ScreenContainer>
    </ScreenTransition>
  );
}
