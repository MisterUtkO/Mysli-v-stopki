# Android Widget Quick Task Creation - Implementation Prompt

**Target Platform:** Android only  
**Priority Level:** High  
**Implementation Timeline:** Sequential, no deviations allowed

---

## 📋 PROJECT OVERVIEW

Implement an Android App Widget that allows users to create tasks without opening the main application. The widget must:
1. Display a quick-task button on the home screen
2. Show a popup form with basic fields (title, importance, urgency)
3. Save tasks to the shared database (AsyncStorage + SQLite)
4. Sync data bidirectionally with the main app
5. Close automatically after task creation

---

## 🛠️ REQUIRED TOOLS & DEPENDENCIES

### Step 0A: Add Required Dependencies

**Execute these commands in order:**

```bash
# 1. Android widget support
npm install expo-app-shortcuts
npm install @react-native-community/app-shortcuts

# 2. SharedPreferences for widget-to-app communication
npm install @react-native-async-storage/async-storage

# 3. If using native Android code (for advanced widget features)
npm install expo-build-properties

# 4. Verify all dependencies
npm list expo-app-shortcuts @react-native-async-storage/async-storage
```

### Step 0B: Update app.json Configuration

**File:** `app.json`

**Add this exact section under `"expo"` object:**

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

---

## 📁 FILE STRUCTURE TO CREATE

Create these new files in exact order:

```
lib/
├── integrations/
│   └── widget/
│       ├── widget-sync.ts          ← NEW
│       ├── widget-constants.ts      ← NEW
│       └── quick-task-handler.ts    ← NEW

components/
└── widget/
    └── quick-task-widget.tsx        ← NEW (for testing)

app/
└── quick-task.tsx                   ← NEW (modal screen)

constants/
└── widget-config.ts                 ← NEW
```

---

## 🔄 IMPLEMENTATION SEQUENCE (DO NOT SKIP ANY STEP)

### PHASE 1: Widget Communication Layer (Foundation)

#### Step 1.1: Create `lib/integrations/widget/widget-constants.ts`

**Purpose:** Define shared constants between widget and app

**Action:** Create new file with exact content:

```typescript
// lib/integrations/widget/widget-constants.ts

export const WIDGET_STORAGE_KEYS = {
  RECENT_TASKS: "widget_recent_tasks",
  QUICK_TASK_DATA: "widget_quick_task_data",
  SYNC_TIMESTAMP: "widget_sync_timestamp",
  WIDGET_ENABLED: "widget_enabled",
} as const;

export const WIDGET_ACTIONS = {
  CREATE_TASK: "com.eisenhower.action.CREATE_TASK",
  QUICK_TASK: "com.eisenhower.action.QUICK_TASK",
  OPEN_APP: "com.eisenhower.action.OPEN_APP",
} as const;

export const QUICK_TASK_DEFAULTS = {
  DEFAULT_IMPORTANCE: 5,
  DEFAULT_URGENCY: 5,
  DEFAULT_STATUS: "not_started" as const,
} as const;

export const WIDGET_CONFIG = {
  SYNC_INTERVAL_MS: 5000, // 5 seconds
  TASK_RETENTION_DAYS: 7,
  MAX_RECENT_TASKS: 5,
} as const;
```

---

#### Step 1.2: Create `lib/integrations/widget/widget-sync.ts`

**Purpose:** Bidirectional sync between widget and app

**Action:** Create new file with exact content:

