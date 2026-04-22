# Architecture Analysis: "Мысли в стопки" (Thoughts in Stacks)

**Date:** April 22, 2026  
**Version:** 1.0.92  
**Status:** Production-Ready with Optimization Opportunities

---

## 📊 Project Overview

| Metric | Value |
|--------|-------|
| Total Files | 165 |
| TypeScript Files | 115+ |
| Components | 30+ |
| Screens | 8 main + 5 settings |
| Test Files | 8 |
| Lines of Code | ~15,000+ |
| Architecture Pattern | Context API + Custom Hooks |
| State Management | React Context + AsyncStorage + Database |
| Database | PostgreSQL + Drizzle ORM |
| Backend | Express + tRPC |

---

## 🏗️ Current Structure Analysis

### ✅ Strengths

1. **Well-Organized Directory Structure**
   - Clear separation: `app/`, `components/`, `lib/`, `server/`
   - Logical grouping by feature (contexts, services, domain)
   - Consistent naming conventions

2. **Comprehensive Feature Set**
   - Task management (CRUD, status, priority)
   - Matrix view (Eisenhower quadrants)
   - Kanban board with drag-and-drop
   - Calendar integration
   - Achievements system
   - Notifications and reminders
   - Multi-language support (EN/RU)
   - Theme customization

3. **Robust Backend Integration**
   - Database layer properly abstracted
   - tRPC for type-safe API calls
   - OAuth authentication
   - Notification scheduling

4. **Testing Infrastructure**
   - Unit tests for critical logic
   - Domain logic tests (quadrant, scoring)
   - Database tests

### ⚠️ Areas for Improvement

1. **Component Organization**
   - **Issue:** Components folder is flat with 30+ files
   - **Impact:** Hard to find related components, unclear dependencies
   - **Solution:** Group by feature/domain

2. **Utility Functions Scattered**
   - **Issue:** `calendar-sync.ts`, `kanban-sync.ts`, `reminders.ts` at root of `lib/`
   - **Impact:** Hard to locate sync/integration logic
   - **Solution:** Create `lib/integrations/` folder

3. **Context Providers Not Centralized**
   - **Issue:** Multiple contexts in `lib/context/` but no clear initialization order
   - **Impact:** Potential provider ordering issues
   - **Solution:** Create `lib/context/index.ts` with proper export

4. **Service Layer Incomplete**
   - **Issue:** `lib/services/` has only 4 files; other services scattered
   - **Impact:** Inconsistent service pattern
   - **Solution:** Consolidate all services in one place

5. **No Clear API/Integration Layer**
   - **Issue:** `calendar-sync.ts` and `kanban-sync.ts` mixed with utilities
   - **Impact:** Hard to manage external integrations
   - **Solution:** Create `lib/integrations/` folder

6. **Debug Code in Production**
   - **Issue:** `lib/debug/matrix-modal-debug.ts` in main codebase
   - **Impact:** Unnecessary code in production builds
   - **Solution:** Move to `__tests__/` or remove

7. **Type Definitions Scattered**
   - **Issue:** Types in `lib/domain/types.ts`, `shared/types.ts`, `server/_core/types/`
   - **Impact:** Unclear which types to use where
   - **Solution:** Consolidate shared types, separate domain/server types

8. **No Clear Feature Modules**
   - **Issue:** Features not grouped (e.g., task features, kanban features)
   - **Impact:** Hard to add/remove features independently
   - **Solution:** Consider feature-based structure for future growth

---

## 📁 Recommended Restructuring

### Current Structure (Flat)
```
lib/
├── calendar-sync.ts
├── kanban-sync.ts
├── reminders.ts
├── glow-colors.ts
├── theme-neon-colors.ts
├── context/
├── services/
├── domain/
└── database/
```

