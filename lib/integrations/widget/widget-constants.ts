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
