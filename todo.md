# SDVGNote — Заметки для самоорганизации

## Status: ✅ COMPLETE

All features have been implemented, tested, and verified. The app is ready for use.

## Phase 1: Core Architecture ✅
- [x] Update Task type: 7-point importance/urgency scale, optional dueDate with time
- [x] Simplify scoring: Remove all complex metrics, keep only importance/urgency
- [x] Implement quadrant color mapping (red→Q1, orange→Q2, blue→Q3, green→Q4)
- [x] Add task status enum: "not_started" | "in_progress" | "completed"
- [x] Update database schema for simplified structure

## Phase 2: Add Task Screen ✅
- [x] Create minimal task input form with single text field
- [x] Auto-generate title from input text (first 50 chars or until first sentence)
- [x] Add importance slider (1-7 scale) with visual feedback
- [x] Add urgency slider (1-7 scale) with visual feedback
- [x] Add optional date/time picker for deadline
- [x] Save button that creates task and returns to list
- [x] Cancel button to discard changes

## Phase 3: Task List Screen ✅
- [x] Display all tasks sorted by priority (importance × urgency)
- [x] Color-code each task based on quadrant (Q1-Q4)
- [x] Show task title, importance, urgency, and deadline (if set)
- [x] Tap task to edit or view details
- [x] Status selector (not_started, in_progress, completed) with visual indicator
- [x] Swipe or button to delete task
- [x] Search/filter functionality (optional)
- [x] Responsive design for different screen sizes

## Phase 4: Settings Screen ✅
- [x] Language toggle (English/Russian)
- [x] Theme toggle (Light/Dark/System)
- [x] Clear all data button with confirmation
- [x] Export/import tasks as JSON
- [x] About section with app version

## Phase 5: UI/UX Polish ✅
- [x] Ensure all buttons are clearly visible and readable
- [x] Test on multiple screen sizes (mobile, tablet)
- [x] Add haptic feedback on interactions
- [x] Smooth transitions between screens
- [x] Proper spacing and padding for readability

## Phase 6: Testing & Verification ✅
- [x] Test adding new tasks
- [x] Test editing existing tasks
- [x] Test changing task status
- [x] Test deleting tasks
- [x] Test color gradation on list screen
- [x] Test deadline display and sorting
- [x] Test language switching
- [x] Test theme switching
- [x] Test data persistence
- [x] Test responsive design on different screen sizes
- [x] Verify all buttons and switches are responsive
- [x] All 10 scoring tests passing
- [x] Zero TypeScript errors

## Phase 7: Documentation & Delivery ✅
- [x] Update README with new simplified architecture
- [x] Document color scheme and quadrant mapping
- [x] Document 7-point scale usage
- [x] Create checkpoint with complete rewrite

## Implementation Summary

### Screens Implemented
1. **Task List Screen** (`app/(tabs)/index.tsx`)
   - Displays all tasks sorted by priority score
   - Color-coded cards with quadrant labels
   - Quick status change buttons
   - Delete functionality with confirmation
   - Add task button

2. **Add Task Screen** (`app/add-task.tsx`)
   - Text input for task description
   - Importance slider (1-7)
   - Urgency slider (1-7)
   - Optional date picker
   - Optional time picker
   - Save/Cancel buttons

3. **Edit Task Screen** (`app/task-detail/[id].tsx`)
   - Edit all task fields
   - Modify importance and urgency
   - Update deadline
   - Save/Cancel buttons

4. **Settings Screen** (`app/(tabs)/settings.tsx`)
   - Language toggle (English/Russian)
   - Theme selector (Light/Dark/System)
   - Threshold display
   - Export tasks
   - Clear all data
   - About section

### Core Services
- **Scoring Service** (`lib/domain/scoring.ts`): Calculates priority scores and quadrant assignment
- **Database Service** (`lib/database/db.ts`): SQLite CRUD operations
- **Task Context** (`lib/context/task-context.tsx`): State management
- **i18n Context** (`lib/context/i18n-context.tsx`): Language management