```typescript
// lib/integrations/widget/widget-sync.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Task } from "@/lib/domain/types";
import { WIDGET_STORAGE_KEYS, WIDGET_CONFIG } from "./widget-constants";

interface WidgetTask {
  id: string;
  title: string;
  importance: number;
  urgency: number;
  priorityScore: number;
  quadrant: string;
  status: "not_started" | "in_progress" | "completed";
  createdAt: number;
}

export class WidgetSync {
  /**
   * Save recent tasks to shared storage for widget display
   * Called by app after task creation or update
   */
  static async syncTasksToWidget(allTasks: Task[]): Promise<void> {
    try {
      // Filter active tasks (not deleted), sort by creation date
      const activeTasks = allTasks
        .filter((t) => !t.isDeleted)
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, WIDGET_CONFIG.MAX_RECENT_TASKS);

      // Convert to widget-compatible format
      const widgetTasks: WidgetTask[] = activeTasks.map((task) => ({
        id: task.id,
        title: task.title,
        importance: task.importance,
        urgency: task.urgency,
        priorityScore: task.priorityScore,
        quadrant: task.quadrant,
        status: task.status,
        createdAt: task.createdAt,
      }));

      // Save to AsyncStorage
      await AsyncStorage.setItem(
        WIDGET_STORAGE_KEYS.RECENT_TASKS,
        JSON.stringify(widgetTasks)
      );

      // Update sync timestamp
      await AsyncStorage.setItem(
        WIDGET_STORAGE_KEYS.SYNC_TIMESTAMP,
        String(Date.now())
      );

      console.log("[WidgetSync] Synced", widgetTasks.length, "tasks to widget");
    } catch (error) {
      console.error("[WidgetSync] Failed to sync tasks to widget:", error);
    }
  }

  /**
   * Retrieve task data from widget storage
   * Called by widget to display recent tasks
   */
  static async getRecentTasksFromApp(): Promise<WidgetTask[]> {
    try {
      const data = await AsyncStorage.getItem(
        WIDGET_STORAGE_KEYS.RECENT_TASKS
      );
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("[WidgetSync] Failed to read recent tasks:", error);
      return [];
    }
  }

  /**
   * Check if widget-app sync is enabled
   */
  static async isWidgetEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(
        WIDGET_STORAGE_KEYS.WIDGET_ENABLED
      );
      return enabled === "true";
    } catch {
      return true; // Default to enabled
    }
  }

  /**
   * Enable/disable widget sync
   */
  static async setWidgetEnabled(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(
        WIDGET_STORAGE_KEYS.WIDGET_ENABLED,
        String(enabled)
      );
      console.log("[WidgetSync] Widget sync set to:", enabled);
    } catch (error) {
      console.error("[WidgetSync] Failed to set widget enabled:", error);
    }
  }

  /**
   * Get last sync timestamp
   */
  static async getLastSyncTime(): Promise<number> {
    try {
      const timestamp = await AsyncStorage.getItem(
        WIDGET_STORAGE_KEYS.SYNC_TIMESTAMP
      );
      return timestamp ? parseInt(timestamp) : 0;
    } catch {
      return 0;
    }
  }
}
```

---

#### Step 1.3: Create `lib/integrations/widget/quick-task-handler.ts`

**Purpose:** Handle quick task creation from widget

**Action:** Create new file with exact content:

```typescript
// lib/integrations/widget/quick-task-handler.ts

import { WIDGET_STORAGE_KEYS, QUICK_TASK_DEFAULTS } from "./widget-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface QuickTaskInput {
  title: string;
  importance: number;
  urgency: number;
}

export interface QuickTaskResult {
  success: boolean;
  taskId?: string;
  error?: string;
}

export class QuickTaskHandler {
  /**
   * Store pending quick task from widget
   * Widget calls this before launching app
   */
  static async storePendingTask(input: QuickTaskInput): Promise<void> {
    try {
      // Validate input
      if (!input.title || input.title.trim().length === 0) {
        throw new Error("Task title is required");
      }

      if (input.importance < 1 || input.importance > 7) {
        throw new Error("Importance must be between 1 and 7");
      }

      if (input.urgency < 1 || input.urgency > 7) {
        throw new Error("Urgency must be between 1 and 7");
      }

      const taskData = {
        title: input.title.trim(),
        importance: Math.round(input.importance),
        urgency: Math.round(input.urgency),
        timestamp: Date.now(),
      };

      await AsyncStorage.setItem(
        WIDGET_STORAGE_KEYS.QUICK_TASK_DATA,
        JSON.stringify(taskData)
      );

      console.log("[QuickTaskHandler] Stored pending task:", taskData);
    } catch (error) {
      console.error("[QuickTaskHandler] Failed to store pending task:", error);
      throw error;
    }
  }

  /**
   * Retrieve pending quick task in app
   * App calls this on startup to check for widget-created tasks
   */
  static async getPendingTask(): Promise<QuickTaskInput | null> {
    try {
      const data = await AsyncStorage.getItem(
        WIDGET_STORAGE_KEYS.QUICK_TASK_DATA
      );
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("[QuickTaskHandler] Failed to get pending task:", error);
      return null;
    }
  }

  /**
   * Clear pending task after processing
   */
  static async clearPendingTask(): Promise<void> {
    try {
      await AsyncStorage.removeItem(WIDGET_STORAGE_KEYS.QUICK_TASK_DATA);
      console.log("[QuickTaskHandler] Cleared pending task");
    } catch (error) {
      console.error("[QuickTaskHandler] Failed to clear pending task:", error);
    }
  }
}
```

