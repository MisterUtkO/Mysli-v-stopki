/**
 * Localization (i18n) - Translations for English and Russian
 */

export type Language = "en" | "ru";

export interface Translations {
  // Common
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    close: string;
    loading: string;
    error: string;
    success: string;
    warning: string;
    confirm: string;
    yes: string;
    no: string;
  };

  // Navigation & Tabs
  navigation: {
    home: string;
    matrix: string;
    statistics: string;
    settings: string;
  };

  // Home Screen
  home: {
    title: string;
    noTasks: string;
    addTask: string;
    filterByQuadrant: string;
    search: string;
    sortBy: string;
    priority: string;
    dueDate: string;
    active: string;
    done: string;
    archived: string;
    all: string;
    notStarted: string;
    inProgress: string;
    completed: string;
    delete: string;
    deleteConfirm: string;
    today: string;
  };

  // Task Detail Screen
  taskDetail: {
    newTask: string;
    editTask: string;
    title: string;
    description: string;
    dueDate: string;
    importance: string;
    urgency: string;
    quadrant: string;
    priority: string;
    nextAction: string;
    status: string;
    tags: string;
    created: string;
    updated: string;
    markAsDone: string;
    markAsActive: string;
    archive: string;
    restore: string;
    deleteTask: string;
    deleteConfirm: string;
  };

  // Matrix Screen
  matrix: {
    title: string;
    q1: string;
    q1Desc: string;
    q2: string;
    q2Desc: string;
    q3: string;
    q3Desc: string;
    q4: string;
    q4Desc: string;
    doNow: string;
    schedule: string;
    delegate: string;
    delete: string;
    kanbanView: string;
    matrixView: string;
    addColumn: string;
    columnName: string;
    addSticker: string;
    stickerColor: string;
    textColor: string;
    dragToMove: string;
    pinchToZoom: string;
    deleteColumn: string;
    emptyColumn: string;
    newSticker: string;
  };

  // Statistics Screen
  statistics: {
    title: string;
    totalTasks: string;
    activeTasks: string;
    completedTasks: string;
    archivedTasks: string;
    byQuadrant: string;
    byStatus: string;
    averagePriority: string;
    urgentTasks: string;
    importantTasks: string;
  };

  // Settings Screen
  settings: {
    title: string;
    theme: string;
    language: string;
    notifications: string;
    about: string;
    version: string;
    dataManagement: string;
    exportData: string;
    importData: string;
    clearAllData: string;
    clearAllDataConfirm: string;
  };

  // Notifications
  notifications: {
    title: string;
    enable: string;
    taskReminders: string;
    dailyReminders: string;
    q1Enabled: string;
    q2Enabled: string;
    q3Enabled: string;
    reminderTime: string;
    dailyReminderTime: string;
    daysToRemind: string;
    testNotification: string;
    sendTestNotification: string;
  };

  // Thresholds & Scoring
  scoring: {
    weights: string;
    thresholds: string;
    importanceWeight: string;
    urgencyWeight: string;
    importanceThreshold: string;
    urgencyThreshold: string;
    reset: string;
  };

  // Messages
  messages: {
    taskCreated: string;
    taskUpdated: string;
    taskDeleted: string;
    taskArchived: string;
    taskRestored: string;
    taskCompleted: string;
    dataExported: string;
    dataImported: string;
    dataCleared: string;
    permissionDenied: string;
    offline: string;
  };

  // Onboarding
  onboarding: {
    welcome: string;
    welcomeDescription: string;
    tasksTitle: string;
    tasksDescription: string;
    matrixTitle: string;
    matrixDescription: string;
    kanbanTitle: string;
    kanbanDescription: string;
    achievementsTitle: string;
    achievementsDescription: string;
    tipsTitle: string;
    tipsDescription: string;
    skip: string;
    next: string;
    previous: string;
    getStarted: string;
    swipeHint: string;
  };
}