### Recommended Structure (Organized)
```
lib/
├── core/                    # Core utilities (no changes needed)
│   ├── api.ts
│   ├── auth.ts
│   ├── theme.ts
│   └── ...
├── context/                 # All context providers
│   ├── index.ts            # ← NEW: Central export
│   ├── task-context.tsx
│   ├── achievement-context.tsx
│   └── ...
├── domain/                  # Business logic (no changes needed)
│   ├── types.ts
│   ├── quadrant-logic.ts
│   ├── scoring.ts
│   └── ...
├── services/                # Application services
│   ├── task/
│   │   ├── task-service.ts
│   │   ├── task-migration.ts
│   │   └── task-cleanup.ts
│   ├── notification/
│   │   ├── notification-scheduler.ts
│   │   └── reminder-service.ts
│   └── achievement/
│       └── achievement-checker.ts
├── integrations/            # ← NEW: External integrations
│   ├── calendar/
│   │   └── calendar-sync.ts
│   ├── kanban/
│   │   └── kanban-sync.ts
│   └── storage/
│       └── index.ts
├── theme/                   # ← NEW: Theme utilities
│   ├── glow-colors.ts
│   ├── neon-colors.ts
│   └── provider.tsx
├── database/                # Database layer (no changes needed)
│   ├── db.ts
│   └── db.test.ts
├── i18n/                    # Internationalization (no changes needed)
│   └── translations.ts
├── hooks/                   # ← MOVE: Custom hooks
│   ├── use-colors.ts
│   ├── use-auth.ts
│   └── ...
└── utils.ts                 # Utility functions
```

### Component Reorganization
```
components/
├── common/                  # ← NEW: Reusable components
│   ├── screen-container.tsx
│   ├── themed-view.tsx
│   ├── external-link.tsx
│   └── hello-wave.tsx
├── ui/                      # UI primitives (already exists)
│   ├── icon-symbol.tsx
│   ├── collapsible.tsx
│   └── ...
├── task/                    # ← NEW: Task-related components
│   ├── task-detail-modal.tsx
│   ├── task-popup-bubble.tsx
│   ├── task-card-glow.tsx
│   ├── swipeable-task-card.tsx
│   └── animated-task-border.tsx
├── matrix/                  # ← NEW: Matrix-specific components
│   ├── matrix-task-card.tsx
│   └── ...
├── kanban/                  # ← NEW: Kanban-specific components
│   ├── kanban-board.tsx
│   ├── kanban-sticker-detail-modal.tsx
│   └── ...
├── achievement/             # ← NEW: Achievement components
│   ├── achievement-celebration.tsx
│   ├── animated-achievement-card.tsx
│   └── ...
├── customization/           # Settings components (already exists)
│   ├── notification-settings.tsx
│   ├── quadrant-colors-settings.tsx
│   └── ...
├── animations/              # ← NEW: Animation components
│   ├── animated-emoji.tsx
│   ├── animated-tab-indicator.tsx
│   ├── screen-transition.tsx
│   ├── parallax-scroll-view.tsx
│   └── haptic-tab-with-glow.tsx
├── modals/                  # ← NEW: Modal components
│   ├── task-detail-modal.tsx
│   ├── kanban-sticker-detail-modal.tsx
│   ├── emoji-picker.tsx
│   ├── file-preview-modal.tsx
│   └── onboarding-tutorial.tsx
└── layout/                  # ← NEW: Layout components
    ├── app-about-section.tsx
    ├── app-version-footer.tsx
    └── ...
```

---

## 🔄 Migration Plan (Non-Breaking)

### Phase 1: Create New Directories (No Changes to Existing Code)
```bash
mkdir -p lib/services/task
mkdir -p lib/services/notification
mkdir -p lib/services/achievement
mkdir -p lib/integrations/calendar
mkdir -p lib/integrations/kanban
mkdir -p lib/theme
mkdir -p components/common
mkdir -p components/task
mkdir -p components/matrix
mkdir -p components/kanban
mkdir -p components/achievement
mkdir -p components/animations
mkdir -p components/modals
mkdir -p components/layout
```