---

### PHASE 2: App Deep Link Handling

#### Step 2.1: Update `app/_layout.tsx`

**Purpose:** Handle widget deep links and show quick task modal

**Action:** Find this section in `app/_layout.tsx`:

```typescript
// Around line 124-146, find this code:
useEffect(() => {
  const handleDeepLink = ({ url }: { url: string }) => {
    const deepLink = parseDeepLink(url);
    if (deepLink && navigationRef.current) {
      handleShortcutAction(deepLink.action, (screen: string, params?: any) => {
        navigationRef.current?.navigate(screen as any, params);
      });
    }
  };
  // ... rest of code
}, []);
```

**Replace with:**

```typescript
useEffect(() => {
  const handleDeepLink = ({ url }: { url: string }) => {
    console.log("[DeepLink] Received URL:", url);
    
    // Check for quick-task deep link
    if (url.includes("quick-task")) {
      console.log("[DeepLink] Detected quick-task request");
      if (navigationRef.current) {
        navigationRef.current?.navigate("quick-task" as any);
      }
      return;
    }

    const deepLink = parseDeepLink(url);
    if (deepLink && navigationRef.current) {
      handleShortcutAction(deepLink.action, (screen: string, params?: any) => {
        navigationRef.current?.navigate(screen as any, params);
      });
    }
  };

  // Handle initial URL (app launched from deep link/widget)
  Linking.getInitialURL()
    .then((url) => {
      if (url != null) {
        console.log("[DeepLink] Initial URL:", url);
        handleDeepLink({ url });
      }
    })
    .catch((error) => console.error("[DeepLink] Failed to get initial URL:", error));

  // Handle URL changes (app already running)
  const subscription = Linking.addEventListener("url", handleDeepLink);
  return () => subscription.remove();
}, []);
```

---

#### Step 2.2: Add Stack.Screen for Quick Task

**Action:** In `app/_layout.tsx`, find the `<Stack>` section (around line 227):

```typescript
<Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen name="(tabs)" />
  <Stack.Screen name="add-task" options={{ presentation: "modal", title: "Add Task" }} />
  // ... other screens
</Stack>
```

**Add this line AFTER existing Stack.Screen entries:**

```typescript
<Stack.Screen 
  name="quick-task" 
  options={{ 
    presentation: "modal", 
    title: "Quick Task",
    animationEnabled: true,
  }} 
/>
```

---

### PHASE 3: Quick Task Modal Screen

#### Step 3.1: Create `app/quick-task.tsx`

**Purpose:** Modal for quick task creation (shows after widget tap)

**Action:** Create new file with exact content:

