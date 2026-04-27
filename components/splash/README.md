# Custom Animated Splash Screen

Кастомный экран загрузки с анимацией логотипа и текста.

## Компоненты

### AnimatedSplashScreen

Основной компонент с анимациями:
- **Логотип** — fade-in + scale-up (0-600ms)
- **Название** — fade-in (600-1000ms)
- **Подзаголовок** — fade-in (1000-1400ms)
- **Загрузочные точки** — пульсирующая анимация (1400ms+)

**Файл:** `animated-splash-screen.tsx`

**Использование:**
```tsx
<AnimatedSplashScreen isReady={!loading} />
```

### SplashScreenWrapper

Обёртка, которая показывает splash screen пока приложение загружается.

**Файл:** `splash-screen-wrapper.tsx`

**Использование:**
```tsx
<SplashScreenWrapper>
  {/* Main app content */}
</SplashScreenWrapper>
```

## Как это работает

1. **При запуске приложения:**
   - `TaskProvider` инициализирует базу данных
   - `loading` состояние = `true`
   - `SplashScreenWrapper` показывает `AnimatedSplashScreen`

2. **Во время загрузки:**
   - Логотип плавно появляется и увеличивается
   - Текст появляется с задержкой
   - Точки загрузки пульсируют

3. **После загрузки:**
   - `loading` состояние = `false`
   - `AnimatedSplashScreen` плавно исчезает
   - Показывается основное приложение

## Кастомизация

### Изменить время анимации

**Файл:** `animated-splash-screen.tsx`

```typescript
// Логотип (строка 66)
Animated.timing(logoOpacity, {
  toValue: 1,
  duration: 600,  // ← Измените здесь (в миллисекундах)
  easing: Easing.out(Easing.cubic),
  useNativeDriver: true,
}),
```

### Изменить текст

**Файл:** `animated-splash-screen.tsx`

```typescript
// Название (строка 153)
<Animated.Text style={{ ... }}>
  Мысли в стопки  {/* ← Измените здесь */}
</Animated.Text>

// Подзаголовок (строка 162)
<Animated.Text style={{ ... }}>
  Управляйте задачами по матрице Эйзенхауэра  {/* ← Измените здесь */}
</Animated.Text>
```

### Изменить размер логотипа

**Файл:** `animated-splash-screen.tsx`

```typescript
// Строка 143
<Image
  source={require("@/assets/images/splash-icon.png")}
  style={{
    width: 200,   // ← Измените здесь
    height: 200,  // ← Измените здесь
    resizeMode: "contain",
  }}
/>
```

### Изменить цвета

**Файл:** `animated-splash-screen.tsx`

```typescript
// Фон (строка 125)
backgroundColor: colors.background,

// Текст названия (строка 157)
color: colors.foreground,

// Текст подзаголовка (строка 167)
color: colors.muted,

// Точки загрузки (строка 178)
backgroundColor: colors.primary,
```

### Изменить тип анимации

**Файл:** `animated-splash-screen.tsx`

Доступные функции ускорения:
- `Easing.linear` — линейная
- `Easing.quad` — квадратичная
- `Easing.cubic` — кубическая
- `Easing.ease` — плавная
- `Easing.in()` — ускорение в начале
- `Easing.out()` — замедление в конце
- `Easing.inOut()` — ускорение и замедление

```typescript
// Пример: замедление в конце вместо ускорения
Animated.timing(logoOpacity, {
  toValue: 1,
  duration: 600,
  easing: Easing.out(Easing.ease),  // ← Измените здесь
  useNativeDriver: true,
}),
```

## Интеграция в app/_layout.tsx

Splash screen автоматически интегрирован в приложение:

```tsx
// app/_layout.tsx
import { SplashScreenWrapper } from "@/components/splash/splash-screen-wrapper";

export default function RootLayout() {
  const content = (
    <TaskProvider>
      <SplashScreenWrapper>
        {/* Main app content */}
      </SplashScreenWrapper>
    </TaskProvider>
  );
}
```

## Отключение splash screen

Если нужно отключить кастомный splash screen и вернуться к стандартному:

**Вариант 1:** Удалить `SplashScreenWrapper`
```tsx
// app/_layout.tsx
<TaskProvider>
  {/* Удалите SplashScreenWrapper */}
  <AchievementProvider>
    {/* ... */}
  </AchievementProvider>
</TaskProvider>
```

**Вариант 2:** Вернуть старый код в task-context.tsx
```typescript
// lib/context/task-context.tsx
finally {
  setLoading(false);
  setTimeout(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, 3000);  // или 6000
}
```

## Производительность

- **Native Driver:** Все анимации используют `useNativeDriver: true` для оптимальной производительности
- **Web:** Splash screen отключён на веб-версии (проверка `Platform.OS === "web"`)
- **Оптимизация:** Анимации запускаются только один раз при загрузке приложения

## Проблемы и решения

### Splash screen не показывается

1. Проверьте, что `SplashScreenWrapper` обёрнут вокруг контента
2. Проверьте логи: `console.log(loading)` в `SplashScreenWrapper`
3. Убедитесь, что `TaskProvider` загружается перед `SplashScreenWrapper`

### Анимация прерывается

1. Проверьте, что `useNativeDriver: true` установлен
2. Убедитесь, что нет других анимаций, конфликтующих с splash screen
3. Проверьте производительность устройства

### Текст не виден

1. Проверьте контрастность цветов (используйте `colors.foreground` и `colors.muted`)
2. Увеличьте размер шрифта (строка 157, 167)
3. Проверьте, что текст не обрезан (используйте `textAlign: "center"`)

## Примеры кастомизации

### Вариант 1: Быстрая анимация

```typescript
// Сделать все анимации быстрее (в 2 раза)
duration: 300,  // Было 600
duration: 200,  // Было 400
duration: 150,  // Было 300
```

### Вариант 2: Медленная анимация

```typescript
// Сделать все анимации медленнее (в 2 раза)
duration: 1200,  // Было 600
duration: 800,   // Было 400
duration: 600,   // Было 300
```

### Вариант 3: Без точек загрузки

```typescript
// Удалить или скрыть точки загрузки
// Строка 170-185 в animated-splash-screen.tsx
<Animated.View style={{ opacity: 0 }}>  {/* ← Добавьте opacity: 0 */}
  {/* Точки */}
</Animated.View>
```

### Вариант 4: Добавить логотип компании

```typescript
// Добавить дополнительное изображение
<Animated.View style={{ opacity: logoOpacity }}>
  <Image
    source={require("@/assets/images/company-logo.png")}
    style={{ width: 100, height: 100 }}
  />
</Animated.View>
```

## Лучшие практики

1. **Держите анимацию короткой** — 2-3 секунды максимум
2. **Используйте плавные переходы** — избегайте резких изменений
3. **Тестируйте на реальном устройстве** — эмулятор может показывать другую производительность
4. **Используйте native driver** — для оптимальной производительности
5. **Избегайте тяжёлых операций** — во время splash screen приложение инициализируется

