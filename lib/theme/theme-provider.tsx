import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, View, useColorScheme as useSystemColorScheme } from "react-native";
import { colorScheme as nativewindColorScheme, vars } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { SchemeColors } from "@/constants/theme";
import type { ColorScheme } from "@/lib/_core/theme";
import { getSetting, setSetting } from "@/lib/database/db";

type ThemeContextValue = {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme() ?? "light";
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(systemScheme as ColorScheme);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme on mount from database (single source of truth)
  useEffect(() => {
    const loadTheme = async () => {
      try {
        // First, try to load from settings database (primary source)
        const saved = await getSetting("theme");
        const validThemes: ColorScheme[] = ["light", "dark", "amoled", "pastel", "notebook", "darkMatte"];
        
        if (saved && validThemes.includes(saved as ColorScheme)) {
          setColorSchemeState(saved as ColorScheme);
        } else {
          // Fallback: use system preference
          setColorSchemeState(systemScheme as ColorScheme);
        }
      } catch (error) {
        console.warn("[ThemeProvider] Failed to load theme:", error);
        // On error, fallback to system
        setColorSchemeState(systemScheme as ColorScheme);
      } finally {
        setIsLoading(false);
      }
    };
    loadTheme();
  }, []);

  const applyScheme = useCallback((scheme: ColorScheme) => {
    const nativeScheme = (scheme === "amoled" || scheme === "darkMatte") ? "dark" : "light";
    nativewindColorScheme.set(nativeScheme);
    Appearance.setColorScheme?.(nativeScheme);
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.dataset.theme = scheme;
      root.classList.toggle("dark", nativeScheme === "dark");
      const palette = SchemeColors[scheme];
      Object.entries(palette).forEach(([token, value]) => {
        root.style.setProperty(`--color-${token}`, value);
      });
    }
    console.log("[ThemeProvider] Applied theme:", scheme);
  }, []);

  const setColorScheme = useCallback(
    async (scheme: ColorScheme) => {
      console.log("[ThemeProvider] Changing theme to:", scheme);
      setColorSchemeState(scheme);
      applyScheme(scheme);
      try {
        // Save to database (single source of truth)
        await setSetting("theme", scheme);
        console.log("[ThemeProvider] Theme saved to database:", scheme);
      } catch (error) {
        console.error("[ThemeProvider] Failed to save theme:", error);
      }
    },
    [applyScheme]
  );

  useEffect(() => {
    if (!isLoading) {
      applyScheme(colorScheme);
    }
  }, [applyScheme, colorScheme, isLoading]);

  const themeVariables = useMemo(
    () =>
      vars({
        "color-primary": SchemeColors[colorScheme].primary,
        "color-background": SchemeColors[colorScheme].background,
        "color-surface": SchemeColors[colorScheme].surface,
        "color-foreground": SchemeColors[colorScheme].foreground,
        "color-muted": SchemeColors[colorScheme].muted,
        "color-border": SchemeColors[colorScheme].border,
        "color-success": SchemeColors[colorScheme].success,
        "color-warning": SchemeColors[colorScheme].warning,
        "color-error": SchemeColors[colorScheme].error,
      }),
    [colorScheme]
  );

  const value = useMemo(
    () => ({
      colorScheme,
      setColorScheme,
    }),
    [colorScheme, setColorScheme]
  );

  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      <View style={[{ flex: 1 }, themeVariables]}>{children}</View>
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return ctx;
}

export type { ColorScheme };
