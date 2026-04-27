# 📂 Справочник структуры файлов приложения

Полный справочник по всем файлам приложения с описанием их назначения и того, что в них можно менять.

---

## 🎨 ВИЗУАЛЬНЫЕ ЭЛЕМЕНТЫ И ДИЗАЙН

### Иконки и логотипы

| Файл | Размер | Назначение | Что менять |
|------|--------|-----------|-----------|
| `assets/images/icon.png` | 1024×1024 | Основная иконка приложения | Замените на новый логотип |
| `assets/images/android-icon-foreground.png` | 1024×1024 | Передний слой адаптивной иконки Android | Замените на новый дизайн |
| `assets/images/android-icon-background.png` | 1024×1024 | Фоновый слой адаптивной иконки | Однотонный фон |
| `assets/images/android-icon-monochrome.png` | 1024×1024 | Монохромная иконка для Android 13+ | Чёрно-белый вариант |
| `assets/images/favicon.png` | 192×192 или 512×512 | Иконка веб-версии | Замените на новый логотип |
| `assets/images/splash-icon.png` | 720×1280 | Экран загрузки (splash screen) | Замените на новый дизайн |

**Как менять:** Замените файлы в папке `assets/images/` и обновите версию в `app.config.ts`

---

## 🎨 ЦВЕТА И ТЕМЫ

### Основная конфигурация цветов

| Файл | Строки | Назначение | Что менять |
|------|--------|-----------|-----------|
| `theme.config.js` | 1-14 | Базовые цвета (light/dark) | Hex-коды цветов |

**Пример:**
```javascript
primary: { light: '#0a7ea4', dark: '#0a7ea4' }
```

### Расширенные темы

| Файл | Строки | Назначение | Что менять |
|------|--------|-----------|-----------|
| `lib/_core/theme.ts` | 30-80 | Определение тем (amoled, pastel, notebook, darkMatte) | Цвета для каждой темы |
| `lib/_core/theme.ts` | 111-118 | Экспорт цветов | Не менять |

**Как добавить новую тему:**
1. Добавьте в `lib/_core/theme.ts` в функции `buildSchemePalette`
2. Добавьте тип в `ColorScheme` (строка 5)
3. Добавьте в `Colors` объект (строка 111)

### Цвета квадрантов матрицы

| Файл | Строки | Назначение | Что менять |
|------|--------|-----------|-----------|
| `lib/domain/types.ts` | 122-127 | Цвета Q1, Q2, Q3, Q4 | background, border, text |

**Пример Q1:**
```typescript
Q1: { 
  background: "#FF6B6B",    // Основной цвет
  border: "#C92A2A",        // Цвет границы
  text: "#FFFFFF",          // Цвет текста
  label: "Do Now"           // Название
}
```

---

## 🎬 ЭКРАНЫ И КОМПОНЕНТЫ

### Главные экраны (Tabs)

| Файл | Назначение | Что менять |
|------|-----------|-----------|
| `app/(tabs)/index.tsx` | Главный экран (список задач) | Макет, фильтры, сортировка |
| `app/(tabs)/matrix.tsx` | Матрица Эйзенхауэра | Макет квадрантов, drag-and-drop |
| `app/(tabs)/kanban.tsx` | Канбан доска | Колонки, стикеры |
| `app/(tabs)/achievements.tsx` | Достижения и стикеры | Сетка достижений, анимации |
| `app/(tabs)/settings.tsx` | Настройки приложения | Опции, переводы |
| `app/(tabs)/_layout.tsx` | Конфигурация табов | Иконки табов, порядок |

### Модальные окна и детали

| Файл | Назначение | Что менять |
|------|-----------|-----------|
| `app/add-task.tsx` | Создание новой задачи | Форма, поля ввода |
| `app/task-detail/[id].tsx` | Редактирование задачи | Форма, поля, валидация |
| `app/statistics.tsx` | Статистика и графики | Графики, метрики |
| `components/modals/onboarding-tutorial.tsx` | Экран приветствия | Текст слайдов, иконки |
| `components/modals/emoji-picker.tsx` | Выбор эмодзи | Список эмодзи |

### Компоненты задач

| Файл | Назначение | Что менять |
|------|-----------|-----------|
| `components/task/swipeable-task-card.tsx` | Карточка задачи со свайпом | Макет, анимации |
| `components/task/animated-task-border.tsx` | Анимированная граница | Цвета, анимация |
| `components/task/task-detail-modal.tsx` | Модальное окно деталей | Макет, информация |
| `components/task/task-popup-bubble.tsx` | Всплывающее окно | Текст, стили |

### Компоненты матрицы

