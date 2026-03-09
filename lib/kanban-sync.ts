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

/**
 * Maps task status to the column index (0-based).
 * The Kanban board always has 3 default columns in order:
 *   0 → not_started  (Start / Начать)
 *   1 → in_progress  (In Progress / В процессе)
 *   2 → completed    (Done / Готово)
 *
 * We use the index rather than a hardcoded column id because users may have
 * existing boards with different ids (e.g. from a previous version).
 */
const STATUS_TO_COLUMN_INDEX: Record<TaskStatus, number> = {
  not_started: 0,
  in_progress: 1,
  completed: 2,
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
 * The sticker is placed in the column whose position matches the task status:
 *   - not_started → 1st column (index 0)
 *   - in_progress → 2nd column (index 1)
 *   - completed   → 3rd column (index 2)
 *
 * Only the task title is shown on the sticker.
 * If the task is already on the board it is not duplicated.
 *
 * @param task  The task to copy to Kanban
 * @param isRu  Whether to use Russian column titles for default initialisation
 * @returns true if added successfully, false if already exists
 */
export async function addTaskToKanban(task: Task, isRu: boolean): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    let data: KanbanData;

    if (stored) {
      data = JSON.parse(stored);
    } else {
      // Initialise with default columns matching Tasks screen statuses
      data = { columns: isRu ? DEFAULT_COLUMNS_RU : DEFAULT_COLUMNS_EN };
    }

    // Check if this task is already in any column (sticker id starts with "task_<taskId>")
    const stickerPrefix = `task_${task.id}`;
    const alreadyExists = data.columns.some((col) =>
      col.stickers.some((s) => s.id.startsWith(stickerPrefix))
    );

    if (alreadyExists) {
      return false;
    }

    // Determine target column by position (index), not by id.
    // This works regardless of what ids the user's existing columns have.
    const targetIndex = STATUS_TO_COLUMN_INDEX[task.status];
    const targetCol = data.columns[targetIndex] ?? data.columns[0];

    if (!targetCol) {
      return false;
    }

    const sticker: KanbanSticker = {
      id: `${stickerPrefix}_${Date.now()}`,
      text: task.title,
      bgColor: "#FFEB3B",
      textColor: "#000000",
    };

    const newColumns = data.columns.map((col, idx) =>
      idx === data.columns.indexOf(targetCol)
        ? { ...col, stickers: [...col.stickers, sticker] }
        : col
    );

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ columns: newColumns }));
    return true;
  } catch (e) {
    console.error("[KanbanSync] Failed to add task to kanban:", e);
    return false;
  }
}
