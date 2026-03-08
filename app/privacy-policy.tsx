import { ScrollView, Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useI18n } from "@/lib/context/i18n-context";
import { useColors } from "@/hooks/use-colors";

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const { language } = useI18n();
  const isRu = language === "ru";
  const colors = useColors();

  const content = isRu ? (
    <>
      <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground, marginBottom: 16 }}>
        Политика конфиденциальности
      </Text>

      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginTop: 12, marginBottom: 8 }}>
        1. Введение
      </Text>
      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 12 }}>
        Приложение SDVGNote ("Приложение") уважает вашу конфиденциальность. Данная политика описывает, как мы собираем, используем и защищаем ваши данные.
      </Text>

      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginTop: 12, marginBottom: 8 }}>
        2. Сбор данных
      </Text>
      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 12 }}>
        Приложение собирает только данные, которые вы добровольно вводите:
      </Text>
      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 12, marginLeft: 12 }}>
        • Задачи и описания{"\n"}
        • Даты и время выполнения{"\n"}
        • Уровни важности и срочности{"\n"}
        • Файлы и фотографии, прикрепленные к задачам
      </Text>

      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginTop: 12, marginBottom: 8 }}>
        3. Хранение данных
      </Text>
      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 12 }}>
        Все ваши данные хранятся локально на вашем устройстве. Мы не передаем ваши данные на серверы без вашего согласия.
      </Text>

      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginTop: 12, marginBottom: 8 }}>
        4. Использование данных
      </Text>
      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 12 }}>
        Ваши данные используются только для работы Приложения и не передаются третьим лицам.
      </Text>

      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginTop: 12, marginBottom: 8 }}>
        5. Безопасность
      </Text>
      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 12 }}>
        Мы применяем стандартные меры безопасности для защиты ваших данных. Однако, поскольку данные хранятся локально, безопасность зависит от защиты вашего устройства.
      </Text>

      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginTop: 12, marginBottom: 8 }}>
        6. Разрешения
      </Text>
      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 12 }}>
        Приложение может запросить следующие разрешения:{"\n"}
        • Доступ к уведомлениям (для напоминаний){"\n"}
        • Доступ к фотографиям (для прикрепления файлов){"\n"}
        • Доступ к календарю (для синхронизации задач)
      </Text>

      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginTop: 12, marginBottom: 8 }}>
        7. Контакт
      </Text>
      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 12 }}>
        По вопросам конфиденциальности обращайтесь: @MisterUtkO в Telegram
      </Text>
    </>
  ) : (
    <>
      <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground, marginBottom: 16 }}>
        Privacy Policy
      </Text>

      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginTop: 12, marginBottom: 8 }}>
        1. Introduction
      </Text>
      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 12 }}>
        SDVGNote ("Application") respects your privacy. This policy describes how we collect, use, and protect your data.
      </Text>

      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginTop: 12, marginBottom: 8 }}>
        2. Data Collection
      </Text>
      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 12 }}>
        The Application collects only data that you voluntarily enter:
      </Text>
      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 12, marginLeft: 12 }}>
        • Tasks and descriptions{"\n"}
        • Due dates and times{"\n"}
        • Importance and urgency levels{"\n"}
        • Files and photos attached to tasks
      </Text>

      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginTop: 12, marginBottom: 8 }}>
        3. Data Storage
      </Text>
      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 12 }}>
        All your data is stored locally on your device. We do not transmit your data to servers without your consent.
      </Text>

      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginTop: 12, marginBottom: 8 }}>
        4. Data Use
      </Text>
      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 12 }}>
        Your data is used only for the Application to function and is not shared with third parties.
      </Text>

      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginTop: 12, marginBottom: 8 }}>
        5. Security
      </Text>
      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 12 }}>
        We apply standard security measures to protect your data. However, since data is stored locally, security depends on your device protection.
      </Text>

      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginTop: 12, marginBottom: 8 }}>
        6. Permissions
      </Text>
      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 12 }}>
        The Application may request the following permissions:{"\n"}
        • Notification access (for reminders){"\n"}
        • Photo access (for file attachments){"\n"}
        • Calendar access (for task synchronization)
      </Text>

      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginTop: 12, marginBottom: 8 }}>
        7. Contact
      </Text>
      <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 12 }}>
        For privacy questions, contact: @MisterUtkO on Telegram
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
