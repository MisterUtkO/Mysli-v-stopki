import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Platform } from 'react-native';
import { useCustomization } from '@/lib/context/customization-context';
import { useI18n } from '@/lib/context/i18n-context';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';

// Sound file map — WAV files generated programmatically
const SOUND_FILES: Record<string, number> = {
  bell: require('@/assets/sounds/bell.wav'),
  chime: require('@/assets/sounds/chime.wav'),
  beep: require('@/assets/sounds/beep.wav'),
  notification: require('@/assets/sounds/notification.wav'),
};

export function NotificationSettings() {
  const { notificationSettings, setNotificationSettings } = useCustomization();
  const { language } = useI18n();
  const isRu = language === 'ru';
  const colors = useColors();
  const [demoPlaying, setDemoPlaying] = useState(false);

  // Audio players for each sound
  const bellPlayer = useAudioPlayer(SOUND_FILES.bell);
  const chimePlayer = useAudioPlayer(SOUND_FILES.chime);
  const beepPlayer = useAudioPlayer(SOUND_FILES.beep);
  const notifPlayer = useAudioPlayer(SOUND_FILES.notification);

  const players: Record<string, typeof bellPlayer> = {
    bell: bellPlayer,
    chime: chimePlayer,
    beep: beepPlayer,
    notification: notifPlayer,
  };

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
    { value: 'chime' as const, label: isRu ? 'Перезвон' : 'Chime', emoji: '🎵' },
    { value: 'beep' as const, label: isRu ? 'Бип' : 'Beep', emoji: '📢' },
    { value: 'notification' as const, label: isRu ? 'Уведомление' : 'Notification', emoji: '📲' },
  ];

  const handleToggleSound = (value: boolean) => {
    setNotificationSettings({ ...notificationSettings, soundEnabled: value });
  };

  const handleToggleVibration = (value: boolean) => {
    setNotificationSettings({ ...notificationSettings, vibrationEnabled: value });
  };

  const handleVibrationPatternChange = (pattern: 'short' | 'long' | 'multiple') => {
    setNotificationSettings({ ...notificationSettings, vibrationPattern: pattern });
    playDemoVibration(pattern, notificationSettings.vibrationIntensity);
  };

  const handleVibrationIntensityChange = (intensity: 'light' | 'medium' | 'heavy') => {
    setNotificationSettings({ ...notificationSettings, vibrationIntensity: intensity });
    playDemoVibration(notificationSettings.vibrationPattern, intensity);
  };

  const handleSoundTypeChange = (soundType: 'bell' | 'chime' | 'beep' | 'notification') => {
    setNotificationSettings({ ...notificationSettings, soundType });
    playDemoSound(soundType);
  };

  const playDemoSound = useCallback(async (soundType: string) => {
    if (demoPlaying) return;
    setDemoPlaying(true);
    try {
      if (Platform.OS !== 'web') {
        await setAudioModeAsync({ playsInSilentMode: true });
      }
      const player = players[soundType];
      if (player) {
        player.seekTo(0);
        player.play();
      }
    } catch (e) {
      console.error('Failed to play demo sound:', e);
    }
    setTimeout(() => setDemoPlaying(false), 800);
  }, [demoPlaying, players]);

  const playDemoVibration = async (pattern: string, intensity: string) => {
    if (Platform.OS === 'web') return;
    try {
      const hapticStyle =
        intensity === 'light'
          ? Haptics.ImpactFeedbackStyle.Light
          : intensity === 'medium'
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Heavy;

      await Haptics.impactAsync(hapticStyle);

      if (pattern === 'long') {
        await new Promise(r => setTimeout(r, 120));
        await Haptics.impactAsync(hapticStyle);
      } else if (pattern === 'multiple') {
        await new Promise(r => setTimeout(r, 100));
        await Haptics.impactAsync(hapticStyle);
        await new Promise(r => setTimeout(r, 100));
        await Haptics.impactAsync(hapticStyle);
      }
    } catch (e) {
      console.error('Failed to play demo vibration:', e);
    }
  };

  const cardStyle = {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  } as const;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        style={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Sound Section ── */}
        <View style={cardStyle}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 20 }}>🔔</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
                {isRu ? 'Звук' : 'Sound'}
              </Text>
            </View>
            <Switch
              value={notificationSettings.soundEnabled}
              onValueChange={handleToggleSound}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          {notificationSettings.soundEnabled && (
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4, fontWeight: '600', letterSpacing: 0.5 }}>
                {isRu ? 'ТИП ЗВУКА — нажмите для прослушивания' : 'SOUND TYPE — tap to preview'}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {soundTypes.map((sound) => {
                  const isSelected = notificationSettings.soundType === sound.value;
                  return (
                    <Pressable
                      key={sound.value}
                      onPress={() => handleSoundTypeChange(sound.value)}
                      style={({ pressed }) => ({
                        flex: 1,
                        paddingVertical: 14,
                        paddingHorizontal: 4,
                        borderRadius: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 2,
                        borderColor: isSelected ? colors.primary : colors.border,
                        backgroundColor: isSelected ? `${colors.primary}18` : colors.background,
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      <Text style={{ fontSize: 22, marginBottom: 4 }}>{sound.emoji}</Text>
                      <Text style={{ fontSize: 10, color: isSelected ? colors.primary : colors.foreground, textAlign: 'center', fontWeight: isSelected ? '700' : '500' }}>
                        {sound.label}
                      </Text>
                      {isSelected && (
                        <Text style={{ fontSize: 8, color: colors.primary, marginTop: 2 }}>▶ {isRu ? 'играет' : 'plays'}</Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        {/* ── Vibration Section ── */}
        <View style={cardStyle}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 20 }}>📳</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
                {isRu ? 'Вибрация' : 'Vibration'}
              </Text>
            </View>
            <Switch
              value={notificationSettings.vibrationEnabled}
              onValueChange={handleToggleVibration}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          {notificationSettings.vibrationEnabled && (
            <View style={{ gap: 20 }}>
              {/* Pattern */}
              <View>
                <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8, fontWeight: '600', letterSpacing: 0.5 }}>
                  {isRu ? 'ПАТТЕРН — нажмите для демонстрации' : 'PATTERN — tap to feel'}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {vibrationPatterns.map((pattern) => {
                    const isSelected = notificationSettings.vibrationPattern === pattern.value;
                    return (
                      <Pressable
                        key={pattern.value}
                        onPress={() => handleVibrationPatternChange(pattern.value)}
                        style={({ pressed }) => ({
                          flex: 1,
                          paddingVertical: 14,
                          borderRadius: 10,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: 2,
                          borderColor: isSelected ? colors.primary : colors.border,
                          backgroundColor: isSelected ? `${colors.primary}18` : colors.background,
                          opacity: pressed ? 0.7 : 1,
                        })}
                      >
                        <Text style={{ fontSize: 18, marginBottom: 4 }}>{pattern.emoji}</Text>
                        <Text style={{ fontSize: 11, color: isSelected ? colors.primary : colors.foreground, textAlign: 'center', fontWeight: isSelected ? '700' : '500' }}>
                          {pattern.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Intensity */}
              <View>
                <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8, fontWeight: '600', letterSpacing: 0.5 }}>
                  {isRu ? 'ИНТЕНСИВНОСТЬ' : 'INTENSITY'}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {vibrationIntensities.map((intensity) => {
                    const isSelected = notificationSettings.vibrationIntensity === intensity.value;
                    return (
                      <Pressable
                        key={intensity.value}
                        onPress={() => handleVibrationIntensityChange(intensity.value)}
                        style={({ pressed }) => ({
                          flex: 1,
                          paddingVertical: 14,
                          borderRadius: 10,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: 2,
                          borderColor: isSelected ? colors.primary : colors.border,
                          backgroundColor: isSelected ? `${colors.primary}18` : colors.background,
                          opacity: pressed ? 0.7 : 1,
                        })}
                      >
                        <Text style={{ fontSize: 18, marginBottom: 4 }}>{intensity.emoji}</Text>
                        <Text style={{ fontSize: 11, color: isSelected ? colors.primary : colors.foreground, textAlign: 'center', fontWeight: isSelected ? '700' : '500' }}>
                          {intensity.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>
          )}
        </View>

        {/* ── Info ── */}
        <View style={{ backgroundColor: `${colors.primary}12`, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: `${colors.primary}25` }}>
          <Text style={{ fontSize: 13, color: colors.foreground, lineHeight: 18 }}>
            {isRu
              ? '💡 Нажмите на тип звука, чтобы услышать его. Нажмите на паттерн вибрации, чтобы почувствовать его на устройстве.'
              : '💡 Tap a sound type to hear it. Tap a vibration pattern to feel it on your device.'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
