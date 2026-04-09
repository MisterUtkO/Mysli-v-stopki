import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useCustomization } from '@/lib/context/customization-context';
import { useI18n } from '@/lib/context/i18n-context';
import type { Language } from '@/lib/i18n/translations';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';

export function QuadrantColorsSettings() {
  const { quadrantColors, setQuadrantColors, resetToDefaults } = useCustomization();
  const { t, language } = useI18n();
  const isRu = language === 'ru';
  const colors = useColors();
  const [selectedQuadrant, setSelectedQuadrant] = useState<'q1' | 'q2' | 'q3' | 'q4'>('q1');

  const quadrantInfo = {
    q1: {
      label: isRu ? 'Q1 - Важное и срочное' : 'Q1 - Important & Urgent',
      emoji: '🔴',
    },
    q2: {
      label: isRu ? 'Q2 - Важное, но не срочное' : 'Q2 - Important & Not Urgent',
      emoji: '🟠',
    },
    q3: {
      label: isRu ? 'Q3 - Не важное, но срочное' : 'Q3 - Not Important & Urgent',
      emoji: '🔵',
    },
    q4: {
      label: isRu ? 'Q4 - Не важное и не срочное' : 'Q4 - Not Important & Not Urgent',
      emoji: '🟢',
    },
  };

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

  const handleColorChange = (quadrant: 'q1' | 'q2' | 'q3' | 'q4', color: string) => {
    setQuadrantColors({
      ...quadrantColors,
      [quadrant]: color,
    });
  };

  const handleReset = () => {
    Alert.alert(
      isRu ? 'Сбросить настройки' : 'Reset Settings',
      isRu ? 'Вернуть все цвета по умолчанию?' : 'Reset all colors to default?',
      [
        {
          text: isRu ? 'Отмена' : 'Cancel',
          onPress: () => {},
        },
        {
          text: isRu ? 'Сбросить' : 'Reset',
          onPress: () => resetToDefaults(),
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <Text className="text-2xl font-bold text-foreground mb-6">
          {isRu ? 'Цвета квадрантов' : 'Quadrant Colors'}
        </Text>

        {/* Quadrant selector */}
        <View className="flex-row gap-2 mb-6">
          {(['q1', 'q2', 'q3', 'q4'] as const).map((q) => (
            <Pressable
              key={q}
              onPress={() => setSelectedQuadrant(q)}
              className={`flex-1 p-3 rounded-lg items-center justify-center border-2 ${
                selectedQuadrant === q ? 'border-primary' : 'border-border'
              }`}
              style={{ backgroundColor: quadrantColors[q] }}
            >
              <Text className="text-xl">{quadrantInfo[q].emoji}</Text>
              <Text className="text-xs text-white font-semibold mt-1">{q.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>

        {/* Current quadrant info */}
        <View className="bg-surface rounded-lg p-4 mb-6 border border-border">
          <Text className="text-lg font-semibold text-foreground mb-2">
            {quadrantInfo[selectedQuadrant].label}
          </Text>
          <View className="flex-row items-center gap-2">
            <View
              className="w-12 h-12 rounded-lg border-2"
              style={{
                backgroundColor: quadrantColors[selectedQuadrant],
                borderColor: colors.border,
              }}
            />
            <Text className="text-sm text-muted font-mono">{quadrantColors[selectedQuadrant]}</Text>
          </View>
        </View>

        {/* Color presets */}
        <Text className="text-sm font-semibold text-muted mb-3">
          {isRu ? 'Предустановленные цвета' : 'Preset Colors'}
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {colorPresets.map((color) => (
            <Pressable
              key={color}
              onPress={() => handleColorChange(selectedQuadrant, color)}
              className="w-16 h-16 rounded-lg border-2 items-center justify-center"
              style={{
                backgroundColor: color,
                borderColor:
                  quadrantColors[selectedQuadrant] === color ? colors.primary : colors.border,
                borderWidth: quadrantColors[selectedQuadrant] === color ? 3 : 2,
              }}
            >
              {quadrantColors[selectedQuadrant] === color && (
                <Text className="text-2xl">✓</Text>
              )}
            </Pressable>
          ))}
        </View>

        {/* Reset button */}
        <Pressable
          onPress={handleReset}
          className="bg-error rounded-lg p-4 items-center justify-center mt-auto mb-4"
        >
          <Text className="text-white font-semibold">
            {isRu ? 'Сбросить все цвета' : 'Reset All Colors'}
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
