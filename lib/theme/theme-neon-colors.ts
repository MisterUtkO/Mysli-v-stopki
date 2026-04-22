import type { ColorScheme } from "@/lib/_core/theme";

/**
 * Theme-specific neon glow colors for all UI elements
 * Each theme has its own unique bright, high-contrast color for glowing effects
 * Used for: theme button borders, task card glows, tab bar glows, and all active elements
 */
export const ThemeNeonColors: Record<ColorScheme, string> = {
  light: "#0A7EA4", // Bright cyan-blue (Apple iOS blue)
  dark: "#64B5F6", // Bright sky blue
  amoled: "#00FFFF", // Neon cyan (maximum brightness)
  pastel: "#7C9CBF", // Soft blue-gray
  notebook: "#1E3A8A", // School notebook blue
  darkMatte: "#60A5FA", // Bright blue
};

/**
 * Get the neon glow color for a specific theme
 */
export function getThemeNeonColor(theme: ColorScheme): string {
  return ThemeNeonColors[theme] || ThemeNeonColors.light;
}

/**
 * Get enhanced neon color for AMOLED theme (even brighter)
 * Used when AMOLED theme is active - all glows should be maximum brightness
 */
export function getAmoledNeonColor(): string {
  return ThemeNeonColors.amoled;
}

/**
 * Determine if a theme should use maximum brightness neon
 * (AMOLED theme uses maximum brightness, others use theme-specific colors)
 */
export function shouldUseMaxBrightness(theme: ColorScheme): boolean {
  return theme === "amoled";
}
