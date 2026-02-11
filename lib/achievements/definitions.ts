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
    conditionValue: 0, // Special: checked as tasks_created >= 1
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
];
