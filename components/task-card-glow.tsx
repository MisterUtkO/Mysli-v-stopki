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

interface TaskCardGlowProps {
  color: string;
  borderRadius?: number;
  isVisible?: boolean;
  intensity?: "low" | "medium" | "high";
}

export function TaskCardGlow({
  color,
  borderRadius = 14,
  isVisible = true,
  intensity = "high",
}: TaskCardGlowProps) {
  const glowAnimation = useSharedValue(0);
  const { colorScheme } = useThemeContext();
  const isAmoled = colorScheme === "amoled";

  // Intensity settings
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
          borderWidth: 2,
          borderColor: color,
          pointerEvents: "none",
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: isAmoled ? settings.shadowRadius * 1.5 : settings.shadowRadius,
          shadowOpacity: isAmoled ? 1 : 0.8,
          elevation: isAmoled ? settings.elevation * 1.5 : settings.elevation,
        },
        animatedGlowStyle,
      ]}
    />
  );
}
