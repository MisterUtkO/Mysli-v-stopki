# Android App Widget Setup Instructions

This document provides instructions for integrating the Android App Widget into the build process.

## Overview

The Android App Widget allows users to create tasks directly from their home screen without opening the main app. The widget communicates with the app through:

1. **Deep Links** — Widget button triggers `eisenhower://quick-task` deep link
2. **AsyncStorage** — Shared data storage between widget and app
3. **Quick Task Modal** — Modal screen that appears when widget is tapped

## Files Created

### TypeScript/React Files
- `lib/integrations/widget/widget-constants.ts` — Shared constants
- `lib/integrations/widget/widget-sync.ts` — Bidirectional sync
- `lib/integrations/widget/quick-task-handler.ts` — Quick task handling
- `app/quick-task.tsx` — Quick task modal screen
- `app/_layout.tsx` — Updated with deep link handler and Stack.Screen

### Android Native Files
- `android/app/src/main/java/com/eisenhower/widget/QuickTaskWidget.kt` — Widget provider
- `android/app/src/main/res/layout/widget_quick_task.xml` — Widget layout
- `android/app/src/main/res/drawable/widget_button_background.xml` — Button styling
- `android/app/src/main/res/xml/widget_quick_task_info.xml` — Widget metadata

## AndroidManifest.xml Integration

When building the APK with `npx expo build --platform android`, Expo will generate the AndroidManifest.xml automatically. However, the widget provider needs to be registered.

### Option 1: Using app.json (Recommended)

Add this to your `app.json` under the `"expo"` object:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "usesCleartextTraffic": true
          }
        }
      ]
    ]
  }
}
```

The widget provider will be automatically discovered by Android through the `@xml/widget_quick_task_info.xml` metadata file.

### Option 2: Manual AndroidManifest.xml Entry (If needed)

If the widget provider is not automatically discovered, add this to `AndroidManifest.xml` before the `</application>` tag:

```xml
<!-- Quick Task Widget Provider -->
<receiver
    android:name=".widget.QuickTaskWidget"
    android:exported="true">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/widget_quick_task_info" />
</receiver>
```

## Deep Link Configuration

The app already supports deep links through `app.config.ts`. The widget uses the `eisenhower://quick-task` scheme which is automatically handled by the updated `app/_layout.tsx`.

## Building the APK

### Step 1: Verify Files

Ensure all widget files are in place:
```bash
# Check TypeScript files
ls -la lib/integrations/widget/
ls -la app/quick-task.tsx

# Check Android files
ls -la android/app/src/main/java/com/eisenhower/widget/
ls -la android/app/src/main/res/layout/widget_quick_task.xml
ls -la android/app/src/main/res/drawable/widget_button_background.xml
ls -la android/app/src/main/res/xml/widget_quick_task_info.xml
```

### Step 2: Build APK

```bash
# Clear caches
npx expo prebuild --clean

# Build for Android
npx expo build --platform android

# Or for local testing:
npx eas build --platform android --local
```

### Step 3: Install and Test

1. Install the APK on an Android device or emulator
2. Long-press on the home screen to add widgets
3. Find and add the "Quick Task" widget
4. Tap the widget button to open the quick task modal
5. Create a task and verify it appears in the main app

## Testing Checklist

- [ ] App builds successfully without errors
- [ ] App launches on Android device/emulator
- [ ] Quick task widget appears in widget list
- [ ] Widget can be added to home screen
- [ ] Tapping widget button opens quick task modal
- [ ] Can enter task title
- [ ] Can adjust importance slider (1-7)
- [ ] Can adjust urgency slider (1-7)
- [ ] Clicking "Create Task" saves task
- [ ] Modal closes after task creation
- [ ] Task appears in main app task list
- [ ] Widget displays recent tasks (up to 5)
- [ ] Tasks sync correctly between widget and app

## Troubleshooting

### Widget doesn't appear in widget list
- Ensure `QuickTaskWidget.kt` is in the correct package: `com.eisenhower.widget`
- Verify `widget_quick_task_info.xml` is in `android/app/src/main/res/xml/`
- Check that the receiver is registered in AndroidManifest.xml

### Deep link not working
- Verify `app/_layout.tsx` has the updated deep link handler
- Check that `app/quick-task.tsx` exists
- Ensure `Stack.Screen` for "quick-task" is added to `app/_layout.tsx`

### Tasks not syncing to widget
- Verify `WidgetSync.syncTasksToWidget()` is called after task creation
- Check AsyncStorage permissions in `app.config.ts`
- Ensure `WIDGET_STORAGE_KEYS` constants match between files

## File Dependencies

```
widget-constants.ts
├── widget-sync.ts
│   └── quick-task.tsx (screen)
│       └── task-context.tsx (sync calls)
├── quick-task-handler.ts
│   └── quick-task.tsx (screen)
└── app/_layout.tsx (deep link handling)
    └── QuickTaskWidget.kt (native, triggers deep link)
```

## Next Steps

1. Build the APK using the instructions above
2. Test the widget on a physical Android device
3. Verify all 13 test cases pass
4. Create a checkpoint with the working widget implementation