const EN: Translations = {
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    close: "Close",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    warning: "Warning",
    confirm: "Confirm",
    yes: "Yes",
    no: "No",
  },

  navigation: {
    home: "Home",
    matrix: "Matrix",
    statistics: "Statistics",
    settings: "Settings",
  },

  home: {
    title: "Tasks",
    noTasks: "No tasks yet. Create your first task!",
    addTask: "Add Task",
    filterByQuadrant: "Filter by Quadrant",
    search: "Search tasks...",
    sortBy: "Sort by",
    priority: "Priority",
    dueDate: "Due Date",
    active: "Active",
    done: "Done",
    archived: "Archived",
    all: "All",
    notStarted: "Not started",
    inProgress: "In progress",
    completed: "Completed",
    delete: "Delete",
    deleteConfirm: "Delete task?",
    today: "Today",
  },

  taskDetail: {
    newTask: "New Task",
    editTask: "Edit Task",
    title: "Title",
    description: "Description",
    dueDate: "Due Date",
    importance: "Importance (1-10)",
    urgency: "Urgency (1-10)",
    quadrant: "Quadrant",
    priority: "Priority Score",
    nextAction: "Next Action",
    status: "Status",
    tags: "Tags",
    created: "Created",
    updated: "Updated",
    markAsDone: "Mark as Done",
    markAsActive: "Mark as Active",
    archive: "Archive",
    restore: "Restore",
    deleteTask: "Delete Task",
    deleteConfirm: "Are you sure you want to delete this task?",
  },

  matrix: {
    title: "Eisenhower Matrix",
    q1: "Q1: Do Now",
    q1Desc: "Urgent & Important",
    q2: "Q2: Schedule",
    q2Desc: "Important & Not Urgent",
    q3: "Q3: Delegate",
    q3Desc: "Urgent & Not Important",
    q4: "Q4: Delete",
    q4Desc: "Not Urgent & Not Important",
    doNow: "Do Now",
    schedule: "Schedule",
    delegate: "Delegate",
    delete: "Delete",
    kanbanView: "Kanban Board",
    matrixView: "Matrix View",
    addColumn: "Add Column",
    columnName: "Column name",
    addSticker: "Add Sticker",
    stickerColor: "Sticker color",
    textColor: "Text color",
    dragToMove: "Hold & drag to move",
    pinchToZoom: "Pinch to zoom",
    deleteColumn: "Delete column",
    emptyColumn: "No stickers yet",
    newSticker: "New sticker",
  },

  statistics: {
    title: "Statistics",
    totalTasks: "Total Tasks",
    activeTasks: "Active Tasks",
    completedTasks: "Completed Tasks",
    archivedTasks: "Archived Tasks",
    byQuadrant: "Tasks by Quadrant",
    byStatus: "Tasks by Status",
    averagePriority: "Average Priority",
    urgentTasks: "Urgent Tasks",
    importantTasks: "Important Tasks",
  },

  settings: {
    title: "Settings",
    theme: "Theme",
    language: "Language",
    notifications: "Notifications",
    about: "About",
    version: "Version",
    dataManagement: "Data Management",
    exportData: "Export Data",
    importData: "Import Data",
    clearAllData: "Clear All Data",
    clearAllDataConfirm: "Are you sure? This cannot be undone.",
  },

  notifications: {
    title: "Notifications",
    enable: "Enable Notifications",
    taskReminders: "Task Reminders",
    dailyReminders: "Daily Review Reminder",
    q1Enabled: "Q1 - Do Now",
    q2Enabled: "Q2 - Schedule",
    q3Enabled: "Q3 - Delegate",
    reminderTime: "Reminder Time Before Due Date",
    dailyReminderTime: "Daily Reminder Time",
    daysToRemind: "Days to Remind",
    testNotification: "Test Notification",
    sendTestNotification: "Send Test Notification",
  },

  scoring: {
    weights: "Weights",
    thresholds: "Thresholds",
    importanceWeight: "Importance Weight",
    urgencyWeight: "Urgency Weight",
    importanceThreshold: "Importance Threshold",
    urgencyThreshold: "Urgency Threshold",
    reset: "Reset to Defaults",
  },

  messages: {
    taskCreated: "Task created successfully",
    taskUpdated: "Task updated successfully",
    taskDeleted: "Task deleted successfully",
    taskArchived: "Task archived successfully",
    taskRestored: "Task restored successfully",
    taskCompleted: "Task marked as completed",
    dataExported: "Data exported successfully",
    dataImported: "Data imported successfully",
    dataCleared: "All data cleared",
    permissionDenied: "Permission denied",
    offline: "You are offline",
  },

  onboarding: {
    welcome: "Welcome to SDVGNote",
    welcomeDescription: "Manage your tasks efficiently with SDVGNote. Organize tasks by urgency and importance.",
    tasksTitle: "Tasks Screen",
    tasksDescription: "View all your tasks in different views: All, Start, In Progress, and Done. Swipe tasks to change their status or delete them.",
    matrixTitle: "Priority Matrix",
    matrixDescription: "Visualize your tasks in a 2x2 matrix: Urgent & Important, Important, Urgent, and Neither. Focus on what matters most.",
    kanbanTitle: "Kanban Board",
    kanbanDescription: "Organize tasks in columns: To Do, In Progress, and Done. Drag tasks between columns to update their status.",
    achievementsTitle: "Achievements",
    achievementsDescription: "Track your progress with daily, weekly, and monthly achievements. Celebrate your productivity milestones!",
    tipsTitle: "Pro Tips",
    tipsDescription: "Create tasks with clear titles, set priorities, and review your progress regularly. Start with one task and build momentum!",
    skip: "Skip",
    next: "Next",
    previous: "Back",
    getStarted: "Get Started",
    swipeHint: "← swipe to navigate →",
  },
};

