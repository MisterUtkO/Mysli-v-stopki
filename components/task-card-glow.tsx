import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Extrapolate,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";
import { useThemeContext } from "@/lib/theme-provider";
import { getGlowColor, type GlowType } from "@/lib/glow-colors";
import { getThemeNeonColor } from "@/lib/theme-neon-colors";

interface TaskCardGlowProps {
  glowType: GlowType | null;
  borderRadius?: number;
  intensity?: "low" | "medium" | "high";
}

export function TaskCardGlow({
  glowType,
  borderRadius = 14,
  intensity = "high",
}: TaskCardGlowProps) {
  const glowAnimation = useSharedValue(0);
  const { colorScheme } = useThemeContext();
  const isAmoled = colorScheme === "amoled";
  const isVisible = glowType !== null;
  // Use theme-specific neon color instead of glow-colors
  const glowColor = isVisible ? getThemeNeonColor(colorScheme) : "transparent";

  // Intensity settings - higher for AMOLED
  const intensitySettings = {
    low: { shadowRadius: 8, elevation: 4, opacity: 0.4 },
    medium: { shadowRadius: 12, elevation: 8, opacity: 0.6 },
    high: { shadowRadius: 16, elevation: 12, opacity: 0.8 },
  };

  const settings = intensitySettings[intensity];

  useEffect(() => {
    if (isVisible) {
      glowAnimation.value = withRepeat(
        withTiming(1, {
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true
      );
    } else {
      glowAnimation.value = 0;
    }
  }, [isVisible, glowAnimation]);

  const animatedGlowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      glowAnimation.value,
      [0, 0.5, 1],
      [
        isAmoled ? settings.opacity : settings.opacity * 0.7,
        isAmoled ? settings.opacity * 0.5 : settings.opacity * 0.4,
        isAmoled ? settings.opacity : settings.opacity * 0.7,
      ],
      Extrapolate.CLAMP
    );

    return {
      opacity,
    };
  });

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius,
          borderWidth: 2.5,
          borderColor: glowColor,
          pointerEvents: "none",
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: isAmoled ? settings.shadowRadius * 2 : settings.shadowRadius * 1.2,
          shadowOpacity: isAmoled ? 1 : 0.9,
          elevation: isAmoled ? settings.elevation * 2 : settings.elevation * 1.2,
        },
        animatedGlowStyle,
      ]}
    />
  );
}
