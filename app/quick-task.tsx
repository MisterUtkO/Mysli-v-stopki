// app/quick-task.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";

import { useTaskContext } from "@/lib/context/task-context";
import { useI18n } from "@/lib/context/i18n-context";
import { useColors } from "@/hooks/use-colors";
import { QuickTaskHandler } from "@/lib/integrations/widget/quick-task-handler";
import { WidgetSync } from "@/lib/integrations/widget/widget-sync";
import type { QuickTaskInput } from "@/lib/integrations/widget/quick-task-handler";

const QUICK_TASK_DEFAULTS = {
  DEFAULT_IMPORTANCE: 5,
  DEFAULT_URGENCY: 5,
};

export default function QuickTaskScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { createTask, tasks } = useTaskContext();
  const { t, language } = useI18n();
  const colors = useColors();

  const [title, setTitle] = useState("");
  const [importance, setImportance] = useState(
    QUICK_TASK_DEFAULTS.DEFAULT_IMPORTANCE
  );
  const [urgency, setUrgency] = useState(
    QUICK_TASK_DEFAULTS.DEFAULT_URGENCY
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const isRu = language === "ru";

  // Load pending task from widget on mount
  useEffect(() => {
    const loadPendingTask = async () => {
      try {
        const pendingTask = await QuickTaskHandler.getPendingTask();

        if (pendingTask) {
          console.log("[QuickTask] Found pending task from widget:", pendingTask);
          setTitle(pendingTask.title);
          setImportance(pendingTask.importance);
          setUrgency(pendingTask.urgency);
          await QuickTaskHandler.clearPendingTask();
        }
      } catch (error) {
        console.error("[QuickTask] Failed to load pending task:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPendingTask();
  }, []);

  const handleCreateTask = async () => {
    try {
      // Validate
      if (!title.trim()) {
        Alert.alert(
          isRu ? "Ошибка" : "Error",
          isRu ? "Введите название задачи" : "Please enter a task title"
        );
        return;
      }

      setIsSaving(true);

      // Create task
      const newTask = await createTask({
        title: title.trim(),
        description: title.trim(), // For quick task, use title as description
        importance: Math.round(importance),
        urgency: Math.round(urgency),
        status: "not_started",
      });

      console.log("[QuickTask] Task created successfully:", newTask.id);

      // Sync to widget
      await WidgetSync.syncTasksToWidget([...tasks, newTask]);

      // Show success message
      Alert.alert(
        isRu ? "✅ Готово" : "✅ Done",
        isRu ? "Задача создана успешно!" : "Task created successfully!",
        [
          {
            text: isRu ? "ОК" : "OK",
            onPress: () => {
              // Close the quick task screen without launching main app
              if (Platform.OS === "android") {
                // On Android, use back action to close widget without launching app
                router.back();
              } else {
                router.dismiss();
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("[QuickTask] Failed to create task:", error);
      const errorMsg =
        error instanceof Error ? error.message : "Unknown error";
      Alert.alert(
        isRu ? "Ошибка" : "Error",
        isRu ? `Ошибка создания: ${errorMsg}` : `Failed to create: ${errorMsg}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: Math.max(insets.top, 16),
      }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 16,
          paddingBottom: Math.max(insets.bottom, 16),
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: colors.foreground,
              marginBottom: 8,
            }}
          >
            {isRu ? "⚡ Быстрая задача" : "⚡ Quick Task"}
          </Text>
          <Text style={{ fontSize: 14, color: colors.muted }}>
            {isRu
              ? "Создайте задачу за несколько секунд"
              : "Create a task in seconds"}
          </Text>
        </View>

        {/* Title Input */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: colors.foreground,
              marginBottom: 8,
            }}
          >
            {isRu ? "Название" : "Title"}
          </Text>
          <TextInput
            style={{
              borderWidth: 2,
              borderColor: colors.border,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
              color: colors.foreground,
              backgroundColor: colors.surface,
            }}
            placeholder={isRu ? "Что нужно сделать?" : "What to do?"}
            placeholderTextColor={colors.muted}
            value={title}
            onChangeText={setTitle}
            editable={!isSaving}
            maxLength={100}
          />
          <Text
            style={{
              fontSize: 12,
              color: colors.muted,
              marginTop: 4,
              textAlign: "right",
            }}
          >
            {title.length}/100
          </Text>
        </View>

        {/* Importance Slider */}
        <View style={{ marginBottom: 20 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.foreground,
              }}
            >
              {isRu ? "🎯 Важность" : "🎯 Importance"}
            </Text>
            <View
              style={{
                backgroundColor: colors.primary,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 14 }}>
                {Math.round(importance)}/7
              </Text>
            </View>
          </View>
          <Slider
            style={{ height: 40 }}
            minimumValue={1}
            maximumValue={7}
            step={1}
            value={importance}
            onValueChange={setImportance}
            disabled={isSaving}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
          />
        </View>

        {/* Urgency Slider */}
        <View style={{ marginBottom: 24 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.foreground,
              }}
            >
              {isRu ? "⏰ Срочность" : "⏰ Urgency"}
            </Text>
            <View
              style={{
                backgroundColor: colors.primary,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 14 }}>
                {Math.round(urgency)}/7
              </Text>
            </View>
          </View>
          <Slider
            style={{ height: 40 }}
            minimumValue={1}
            maximumValue={7}
            step={1}
            value={urgency}
            onValueChange={setUrgency}
            disabled={isSaving}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
          />
        </View>

        {/* Create Button */}
        <Pressable
          onPress={handleCreateTask}
          disabled={isSaving}
          style={({ pressed }) => ({
            backgroundColor: colors.primary,
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: "center",
            opacity: pressed || isSaving ? 0.7 : 1,
            marginBottom: 12,
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
          })}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={{ fontSize: 16 }}>✅</Text>
          )}
          <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 16 }}>
            {isSaving
              ? isRu
                ? "Сохранение..."
                : "Saving..."
              : isRu
                ? "Создать задачу"
                : "Create Task"}
          </Text>
        </Pressable>

        {/* Cancel Button */}
        <Pressable
          onPress={() => {
            // Close the quick task screen without launching main app
            if (Platform.OS === "android") {
              router.back();
            } else {
              router.dismiss();
            }
          }}
          disabled={isSaving}
          style={({ pressed }) => ({
            backgroundColor: colors.surface,
            borderWidth: 2,
            borderColor: colors.border,
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: "center",
            opacity: pressed || isSaving ? 0.7 : 1,
          })}
        >
          <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 16 }}>
            {isRu ? "Отмена" : "Cancel"}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
