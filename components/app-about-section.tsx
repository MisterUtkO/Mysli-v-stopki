import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useAppVersion } from "@/lib/context/app-version-context";
import { useI18n } from "@/lib/context/i18n-context";
import { useColors } from "@/hooks/use-colors";

interface Feature {
  emoji: string;
  titleRu: string;
  titleEn: string;
  descRu: string;
  descEn: string;
}

interface ChangelogEntry {
  version: string;
  dateRu: string;
  dateEn: string;
  changesRu: string[];
  changesEn: string[];
}

const FEATURES: Feature[] = [
  {
    emoji: "📋",
    titleRu: "Управление задачами",
    titleEn: "Task Management",
    descRu: "Создавайте, редактируйте и отслеживайте свои задачи с лёгкостью",
    descEn: "Create, edit, and track your tasks effortlessly",
  },
  {
    emoji: "⚡",
    titleRu: "Матрица Эйзенхауэра",
    titleEn: "Eisenhower Matrix",
    descRu: "Распределяйте задачи по важности и срочности",
    descEn: "Organize tasks by importance and urgency",
  },
  {
    emoji: "📌",
    titleRu: "Канбан-доска",
    titleEn: "Kanban Board",
    descRu: "Визуализируйте рабочий процесс с помощью стикеров",
    descEn: "Visualize your workflow with sticky notes",
  },
  {
    emoji: "🎯",
    titleRu: "Достижения",
    titleEn: "Achievements",
    descRu: "Разблокируйте достижения и отслеживайте прогресс",
    descEn: "Unlock achievements and track your progress",
  },
  {
    emoji: "📊",
    titleRu: "Статистика",
    titleEn: "Statistics",
    descRu: "Анализируйте свою производительность с помощью графиков",
    descEn: "Analyze your productivity with charts",
  },
  {
    emoji: "🔔",
    titleRu: "Уведомления",
    titleEn: "Notifications",
    descRu: "Получайте напоминания о важных задачах",
    descEn: "Get reminders about important tasks",
  },
  {
    emoji: "🎨",
    titleRu: "Кастомизация цветов",
    titleEn: "Color Customization",
    descRu: "Выбирайте свои цвета для каждого квадранта",
    descEn: "Choose your own colors for each quadrant",
  },
  {
    emoji: "📢",
    titleRu: "Звук и вибрация",
    titleEn: "Sound & Vibration",
    descRu: "Настраивайте звуки и вибрацию уведомлений",
    descEn: "Customize notification sounds and vibrations",
  },
  {
    emoji: "⏰",
    titleRu: "Подсветка сроков",
    titleEn: "Deadline Highlighting",
    descRu: "Выделяйте задачи с истёкшим и истекающим сроком",
    descEn: "Highlight tasks with expired and expiring deadlines",
  },
];

