# Manual APK Build Instructions

Due to issues with the web build interface, follow these steps to build the APK locally:

## Prerequisites

- Node.js 18+ installed
- Android SDK installed (or use Android Studio)
- Java Development Kit (JDK) 11+

## Step 1: Clone/Download the Project

If you don't have the project locally:
```bash
git clone <repository-url>
cd eisenhower-priority-app
```

## Step 2: Install Dependencies

```bash
pnpm install
# or
npm install
# or
yarn install
```

## Step 3: Prebuild for Android

```bash
npx expo prebuild --clean
```

This generates the native Android code in the `android/` directory.

## Step 4: Build APK

### Option A: Using Expo CLI (Recommended)

```bash
npx expo build:android
```

This will:
- Compile the app
- Generate the APK
- Upload to Expo servers
- Provide a download link

### Option B: Using Gradle (Local Build)

```bash
cd android
./gradlew assembleRelease
```

The APK will be in: `android/app/build/outputs/apk/release/app-release.apk`

### Option C: Using Android Studio

1. Open `android/` folder in Android Studio
2. Click "Build" → "Build Bundle(s) / APK(s)" → "Build APK(s)"
3. Wait for build to complete
4. APK will be in `android/app/build/outputs/apk/debug/` or `release/`

## Step 5: Install on Device

```bash
adb install path/to/app.apk
```

Or drag and drop the APK file onto your Android device.

## Step 6: Test the Widget

1. Open the app on your Android device
2. Go to home screen and long-press
3. Select "Widgets"
4. Find "Quick Task" widget
5. Add it to home screen
6. Tap the widget button to test

## Troubleshooting

### Build fails with "no expo project found"

This is a known issue with the web build interface. Use the CLI commands above instead.

### Android SDK not found

Set `ANDROID_HOME` environment variable:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### Gradle build fails

Clear caches:
```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

### Widget doesn't appear

1. Verify `QuickTaskWidget.kt` exists in `android/app/src/main/java/com/eisenhower/widget/`
2. Check `AndroidManifest.xml` has the widget receiver
3. Rebuild and reinstall the APK

## Project Structure

```
eisenhower-priority-app/
├── app/                          # React Native app code
│   ├── quick-task.tsx           # Quick task modal
│   └── _layout.tsx              # Deep link handler
├── lib/
│   ├── integrations/widget/     # Widget communication layer
│   │   ├── widget-constants.ts
│   │   ├── widget-sync.ts
│   │   └── quick-task-handler.ts
│   └── context/task-context.tsx # Task management
├── android/                      # Native Android code
│   └── app/src/main/
│       ├── java/com/eisenhower/widget/
│       │   └── QuickTaskWidget.kt
│       ├── res/
│       │   ├── layout/widget_quick_task.xml
│       │   ├── drawable/widget_button_background.xml
│       │   └── xml/widget_quick_task_info.xml
│       └── AndroidManifest.xml
├── app.json                      # Expo configuration
├── app.config.ts                 # TypeScript config (reference)
├── eas.json                      # EAS build configuration
└── package.json                  # Dependencies
```

## Widget Implementation Details

### Deep Link Scheme
- **Widget Scheme:** `eisenhower://quick-task`
- **App Scheme:** `manus{timestamp}`

### Widget Flow
1. User taps widget button on home screen
2. Deep link `eisenhower://quick-task` is triggered
3. App receives deep link and opens quick-task modal
4. User enters task details (title, importance, urgency)
5. Task is created and saved to database
6. Widget syncs with app via AsyncStorage
7. Task appears in main app

### Files Involved
- **TypeScript:** `quick-task.tsx`, `widget-sync.ts`, `widget-constants.ts`
- **Kotlin:** `QuickTaskWidget.kt`
- **XML:** `widget_quick_task.xml`, `widget_quick_task_info.xml`, `widget_button_background.xml`
- **Config:** `app.json`, `AndroidManifest.xml`

## Testing Checklist

After building and installing:

- [ ] App launches without crashing
- [ ] Widget appears in widget list
- [ ] Widget can be added to home screen
- [ ] Tapping widget opens quick-task modal
- [ ] Can enter task title
- [ ] Importance slider works (1-7)
- [ ] Urgency slider works (1-7)
- [ ] "Create Task" button saves task
- [ ] Modal closes after creation
- [ ] Task appears in main app
- [ ] Task has correct importance/urgency values
- [ ] Multiple tasks sync correctly
- [ ] Language switching works (RU/EN)
- [ ] Theme switching works (Light/Dark/AMOLED)

## Support

For issues:
1. Check `WIDGET_TESTING.md` for debugging tips
2. Check `ANDROID_WIDGET_SETUP.md` for setup details
3. Review logs: `adb logcat | grep "QuickTask\|WidgetSync\|DeepLink"`

## Next Steps

1. Build APK using one of the methods above
2. Install on Android device
3. Test using the checklist
4. Report any issues or bugs
5. Create version 1.4.0 release after successful testing
