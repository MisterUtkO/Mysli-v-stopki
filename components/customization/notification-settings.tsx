import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert, Platform } from 'react-native';
import { useCustomization } from '@/lib/context/customization-context';
import { useI18n } from '@/lib/context/i18n-context';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';

export function NotificationSettings() {
  const { notificationSettings, setNotificationSettings } = useCustomization();
  const { language } = useI18n();
  const isRu = language === 'ru';
  const colors = useColors();
  const [demoPlaying, setDemoPlaying] = useState(false);

  const vibrationPatterns = [
    { value: 'short' as const, label: isRu ? 'Короткое' : 'Short', emoji: '📳' },
    { value: 'long' as const, label: isRu ? 'Длинное' : 'Long', emoji: '📳📳' },
    { value: 'multiple' as const, label: isRu ? 'Многократное' : 'Multiple', emoji: '📳📳📳' },
  ];

  const vibrationIntensities = [
    { value: 'light' as const, label: isRu ? 'Слабая' : 'Light', emoji: '1️⃣' },
    { value: 'medium' as const, label: isRu ? 'Средняя' : 'Medium', emoji: '2️⃣' },
    { value: 'heavy' as const, label: isRu ? 'Сильная' : 'Heavy', emoji: '3️⃣' },
  ];

  const soundTypes = [
    { value: 'bell' as const, label: isRu ? 'Звонок' : 'Bell', emoji: '🔔' },
    { value: 'chime' as const, label: isRu ? 'Звон' : 'Chime', emoji: '🎵' },
    { value: 'beep' as const, label: isRu ? 'Бип' : 'Beep', emoji: '📢' },
    { value: 'notification' as const, label: isRu ? 'Уведомление' : 'Notification', emoji: '📲' },
  ];

  const handleToggleSound = (value: boolean) => {
    setNotificationSettings({
      ...notificationSettings,
      soundEnabled: value,
    });
  };

  const handleToggleVibration = (value: boolean) => {
    setNotificationSettings({
      ...notificationSettings,
      vibrationEnabled: value,
    });
  };

  const handleVibrationPatternChange = (pattern: 'short' | 'long' | 'multiple') => {
    setNotificationSettings({
      ...notificationSettings,
      vibrationPattern: pattern,
    });
    playDemoVibration(pattern, notificationSettings.vibrationIntensity);
  };

  const handleVibrationIntensityChange = (intensity: 'light' | 'medium' | 'heavy') => {
    setNotificationSettings({
      ...notificationSettings,
      vibrationIntensity: intensity,
    });
    playDemoVibration(notificationSettings.vibrationPattern, intensity);
  };

  const handleSoundTypeChange = (soundType: 'bell' | 'chime' | 'beep' | 'notification') => {
    setNotificationSettings({
      ...notificationSettings,
      soundType,
    });
    playDemoSound(soundType);
  };

  const playDemoSound = async (soundType: string) => {
    if (Platform.OS !== 'web') {
      setDemoPlaying(true);
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {
        console.error('Failed to play demo sound:', e);
      }
      setTimeout(() => setDemoPlaying(false), 500);
    }
  };

  const playDemoVibration = async (pattern: string, intensity: string) => {
    if (Platform.OS !== 'web') {
      setDemoPlaying(true);
      try {
        if (intensity === 'light') {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else if (intensity === 'medium') {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
        
        if (pattern === 'long') {
          await new Promise(r => setTimeout(r, 100));
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else if (pattern === 'multiple') {
          await new Promise(r => setTimeout(r, 100));
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await new Promise(r => setTimeout(r, 100));
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      } catch (e) {
        console.error('Failed to play demo vibration:', e);
      }
      setTimeout(() => setDemoPlaying(false), 500);
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <Text className="text-2xl font-bold text-foreground mb-6">
          {isRu ? 'Звуки и вибрация' : 'Sounds & Vibration'}
        </Text>

        {/* Sound Settings */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
              {isRu ? 'Звук' : 'Sound'}
            </Text>
            <Switch
              value={notificationSettings.soundEnabled}
              onValueChange={handleToggleSound}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          {notificationSettings.soundEnabled && (
            <View style={{ gap: 12 }}>
              <Text style={{ fontSize: 13, color: colors.muted }}>
                {isRu ? 'Тип звука' : 'Sound Type'}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' }}>
                {soundTypes.map((sound) => (
                  <Pressable
                    key={sound.value}
                    onPress={() => handleSoundTypeChange(sound.value)}
                    style={{
                      flex: 1,
                      minWidth: '22%',
                      padding: 12,
                      borderRadius: 8,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 2,
                      borderColor: notificationSettings.soundType === sound.value ? colors.primary : colors.border,
                      backgroundColor: notificationSettings.soundType === sound.value ? `${colors.primary}20` : colors.surface,
                    }}
                  >
                    <Text style={{ fontSize: 20, marginBottom: 4 }}>{sound.emoji}</Text>
                    <Text style={{ fontSize: 11, color: colors.foreground, textAlign: 'center', fontWeight: '500' }}>{sound.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Vibration Settings */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
              {isRu ? 'Вибрация' : 'Vibration'}
            </Text>
            <Switch
              value={notificationSettings.vibrationEnabled}
              onValueChange={handleToggleVibration}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          {notificationSettings.vibrationEnabled && (
            <View style={{ gap: 20 }}>
              {/* Vibration Pattern */}
              <View>
                <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 12 }}>
                  {isRu ? 'Паттерн вибрации' : 'Vibration Pattern'}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'space-between' }}>
                  {vibrationPatterns.map((pattern) => (
                    <Pressable
                      key={pattern.value}
                      onPress={() => handleVibrationPatternChange(pattern.value)}
                      style={{
                        flex: 1,
                        padding: 12,
                        borderRadius: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 2,
                        borderColor: notificationSettings.vibrationPattern === pattern.value ? colors.primary : colors.border,
                        backgroundColor: notificationSettings.vibrationPattern === pattern.value ? `${colors.primary}20` : colors.surface,
                      }}
                    >
                      <Text style={{ fontSize: 18, marginBottom: 4 }}>{pattern.emoji}</Text>
                      <Text style={{ fontSize: 11, color: colors.foreground, textAlign: 'center', fontWeight: '500' }}>{pattern.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Vibration Intensity */}
              <View>
                <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 12 }}>
                  {isRu ? 'Интенсивность' : 'Intensity'}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'space-between' }}>
                  {vibrationIntensities.map((intensity) => (
                    <Pressable
                      key={intensity.value}
                      onPress={() => handleVibrationIntensityChange(intensity.value)}
                      style={{
                        flex: 1,
                        padding: 12,
                        borderRadius: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 2,
                        borderColor: notificationSettings.vibrationIntensity === intensity.value ? colors.primary : colors.border,
                        backgroundColor: notificationSettings.vibrationIntensity === intensity.value ? `${colors.primary}20` : colors.surface,
                      }}
                    >
                      <Text style={{ fontSize: 18, marginBottom: 4 }}>{intensity.emoji}</Text>
                      <Text style={{ fontSize: 11, color: colors.foreground, textAlign: 'center', fontWeight: '500' }}>{intensity.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={{ backgroundColor: `${colors.primary}15`, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: `${colors.primary}30` }}>
          <Text style={{ fontSize: 13, color: colors.foreground }}>
            {isRu
              ? 'Эти настройки применяются ко всем уведомлениям приложения. Выберите параметр, чтобы услышать демонстрацию.'
              : 'These settings apply to all app notifications. Select an option to hear a demo.'}
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
