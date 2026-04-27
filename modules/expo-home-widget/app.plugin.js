const { withAndroidManifest, withPlugins } = require("expo/config-plugins");

module.exports = function withHomeWidget(config) {
  return withPlugins(config, [
    [
      withAndroidManifest,
      (config) => {
        const androidManifest = config.modResults;

        // Ensure application element exists
        if (!androidManifest.manifest.application) {
          androidManifest.manifest.application = [];
        }

        const application = androidManifest.manifest.application[0];

        // Add widget receiver
        if (!application.receiver) {
          application.receiver = [];
        }

        // Check if receiver already exists
        const receiverExists = application.receiver.some(
          (r) => r.$["android:name"] === "expo.homewidget.HomeWidgetProvider"
        );

        if (!receiverExists) {
          application.receiver.push({
            $: {
              "android:name": "expo.homewidget.HomeWidgetProvider",
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
                  "android:resource": "@xml/widget_info",
                },
              },
            ],
          });
        }

        // Add CHANGE_COMPONENT_ENABLED_STATE permission if not present
        if (!androidManifest.manifest["uses-permission"]) {
          androidManifest.manifest["uses-permission"] = [];
        }

        const permissionExists = androidManifest.manifest["uses-permission"].some(
          (p) => p.$["android:name"] === "com.android.launcher.permission.INSTALL_SHORTCUT"
        );

        if (!permissionExists) {
          androidManifest.manifest["uses-permission"].push({
            $: {
              "android:name": "com.android.launcher.permission.INSTALL_SHORTCUT",
            },
          });
        }

        return config;
      },
    ],
  ]);
};
