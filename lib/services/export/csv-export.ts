import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import type { Task } from "@/lib/domain/types";

/**
 * CSV Export Service
 * Handles exporting tasks to CSV format for analysis in Excel/Google Sheets
 * Fixed for Android 11+ with proper permissions handling
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
 * Check if we have necessary permissions (simplified for Android)
 */
async function checkPermissions(): Promise<boolean> {
  // Permissions are already declared in app.config.ts
  // Just return true - the system will handle permission requests
  return true;
}

/**
 * Export tasks to CSV and share/save the file
 */
export async function exportTasksToCSV(
  tasks: Task[],
  options: ExportOptions = {}
): Promise<boolean> {
  try {
    console.log("[CSV Export] Starting export for", tasks.length, "tasks on", Platform.OS);

    const { includeCompleted = true, includeDeleted = false } = options;

    // Filter tasks based on options
    let filteredTasks = tasks;
    if (!includeCompleted) {
      filteredTasks = filteredTasks.filter((t) => t.status !== "completed");
    }
    if (!includeDeleted) {
      filteredTasks = filteredTasks.filter((t) => !t.deletedAt);
    }

    console.log("[CSV Export] Filtered tasks:", filteredTasks.length);

    // Generate CSV content
    const csvContent = tasksToCSV(filteredTasks);
    console.log("[CSV Export] CSV content generated, length:", csvContent.length);

    // Create filename with timestamp
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `tasks_${timestamp}.csv`;

    if (Platform.OS === "web") {
      // Web: Download via blob
      console.log("[CSV Export] Using web download");
      downloadCSVWeb(csvContent, filename);
      return true;
    } else if (Platform.OS === "android") {
      // Android: Use cache directory and share
      console.log("[CSV Export] Using Android export");

      // Check permissions
      await checkPermissions();

      try {
        // Try cache directory first (always available)
        const cacheDir = FileSystem.cacheDirectory;
        if (!cacheDir) {
          throw new Error("Cache directory not available");
        }

        const fileUri = `${cacheDir}${filename}`;
        console.log("[CSV Export] Writing to cache directory:", fileUri);

        await FileSystem.writeAsStringAsync(fileUri, csvContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        console.log("[CSV Export] File written successfully to:", fileUri);

        // Share the file
        console.log("[CSV Export] Checking if sharing is available...");
        const sharingAvailable = await Sharing.isAvailableAsync();
        console.log("[CSV Export] Sharing available:", sharingAvailable);

        if (sharingAvailable) {
          console.log("[CSV Export] Calling Sharing.shareAsync with URI:", fileUri);
          await Sharing.shareAsync(fileUri, {
            mimeType: "text/csv",
            dialogTitle: "Export Tasks",
          });
          console.log("[CSV Export] Share dialog completed successfully");
          return true;
        } else {
          console.error("[CSV Export] Sharing not available");
          return false;
        }
      } catch (androidError) {
        console.error("[CSV Export] Android export error:", androidError);
        return false;
      }
    } else {
      // iOS: Use documents directory
      console.log("[CSV Export] Using iOS export");

      try {
        const documentsDir = FileSystem.documentDirectory;
        if (!documentsDir) {
          throw new Error("Documents directory not available");
        }

        const fileUri = `${documentsDir}${filename}`;
        console.log("[CSV Export] Writing to documents directory:", fileUri);

        await FileSystem.writeAsStringAsync(fileUri, csvContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        console.log("[CSV Export] File written successfully");

        // Share the file
        console.log("[CSV Export] Checking if sharing is available...");
        const sharingAvailable = await Sharing.isAvailableAsync();
        console.log("[CSV Export] Sharing available:", sharingAvailable);

        if (sharingAvailable) {
          console.log("[CSV Export] Calling Sharing.shareAsync with URI:", fileUri);
          await Sharing.shareAsync(fileUri, {
            mimeType: "text/csv",
            dialogTitle: "Export Tasks",
            UTI: "public.comma-separated-values-text",
          });
          console.log("[CSV Export] Share dialog completed successfully");
          return true;
        } else {
          console.error("[CSV Export] Sharing not available");
          return false;
        }
      } catch (iosError) {
        console.error("[CSV Export] iOS export error:", iosError);
        return false;
      }
    }
  } catch (error) {
    console.error("[CSV Export] FATAL ERROR:", error);
    if (error instanceof Error) {
      console.error("[CSV Export] Error message:", error.message);
      console.error("[CSV Export] Error stack:", error.stack);
    }
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
    console.log("[JSON Export] Starting export for", tasks.length, "tasks on", Platform.OS);

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
      console.log("[JSON Export] Using web download");
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
    } else if (Platform.OS === "android") {
      // Android: Use cache directory and share
      console.log("[JSON Export] Using Android export");

      // Check permissions
      await checkPermissions();

      try {
        const cacheDir = FileSystem.cacheDirectory;
        if (!cacheDir) {
          throw new Error("Cache directory not available");
        }

        const fileUri = `${cacheDir}${filename}`;
        console.log("[JSON Export] Writing to cache directory:", fileUri);

        await FileSystem.writeAsStringAsync(fileUri, jsonContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        console.log("[JSON Export] File written successfully");

        const sharingAvailable = await Sharing.isAvailableAsync();
        console.log("[JSON Export] Sharing available:", sharingAvailable);

        if (sharingAvailable) {
          await Sharing.shareAsync(fileUri, {
            mimeType: "application/json",
            dialogTitle: "Export Tasks",
          });
          console.log("[JSON Export] Share dialog completed successfully");
          return true;
        } else {
          console.error("[JSON Export] Sharing not available");
          return false;
        }
      } catch (androidError) {
        console.error("[JSON Export] Android export error:", androidError);
        return false;
      }
    } else {
      // iOS: Use documents directory
      console.log("[JSON Export] Using iOS export");

      try {
        const documentsDir = FileSystem.documentDirectory;
        if (!documentsDir) {
          throw new Error("Documents directory not available");
        }

        const fileUri = `${documentsDir}${filename}`;
        console.log("[JSON Export] Writing to documents directory:", fileUri);

        await FileSystem.writeAsStringAsync(fileUri, jsonContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        console.log("[JSON Export] File written successfully");

        const sharingAvailable = await Sharing.isAvailableAsync();
        console.log("[JSON Export] Sharing available:", sharingAvailable);

        if (sharingAvailable) {
          await Sharing.shareAsync(fileUri, {
            mimeType: "application/json",
            dialogTitle: "Export Tasks",
          });
          console.log("[JSON Export] Share dialog completed successfully");
          return true;
        } else {
          console.error("[JSON Export] Sharing not available");
          return false;
        }
      } catch (iosError) {
        console.error("[JSON Export] iOS export error:", iosError);
        return false;
      }
    }
  } catch (error) {
    console.error("[JSON Export] FATAL ERROR:", error);
    if (error instanceof Error) {
      console.error("[JSON Export] Error message:", error.message);
      console.error("[JSON Export] Error stack:", error.stack);
    }
    return false;
  }
}
