/**
 * Kanban Sync Utility
 * Provides two-way synchronisation between Tasks and Kanban stickers.
 *
 * Task → Kanban (forward sync):
 *   - addTaskToKanban:    copy a task to the board as a sticker
 *   - syncTaskToKanban:   update an existing sticker when the task changes
 *                         (title, status → column position)
 *   - removeTaskFromKanban: delete the sticker when the task is deleted
 *
 * Kanban → Task (reverse sync):
 *   - getTaskStatusFromKanban: derive a TaskStatus from the column index
 *                              a sticker currently occupies
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Task, TaskStatus } from "@/lib/domain/types";

export const KANBAN_STORAGE_KEY = "@sdvgnote_kanban";

// ─── Internal types ──────────────────────────────────────────────────────────

interface KanbanSticker {
  id: string;
  text: string;
  bgColor: string;
  textColor: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  stickers: KanbanSticker[];
}

interface KanbanData {
  columns: KanbanColumn[];
}

// ─── Status ↔ column-index mapping ───────────────────────────────────────────

/**
 * The first three columns of the board always correspond to:
 *   index 0 → not_started
 *   index 1 → in_progress
 *   index 2 → completed
 *
 * We use the index (not the id) because users may have boards with arbitrary ids.
 */
const STATUS_TO_INDEX: Record<TaskStatus, number> = {
  not_started: 0,
  in_progress: 1,
  completed: 2,
};

