import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface QuadrantColors {
  q1: string; // Q1 - Important & Urgent (default: #FF6B6B red)
  q2: string; // Q2 - Important & Not Urgent (default: #FFA94D orange)
  q3: string; // Q3 - Not Important & Urgent (default: #74C0FC blue)
  q4: string; // Q4 - Not Important & Not Urgent (default: #51CF66 green)
}

export interface NotificationSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  vibrationPattern: 'short' | 'long' | 'multiple'; // short, long, or multiple taps
  vibrationIntensity: 'light' | 'medium' | 'heavy'; // light, medium, heavy
  soundType: 'bell' | 'chime' | 'beep' | 'notification'; // different sound presets
}

export interface DeadlineHighlightSettings {
  expiredTaskColor: string; // Color for overdue tasks (default: #FF6B6B red)
  expiringTaskColor: string; // Color for tasks expiring soon (default: #FFA94D orange)
  expiringThresholdDays: number; // Days until expiring (default: 3)
  animationEnabled: boolean; // Pulsing animation for highlighted tasks
  animationSpeed: 'slow' | 'normal' | 'fast'; // Animation speed
}

export interface CustomizationContextType {
  quadrantColors: QuadrantColors;
  setQuadrantColors: (colors: QuadrantColors) => void;
  notificationSettings: NotificationSettings;
  setNotificationSettings: (settings: NotificationSettings) => void;
  deadlineHighlightSettings: DeadlineHighlightSettings;
  setDeadlineHighlightSettings: (settings: DeadlineHighlightSettings) => void;
  resetToDefaults: () => void;
}

const DEFAULT_QUADRANT_COLORS: QuadrantColors = {
  q1: '#FF6B6B', // Red
  q2: '#FFA94D', // Orange
  q3: '#74C0FC', // Blue
  q4: '#51CF66', // Green
};

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  vibrationPattern: 'short',
  vibrationIntensity: 'medium',
  soundType: 'notification',
};

const DEFAULT_DEADLINE_HIGHLIGHT_SETTINGS: DeadlineHighlightSettings = {
  expiredTaskColor: '#FF6B6B', // Red
  expiringTaskColor: '#FFA94D', // Orange
  expiringThresholdDays: 3,
  animationEnabled: true,
  animationSpeed: 'normal',
};

const CustomizationContext = createContext<CustomizationContextType | undefined>(undefined);

export function CustomizationProvider({ children }: { children: React.ReactNode }) {
  const [quadrantColors, setQuadrantColors] = useState<QuadrantColors>(DEFAULT_QUADRANT_COLORS);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(
    DEFAULT_NOTIFICATION_SETTINGS
  );
  const [deadlineHighlightSettings, setDeadlineHighlightSettings] =
    useState<DeadlineHighlightSettings>(DEFAULT_DEADLINE_HIGHLIGHT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [colorsStr, notificationsStr, deadlineStr] = await Promise.all([
        AsyncStorage.getItem('customization_quadrant_colors'),
        AsyncStorage.getItem('customization_notification_settings'),
        AsyncStorage.getItem('customization_deadline_highlight_settings'),
      ]);

      if (colorsStr) {
        setQuadrantColors(JSON.parse(colorsStr));
      }
      if (notificationsStr) {
        setNotificationSettings(JSON.parse(notificationsStr));
      }
      if (deadlineStr) {
        setDeadlineHighlightSettings(JSON.parse(deadlineStr));
      }
    } catch (error) {
      console.error('Failed to load customization settings:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const handleSetQuadrantColors = async (colors: QuadrantColors) => {
    setQuadrantColors(colors);
    try {
      await AsyncStorage.setItem('customization_quadrant_colors', JSON.stringify(colors));
    } catch (error) {
      console.error('Failed to save quadrant colors:', error);
    }
  };

  const handleSetNotificationSettings = async (settings: NotificationSettings) => {
    setNotificationSettings(settings);
    try {
      await AsyncStorage.setItem('customization_notification_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  };

  const handleSetDeadlineHighlightSettings = async (settings: DeadlineHighlightSettings) => {
    setDeadlineHighlightSettings(settings);
    try {
      await AsyncStorage.setItem('customization_deadline_highlight_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save deadline highlight settings:', error);
    }
  };

  const resetToDefaults = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem('customization_quadrant_colors'),
        AsyncStorage.removeItem('customization_notification_settings'),
        AsyncStorage.removeItem('customization_deadline_highlight_settings'),
      ]);
      setQuadrantColors(DEFAULT_QUADRANT_COLORS);
      setNotificationSettings(DEFAULT_NOTIFICATION_SETTINGS);
      setDeadlineHighlightSettings(DEFAULT_DEADLINE_HIGHLIGHT_SETTINGS);
    } catch (error) {
      console.error('Failed to reset customization settings:', error);
    }
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <CustomizationContext.Provider
      value={{
        quadrantColors,
        setQuadrantColors: handleSetQuadrantColors,
        notificationSettings,
        setNotificationSettings: handleSetNotificationSettings,
        deadlineHighlightSettings,
        setDeadlineHighlightSettings: handleSetDeadlineHighlightSettings,
        resetToDefaults,
      }}
    >
      {children}
    </CustomizationContext.Provider>
  );
}

export function useCustomization() {
  const context = useContext(CustomizationContext);
  if (!context) {
    throw new Error('useCustomization must be used within CustomizationProvider');
  }
  return context;
}