const RU: Translations = {
  common: {
    save: "Сохранить",
    cancel: "Отмена",
    delete: "Удалить",
    edit: "Редактировать",
    add: "Добавить",
    close: "Закрыть",
    loading: "Загрузка...",
    error: "Ошибка",
    success: "Успешно",
    warning: "Предупреждение",
    confirm: "Подтвердить",
    yes: "Да",
    no: "Нет",
  },

  navigation: {
    home: "Главная",
    matrix: "Матрица",
    statistics: "Статистика",
    settings: "Настройки",
  },

  home: {
    title: "Задачи",
    noTasks: "Нет задач. Создайте первую задачу!",
    addTask: "Добавить задачу",
    filterByQuadrant: "Фильтр по квадранту",
    search: "Поиск задач...",
    sortBy: "Сортировать по",
    priority: "Приоритет",
    dueDate: "Срок выполнения",
    active: "Активные",
    done: "Завершенные",
    archived: "Архивированные",
    all: "Все",
    notStarted: "Не начато",
    inProgress: "В процессе",
    completed: "Выполнено",
    delete: "Удалить",
    deleteConfirm: "Удалить задачу?",
    today: "Сегодня",
  },

  taskDetail: {
    newTask: "Новая задача",
    editTask: "Редактировать задачу",
    title: "Название",
    description: "Описание",
    dueDate: "Срок выполнения",
    importance: "Важность (1-10)",
    urgency: "Срочность (1-10)",
    quadrant: "Квадрант",
    priority: "Оценка приоритета",
    nextAction: "Следующее действие",
    status: "Статус",
    tags: "Теги",
    created: "Создано",
    updated: "Обновлено",
    markAsDone: "Отметить как завершенную",
    markAsActive: "Отметить как активную",
    archive: "Архивировать",
    restore: "Восстановить",
    deleteTask: "Удалить задачу",
    deleteConfirm: "Вы уверены, что хотите удалить эту задачу?",
  },

  matrix: {
    title: "Матрица Эйзенхауэра",
    q1: "К1: Делать сейчас",
    q1Desc: "Срочное и важное",
    q2: "К2: Планировать",
    q2Desc: "Важное, но не срочное",
    q3: "К3: Делегировать",
    q3Desc: "Срочное, но не важное",
    q4: "К4: Удалить",
    q4Desc: "Не срочное и не важное",
    doNow: "Делать сейчас",
    schedule: "Планировать",
    delegate: "Делегировать",
    delete: "Удалить",
    kanbanView: "Канбан-доска",
    matrixView: "Вид матрицы",
    addColumn: "Добавить столбец",
    columnName: "Название столбца",
    addSticker: "Добавить стикер",
    stickerColor: "Цвет стикера",
    textColor: "Цвет текста",
    dragToMove: "Удерживайте для перемещения",
    pinchToZoom: "Щипок для масштаба",
    deleteColumn: "Удалить столбец",
    emptyColumn: "Пока пусто",
    newSticker: "Новый стикер",
  },

  statistics: {
    title: "Статистика",
    totalTasks: "Всего задач",
    activeTasks: "Активные задачи",
    completedTasks: "Завершенные задачи",
    archivedTasks: "Архивированные задачи",
    byQuadrant: "Задачи по квадрантам",
    byStatus: "Задачи по статусам",
    averagePriority: "Средний приоритет",
    urgentTasks: "Срочные задачи",
    importantTasks: "Важные задачи",
  },

  settings: {
    title: "Настройки",
    theme: "Тема",
    language: "Язык",
    notifications: "Уведомления",
    about: "О приложении",
    version: "Версия",
    dataManagement: "Управление данными",
    exportData: "Экспортировать данные",
    importData: "Импортировать данные",
    clearAllData: "Очистить все данные",
    clearAllDataConfirm: "Вы уверены? Это нельзя отменить.",
  },

  notifications: {
    title: "Уведомления",
    enable: "Включить уведомления",
    taskReminders: "Напоминания о задачах",
    dailyReminders: "Ежедневное напоминание об обзоре",
    q1Enabled: "К1 - Делать сейчас",
    q2Enabled: "К2 - Планировать",
    q3Enabled: "К3 - Делегировать",
    reminderTime: "Время напоминания до срока",
    dailyReminderTime: "Время ежедневного напоминания",
    daysToRemind: "Дни для напоминаний",
    testNotification: "Тестовое уведомление",
    sendTestNotification: "Отправить тестовое уведомление",
  },

  scoring: {
    weights: "Веса",
    thresholds: "Пороги",
    importanceWeight: "Вес важности",
    urgencyWeight: "Вес срочности",
    importanceThreshold: "Порог важности",
    urgencyThreshold: "Порог срочности",
    reset: "Сбросить на значения по умолчанию",
  },

  messages: {
    taskCreated: "Задача успешно создана",
    taskUpdated: "Задача успешно обновлена",
    taskDeleted: "Задача успешно удалена",
    taskArchived: "Задача успешно архивирована",
    taskRestored: "Задача успешно восстановлена",
    taskCompleted: "Задача отмечена как завершенная",
    dataExported: "Данные успешно экспортированы",
    dataImported: "Данные успешно импортированы",
    dataCleared: "Все данные очищены",
    permissionDenied: "Доступ запрещен",
    offline: "Вы в режиме оффлайн",
  },

  onboarding: {
    welcome: "Добро пожаловать в SDVGNote",
    welcomeDescription: "Управляйте своими задачами эффективно с помощью SDVGNote. Организуйте задачи по срочности и важности.",
    tasksTitle: "Экран задач",
    tasksDescription: "Просмотрите все свои задачи в разных представлениях: Все, Начало, В процессе и Готово. Проведите по задачам, чтобы изменить статус или удалить их.",
    matrixTitle: "Матрица приоритетов",
    matrixDescription: "Визуализируйте свои задачи в матрице 2x2: Срочно и важно, Важно, Срочно и Ни то ни другое. Сосредоточьтесь на том, что действительно важно.",
    kanbanTitle: "Доска Канбан",
    kanbanDescription: "Организуйте задачи в столбцы: К выполнению, В процессе и Готово. Перетащите задачи между столбцами, чтобы обновить их статус.",
    achievementsTitle: "Достижения",
    achievementsDescription: "Отслеживайте свой прогресс с помощью ежедневных, еженедельных и ежемесячных достижений. Празднуйте вехи своей производительности!",
    tipsTitle: "Полезные советы",
    tipsDescription: "Создавайте задачи с четкими названиями, устанавливайте приоритеты и регулярно проверяйте свой прогресс. Начните с одной задачи и наберите темп!",
    skip: "Пропустить",
    next: "Далее",
    previous: "Назад",
    getStarted: "Начать",
    swipeHint: "← свайп для навигации →",
  },
};

export const TRANSLATIONS: Record<Language, Translations> = {
  en: EN,
  ru: RU,
};

/**
 * Get translations for a specific language
 */
export function getTranslations(language: Language): Translations {
  return TRANSLATIONS[language] || TRANSLATIONS.en;
}

