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

export default function SettingsScreen() {
  const { settings, updateSettings, exportTasks, importTasks, clearAllData } =
    useTaskContext();
  const colorScheme = useColorScheme();

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
      // In a real app, you'd share this or save to file
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
      {/* Header */}
      <View className="mb-4">
        <Text className="text-3xl font-bold text-foreground">Settings</Text>
        <Text className="text-sm text-muted mt-1">
          Customize your experience
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Theme Section */}
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

        {/* Scoring Weights */}
        <View className="bg-surface rounded-lg p-4 border border-border mb-4">
          <Text className="text-sm font-semibold text-foreground mb-3">
            Scoring Weights
          </Text>
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
                <View className="flex-row justify-between mb-1">
                  <Text className="text-xs text-muted">{label}</Text>
                  <Text className="text-xs font-semibold text-foreground">
                    {weights[key].toFixed(2)}
                  </Text>
                </View>
                <TextInput
                  value={weights[key].toString()}
                  onChangeText={(val) => {
                    const num = parseFloat(val) || 0;
                    setWeights((prev) => ({
                      ...prev,
                      [key]: Math.max(0, Math.min(1, num)),
                    }));
                  }}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  className="bg-background border border-border rounded px-3 py-2 text-foreground"
                  placeholderTextColor="#9BA1A6"
                />
              </View>
            ))}
          </View>
        </View>

        {/* Thresholds */}
        <View className="bg-surface rounded-lg p-4 border border-border mb-4">
          <Text className="text-sm font-semibold text-foreground mb-3">
            Thresholds
          </Text>
          <Text className="text-xs text-muted mb-3">
            Scores at or above these values are considered "true"
          </Text>

          <View className="gap-3">
            {[
              { key: "importanceThreshold" as const, label: "Importance Threshold" },
              { key: "urgencyThreshold" as const, label: "Urgency Threshold" },
            ].map(({ key, label }) => (
              <View key={key}>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-xs text-muted">{label}</Text>
                  <Text className="text-xs font-semibold text-foreground">
                    {thresholds[key]}/10
                  </Text>
                </View>
                <TextInput
                  value={thresholds[key].toString()}
                  onChangeText={(val) => {
                    const num = parseInt(val) || 1;
                    setThresholds((prev) => ({
                      ...prev,
                      [key]: Math.max(1, Math.min(10, num)),
                    }));
                  }}
                  keyboardType="number-pad"
                  placeholder="1"
                  className="bg-background border border-border rounded px-3 py-2 text-foreground"
                  placeholderTextColor="#9BA1A6"
                />
              </View>
            ))}
          </View>
        </View>

        {/* Save Settings Button */}
        <Pressable
          onPress={handleSaveSettings}
          disabled={loading}
          style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
          className="bg-primary rounded-lg py-3 items-center mb-4"
        >
          <Text className="text-white font-semibold">
            {loading ? "Saving..." : "Save Settings"}
          </Text>
        </Pressable>

        {/* Data Management */}
        <View className="bg-surface rounded-lg p-4 border border-border mb-4">
          <Text className="text-sm font-semibold text-foreground mb-3">
            Data Management
          </Text>

          <Pressable
            onPress={handleExport}
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            className="bg-background border border-border rounded-lg py-3 px-4 mb-2"
          >
            <Text className="text-foreground font-semibold text-center">
              📥 Export Tasks (JSON)
            </Text>
          </Pressable>

          <Pressable
            onPress={handleClearData}
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            className="bg-error/10 border border-error rounded-lg py-3 px-4"
          >
            <Text className="text-error font-semibold text-center">
              🗑 Clear All Data
            </Text>
          </Pressable>
        </View>

        {/* About */}
        <View className="bg-surface rounded-lg p-4 border border-border mb-6">
          <Text className="text-sm font-semibold text-foreground mb-2">About</Text>
          <Text className="text-xs text-muted mb-2">
            Eisenhower Priority App
          </Text>
          <Text className="text-xs text-muted mb-2">Version 1.0.0</Text>
          <Text className="text-xs text-muted">
            A task prioritization app based on the Eisenhower Matrix with advanced
            10-point metric scoring.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
