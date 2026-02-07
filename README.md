# Eisenhower Priority App

A powerful mobile task prioritization app based on the **Eisenhower Matrix** with simplified 2-metric scoring. Organize your tasks by importance and urgency, and make data-driven decisions about what to focus on. Supports both English and Russian with automatic system language detection.

## Features

### 📊 Eisenhower Matrix
- Automatically categorize tasks into 4 quadrants:
  - **Q1 (Do Now)**: Important & Urgent (Red)
  - **Q2 (Schedule)**: Important & Not Urgent (Orange)
  - **Q3 (Delegate)**: Not Important & Urgent (Blue)
  - **Q4 (Delete)**: Not Important & Not Urgent (Gray)

### 📈 Simplified Scoring System
- **2-point metric scale** for each task:
  - **Importance** (1-10): How critical is this task?
  - **Urgency** (1-10): How time-sensitive is it?

- **Configurable weights** to customize priority calculation (default: 50/50)
- **Dynamic thresholds** to adjust quadrant boundaries (default: 6/10)
- **Priority score** (0-100) automatically calculated for each task based on importance and urgency

### 🎯 Task Management
- Create, edit, and delete tasks
- Add descriptions, due dates, and tags
- Mark tasks as done or archive them
- Search and filter by quadrant or status
- Sort by priority, due date, or creation date

### 📊 Statistics & Analytics
- Task completion rate tracking
- Quadrant distribution overview
- Average metrics across all tasks
- Top 10 priority tasks ranking
- Overdue task alerts

### ⚙️ Customization
- Adjust scoring weights for different priorities
- Configure importance/urgency thresholds
- Choose between light, dark, or system theme
- Export/import tasks as JSON

### 🔔 Push Notifications
- Automatic reminders for Q1 (Do Now) and Q2 (Schedule) tasks
- Customizable reminder time (15 min, 30 min, 1h, 2h, 1 day before due date)
- Selective notifications by quadrant
- Tap notifications to jump directly to task
- Test notification feature to verify settings
- Automatic notification cleanup when tasks are completed

### 🌍 Localization
- **Automatic system language detection** (English or Russian)
- Full UI translation to Russian
- Language preference saved locally
- Manual language switching in settings

### 🎨 User Experience
- Clean, intuitive mobile-first design
- Dark mode support
- Haptic feedback on interactions
- Real-time priority score updates
- Responsive layout for all screen sizes
- Support for both English and Russian interfaces

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: React Context + AsyncStorage
- **Database**: SQLite (expo-sqlite)
- **Styling**: Tailwind CSS (NativeWind)
- **Testing**: Vitest
- **Icons**: Expo Vector Icons

## Project Structure

```
eisenhower-priority-app/
├── app/                          # Expo Router screens
│   ├── (tabs)/
│   │   ├── index.tsx            # Home screen (task list)
│   │   ├── matrix.tsx           # Eisenhower Matrix view
│   │   ├── statistics.tsx       # Analytics dashboard
│   │   ├── settings.tsx         # App settings
│   │   └── _layout.tsx          # Tab navigation
│   ├── task-detail.tsx          # Task creation/editing
│   ├── _layout.tsx              # Root layout with providers
│   └── oauth/                   # Auth callbacks
├── components/                   # Reusable UI components
│   ├── screen-container.tsx     # SafeArea wrapper
│   ├── task-card.tsx            # Task display card
│   ├── metric-slider.tsx        # 1-10 metric input
│   ├── priority-display.tsx     # Priority score display
│   ├── matrix-quadrant.tsx      # Quadrant component
│   ├── notification-settings.tsx # Notification preferences UI
│   └── ui/
│       └── icon-symbol.tsx      # Icon mapping
├── lib/
│   ├── domain/
│   │   ├── types.ts             # TypeScript domain models
│   │   ├── scoring.ts           # Priority calculation logic
│   │   └── scoring.test.ts      # Scoring unit tests
│   ├── database/
│   │   └── db.ts                # SQLite service
│   ├── services/
│   │   └── notification-service.ts # Push notification management
│   ├── context/
│   │   └── task-context.tsx     # Task state management
│   ├── utils.ts                 # Utility functions
│   └── trpc.ts                  # API client
├── hooks/
│   ├── use-colors.ts            # Theme colors hook
│   ├── use-color-scheme.ts      # Dark/light mode detection
│   └── use-auth.ts              # Authentication hook
├── assets/
│   ├── images/
│   │   ├── icon.png             # App icon
│   │   ├── splash-icon.png      # Splash screen
│   │   └── favicon.png          # Web favicon
│   └── fonts/                   # Custom fonts (if any)
├── theme.config.js              # Tailwind color tokens
├── tailwind.config.js           # Tailwind configuration
├── app.config.ts                # Expo configuration
├── package.json                 # Dependencies
└── README.md                    # This file
```

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- iOS Simulator or Android Emulator (or Expo Go on physical device)

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# For iOS
pnpm ios

