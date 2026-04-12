import type { AchievementDefinition } from "@/lib/domain/types";

/**
 * Achievement Definitions
 * 
 * HOW TO ADD NEW ACHIEVEMENTS:
 * 1. Add a new object to the ACHIEVEMENTS array below
 * 2. Each achievement needs:
 *    - id: unique string identifier (e.g., "my_achievement")
 *    - emoji: emoji used as the sticker visual (e.g., "🏆")
 *    - titleEn / titleRu: display name in English and Russian
 *    - descriptionEn / descriptionRu: how to unlock (in English and Russian)
 *    - conditionType: one of the predefined condition types (see below)
 *    - conditionValue: numeric threshold for the condition
 *    - rarity: "common" | "rare" | "epic" | "legendary"
 * 
 * CONDITION TYPES:
 *   "tasks_created_day"     — Create X tasks in a single day
 *   "tasks_completed_day"   — Complete X tasks in a single day
 *   "tasks_completed_total" — Complete X tasks total (all time)
 *   "streak_days"           — Use the app X days in a row
 *   "q1_completed"          — Complete X Q1 (urgent+important) tasks
 *   "all_quadrants"         — Have tasks in all 4 quadrants at once
 *   "contact_dev"           — User tapped "Contact developer" in settings
 *   "copy_card"             — User copied the donation card number
 *   "secret"                — Secret condition checked in checker.ts
 *   "custom"                — Custom logic (requires code change in checker.ts)
 * 
 * RARITY affects the border glow color when unlocked:
 *   common    → gray border
 *   rare      → blue border  
 *   epic      → purple border
 *   legendary → gold border
 */

