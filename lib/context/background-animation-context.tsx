import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type AnimationType = "none" | "hearts" | "stars" | "bubbles" | "snowflakes";
export type IntensityLevel = "never" | "hourly" | "daily" | "weekly" | "every_30_min";

interface BackgroundAnimationContextType {
  animationType: AnimationType;
  setAnimationType: (type: AnimationType) => void;
  speed: number;
  setSpeed: (speed: number) => void;
  intensity: IntensityLevel;
  setIntensity: (intensity: IntensityLevel) => void;
}

const BackgroundAnimationContext = createContext<BackgroundAnimationContextType | undefined>(undefined);

export function BackgroundAnimationProvider({ children }: { children: React.ReactNode }) {
  const [animationType, setAnimationTypeState] = useState<AnimationType>("hearts");
  const [speed, setSpeedState] = useState(1);
  const [intensity, setIntensityState] = useState<IntensityLevel>("daily");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedAnimationType = (await AsyncStorage.getItem("bgAnimationType")) as AnimationType;
        const savedSpeed = await AsyncStorage.getItem("bgAnimationSpeed");
        const savedIntensity = (await AsyncStorage.getItem("bgAnimationIntensity")) as IntensityLevel;

        if (savedAnimationType) setAnimationTypeState(savedAnimationType);
        if (savedSpeed) setSpeedState(parseFloat(savedSpeed));
        if (savedIntensity) setIntensityState(savedIntensity);
      } catch (error) {
        console.error("Failed to load background animation settings:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSettings();
  }, []);

  const setAnimationType = async (type: AnimationType) => {
    setAnimationTypeState(type);
    try {
      await AsyncStorage.setItem("bgAnimationType", type);
    } catch (error) {
      console.error("Failed to save animation type:", error);
    }
  };

  const setSpeed = async (newSpeed: number) => {
    setSpeedState(newSpeed);
    try {
      await AsyncStorage.setItem("bgAnimationSpeed", newSpeed.toString());
    } catch (error) {
      console.error("Failed to save animation speed:", error);
    }
  };

  const setIntensity = async (newIntensity: IntensityLevel) => {
    setIntensityState(newIntensity);
    try {
      await AsyncStorage.setItem("bgAnimationIntensity", newIntensity);
    } catch (error) {
      console.error("Failed to save animation intensity:", error);
    }
  };

  if (!isLoaded) {
    return <>{children}</>;
  }

  return (
    <BackgroundAnimationContext.Provider
      value={{
        animationType,
        setAnimationType,
        speed,
        setSpeed,
        intensity,
        setIntensity,
      }}
    >
      {children}
    </BackgroundAnimationContext.Provider>
  );
}

export function useBackgroundAnimationContext() {
  const context = useContext(BackgroundAnimationContext);
  if (context === undefined) {
    throw new Error("useBackgroundAnimationContext must be used within BackgroundAnimationProvider");
  }
  return context;
}
