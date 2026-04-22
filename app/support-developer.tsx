import { View, Text, Pressable, ScrollView, Linking } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/common/screen-container";
import { ScreenTransition } from "@/components/animations/screen-transition";
import { useI18n } from "@/lib/context/i18n-context";
import { useColors } from "@/hooks/use-colors";

const DONATION_LINK = "https://www.tbank.ru/cf/Aat9eBK3zWb";

export default function SupportDeveloperScreen() {
  const router = useRouter();
  const { language } = useI18n();
  const colors = useColors();

  const isRu = language === "ru";

  const handleOpenDonation = async () => {
    try {
      await Linking.openURL(DONATION_LINK);
    } catch (error) {
      console.error("Failed to open donation link:", error);
    }
  };

  return (
    <ScreenTransition>
      <ScreenContainer className="p-6">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "space-between" }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ gap: 28 }}>
            {/* Icon & Title */}
            <View style={{ gap: 12, alignItems: "center", marginTop: 8 }}>
              <Text style={{ fontSize: 48 }}>💝</Text>
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "700",
                  color: colors.foreground,
                  textAlign: "center",
                  lineHeight: 40,
                }}
              >
                {isRu ? "Поддержать разработчика" : "Support Developer"}
              </Text>
            </View>

            {/* Main Description */}
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
                  fontSize: 15,
                  color: colors.foreground,
                  lineHeight: 24,
                  textAlign: "center",
                }}
              >
                {isRu
                  ? "Мысли в стопки распространяется бесплатно.\nЕсли приложение оказалось полезным, вы можете по желанию поддержать развитие проекта и будущие обновления."
                  : "Мысли в стопки is free to use.\nIf the app has been helpful, you can optionally support the project development and future updates."}
              </Text>
            </View>

            {/* Voluntary Support Info Block */}
            <View
              style={{
                backgroundColor: colors.primary,
                borderRadius: 16,
                padding: 16,
                borderLeftWidth: 4,
                borderLeftColor: colors.primary,
              }}
            >
              <View style={{ gap: 12 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#FFF",
                  }}
                >
                  {isRu ? "✓ Поддержка полностью добровольна" : "✓ Support is completely voluntary"}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#FFF",
                    lineHeight: 22,
                    opacity: 0.95,
                  }}
                >
                  {isRu
                    ? "Это не покупка, не подписка и не способ получить дополнительные функции."
                    : "This is not a purchase, subscription, or way to unlock extra features."}
                </Text>
              </View>
            </View>

            {/* Additional Clarification */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 14,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: colors.muted,
                  lineHeight: 20,
                  textAlign: "center",
                }}
              >
                {isRu
                  ? "Поддержка не открывает премиум-возможности, не отключает рекламу и не даёт доступ к особому контенту. Это просто способ сказать разработчику спасибо."
                  : "Support does not unlock premium features, remove ads, or provide access to exclusive content. It's simply a way to say thank you to the developer."}
              </Text>
            </View>

            {/* Main CTA Button */}
            <Pressable
              onPress={handleOpenDonation}
              style={({ pressed }) => ({
                backgroundColor: colors.primary,
                borderRadius: 16,
                paddingVertical: 16,
                paddingHorizontal: 20,
                opacity: pressed ? 0.85 : 1,
                transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
              })}
            >
              <Text
                style={{
                  color: "#FFF",
                  fontWeight: "700",
                  fontSize: 16,
                  textAlign: "center",
                  letterSpacing: 0.3,
                }}
              >
                {isRu ? "Поддержать проект" : "Support the Project"}
              </Text>
            </Pressable>

            {/* Subtitle under button */}
            <Text
              style={{
                fontSize: 12,
                color: colors.muted,
                textAlign: "center",
                marginTop: -8,
              }}
            >
              {isRu ? "Откроется внешняя страница поддержки" : "Opens external support page"}
            </Text>
          </View>

          {/* Back Button at Bottom */}
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
              marginTop: 24,
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
        </ScrollView>
      </ScreenContainer>
    </ScreenTransition>
  );
}