# For Android
pnpm android

# For Web
pnpm web
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test lib/domain/scoring.test.ts

# Watch mode
pnpm test --watch
```

## Database Schema

### Tasks Table
```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  dueDate INTEGER,
  tags TEXT,                    -- JSON array
  status TEXT DEFAULT 'active', -- 'active' | 'done' | 'archived'
  
  -- Metrics (1-10 scale)
  importanceScore INTEGER DEFAULT 5,
  urgencyScore INTEGER DEFAULT 5,
  impactScore INTEGER DEFAULT 5,
  effortScore INTEGER DEFAULT 5,
  riskScore INTEGER DEFAULT 5,
  
  -- Calculated fields
  priorityScore REAL,
  quadrant TEXT,                -- 'Q1' | 'Q2' | 'Q3' | 'Q4'
  nextActionHint TEXT           -- 'Do Now' | 'Schedule' | 'Delegate' | 'Delete'
);
```

### Settings Table
```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updatedAt INTEGER NOT NULL
);

-- Stored settings:
-- weights: { wImportance, wUrgency }
-- thresholds: { importanceThreshold, urgencyThreshold }
-- theme: 'light' | 'dark' | 'system'
-- language: 'en' | 'ru'
```

## Scoring Algorithm

Priority score is calculated using a weighted sum of two simplified metrics:

```
priorityScore = (
  wImportance * importanceScore +
  wUrgency * urgencyScore
) / (wImportance + wUrgency) * 100

// Quadrant determination:
important = importanceScore >= importanceThreshold
urgent = urgencyScore >= urgencyThreshold

Q1 = important && urgent   → "Do Now"
Q2 = important && !urgent  → "Schedule"
Q3 = !important && urgent  → "Delegate"
Q4 = !important && !urgent → "Delete"
```

### Default Weights
- **Importance**: 50% (0.5)
- **Urgency**: 50% (0.5)

### Default Thresholds
- **Importance Threshold**: 6/10 (task is considered important if score ≥ 6)
- **Urgency Threshold**: 6/10 (task is considered urgent if score ≥ 6)

## API Reference

### Task Context

```typescript
// Create a new task
createTask(
  title: string,
  metrics: Metrics,
  options?: { description?, dueDate?, tags? }
): Promise<Task>

// Update existing task
updateTask(
  id: string,
  updates: Partial<Task>
): Promise<void>

// Delete task
deleteTask(id: string): Promise<void>

// Mark task as done
markTaskDone(id: string): Promise<void>

// Archive task
archiveTask(id: string): Promise<void>

// Search tasks
searchTasks(query: string): Task[]

// Export tasks
exportTasks(): Promise<string>  // Returns JSON

// Import tasks
importTasks(jsonData: string): Promise<void>

// Update settings
updateSettings(settings: Partial<Settings>): Promise<void>