const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.0.9.2",
    dateRu: "13 апреля 2026",
    dateEn: "April 13, 2026",
    changesRu: [
      "📝 Исправлена орфография: офлайн, завершённые",
      "🌐 Унифицированы переводы статусов (Не начато / Выполнено)",
      "📌 Унифицировано название Канбан-доска во всех местах",
      "✅ Исправлены ESLint-ошибки (незаэкранированные кавычки в JSX)",
    ],
    changesEn: [
      "📝 Fixed spelling: offline, завершённые",
      "🌐 Unified status translations (Not started / Completed)",
      "📌 Unified Kanban board naming across all screens",
      "✅ Fixed ESLint errors (unescaped quotes in JSX)",
    ],
  },
  {
    version: "1.0.9.1",
    dateRu: "13 апреля 2026",
    dateEn: "April 13, 2026",
    changesRu: [
      "⚡ Улучшено автоматическое прокручивание доски при перетаскивании к краям",
      "🎯 Увеличена скорость прокручивания для лучшей отзывчивости",
      "📊 Оптимизирована работа с досками с большим количеством столбцов",
      "🔧 Исправлено определение направления прокручивания",
    ],
    changesEn: [
      "⚡ Improved auto-scroll when dragging stickers near board edges",
      "🎯 Increased scroll speed for better responsiveness",
      "📊 Optimized for boards with many columns",
      "🔧 Fixed scroll direction detection",
    ],
  },
  {
    version: "1.0.9.0",
    dateRu: "13 апреля 2026",
    dateEn: "April 13, 2026",
    changesRu: [
      "✨ Визуальный индикатор целевого столбца при перетаскивании в Канбане",
      "🎯 Целевой столбец подсвечивается (граница + тень + фон заголовка)",
      "📳 Тактильный отклик (лёгкая вибрация) при пересечении границы столбца",
      "🔧 Улучшена точность определения целевого столбца",
    ],
    changesEn: [
      "✨ Visual indicator for target column during Kanban drag",
      "🎯 Target column highlighted (border + shadow + header background)",
      "📳 Haptic feedback (light vibration) when crossing column boundary",
      "🔧 Improved accuracy of target column detection",
    ],
  },
  {
    version: "1.0.8.0",
    dateRu: "13 апреля 2026",
    dateEn: "April 13, 2026",
    changesRu: [
      "📌 Добавлено 8 новых достижений (Канбан-мастер, Навигатор матрицы, Охотник за дедлайнами, Исследователь тем, Полиглот, Путешественник во времени, Король возвращений, Ночная смена)",
      "🌟 Эмодзи достижений разблокируются в пикере эмодзи задач",
      "🔒 Базовые эмодзи сокращены до 8 (остальные открываются через достижения)",
      "🗂️ Просмотр файлов и фото в задачах — теперь можно открывать вложения",
      "📌 Канбан: перетаскивание работает между всеми столбцами",
      "🖤 AMOLED-тема: исправлен интерфейс разблокировки (10 нажатий)",
      "🔊 Звуки и вибрация: исправлена разметка и добавлена демонстрация",
    ],
    changesEn: [
      "📌 Added 8 new achievements (Kanban Master, Matrix Navigator, Deadline Hunter, Theme Explorer, Multilingual, Time Traveler, Comeback King, Night Shift)",
      "🌟 Achievement emojis unlock in task emoji picker",
      "🔒 Base emojis reduced to 8 (rest unlock via achievements)",
      "🗂️ File/photo preview in tasks — attachments can now be opened",
      "📌 Kanban: drag-and-drop works between ALL columns",
      "🖤 AMOLED theme: fixed unlock UI (10 taps)",
      "🔊 Sounds & Vibration: fixed layout and added demo",
    ],
  },
  {
    version: "1.0.7.0",
    dateRu: "11 апреля 2026",
    dateEn: "April 11, 2026",
    changesRu: [
      "🎉 Добавлены 4 новых забавных достижения",
      "🍕 Пицца-перерыв, 🐢 Прокрастинатор, 🎪 Мастер хаоса, 🧠 Загадка для мозга",
      "✨ Расширенная система достижений (34 всего)",
      "🎨 Улучшен интерфейс экрана Настройки",
    ],
    changesEn: [
      "🎉 Added 4 new funny achievements",
      "🍕 Pizza Break, 🐢 Procrastinator, 🎪 Chaos Master, 🧠 Brain Teaser",
      "✨ Expanded achievement system (34 total)",
      "🎨 Improved Settings screen interface",
    ],
  },
  {
    version: "1.0.6.7",
    dateRu: "11 апреля 2026",
    dateEn: "April 11, 2026",
    changesRu: [
      "🧹 Очистка неиспользуемых разрешений в манифесте",
      "📱 Оптимизация прав доступа для Android и iOS",
      "🔒 Оставлены только необходимые разрешения",
      "⚡ Улучшена безопасность приложения",
    ],
    changesEn: [
      "🧹 Cleaned up unused permissions in manifest",
      "📱 Optimized access rights for Android and iOS",
      "🔒 Kept only necessary permissions",
      "⚡ Improved app security",
    ],
  },
  {
    version: "1.0.5.1",
    dateRu: "10 апреля 2026",
    dateEn: "April 10, 2026",
    changesRu: [
      "🎨 Кастомизация цветов квадрантов (Q1/Q2/Q3/Q4)",
      "📢 Настройки звука и вибрации с предустановками",
      "⏰ Подсветка задач с истёкшим и истекающим сроком",
      "✨ Применение кастомизации ко всем экранам",
    ],
    changesEn: [
      "🎨 Quadrant color customization (Q1/Q2/Q3/Q4)",
      "📢 Sound and vibration settings with presets",
      "⏰ Deadline task highlighting (expired and expiring)",
      "✨ Applied customization across all screens",
    ],
  },
  {
    version: "1.0.5.0",
    dateRu: "9 апреля 2026",
    dateEn: "April 9, 2026",
    changesRu: [
      "✨ Централизованная система управления версией",
      "🎨 Упрощённый интерфейс настроек",
      "🐛 Исправлены ошибки навигации",
      "📱 Улучшена производительность приложения",
    ],
    changesEn: [
      "✨ Centralized version management system",
      "🎨 Simplified settings interface",
      "🐛 Fixed navigation bugs",
      "📱 Improved app performance",
    ],
  },
  {
    version: "1.0.4.0",
    dateRu: "1 апреля 2026",
    dateEn: "April 1, 2026",
    changesRu: [
      "🎯 Добавлены новые достижения",
      "🌙 Улучшена тёмная тема",
      "🔍 Расширенный поиск по задачам",
      "⚙️ Новые опции в настройках",
    ],
    changesEn: [
      "🎯 Added new achievements",
      "🌙 Improved dark theme",
      "🔍 Enhanced task search",
      "⚙️ New settings options",
    ],
  },
  {
    version: "1.0.3.0",
    dateRu: "15 марта 2026",
    dateEn: "March 15, 2026",
    changesRu: [
      "📌 Полная поддержка Канбан-доски",
      "🎨 Новая цветовая схема",
      "📊 Добавлена статистика",
      "🔔 Улучшены уведомления",
    ],
    changesEn: [
      "📌 Full Kanban board support",
      "🎨 New color scheme",
      "📊 Added statistics",
      "🔔 Improved notifications",
    ],
  },
];

