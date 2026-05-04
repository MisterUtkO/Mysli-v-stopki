import {
  ConfigPlugin,
  withAndroidManifest,
  withDangerousMod,
} from "@expo/config-plugins";
import * as fs from "fs";
import * as path from "path";

const withAndroidWidget: ConfigPlugin = (config) => {
  // Get the actual Android package from config
  const androidPackage = (config.android?.package as string) || "space.manus.eisenhower.priority.app.t20260205144419";
  const packagePath = androidPackage.replace(/\./g, "/");

  console.log(`[with-android-widget] Android package from config: ${androidPackage}`);

  // Step 1: Add <receiver> to AndroidManifest.xml
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const application = manifest.application?.[0];

    if (!application) return config;

    if (!application.receiver) {
      application.receiver = [];
    }

    // Check if receiver already added
    const alreadyAdded = application.receiver.some(
      (r: any) => r.$?.["android:name"] === ".widget.QuickTaskWidget"
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
                $: {
                  "android:name": "android.appwidget.action.APPWIDGET_UPDATE",
                },
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
      } as any);
      console.log(`[with-android-widget] Added QuickTaskWidget receiver to manifest`);
    }

    return config;
  });

  // Step 2: Copy native widget files
  config = withDangerousMod(config, [
    "android",
    (config) => {
      const projectRoot = config.modRequest.projectRoot;

      const androidResDir = path.join(projectRoot, "android/app/src/main/res");
      const androidJavaDir = path.join(projectRoot, `android/app/src/main/java/${packagePath}/widget`);
      const sourceDir = path.join(projectRoot, "plugins/widget-files");

      console.log(`[with-android-widget] Creating widget at: ${androidJavaDir}`);

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
          needsReplace: false,
        },
        {
          src: "res/layout/widget_quick_task.xml",
          dest: path.join(androidResDir, "layout/widget_quick_task.xml"),
          needsReplace: false,
        },
        {
          src: "res/drawable/widget_button_background.xml",
          dest: path.join(androidResDir, "drawable/widget_button_background.xml"),
          needsReplace: false,
        },
        {
          src: "QuickTaskWidget.kt",
          dest: path.join(androidJavaDir, "QuickTaskWidget.kt"),
          needsReplace: true,
        },
      ];

      for (const file of filesToCopy) {
        const srcPath = path.join(sourceDir, file.src);
        if (fs.existsSync(srcPath)) {
          let content = fs.readFileSync(srcPath, "utf-8");

          // Replace package placeholders in Kotlin file
          if (file.needsReplace) {
            // Replace all variations of the old package with the new one
            content = content.replace(
              /space\.manus\.eisenhower\.priority\.app\.xt?20260205144419/g,
              androidPackage
            );
            console.log(`[with-android-widget] Replaced package in ${file.src} with: ${androidPackage}`);
          }

          fs.writeFileSync(file.dest, content, "utf-8");
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

export default withAndroidWidget;
