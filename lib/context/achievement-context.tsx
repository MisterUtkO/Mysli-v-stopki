import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AchievementDefinition, UnlockedAchievement, Task } from "@/lib/domain/types";
import { ACHIEVEMENTS } from "@/lib/achievements/definitions";
import { checkAchievements } from "@/lib/achievements/checker";

const STORAGE_KEY = "@sdvgnote_achievements";
const FLAGS_KEY = "@sdvgnote_achievement_flags";

interface AchievementContextType {
  achievements: AchievementDefinition[];
  unlocked: UnlockedAchievement[];
  newlyUnlocked: AchievementDefinition | null;
  dismissNewAchievement: () => void;
  checkAndUnlock: (tasks: Task[]) => void;
  triggerCustomFlag: (flag: string, tasks: Task[]) => void;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export function AchievementProvider({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState<UnlockedAchievement[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState<AchievementDefinition | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [customFlags, setCustomFlags] = useState<Record<string, boolean>>({});
  const queueRef = useRef<AchievementDefinition[]>([]);
  const unlockedRef = useRef<UnlockedAchievement[]>([]);

  // Keep ref in sync
  useEffect(() => {
    unlockedRef.current = unlocked;
  }, [unlocked]);

  // Load unlocked achievements and flags from storage
  useEffect(() => {
    const load = async () => {
      try {
        const [stored, flags] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(FLAGS_KEY),
        ]);
        if (stored) {
          const parsed = JSON.parse(stored);
          setUnlocked(parsed);
          unlockedRef.current = parsed;
        }
        if (flags) {
          setCustomFlags(JSON.parse(flags));
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

  const saveFlags = useCallback(async (flags: Record<string, boolean>) => {
    try {
      await AsyncStorage.setItem(FLAGS_KEY, JSON.stringify(flags));
    } catch (e) {
      console.log("Failed to save flags:", e);
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
    setTimeout(() => showNextFromQueue(), 300);
  }, [showNextFromQueue]);

  const processNewAchievements = useCallback((newAchievements: AchievementDefinition[], currentUnlocked: UnlockedAchievement[]) => {
    if (newAchievements.length === 0) return;

    const now = Date.now();
    const newUnlockedItems: UnlockedAchievement[] = newAchievements.map((a) => ({
      achievementId: a.id,
      unlockedAt: now,
    }));

    const updatedUnlocked = [...currentUnlocked, ...newUnlockedItems];
    setUnlocked(updatedUnlocked);
    unlockedRef.current = updatedUnlocked;
    saveUnlocked(updatedUnlocked);

    queueRef.current.push(...newAchievements);
    if (!newlyUnlocked) {
      showNextFromQueue();
    }
  }, [newlyUnlocked, saveUnlocked, showNextFromQueue]);

  const checkAndUnlock = useCallback((tasks: Task[]) => {
    if (!loaded) return;

    const newAchievements = checkAchievements(tasks, unlockedRef.current, customFlags);
    processNewAchievements(newAchievements, unlockedRef.current);
  }, [loaded, customFlags, processNewAchievements]);

  const triggerCustomFlag = useCallback((flag: string, tasks: Task[]) => {
    const updatedFlags = { ...customFlags, [flag]: true };
    setCustomFlags(updatedFlags);
    saveFlags(updatedFlags);

    // Immediately check with the new flag
    if (loaded) {
      const newAchievements = checkAchievements(tasks, unlockedRef.current, updatedFlags);
      processNewAchievements(newAchievements, unlockedRef.current);
    }
  }, [loaded, customFlags, saveFlags, processNewAchievements]);

  return (
    <AchievementContext.Provider
      value={{
        achievements: ACHIEVEMENTS,
        unlocked,
        newlyUnlocked,
        dismissNewAchievement,
        checkAndUnlock,
        triggerCustomFlag,
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
