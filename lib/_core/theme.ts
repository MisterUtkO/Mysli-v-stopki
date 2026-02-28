import { Platform } from "react-native";

import themeConfig from "@/theme.config";

export type ColorScheme = "light" | "dark" | "amoled" | "pastel" | "notebook" | "darkMatte";

export const ThemeColors = themeConfig.themeColors;

type ThemeColorTokens = typeof ThemeColors;
type ThemeColorName = keyof ThemeColorTokens;
type SchemePalette = Record<ColorScheme, Record<ThemeColorName, string>>;
type SchemePaletteItem = SchemePalette[ColorScheme];

function buildSchemePalette(colors: ThemeColorTokens): SchemePalette {
  const palette: SchemePalette = {
    light: {} as SchemePalette["light"],
    dark: {} as SchemePalette["dark"],
    amoled: {} as SchemePalette["amoled"],
    pastel: {} as SchemePalette["pastel"],
    notebook: {} as SchemePalette["notebook"],
    darkMatte: {} as SchemePalette["darkMatte"],
  };

  (Object.keys(colors) as ThemeColorName[]).forEach((name) => {
    const swatch = colors[name];
    palette.light[name] = swatch.light;
    palette.dark[name] = swatch.dark;
  });

  // AMOLED Black — true black backgrounds, high contrast
  palette.amoled = {
    primary: "#00B4D8",
    background: "#000000",
    surface: "#0A0A0A",
    foreground: "#FFFFFF",
    muted: "#888888",
    border: "#1A1A1A",
    success: "#00FF7F",
    warning: "#FFD700",
    error: "#FF4444",
  } as Record<ThemeColorName, string>;

  // Pastel — soft, warm, calming tones
  palette.pastel = {
    primary: "#7C9CBF",
    background: "#FFF8F0",
    surface: "#FFF0E6",
    foreground: "#4A4A4A",
    muted: "#9B9B9B",
    border: "#E8D5C4",
    success: "#8BC5A3",
    warning: "#F0C987",
    error: "#E8A0A0",
  } as Record<ThemeColorName, string>;

  // Notebook — checkered paper with blue text (school notebook style)
  palette.notebook = {
    primary: "#1E3A8A",
    background: "#F5F5DC",
    surface: "#FFFAF0",
    foreground: "#1E3A8A",
    muted: "#4B5563",
    border: "#E0E0E0",
    success: "#059669",
    warning: "#D97706",
    error: "#DC2626",
  } as Record<ThemeColorName, string>;

  // Dark Matte — black matte paper with light text
  palette.darkMatte = {
    primary: "#60A5FA",
    background: "#1A1A1A",
    surface: "#242424",
    foreground: "#E5E7EB",
    muted: "#9CA3AF",
    border: "#3F3F3F",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
  } as Record<ThemeColorName, string>;

  return palette as SchemePalette;
}

export const SchemeColors = buildSchemePalette(ThemeColors);

type RuntimePalette = SchemePaletteItem & {
  text: string;
  background: string;
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
  border: string;
};

function buildRuntimePalette(scheme: ColorScheme): RuntimePalette {
  const base = SchemeColors[scheme];
  return {
    ...base,
    text: base.foreground,
    background: base.background,
    tint: base.primary,
    icon: base.muted,
    tabIconDefault: base.muted,
    tabIconSelected: base.primary,
    border: base.border,
  };
}

export const Colors = {
  light: buildRuntimePalette("light"),
  dark: buildRuntimePalette("dark"),
  amoled: buildRuntimePalette("amoled"),
  pastel: buildRuntimePalette("pastel"),
  notebook: buildRuntimePalette("notebook"),
  darkMatte: buildRuntimePalette("darkMatte"),
} satisfies Record<ColorScheme, RuntimePalette>;

export type ThemeColorPalette = (typeof Colors)[ColorScheme];

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