const INDEX_TO_STATUS: Record<number, TaskStatus> = {
  0: "not_started",
  1: "in_progress",
  2: "completed",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STICKER_PREFIX = (taskId: string) => `task_${taskId}`;

async function loadData(): Promise<KanbanData | null> {
  try {
    const stored = await AsyncStorage.getItem(KANBAN_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as KanbanData) : null;
  } catch {
    return null;
  }
}

async function saveData(data: KanbanData): Promise<void> {
  await AsyncStorage.setItem(KANBAN_STORAGE_KEY, JSON.stringify(data));
}

const DEFAULT_COLUMNS_EN: KanbanColumn[] = [
  { id: "col_1", title: "Start", stickers: [] },
  { id: "col_2", title: "In Progress", stickers: [] },
  { id: "col_3", title: "Done", stickers: [] },
];

const DEFAULT_COLUMNS_RU: KanbanColumn[] = [
  { id: "col_1", title: "Начать", stickers: [] },
  { id: "col_2", title: "В процессе", stickers: [] },
  { id: "col_3", title: "Готово", stickers: [] },
];

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Get the color for a sticker based on task quadrant.
 * Q1 (red), Q2 (orange), Q3 (blue), Q4 (green)
 */
function getQuadrantColor(quadrant: string): { bgColor: string; textColor: string } {
  const colorMap: Record<string, { bgColor: string; textColor: string }> = {
    Q1: { bgColor: "#EF4444", textColor: "#FFFFFF" },  // red
    Q2: { bgColor: "#F97316", textColor: "#FFFFFF" },  // orange
    Q3: { bgColor: "#3B82F6", textColor: "#FFFFFF" },  // blue
    Q4: { bgColor: "#22C55E", textColor: "#FFFFFF" },  // green
  };
  return colorMap[quadrant] || { bgColor: "#FFEB3B", textColor: "#000000" }; // fallback to yellow
}

/**
 * Copy a task to the Kanban board as a new sticker.
 * Sticker is placed in the column whose index matches the task status.
 * Sticker color is based on the task's quadrant (Q1=red, Q2=orange, Q3=blue, Q4=green).
 * Returns false if the task is already on the board.
 */
export async function addTaskToKanban(task: Task, isRu: boolean): Promise<boolean> {
  try {
    let data = await loadData();
    if (!data) {
      data = { columns: isRu ? DEFAULT_COLUMNS_RU : DEFAULT_COLUMNS_EN };
    }

    const prefix = STICKER_PREFIX(task.id);
    const alreadyExists = data.columns.some((col) =>
      col.stickers.some((s) => s.id.startsWith(prefix))
    );
    if (alreadyExists) return false;

    const targetIndex = STATUS_TO_INDEX[task.status];
    const targetCol = data.columns[targetIndex] ?? data.columns[0];
    if (!targetCol) return false;

    const { bgColor, textColor } = getQuadrantColor(task.quadrant);
    const sticker: KanbanSticker = {
      id: `${prefix}_${Date.now()}`,
      text: task.title,
      bgColor,
      textColor,
    };

    const newColumns = data.columns.map((col) =>
      col === targetCol ? { ...col, stickers: [...col.stickers, sticker] } : col
    );

    await saveData({ columns: newColumns });
    return true;
  } catch (e) {
    console.error("[KanbanSync] addTaskToKanban failed:", e);
    return false;
  }
}

/**
 * Update the sticker that was created from a task.
 * - Updates the sticker text to the new task title.
 * - Updates the sticker color based on the task's quadrant.
 * - Moves the sticker to the column matching the new task status.
 * Does nothing if the task has no linked sticker on the board.
 */
export async function syncTaskToKanban(task: Task): Promise<void> {
  try {
    const data = await loadData();
    if (!data) return;

    const prefix = STICKER_PREFIX(task.id);

    // Find the sticker and its current column
    let foundSticker: KanbanSticker | null = null;
    let currentColIndex = -1;

    for (let i = 0; i < data.columns.length; i++) {
      const s = data.columns[i].stickers.find((s) => s.id.startsWith(prefix));
      if (s) {
        foundSticker = s;
        currentColIndex = i;
        break;
      }
    }

    if (!foundSticker || currentColIndex === -1) return; // not on board

    const targetIndex = STATUS_TO_INDEX[task.status];
    const { bgColor, textColor } = getQuadrantColor(task.quadrant);

    // Update sticker text, color, and move to correct column if needed
    const updatedSticker: KanbanSticker = { ...foundSticker, text: task.title, bgColor, textColor };

    const newColumns = data.columns.map((col, idx) => {
      if (idx === currentColIndex && idx === targetIndex) {
        // Same column — just update text
        return {
          ...col,
          stickers: col.stickers.map((s) =>
            s.id === foundSticker!.id ? updatedSticker : s
          ),
        };
      }
      if (idx === currentColIndex) {
        // Remove from old column
        return { ...col, stickers: col.stickers.filter((s) => s.id !== foundSticker!.id) };
      }
      if (idx === targetIndex) {
        // Add to new column
        return { ...col, stickers: [...col.stickers, updatedSticker] };
      }
      return col;
    });

    await saveData({ columns: newColumns });
  } catch (e) {
    console.error("[KanbanSync] syncTaskToKanban failed:", e);
  }
}

/**
 * Remove the sticker linked to a task from the board.
 * Called when a task is deleted.
 */
export async function removeTaskFromKanban(taskId: string): Promise<void> {
  try {
    const data = await loadData();
    if (!data) return;

    const prefix = STICKER_PREFIX(taskId);
    const newColumns = data.columns.map((col) => ({
      ...col,
      stickers: col.stickers.filter((s) => !s.id.startsWith(prefix)),
    }));

    await saveData({ columns: newColumns });
  } catch (e) {
    console.error("[KanbanSync] removeTaskFromKanban failed:", e);
  }
}

/**
 * Given a task id, return the TaskStatus that corresponds to the column
 * the sticker currently occupies on the board.
 * Returns null if the task has no linked sticker.
 */
export async function getTaskStatusFromKanban(taskId: string): Promise<TaskStatus | null> {
  try {
    const data = await loadData();
    if (!data) return null;

    const prefix = STICKER_PREFIX(taskId);
    for (let i = 0; i < data.columns.length; i++) {
      const found = data.columns[i].stickers.some((s) => s.id.startsWith(prefix));
      if (found) {
        return INDEX_TO_STATUS[i] ?? null;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Check whether a task already has a linked sticker on the board.
 */
export async function isTaskOnKanban(taskId: string): Promise<boolean> {
  try {
    const data = await loadData();
    if (!data) return false;
    const prefix = STICKER_PREFIX(taskId);
    return data.columns.some((col) => col.stickers.some((s) => s.id.startsWith(prefix)));
  } catch {
    return false;
  }
}