| Файл | Назначение | Что менять |
|------|-----------|-----------|
| `components/matrix/matrix-task-card.tsx` | Карточка задачи в матрице | Размер, стили |
| `components/matrix/matrix-edit-text-modal.tsx` | Редактирование текста в матрице | Форма, валидация |

### Компоненты канбана

| Файл | Назначение | Что менять |
|------|-----------|-----------|
| `components/kanban/kanban-board.tsx` | Основная доска канбана | Макет, логика |
| `components/kanban/kanban-sticker-detail-modal.tsx` | Детали стикера | Форма, информация |

### Компоненты достижений

| Файл | Назначение | Что менять |
|------|-----------|-----------|
| `components/achievement/achievement-celebration.tsx` | Празднование разблокировки | Анимация, текст |
| `components/achievement/animated-achievement-card.tsx` | Карточка достижения | Макет, анимация |

---

## ✨ АНИМАЦИИ

| Файл | Назначение | Что менять |
|------|-----------|-----------|
| `components/animations/animated-emoji.tsx` | Анимированные эмодзи | Типы анимаций, скорость, эмодзи |
| `components/animations/animated-tab-indicator.tsx` | Анимация индикатора табов | Анимация, цвета |
| `components/animations/haptic-tab.tsx` | Вибрация при нажатии | Тип вибрации, интенсивность |
| `components/animations/heartbeat-emoji.tsx` | Пульсирующий эмодзи | Скорость пульса, размер |
| `components/animations/parallax-scroll-view.tsx` | Параллакс скролл | Скорость, эффект |
| `components/animations/screen-transition.tsx` | Переходы между экранами | Длительность, тип анимации |

**Как менять анимации:**

1. **Скорость:** Измените `duration` в миллисекундах
2. **Тип:** Измените `easing` (Easing.linear, Easing.ease, и т.д.)
3. **Эффект:** Измените `toValue` (0-1 для opacity, 0-360 для rotation)

---

## 🏆 ДОСТИЖЕНИЯ И СТИКЕРЫ

| Файл | Строки | Назначение | Что менять |
|------|--------|-----------|-----------|
| `lib/services/achievement/definitions.ts` | 36+ | Определения всех достижений | Добавьте новые достижения |
| `lib/services/achievement/checker.ts` | 1-200 | Логика проверки достижений | Условия разблокировки |
| `lib/domain/types.ts` | 88-117 | Типы и списки эмодзи | TASK_EMOJIS, ACHIEVEMENT_EMOJI_IDS |

**Структура достижения:**
```typescript
{
  id: "unique_id",
  emoji: "🏆",
  titleEn: "English Title",
  titleRu: "Русское название",
  descriptionEn: "English description",
  descriptionRu: "Русское описание",
  conditionType: "tasks_completed_total",
  conditionValue: 100,
  rarity: "epic"
}
```

**Типы условий:**
- `tasks_created_day` — создать X задач за день
- `tasks_completed_day` — выполнить X задач за день
- `tasks_completed_total` — выполнить X задач всего
- `streak_days` — использовать приложение X дней подряд
- `q1_completed` — выполнить X Q1 задач
- `all_quadrants` — иметь задачи во всех 4 квадрантах
- `contact_dev` — нажать "Связаться с разработчиком"
- `copy_card` — скопировать номер карты
- `secret` — скрытое условие
- `custom` — пользовательское условие

---

## 🌍 ЛОКАЛИЗАЦИЯ (i18n)

| Файл | Назначение | Что менять |
|------|-----------|-----------|
| `lib/i18n/translations.ts` | Все переводы EN/RU | Текст на английском и русском |
| `lib/context/i18n-context.tsx` | Контекст языка | Логика переключения языка |

**Структура переводов:**
```typescript
export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    common: { save: "Save", cancel: "Cancel" },
    home: { title: "Tasks", noTasks: "No tasks yet" },
    // ...
  },
  ru: {
    common: { save: "Сохранить", cancel: "Отмена" },
    home: { title: "Задачи", noTasks: "Нет задач" },
    // ...
  }
}
```

**Как добавить новый перевод:**
1. Откройте `lib/i18n/translations.ts`
2. Найдите нужный раздел (common, home, settings, и т.д.)
3. Добавьте новый ключ для EN и RU
4. Используйте в коде: `t("section.key")`

---

## ⚙️ КОНФИГУРАЦИЯ И ВЕРСИЯ