export const ACHIEVEMENTS: AchievementDefinition[] = [
  // --- Row 1: Getting Started ---
  {
    id: "first_task",
    emoji: "🐣",
    titleEn: "First Step",
    titleRu: "Первый шаг",
    descriptionEn: "Create your first task",
    descriptionRu: "Создайте первую задачу",
    conditionType: "tasks_completed_total",
    conditionValue: 0,
    rarity: "common",
  },
  {
    id: "five_done",
    emoji: "✋",
    titleEn: "High Five",
    titleRu: "Дай пять",
    descriptionEn: "Complete 5 tasks",
    descriptionRu: "Выполните 5 задач",
    conditionType: "tasks_completed_total",
    conditionValue: 5,
    rarity: "common",
  },
  {
    id: "ten_done",
    emoji: "🎯",
    titleEn: "On Target",
    titleRu: "В цель",
    descriptionEn: "Complete 10 tasks",
    descriptionRu: "Выполните 10 задач",
    conditionType: "tasks_completed_total",
    conditionValue: 10,
    rarity: "common",
  },
  {
    id: "twenty_five_done",
    emoji: "🌟",
    titleEn: "Rising Star",
    titleRu: "Восходящая звезда",
    descriptionEn: "Complete 25 tasks",
    descriptionRu: "Выполните 25 задач",
    conditionType: "tasks_completed_total",
    conditionValue: 25,
    rarity: "rare",
  },

  // --- Row 2: Productivity ---
  {
    id: "fifty_done",
    emoji: "🚀",
    titleEn: "Rocket",
    titleRu: "Ракета",
    descriptionEn: "Complete 50 tasks",
    descriptionRu: "Выполните 50 задач",
    conditionType: "tasks_completed_total",
    conditionValue: 50,
    rarity: "rare",
  },
  {
    id: "hundred_done",
    emoji: "💯",
    titleEn: "Centurion",
    titleRu: "Центурион",
    descriptionEn: "Complete 100 tasks",
    descriptionRu: "Выполните 100 задач",
    conditionType: "tasks_completed_total",
    conditionValue: 100,
    rarity: "epic",
  },
  {
    id: "workhorse",
    emoji: "🐴",
    titleEn: "Workhorse",
    titleRu: "Ломовая лошадь",
    descriptionEn: "Create 10 tasks in one day",
    descriptionRu: "Создайте 10 задач за один день",
    conditionType: "tasks_created_day",
    conditionValue: 10,
    rarity: "rare",
  },
  {
    id: "speed_demon",
    emoji: "⚡",
    titleEn: "Speed Demon",
    titleRu: "Молния",
    descriptionEn: "Complete 5 tasks in one day",
    descriptionRu: "Выполните 5 задач за один день",
    conditionType: "tasks_completed_day",
    conditionValue: 5,
    rarity: "rare",
  },

  // --- Row 3: Streaks & Quadrants ---
  {
    id: "three_day_streak",
    emoji: "🔥",
    titleEn: "On Fire",
    titleRu: "В огне",
    descriptionEn: "Use the app 3 days in a row",
    descriptionRu: "Используйте приложение 3 дня подряд",
    conditionType: "streak_days",
    conditionValue: 3,
    rarity: "common",
  },
  {
    id: "week_streak",
    emoji: "📅",
    titleEn: "Weekly Warrior",
    titleRu: "Недельный воин",
    descriptionEn: "Use the app 7 days in a row",
    descriptionRu: "Используйте приложение 7 дней подряд",
    conditionType: "streak_days",
    conditionValue: 7,
    rarity: "rare",
  },
  {
    id: "month_streak",
    emoji: "👑",
    titleEn: "King of Habits",
    titleRu: "Король привычек",
    descriptionEn: "Use the app 30 days in a row",
    descriptionRu: "Используйте приложение 30 дней подряд",
    conditionType: "streak_days",
    conditionValue: 30,
    rarity: "legendary",
  },
  {
    id: "q1_master",
    emoji: "🏆",
    titleEn: "Crisis Manager",
    titleRu: "Кризис-менеджер",
    descriptionEn: "Complete 10 Q1 (urgent & important) tasks",
    descriptionRu: "Выполните 10 задач Q1 (срочные и важные)",
    conditionType: "q1_completed",
    conditionValue: 10,
    rarity: "epic",
  },

  // --- Row 4: Special ---
  {
    id: "all_quadrants",
    emoji: "🧩",
    titleEn: "Full Matrix",
    titleRu: "Полная матрица",
    descriptionEn: "Have tasks in all 4 quadrants at once",
    descriptionRu: "Имейте задачи во всех 4 квадрантах одновременно",
    conditionType: "all_quadrants",
    conditionValue: 1,
    rarity: "rare",
  },
  {
    id: "ten_day_streak",
    emoji: "💎",
    titleEn: "Diamond Will",
    titleRu: "Алмазная воля",
    descriptionEn: "Use the app 10 days in a row",
    descriptionRu: "Используйте приложение 10 дней подряд",
    conditionType: "streak_days",
    conditionValue: 10,
    rarity: "epic",
  },
  {
    id: "mass_complete",
    emoji: "🌊",
    titleEn: "Tidal Wave",
    titleRu: "Приливная волна",
    descriptionEn: "Complete 10 tasks in one day",
    descriptionRu: "Выполните 10 задач за один день",
    conditionType: "tasks_completed_day",
    conditionValue: 10,
    rarity: "epic",
  },
  {
    id: "two_hundred_done",
    emoji: "🐉",
    titleEn: "Dragon",
    titleRu: "Дракон",
    descriptionEn: "Complete 200 tasks",
    descriptionRu: "Выполните 200 задач",
    conditionType: "tasks_completed_total",
    conditionValue: 200,
    rarity: "legendary",
  },

  // --- Row 5: Social & Support ---
  {
    id: "contact_dev",
    emoji: "✉️",
    titleEn: "Pen Pal",
    titleRu: "Написать разработчику",
    descriptionEn: "Contact the developer via Telegram",
    descriptionRu: "Написать разработчику в Telegram",
    conditionType: "contact_dev",
    conditionValue: 1,
    rarity: "rare",
  },
  {
    id: "patron",
    emoji: "🤝",
    titleEn: "Patron",
    titleRu: "Благодетель",
    descriptionEn: "Support the developer - copy the donation card details",
    descriptionRu: "Поддержите разработчика - скопируйте данные карты для пожертвования",
    conditionType: "copy_card",
    conditionValue: 1,
    rarity: "epic",
  },
  {
    id: "twenty_created_day",
    emoji: "🏭",
    titleEn: "Task Factory",
    titleRu: "Фабрика задач",
    descriptionEn: "Create 20 tasks in one day",
    descriptionRu: "Создайте 20 задач за один день",
    conditionType: "tasks_created_day",
    conditionValue: 20,
    rarity: "epic",
  },
  {
    id: "five_hundred_done",
    emoji: "🦅",
    titleEn: "Eagle",
    titleRu: "Орёл",
    descriptionEn: "Complete 500 tasks",
    descriptionRu: "Выполните 500 задач",
    conditionType: "tasks_completed_total",
    conditionValue: 500,
    rarity: "legendary",
  },

  // --- Row 7: Functional Achievements ---
  {
    id: "photographer",
    emoji: "📸",
    titleEn: "Photographer",
    titleRu: "Фотограф",
    descriptionEn: "Attach a photo to a task",
    descriptionRu: "Прикрепите фото к задаче",
    conditionType: "custom",
    conditionValue: 1,
    rarity: "common",
  },
  {
    id: "attachment_master",
    emoji: "📎",
    titleEn: "Attachment Master",
    titleRu: "Мастер вложений",
    descriptionEn: "Attach files to 5 different tasks",
    descriptionRu: "Прикрепите файлы к 5 разным задачам",
    conditionType: "custom",
    conditionValue: 5,
    rarity: "rare",
  },
  {
    id: "persistent_explorer",
    emoji: "🔍",
    titleEn: "Persistent Explorer",
    titleRu: "Упорный исследователь",
    descriptionEn: "Tap the app icon in About section 10 times",
    descriptionRu: "Нажмите на иконку приложения в разделе О приложении 10 раз",
    conditionType: "custom",
    conditionValue: 10,
    rarity: "epic",
  },
  {
    id: "emoji_master",
    emoji: "😎",
    titleEn: "Emoji Master",
    titleRu: "Мастер эмодзи",
    descriptionEn: "Add emojis to 10 different tasks",
    descriptionRu: "Добавьте эмодзи к 10 разным задачам",
    conditionType: "custom",
    conditionValue: 10,
    rarity: "rare",
  },

  // --- Row 8: Secret Achievements ---
  {
    id: "night_owl",
    emoji: "🦉",
    titleEn: "Night Owl",
    titleRu: "Ночная сова",
    descriptionEn: "Create a task between 2 AM and 5 AM",
    descriptionRu: "Создайте задачу между 2 и 5 часами ночи",
    conditionType: "secret",
    conditionValue: 1,
    rarity: "rare",
  },
  {
    id: "early_bird",
    emoji: "🐦",
    titleEn: "Early Bird",
    titleRu: "Ранняя пташка",
    descriptionEn: "Create a task between 5 AM and 6 AM",
    descriptionRu: "Создайте задачу между 5 и 6 часами утра",
    conditionType: "secret",
    conditionValue: 2,
    rarity: "rare",
  },
  {
    id: "perfectionist",
    emoji: "✨",
    titleEn: "Perfectionist",
    titleRu: "Перфекционист",
    descriptionEn: "Create a task with max importance and urgency (7/7)",
    descriptionRu: "Создайте задачу с максимальной важностью и срочностью (7/7)",
    conditionType: "secret",
    conditionValue: 3,
    rarity: "epic",
  },
  {
    id: "zen_master",
    emoji: "🧘",
    titleEn: "Zen Master",
    titleRu: "Мастер Дзен",
    descriptionEn: "Complete all your tasks (have 0 active tasks after having at least 5)",
    descriptionRu: "Выполните все задачи (0 активных после минимум 5)",
    conditionType: "secret",
    conditionValue: 4,
    rarity: "legendary",
  },

  // --- Row 9: Fun & Quirky ---
  {
    id: "pizza_break",
    emoji: "🍕",
    titleEn: "Pizza Break",
    titleRu: "Пицца-перерыв",
    descriptionEn: "Don't open the app for 24 hours (take a rest!)",
    descriptionRu: "Не открывайте приложение 24 часа (отдохните!)",
    conditionType: "custom",
    conditionValue: 1,
    rarity: "common",
  },
  {
    id: "procrastinator",
    emoji: "🐢",
    titleEn: "Procrastinator",
    titleRu: "Прокрастинатор",
    descriptionEn: "Create a task and complete it after 30+ days",
    descriptionRu: "Создайте задачу и выполните её через 30+ дней",
    conditionType: "custom",
    conditionValue: 1,
    rarity: "rare",
  },
  {
    id: "chaos_master",
    emoji: "🎪",
    titleEn: "Chaos Master",
    titleRu: "Мастер хаоса",
    descriptionEn: "Create 5 tasks with identical titles (embrace the chaos!)",
    descriptionRu: "Создайте 5 задач с одинаковым названием (примите хаос!)",
    conditionType: "custom",
    conditionValue: 5,
    rarity: "rare",
  },
  {
    id: "brain_teaser",
    emoji: "🧠",
    titleEn: "Brain Teaser",
    titleRu: "Загадка для мозга",
    descriptionEn: "Create a task with description longer than 500 characters",
    descriptionRu: "Создайте задачу с описанием длиннее 500 символов",
    conditionType: "custom",
    conditionValue: 1,
    rarity: "rare",
  },
];
