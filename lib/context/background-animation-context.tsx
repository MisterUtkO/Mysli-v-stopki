import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BackgroundAnimationType } from "@/components/animated-background";

interface BackgroundAnimationSettings {
  animationType: BackgroundAnimationType;
  speed: number; // 0.5 to 2.0
  intensity: number; // 0.2 to 1.0
}

interface BackgroundAnimationContextType {
  settings: BackgroundAnimationSettings;
  updateAnimationType: (type: BackgroundAnimationType) => Promise<void>;
  updateSpeed: (speed: number) => Promise<void>;
  updateIntensity: (intensity: number) => Promise<void>;
  isLoading: boolean;
}

const BackgroundAnimationContext = createContext<
  BackgroundAnimationContextType | undefined
>(undefined);

const STORAGE_KEY = "background_animation_settings";

const DEFAULT_SETTINGS: BackgroundAnimationSettings = {
  animationType: "none",
  speed: 1.0,
  intensity: 0.5,
};

export const BackgroundAnimationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [settings, setSettings] = useState<BackgroundAnimationSettings>(
    DEFAULT_SETTINGS
  );
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from storage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setSettings({
            animationType: parsed.animationType || DEFAULT_SETTINGS.animationType,
            speed: Math.max(0.5, Math.min(2.0, parsed.speed || DEFAULT_SETTINGS.speed)),
            intensity: Math.max(0.2, Math.min(1.0, parsed.intensity || DEFAULT_SETTINGS.intensity)),
          });
        }
      } catch (error) {
        console.error("Failed to load background animation settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const saveSettings = async (newSettings: BackgroundAnimationSettings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error("Failed to save background animation settings:", error);
    }
  };

  const updateAnimationType = async (type: BackgroundAnimationType) => {
    await saveSettings({ ...settings, animationType: type });
  };

  const updateSpeed = async (speed: number) => {
    const clampedSpeed = Math.max(0.5, Math.min(2.0, speed));
    await saveSettings({ ...settings, speed: clampedSpeed });
  };

  const updateIntensity = async (intensity: number) => {
    const clampedIntensity = Math.max(0.2, Math.min(1.0, intensity));
    await saveSettings({ ...settings, intensity: clampedIntensity });
  };

  return (
    <BackgroundAnimationContext.Provider
      value={{
        settings,
        updateAnimationType,
        updateSpeed,
        updateIntensity,
        isLoading,
      }}
    >
      {children}
    </BackgroundAnimationContext.Provider>
  );
};

export const useBackgroundAnimation = (): BackgroundAnimationContextType => {
  const context = useContext(BackgroundAnimationContext);
  if (!context) {
    throw new Error(
      "useBackgroundAnimation must be used within BackgroundAnimationProvider"
    );
  }
  return context;
};
