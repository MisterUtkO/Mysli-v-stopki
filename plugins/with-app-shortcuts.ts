import { ConfigPlugin } from "@expo/config-plugins";
import {
  withAndroidManifest,
  withInfoPlist,
} from "@expo/config-plugins";
import type { ExpoConfig } from "@expo/config";

/**
 * Expo Config Plugin for App Shortcuts (iOS) and App Shortcuts + Widgets (Android)
 * Adds native support for quick access to app features via long-press on app icon
 */

const withAppShortcuts: ConfigPlugin = (config: any) => {
  // Android: Add App Shortcuts to AndroidManifest.xml
  config = withAndroidManifest(config, async (androidConfig: any) => {
    const manifest = androidConfig.modResults;

    // Ensure application element exists
    if (!manifest.manifest.application) {
      manifest.manifest.application = [{}];
    }

    const application = manifest.manifest.application[0];

    // Add meta-data for app shortcuts
    if (!application["meta-data"]) {
      application["meta-data"] = [];
    }

    // Shortcuts metadata
    const shortcutsMetadata = {
      $: {
        "android:name": "android.app.shortcuts",
        "android:resource": "@xml/shortcuts",
      },
    };

    // Check if shortcuts metadata already exists
    const hasShortcuts = application["meta-data"].some(
      (m: any) => m.$["android:name"] === "android.app.shortcuts"
    );

    if (!hasShortcuts) {
      application["meta-data"].push(shortcutsMetadata);
    }

    return androidConfig;
  });

  // iOS: Add app shortcuts support via Info.plist
  config = withInfoPlist(config, async (iosConfig: any) => {
    const plist = iosConfig.modResults;

    // Add support for app shortcuts (iOS 13+)
    if (!plist.UIApplicationShortcutItems) {
      plist.UIApplicationShortcutItems = [
        {
          UIApplicationShortcutItemType: "com.thoughts-in-stacks.create-task",
          UIApplicationShortcutItemTitle: "Создать задачу",
          UIApplicationShortcutItemSubtitle: "Быстро добавить новую задачу",
          UIApplicationShortcutItemIconType: "UIApplicationShortcutIconTypeAdd",
        },
        {
          UIApplicationShortcutItemType: "com.thoughts-in-stacks.view-matrix",
          UIApplicationShortcutItemTitle: "Матрица",
          UIApplicationShortcutItemSubtitle: "Просмотр матрицы Эйзенхауэра",
          UIApplicationShortcutItemIconType: "UIApplicationShortcutIconTypeShare",
        },
        {
          UIApplicationShortcutItemType: "com.thoughts-in-stacks.view-kanban",
          UIApplicationShortcutItemTitle: "Канбан",
          UIApplicationShortcutItemSubtitle: "Просмотр канбан доски",
          UIApplicationShortcutItemIconType: "UIApplicationShortcutIconTypeShare",
        },
      ];
    }

    return iosConfig;
  });

  return config;
};

export default withAppShortcuts;
