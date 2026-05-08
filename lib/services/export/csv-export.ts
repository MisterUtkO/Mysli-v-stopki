import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import type { Task } from "@/lib/domain/types";

/**
 * CSV Export Service
 * Handles exporting tasks to CSV format for analysis in Excel/Google Sheets
 */

export interface ExportOptions {
  includeCompleted?: boolean;
  includeDeleted?: boolean;
  format?: "csv" | "json";
}

/**
 * Convert tasks to CSV format
 */
function tasksToCSV(tasks: Task[]): string {
  if (tasks.length === 0) {
    return "No tasks to export";
  }

  // CSV headers
  const headers = [
    "Title",
    "Description",
    "Quadrant",
    "Importance",
    "Urgency",
    "Status",

    "Due Date",
    "Due Time",
    "Created Date",
    "Emoji",
    "Tags",
    "Attachments Count",
  ];

  // Convert tasks to CSV rows
  const rows = tasks.map((task) => [
    escapeCSVField(task.title),
    escapeCSVField(task.description || ""),
    task.quadrant || "",
    task.importance || 0,
    task.urgency || 0,
    task.status || "not_started",

    task.dueDate || "",
    task.dueTime || "",
    task.createdAt ? new Date(task.createdAt).toISOString() : "",
    task.emoji || "",
    "", // tags field not in Task type
    task.attachments ? task.attachments.length : 0,
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  return csvContent;
}

/**
 * Escape CSV field to handle commas and quotes
 */
function escapeCSVField(field: string | number | undefined): string {
  if (field === undefined || field === null) return "";
  const str = String(field);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Export tasks to CSV and share/save the file
 */
export async function exportTasksToCSV(
  tasks: Task[],
  options: ExportOptions = {}
): Promise<boolean> {
  try {
    const { includeCompleted = true, includeDeleted = false } = options;

    // Filter tasks based on options
    let filteredTasks = tasks;
    if (!includeCompleted) {
      filteredTasks = filteredTasks.filter((t) => t.status !== "completed");
    }
    if (!includeDeleted) {
      filteredTasks = filteredTasks.filter((t) => !t.deletedAt);
    }

    // Generate CSV content
    const csvContent = tasksToCSV(filteredTasks);

    // Create filename with timestamp
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `tasks_${timestamp}.csv`;

    if (Platform.OS === "web") {
      // Web: Download via blob
      downloadCSVWeb(csvContent, filename);
      return true;
    } else {
      // Native: Save to file system and share
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          dialogTitle: "Export Tasks",
          UTI: "public.comma-separated-values-text",
        });
        return true;
      } else {
        console.log("Sharing not available on this platform");
        return false;
      }
    }
  } catch (error) {
    console.error("Failed to export tasks to CSV:", error);
    return false;
  }
}

/**
 * Download CSV file on web platform
 */
function downloadCSVWeb(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export tasks to JSON format (alternative)
 */
export async function exportTasksToJSON(
  tasks: Task[],
  options: ExportOptions = {}
): Promise<boolean> {
  try {
    const { includeCompleted = true, includeDeleted = false } = options;

    // Filter tasks based on options
    let filteredTasks = tasks;
    if (!includeCompleted) {
      filteredTasks = filteredTasks.filter((t) => t.status !== "completed");
    }
    if (!includeDeleted) {
      filteredTasks = filteredTasks.filter((t) => !t.deletedAt);
    }

    // Create JSON content
    const jsonContent = JSON.stringify(
      {
        exportDate: new Date().toISOString(),
        taskCount: filteredTasks.length,
        tasks: filteredTasks,
      },
      null,
      2
    );

    // Create filename with timestamp
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `tasks_${timestamp}.json`;

    if (Platform.OS === "web") {
      // Web: Download via blob
      const blob = new Blob([jsonContent], {
        type: "application/json;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } else {
      // Native: Save to file system and share
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, jsonContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/json",
          dialogTitle: "Export Tasks",
        });
        return true;
      } else {
        console.log("Sharing not available on this platform");
        return false;
      }
    }
  } catch (error) {
    console.error("Failed to export tasks to JSON:", error);
    return false;
  }
}