```typescript
// app/quick-task.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";

import { useTaskContext } from "@/lib/context/task-context";
import { useI18n } from "@/lib/context/i18n-context";
import { useColors } from "@/hooks/use-colors";
import { QuickTaskHandler } from "@/lib/integrations/widget/quick-task-handler";
import { WidgetSync } from "@/lib/integrations/widget/widget-sync";
import type { QuickTaskInput } from "@/lib/integrations/widget/quick-task-handler";

const QUICK_TASK_DEFAULTS = {
  DEFAULT_IMPORTANCE: 5,
  DEFAULT_URGENCY: 5,
};

export default function QuickTaskScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { createTask } = useTaskContext();
  const { t, language } = useI18n();
  const colors = useColors();

  const [title, setTitle] = useState("");
  const [importance, setImportance] = useState(
    QUICK_TASK_DEFAULTS.DEFAULT_IMPORTANCE
  );
  const [urgency, setUrgency] = useState(
    QUICK_TASK_DEFAULTS.DEFAULT_URGENCY
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const isRu = language === "ru";

  // Load pending task from widget on mount
  useEffect(() => {
    const loadPendingTask = async () => {
      try {
        const pendingTask = await QuickTaskHandler.getPendingTask();

        if (pendingTask) {
          console.log("[QuickTask] Found pending task from widget:", pendingTask);
          setTitle(pendingTask.title);
          setImportance(pendingTask.importance);
          setUrgency(pendingTask.urgency);
          await QuickTaskHandler.clearPendingTask();
        }
      } catch (error) {
        console.error("[QuickTask] Failed to load pending task:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPendingTask();
  }, []);

  const handleCreateTask = async () => {
    try {
      // Validate
      if (!title.trim()) {
        Alert.alert(
          isRu ? "Ошибка" : "Error",
          isRu ? "Введите название задачи" : "Please enter a task title"
        );
        return;
      }

      setIsSaving(true);

      // Create task
      const newTask = await createTask({
        title: title.trim(),
        description: title.trim(), // For quick task, use title as description
        importance: Math.round(importance),
        urgency: Math.round(urgency),
        status: "not_started",
      });

      console.log("[QuickTask] Task created successfully:", newTask.id);

      // Sync to widget
      await WidgetSync.syncTasksToWidget([newTask]);

      // Show success message
      Alert.alert(
        isRu ? "✅ Готово" : "✅ Done",
        isRu ? "Задача создана успешно!" : "Task created successfully!",
        [
          {
            text: isRu ? "ОК" : "OK",
            onPress: () => {
              router.dismiss();
            },
          },
        ]
      );
    } catch (error) {
      console.error("[QuickTask] Failed to create task:", error);
      const errorMsg =
        error instanceof Error ? error.message : "Unknown error";
      Alert.alert(
        isRu ? "Ошибка" : "Error",
        isRu ? `Ошибка создания: ${errorMsg}` : `Failed to create: ${errorMsg}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: Math.max(insets.top, 16),
      }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 16,
          paddingBottom: Math.max(insets.bottom, 16),
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: colors.foreground,
              marginBottom: 8,
            }}
          >
            {isRu ? "⚡ Быстрая задача" : "⚡ Quick Task"}
          </Text>
          <Text style={{ fontSize: 14, color: colors.muted }}>
            {isRu
              ? "Создайте задачу за несколько секунд"
              : "Create a task in seconds"}
          </Text>
        </View>

        {/* Title Input */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: colors.foreground,
              marginBottom: 8,
            }}
          >
            {isRu ? "Название" : "Title"}
          </Text>
          <TextInput
            style={{
              borderWidth: 2,
              borderColor: colors.border,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
              color: colors.foreground,
              backgroundColor: colors.surface,
            }}
            placeholder={isRu ? "Что нужно сделать?" : "What to do?"}
            placeholderTextColor={colors.muted}
            value={title}
            onChangeText={setTitle}
            editable={!isSaving}
            maxLength={100}
          />
          <Text
            style={{
              fontSize: 12,
              color: colors.muted,
              marginTop: 4,
              textAlign: "right",
            }}
          >
            {title.length}/100
          </Text>
        </View>

        {/* Importance Slider */}
        <View style={{ marginBottom: 20 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.foreground,
              }}
            >
              {isRu ? "🎯 Важность" : "🎯 Importance"}
            </Text>
            <View
              style={{
                backgroundColor: colors.primary,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 14 }}>
                {Math.round(importance)}/7
              </Text>
            </View>
          </View>
          <Slider
            style={{ height: 40 }}
            minimumValue={1}
            maximumValue={7}
            step={1}
            value={importance}
            onValueChange={setImportance}
            disabled={isSaving}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
          />
        </View>

        {/* Urgency Slider */}
        <View style={{ marginBottom: 24 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.foreground,
              }}
            >
              {isRu ? "⏰ Срочность" : "⏰ Urgency"}
            </Text>
            <View
              style={{
                backgroundColor: colors.primary,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 14 }}>
                {Math.round(urgency)}/7
              </Text>
            </View>
          </View>
          <Slider
            style={{ height: 40 }}
            minimumValue={1}
            maximumValue={7}
            step={1}
            value={urgency}
            onValueChange={setUrgency}
            disabled={isSaving}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
          />
        </View>

        {/* Create Button */}
        <Pressable
          onPress={handleCreateTask}
          disabled={isSaving}
          style={({ pressed }) => ({
            backgroundColor: colors.primary,
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: "center",
            opacity: pressed || isSaving ? 0.7 : 1,
            marginBottom: 12,
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
          })}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={{ fontSize: 16 }}>✅</Text>
          )}
          <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 16 }}>
            {isSaving
              ? isRu
                ? "Сохранение..."
                : "Saving..."
              : isRu
                ? "Создать задачу"
                : "Create Task"}
          </Text>
        </Pressable>

        {/* Cancel Button */}
        <Pressable
          onPress={() => router.dismiss()}
          disabled={isSaving}
          style={({ pressed }) => ({
            backgroundColor: colors.surface,
            borderWidth: 2,
            borderColor: colors.border,
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: "center",
            opacity: pressed || isSaving ? 0.7 : 1,
          })}
        >
          <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 16 }}>
            {isRu ? "Отмена" : "Cancel"}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
