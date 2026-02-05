# Eisenhower Priority App — Project TODO

## Core Architecture & Setup
- [x] Set up TypeScript domain models (Task, Settings, Scoring)
- [x] Implement SQLite database layer with migrations
- [x] Create repository/data access layer
- [x] Set up AsyncStorage for settings persistence
- [x] Configure Tailwind theme colors and tokens

## Domain Logic & Calculations
- [x] Implement quadrant calculation (Q1/Q2/Q3/Q4 based on importance/urgency)
- [x] Implement priority score formula with configurable weights
- [x] Implement next action hint generation
- [x] Create scoring service with weight/threshold adjustments
- [x] Add unit tests for quadrant calculation
- [x] Add unit tests for priority score calculation
- [x] Add unit tests for settings application

## Database & Data Management
- [x] Design SQLite schema (tasks, settings tables)
- [x] Implement CRUD operations (create, read, update, delete)
- [x] Implement archive/restore functionality
- [x] Implement task search and filtering
- [x] Implement data export (JSON)
- [x] Implement data import (JSON)
- [x] Add database migrations support

## UI Components
- [x] Create Task card component
- [x] Create Metric slider component (1-10)
- [x] Create Quadrant badge component
- [x] Create Priority score display component
- [x] Create Filter/sort controls
- [x] Create Search bar component
- [x] Create Modal/bottom sheet for task creation

## Screens Implementation
- [x] Home Screen (tasks list with filters, search, sort)
- [x] Matrix Screen (2×2 board with drag-and-drop)
- [x] Task Detail Screen (full form with metrics)
- [x] Statistics Screen (charts and summaries)
- [x] Settings Screen (weights, thresholds, data management)

## Navigation & Integration
- [x] Set up tab navigation (Home, Matrix, Statistics, Settings)
- [x] Implement navigation between screens
- [x] Connect Home screen to task list from database
- [x] Connect Matrix screen to database with live updates
- [x] Connect Task Detail to CRUD operations
- [x] Implement task creation flow
- [x] Implement task editing flow
- [x] Implement task deletion/archiving flow

## Advanced Features
- [ ] Drag-and-drop on Matrix screen
- [ ] Swipe actions on task list (mark done, archive, delete)
- [x] Live priority score calculation as metrics change
- [x] Task search with highlighting
- [x] Quadrant filtering with visual indicators
- [x] Export/import functionality
- [x] Data backup/restore

## Theme & Styling
- [x] Implement dark/light theme toggle
- [x] Apply quadrant colors (Q1-Q4)
- [x] Apply status colors (active, done, archived)
- [x] Ensure responsive design for tablets
- [x] Add haptic feedback on interactions

## Testing
- [ ] Unit tests for quadrant logic
- [ ] Unit tests for priority score formula
- [ ] Unit tests for settings application
- [ ] Integration tests for database operations
- [ ] E2E tests for main user flows (optional)

## Branding & Finalization
- [x] Generate app logo/icon
- [x] Update app.config.ts with branding
- [x] Create app name and slug
- [x] Set up splash screen
- [x] Configure adaptive icons for Android

## Documentation & Delivery
- [x] Create comprehensive README
- [x] Document database schema
- [x] Document API/service layer
- [x] Add build and run instructions
- [x] Add backup/restore instructions
- [ ] Create initial checkpoint

## Push Notifications (NEW)
- [x] Install expo-notifications package
- [x] Create notification service with scheduling logic
- [x] Implement permission handling (iOS/Android)
- [x] Add notification scheduling for Q1 and Q2 tasks
- [x] Add notification scheduling based on due date
- [x] Handle notification taps to navigate to task
- [x] Add notification settings UI (enable/disable, time preferences)
- [x] Store notification preferences in database
- [x] Cancel notifications when task is marked done
- [x] Add test notifications to settings screen
- [x] Document notification system in README
