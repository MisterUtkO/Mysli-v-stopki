import { View, Text, ScrollView, Pressable, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useI18n } from "@/lib/context/i18n-context";
import { useTaskContext } from "@/lib/context/task-context";
import { useEffect, useState } from "react";


const APP_VERSION = "1.0.2";

interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    en: string[];
    ru: string[];
  };
}

const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.0.2",
    date: "2026-03-04",
    changes: {
      en: [
        "✓ Animated borders for overdue tasks",
        "✓ Visual alerts for old tasks (>3 days)",
        "✓ Task reminder system with date/time support",
        "✓ Fixed popup text visibility in dark themes",
      ],
      ru: [
        "✓ Анимированные границы для просроченных задач",
        "✓ Визуальные оповещения для старых задач (>3 дней)",
        "✓ Система напоминаний с поддержкой даты/времени",
        "✓ Исправлена видимость текста в тёмных темах",
      ],
    },
  },
  {
    version: "1.0.1",
    date: "2026-03-03",
    changes: {
      en: [
        "✓ Android calendar synchronization",
        "✓ Fixed swipe gesture reliability",
        "✓ Simplified Matrix task display",
        "✓ Comic-style popup bubbles for task details",
      ],
      ru: [
        "✓ Синхронизация с календарём Android",
        "✓ Исправлена надёжность свайп-жестов",
        "✓ Упрощено отображение задач в матрице",
        "✓ Всплывающие облачка для деталей задач",
      ],
    },
  },
  {
    version: "1.0.0",
    date: "2026-02-05",
    changes: {
      en: [
        "✓ Eisenhower Matrix implementation",
        "✓ Task management with priority scoring",
        "✓ Multiple themes (light, dark, pastel, amoled)",
        "✓ Notifications and reminders",
        "✓ Task statistics and achievements",
        "✓ Kanban board view",
        "✓ Russian and English localization",
      ],
      ru: [
        "✓ Реализована матрица Эйзенхауэра",
        "✓ Управление задачами с оценкой приоритета",
        "✓ Несколько тем (светлая, тёмная, пастель, amoled)",
        "✓ Уведомления и напоминания",
        "✓ Статистика задач и достижения",
        "✓ Представление доски Канбан",
        "✓ Локализация на русском и английском",
      ],
    },
  },
];

const FEATURES = {
  en: [
    "📊 Eisenhower Matrix — prioritize tasks by importance and urgency",
    "📋 Task Management — create, edit, delete tasks with detailed info",
    "🎯 Priority Scoring — automatic priority calculation",
    "📅 Calendar Integration — sync tasks with system calendar (Android)",
    "🔔 Smart Notifications — customizable reminders and alerts",
    "⏰ Overdue Detection — animated borders for expired tasks",
    "📈 Statistics — track your productivity",
    "🏆 Achievements — unlock badges and milestones",
    "🎨 Themes — light, dark, pastel, amoled modes",
    "🌍 Localization — Russian and English support",
    "📱 Kanban Board — visualize task workflow",
    "💾 Data Export — backup and restore your tasks",
    "⚡ Swipe Actions — quick task management",
  ],
  ru: [
    "📊 Матрица Эйзенхауэра — приоритизируйте задачи по важности и срочности",
    "📋 Управление задачами — создавайте, редактируйте, удаляйте задачи",
    "🎯 Оценка приоритета — автоматический расчёт приоритета",
    "📅 Интеграция календаря — синхронизация с системным календарём (Android)",
    "🔔 Умные уведомления — настраиваемые напоминания и оповещения",
    "⏰ Обнаружение просроченных — анимированные границы для истекших задач",
    "📈 Статистика — отслеживайте вашу продуктивность",
    "🏆 Достижения — разблокируйте значки и вехи",
    "🎨 Темы — светлая, тёмная, пастель, amoled режимы",
    "🌍 Локализация — поддержка русского и английского языков",
    "📱 Доска Канбан — визуализируйте рабочий процесс",
    "💾 Экспорт данных — резервное копирование и восстановление",
    "⚡ Свайп-действия — быстрое управление задачами",
  ],
};

export default function AboutScreen() {
  const router = useRouter();
  const { t, language } = useI18n();
  const { updateSettings } = useTaskContext();
  const isRu = language === "ru";
  const [lastSeenVersion, setLastSeenVersion] = useState<string | null>(null);

  useEffect(() => {
    // Check if this is first launch or version update
    const checkVersionOnMount = async () => {
      try {
        const storedLastVersion = localStorage?.getItem?.("lastSeenVersion");
        
        if (!storedLastVersion || storedLastVersion !== APP_VERSION) {
          localStorage?.setItem?.("lastSeenVersion", APP_VERSION);
          setLastSeenVersion(APP_VERSION);
        }
      } catch (error) {
        console.error("Error checking version:", error);
      }
    };

    checkVersionOnMount();
  }, []);

  const features = FEATURES[isRu ? "ru" : "en"];
  const title = isRu ? "О приложении" : "About App";
  const historyLabel = isRu ? "История изменений" : "Changelog";

  return (
    <ScreenContainer className="p-4">
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <Text className="text-2xl font-bold text-foreground">{title}</Text>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [{
            padding: 8,
            borderRadius: 8,
            backgroundColor: pressed ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
            opacity: pressed ? 0.7 : 1
          }]}
        >
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#0a7ea4' }}>←</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Version and Build Info */}
        <View className="bg-surface rounded-2xl p-4 mb-4 border border-border">
          <Text className="text-lg font-bold text-foreground mb-2">
            {isRu ? "Версия" : "Version"} {APP_VERSION}
          </Text>
          <Text className="text-sm text-muted mb-2">
            {isRu ? "Сборка" : "Build"}: {Platform.OS === "android" ? "Android" : "iOS"}
          </Text>
          <Text className="text-xs text-muted">
            {isRu ? "История изменений" : "Changelog"}
          </Text>
        </View>

        {/* Changelog */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">
            {isRu ? "История обновлений" : "Update History"}
          </Text>
          {CHANGELOG.map((entry, idx) => (
            <View
              key={idx}
              className="bg-surface rounded-xl p-3 mb-3 border border-border"
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <Text className="font-bold text-foreground">
                  {isRu ? "Версия" : "Version"} {entry.version}
                </Text>
                <Text className="text-xs text-muted">{entry.date}</Text>
              </View>
              {entry.changes[isRu ? "ru" : "en"].map((change, changeIdx) => (
                <Text
                  key={changeIdx}
                  className="text-sm text-foreground mb-1"
                  style={{ lineHeight: 18 }}
                >
                  {change}
                </Text>
              ))}
            </View>
          ))}
        </View>

        {/* Features */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">
            {isRu ? "Функции" : "Features"}
          </Text>
          {features.map((feature, idx) => (
            <Text
              key={idx}
              className="text-sm text-foreground mb-2"
              style={{ lineHeight: 20 }}
            >
              {feature}
            </Text>
          ))}
        </View>

        {/* Credits */}
        <View className="bg-surface rounded-xl p-4 border border-border">
          <Text className="text-sm text-muted text-center">
            {isRu
              ? "Разработано с ❤️ для продуктивности"
              : "Made with ❤️ for productivity"}
          </Text>
          <Text className="text-xs text-muted text-center mt-2">
            © 2026 Eisenhower Priority App
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
