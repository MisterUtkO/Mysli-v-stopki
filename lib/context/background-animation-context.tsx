import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type AnimationType = "none" | "hearts" | "stars" | "bubbles" | "snowflakes" | "matrix";

interface BackgroundAnimationContextType {
  animationType: AnimationType;
  setAnimationType: (type: AnimationType) => void;
  speed: number; // 0.5, 1, 2 (multiplier)
  setSpeed: (speed: number) => void;
  animationIntensity: number; // 1-20 (number of particles)
  setAnimationIntensity: (intensity: number) => void;
}

const BackgroundAnimationContext = createContext<BackgroundAnimationContextType | undefined>(undefined);

export function BackgroundAnimationProvider({ children }: { children: React.ReactNode }) {
  const [animationType, setAnimationTypeState] = useState<AnimationType>("hearts");
  const [speed, setSpeedState] = useState(1);
  const [animationIntensity, setAnimationIntensityState] = useState(10);

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedAnimationType = (await AsyncStorage.getItem("bgAnimationType")) as AnimationType;
        const savedSpeed = await AsyncStorage.getItem("bgAnimationSpeed");
        const savedIntensity = await AsyncStorage.getItem("bgAnimationIntensity");

        if (savedAnimationType) setAnimationTypeState(savedAnimationType);
        if (savedSpeed) setSpeedState(parseFloat(savedSpeed));
        if (savedIntensity) setAnimationIntensityState(parseInt(savedIntensity));
      } catch (error) {
        console.error("Failed to load background animation settings:", error);
      }
    };

    loadSettings();
  }, []);

  const setAnimationType = useCallback(async (type: AnimationType) => {
    setAnimationTypeState(type);
    try {
      await AsyncStorage.setItem("bgAnimationType", type);
    } catch (error) {
      console.error("Failed to save animation type:", error);
    }
  }, []);

  const setSpeed = useCallback(async (newSpeed: number) => {
    const clamped = Math.max(0.5, Math.min(3, newSpeed));
    setSpeedState(clamped);
    try {
      await AsyncStorage.setItem("bgAnimationSpeed", clamped.toString());
    } catch (error) {
      console.error("Failed to save animation speed:", error);
    }
  }, []);

  const setAnimationIntensity = useCallback(async (newIntensity: number) => {
    const clamped = Math.max(1, Math.min(20, newIntensity));
    setAnimationIntensityState(clamped);
    try {
      await AsyncStorage.setItem("bgAnimationIntensity", clamped.toString());
    } catch (error) {
      console.error("Failed to save animation intensity:", error);
    }
  }, []);

  return (
    <BackgroundAnimationContext.Provider
      value={{
        animationType,
        setAnimationType,
        speed,
        setSpeed,
        animationIntensity,
        setAnimationIntensity,
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

export type { BackgroundAnimationContextType };