### Phase 2: Move Files (One by One, Test After Each)
1. Move task services: `task-migration.ts`, `task-cleanup.ts` → `lib/services/task/`
2. Move notification services: `notification-scheduler.ts`, `reminders.ts` → `lib/services/notification/`
3. Move achievement checker: `achievements/checker.ts` → `lib/services/achievement/`
4. Move integrations: `calendar-sync.ts` → `lib/integrations/calendar/`
5. Move kanban sync: `kanban-sync.ts` → `lib/integrations/kanban/`
6. Move theme utilities: `glow-colors.ts`, `theme-neon-colors.ts` → `lib/theme/`
7. Move components by category

### Phase 3: Update Imports
- Update all import paths in components and screens
- Create barrel exports (`index.ts`) in new directories
- Test each screen/component after import changes

### Phase 4: Clean Up
- Remove old files
- Update documentation
- Run full test suite

---

## 🎯 Benefits of Restructuring

| Benefit | Impact |
|---------|--------|
| **Faster Feature Development** | New features can be added to isolated modules |
| **Easier Bug Fixes** | Related code is grouped together |
| **Better Code Reusability** | Clear service/component boundaries |
| **Improved Onboarding** | New developers understand structure faster |
| **Scalability** | Easy to add new features without cluttering existing folders |
| **Maintenance** | Easier to refactor and update code |
| **Testing** | Services can be tested independently |

---

## 📋 Checklist for Implementation

- [ ] Create new directory structure
- [ ] Move files one category at a time
- [ ] Update all import paths
- [ ] Create barrel exports (index.ts files)
- [ ] Run TypeScript compiler (verify 0 errors)
- [ ] Run test suite
- [ ] Test all screens in app
- [ ] Update README.md with new structure
- [ ] Document service layer APIs
- [ ] Create CONTRIBUTING.md with folder guidelines

---

## 🚀 Additional Recommendations

### 1. Create Service Layer Documentation
```typescript
// lib/services/task/README.md
// Document what each service does
// Provide usage examples
// List dependencies
```

### 2. Create Component Guidelines
```typescript
// components/README.md
// Document component categories
// Provide naming conventions
// List reusable components
```

### 3. Add Barrel Exports
```typescript
// lib/services/index.ts
export * from './task';
export * from './notification';
export * from './achievement';

// lib/integrations/index.ts
export * from './calendar';
export * from './kanban';
```

### 4. Create Type Definitions Index
```typescript
// lib/types/index.ts
// Re-export all types from domain, services, integrations
```

### 5. Document Context Provider Order
```typescript
// lib/context/index.ts
// Document the correct order to wrap providers
// Explain dependencies between contexts
```

---

## ⚠️ Important Notes

- **No Logic Changes:** This restructuring only moves files, no functionality changes
- **No UI Changes:** All screens and components remain visually identical
- **Backward Compatible:** All existing imports will be updated
- **Gradual Migration:** Can be done incrementally, testing after each phase
- **Test Coverage:** Existing tests should continue to pass

---

## 📊 Current Metrics

| Metric | Value |
|--------|-------|
| Components | 30+ |
| Contexts | 5 |
| Services | 4 (should be ~10) |
| Integrations | 2 (scattered) |
| Screens | 13 |
| Test Files | 8 |
| TypeScript Errors | 0 |
| Code Coverage | Partial |

---

## 🎓 Next Steps

1. **Review this analysis** with team/stakeholders
2. **Approve restructuring plan**
3. **Execute Phase 1-4** (estimated 2-3 hours)
4. **Test thoroughly** after each phase
5. **Update documentation**
6. **Create CONTRIBUTING.md** for future developers

---

**Generated:** April 22, 2026  
**Project:** Мысли в стопки (Thoughts in Stacks)  
**Version:** 1.0.92
