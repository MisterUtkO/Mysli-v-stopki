import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";
import { useSharedValue, withRepeat, withTiming, useAnimatedStyle, interpolate, Extrapolate } from "react-native-reanimated";
import Animated from "react-native-reanimated";
import { useEffect } from "react";
import { View } from "react-native";
import { useColors } from "@/hooks/use-colors";

export function HapticTabWithGlow(props: BottomTabBarButtonProps) {
  const glowAnimation = useSharedValue(0);
  const isActive = props.accessibilityState?.selected ?? false;
  const colors = useColors();

  useEffect(() => {
    if (isActive) {
      glowAnimation.value = withRepeat(
        withTiming(1, { duration: 1200 }),
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
      [1, 1.3],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      glowAnimation.value,
      [0, 0.5, 1],
      [0.8, 0.4, 0.8],
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
      [0.6, 1],
      Extrapolate.CLAMP
    );

    return {
      opacity: lineOpacity,
      shadowOpacity: lineOpacity * 0.8,
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
              backgroundColor: colors.primary,
              top: -24,
            },
            animatedGlowStyle,
            {
              shadowColor: colors.primary,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 0 },
              elevation: 12,
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
              backgroundColor: colors.primary,
              borderRadius: 1.5,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 0 },
              shadowRadius: 6,
            },
            animatedLineStyle,
          ]}
        />
      )}

      {/* Tab button */}
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