```

---

#### Step 3.2: Update TaskContext to sync with widget

**Action:** Find `lib/context/task-context.tsx`, locate the `createTask` function (around line 218)

**After the line `setTasks(updatedTasks);` (around line 265), add:**

```typescript
// Sync to widget after task creation
try {
  const { WidgetSync } = await import("@/lib/integrations/widget/widget-sync");
  await WidgetSync.syncTasksToWidget(updatedTasks);
  console.log("[TaskContext] Synced to widget after task creation");
} catch (error) {
  console.error("[TaskContext] Failed to sync to widget:", error);
}
```

---

### PHASE 4: Android App Widget (Native)

#### Step 4.1: Create Android Widget Files

**Create file:** `android/app/src/main/java/com/eisenhower/widget/QuickTaskWidget.kt`

**Content:**

```kotlin
package com.eisenhower.widget

import android.app.PendingIntent
import android.appwidget.AppWidget
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews
import com.eisenhower.MainActivity
import com.eisenhower.R

class QuickTaskWidget : AppWidgetProvider() {
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray,
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    private fun updateAppWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int,
    ) {
        val views = RemoteViews(context.packageName, R.layout.widget_quick_task)

        // Create intent to launch quick task
        val intent = Intent(context, MainActivity::class.java).apply {
            action = Intent.ACTION_VIEW
            data = Uri.parse("eisenhower://quick-task")
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )

        views.setOnClickPendingIntent(R.id.widget_button_quick_task, pendingIntent)

        appWidgetManager.updateAppWidget(appWidgetId, views)
    }

    override fun onEnabled(context: Context) {
        super.onEnabled(context)
    }

    override fun onDisabled(context: Context) {
        super.onDisabled(context)
    }
}
```

---

#### Step 4.2: Create Widget Layout XML

**Create file:** `android/app/src/main/res/layout/widget_quick_task.xml`

**Content:**

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@android:color/transparent"
    android:gravity="center"
    android:orientation="vertical"
    android:padding="8dp">

    <Button
        android:id="@+id/widget_button_quick_task"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:background="@drawable/widget_button_background"
        android:paddingHorizontal="24dp"
        android:paddingVertical="12dp"
        android:text="➕ Quick Task"
        android:textColor="@android:color/white"
        android:textSize="14sp"
        android:textStyle="bold" />
</LinearLayout>
```

---

#### Step 4.3: Create Widget Button Background

**Create file:** `android/app/src/main/res/drawable/widget_button_background.xml`

**Content:**

```xml
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <solid android:color="#0a7ea4" />
    <corners android:radius="8dp" />
    <padding
        android:bottom="8dp"
        android:left="16dp"
        android:right="16dp"
        android:top="8dp" />
</shape>
```

---

#### Step 4.4: Register Widget in AndroidManifest.xml

**File:** `android/app/src/main/AndroidManifest.xml`

**Find `</application>` tag and add BEFORE it:**

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

---

#### Step 4.5: Create Widget Info XML

**Create file:** `android/app/src/main/res/xml/widget_quick_task_info.xml`

**Content:**

