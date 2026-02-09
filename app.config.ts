import "./scripts/load-env.js";
import type { ExpoConfig } from "expo/config";

const rawBundleId = "space.manus.eisenhower.priority.app.t20260205144419";
const bundleId =
  rawBundleId
    .replace(/[-_]/g, ".")
    .replace(/[^a-zA-Z0-9.]/g, "")
    .replace(/\.+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .toLowerCase()
    .split(".")
    .map((segment) => {
      return /^[a-zA-Z]/.test(segment) ? segment : "x" + segment;
    })
    .join(".") || "space.manus.app";

const timestamp = bundleId.split(".").pop()?.replace(/^t/, "") ?? "";
const schemeFromBundleId = `manus${timestamp}`;

const env = {
  appName: "Eisenhower Priority",
  appSlug: "eisenhower-priority-app",
  logoUrl: "https://private-us-east-1.manuscdn.com/sessionFile/Q0865UgNBa0ZNtDqP9s0RM/sandbox/gFASVsMOCmv7Y4pj1EI6Qf-img-1_1770321085000_na1fn_aWNvbg.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvUTA4NjVVZ05CYTBaTnREcVA5czBSTS9zYW5kYm94L2dGQVNWc01PQ212N1k0cGoxRUk2UWYtaW1nLTFfMTc3MDMyMTA4NTAwMF9uYTFmbl9hV052YmcucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=iYZcjSfO7c~BdCv8SzuyUwydXRUXqVCoctOvuLmjfpet1~igWcwyKZG0cldewK-i2CvRcVq76fWDtduWOg9P2PRW5huKBqaVvHBJsKFNiEjtpc~J55Y-xLDw1BrEv5ISDptVZaLOfKH~cBQcjB1SEFMZ8ZZB9xrsCPbIk82DG65FI2DBt49I1dyEpbQNL0R0drlLlhWdVVpxmvRscOnnxMtRvwJNYSWcoCTMMD3K2AaVMslkS8f9wtCuAX4ce7sXjYo5gdAM7vnR~up6YvNtE-FiRJI3DDxiX2kdNj3JquefW-bQDWd0Hlh9BQJ4-zXdlaLv85pSr7lwV6h8WA82sg__",
  scheme: schemeFromBundleId,
  iosBundleId: bundleId,
  androidPackage: bundleId,
};

const config: ExpoConfig = {
  name: env.appName,
  slug: env.appSlug,
  version: "1.0.0",
  description: "A task prioritization app based on the Eisenhower Matrix",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: env.scheme,
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: env.iosBundleId,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSCalendarsUsageDescription: "Allow $(PRODUCT_NAME) to access your calendar for task scheduling.",
      NSRemindersUsageDescription: "Allow $(PRODUCT_NAME) to send you reminders about your tasks.",
      NSPhotoLibraryUsageDescription: "Allow $(PRODUCT_NAME) to access your photo library.",
      NSDocumentsFolderUsageDescription: "Allow $(PRODUCT_NAME) to access your documents for data export.",
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#FFFFFF",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: env.androidPackage,
    permissions: [
      "POST_NOTIFICATIONS",
      "READ_CALENDAR",
      "WRITE_CALENDAR",
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE",
      "SCHEDULE_EXACT_ALARM",
    ],
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: env.scheme,
            host: "*",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  extra: {
    eas: {
      projectId: "eisenhower-priority-app",
    },
  },
  plugins: [
    "expo-router",
    [
      "expo-audio",
      {
        microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone.",
      },
    ],
    [
      "expo-video",
      {
        supportsBackgroundPlayback: true,
        supportsPictureInPicture: true,
      },
    ],
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#151718",
        },
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          buildArchs: ["armeabi-v7a", "arm64-v8a"],
          minSdkVersion: 24,
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  owner: "manus",
  runtimeVersion: "1.0.0",
};

export default config;
