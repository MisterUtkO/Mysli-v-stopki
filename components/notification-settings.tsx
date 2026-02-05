import { ScrollView, Text, View, Switch, Pressable, Alert } from "react-native";
import { useTaskContext } from "@/lib/context/task-context";
import type { NotificationSettings } from "@/lib/services/notification-service";
import { cn } from "@/lib/utils";
import * as Haptics from "expo-haptics";

export function NotificationSettingsComponent() {
  const { notificationSettings, updateNotificationSettings, sendTestNotification } = useTaskContext();

  if (!notificationSettings) {
    return (
      <View className="p-4">
        <Text className="text-muted">Loading notification settings...</Text>
      </View>
    );
  }

  const handleToggle = async (key: keyof NotificationSettings, value: boolean) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await updateNotificationSettings({ [key]: value });
    } catch (error) {
      Alert.alert("Error", "Failed to update notification settings");
    }
  };

  const handleReminderTimeChange = async (minutes: number) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await updateNotificationSettings({ reminderTime: minutes });
    } catch (error) {
      Alert.alert("Error", "Failed to update reminder time");
    }
  };

  const handleTestNotification = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await sendTestNotification();
      Alert.alert("Success", "Test notification sent! Check your device.");
    } catch (error) {
      Alert.alert("Error", "Failed to send test notification");
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4 gap-6">
        {/* Main Toggle */}
        <View className="bg-surface rounded-lg p-4 gap-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-lg font-semibold text-foreground">Enable Notifications</Text>
              <Text className="text-sm text-muted mt-1">
                Receive reminders for your tasks
              </Text>
            </View>
            <Switch
              value={notificationSettings.enabled}
              onValueChange={(value) => handleToggle("enabled", value)}
              trackColor={{ false: "#ccc", true: "#81c784" }}
            />
          </View>
        </View>

        {notificationSettings.enabled && (
          <>
            {/* Quadrant Selection */}
            <View className="bg-surface rounded-lg p-4 gap-3">
              <Text className="text-base font-semibold text-foreground">Notify for Quadrants</Text>

              <View className="gap-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-foreground">Q1 - Do Now</Text>
                    <Text className="text-xs text-muted">Urgent & Important</Text>
                  </View>
                  <Switch
                    value={notificationSettings.q1Enabled}
                    onValueChange={(value) => handleToggle("q1Enabled", value)}
                    trackColor={{ false: "#ccc", true: "#ef4444" }}
                  />
                </View>

                <View className="h-px bg-border" />

                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-foreground">Q2 - Schedule</Text>
                    <Text className="text-xs text-muted">Important, Not Urgent</Text>
                  </View>
                  <Switch
                    value={notificationSettings.q2Enabled}
                    onValueChange={(value) => handleToggle("q2Enabled", value)}
                    trackColor={{ false: "#ccc", true: "#f59e0b" }}
                  />
                </View>

                <View className="h-px bg-border" />

                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-foreground">Q3 - Delegate</Text>
                    <Text className="text-xs text-muted">Urgent, Not Important</Text>
                  </View>
                  <Switch
                    value={notificationSettings.q3Enabled}
                    onValueChange={(value) => handleToggle("q3Enabled", value)}
                    trackColor={{ false: "#ccc", true: "#3b82f6" }}
                  />
                </View>
              </View>
            </View>

            {/* Reminder Time */}
            <View className="bg-surface rounded-lg p-4 gap-3">
              <Text className="text-base font-semibold text-foreground">Reminder Time</Text>
              <Text className="text-sm text-muted">
                Notify before task due date
              </Text>

              <View className="flex-row gap-2 flex-wrap">
                {[15, 30, 60, 120, 1440].map((minutes) => (
                  <Pressable
                    key={minutes}
                    onPress={() => handleReminderTimeChange(minutes)}
                    style={({ pressed }) => [
                      {
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                    className={cn(
                      "px-3 py-2 rounded-full border",
                      notificationSettings.reminderTime === minutes
                        ? "bg-primary border-primary"
                        : "bg-transparent border-border"
                    )}
                  >
                    <Text
                      className={cn(
                        "text-sm font-medium",
                        notificationSettings.reminderTime === minutes
                          ? "text-background"
                          : "text-foreground"
                      )}
                    >
                      {minutes === 15 ? "15m" : minutes === 30 ? "30m" : minutes === 60 ? "1h" : minutes === 120 ? "2h" : "1d"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Test Notification */}
            <View className="bg-surface rounded-lg p-4">
              <Pressable
                onPress={handleTestNotification}
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                className="bg-primary rounded-lg py-3 px-4 items-center"
              >
                <Text className="text-background font-semibold">📬 Send Test Notification</Text>
              </Pressable>
              <Text className="text-xs text-muted text-center mt-2">
                Send a test notification to verify settings
              </Text>
            </View>

            {/* Info */}
            <View className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
              <Text className="text-xs text-blue-900 dark:text-blue-100 leading-relaxed">
                💡 Notifications are scheduled based on your task's due date and priority. Tasks without due dates won't trigger notifications.
              </Text>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}
