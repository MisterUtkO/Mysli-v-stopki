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
import { useCustomization } from "@/lib/context/customization-context";

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
  const customization = useCustomization();
  const isAmoled = colorScheme === "amoled";
  const isVisible = glowType !== null && customization.animationIntensity !== 'off';
  // Use theme-specific neon color instead of glow-colors
  const glowColor = isVisible ? getThemeNeonColor(colorScheme) : "transparent";

  // Intensity settings — subtle, non-distracting
  const intensitySettings = {
    low: { shadowRadius: 4, elevation: 2, opacity: 0.2 },
    medium: { shadowRadius: 6, elevation: 4, opacity: 0.3 },
    high: { shadowRadius: 8, elevation: 6, opacity: 0.4 },
  };

  const settings = intensitySettings[intensity];

  useEffect(() => {
    if (isVisible) {
      glowAnimation.value = withRepeat(
        withTiming(1, {
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true
      );
    } else {
      glowAnimation.value = 0;
    }
  }, [isVisible, glowAnimation, customization.animationIntensity]);

  const animatedGlowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      glowAnimation.value,
      [0, 0.5, 1],
      [
        isAmoled ? settings.opacity : settings.opacity * 0.6,
        isAmoled ? settings.opacity * 0.4 : settings.opacity * 0.25,
        isAmoled ? settings.opacity : settings.opacity * 0.6,
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
          borderWidth: 1.5,
          borderColor: glowColor,
          pointerEvents: "none",
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: isAmoled ? settings.shadowRadius * 1.5 : settings.shadowRadius,
          shadowOpacity: isAmoled ? 0.7 : 0.5,
          elevation: isAmoled ? settings.elevation * 1.5 : settings.elevation,
        },
        animatedGlowStyle,
      ]}
    />
  );
}
