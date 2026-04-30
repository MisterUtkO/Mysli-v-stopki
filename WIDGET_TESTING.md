# Android App Widget Testing Guide

This document provides a comprehensive testing checklist for the Android App Widget implementation.

## Phase 7: Testing & Verification

### Pre-Build Verification

Before building the APK, verify all files are in place:

```bash
# Check TypeScript files
ls -la lib/integrations/widget/
# Expected: widget-constants.ts, widget-sync.ts, quick-task-handler.ts

# Check quick-task screen
ls -la app/quick-task.tsx

# Check Android widget files
ls -la android/app/src/main/java/com/eisenhower/widget/
# Expected: QuickTaskWidget.kt

ls -la android/app/src/main/res/layout/
# Expected: widget_quick_task.xml

ls -la android/app/src/main/res/drawable/
# Expected: widget_button_background.xml

ls -la android/app/src/main/res/xml/
# Expected: widget_quick_task_info.xml
```

### Build Instructions

#### Step 1: Clear Caches

```bash
cd /home/ubuntu/eisenhower-priority-app

# Clear Metro bundler cache
npx expo prebuild --clean

# Clear node modules if needed (optional)
# rm -rf node_modules && pnpm install
```

#### Step 2: Build APK

```bash
# Option A: Using Expo (recommended for testing)
npx expo build --platform android

# Option B: Using EAS (for production builds)
npx eas build --platform android

# Option C: Local build (if you have Android SDK installed)
npx eas build --platform android --local
```

#### Step 3: Install on Device/Emulator

```bash
# After build completes, download the APK and install:
adb install path/to/app.apk

# Or use the download link from Expo/EAS
```

### Manual Testing Checklist (13 Points)

#### Basic Functionality
- [ ] **1. App builds successfully** without errors or warnings
- [ ] **2. App launches** on Android device/emulator without crashing
- [ ] **3. Widget appears** in the widget list when long-pressing home screen
- [ ] **4. Widget can be added** to home screen (appears as a button)

#### Widget Interaction
- [ ] **5. Tapping widget button** opens the quick task modal
- [ ] **6. Modal displays** with title, importance slider, and urgency slider
- [ ] **7. Can enter task title** (text input works, character counter shows 0/100)
- [ ] **8. Importance slider works** (1-7 range, value updates in real-time)
- [ ] **9. Urgency slider works** (1-7 range, value updates in real-time)

#### Task Creation
- [ ] **10. Clicking "Create Task"** saves the task successfully
- [ ] **11. Modal closes** automatically after task creation
- [ ] **12. Task appears** in the main app task list with correct values
- [ ] **13. Multiple tasks sync** correctly between widget and app

### Advanced Testing Scenarios

#### Scenario 1: Widget → App Flow
1. Tap widget button
2. Enter task title: "Test Widget Task"
3. Set importance: 6
4. Set urgency: 7
5. Click "Create Task"
6. Verify task appears in main app with correct values
7. Verify task is in Q1 (red) quadrant

#### Scenario 2: App → Widget Sync
1. Create a task in the main app
2. Go to home screen
3. Check if widget displays the task in recent tasks list
4. Create another task
5. Verify widget shows up to 5 most recent tasks

#### Scenario 3: Language Support
1. Create task via widget with English language
2. Switch app language to Russian
3. Reopen widget
4. Verify UI elements are in Russian (⚡ Быстрая задача, Название, etc.)

#### Scenario 4: Theme Support
1. Create task via widget in light theme
2. Switch to dark theme
3. Reopen widget
4. Verify colors adapt to dark theme
5. Repeat with AMOLED theme

#### Scenario 5: Error Handling
1. Try to create task without title → Should show error alert
2. Try to create task with invalid importance (< 1 or > 7) → Should be clamped to 1-7
3. Try to create task with invalid urgency (< 1 or > 7) → Should be clamped to 1-7
4. Verify error messages are localized (RU/EN)

### Debugging Tips

