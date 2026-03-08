import { ScrollView, Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useI18n } from "@/lib/context/i18n-context";
import { useColors } from "@/hooks/use-colors";

export default function TermsOfServiceScreen() {
  const router = useRouter();
  const { language } = useI18n();
  const isRu = language === "ru";
  const colors = useColors();

  const content = isRu ? (
    <>
      <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground, marginBottom: 16 }}>
        Условия использования
      </Text>

      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginTop: 12, marginBottom: 8 }}>
        1. Принятие условий
      </Text>
      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 12 }}>
        Используя приложение SDVGNote, вы принимаете эти условия использования. Если вы не согласны с какой-либо частью этих условий, пожалуйста, не используйте Приложение.
      </Text>

      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginTop: 12, marginBottom: 8 }}>
        2. Лицензия на использование
      </Text>
      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 12 }}>
        Мы предоставляем вам ограниченную, неэксклюзивную, непередаваемую лицензию на использование Приложения в личных целях.
      </Text>

      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginTop: 12, marginBottom: 8 }}>
        3. Ограничения
      </Text>
      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 12 }}>
        Вы не имеете права:{"\n"}
        • Копировать, модифицировать или распространять Приложение{"\n"}
        • Использовать Приложение в коммерческих целях{"\n"}
        • Пытаться получить несанкционированный доступ к Приложению
      </Text>

      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginTop: 12, marginBottom: 8 }}>
        4. Отказ от ответственности
      </Text>
      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 12 }}>
        Приложение предоставляется "как есть" без каких-либо гарантий. Мы не несем ответственность за потерю данных или любые другие убытки, возникшие в результате использования Приложения.
      </Text>

      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginTop: 12, marginBottom: 8 }}>
        5. Ограничение ответственности
      </Text>
      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 12 }}>
        В максимальной степени, разрешенной законом, мы не несем ответственность за косвенные, случайные, специальные или штрафные убытки.
      </Text>

      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginTop: 12, marginBottom: 8 }}>
        6. Изменения условий
      </Text>
      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 12 }}>
        Мы оставляем за собой право изменять эти условия в любое время. Продолжение использования Приложения означает ваше согласие с измененными условиями.
      </Text>

      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginTop: 12, marginBottom: 8 }}>
        7. Применимое право
      </Text>
      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 12 }}>
        Эти условия регулируются законодательством Российской Федерации.
      </Text>

      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginTop: 12, marginBottom: 8 }}>
        8. Контакт
      </Text>
      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 12 }}>
        По вопросам условий использования обращайтесь: @MisterUtkO в Telegram
      </Text>
    </>
  ) : (
    <>
      <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground, marginBottom: 16 }}>
        Terms of Service
      </Text>

      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginTop: 12, marginBottom: 8 }}>
        1. Acceptance of Terms
      </Text>
      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 12 }}>
        By using the SDVGNote application, you accept these terms of service. If you do not agree with any part of these terms, please do not use the Application.
      </Text>

      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginTop: 12, marginBottom: 8 }}>
        2. License to Use
      </Text>
      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 12 }}>
        We grant you a limited, non-exclusive, non-transferable license to use the Application for personal purposes.
      </Text>

      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginTop: 12, marginBottom: 8 }}>
        3. Restrictions
      </Text>
      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 12 }}>
        You may not:{"\n"}
        • Copy, modify, or distribute the Application{"\n"}
        • Use the Application for commercial purposes{"\n"}
        • Attempt to gain unauthorized access to the Application
      </Text>

      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginTop: 12, marginBottom: 8 }}>
        4. Disclaimer
      </Text>
      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 12 }}>
        The Application is provided "as is" without any warranties. We are not responsible for data loss or any other damages arising from the use of the Application.
      </Text>

      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginTop: 12, marginBottom: 8 }}>
        5. Limitation of Liability
      </Text>
      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 12 }}>
        To the maximum extent permitted by law, we are not liable for indirect, incidental, special, or punitive damages.
      </Text>

      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginTop: 12, marginBottom: 8 }}>
        6. Changes to Terms
      </Text>
      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 12 }}>
        We reserve the right to change these terms at any time. Continued use of the Application means you agree to the modified terms.
      </Text>

      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginTop: 12, marginBottom: 8 }}>
        7. Governing Law
      </Text>
      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 12 }}>
        These terms are governed by the laws of the Russian Federation.
      </Text>

      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginTop: 12, marginBottom: 8 }}>
        8. Contact
      </Text>
      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 12 }}>
        For questions about these terms, contact: @MisterUtkO on Telegram
      </Text>
    </>
  );

  return (
    <ScreenContainer className="p-4">
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
        >
          <Text style={{ fontSize: 24, color: colors.primary }}>←</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {content}
      </ScrollView>
    </ScreenContainer>
  );
}