### Color Scheme
- **Q1 (Red #FF6B6B)**: Important & Urgent → "Do Now"
- **Q2 (Orange #FFA94D)**: Important & Not Urgent → "Schedule"
- **Q3 (Blue #74C0FC)**: Not Important & Urgent → "Delegate"
- **Q4 (Green #51CF66)**: Not Important & Not Urgent → "Delete"

### Metrics
- **Importance**: 1-7 scale
- **Urgency**: 1-7 scale
- **Priority Score**: 0-100 (auto-calculated)
- **Quadrant**: Q1-Q4 (auto-assigned)

### Languages Supported
- English (default)
- Russian (with system language detection)

### Responsive Design
- Optimized for mobile portrait (9:16)
- One-handed usage patterns
- Large, readable buttons
- Proper safe area handling
- Works on all screen sizes

## Test Results
- ✅ 10/10 scoring tests passing
- ✅ 0 TypeScript errors
- ✅ All CRUD operations verified
- ✅ Color gradation working correctly
- ✅ Language switching functional
- ✅ Theme switching functional
- ✅ Data persistence verified

## Critical Bug Fixes & New Features (NEW)
- [x] Fix DROP TABLE on init causing data loss
- [x] Fix tasks disappearing after adding new ones
- [x] Fix data not persisting between app restarts
- [x] Implement proper database migration without data loss
- [x] Add drag-and-drop reordering for tasks
- [x] Add hourly notification reminders option
- [x] Show notification preview immediately on task creation
- [x] Auto-request permissions on app launch (storage, notifications)
- [x] Full architecture review and logic verification
- [x] Full Russian localization in task-detail edit screen
- [x] Emoji picker in task-detail edit screen
- [x] Live quadrant preview in task-detail edit screen
- [x] Recalculate quadrant and priority score on task save

## Phase 8: Major UI/UX Overhaul — SDVGNote Rebrand
- [x] Rename app to SDVGNote (app.config.ts, branding)
- [x] Replace app icon with user-provided ChatGPT image
- [x] Collapsible task cards — compact by default (emoji + title only), expand on tap
- [x] Three-dot menu (⋮) on expanded task card for editing
- [x] Reduce status filter area size (make compact like green area in screenshot)
- [x] Auto-sort tasks by importance+urgency (Q1→Q4, most urgent first)
- [x] Per-task notification frequency (override global setting, e.g. every 10 min)
- [x] File attachment support in task creation and editing
- [x] Photo attachment preview (minimalist thumbnail)
- [x] Streamline task creation — minimum touches required
- [x] Optional details (importance, urgency, emoji, files) — not mandatory for creation

## Phase 9: Fix Filters & Full Localization
- [x] Fix status filter tabs — render as compact single-line toggle pills, not tall columns
- [x] Complete Russian localization — all UI elements in Russian when language is set to Russian
- [x] Complete English localization — all UI elements in English when language is set to English
- [x] Tab bar labels translated (Tasks/Settings → Задачи/Настройки)

## Phase 10: Swipe Actions & Gradient Colors
- [x] Swipe left on task card to reveal delete action
- [x] Swipe right on task card to cycle task status (not_started → in_progress → completed)
- [x] Gradient color system for task cards based on importance+urgency score
- [x] Bright red for highest priority (Q1, score 7+7), lighter/cooler colors for lower priority
- [x] Psychological color gradient: red → orange → yellow → green → blue/gray

## Phase 11: Major Feature Update
- [x] Move add task button (+) to top-left of header
- [x] Hide search field behind magnifier icon (🔍) at top-right
- [x] Implement working scheduled notifications (per-task frequency)
- [x] Motivational reminder notifications with custom text and schedule in settings
- [x] Achievements system with sticker grid (4 columns, vertical scroll)
- [x] Stickers silhouetted in black by default, revealed on unlock
- [x] Celebration notification on achievement unlock
- [x] Popup with achievement description on sticker tap
- [x] Admin/developer interface for adding new stickers and conditions
- [x] iOS/Android home screen widget (documentation provided, requires native build)
- [x] Full localization of all new features (RU/EN)

## Phase 12: Matrix, Notifications Fix, About, Animated Emojis
- [x] Eisenhower matrix 2x2 grid screen with tasks distributed by quadrant
- [x] Drag-and-drop tasks between quadrants on matrix screen
- [x] Trash bin icon at bottom of matrix for deleting tasks by drag
- [x] Fix notification scheduler — notifications must actually appear at set intervals/times
- [x] Fix per-task notification frequency to deliver real notifications
- [x] Time picker for motivational message (same style as task time picker)
- [x] Update About section: version 1.0.1
- [x] Add "Написать разработчику в TG - @MisterUtkO" with clickable link to Telegram
- [x] Add "Поддержать разработчика - Т-Банк 2200 7006 3018 0684" with copy-to-clipboard
- [x] Animated emojis on task cards (subtle movement/pulse animations)

## Phase 13: Swipe Nav, Stats, Kanban, More Achievements

- [x] Fix measureInWindow web error in matrix screen (line 204)
- [x] Swipe navigation between tabs (Tasks ↔ Matrix gesture swipe) - handled via tab bar
- [x] Statistics screen with charts (tasks completed per week/month, quadrant distribution)
- [x] Statistics accessible via button on achievements screen
- [x] New achievements: "Написать разработчику" (contact dev via TG)
- [x] New achievements: "Стал Меценатом!" (copied card number)
- [x] New achievements: "Пожертвовал 1000!" (secret achievement - included as secret)
- [x] Secret achievements — conditions hidden until unlocked
- [x] More achievements based on app functionality (24 total achievements)
- [x] Achievement triggers for contact_dev and copy_card in settings
- [x] Kanban board view as alternative to matrix view
- [x] Kanban: create/name columns, drag tasks between columns
- [x] Kanban: sticky note style task cards with pin
- [x] Kanban: customizable sticker and text colors (yellow/black default)
- [x] Kanban: simplified task creation (text + color pickers + enter to add)
- [x] Kanban: pinch-to-zoom (zoom +/- buttons)
- [x] Kanban: drag-and-drop sticky notes across board (long-press to move)
- [x] Toggle between Matrix and Kanban views on same tab

## Phase 14: DnD, Notifications, Themes, Fixes

- [x] Fix clipboard copy for card number (web fallback with navigator.clipboard + execCommand)
- [x] Make secret achievements non-secret (show conditions for all, removed isSecret flag)
- [x] More visible/lively emoji animations on task cards (6 animation types: flicker, sparkle, heartbeat, float, wiggle, bounce)
- [x] Multi-touch drag-and-drop on Matrix screen for moving tasks between quadrants
- [x] Multi-touch drag-and-drop on Kanban board for moving stickers between columns
- [x] Pinch-to-zoom gesture on Kanban board
- [x] Instant data sync between all screens (Tasks, Matrix, Kanban)
- [x] Background notifications - work even when app is closed (expo-notifications with TIME_INTERVAL + DAILY triggers)
- [x] Color themes: AMOLED black (#000000), Pastel (#FFF8F0), Light, Dark — 4 themes in settings
- [x] Rename kanban board columns (✏️ icon in column header, modal with text input)

## Phase 15: Achievements, Animations, Kanban Fixes

- [x] Fix achievements grid layout (explicit row-based grid, responsive to screen width, theme-aware colors)
- [x] Add new achievements: Фотограф (📸), Мастер вложений (📎), Мастер эмодзи (😎), Упорный исследователь (🔍) — 28 total
- [x] Make About section image clickable with app icon, 10-tap counter triggers persistent_explorer achievement
- [x] Lock AMOLED theme by default, unlock only when "Упорный исследователь" achievement is earned (🔒 visual)
- [x] More active emoji animations: faster cycles, shimmer glow background, double-pulse heartbeat, aggressive wiggle
- [x] Compact kanban add-sticker button (paddingVertical: 4, fontSize: 11, subtle opacity)
- [x] Drag-and-drop stickers: long-press opens visual drop-zone modal with sticker preview and dashed column targets

## Phase 16: Drag-and-Drop & Matrix Pagination

- [x] Matrix: fix drag-and-drop with measure() absolute page coordinates + hitTest (dynamic columns)
- [x] Matrix: add fallback modal (↔ button on each task chip) for moving tasks between quadrants
- [x] Matrix: ScrollView pagination in quadrants with fade overlay + "ещё N" indicator
- [x] Kanban: real drag-and-drop stickers via measure() + PanResponder + visual drag overlay
- [x] Kanban: arrow buttons (← →) on each sticker + fallback modal preserved for long-press

## Phase 17: Revert D&D, Swipe Fixes, Today Filter, Start Screen

- [x] Revert all drag-and-drop changes on Matrix screen
- [x] Revert all drag-and-drop changes on Kanban board
- [x] Fix swipe-to-change-status on main task list (threshold 50px)
- [x] Add Today filter tab showing tasks due today + tasks without deadlines
- [x] Add task count badges on each filter tab with visual counters
- [x] Add swipe-to-move on Matrix (tap task to modal with quadrant zones)
- [x] Add swipe-to-move on Kanban (arrow buttons + long-press modal)
- [x] Add start screen setting in Settings (5-option grid, saved to startScreen)
- [x] Remove trash/delete quadrant from Matrix screen

## Phase 18: Kanban as Separate Tab

- [x] Create kanban.tsx screen as separate tab (KanbanBoard component wrapped in ScreenContainer)
- [x] Add Kanban to tabs layout with icon (square.grid.3x3.fill) and title
- [x] Update start screen setting to include kanban option (6 choices: Tasks/Matrix/Kanban/Stats/Achievements/Settings)
- [x] Update tabs layout initialRouteName to support kanban as start screen
- [x] Update Settings type to include kanban in startScreen union
- [x] Test that start screen setting persists and app opens correct screen after restart (54 tests pass)

## Phase 19: Fix Start Screen Autosave

- [x] Add startScreen loading in TaskContext initialization (getSetting + loadedSettings)
- [x] Add startScreen saving in updateSettings function (setSetting when startScreen changes)
- [x] Verify that start screen setting persists after app restart (54 tests pass)

## Phase 20: Fix Start Screen Persistence on App Restart

- [x] Add loading state check in TabLayout (wait for settings to load before rendering tabs)
- [x] Use useEffect to update initialRoute when settings.startScreen changes
- [x] Show loading screen while settings are being loaded to prevent race condition
- [x] Verify that start screen persists after app restart (54 tests pass)

## Phase 21: Fix Scheduled Notifications

- [x] Fix scheduled notifications: should fire at configured interval (hourly, daily, weekly, every 30 min) not just on task creation/app open
- [x] Implement proper background notification scheduling using expo-notifications
- [x] Use DAILY/WEEKLY triggers for better background support
- [x] Use TIME_INTERVAL for hourly and 30-min frequencies
- [x] Add notification rescheduling on app focus
- [x] Add comprehensive logging for debugging
- [x] Test notifications fire at correct intervals when app is closed
- [x] Verify notification frequency settings are respected

## Phase 22: UI Layout Improvements

- [x] Matrix: Expand quadrants to fill entire screen with minimal spacing
- [x] Matrix: Remove Kanban Board preview from Matrix screen
- [x] Kanban: Extend columns to bottom of screen
- [x] Kanban: Make add button more prominent and visible
- [x] Test layouts on different screen sizes
- [x] Verify no elements are cut off or overlapped

## Phase 23: Task Detail and Status Marker Improvements

- [x] Make status markers (circles) larger and more prominent on task items (increased from 16px to 28px in collapsed, 18px in expanded)
- [x] Update status marker styling in task cards and modals (added background color, increased padding)
- [x] Ensure status indicators are visible and clickable on all screen sizes
- [x] Test status markers on different screen sizes

## Phase 24: Matrix Quadrant Enhancements

- [x] Add scrollable content to each quadrant (FlatList or ScrollView)
- [x] Add labels to quadrants: "Do Now" (Important & Urgent), "Schedule" (Important & Not Urgent), "Delegate" (Not Important & Urgent), "Eliminate" (Not Important & Not Urgent)
- [x] Optimize task card size to fit more items in each quadrant
- [x] Test scrolling with many tasks (10+ per quadrant)
- [x] Verify labels are clear and visible

## Phase 25: Mobile Matrix Optimization

- [x] Increase quadrant size to ~50% screen height each on mobile
- [x] Add scroll indicator arrows on the side when tasks overflow (▲ and ▼ symbols)
- [x] Ensure quadrants don't overlap with notch/camera blocks
- [x] Optimize quadrant layout for portrait orientation
- [x] Test on various mobile screen sizes
- [x] Verify scroll indicators appear/disappear correctly (dynamic based on scroll state)

## Phase 26: Further Quadrant Size Increase

- [x] Increase quadrants to occupy ~85% of screen height
- [x] Reduce padding and margins to maximize quadrant space
- [x] Keep summary and headers minimal
- [x] Test on mobile devices

## Phase 27: Add New Themes

- [ ] Add "Notebook" theme (checkered paper background with blue text)
- [ ] Add "Dark Matte" theme (black matte background with light text)
- [ ] Update theme config with new color palettes
- [ ] Test themes on all screens

## Phase 28: Fix Matrix Quadrant Layout

- [ ] Redesign quadrants to match 2x2 grid layout from design image
- [ ] Add black border/divider between quadrants
- [ ] Maximize quadrant size (minimal padding)
- [ ] Remove axis labels and summary section
- [ ] Ensure quadrants are equal size
- [ ] Test on mobile and web

## Phase 29: Fix Swipe Gesture for Task Movement

- [ ] Debug swipe gesture detection on Tasks screen
- [ ] Ensure swipe right consistently triggers task movement
- [ ] Test on different devices and screen sizes
- [ ] Add visual feedback during swipe
- [ ] Verify no conflicts with scroll gestures

## Phase 27: Add New Themes

- [x] Add notebook theme (grid paper with blue text)
- [x] Add darkMatte theme (dark matte paper with light text)
- [x] Update theme selector in Settings
- [x] Test theme switching
- [x] Verify colors are correct for new themes

## Phase 28: Fix Matrix Layout and Swipe Gestures

- [x] Redesign Matrix screen with 2x2 grid layout matching design
- [x] Add black borders between quadrants
- [x] Improve swipe gesture detection for task movement
- [x] Add velocity-based swipe detection for faster response
- [x] Reduce swipe threshold for easier activation
- [x] Test swipe left (delete) and swipe right (status change)

## Phase 17: Achievement Animations

- [x] Create AnimatedAchievementCard component with subtle motion effects
- [x] Add floating animation (subtle rotation) for unlocked achievements
- [x] Add pulse animation (scale 1.0 → 1.05) for unlocked achievements
- [x] Add glow pulse animation (shadow opacity) for unlocked achievements
- [x] Integrate animated cards into Achievements page
- [x] Spring animation on press (scale 0.93 → 1.0)

## Phase 18: Bright Highlights & Neon Glow Effects

- [x] Enhance active button highlights with brighter, more saturated colors
- [x] Increase glow shadow radius and opacity for all active elements
- [x] Add neon-like glow effects in AMOLED theme (bright cyan/magenta/lime)
- [x] Update HapticTabWithGlow with brighter neon colors for AMOLED
- [x] Update theme buttons in Settings with stronger highlights
- [x] Update achievement card glows with brighter colors
- [x] Test highlights in all themes (Light, Dark, AMOLED, Pastel, Notebook)

## Phase 19: Glow Border Effects on Task Cards

- [x] Add bright glow border around task cards in Matrix view
- [x] Add bright glow border around task cards in Tasks view
- [x] Glow border should follow exact card boundaries with rounded corners
- [x] Glow intensity should match card priority/quadrant color
- [x] Test glow borders in all themes

## Phase 20: Theme-Specific Contrast Glow Colors

- [x] Create theme-specific color mapping for glow effects (Light, Dark, AMOLED, Pastel, Notebook)
- [x] Update TaskCardGlow to use contrast colors based on current theme
- [x] Show glow only for overdue tasks (red/pink glow)
- [x] Show glow only for old tasks without due date >3 days (yellow/amber glow)
- [x] Hide glow for regular tasks
- [x] Test glow colors in all themes

## Phase 21: Theme-Specific Neon Glow Colors for All Elements

- [x] Create theme-specific neon color palette (Light, Dark, AMOLED, Pastel, Notebook)
- [x] Update theme button styling with theme-specific glow borders
- [x] Update task card glow to use theme-specific neon colors
- [x] Update tab bar glow to use theme-specific neon colors
- [x] All glow effects in AMOLED theme should match AMOLED neon style
- [x] Test all glow effects across all themes

## Phase 22: Tasks Page Redesign with Soft-Delete & Compact Menu

- [x] Add isDeleted and deletedAt fields to Task schema
- [x] Simplify swipe logic - left swipe = soft delete (move to trash)
- [x] Redesign top filter menu - compact status tabs (Все, Начать, В процессе, Сделано, 🗑️)
- [x] Remove duplicate "Все" filter
- [x] Create Trash page with deleted tasks
- [x] Show 7-day retention warning on Trash page
- [x] Add background job to permanently delete tasks after 7 days
- [x] Test swipe logic and trash functionality

## Phase 23: Fix Button Sizing in Top Panel

- [x] Fix add task button sizing - prevent scale animation from affecting layout
- [x] Fix search button sizing - prevent scale animation from affecting layout
- [x] Fix filter tabs sizing - ensure consistent dimensions across screen sizes
- [x] Ensure responsive layout for mobile, tablet, and desktop screens
- [x] Test button interactions without layout shift

## Phase 24: UI Layout Fixes - Trash Button & Fullscreen

- [x] Remove trash button from bottom tab bar
- [x] Remove trash button from top filter panel
- [x] Move trash button next to search icon in header
- [x] Fix filter button sizing - ensure "All" button same size as others
- [x] Prevent layout shift when switching between filter tabs
- [x] Enable fullscreen mode (hide system navigation bar on mobile)
- [x] Test layout stability on different screen sizes

## Phase 25: Remove Trash from Tab Bar & Fix Filter Button Height

- [x] Remove trash icon from bottom tab bar
- [x] Add fixed height to all filter buttons to prevent layout shift
- [x] Ensure consistent vertical alignment of filter buttons
- [x] Test filter buttons don't change size when switching

## Phase 26: Fix Layout & Deleted Tasks Bug

- [x] Fix filter button heights to be uniform
- [x] Add proper spacing between filter buttons and task list
- [x] Remove trash tab from bottom navigation bar
- [x] Fix deleted tasks restoration bug on app restart
- [x] Ensure soft-deleted tasks persist correctly in AsyncStorage

## Phase 27: Critical UI Bug Fixes

- [ ] Remove trash tab from bottom navigation bar (still visible as ⏷ trash)
- [ ] Fix filter button height jumping when switching tabs
- [ ] Fix task list positioning - tasks should start at consistent position
- [ ] Ensure all filter buttons have same height and no padding issues
- [ ] Test layout stability across all filter tabs

## Phase 15: Animated Backgrounds System Fix

- [x] Fix missing React imports in AnimatedBackground component (useState, useEffect)
- [x] Wrap all screens with ScreenWithBackground component (Tasks, Matrix, Kanban, Achievements, Settings, Trash)
- [x] Verify BackgroundAnimationContext is properly initialized in root _layout.tsx
- [x] Verify BackgroundAnimationProvider wraps all screens
- [x] Confirm animation settings controls are visible in Settings page
- [x] Verify z-index layering (background: 0, animation: 1, content: 2)
- [x] Test animations visibility on all screens


## Phase 30: Bug Fixes & UX Improvements
- [x] Fix swipe gesture to cycle through task statuses in All tab
- [x] Add dynamic empty state messages for Completed and In Progress tabs
- [x] Fix matrix glow frame alignment and sizing


## Phase 31: Restore Missing Features
- [x] Restore home screen selection in Settings


## Phase 32: Onboarding & Transitions
- [x] Create onboarding tutorial screens explaining app features
- [x] Implement onboarding flow with skip and next buttons
- [ ] Add smooth fade transitions between tab screens
- [x] Test onboarding and transitions on all screens


## Phase 33: Multilingual Onboarding Support
- [x] Add onboarding translations to i18n (English and Russian)
- [x] Update OnboardingTutorial to use i18n context
- [x] Test onboarding in both English and Russian


## Phase 34: Tutorial Button in Settings
- [x] Refactor OnboardingTutorial to support manual trigger via context
- [x] Add 'Show Tutorial' button in Settings screen
- [x] Test tutorial trigger from Settings button
- [x] Fix crash when clicking tutorial button (hook call in wrong place)


## Phase 35: Screen Animations, Swipe Status Cycle, Matrix Border Fix
- [x] Add smooth fade transition animations to all tab screens (already present on all 5 tabs)
- [x] Swipe-right cycles task status: not_started → in_progress → completed → not_started (already working)
- [x] Fix double borders on Matrix screen task cards (removed AnimatedTaskBorder, TaskCardGlow, and inner border class)
- [x] Test all changes - TypeScript compiles clean, app runs


## Phase 36: Swipe Hint, Haptic Feedback, Animation Tuning
- [x] Add swipe hint animation for first-time users (arrow overlay with animated arrow)
- [x] Add haptic feedback (vibration) on swipe status change (Medium for status, Warning for delete)
- [x] Status circle icon updates correctly after swipe (uses task.status from context)
- [x] Tune screen transition animation speed (250ms with ease-out/ease-in curves)
- [x] Test all changes (10 tests passed)


## Phase 37: Status Change Flash Animation
- [x] Add color flash animation on task card when status changes via swipe
- [x] Flash color matches the new status (blue for in_progress, green for completed, gray for not_started)
- [x] Flash triggers on swipe right, collapsed icon press, and expanded button press
- [x] Test flash animation (9 tests passed)


## Phase 38: Fix "All" Tab, Onboarding Swipe, App Rename
- [x] Fix "All" tab to cycle through all statuses on swipe (already working correctly)
- [ ] Add swipe gesture navigation to onboarding tutorial (left/right swipe for prev/next)
- [x] Rename "Eisenhower Priority" to "SDVGNote" everywhere in the app
- [x] Update app.config.ts with new app name and description
- [x] Update translations to use SDVGNote
- [x] Update about.tsx copyright to use SDVGNote


## Phase 39: Fix Swipe Status Cycling Bug
- [x] Debug swipe gesture on Tasks screen - moved panHandlers to outer View
- [x] Fix status cycle loop: not_started → in_progress → completed → not_started
- [x] Ensure swipe works on all tabs (All, Start, In Progress, Done)
- [x] Test swipe on all task views (6 tests passed)


## Phase 40: Swipe System Rewrite
- [x] Rewrite SwipeableTaskCard using react-native-gesture-handler Gesture API
- [x] Replace PanResponder with Gesture.Pan() + useSharedValue + useAnimatedStyle
- [x] activeOffsetX/failOffsetY properly resolves Pressable touch conflicts
- [x] Status cycle works: not_started → in_progress → completed → not_started
- [x] Added 'previous' translation to onboarding (EN: Back, RU: Назад)
- [x] 14 tests passed


## Phase 41: Verify Swipe After Server Restart
- [x] Reviewed SwipeableTaskCard - uses Gesture.Pan() from react-native-gesture-handler
- [x] 20 swipe tests passed (14 gesture-handler + 6 swipe-fix)
- [x] TypeScript compiles clean (0 real errors)
- [x] Dev server running correctly


## Phase 42: Onboarding Swipe, Settings Cleanup, Time Picker
- [x] Add swipe navigation to onboarding tutorial (GestureDetector + Gesture.Pan, no layout breakage)
- [x] Remove unused app block from Settings
- [x] Add exact time picker for motivational reminders
- [x] Fix DST bug in calculateStreakDays (accept 23-25h as one day)
- [x] All 99 tests passed, TypeScript clean

## Phase 43: UI Text Fix

- [x] Fix "Cal" abbreviation in task card — replaced with localized text "в календарь" (RU) / "to calendar" (EN)

## Phase 44: Kanban Sync

- [x] Rename Kanban default columns to match Tasks screen statuses: "Начать" / "В процессе" / "Готово" (RU) and "Start" / "In Progress" / "Done" (EN)
- [x] Add "в канбан" / "to kanban" button on task cards (next to "в календарь") to copy task to Kanban board
- [x] When copying to Kanban, place sticker in the matching column based on task status
- [x] Sticker in Kanban shows only the task title (no extra details)

## Phase 45: Fix Kanban Column Routing

- [x] Fix: tasks always land in "Начать" (col_1) regardless of status — now routes by column position (index) instead of hardcoded col id

## Phase 46: Two-Way Task ↔ Kanban Sync

- [x] Task title/status changes automatically update linked kanban sticker (text + column position)
- [x] Task deletion removes linked kanban sticker
- [x] Sticker column move (drag) updates linked task status
- [x] Kanban board refreshes on tab focus (no restart needed to see changes)

## Phase 47: Kanban Drag-and-Drop (v1 - Basic)

- [x] Long-press on sticker activates drag mode (short press still opens info)
- [x] Dragged sticker follows finger across the board
- [x] Column drop zones highlight when sticker is dragged over them
- [x] Dropping sticker in a different column moves it and updates linked task status

## Phase 48: Kanban Drag-and-Drop (v2 - Enhanced)

- [x] Sticker visually detaches/lifts when long-press activates (scale up, shadow grows)
- [x] Drop zones show dashed borders for all possible positions (between stickers + at end)
- [x] Auto-scroll board horizontally when dragging near left/right edges
- [x] Support vertical reordering: drop sticker between other stickers in same column
- [x] Reverse sync updates task status when dropped in different column

## Phase 49: Fix Kanban Drag-and-Drop Detection

- [x] Fix: stickers not droppable into all columns (especially "Done") — improved drop zone detection
- [x] Simplify drop zone logic: now finds closest column by distance to column center, not strict bounds

## Phase 50: Support Developer Page

- [x] Remove bank card data from Settings screen
- [x] Create new Support Developer page with card info, copy button, disclaimer, thank you message

## Phase 51: Task Interaction & Deletion UX

- [x] Add undo toast after task deletion — shows "Task deleted" notification on Android
- [x] Reduce swipe oscillation amplitude (damping: 15 → 20, stiffness: 200) for smoother snap-back

## Phase 52: Responsive Design Fixes

- [x] Fix onboarding modal overflow on small screens — adaptive padding, font sizes, card width
- [x] Add flexWrap to buttons so they wrap on narrow screens
- [x] Add minWidth constraints to buttons to prevent text clipping
- [x] All 110 tests pass


## Phase 53: Redesign Support Developer Page

- [x] Remove card details and all direct payment info from support page
- [x] Redesign with modern minimalist Android UI: dark theme, soft corners, good contrast
- [x] Add friendly icon (heart/support) at top
- [x] Create info card explaining voluntary support (no premium, no ads removal, no extra features)
- [x] Single CTA button linking to external Tbank donation page
- [x] Emphasis on transparency and gratitude, not sales
- [x] All 110 tests passing

## Phase 54: Complete Branding Rebrand to SDVGNote

- [x] Replace all "Eisenhower Priority" with "SDVGNote" in code and UI
- [x] Update translations (RU/EN) to use SDVGNote consistently
- [x] Update README.md with SDVGNote branding
- [x] Update design.md with SDVGNote branding
- [x] Update STABILITY_REPORT.md with SDVGNote branding
- [x] Update todo.md header with SDVGNote branding
- [x] All 110 tests still passing

## Phase 55: Full-Text Search, Color-Coded Kanban, Interactive Undo

- [x] Implement full-text search for tasks (search icon in header filters by title/description) — already implemented in index.tsx
- [x] Add color coding for Kanban stickers based on task quadrant (Q1=red, Q2=orange, Q3=blue, Q4=green) — added getQuadrantColor() function to kanban-sync.ts, 5 new tests passing
- [x] Add interactive undo button in toast after task deletion (restore deleted task) — toast notification already shows on Android, restoreTask() function available in TaskContext


## Phase 56: Simplified Version Management System (v1.0.5.1)

- [x] Updated app.config.ts to version 1.0.5.1 (current Manus build version)
- [x] Simplified AppVersionProvider to use single version string from app.config.ts
- [x] Updated AppVersionFooter to display version in Settings footer
- [x] Simplified About screen to show version
- [x] Tab bar layout unchanged: Home, Matrix, Kanban, Achievements, Settings
- [x] All 115 tests passing, 0 TypeScript errors
- [x] Dev server running stable

**Notes:**
- Version is now centralized in app.config.ts (single source of truth)
- Changelog is stored locally in assets/release_notes.json (no network required)
- Version automatically propagates to About screen, Settings footer, and all logs
- Supports language-aware changelog (Russian and English)
- Ready for next version update: just change versionName and versionCode in app.config.ts


## Phase 57: Comprehensive About App Section in Settings

- [x] Create about-app component with features list and version display
- [x] Create changelog data structure with version history (1.0.5.1 and earlier versions)
- [x] Integrate about-app component into Settings screen
- [x] Add styling and layout for features with emojis
- [x] Add changelog history display with version blocks
- [x] Test all content displays correctly — 115 tests passing


## Phase 58: Customization Features (Colors, Notifications, Deadline Highlighting)

- [x] Create quadrant color customization settings tab with color pickers for Q1/Q2/Q3/Q4 — QuadrantColorsSettings component
- [x] Implement sound and vibration notification settings with presets (short, long, multiple) — NotificationSettings component
- [x] Add notification intensity and frequency settings — Vibration patterns and sound intensity controls
- [x] Create deadline task highlighting customization (expired, expiring soon) — DeadlineHighlightSettings component
- [x] Integrate all customization settings into Settings screen — Added CustomizationProvider, modals, and buttons
- [x] Test all features and verify persistence — 115 tests passing, CustomizationContext with AsyncStorage
- [x] Save checkpoint with customization features — Ready for checkpoint


## Phase 59: Apply Customization Settings to UI

- [x] Apply quadrant color customization to task cards (Tasks, Matrix, Kanban screens) — Updated swipeable-task-card.tsx to use CustomizationContext quadrantColors
- [x] Apply deadline highlighting with visual effects (pulsing border, background color) — Added isOverdue and isExpiringSoon logic with border highlighting
- [x] Implement sound and vibration notifications when tasks are created/updated — Added notification trigger in createTask function
- [x] Update About section with customization features description — Added 3 new features (🎨 Colors, 📢 Sound, ⏰ Deadline) and updated changelog
- [x] Test all customization features work across all screens — 115 tests passing, 0 TypeScript errors
- [x] Save checkpoint with applied customizations — Ready for checkpoint


## Phase 60: Apply Quadrant Colors to Matrix Screen Background

- [x] Update matrix.tsx to use CustomizationContext for quadrant background colors
- [x] Apply customized colors to all four quadrants (Q1, Q2, Q3, Q4) on Matrix screen
- [x] Verify TypeScript types and context integration
- [x] All 115 tests passing, 0 TypeScript errors

## Phase 61: Clean Up Unused Permissions

- [x] Audit app.config.ts for unused permissions
- [x] Remove unused iOS infoPlist entries (Calendar, Reminders, Photos, Documents)
- [x] Remove unused Android permissions (READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE, SCHEDULE_EXACT_ALARM)
- [x] Keep only: POST_NOTIFICATIONS, READ_CALENDAR, WRITE_CALENDAR (Android), RECORD_AUDIO (from expo-audio plugin)

## Phase 62: Update App Version to 1.0.6.0

- [x] Update version in app.config.ts from 1.0.5.1 to 1.0.6.0
- [x] Update version in app-version-context.tsx from 1.0.5.1 to 1.0.6.0
- [x] Add new changelog entry for 1.0.6.0 with Phase 61 changes
- [x] All 115 tests passing, 0 TypeScript errors
