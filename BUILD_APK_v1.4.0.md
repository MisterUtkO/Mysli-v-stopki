# Сборка APK v1.4.0 с виджетом

## ⚡ Быстрый способ (5 минут)

### Вариант 1: Через Expo (Рекомендуется)

```bash
cd /home/ubuntu/eisenhower-priority-app

# 1. Очистить и пересобрать Android
npx expo prebuild --clean

# 2. Собрать APK
npx expo build:android --type apk

# 3. Скачать APK (будет ссылка в консоли)
# Или найти в папке dist/
```

**Время:** 10-15 минут

### Вариант 2: Через Gradle (Быстрее)

```bash
cd /home/ubuntu/eisenhower-priority-app

# 1. Пересобрать Android
npx expo prebuild --clean

# 2. Собрать APK через Gradle
cd android
./gradlew assembleRelease

# 3. APK будет в:
# android/app/build/outputs/apk/release/app-release.apk
```

**Время:** 5-10 минут

### Вариант 3: Через Android Studio (Самый простой)

```bash
# 1. Откройте проект в Android Studio
# File → Open → /home/ubuntu/eisenhower-priority-app/android

# 2. Build → Build Bundle(s) / APK(s) → Build APK(s)

# 3. Дождитесь завершения

# 4. APK будет в:
# android/app/build/outputs/apk/debug/app-debug.apk
```

**Время:** 10-15 минут

## 📋 Что включено в v1.4.0

✅ **Android App Widget** — виджет "⚡ Quick Task" на главном экране
✅ **Deep Link Integration** — `eisenhower://quick-task` для открытия модального окна
✅ **Quick Task Modal** — создание задач прямо с главного экрана
✅ **AsyncStorage Sync** — синхронизация между виджетом и приложением
✅ **Full Localization** — поддержка RU/EN
✅ **Theme Support** — Light/Dark/AMOLED темы

## 🔍 Проверка перед сборкой

```bash
cd /home/ubuntu/eisenhower-priority-app

# Проверить TypeScript
pnpm check

# Проверить зависимости
pnpm install

# Проверить конфиг
npx expo config
```

## 📱 Установка на смартфон

### Через ADB (Android Debug Bridge)

```bash
# 1. Подключите смартфон через USB
# 2. Включите режим разработчика (Settings → About → Build number 7 раз)
# 3. Включите USB Debug (Settings → Developer options → USB Debugging)

# 4. Установите APK
adb install app-release.apk

# 5. Запустите приложение
adb shell am start -n com.eisenhower.priority.app/.MainActivity
```

### Вручную (без ADB)

```bash
# 1. Скопируйте APK на смартфон (через USB или облако)
# 2. Откройте файловый менеджер на смартфоне
# 3. Найдите app-release.apk
# 4. Нажмите на файл → Установить
# 5. Подтвердите установку
```

## ✅ Проверка после установки

1. **Откройте приложение**
   - Проверьте версию в Settings → About (должна быть 1.4.0)

2. **Добавьте виджет**
   - Долгое нажатие на главный экран → Виджеты → Quick Task → Добавить

3. **Протестируйте виджет**
   - Нажмите на виджет
   - Откроется модальное окно создания задачи
   - Введите название, установите важность/срочность
   - Нажмите "Создать задачу"
   - Задача должна появиться в приложении

4. **Проверьте синхронизацию**
   - Создайте задачу через виджет
   - Откройте приложение
   - Задача должна быть в списке

## 🐛 Решение проблем

### Ошибка: "No suitable Java version found"

```bash
# Установите Java
sudo apt-get install openjdk-11-jdk

# Или используйте встроенную Java в Android Studio
export JAVA_HOME=/path/to/android/studio/jre
```

### Ошибка: "Gradle build failed"

```bash
# Очистите кэш
cd android
./gradlew clean
cd ..

# Пересоберите
npx expo prebuild --clean
```

### Ошибка: "Widget not appearing"

```bash
# 1. Убедитесь, что версия 1.4.0
# Settings → About → Version

# 2. Переустановите приложение
adb uninstall com.eisenhower.priority.app
adb install app-release.apk

# 3. Перезагрузите смартфон
```

### Ошибка: "Deep link not working"

```bash
# Проверьте AndroidManifest.xml
grep -n "eisenhower://" android/app/src/main/AndroidManifest.xml

# Должно быть:
# <data android:scheme="eisenhower" android:host="*" />
```

## 📊 Размер APK

- **Debug APK:** ~150-200 MB
- **Release APK:** ~80-120 MB

Используйте **Release APK** для финальной установки.

## 🔐 Подпись APK (для Google Play)

```bash
# Создать ключ подписи
keytool -genkey -v -keystore release.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias release

# Подписать APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
  -keystore release.keystore \
  app-release-unsigned.apk release

# Оптимизировать
zipalign -v 4 app-release-unsigned.apk app-release.apk
```

## 📝 Версионирование

Версия 1.4.0 включает:
- ✅ Все функции 1.3.0
- ✅ Android App Widget
- ✅ Deep Link Integration
- ✅ Quick Task Modal

Следующая версия 1.5.0 может включать:
- iOS Widget (если требуется)
- Улучшения UI/UX
- Новые функции

## 🚀 Развертывание

После успешного тестирования:

1. **Обновите версию на GitHub**
   ```bash
   git tag v1.4.0
   git push origin v1.4.0
   ```

2. **Создайте Release на GitHub**
   - Перейдите на GitHub
   - Releases → Draft a new release
   - Tag: v1.4.0
   - Title: Version 1.4.0 - Android App Widget
   - Description: (см. ниже)
   - Attach APK file

3. **Описание Release**
   ```
   # Version 1.4.0 - Android App Widget

   ## New Features
   - ⚡ Android App Widget for quick task creation
   - 🔗 Deep link integration (eisenhower://)
   - 📱 Quick task modal screen
   - 🔄 Bidirectional sync between widget and app

   ## Improvements
   - Full localization (RU/EN)
   - Theme support (Light/Dark/AMOLED)
   - Better performance

   ## Installation
   1. Download app-release.apk
   2. Install on Android device
   3. Long-press home screen → Widgets → Quick Task → Add
   ```

## 📞 Поддержка

Если у вас возникли проблемы:
1. Проверьте логи: `adb logcat`
2. Проверьте консоль сборки
3. Откройте Issue на GitHub
4. Свяжитесь с разработчиком

## Полезные команды

```bash
# Просмотр логов
adb logcat | grep "QuickTaskWidget"

# Проверка установленных приложений
adb shell pm list packages | grep eisenhower

# Удаление приложения
adb uninstall com.eisenhower.priority.app

# Перезагрузка смартфона
adb reboot

# Проверка версии
adb shell dumpsys package com.eisenhower.priority.app | grep versionName
```

---

**Статус:** Готово к сборке ✅
**Версия:** 1.4.0
**Дата:** 2026-05-02
**Виджет:** ⚡ Quick Task