#### Check Logs
```bash
# View app logs while running
adb logcat | grep "QuickTask\|WidgetSync\|DeepLink"

# Filter by tag
adb logcat -s QuickTask:V WidgetSync:V DeepLink:V
```

#### Common Issues

**Widget doesn't appear in widget list:**
- Verify `QuickTaskWidget.kt` is in correct package: `com.eisenhower.widget`
- Check that `widget_quick_task_info.xml` exists in `res/xml/`
- Ensure AndroidManifest.xml has receiver registered (check build output)

**Deep link not working:**
- Verify `app/_layout.tsx` has the updated deep link handler
- Check that `quick-task.tsx` exists and is properly exported
- Verify `Stack.Screen` for "quick-task" is added to `app/_layout.tsx`
- Check logs: `adb logcat | grep DeepLink`

**Tasks not syncing to widget:**
- Verify `WidgetSync.syncTasksToWidget()` is called after task creation
- Check AsyncStorage permissions in `app.config.ts`
- Verify `WIDGET_STORAGE_KEYS` constants match between files
- Check logs: `adb logcat | grep WidgetSync`

**Modal not appearing:**
- Verify deep link is being triggered: `adb logcat | grep "Detected quick-task"`
- Check that `navigationRef.current?.navigate("quick-task")` is called
- Verify `quick-task.tsx` is in the correct location: `app/quick-task.tsx`

### Performance Testing

#### Memory Usage
- Monitor memory while creating multiple tasks via widget
- Verify no memory leaks after repeated widget usage
- Check that AsyncStorage doesn't grow indefinitely

#### Battery Impact
- Verify widget doesn't drain battery unnecessarily
- Check that sync only happens on app launch and task changes
- Verify no continuous polling or background services

### Accessibility Testing

- [ ] Widget button is large enough to tap easily
- [ ] Text is readable in light and dark themes
- [ ] Sliders have proper labels and feedback
- [ ] Error messages are clear and actionable
- [ ] Modal can be dismissed with back button

### Localization Testing

#### English (en)
- [ ] All UI text appears in English
- [ ] Error messages are in English
- [ ] Placeholder text is in English

#### Russian (ru)
- [ ] All UI text appears in Russian (Cyrillic characters)
- [ ] Error messages are in Russian
- [ ] Placeholder text is in Russian
- [ ] Sliders show Russian labels (🎯 Важность, ⏰ Срочность)

### Final Verification

After all tests pass:

1. **Create checkpoint** with working widget implementation
2. **Document any issues** found during testing
3. **Update version** to 1.4.0 (widget feature complete)
4. **Generate release notes** for the widget feature

### Test Results Template

```markdown
## Widget Testing Results

**Date:** [DATE]
**Device:** [DEVICE_MODEL]
**Android Version:** [VERSION]
**App Version:** [VERSION]

### Build Status
- [ ] Build successful
- [ ] APK size: [SIZE]
- [ ] Build time: [TIME]

### Functionality Tests
- [ ] All 13 tests passed
- [ ] No crashes or errors
- [ ] All features working as expected

### Performance
- [ ] App launch time: [TIME]ms
- [ ] Widget response time: [TIME]ms
- [ ] Memory usage: [MEMORY]MB

### Issues Found
[List any issues or bugs found]

### Notes
[Additional observations or comments]
```

## Deployment Checklist

Before deploying to production:

- [ ] All 13 tests pass
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Widget appears in widget list
- [ ] Deep links work correctly
- [ ] Tasks sync bidirectionally
- [ ] Localization works (EN/RU)
- [ ] Theme support works (Light/Dark/AMOLED)
- [ ] Error handling works
- [ ] Performance is acceptable
- [ ] Accessibility is good
- [ ] Version updated to 1.4.0
- [ ] Checkpoint created
- [ ] Release notes prepared

## Next Steps

After successful testing:

1. Create a checkpoint with the working widget
2. Update app version to 1.4.0
3. Prepare release notes
4. Deploy to production
5. Monitor user feedback
6. Plan Phase 2 features (widget configuration, task display, etc.)
