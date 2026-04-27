# 🎨 Руководство по кастомизации "Мысли в стопки"

Полное руководство по изменению логотипа, цветов, анимаций, стикеров и других элементов приложения.

---

## 📋 Содержание

1. [Логотип и иконки](#логотип-и-иконки)
2. [Цветовые схемы](#цветовые-схемы)
3. [Анимации](#анимации)
4. [Стикеры и достижения](#стикеры-и-достижения)
5. [Локализация (i18n)](#локализация-i18n)
6. [Экран приветствия](#экран-приветствия)
7. [Версия приложения](#версия-приложения)
8. [Глубокие ссылки (Deep Links)](#глубокие-ссылки-deep-links)

---

## 🎯 Логотип и иконки

### Где находятся файлы иконок

```
assets/images/
├── icon.png                          ← Основная иконка приложения (1024x1024)
├── android-icon-foreground.png       ← Передний слой адаптивной иконки Android
├── android-icon-background.png       ← Фоновый слой адаптивной иконки Android
├── android-icon-monochrome.png       ← Монохромная иконка для Android 13+
├── favicon.png                       ← Иконка для веб-версии
└── splash-icon.png                   ← Экран загрузки (720x1280, 9:16)
```

### Как изменить логотип

**Шаг 1:** Подготовьте новые изображения
- **icon.png**: 1024×1024 px, квадратный формат, PNG с прозрачностью
- **android-icon-foreground.png**: 1024×1024 px, передний слой
- **android-icon-background.png**: 1024×1024 px, фоновый слой (обычно однотонный)
- **android-icon-monochrome.png**: 1024×1024 px, чёрно-белый вариант
- **favicon.png**: 192×192 px или 512×512 px для веб-версии
- **splash-icon.png**: 720×1280 px (соотношение 9:16 для мобильных)

**Шаг 2:** Замените файлы в папке `assets/images/`

**Шаг 3:** Обновите версию в `app.config.ts`
```typescript
// app.config.ts
version: "1.0.92", // Увеличьте на 0.0.1
```

**Шаг 4:** Пересоберите приложение
```bash
eas build --platform android --local
# или для локальной сборки
npx expo prebuild --clean
```

### Конфигурация иконок в app.config.ts

```typescript
// app.config.ts (строки 38-56)
icon: "./assets/images/icon.png",
adaptiveIcon: {
  backgroundColor: "#FFFFFF",
  foregroundImage: "./assets/images/android-icon-foreground.png",
  backgroundImage: "./assets/images/android-icon-background.png",
  monochromeImage: "./assets/images/android-icon-monochrome.png",
},
```

---

## 🎨 Цветовые схемы

### Основные цвета (Light/Dark)

**Файл:** `theme.config.js`

```javascript
// theme.config.js
const themeColors = {
  primary: { light: '#0a7ea4', dark: '#0a7ea4' },      // Основной цвет (кнопки, ссылки)
  background: { light: '#ffffff', dark: '#151718' },   // Фон экрана
  surface: { light: '#f5f5f5', dark: '#1e2022' },      // Карточки, поверхности
  foreground: { light: '#11181C', dark: '#ECEDEE' },   // Основной текст
  muted: { light: '#687076', dark: '#9BA1A6' },        // Второстепенный текст
  border: { light: '#E5E7EB', dark: '#334155' },       // Границы, разделители
  success: { light: '#22C55E', dark: '#4ADE80' },      // Успех (зелёный)
  warning: { light: '#F59E0B', dark: '#FBBF24' },      // Предупреждение (жёлтый)
  error: { light: '#EF4444', dark: '#F87171' },        // Ошибка (красный)
};
```

**Как изменить:**
1. Отредактируйте `theme.config.js` с новыми hex-кодами
2. Цвета автоматически применятся ко всему приложению
3. Пересоберите: `pnpm dev` или `eas build`

### Расширенные цветовые схемы

**Файл:** `lib/_core/theme.ts` (строки 30-80)

Доступные темы:
- `light` — светлая тема (по умолчанию)
- `dark` — тёмная тема
- `amoled` — чёрный фон (для AMOLED экранов)
- `pastel` — мягкие пастельные тона
- `notebook` — стиль школьной тетради
- `darkMatte` — матовая чёрная тема

**Как добавить новую тему:**

```typescript
// lib/_core/theme.ts (в функции buildSchemePalette)
palette.myTheme = {
  primary: "#FF5733",
  background: "#F0F0F0",
  surface: "#FFFFFF",
  foreground: "#1A1A1A",
  muted: "#808080",
  border: "#CCCCCC",
  success: "#00AA00",
  warning: "#FFAA00",
  error: "#FF0000",
} as Record<ThemeColorName, string>;
```

### Цвета квадрантов матрицы

**Файл:** `lib/domain/types.ts` (строки 122-127)

```typescript
export const QUADRANT_COLORS: Record<Quadrant, QuadrantColor> = {
  Q1: { background: "#FF6B6B", border: "#C92A2A", text: "#FFFFFF", label: "Do Now" },
  Q2: { background: "#FFA94D", border: "#E67700", text: "#FFFFFF", label: "Schedule" },
  Q3: { background: "#74C0FC", border: "#1971C2", text: "#FFFFFF", label: "Delegate" },
  Q4: { background: "#51CF66", border: "#2B8A3E", text: "#FFFFFF", label: "Postpone" },
};
```

**Как изменить:**
- `background` — основной цвет квадранта
- `border` — цвет границы
- `text` — цвет текста
- `label` — название квадранта

---

## ✨ Анимации

### Типы анимаций эмодзи

**Файл:** `components/animations/animated-emoji.tsx` (строки 10-25)

Доступные типы анимаций:
- `flicker` — мерцание (🔥, ⚡)
- `sparkle` — блеск (✨, 🌟)
- `heartbeat` — пульс (❤️, 💖)
- `float` — плавающее движение (🚀, 🌊)
- `wiggle` — покачивание (🎯, 📌)
- `bounce` — прыжок (💪, 🎉)

**Как добавить новый эмодзи с анимацией:**

```typescript
// components/animations/animated-emoji.tsx (строка 12)
const EMOJI_ANIMATION_MAP: Record<string, AnimationType> = {
  "🔥": "flicker",
  "🎨": "wiggle",      // ← Добавьте новый эмодзи
  "🎪": "bounce",
};
```

### Интенсивность анимаций

**Файл:** `lib/context/customization-context.tsx`

Пользователи могут отключить анимации в настройках:
- `animationIntensity: 'off'` — анимации отключены
- `animationIntensity: 'low'` — низкая интенсивность
- `animationIntensity: 'medium'` — средняя (по умолчанию)
- `animationIntensity: 'high'` — высокая

### Параметры анимаций

**Файл:** `components/animations/animated-emoji.tsx` (строки 54-130)

Каждая анимация имеет параметры:
- `duration` — длительность в миллисекундах
- `delay` — пауза между повторениями
- `easing` — функция ускорения

**Пример изменения скорости анимации:**

```typescript
// Сделать анимацию медленнее
Animated.timing(anim1, {
  toValue: 1,
  duration: 1400,  // Было 700, теперь 1400 (в 2 раза медленнее)
  easing: Easing.inOut(Easing.sin),
  useNativeDriver: true,
})
```

### Анимация границ задач

**Файл:** `components/task/animated-task-border.tsx`

Переусложненные задачи получают анимированную границу:
- Красная граница — просроченные задачи
- Жёлтая граница — старые задачи без даты

---

## 🏆 Стикеры и достижения

### Где находятся достижения

**Файл:** `lib/services/achievement/definitions.ts`

### Структура достижения

```typescript
{
  id: "my_achievement",           // Уникальный ID
  emoji: "🏆",                    // Эмодзи-стикер
  titleEn: "My Achievement",      // Название на английском
  titleRu: "Мое достижение",      // Название на русском
  descriptionEn: "Do something",  // Описание на английском
  descriptionRu: "Сделайте что-то", // Описание на русском
  conditionType: "tasks_completed_total", // Тип условия
  conditionValue: 10,             // Значение условия
  rarity: "rare",                 // Редкость (common/rare/epic/legendary)
}
```

### Типы условий

| Тип | Описание | Пример |
|-----|---------|--------|
| `tasks_created_day` | Создать X задач за день | 10 задач за день |
| `tasks_completed_day` | Выполнить X задач за день | 5 задач за день |
| `tasks_completed_total` | Выполнить X задач всего | 100 задач всего |
| `streak_days` | Использовать приложение X дней подряд | 7 дней подряд |
| `q1_completed` | Выполнить X задач Q1 | 10 Q1 задач |
| `all_quadrants` | Иметь задачи во всех 4 квадрантах | - |
| `contact_dev` | Пользователь нажал "Связаться с разработчиком" | - |
| `copy_card` | Пользователь скопировал номер карты | - |
| `secret` | Скрытое условие (логика в checker.ts) | - |
| `custom` | Пользовательская логика | - |

### Редкость достижений

| Редкость | Цвет границы | Эффект |
|----------|-------------|--------|
| `common` | Серый | Обычный |
| `rare` | Синий | Редкий |
| `epic` | Фиолетовый | Эпический |
| `legendary` | Золотой | Легендарный |

### Как добавить новое достижение

**Шаг 1:** Откройте `lib/services/achievement/definitions.ts`

**Шаг 2:** Добавьте новый объект в массив `ACHIEVEMENTS`:

```typescript
{
  id: "pizza_lover",
  emoji: "🍕",
  titleEn: "Pizza Lover",
  titleRu: "Любитель пиццы",
  descriptionEn: "Create 5 tasks with pizza emoji",
  descriptionRu: "Создайте 5 задач с эмодзи пиццы",
  conditionType: "custom",
  conditionValue: 5,
  rarity: "common",
}
```

**Шаг 3:** Если используется `custom`, добавьте логику в `lib/services/achievement/checker.ts`:

```typescript
// lib/services/achievement/checker.ts
if (achievement.id === "pizza_lover") {
  const pizzaTasks = tasks.filter(t => t.emoji === "🍕");
  return pizzaTasks.length >= achievement.conditionValue;
}
```

### Как разблокировать эмодзи для задач

**Файл:** `lib/domain/types.ts` (строки 92-117)

Массив `ACHIEVEMENT_EMOJI_IDS` содержит достижения, которые разблокируют эмодзи:

```typescript
export const ACHIEVEMENT_EMOJI_IDS = [
  "kanban_master",    // 📌
  "matrix_navigator", // 🗺️
  "deadline_hunter",  // ⏳
  // ... и т.д.
];
```

Когда пользователь разблокирует достижение из этого списка, соответствующий эмодзи становится доступным при создании задач.

---

## 🌍 Локализация (i18n)

### Где находятся переводы

**Файл:** `lib/i18n/translations.ts`

### Структура переводов

```typescript
export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    common: {
      save: "Save",
      cancel: "Cancel",
      // ... и т.д.
    },
    home: {
      title: "Tasks",
      noTasks: "No tasks yet",
      // ... и т.д.
    },
  },
  ru: {
    common: {
      save: "Сохранить",
      cancel: "Отмена",
      // ... и т.д.
    },
    // ... и т.д.
  },
};
```

### Как добавить новый перевод

**Шаг 1:** Найдите нужный раздел в `lib/i18n/translations.ts`

**Шаг 2:** Добавьте новый ключ:

```typescript
// Для английского
en: {
  home: {
    myNewFeature: "My new feature",
  }
}

// Для русского
ru: {
  home: {
    myNewFeature: "Моя новая функция",
  }
}
```

**Шаг 3:** Используйте в коде:

```typescript
import { useI18n } from "@/lib/context/i18n-context";

export function MyComponent() {
  const { t } = useI18n();
  
  return <Text>{t("home.myNewFeature")}</Text>;
}
```

### Поддерживаемые языки

- `en` — английский
- `ru` — русский

Язык выбирается в настройках или определяется автоматически по системному языку.

---

## 🎬 Экран приветствия

### Где находится экран приветствия

**Файл:** `components/modals/onboarding-tutorial.tsx`

### Как изменить текст приветствия

```typescript
// components/modals/onboarding-tutorial.tsx
const ONBOARDING_SLIDES = [
  {
    titleEn: "Welcome to Мысли в стопки",
    titleRu: "Добро пожаловать в Мысли в стопки",
    descriptionEn: "Manage your tasks efficiently...",
    descriptionRu: "Управляйте своими задачами эффективно...",
    icon: "📋",
  },
  // ... остальные слайды
];
```

### Как добавить новый слайд

```typescript
ONBOARDING_SLIDES.push({
  titleEn: "My Feature",
  titleRu: "Моя функция",
  descriptionEn: "Description in English",
  descriptionRu: "Описание на русском",
  icon: "🎯",
});
```

---

## 📦 Версия приложения

### Где хранится версия

**Файлы:**
- `app.config.ts` (строка 29) — основной источник версии
- `lib/context/app-version-context.tsx` (строка 4) — отображение версии в приложении
- `package.json` (строка 3) — версия пакета

### Как обновить версию

**Шаг 1:** Обновите в `app.config.ts`:
```typescript
version: "1.0.92",
```

**Шаг 2:** Обновите в `lib/context/app-version-context.tsx`:
```typescript
const APP_VERSION = "1.0.92";
```

**Шаг 3:** Обновите в `package.json`:
```json
"version": "1.0.92",
```

**Шаг 4:** Пересоберите приложение

---

## 🔗 Глубокие ссылки (Deep Links)

### Где находятся deep links

**Файлы:**
- `app/_layout.tsx` (строки 121-144) — обработчик deep links
- `lib/integrations/app-shortcuts/handle-deep-link.ts` — парсинг и обработка
- `app.config.ts` (строки 66-78) — конфигурация intent filters

### Текущие deep links

| Deep Link | Действие |
|-----------|----------|
| `manus20260205144419://create-task` | Создать новую задачу |
| `manus20260205144419://matrix` | Открыть матрицу |
| `manus20260205144419://kanban` | Открыть канбан |
| `manus20260205144419://statistics` | Открыть статистику |
| `manus20260205144419://achievements` | Открыть достижения |

### Как добавить новый deep link

**Шаг 1:** Добавьте обработчик в `lib/integrations/app-shortcuts/handle-deep-link.ts`:

```typescript
export function handleShortcutAction(
  action: string,
  navigate: (screen: string, params?: any) => void
) {
  switch (action) {
    case "create-task":
      navigate("add-task");
      break;
    case "my-new-action":
      navigate("my-screen");
      break;
  }
}
```

**Шаг 2:** Используйте в приложении:

```typescript
// Открыть через deep link
Linking.openURL("manus20260205144419://my-new-action");
```

---

## 📱 Структура проекта

```
eisenhower-priority-app/
├── app/                              # Экраны приложения
│   ├── (tabs)/
│   │   ├── index.tsx                 # Главный экран (задачи)
│   │   ├── matrix.tsx                # Матрица Эйзенхауэра
│   │   ├── kanban.tsx                # Канбан доска
│   │   ├── achievements.tsx          # Достижения
│   │   └── settings.tsx              # Настройки
│   ├── add-task.tsx                  # Создание задачи
│   ├── task-detail/[id].tsx          # Редактирование задачи
│   ├── statistics.tsx                # Статистика
│   └── _layout.tsx                   # Корневой layout
│
├── components/                       # Переиспользуемые компоненты
│   ├── animations/                   # Анимированные компоненты
│   │   ├── animated-emoji.tsx        # Анимированные эмодзи
│   │   ├── animated-tab-indicator.tsx
│   │   └── heartbeat-emoji.tsx
│   ├── achievement/                  # Компоненты достижений
│   ├── task/                         # Компоненты задач
│   ├── kanban/                       # Компоненты канбана
│   ├── matrix/                       # Компоненты матрицы
│   ├── modals/                       # Модальные окна
│   │   ├── onboarding-tutorial.tsx   # Экран приветствия
│   │   ├── emoji-picker.tsx          # Выбор эмодзи
│   │   └── file-preview-modal.tsx
│   └── customization/                # Компоненты кастомизации
│
├── lib/                              # Логика приложения
│   ├── _core/
│   │   └── theme.ts                  # Определение тем
│   ├── theme/
│   │   ├── theme-provider.tsx        # Провайдер тем
│   │   └── glow-colors.ts            # Цвета свечения
│   ├── context/
│   │   ├── task-context.tsx          # Контекст задач
│   │   ├── i18n-context.tsx          # Контекст локализации
│   │   ├── achievement-context.tsx   # Контекст достижений
│   │   └── customization-context.tsx # Контекст кастомизации
│   ├── services/
│   │   ├── achievement/
│   │   │   └── definitions.ts        # Определения достижений
│   │   └── notification/             # Уведомления
│   ├── domain/
│   │   ├── types.ts                  # Типы данных
│   │   ├── scoring.ts                # Расчёт приоритета
│   │   └── quadrant-logic.ts         # Логика квадрантов
│   └── i18n/
│       └── translations.ts           # Переводы
│
├── assets/images/                    # Изображения и иконки
│   ├── icon.png                      # Основная иконка
│   ├── splash-icon.png               # Экран загрузки
│   └── android-icon-*.png            # Android иконки
│
├── theme.config.js                   # Конфигурация цветов
├── app.config.ts                     # Конфигурация Expo
└── package.json                      # Зависимости
```

---

## 🚀 Быстрые примеры

### Изменить основной цвет приложения

```javascript
// theme.config.js
primary: { light: '#FF5733', dark: '#FF5733' }
```

### Добавить новый эмодзи с анимацией

```typescript
// components/animations/animated-emoji.tsx
"🎨": "wiggle"
```

### Добавить новое достижение

```typescript
// lib/services/achievement/definitions.ts
{
  id: "artist",
  emoji: "🎨",
  titleEn: "Artist",
  titleRu: "Художник",
  descriptionEn: "Create 10 tasks",
  descriptionRu: "Создайте 10 задач",
  conditionType: "tasks_created_day",
  conditionValue: 10,
  rarity: "rare",
}
```

### Добавить новый перевод

```typescript
// lib/i18n/translations.ts
en: {
  home: {
    myFeature: "My Feature"
  }
},
ru: {
  home: {
    myFeature: "Моя функция"
  }
}
```

---

## 💡 Советы

1. **Всегда обновляйте версию** при изменении приложения
2. **Тестируйте на реальном устройстве** перед публикацией
3. **Используйте hex-коды для цветов** (например, `#FF5733`)
4. **Проверяйте контрастность цветов** для доступности
5. **Добавляйте переводы одновременно** для EN и RU
6. **Документируйте новые достижения** в README
7. **Используйте эмодзи из Unicode** для совместимости

---

## 📞 Поддержка

Если у вас возникли вопросы по кастомизации:
1. Проверьте этот документ
2. Посмотрите примеры в коде
3. Обратитесь к разработчику