```xml
<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:initialKeyguardLayout="@layout/widget_quick_task"
    android:initialLayout="@layout/widget_quick_task"
    android:minHeight="40dp"
    android:minWidth="80dp"
    android:previewImage="@mipmap/ic_launcher"
    android:resizeMode="none"
    android:targetCellHeight="1"
    android:targetCellWidth="2"
    android:updatePeriodMillis="86400000"
    android:widgetCategory="home_screen" />
```

---

### PHASE 5: Deep Link Configuration

#### Step 5.1: Update app.json for Deep Links

**File:** `app.json`

**Find `"expo"` object and add this (if not already present):**

```json
{
  "expo": {
    "scheme": "eisenhower",
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "usesCleartextTraffic": true,
            "intentFilters": [
              {
                "action": "android.intent.action.VIEW",
                "data": {
                  "scheme": "eisenhower"
                },
                "category": ["android.intent.category.BROWSABLE", "android.intent.category.DEFAULT"]
              }
            ]
          }
        }
      ]
    ]
  }
}
```

---

### PHASE 6: Update Task Context for Widget Sync

#### Step 6.1: Sync on App Launch

**File:** `lib/context/task-context.tsx`

**Find the `useEffect` that initializes (around line 143)**

**After `setTasks(finalTasks);` line, add:**

```typescript
// Sync tasks to widget on app launch
try {
  const { WidgetSync } = await import("@/lib/integrations/widget/widget-sync");
  await WidgetSync.syncTasksToWidget(finalTasks);
  console.log("[TaskContext] Synced tasks to widget on app launch");
} catch (error) {
  console.error("[TaskContext] Failed to sync to widget on launch:", error);
}
```

---

#### Step 6.2: Sync on Task Update

**File:** `lib/context/task-context.tsx`

**Find `updateTask` function (around line 303)**

**At the end of the function (before closing `}`), add:**

```typescript
// Sync to widget after task update
try {
  const { WidgetSync } = await import("@/lib/integrations/widget/widget-sync");
  await WidgetSync.syncTasksToWidget(updatedTasks);
  console.log("[TaskContext] Synced to widget after task update");
} catch (error) {
  console.error("[TaskContext] Failed to sync to widget:", error);
}
```

---

### PHASE 7: Testing & Verification

#### Step 7.1: Build and Test

**Execute in sequence:**

```bash
# 1. Clear caches
npx expo prebuild --clean

# 2. Build for Android
npx expo build --platform android

# 3. If using local testing:
npx eas build --platform android --local
```

---

#### Step 7.2: Manual Testing Checklist

- [ ] App builds successfully without errors
- [ ] App launches on Android device/emulator
- [ ] Quick task widget appears on home screen
- [ ] Tapping widget button opens quick task modal
- [ ] Can enter task title
- [ ] Can adjust importance slider (1-7)
- [ ] Can adjust urgency slider (1-7)
- [ ] Clicking "Create Task" saves task
- [ ] App closes after task creation
- [ ] Task appears in main app task list
- [ ] Multiple tasks sync correctly to widget
- [ ] Widget displays up to 5 most recent tasks

---

## ✅ COMPLETION CHECKLIST

- [ ] Phase 1: Widget sync layer created (3 files)
- [ ] Phase 2: Deep link handling in app/_layout.tsx
- [ ] Phase 3: Quick task modal screen created
- [ ] Phase 4: Android widget files created
- [ ] Phase 5: Deep links configured in app.json
- [ ] Phase 6: Task context synced with widget
- [ ] Phase 7: Testing completed successfully
- [ ] App builds and runs without errors
- [ ] Widget functional on home screen
- [ ] Tasks sync bidirectionally

---

## 🚨 CRITICAL NOTES

1. **DO NOT SKIP ANY STEP** - Each phase depends on previous phases
2. **Follow exact file paths** - Paths are case-sensitive on Android
3. **Package names** - Replace `com.eisenhower` with actual package name if different
4. **Build after each phase** - Test incrementally
5. **Android minSdkVersion must be 24+** - For widget support
6. **Sync happens automatically** - App syncs on launch and after task creation

---

## 🔗 FILE DEPENDENCY MAP

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

---

**Total estimated time: 4-5 hours**  
**Platform: Android only**  
**No deviations allowed - follow exact sequence**