// Clear all data
clearAllData(): Promise<void>
```

## Push Notifications

The app includes a comprehensive push notification system to keep you on track with your tasks.

### How Notifications Work

**Automatic Scheduling**: When you create a task with a due date, a notification is automatically scheduled based on your settings. The notification will trigger at a specified time before the task is due.

**Quadrant-Based Filtering**: You can choose which quadrants should trigger notifications:
- **Q1 (Do Now)**: Urgent & Important tasks — enabled by default
- **Q2 (Schedule)**: Important but not urgent tasks — enabled by default
- **Q3 (Delegate)**: Urgent but not important tasks — disabled by default
- **Q4 (Delete)**: Neither urgent nor important — never notified

**Reminder Timing**: Choose when you want to be reminded before the due date:
- 15 minutes before
- 30 minutes before
- 1 hour before
- 2 hours before
- 1 day before

### Configuring Notifications

1. Go to **Settings** → **🔔 Notifications**
2. Toggle **Enable Notifications** to turn notifications on/off
3. Select which quadrants should send notifications
4. Choose your preferred reminder time
5. Tap **📬 Send Test Notification** to verify settings

### Notification Behavior

**When Notifications Appear**: Notifications are sent at the scheduled time before your task is due. If the scheduled time has already passed, no notification is sent.

**Tapping a Notification**: When you tap a notification, the app opens directly to that task's detail screen so you can take action immediately.

**Automatic Cleanup**: When you mark a task as done or archive it, its notification is automatically canceled.

**Rescheduling**: If you edit a task's due date or metrics, the notification is automatically rescheduled with the new information.

### Permissions

The app requests notification permissions when it first launches. You can grant or deny permissions at that time. To change notification permissions later:
- **iOS**: Settings → Eisenhower Priority → Notifications
- **Android**: Settings → Apps → Eisenhower Priority → Notifications

### Troubleshooting Notifications

**Not receiving notifications?**
- Verify notifications are enabled in app Settings
- Check device notification permissions
- Ensure the task has a due date
- Verify the quadrant is enabled for notifications
- Try sending a test notification from Settings

**Notifications too frequent?**
- Increase the reminder time (e.g., from 1h to 1 day)
- Disable notifications for Q3 (Delegate) tasks
- Archive completed tasks to reduce active task count

## Customization Guide

### Adjusting Scoring Weights

To change how metrics affect priority:

1. Go to **Settings** tab
2. Scroll to **Scoring Weights**
3. Adjust each weight (must total 1.0)
4. Tap **Save Settings**

Example: If you want effort to matter more:
- Importance: 0.25 (was 0.30)
- Urgency: 0.25 (unchanged)
- Impact: 0.25 (unchanged)
- Risk: 0.15 (unchanged)
- Effort: 0.10 (was 0.05)

### Adjusting Thresholds

To change when tasks are considered "important" or "urgent":

1. Go to **Settings** tab
2. Scroll to **Thresholds**
3. Adjust importance/urgency thresholds (1-10)
4. Tap **Save Settings**

Example: If you want stricter importance:
- Importance Threshold: 7 (was 6) → only scores 7+ are "important"
- Urgency Threshold: 6 (unchanged)

## Data Management

### Export Tasks

1. Go to **Settings** tab
2. Scroll to **Data Management**
3. Tap **📥 Export Tasks (JSON)**
4. Share or save the exported data

### Import Tasks

Currently, import is available via the API. To import:

```typescript
const { importTasks } = useTaskContext();
const jsonData = '...'; // Your JSON data
await importTasks(jsonData);
```

### Clear All Data

⚠️ **Warning**: This action cannot be undone!

1. Go to **Settings** tab
2. Scroll to **Data Management**
3. Tap **🗑 Clear All Data**
4. Confirm the action

## Troubleshooting

### Tasks not appearing
- Check if tasks are archived (filter by status)
- Verify database is initialized (check app logs)
- Try clearing app cache and restarting

### Priority score seems wrong
- Verify metric values (1-10 scale)
- Check scoring weights in Settings
- Ensure thresholds are set correctly
- Review the scoring algorithm above

### App crashes on startup
- Clear app data and cache
- Reinstall the app
- Check console logs for errors

### Dark mode not working
- Go to Settings and select "Dark" theme explicitly
- Or select "System" to follow device settings

## Performance Tips

- Archive old completed tasks to keep the list fast
- Use tags to organize tasks by project
- Export data regularly as backup
- Clear archived tasks periodically

## Future Enhancements

- [ ] Drag-and-drop on Matrix screen
- [ ] Swipe actions (mark done, archive, delete)
- [ ] Recurring tasks
- [ ] Daily reminder notifications (fixed time each day)
- [ ] Cloud sync (Firebase/Supabase)
- [ ] Collaboration features
- [ ] Time tracking
- [ ] Goal setting and tracking
- [ ] Weekly/monthly review templates
- [ ] Export to calendar

## Contributing

This is a personal project. Feel free to fork and customize for your needs!

## License

MIT

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the database schema and API reference
3. Check app logs in the console
4. Verify your data export for backup

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Built with**: React Native, Expo, TypeScript, Tailwind CSS


## Daily Review Reminders

In addition to task-specific reminders, the app supports daily review reminders to help you stay on top of your workload.

**How Daily Reminders Work**: At your chosen time each day, you receive a notification showing a summary of your active tasks. The notification includes the total number of tasks, how many are in Q1 (urgent), and how many are in Q2 (important).

**Configuring Daily Reminders**: Go to **Settings** → **🔔 Notifications** → **📋 Daily Review Reminder** to enable and configure:
- **Enable/Disable**: Toggle daily reminders on or off
- **Time**: Choose what time each day you want the reminder (e.g., 9:00 AM)
- **Days**: Select which days of the week you want reminders (e.g., weekdays only, or all days)

**Quick Day Selection**: Use the preset buttons to quickly select:
- **Weekdays**: Monday through Friday (typical for work-focused reviews)
- **Weekend**: Saturday and Sunday (for personal task reviews)
- **All Days**: Every day of the week (for comprehensive daily tracking)

**Example Notification**: "📋 Daily Task Review: You have 8 active task(s): 2 urgent, 3 important"

