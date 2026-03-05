import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";
import { useSharedValue, withRepeat, withTiming, useAnimatedStyle, interpolate, Extrapolate } from "react-native-reanimated";
import Animated from "react-native-reanimated";
import { useEffect } from "react";
import { View } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";

export function HapticTabWithGlow(props: BottomTabBarButtonProps) {
  const glowAnimation = useSharedValue(0);
  const isActive = props.accessibilityState?.selected ?? false;
  const colors = useColors();
  const { colorScheme } = useThemeContext();
  const isAmoled = colorScheme === "amoled";

  // Neon colors for AMOLED theme
  const neonColors = {
    cyan: "#00FFFF",
    magenta: "#FF00FF",
    lime: "#00FF00",
    yellow: "#FFFF00",
  };

  // Use neon cyan for AMOLED, primary color for others
  const glowColor = isAmoled ? neonColors.cyan : colors.primary;

  useEffect(() => {
    if (isActive) {
      glowAnimation.value = withRepeat(
        withTiming(1, { duration: 800 }),
        -1,
        true
      );
    } else {
      glowAnimation.value = 0;
    }
  }, [isActive, glowAnimation]);

  const animatedGlowStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      glowAnimation.value,
      [0, 1],
      [1, 1.5],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      glowAnimation.value,
      [0, 0.5, 1],
      [isAmoled ? 1 : 0.9, isAmoled ? 0.6 : 0.5, isAmoled ? 1 : 0.9],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const animatedLineStyle = useAnimatedStyle(() => {
    const lineOpacity = interpolate(
      glowAnimation.value,
      [0, 1],
      [isAmoled ? 0.8 : 0.7, 1],
      Extrapolate.CLAMP
    );

    return {
      opacity: lineOpacity,
      shadowOpacity: isAmoled ? lineOpacity * 1.2 : lineOpacity * 0.8,
    };
  });

  return (
    <View style={{ position: "relative", flex: 1, alignItems: "center", justifyContent: "center" }}>
      {/* Glowing background circle */}
      {isActive && (
        <Animated.View
          style={[
            {
              position: "absolute",
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: glowColor,
              top: -24,
            },
            animatedGlowStyle,
            {
              shadowColor: glowColor,
              shadowRadius: isAmoled ? 24 : 16,
              shadowOffset: { width: 0, height: 0 },
              elevation: isAmoled ? 20 : 14,
            },
          ]}
        />
      )}

      {/* Bright indicator line at bottom */}
      {isActive && (
        <Animated.View
          style={[
            {
              position: "absolute",
              bottom: -8,
              left: "50%",
              marginLeft: -12,
              width: 24,
              height: 3,
              backgroundColor: glowColor,
              borderRadius: 1.5,
              shadowColor: glowColor,
              shadowOffset: { width: 0, height: 0 },
              shadowRadius: isAmoled ? 12 : 8,
            },
            animatedLineStyle,
          ]}
        />
      )}

      {/* Tab button with bright background in AMOLED */}
      {isActive && isAmoled && (
        <View
          style={{
            position: "absolute",
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: glowColor,
            opacity: 0.15,
            zIndex: -1,
          }}
        />
      )}

      <PlatformPressable
        {...props}
        onPressIn={(ev) => {
          if (process.env.EXPO_OS === "ios") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          props.onPressIn?.(ev);
        }}
      />
    </View>
  );
}
