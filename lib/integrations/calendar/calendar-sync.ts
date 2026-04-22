import { Platform } from "react-native";
import * as Calendar from "expo-calendar";

export interface TaskCalendarEvent {
  title: string;
  description?: string;
  startDate: string; // ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ
  endDate?: string; // ISO 8601 format
  taskId: string; // For tracking which task created the event
}

/**
 * Request calendar permissions on Android
 */
export async function requestCalendarPermissions(): Promise<boolean> {
  if (Platform.OS !== "android") {
    return true; // Not needed on iOS/web
  }

  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Failed to request calendar permissions:", error);
    return false;
  }
}

/**
 * Get default calendar ID for the device
 */
export async function getDefaultCalendarId(): Promise<string | null> {
  if (Platform.OS !== "android") {
    return null;
  }

  try {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    if (calendars.length === 0) {
      console.warn("No calendars found on device");
      return null;
    }

    // Find the primary/default calendar
    const primaryCalendar = calendars.find((cal) => cal.isPrimary === true);

    if (primaryCalendar) {
      return primaryCalendar.id;
    }

    // Fallback to first calendar
    return calendars[0].id;
  } catch (error) {
    console.error("Failed to get default calendar:", error);
    return null;
  }
}

/**
 * Create or update a calendar event for a task
 * @param event Task event data
 * @param calendarId Calendar ID to add event to
 * @returns Event ID if successful, null otherwise
 */
export async function syncTaskToCalendar(
  event: TaskCalendarEvent,
  calendarId?: string
): Promise<string | null> {
  if (Platform.OS !== "android") {
    console.log("Calendar sync only available on Android");
    return null;
  }

  try {
    // Request permissions if needed
    const hasPermission = await requestCalendarPermissions();
    if (!hasPermission) {
      console.error("Calendar permissions not granted");
      return null;
    }

    // Get default calendar if not provided
    const targetCalendarId = calendarId || (await getDefaultCalendarId());
    if (!targetCalendarId) {
      console.error("No calendar available for sync");
      return null;
    }

    // Parse dates
    const startDate = new Date(event.startDate);
    if (isNaN(startDate.getTime())) {
      console.error("Invalid start date:", event.startDate);
      return null;
    }

    // Calculate end date (1 hour after start if not provided)
    let endDate = startDate;
    if (event.endDate) {
      endDate = new Date(event.endDate);
    } else {
      endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour
    }

    // Create event object for expo-calendar
    const calendarEvent = {
      title: event.title,
      startDate,
      endDate,
      notes: `${event.description || ""}\n\nTask ID: ${event.taskId}`,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    };

    // Save event
    const eventId = await Calendar.createEventAsync(targetCalendarId, calendarEvent);
    console.log(`Calendar event created: ${eventId}`);
    return eventId;
  } catch (error) {
    console.error("Failed to sync task to calendar:", error);
    return null;
  }
}

/**
 * Find calendar event by task ID
 */
export async function findCalendarEventByTaskId(
  taskId: string
): Promise<any | null> {
  if (Platform.OS !== "android") {
    return null;
  }

  try {
    const hasPermission = await requestCalendarPermissions();
    if (!hasPermission) {
      return null;
    }

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    
    for (const calendar of calendars) {
      const startDate = new Date(2020, 0, 1);
      const endDate = new Date(2030, 11, 31);
      
      const events = await Calendar.getEventsAsync(
        [calendar.id],
        startDate,
        endDate
      );

      const found = events.find((event) =>
        event.notes?.includes(`Task ID: ${taskId}`)
      );
      
      if (found) {
        return found;
      }
    }

    return null;
  } catch (error) {
    console.error("Failed to find calendar event:", error);
    return null;
  }
}

/**
 * Delete calendar event by task ID
 */
export async function deleteCalendarEventByTaskId(
  taskId: string
): Promise<boolean> {
  if (Platform.OS !== "android") {
    return false;
  }

  try {
    const event = await findCalendarEventByTaskId(taskId);
    if (!event) {
      return false;
    }

    await Calendar.deleteEventAsync(event.id);
    console.log(`Calendar event deleted for task ${taskId}`);
    return true;
  } catch (error) {
    console.error("Failed to delete calendar event:", error);
    return false;
  }
}

/**
 * Format task data for calendar export
 */
export function formatTaskForCalendar(task: any): TaskCalendarEvent | null {
  // Only sync if task has a due date
  if (!task.dueDate) {
    return null;
  }

  // Parse due date and time
  let startDate: Date;
  try {
    if (task.dueTime) {
      // Combine date and time
      const dateTimeString = `${task.dueDate}T${task.dueTime}`;
      startDate = new Date(dateTimeString);
    } else {
      // Use date with default time (9:00 AM)
      startDate = new Date(`${task.dueDate}T09:00:00`);
    }

    if (isNaN(startDate.getTime())) {
      console.error("Invalid date format:", task.dueDate, task.dueTime);
      return null;
    }
  } catch (error) {
    console.error("Failed to parse task date:", error);
    return null;
  }

  return {
    title: task.title,
    description: task.description || "",
    startDate: startDate.toISOString(),
    endDate: new Date(startDate.getTime() + 60 * 60 * 1000).toISOString(),
    taskId: task.id,
  };
}
