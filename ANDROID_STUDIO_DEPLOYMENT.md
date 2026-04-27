# Инструкция по развёртыванию "Мысли в стопки" на Android Studio

## Требования

- **Android Studio** (последняя версия)
- **Java Development Kit (JDK)** 11 или выше
- **Android SDK** (API 24+)
- **Node.js** 16+ и **pnpm**
- **Expo CLI**
- Эмулятор Android или реальное Android устройство

---

## Шаг 1: Подготовка проекта

### 1.1 Клонируйте или распакуйте проект

```bash
# Если вы загрузили ZIP архив
unzip eisenhower-priority-app.zip
cd eisenhower-priority-app

# Или клонируйте с GitHub
git clone https://github.com/YOUR_USERNAME/eisenhower-priority-app.git
cd eisenhower-priority-app
```

### 1.2 Установите зависимости

```bash
pnpm install
```

---

## Шаг 2: Сборка APK для Android

### Вариант A: Сборка через Expo (рекомендуется для начинающих)

#### 2A.1 Установите Expo CLI

```bash
npm install -g expo-cli
```

#### 2A.2 Создайте аккаунт Expo (если его нет)

```bash
expo login
# или
expo register
```

#### 2A.3 Соберите APK

```bash
eas build --platform android --local
```

**Или используйте облачную сборку:**

```bash
eas build --platform android
```

Это создаст APK файл, который вы сможете скачать.

---

### Вариант B: Сборка через Android Studio (продвинутый)

#### 2B.1 Сгенерируйте нативный Android проект

```bash
# Экспортируйте проект в нативный Android формат
npx expo prebuild --clean
```

Это создаст папку `android/` с полным Android проектом.

#### 2B.2 Откройте проект в Android Studio

1. Откройте **Android Studio**
2. Выберите **File → Open**
3. Перейдите в папку проекта и откройте папку `android/`
4. Android Studio автоматически загрузит проект

#### 2B.3 Синхронизируйте Gradle

1. Android Studio предложит синхронизировать Gradle
2. Нажмите **Sync Now**
3. Дождитесь завершения синхронизации

#### 2B.4 Соберите APK

**Способ 1: Через меню**
1. Выберите **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Дождитесь завершения сборки
3. APK файл будет в папке `android/app/build/outputs/apk/`

**Способ 2: Через командную строку**

```bash
cd android
./gradlew assembleRelease
```

APK будет в: `android/app/build/outputs/apk/release/app-release.apk`

---

## Шаг 3: Установка APK на устройство

### 3.1 На реальное устройство

#### Через Android Studio:

1. Подключите Android устройство к компьютеру через USB
2. Включите **Developer Mode** на устройстве:
   - Зайдите в **Settings → About phone**
   - Нажимайте на **Build number** 7 раз
   - Вернитесь в **Settings → Developer options**
   - Включите **USB Debugging**

3. В Android Studio выберите **Run → Run 'app'**
4. Выберите ваше устройство
5. Приложение установится и запустится

#### Через командную строку (ADB):

```bash
adb install app-release.apk
```

### 3.2 На эмулятор

1. В Android Studio откройте **Device Manager** (слева внизу)
2. Создайте или выберите эмулятор
3. Нажмите кнопку **Play** для запуска эмулятора
4. Выберите **Run → Run 'app'** и выберите эмулятор

---

## Шаг 4: Запуск приложения

После установки приложение появится на главном экране устройства с иконкой "Мысли в стопки".

### Первый запуск

1. Нажмите на иконку приложения
2. Пройдите через экран приветствия (onboarding)
3. Начните создавать задачи!

---

## Шаг 5: Отладка (Debug)

### Просмотр логов

```bash
adb logcat
```

### Подключение к dev серверу

Если вы хотите разрабатывать и тестировать одновременно:

```bash
pnpm dev
```

Это запустит dev сервер. На устройстве откройте Expo Go и отсканируйте QR код.

---

## Решение проблем

### Проблема: "Gradle sync failed"

**Решение:**
1. Убедитесь, что установлен **JDK 11+**
2. Проверьте переменную окружения `JAVA_HOME`:
   ```bash
   echo $JAVA_HOME
   ```
3. Если не установлена, добавьте в `.bashrc` или `.zshrc`:
   ```bash
   export JAVA_HOME=/path/to/jdk
   ```

### Проблема: "Build failed: SDK not found"

**Решение:**
1. Откройте Android Studio
2. Выберите **Tools → SDK Manager**
3. Установите **Android SDK API 24+**
4. Установите **Android SDK Build-tools**

### Проблема: "Device not found"

**Решение:**
1. Проверьте подключение USB:
   ```bash
   adb devices
   ```
2. Если устройство не видно, переподключите USB кабель
3. На устройстве нажмите **Allow USB Debugging**

### Проблема: "Permission denied"

**Решение:**
```bash
sudo adb kill-server
sudo adb start-server
```

---

## Структура проекта

```
eisenhower-priority-app/
├── app/                    # React Native компоненты
│   ├── (tabs)/            # Экраны приложения
│   │   ├── index.tsx      # Экран "Задачи"
│   │   ├── matrix.tsx     # Матрица Эйзенхауэра
│   │   ├── kanban.tsx     # Канбан доска
│   │   └── settings.tsx   # Настройки
│   └── _layout.tsx        # Корневой layout
├── components/            # Переиспользуемые компоненты
├── lib/                   # Утилиты и логика
├── android/               # Нативный Android код (после prebuild)
├── assets/                # Иконки и изображения
├── app.config.ts          # Конфигурация Expo
└── package.json           # Зависимости
```

---

## Полезные команды

```bash
# Установка зависимостей
pnpm install

# Запуск dev сервера
pnpm dev

# Запуск тестов
pnpm test

# Проверка TypeScript
pnpm check

# Форматирование кода
pnpm format

# Линтинг
pnpm lint

# Сборка для production
pnpm build

# Очистка кэша
pnpm install --force
rm -rf node_modules .next .expo
```

---

## Версия приложения

Текущая версия: **1.0.90**

Версия обновляется в файле `app.config.ts`:
```typescript
version: "1.0.90"
```

---

## Поддержка

Если у вас возникли проблемы:

1. Проверьте логи: `adb logcat`
2. Посмотрите ошибки в Android Studio
3. Убедитесь, что все зависимости установлены
4. Попробуйте очистить кэш и переустановить

---

## Дополнительные ресурсы

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Android Studio Documentation](https://developer.android.com/studio)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

