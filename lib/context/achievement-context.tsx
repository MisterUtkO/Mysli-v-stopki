import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AchievementDefinition, UnlockedAchievement, Task } from "@/lib/domain/types";
import { ACHIEVEMENTS } from "@/lib/achievements/definitions";
import { checkAchievements } from "@/lib/achievements/checker";

const STORAGE_KEY = "@sdvgnote_achievements";

interface AchievementContextType {
  achievements: AchievementDefinition[];
  unlocked: UnlockedAchievement[];
  newlyUnlocked: AchievementDefinition | null;
  dismissNewAchievement: () => void;
  checkAndUnlock: (tasks: Task[]) => void;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export function AchievementProvider({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState<UnlockedAchievement[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState<AchievementDefinition | null>(null);
  const [loaded, setLoaded] = useState(false);
  const queueRef = useRef<AchievementDefinition[]>([]);

  // Load unlocked achievements from storage
  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setUnlocked(JSON.parse(stored));
        }
      } catch (e) {
        console.log("Failed to load achievements:", e);
      }
      setLoaded(true);
    };
    load();
  }, []);

  const saveUnlocked = useCallback(async (items: UnlockedAchievement[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.log("Failed to save achievements:", e);
    }
  }, []);

  const showNextFromQueue = useCallback(() => {
    if (queueRef.current.length > 0) {
      const next = queueRef.current.shift()!;
      setNewlyUnlocked(next);
    }
  }, []);

  const dismissNewAchievement = useCallback(() => {
    setNewlyUnlocked(null);
    // Show next in queue after a short delay
    setTimeout(() => showNextFromQueue(), 300);
  }, [showNextFromQueue]);

  const checkAndUnlock = useCallback((tasks: Task[]) => {
    if (!loaded) return;

    const newAchievements = checkAchievements(tasks, unlocked);
    if (newAchievements.length === 0) return;

    const now = Date.now();
    const newUnlockedItems: UnlockedAchievement[] = newAchievements.map((a) => ({
      achievementId: a.id,
      unlockedAt: now,
    }));

    const updatedUnlocked = [...unlocked, ...newUnlockedItems];
    setUnlocked(updatedUnlocked);
    saveUnlocked(updatedUnlocked);

    // Queue celebration notifications
    queueRef.current.push(...newAchievements);
    if (!newlyUnlocked) {
      showNextFromQueue();
    }
  }, [loaded, unlocked, newlyUnlocked, saveUnlocked, showNextFromQueue]);

  return (
    <AchievementContext.Provider
      value={{
        achievements: ACHIEVEMENTS,
        unlocked,
        newlyUnlocked,
        dismissNewAchievement,
        checkAndUnlock,
      }}
    >
      {children}
    </AchievementContext.Provider>
  );
}

export function useAchievements() {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error("useAchievements must be used within AchievementProvider");
  }
  return context;
}
