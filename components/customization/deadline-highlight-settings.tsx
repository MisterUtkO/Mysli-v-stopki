import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch } from 'react-native';
import { useCustomization } from '@/lib/context/customization-context';
import { useI18n } from '@/lib/context/i18n-context';
import { useColors } from '@/hooks/use-colors';

export function DeadlineHighlightSettings() {
  const { deadlineHighlightSettings, setDeadlineHighlightSettings } = useCustomization();
  const { language } = useI18n();
  const isRu = language === 'ru';
  const colors = useColors();

  const colorPresets = [
    '#FF6B6B', // Red
    '#FFA94D', // Orange
    '#FFD93D', // Yellow
    '#74C0FC', // Blue
    '#51CF66', // Green
    '#A78BFA', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
  ];

  const animationSpeeds = [
    { value: 'slow' as const, label: isRu ? 'Медленная' : 'Slow', emoji: '🐢' },
    { value: 'normal' as const, label: isRu ? 'Нормальная' : 'Normal', emoji: '🚶' },
    { value: 'fast' as const, label: isRu ? 'Быстрая' : 'Fast', emoji: '🏃' },
  ];

  const thresholdOptions = [
    { value: 1, label: isRu ? '1 день' : '1 day' },
    { value: 3, label: isRu ? '3 дня' : '3 days' },
    { value: 7, label: isRu ? '1 неделя' : '1 week' },
    { value: 14, label: isRu ? '2 недели' : '2 weeks' },
  ];

  const handleExpiredColorChange = (color: string) => {
    setDeadlineHighlightSettings({
      ...deadlineHighlightSettings,
      expiredTaskColor: color,
    });
  };

  const handleExpiringColorChange = (color: string) => {
    setDeadlineHighlightSettings({
      ...deadlineHighlightSettings,
      expiringTaskColor: color,
    });
  };

  const handleThresholdChange = (days: number) => {
    setDeadlineHighlightSettings({
      ...deadlineHighlightSettings,
      expiringThresholdDays: days,
    });
  };

  const handleAnimationToggle = (value: boolean) => {
    setDeadlineHighlightSettings({
      ...deadlineHighlightSettings,
      animationEnabled: value,
    });
  };

  const handleAnimationSpeedChange = (speed: 'slow' | 'normal' | 'fast') => {
    setDeadlineHighlightSettings({
      ...deadlineHighlightSettings,
      animationSpeed: speed,
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }} style={{ padding: 16 }}>

        {/* Expired Tasks Color */}
        <View className="bg-surface rounded-lg p-4 mb-6 border border-border">
          <Text className="text-lg font-semibold text-foreground mb-3">
            {isRu ? 'Цвет истёкших задач' : 'Expired Tasks Color'}
          </Text>
          <View className="flex-row items-center gap-3 mb-4">
            <View
              className="w-12 h-12 rounded-lg border-2"
              style={{
                backgroundColor: deadlineHighlightSettings.expiredTaskColor,
                borderColor: colors.border,
              }}
            />
            <Text className="text-sm text-muted font-mono">
              {deadlineHighlightSettings.expiredTaskColor}
            </Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {colorPresets.map((color) => (
              <Pressable
                key={color}
                onPress={() => handleExpiredColorChange(color)}
                className="w-12 h-12 rounded-lg border-2 items-center justify-center"
                style={{
                  backgroundColor: color,
                  borderColor:
                    deadlineHighlightSettings.expiredTaskColor === color
                      ? colors.primary
                      : colors.border,
                  borderWidth:
                    deadlineHighlightSettings.expiredTaskColor === color ? 3 : 2,
                }}
              >
                {deadlineHighlightSettings.expiredTaskColor === color && (
                  <Text className="text-lg">✓</Text>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Expiring Tasks Color */}
        <View className="bg-surface rounded-lg p-4 mb-6 border border-border">
          <Text className="text-lg font-semibold text-foreground mb-3">
            {isRu ? 'Цвет задач с близким сроком' : 'Expiring Soon Color'}
          </Text>
          <View className="flex-row items-center gap-3 mb-4">
            <View
              className="w-12 h-12 rounded-lg border-2"
              style={{
                backgroundColor: deadlineHighlightSettings.expiringTaskColor,
                borderColor: colors.border,
              }}
            />
            <Text className="text-sm text-muted font-mono">
              {deadlineHighlightSettings.expiringTaskColor}
            </Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {colorPresets.map((color) => (
              <Pressable
                key={color}
                onPress={() => handleExpiringColorChange(color)}
                className="w-12 h-12 rounded-lg border-2 items-center justify-center"
                style={{
                  backgroundColor: color,
                  borderColor:
                    deadlineHighlightSettings.expiringTaskColor === color
                      ? colors.primary
                      : colors.border,
                  borderWidth:
                    deadlineHighlightSettings.expiringTaskColor === color ? 3 : 2,
                }}
              >
                {deadlineHighlightSettings.expiringTaskColor === color && (
                  <Text className="text-lg">✓</Text>
                )}
              </Pressable>
            ))}
          </View>

          {/* Threshold */}
          <Text className="text-sm text-muted mt-4 mb-2">
            {isRu ? 'Считать задачу близкой к сроку через' : 'Consider task expiring soon in'}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {thresholdOptions.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => handleThresholdChange(option.value)}
                className={`px-3 py-2 rounded-lg border-2 ${
                  deadlineHighlightSettings.expiringThresholdDays === option.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border'
                }`}
              >
                <Text className="text-sm text-foreground font-semibold">{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Animation Settings */}
        <View className="bg-surface rounded-lg p-4 mb-6 border border-border">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-foreground">
              {isRu ? 'Анимация подсветки' : 'Highlight Animation'}
            </Text>
            <Switch
              value={deadlineHighlightSettings.animationEnabled}
              onValueChange={handleAnimationToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          {deadlineHighlightSettings.animationEnabled && (
            <View>
              <Text className="text-sm text-muted mb-2">
                {isRu ? 'Скорость анимации' : 'Animation Speed'}
              </Text>
              <View className="flex-row gap-2">
                {animationSpeeds.map((speed) => (
                  <Pressable
                    key={speed.value}
                    onPress={() => handleAnimationSpeedChange(speed.value)}
                    className={`flex-1 p-3 rounded-lg items-center justify-center border-2 ${
                      deadlineHighlightSettings.animationSpeed === speed.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border'
                    }`}
                  >
                    <Text className="text-lg mb-1">{speed.emoji}</Text>
                    <Text className="text-xs text-foreground text-center">{speed.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Preview */}
        <View className="bg-primary/10 rounded-lg p-4 border border-primary/30">
          <Text className="text-sm font-semibold text-foreground mb-2">
            {isRu ? 'Предпросмотр' : 'Preview'}
          </Text>
          <View className="gap-2">
            <View
              className="p-3 rounded-lg border-2"
              style={{
                backgroundColor: deadlineHighlightSettings.expiredTaskColor,
                borderColor: colors.border,
              }}
            >
              <Text className="text-sm text-white">
                {isRu ? 'Истёкшая задача' : 'Expired Task'}
              </Text>
            </View>
            <View
              className="p-3 rounded-lg border-2"
              style={{
                backgroundColor: deadlineHighlightSettings.expiringTaskColor,
                borderColor: colors.border,
              }}
            >
              <Text className="text-sm text-white">
                {isRu ? 'Задача с близким сроком' : 'Expiring Soon Task'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
