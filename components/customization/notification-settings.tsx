import React from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { useCustomization } from '@/lib/context/customization-context';
import { useI18n } from '@/lib/context/i18n-context';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';

export function NotificationSettings() {
  const { notificationSettings, setNotificationSettings } = useCustomization();
  const { language } = useI18n();
  const isRu = language === 'ru';
  const colors = useColors();

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
  };

  const handleVibrationIntensityChange = (intensity: 'light' | 'medium' | 'heavy') => {
    setNotificationSettings({
      ...notificationSettings,
      vibrationIntensity: intensity,
    });
  };

  const handleSoundTypeChange = (soundType: 'bell' | 'chime' | 'beep' | 'notification') => {
    setNotificationSettings({
      ...notificationSettings,
      soundType,
    });
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <Text className="text-2xl font-bold text-foreground mb-6">
          {isRu ? 'Уведомления' : 'Notifications'}
        </Text>

        {/* Sound Settings */}
        <View className="bg-surface rounded-lg p-4 mb-6 border border-border">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-foreground">
              {isRu ? 'Звук' : 'Sound'}
            </Text>
            <Switch
              value={notificationSettings.soundEnabled}
              onValueChange={handleToggleSound}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          {notificationSettings.soundEnabled && (
            <View className="gap-2">
              <Text className="text-sm text-muted mb-2">
                {isRu ? 'Тип звука' : 'Sound Type'}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {soundTypes.map((sound) => (
                  <Pressable
                    key={sound.value}
                    onPress={() => handleSoundTypeChange(sound.value)}
                    className={`flex-1 min-w-[45%] p-3 rounded-lg items-center justify-center border-2 ${
                      notificationSettings.soundType === sound.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border'
                    }`}
                  >
                    <Text className="text-2xl mb-1">{sound.emoji}</Text>
                    <Text className="text-xs text-foreground text-center">{sound.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Vibration Settings */}
        <View className="bg-surface rounded-lg p-4 mb-6 border border-border">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-foreground">
              {isRu ? 'Вибрация' : 'Vibration'}
            </Text>
            <Switch
              value={notificationSettings.vibrationEnabled}
              onValueChange={handleToggleVibration}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          {notificationSettings.vibrationEnabled && (
            <View className="gap-4">
              {/* Vibration Pattern */}
              <View>
                <Text className="text-sm text-muted mb-2">
                  {isRu ? 'Паттерн вибрации' : 'Vibration Pattern'}
                </Text>
                <View className="flex-row gap-2">
                  {vibrationPatterns.map((pattern) => (
                    <Pressable
                      key={pattern.value}
                      onPress={() => handleVibrationPatternChange(pattern.value)}
                      className={`flex-1 p-3 rounded-lg items-center justify-center border-2 ${
                        notificationSettings.vibrationPattern === pattern.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border'
                      }`}
                    >
                      <Text className="text-lg mb-1">{pattern.emoji}</Text>
                      <Text className="text-xs text-foreground text-center">{pattern.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Vibration Intensity */}
              <View>
                <Text className="text-sm text-muted mb-2">
                  {isRu ? 'Интенсивность' : 'Intensity'}
                </Text>
                <View className="flex-row gap-2">
                  {vibrationIntensities.map((intensity) => (
                    <Pressable
                      key={intensity.value}
                      onPress={() => handleVibrationIntensityChange(intensity.value)}
                      className={`flex-1 p-3 rounded-lg items-center justify-center border-2 ${
                        notificationSettings.vibrationIntensity === intensity.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border'
                      }`}
                    >
                      <Text className="text-lg mb-1">{intensity.emoji}</Text>
                      <Text className="text-xs text-foreground text-center">{intensity.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Info */}
        <View className="bg-primary/10 rounded-lg p-4 border border-primary/30">
          <Text className="text-sm text-foreground">
            {isRu
              ? 'Эти настройки применяются ко всем уведомлениям приложения. Вы также можете настроить уведомления для каждой задачи отдельно.'
              : 'These settings apply to all app notifications. You can also customize notifications for individual tasks.'}
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