export function AppAboutSection() {
  const { version } = useAppVersion();
  const { language } = useI18n();
  const colors = useColors();
  const isRu = language === "ru";

  const appName = "SDVGNote";
  const appSubtitle = isRu ? "Заметки для самоорганизации" : "Notes for Self-Organization";

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* App Header */}
      <View className="bg-surface rounded-2xl p-6 mb-6">
        <Text className="text-3xl font-bold text-foreground mb-2">{appName}</Text>
        <Text className="text-base text-muted mb-4">{appSubtitle}</Text>
        <View className="flex-row items-center gap-2">
          <Text className="text-sm text-muted">
            {isRu ? "Версия:" : "Version:"}
          </Text>
          <Text className="text-sm font-semibold text-primary">v{version}</Text>
        </View>
      </View>

      {/* Features Section */}
      <View className="mb-6">
        <Text className="text-xl font-bold text-foreground mb-4 px-4">
          {isRu ? "✨ Возможности" : "✨ Features"}
        </Text>
        <View className="gap-3 px-4">
          {FEATURES.map((feature, index) => (
            <View
              key={index}
              className="bg-surface rounded-xl p-4 flex-row gap-3"
            >
              <Text className="text-3xl">{feature.emoji}</Text>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">
                  {isRu ? feature.titleRu : feature.titleEn}
                </Text>
                <Text className="text-sm text-muted mt-1">
                  {isRu ? feature.descRu : feature.descEn}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Changelog Section */}
      <View className="mb-6">
        <Text className="text-xl font-bold text-foreground mb-4 px-4">
          {isRu ? "📝 История обновлений" : "📝 Changelog"}
        </Text>
        <View className="gap-4 px-4">
          {CHANGELOG.map((entry, index) => (
            <View
              key={index}
              className="bg-surface rounded-xl p-4 border border-border"
            >
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-bold text-primary">
                  v{entry.version}
                </Text>
                <Text className="text-xs text-muted">
                  {isRu ? entry.dateRu : entry.dateEn}
                </Text>
              </View>
              <View className="gap-2">
                {(isRu ? entry.changesRu : entry.changesEn).map(
                  (change, changeIndex) => (
                    <Text
                      key={changeIndex}
                      className="text-sm text-foreground leading-relaxed"
                    >
                      {change}
                    </Text>
                  )
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Footer */}
      <View className="items-center py-6 px-4">
        <Text className="text-xs text-muted text-center">
          {isRu
            ? "SDVGNote — приложение для управления задачами и самоорганизации"
            : "SDVGNote — task management and self-organization app"}
        </Text>
        <Text className="text-xs text-muted text-center mt-2">
          {isRu ? "Сделано с ❤️ для вас" : "Made with ❤️ for you"}
        </Text>
      </View>
    </ScrollView>
  );
}