| Файл | Строки | Назначение | Что менять |
|------|--------|-----------|-----------|
| `app.config.ts` | 29 | Версия приложения | Обновите версию |
| `app.config.ts` | 22-27 | Название и логотип | appName, logoUrl |
| `app.config.ts` | 38-56 | Иконки | Пути к файлам иконок |
| `app.config.ts` | 105-115 | Splash screen | Путь, размер, цвет |
| `lib/context/app-version-context.tsx` | 4 | Версия в приложении | APP_VERSION |
| `package.json` | 3 | Версия пакета | version |

**Как обновить версию:**
1. Обновите в `app.config.ts` (строка 29)
2. Обновите в `lib/context/app-version-context.tsx` (строка 4)
3. Обновите в `package.json` (строка 3)

---

## 🔗 ГЛУБОКИЕ ССЫЛКИ (Deep Links)

| Файл | Назначение | Что менять |
|------|-----------|-----------|
| `app/_layout.tsx` | 121-144 | Обработчик deep links | Логика навигации |
| `lib/integrations/app-shortcuts/handle-deep-link.ts` | 1-50 | Парсинг и обработка | Добавьте новые действия |
| `app.config.ts` | 66-78 | Intent filters | Deep link схемы |

**Текущие deep links:**
- `manus20260205144419://create-task` — создать задачу
- `manus20260205144419://matrix` — открыть матрицу
- `manus20260205144419://kanban` — открыть канбан
- `manus20260205144419://statistics` — открыть статистику
- `manus20260205144419://achievements` — открыть достижения

---

## 📊 ДАННЫЕ И ЛОГИКА

| Файл | Назначение | Что менять |
|------|-----------|-----------|
| `lib/domain/types.ts` | Типы данных | Структуры Task, Settings, и т.д. |
| `lib/domain/scoring.ts` | Расчёт приоритета | Формула расчёта score |
| `lib/domain/quadrant-logic.ts` | Логика квадрантов | Правила распределения |
| `lib/context/task-context.tsx` | Контекст задач | Управление состоянием задач |
| `lib/context/achievement-context.tsx` | Контекст достижений | Управление достижениями |
| `lib/context/customization-context.tsx` | Контекст кастомизации | Настройки пользователя |

---

## 📱 ВИДЖЕТЫ И ИНТЕГРАЦИИ

| Файл | Назначение | Что менять |
|------|-----------|-----------|
| `modules/expo-home-widget/` | Home Screen Widget | Кнопки, макет виджета |
| `plugins/with-app-shortcuts.ts` | App Shortcuts | Меню долгого нажатия |
| `lib/services/notification/` | Уведомления | Расписание, текст |

---

## 🗄️ БАЗА ДАННЫХ

| Файл | Назначение | Что менять |
|------|-----------|-----------|
| `drizzle/schema.ts` | Схема БД | Структура таблиц |
| `lib/database/db.ts` | CRUD операции | Запросы к БД |

---

## 🧪 ТЕСТЫ

| Файл | Назначение | Что менять |
|------|-----------|-----------|
| `__tests__/` | Тесты приложения | Добавьте новые тесты |
| `lib/achievements/checker.test.ts` | Тесты достижений | Проверка логики |
| `lib/domain/scoring.test.ts` | Тесты расчётов | Проверка формул |

---

## 📝 ДОКУМЕНТАЦИЯ

| Файл | Назначение |
|------|-----------|
| `README.md` | Основная документация |
| `CUSTOMIZATION_GUIDE.md` | Руководство по кастомизации |
| `FILE_STRUCTURE_REFERENCE.md` | Этот файл |
| `ANDROID_STUDIO_DEPLOYMENT.md` | Развёртывание на Android |
| `modules/expo-home-widget/README.md` | Документация виджета |

---

## 🚀 БЫСТРЫЕ ССЫЛКИ

### Изменить цвет
→ `theme.config.js`

### Добавить достижение
→ `lib/services/achievement/definitions.ts`

### Добавить перевод
→ `lib/i18n/translations.ts`

### Добавить анимацию
→ `components/animations/animated-emoji.tsx`

### Изменить логотип
→ `assets/images/icon.png` и другие

### Обновить версию
→ `app.config.ts`, `lib/context/app-version-context.tsx`, `package.json`

### Добавить экран
→ `app/(tabs)/` или `app/`

### Добавить deep link
→ `lib/integrations/app-shortcuts/handle-deep-link.ts`

---

## 💡 СОВЕТЫ

1. **Всегда обновляйте версию** при изменениях
2. **Добавляйте переводы одновременно** для EN и RU
3. **Тестируйте на реальном устройстве** перед публикацией
4. **Используйте hex-коды** для цветов (например, `#FF5733`)
5. **Проверяйте контрастность** для доступности
6. **Документируйте новые функции** в README
7. **Запускайте тесты** перед сборкой: `pnpm test`

