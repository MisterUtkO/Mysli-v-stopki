# SDVGNote — Заметки для самоорганизации | Design Plan

## Overview
A mobile-first task management application for self-organization using the Eisenhower Matrix model (Important/Urgent quadrants) with advanced 10-point metric scoring. Optimized for portrait orientation (9:16) and one-handed usage on iOS and Android.

## Screen List

### 1. **Home Screen (Tasks List)**
- **Primary Content**: Scrollable list of all active tasks
- **Functionality**:
  - Display tasks with priority score (0-100), title, due date, tags
  - Quick filters: All, Q1 (Do), Q2 (Plan), Q3 (Delegate), Q4 (Delete)
  - Sort options: Priority (desc), Due Date (asc), Created (desc)
  - Search bar at top
  - Floating Action Button (FAB) to create new task
  - Swipe actions: Mark done, Archive, Delete
- **Key Metrics Shown**: Priority score, quadrant indicator (colored badge), due date

### 2. **Matrix Screen (2×2 Board)**
- **Primary Content**: Drag-and-drop 2×2 Eisenhower Matrix
  - Q1 (Top-Left): Important & Urgent — "Do Now"
  - Q2 (Top-Right): Important & Not Urgent — "Schedule"
  - Q3 (Bottom-Left): Not Important & Urgent — "Delegate"
  - Q4 (Bottom-Right): Not Important & Not Urgent — "Delete"
- **Functionality**:
  - Tasks displayed as draggable cards in each quadrant
  - Drag task between quadrants → auto-updates importance/urgency flags
  - Tap task card to open detail view
  - Count badge on each quadrant
  - Collapse/expand quadrants for focus

### 3. **Task Detail Screen**
- **Primary Content**: Full task form with live metrics
- **Sections**:
  - **Header**: Title input, due date picker, tags input
  - **Description**: Markdown editor (optional)
  - **Metrics Section**: Five sliders (1-10 scale)
    - Importance Score
    - Urgency Score
    - Impact Score
    - Effort Score
    - Risk Score
  - **Live Calculations**:
    - Quadrant indicator (Q1/Q2/Q3/Q4)
    - Priority Score (0-100) with color gradient
    - Next Action Hint (e.g., "Do Now", "Schedule", "Delegate")
  - **Status**: Active / Done / Archived toggle
  - **Action Buttons**: Save, Delete, Archive, Restore

### 4. **Statistics Screen**
- **Primary Content**: Dashboard with key metrics
- **Sections**:
  - **Quadrant Distribution**: Pie chart or bar chart (Q1, Q2, Q3, Q4 counts)
  - **Top 10 Tasks**: List of highest priority tasks
  - **Overdue Tasks**: Count and list of tasks past due date
  - **Completion Rate**: % of tasks marked done
  - **Metrics Summary**: Avg importance, urgency, impact, effort, risk

### 5. **Settings Screen**
- **Primary Content**: Configuration and preferences
- **Sections**:
  - **Theme**: Light / Dark / System toggle
  - **Scoring Weights** (with explanations):
    - Weight Importance (default 0.30)
    - Weight Urgency (default 0.25)
    - Weight Impact (default 0.25)
    - Weight Risk (default 0.15)
    - Weight Effort (default 0.05)
  - **Thresholds**:
    - Importance Threshold (default 6)
    - Urgency Threshold (default 6)
  - **Data Management**:
    - Export Tasks (JSON)
    - Import Tasks (JSON)
    - Clear All Data (with confirmation)
  - **About**: App version, build info

## Primary User Flows

### Flow 1: Create and Prioritize a New Task
1. User taps FAB on Home screen
2. Task Detail screen opens (new task mode)
3. User enters title, description (optional), due date
4. User adjusts five metric sliders (1-10)
5. App live-calculates quadrant and priority score
6. User taps "Save"
7. Task appears in Home list and Matrix screen in correct quadrant
8. Home screen updates with new task

### Flow 2: Reorganize Task via Matrix Drag-and-Drop
1. User opens Matrix screen
2. User long-presses task card in Q2 (Schedule)
3. User drags card to Q1 (Do Now)
4. App updates importance/urgency flags
5. Priority score recalculates
6. Task card animates to new position
7. Quadrant counts update

### Flow 3: Review and Complete Task
1. User opens Home screen
2. User taps task to open Detail screen
3. User reviews metrics and description
4. User marks task as "Done" via status toggle
5. Task moves to completed state (grayed out or hidden)
6. Statistics screen reflects completion

### Flow 4: Adjust Scoring Weights
1. User opens Settings screen
2. User adjusts weight sliders (e.g., increase Impact weight to 0.30)
3. App saves settings to local storage
4. User navigates back to Home
5. All priority scores recalculate with new weights
6. Tasks re-sort automatically

## Color Scheme

### Primary Colors
- **Primary Tint**: `#0a7ea4` (iOS-style blue)
- **Background**: Light `#ffffff` / Dark `#151718`
- **Surface**: Light `#f5f5f5` / Dark `#1e2022`
- **Foreground**: Light `#11181C` / Dark `#ECEDEE`
- **Muted**: Light `#687076` / Dark `#9BA1A6`

### Quadrant Colors
- **Q1 (Do Now)**: `#EF4444` (Red) — urgent & important
- **Q2 (Schedule)**: `#F59E0B` (Amber) — important, not urgent
- **Q3 (Delegate)**: `#3B82F6` (Blue) — urgent, not important
- **Q4 (Delete)**: `#9CA3AF` (Gray) — neither urgent nor important

### Status Colors
- **Active**: `#22C55E` (Green)
- **Done**: `#9CA3AF` (Gray)
- **Archived**: `#6B7280` (Dark Gray)

## Key UX Principles

1. **One-Handed Usage**: All interactive elements within thumb reach; FAB in bottom-right
2. **Live Feedback**: Metrics sliders show real-time priority score and quadrant updates
3. **Visual Hierarchy**: Quadrant colors and priority badges make task urgency obvious
4. **Minimal Friction**: Quick filters, search, and swipe actions for common tasks
5. **Dark Mode**: Full support with automatic theme detection
6. **Haptic Feedback**: Light haptics on button taps and task completion

## Keyboard Shortcuts (Mobile)

- **Swipe Right**: Mark task as done
- **Swipe Left**: Archive task
- **Long Press**: Edit task or drag (matrix)
- **Double Tap**: Quick toggle task status

---

## Implementation Notes

- All screens use `ScreenContainer` for proper SafeArea handling
- Tab navigation: Home, Matrix, Statistics, Settings
- Local data storage via SQLite + AsyncStorage for settings
- No backend required; fully offline-first
- Responsive design adapts to tablet screens (landscape support optional)
