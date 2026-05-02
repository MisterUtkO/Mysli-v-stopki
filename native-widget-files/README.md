# Native Android Widget Files

This directory contains the native Android widget implementation files that need to be integrated into the prebuild output.

## Directory Structure

```
native-widget-files/
├── kotlin/
│   └── QuickTaskWidget.kt              # Kotlin AppWidgetProvider
├── drawable/
│   └── widget_button_background.xml    # Button styling
├── xml/
│   ├── widget_quick_task.xml           # Widget layout
│   └── widget_quick_task_info.xml      # Widget metadata
└── README.md                           # This file
```

## Integration Steps

After running `npx expo prebuild`, copy these files to the generated `android/` directory:

### 1. Copy Kotlin Widget Provider

```bash
cp native-widget-files/kotlin/QuickTaskWidget.kt \
  android/app/src/main/java/com/eisenhower/widget/
```

### 2. Copy Widget Layout

```bash
cp native-widget-files/xml/widget_quick_task.xml \
  android/app/src/main/res/layout/
```

### 3. Copy Widget Drawable

```bash
cp native-widget-files/drawable/widget_button_background.xml \
  android/app/src/main/res/drawable/
```

### 4. Copy Widget Metadata

```bash
cp native-widget-files/xml/widget_quick_task_info.xml \
  android/app/src/main/res/xml/
```

### 5. Update AndroidManifest.xml

Add the widget receiver to `android/app/src/main/AndroidManifest.xml`:

```xml
<receiver android:name="com.eisenhower.widget.QuickTaskWidget" android:exported="true">
  <intent-filter>
    <action android:name="android.appwidget.action.APPWIDGET_UPDATE"/>
  </intent-filter>
  <meta-data android:name="android.appwidget.provider" android:resource="@xml/widget_quick_task_info"/>
</receiver>
```

## Quick Integration Script

```bash
#!/bin/bash
mkdir -p android/app/src/main/java/com/eisenhower/widget
mkdir -p android/app/src/main/res/layout
mkdir -p android/app/src/main/res/drawable
mkdir -p android/app/src/main/res/xml

cp native-widget-files/kotlin/QuickTaskWidget.kt \
  android/app/src/main/java/com/eisenhower/widget/
cp native-widget-files/xml/widget_quick_task.xml \
  android/app/src/main/res/layout/
cp native-widget-files/drawable/widget_button_background.xml \
  android/app/src/main/res/drawable/
cp native-widget-files/xml/widget_quick_task_info.xml \
  android/app/src/main/res/xml/

echo "Widget files integrated"
```

## File Descriptions

- **QuickTaskWidget.kt** — Kotlin AppWidgetProvider handling widget updates and deep links
- **widget_quick_task.xml** — Widget UI layout with button
- **widget_button_background.xml** — Button styling drawable
- **widget_quick_task_info.xml** — Widget metadata and configuration

## Deep Link

Widget triggers: `eisenhower://quick-task` → Opens quick-task modal in app
