import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
  Switch,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useTaskContext } from "@/lib/context/task-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { NotificationSettingsComponent } from "@/components/notification-settings";

export default function SettingsScreen() {
  const { settings, updateSettings, exportTasks, importTasks, clearAllData } =
    useTaskContext();
  const colorScheme = useColorScheme();
  const [activeTab, setActiveTab] = useState<"general" | "notifications">("general");

  const [weights, setWeights] = useState(settings?.weights || {
    wImportance: 0.30,
    wUrgency: 0.25,
    wImpact: 0.25,
    wRisk: 0.15,
    wEffort: 0.05,
  });

  const [thresholds, setThresholds] = useState(settings?.thresholds || {
    importanceThreshold: 6,
    urgencyThreshold: 6,
  });

  const [theme, setTheme] = useState(settings?.theme || "system");
  const [loading, setLoading] = useState(false);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await updateSettings({
        weights,
        thresholds,
        theme,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Settings saved successfully");
    } catch (error) {
      console.error("Failed to save settings:", error);
      Alert.alert("Error", "Failed to save settings");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const data = await exportTasks();
      Alert.alert("Export Successful", `Exported ${data.split("\n").length} lines of data`);
    } catch (error) {
      console.error("Failed to export tasks:", error);
      Alert.alert("Error", "Failed to export tasks");
    }
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to delete all tasks and reset settings? This cannot be undone.",
      [
        { text: "Cancel", onPress: () => {} },
        {
          text: "Clear",
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              await clearAllData();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert("Success", "All data has been cleared");
            } catch (error) {
              console.error("Failed to clear data:", error);
              Alert.alert("Error", "Failed to clear data");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <ScreenContainer className="p-4 pb-0">
      <View className="mb-4">
        <Text className="text-3xl font-bold text-foreground">Settings</Text>
        <Text className="text-sm text-muted mt-1">Customize your experience</Text>
      </View>

      <View className="flex-row gap-2 mb-4">
        <Pressable
          onPress={() => setActiveTab("general")}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          className={`flex-1 py-2 px-3 rounded-lg border ${
            activeTab === "general"
              ? "bg-primary border-primary"
              : "bg-surface border-border"
          }`}
        >
          <Text
            className={`text-sm font-semibold text-center ${
              activeTab === "general" ? "text-background" : "text-foreground"
            }`}
          >
            General
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("notifications")}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          className={`flex-1 py-2 px-3 rounded-lg border ${
            activeTab === "notifications"
              ? "bg-primary border-primary"
              : "bg-surface border-border"
          }`}
        >
          <Text
            className={`text-sm font-semibold text-center ${
              activeTab === "notifications" ? "text-background" : "text-foreground"
            }`}
          >
            🔔 Notifications
          </Text>
        </Pressable>
      </View>

      {activeTab === "general" ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="bg-surface rounded-lg p-4 border border-border mb-4">
            <Text className="text-sm font-semibold text-foreground mb-3">Theme</Text>
            <View className="gap-2">
              {(["light", "dark", "system"] as const).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setTheme(t)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                >
                  <View
                    className={`px-4 py-3 rounded-lg border flex-row items-center justify-between ${
                      theme === t
                        ? "bg-primary border-primary"
                        : "bg-background border-border"
                    }`}
                  >
                    <Text
                      className={`font-medium capitalize ${
                        theme === t ? "text-white" : "text-foreground"
                      }`}
                    >
                      {t === "system" ? "System" : t === "light" ? "Light" : "Dark"}
                    </Text>
                    {theme === t && <Text className="text-white">✓</Text>}
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="bg-surface rounded-lg p-4 border border-border mb-4">
            <Text className="text-sm font-semibold text-foreground mb-3">Scoring Weights</Text>
            <Text className="text-xs text-muted mb-3">
              Adjust how each metric affects priority score (total should equal 1.0)
            </Text>
            <View className="gap-3">
              {[
                { key: "wImportance" as const, label: "Importance Weight" },
                { key: "wUrgency" as const, label: "Urgency Weight" },
                { key: "wImpact" as const, label: "Impact Weight" },
                { key: "wRisk" as const, label: "Risk Weight" },
                { key: "wEffort" as const, label: "Effort Weight" },
              ].map(({ key, label }) => (
                <View key={key}>
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm text-foreground">{label}</Text>
                    <Text className="text-sm font-semibold text-primary">
                      {(weights[key] * 100).toFixed(0)}%
                    </Text>
                  </View>
                  <TextInput
                    value={String(weights[key])}
                    onChangeText={(val) => {
                      const num = parseFloat(val) || 0;
                      setWeights({ ...weights, [key]: Math.min(1, Math.max(0, num)) });
                    }}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                  />
                </View>
              ))}
            </View>
          </View>

          <View className="bg-surface rounded-lg p-4 border border-border mb-4">
            <Text className="text-sm font-semibold text-foreground mb-3">Thresholds</Text>
            <Text className="text-xs text-muted mb-3">
              Set importance and urgency thresholds (1-10)
            </Text>
            <View className="gap-3">
              {[
                { key: "importanceThreshold" as const, label: "Importance Threshold" },
                { key: "urgencyThreshold" as const, label: "Urgency Threshold" },
              ].map(({ key, label }) => (
                <View key={key}>
                  <Text className="text-sm text-foreground mb-2">{label}</Text>
                  <TextInput
                    value={String(thresholds[key])}
                    onChangeText={(val) => {
                      const num = parseInt(val) || 0;
                      setThresholds({ ...thresholds, [key]: Math.min(10, Math.max(1, num)) });
                    }}
                    keyboardType="number-pad"
                    placeholder="6"
                    className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                  />
                </View>
              ))}
            </View>
          </View>

          <Pressable
            onPress={handleSaveSettings}
            disabled={loading}
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            className="bg-primary rounded-lg py-3 px-4 items-center mb-4"
          >
            <Text className="text-background font-semibold">
              {loading ? "Saving..." : "Save Settings"}
            </Text>
          </Pressable>

          <View className="bg-surface rounded-lg p-4 border border-border mb-4">
            <Text className="text-sm font-semibold text-foreground mb-3">Data Management</Text>
            <View className="gap-2">
              <Pressable
                onPress={handleExport}
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                className="bg-blue-500 rounded-lg py-2 px-4 items-center"
              >
                <Text className="text-white font-semibold">📥 Export Tasks (JSON)</Text>
              </Pressable>
              <Pressable
                onPress={handleClearData}
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                className="bg-red-500 rounded-lg py-2 px-4 items-center"
              >
                <Text className="text-white font-semibold">🗑 Clear All Data</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      ) : (
        <NotificationSettingsComponent />
      )}
    </ScreenContainer>
  );
}
