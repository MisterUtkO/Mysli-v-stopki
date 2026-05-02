# Native Android Widget Configuration

This directory contains the source files for the Android App Widget. These files are tracked in git and will be copied to `android/` during the prebuild process.

## Directory Structure

```
native-android-widget-config/
├── kotlin/
│   └── QuickTaskWidget.kt          # Widget provider class
├── xml/
│   ├── widget_quick_task_info.xml  # Widget metadata and configuration
│   └── widget_quick_task.xml       # Widget layout
├── drawable/
│   └── widget_button_background.xml # Button styling
├── values/
│   └── strings.xml                 # Widget labels and descriptions
└── README.md                       # This file
```

## Files

### QuickTaskWidget.kt
The main widget provider class that handles widget updates and user interactions.

**Location in APK:** `android/app/src/main/java/com/eisenhower/widget/QuickTaskWidget.kt`

### widget_quick_task_info.xml
Widget metadata including:
- Label: "⚡ Quick Task"
- Description: "Создавайте задачи прямо с главного экрана"
- Min size: 110x110dp (1x1 grid)
- Preview layout

**Location in APK:** `android/app/src/main/res/xml/widget_quick_task_info.xml`

### widget_quick_task.xml
The widget layout XML defining the UI with a button for quick task creation.

**Location in APK:** `android/app/src/main/res/layout/widget_quick_task.xml`

### widget_button_background.xml
Drawable resource for button styling with rounded corners and background color.

**Location in APK:** `android/app/src/main/res/drawable/widget_button_background.xml`

### strings.xml
String resources for widget labels and descriptions (supports localization).

**Location in APK:** `android/app/src/main/res/values/strings.xml`

## How It Works

1. **During prebuild:** `npx expo prebuild --clean`
   - Expo generates the `android/` folder
   - Our build script copies files from `native-android-widget-config/` to `android/`

2. **During build:** `npx expo build:android --type apk`
   - Android build system compiles the widget code
   - Widget is included in the APK

3. **On device:** User installs APK
   - Widget appears in widget picker
   - User can add it to home screen

## Integration Steps

After running `npx expo prebuild --clean`, the files should be copied to:

```
android/
├── app/src/main/
│   ├── java/com/eisenhower/widget/
│   │   └── QuickTaskWidget.kt
│   └── res/
│       ├── layout/
│       │   └── widget_quick_task.xml
│       ├── drawable/
│       │   └── widget_button_background.xml
│       ├── xml/
│       │   └── widget_quick_task_info.xml
│       └── values/
│           └── strings.xml
└── src/main/
    └── AndroidManifest.xml (with widget receiver)
```

## Building APK

```bash
# 1. Clean prebuild
npx expo prebuild --clean

# 2. Build APK
npx expo build:android --type apk

# Or use Gradle directly
cd android
./gradlew assembleRelease
cd ..
```

## Testing

After installing the APK:

1. Long-press on home screen
2. Select "Widgets"
3. Look for "⚡ Quick Task"
4. Tap to add widget
5. Widget should appear on home screen
6. Tap widget to create a task

## Troubleshooting

### Widget not appearing in widget picker
- Verify `android:label` and `android:description` in `widget_quick_task_info.xml`
- Check `strings.xml` has the correct string resources
- Rebuild APK with `npx expo prebuild --clean`

### Widget crashes when tapped
- Check logcat: `adb logcat | grep QuickTaskWidget`
- Verify deep link scheme in `AndroidManifest.xml`
- Check widget receiver is registered

### Widget not syncing with app
- Verify `widget-sync.ts` is imported in app
- Check AsyncStorage permissions in `AndroidManifest.xml`
- Test with `adb logcat` to see sync messages

## Version History

- **v1.4.0** - Initial widget implementation with quick task creation
- **v1.4.1** - Added label and description for widget visibility
- **v1.5.0** - (Planned) iOS widget support

## Related Files

- `app/_layout.tsx` - Deep link handler for widget
- `app/quick-task.tsx` - Quick task modal screen
- `lib/integrations/widget/widget-sync.ts` - Widget-app sync logic
- `android/app/src/main/AndroidManifest.xml` - Widget receiver registration

## Support

For issues or questions about the widget implementation, see:
- `WIDGET_TESTING.md` - Testing checklist
- `WIDGET_HOME_SCREEN_GUIDE.md` - User guide for adding widget
- `BUILD_APK_v1.4.0.md` - Build instructions
