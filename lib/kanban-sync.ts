/**
 * Kanban Sync Utility
 * Allows adding tasks to the Kanban board from anywhere in the app.
 * Reads/writes directly to AsyncStorage using the same key as KanbanBoard.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Task, TaskStatus } from "@/lib/domain/types";

const STORAGE_KEY = "@sdvgnote_kanban";

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

/** Maps task status to the default Kanban column id */
const STATUS_TO_COLUMN_ID: Record<TaskStatus, string> = {
  not_started: "col_1",
  in_progress: "col_2",
  completed: "col_3",
};

/** Default column titles used when Kanban has not been initialized yet */
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

/**
 * Adds a task to the Kanban board as a sticker.
 * The sticker is placed in the column matching the task's current status.
 * Only the task title is shown on the sticker.
 * If the task is already in the board (same task id encoded in sticker id), it is not duplicated.
 *
 * @param task - The task to copy to Kanban
 * @param isRu - Whether to use Russian column titles for default initialization
 * @returns true if added successfully, false if already exists
 */
export async function addTaskToKanban(task: Task, isRu: boolean): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    let data: KanbanData;

    if (stored) {
      data = JSON.parse(stored);
    } else {
      // Initialize with default columns matching Tasks screen statuses
      data = { columns: isRu ? DEFAULT_COLUMNS_RU : DEFAULT_COLUMNS_EN };
    }

    // Check if this task is already in any column (sticker id starts with "task_<taskId>")
    const stickerPrefix = `task_${task.id}`;
    const alreadyExists = data.columns.some((col) =>
      col.stickers.some((s) => s.id.startsWith(stickerPrefix))
    );

    if (alreadyExists) {
      return false; // Already exists
    }

    // Find the target column by status
    const targetColId = STATUS_TO_COLUMN_ID[task.status];
    const targetCol = data.columns.find((c) => c.id === targetColId);

    if (!targetCol) {
      // Fallback: add to first column if target column doesn't exist
      if (data.columns.length === 0) return false;
      const sticker: KanbanSticker = {
        id: `${stickerPrefix}_${Date.now()}`,
        text: task.title,
        bgColor: "#FFEB3B",
        textColor: "#000000",
      };
      data.columns[0].stickers.push(sticker);
    } else {
      const sticker: KanbanSticker = {
        id: `${stickerPrefix}_${Date.now()}`,
        text: task.title,
        bgColor: "#FFEB3B",
        textColor: "#000000",
      };
      const newColumns = data.columns.map((col) =>
        col.id === targetColId ? { ...col, stickers: [...col.stickers, sticker] } : col
      );
      data = { columns: newColumns };
    }

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("[KanbanSync] Failed to add task to kanban:", e);
    return false;
  }
}
