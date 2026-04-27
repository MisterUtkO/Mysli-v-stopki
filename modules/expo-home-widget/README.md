# Expo Home Widget Module

Home Screen Widget для приложения "Мысли в стопки" (Eisenhower Priority App).

## Функционал

Виджет предоставляет быстрый доступ к основным функциям приложения прямо с главного экрана Android:

- **➕ Создать задачу** — открывает экран создания новой задачи
- **📊 Матрица** — переходит на экран матрицы Эйзенхауэра
- **📋 Канбан** — открывает доску Канбан

## Архитектура

```
modules/expo-home-widget/
├── android/
│   ├── src/main/
│   │   ├── kotlin/expo/homewidget/
│   │   │   ├── HomeWidgetProvider.kt    ← Widget receiver
│   │   │   └── HomeWidgetModule.kt      ← Expo module
│   │   └── res/
│   │       ├── layout/widget_layout.xml
│   │       ├── drawable/                ← Styles
│   │       ├── values/strings.xml
│   │       └── xml/widget_info.xml
│   └── build.gradle
├── src/
│   └── index.ts                         ← TypeScript interface
├── app.plugin.js                        ← Expo config plugin
├── expo-module.config.json
└── package.json
```

## Как это работает

### 1. Widget Provider (Kotlin)

`HomeWidgetProvider.kt` — это Android `AppWidgetProvider`, который:
- Отображает виджет на главном экране
- Обрабатывает клики на кнопки
- Отправляет deep links в приложение

### 2. Deep Links

Каждая кнопка отправляет deep link:
- `manus20260205144419://create-task` → создание задачи
- `manus20260205144419://matrix` → матрица
- `manus20260205144419://kanban` → канбан

Схема `manus20260205144419` берётся из `app.config.ts`.

### 3. Expo Config Plugin

`app.plugin.js` интегрирует виджет в AndroidManifest:
- Регистрирует `HomeWidgetProvider` как receiver
- Добавляет необходимые permissions
- Подключает widget metadata

### 4. Deep Link Handler

В `app/_layout.tsx` уже реализован обработчик deep links:
```typescript
useEffect(() => {
  const handleDeepLink = ({ url }: { url: string }) => {
    const deepLink = parseDeepLink(url);
    if (deepLink && navigationRef.current) {
      handleShortcutAction(deepLink.action, (screen: string, params?: any) => {
        navigationRef.current?.navigate(screen as any, params);
      });
    }
  };
  // ...
}, []);
```

## Установка виджета на устройство

1. **Собрать APK:**
   ```bash
   eas build --platform android --local
   ```

2. **Установить на устройство:**
   ```bash
   adb install app-release.apk
   ```

3. **Добавить виджет на главный экран:**
   - Долгий тап на пустое место на главном экране
   - Выбрать "Виджеты"
   - Найти "Мысли в стопки"
   - Выбрать размер и место для виджета

## Поддерживаемые версии

- **Android:** 6.0+ (API 24+)
- **Expo SDK:** 54+
- **React Native:** 0.81+

## Размеры виджета

- **Минимальный:** 180dp × 180dp (4×4 ячейки)
- **Рекомендуемый:** 200dp × 200dp (4×4 ячейки)
- **Максимальный:** Зависит от экрана устройства

Виджет поддерживает ресайз (горизонтальный и вертикальный).

## Тёмная тема

Виджет автоматически адаптируется к тёмной теме устройства:
- Фон: `?android:attr/colorBackground`
- Текст: `?android:attr/textColorPrimary`
- Кнопки: Используют `?android:attr/colorAccent`

## Обновление виджета

Виджет обновляется автоматически при:
- Установке приложения
- Обновлении приложения
- Перезагрузке устройства

Для программного обновления из приложения:
```typescript
import HomeWidgetModule from 'expo-home-widget';

await HomeWidgetModule.updateWidget();
```

## Решение проблем

### Виджет не появляется в списке

1. Убедитесь, что приложение установлено
2. Перезагрузите устройство
3. Очистите кэш лаунчера:
   ```bash
   adb shell pm clear com.android.launcher3
   ```

### Кнопки не работают

1. Проверьте, что deep links включены в `app.config.ts`
2. Убедитесь, что схема совпадает: `manus20260205144419`
3. Проверьте логи:
   ```bash
   adb logcat | grep HomeWidget
   ```

### Виджет не обновляется

1. Проверьте, что `AppWidgetManager` имеет доступ
2. Убедитесь, что `updatePeriodMillis` установлен правильно в `widget_info.xml`

## Дополнительно

- [Android AppWidget Documentation](https://developer.android.com/guide/topics/appwidgets)
- [Expo Modules Documentation](https://docs.expo.dev/modules/overview/)
- [Deep Linking in Expo](https://docs.expo.dev/guides/deep-linking/)
