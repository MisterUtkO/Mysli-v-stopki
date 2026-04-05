# SDVGNote — Заметки для самоорганизации

A mobile task management application for self-organization. Organize your tasks using a 7-point scale for importance and urgency, with automatic color-coded categorization based on the Eisenhower Matrix model.

## Features

### Core Functionality
- **7-Point Scale Metrics**: Rate tasks on importance (1-7) and urgency (1-7)
- **Automatic Quadrant Assignment**: Tasks are automatically categorized into 4 quadrants (Q1-Q4)
- **Color-Coded Display**: Tasks are highlighted with distinct colors based on their quadrant:
  - **Q1 (Red)**: Do Now - Important & Urgent
  - **Q2 (Orange)**: Schedule - Important & Not Urgent
  - **Q3 (Blue)**: Delegate - Not Important & Urgent
  - **Q4 (Green)**: Delete - Not Important & Not Urgent

### Task Management
- **Create Tasks**: Simple form with importance/urgency sliders and optional deadline
- **Edit Tasks**: Modify any task details including metrics and deadline
- **Delete Tasks**: Remove tasks with confirmation
- **Status Tracking**: Mark tasks as "Not Started", "In Progress", or "Completed"
- **Deadline Support**: Optional date and time for task deadlines

### Settings & Customization
- **Language Support**: English and Russian with automatic system language detection
- **Theme Options**: Light, Dark, or System-based themes
- **Threshold Configuration**: Adjust importance and urgency thresholds (1-7) to customize quadrant assignment
- **Data Export**: Export all tasks as JSON for backup
- **Data Management**: Clear all data with confirmation

## Architecture

### Project Structure
```
app/
  _layout.tsx              ← Root layout with providers
  (tabs)/
    _layout.tsx           ← Tab navigation
    index.tsx             ← Task list screen
    settings.tsx          ← Settings screen
  add-task.tsx            ← Add task modal
  task-detail/[id].tsx    ← Edit task modal

lib/
  domain/
    types.ts              ← TypeScript interfaces
    scoring.ts            ← Scoring algorithm
    scoring.test.ts       ← Unit tests (10 tests)
  database/
    db.ts                 ← SQLite database service
  context/
    task-context.tsx      ← Task state management
    i18n-context.tsx      ← Language/localization
```

### Data Model

#### Task
```typescript
interface Task {
  id: string;
  title: string;                    // Auto-generated from description
  description: string;              // Full task description
  importance: number;               // 1-7 scale
  urgency: number;                  // 1-7 scale
  dueDate?: string;                 // ISO 8601 (YYYY-MM-DD)
  dueTime?: string;                 // HH:MM format
  status: "not_started" | "in_progress" | "completed";
  quadrant: "Q1" | "Q2" | "Q3" | "Q4";  // Auto-calculated
  priorityScore: number;            // 0-100 (auto-calculated)
  createdAt: number;                // Timestamp
  updatedAt: number;                // Timestamp
}
```

#### Settings
```typescript
interface Settings {
  language: "en" | "ru";
  theme: "light" | "dark" | "system";
  importanceThreshold: number;      // 1-7, default 4
  urgencyThreshold: number;         // 1-7, default 4
}
```

### Scoring Algorithm

**Priority Score Calculation:**
```
normalizedImportance = (importance - 1) / 6
normalizedUrgency = (urgency - 1) / 6
priorityScore = ((normalizedImportance + normalizedUrgency) / 2) * 100
```

**Quadrant Assignment:**
- Q1: importance >= threshold AND urgency >= threshold
- Q2: importance >= threshold AND urgency < threshold
- Q3: importance < threshold AND urgency >= threshold
- Q4: importance < threshold AND urgency < threshold

## Database Schema

### SQLite Tables

**tasks**
```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  importance INTEGER NOT NULL,
  urgency INTEGER NOT NULL,
  dueDate TEXT,
  dueTime TEXT,
  status TEXT NOT NULL,
  quadrant TEXT NOT NULL,
  priorityScore INTEGER NOT NULL,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);
```

**settings**
```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

## Usage

### Adding a Task
1. Tap the "+ Add" button on the task list
2. Enter task description
3. Adjust importance (1-7) and urgency (1-7) sliders
4. (Optional) Set a deadline with date and time
5. Tap "Add Task"

### Editing a Task
1. Tap on any task card in the list
2. Modify title, description, metrics, or deadline
3. Tap "Save"

### Managing Task Status
1. On the task card, tap the status button
2. Cycles through: Not Started → In Progress → Completed

### Deleting a Task
1. Tap "Delete" on the task card
2. Confirm deletion

### Settings
1. Navigate to the Settings tab
2. Toggle language between English and Russian
3. Change theme (Light/Dark/System)
4. View and adjust importance/urgency thresholds
5. Export tasks as JSON backup
6. Clear all data (with confirmation)

## Responsive Design

The app is optimized for mobile devices with:
- Portrait orientation (9:16 aspect ratio)
- One-handed usage patterns
- Large, readable buttons and text
- Proper spacing for different screen sizes
- Safe area handling for notches and home indicators

## Localization

Supported languages:
- **English**: Default language
- **Russian**: Full translation with system language detection

The app automatically detects system language on first launch and can be toggled in Settings.

## Testing

Run unit tests for the scoring algorithm:
```bash
pnpm test
```

Tests verify:
- Priority score calculation (0-100)
- Quadrant assignment logic
- Task sorting by priority
- Threshold-based categorization

All 10 tests pass successfully.

## Technology Stack

- **Framework**: React Native + Expo
- **Language**: TypeScript 5.9
- **Styling**: Tailwind CSS (NativeWind 4)
- **Database**: SQLite (expo-sqlite)
- **State Management**: React Context + AsyncStorage
- **Navigation**: Expo Router
- **Testing**: Vitest
- **Localization**: expo-localization

## Installation & Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Run tests
pnpm test

# Type check
pnpm check

# Build for production
pnpm build
```

## Notes

- The app uses local SQLite database for data persistence
- No cloud sync or user authentication required
- All data is stored locally on the device
- Export feature allows manual backup as JSON
- The WASM module warning for expo-sqlite on web is expected and doesn't affect native mobile builds
- All TypeScript errors are resolved (0 errors)

## Future Enhancements

Potential features for future versions:
- Swipe actions for quick status changes
- Recurring/repeating tasks
- Task filtering and search
- Notification reminders for deadlines
- Data synchronization across devices
- Task categories/tags
- Time tracking for completed tasks

## License

Proprietary - All rights reserved
