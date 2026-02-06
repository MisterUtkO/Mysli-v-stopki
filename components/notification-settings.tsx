import { ScrollView, Text, View, Switch, Pressable, Alert } from "react-native";
import { useTaskContext } from "@/lib/context/task-context";
import type { NotificationSettings } from "@/lib/services/notification-service";
import { cn } from "@/lib/utils";
import * as Haptics from "expo-haptics";
import { TimePicker } from "./time-picker";
import { DaySelector } from "./day-selector";
import { useState } from "react";

export function NotificationSettingsComponent() {
  const { notificationSettings, updateNotificationSettings, sendTestNotification } = useTaskContext();
  const [localSettings, setLocalSettings] = useState<NotificationSettings | null>(notificationSettings);

  if (!localSettings) {
    return (
      <View className="p-4">
        <Text className="text-muted">Loading notification settings...</Text>
      </View>
    );
  }

  const handleToggle = async (key: keyof NotificationSettings, value: boolean) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newSettings = { ...localSettings, [key]: value };
      setLocalSettings(newSettings);
      await updateNotificationSettings(newSettings);
    } catch (error) {
      Alert.alert("Error", "Failed to update notification settings");
    }
  };

  const handleReminderTimeChange = async (minutes: number) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newSettings = { ...localSettings, reminderTime: minutes };
      setLocalSettings(newSettings);
      await updateNotificationSettings(newSettings);
    } catch (error) {
      Alert.alert("Error", "Failed to update reminder time");
    }
  };

  const handleDailyReminderTimeChange = async (time: string) => {
    try {
      const newSettings = { ...localSettings, dailyReminderTime: time };
      setLocalSettings(newSettings);
      await updateNotificationSettings(newSettings);
    } catch (error) {
      Alert.alert("Error", "Failed to update daily reminder time");
    }
  };

  const handleDailyReminderDaysChange = async (days: number[]) => {
    try {
      const newSettings = { ...localSettings, dailyReminderDays: days };
      setLocalSettings(newSettings);
      await updateNotificationSettings(newSettings);
    } catch (error) {
      Alert.alert("Error", "Failed to update daily reminder days");
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
              value={localSettings.enabled}
              onValueChange={(value) => handleToggle("enabled", value)}
              trackColor={{ false: "#ccc", true: "#81c784" }}
            />
          </View>
        </View>

        {localSettings.enabled && (
          <>
            {/* Task Reminders Section */}
            <View className="bg-surface rounded-lg p-4 gap-3">
              <Text className="text-base font-semibold text-foreground">Task Reminders</Text>
              <Text className="text-xs text-muted">
                Get notified before task due dates
              </Text>

              <View className="gap-3 mt-2">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-foreground">Q1 - Do Now</Text>
                    <Text className="text-xs text-muted">Urgent & Important</Text>
                  </View>
                  <Switch
                    value={localSettings.q1Enabled}
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
                    value={localSettings.q2Enabled}
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
                    value={localSettings.q3Enabled}
                    onValueChange={(value) => handleToggle("q3Enabled", value)}
                    trackColor={{ false: "#ccc", true: "#3b82f6" }}
                  />
                </View>
              </View>

              <View className="mt-3 pt-3 border-t border-border">
                <Text className="text-sm text-foreground mb-2">Reminder Time Before Due Date</Text>
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
                        localSettings.reminderTime === minutes
                          ? "bg-primary border-primary"
                          : "bg-transparent border-border"
                      )}
                    >
                      <Text
                        className={cn(
                          "text-sm font-medium",
                          localSettings.reminderTime === minutes
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
            </View>

            {/* Daily Reminder Section */}
            <View className="bg-surface rounded-lg p-4 gap-3">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">📋 Daily Review Reminder</Text>
                  <Text className="text-xs text-muted mt-1">
                    Get a summary of your tasks each day
                  </Text>
                </View>
                <Switch
                  value={localSettings.dailyReminderEnabled}
                  onValueChange={(value) => handleToggle("dailyReminderEnabled", value)}
                  trackColor={{ false: "#ccc", true: "#81c784" }}
                />
              </View>

              {localSettings.dailyReminderEnabled && (
                <>
                  <View className="pt-3 border-t border-border gap-3">
                    <TimePicker
                      value={localSettings.dailyReminderTime}
                      onChange={handleDailyReminderTimeChange}
                    />

                    <View className="gap-2">
                      <Text className="text-sm font-medium text-foreground">Days to Remind</Text>
                      <DaySelector
                        selectedDays={localSettings.dailyReminderDays}
                        onChange={handleDailyReminderDaysChange}
                      />
                    </View>
                  </View>
                </>
              )}
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
                💡 Task reminders are sent based on due dates. Daily reminders show a summary of active tasks at your chosen time on selected days.
              </Text>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}
