const {
  withAndroidManifest,
  withDangerousMod,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const withAndroidWidget = (config) => {
  // Step 1: Add <receiver> and <activity> to AndroidManifest.xml
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const application = manifest.application?.[0];
    if (!application) return config;

    // Add QuickTaskWidget receiver if not exists
    if (!application.receiver) {
      application.receiver = [];
    }
    const alreadyAdded = application.receiver.some(
      (r) => r.$?.["android:name"] === ".widget.QuickTaskWidget"
    );
    if (!alreadyAdded) {
      application.receiver.push({
        $: {
          "android:name": ".widget.QuickTaskWidget",
          "android:exported": "true",
        },
        "intent-filter": [
          {
            action: [
              {
                $: { "android:name": "android.appwidget.action.APPWIDGET_UPDATE" },
              },
            ],
          },
        ],
        "meta-data": [
          {
            $: {
              "android:name": "android.appwidget.provider",
              "android:resource": "@xml/widget_quick_task_info",
            },
          },
        ],
      });
      console.log("[with-android-widget] Added QuickTaskWidget receiver to manifest");
    }

    // Add QuickTaskActivity (native dialog, no main app launch)
    if (!application.activity) {
      application.activity = [];
    }
    const activityAlreadyAdded = application.activity.some(
      (a) => a.$?.["android:name"] === ".widget.QuickTaskActivity"
    );
    if (!activityAlreadyAdded) {
      application.activity.push({
        $: {
          "android:name": ".widget.QuickTaskActivity",
          "android:theme": "@android:style/Theme.Dialog",
          "android:exported": "false",
          "android:noHistory": "true",
          "android:excludeFromRecents": "true",
        },
      });
      console.log("[with-android-widget] Added QuickTaskActivity to manifest");
    }
    return config;
  });

  // Step 2: Copy native widget files
  config = withDangerousMod(config, [
    "android",
    (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const androidResDir = path.join(projectRoot, "android/app/src/main/res");
      const androidJavaDir = path.join(
        projectRoot,
        "android/app/src/main/java/space/manus/eisenhower/priority/app/xt20260205144419/widget"
      );
      const sourceDir = path.join(projectRoot, "plugins/widget-files");

      // Create directories
      fs.mkdirSync(path.join(androidResDir, "xml"), { recursive: true });
      fs.mkdirSync(path.join(androidResDir, "layout"), { recursive: true });
      fs.mkdirSync(path.join(androidResDir, "drawable"), { recursive: true });
      fs.mkdirSync(androidJavaDir, { recursive: true });

      // Files to copy
      const filesToCopy = [
        {
          src: "res/xml/widget_quick_task_info.xml",
          dest: path.join(androidResDir, "xml/widget_quick_task_info.xml"),
        },
        {
          src: "res/layout/widget_quick_task.xml",
          dest: path.join(androidResDir, "layout/widget_quick_task.xml"),
        },
        {
          src: "res/drawable/widget_button_background.xml",
          dest: path.join(androidResDir, "drawable/widget_button_background.xml"),
        },
        {
          src: "QuickTaskWidget.kt",
          dest: path.join(androidJavaDir, "QuickTaskWidget.kt"),
        },
        {
          src: "QuickTaskActivity.kt",
          dest: path.join(androidJavaDir, "QuickTaskActivity.kt"),
        },
      ];

      for (const file of filesToCopy) {
        const srcPath = path.join(sourceDir, file.src);
        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, file.dest);
          console.log(`[with-android-widget] Copied: ${file.src}`);
        } else {
          console.warn(`[with-android-widget] Source not found: ${srcPath}`);
        }
      }
      return config;
    },
  ]);

  return config;
};

module.exports = withAndroidWidget;
