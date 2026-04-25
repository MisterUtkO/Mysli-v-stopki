/**
 * Deep Link Handler for App Shortcuts and Widgets
 * Processes deep links from shortcuts and widgets
 */

import * as Linking from "expo-linking";

export interface DeepLinkAction {
  action: string;
  params?: Record<string, any>;
}

/**
 * Parse deep link URL and return action
 */
export function parseDeepLink(url: string): DeepLinkAction | null {
  try {
    const parsed = Linking.parse(url);
    const path = parsed.path?.split("/").filter(Boolean) || [];

    if (!path[0]) {
      return null;
    }

    const action = path[0];

    // Extract query parameters
    const params: Record<string, any> = {};
    if (parsed.queryParams) {
      Object.entries(parsed.queryParams).forEach(([key, value]) => {
        if (key === "importance" || key === "urgency") {
          params[key] = parseInt(value as string, 10);
        } else {
          params[key] = value;
        }
      });
    }

    return { action, params: Object.keys(params).length > 0 ? params : undefined };
  } catch (error) {
    console.error("[DeepLink] Failed to parse deep link:", error);
    return null;
  }
}

/**
 * Get initial URL (for when app is launched from deep link)
 */
export async function getInitialURL(): Promise<string | null> {
  try {
    const url = await Linking.getInitialURL();
    if (url != null) {
      return url;
    }
  } catch (error) {
    console.error("[DeepLink] Failed to get initial URL:", error);
  }
  return null;
}

/**
 * Handle app shortcut action
 * Navigate to appropriate screen based on action
 */
export function handleShortcutAction(
  action: string,
  navigate: (screen: string, params?: any) => void
) {
  switch (action) {
    case "create-task":
      navigate("add-task", { fromShortcut: true });
      break;
    case "view-matrix":
      navigate("matrix");
      break;
    case "view-kanban":
      navigate("kanban");
      break;
    case "view-statistics":
      navigate("statistics");
      break;
    default:
      console.warn(`[DeepLink] Unknown action: ${action}`);
  }
}
