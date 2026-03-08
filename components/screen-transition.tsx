import React, { useEffect } from "react";
import { View, ViewProps } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

export interface ScreenTransitionProps extends ViewProps {
  children: React.ReactNode;
  animationType?: "fade" | "slideUp";
  duration?: number;
}

export function ScreenTransition({
  children,
  animationType = "fade",
  duration = 300,
  style,
  ...props
}: ScreenTransitionProps) {
  const opacity = useSharedValue(animationType === "fade" ? 0 : 1);
  const translateY = useSharedValue(animationType === "slideUp" ? 30 : 0);

  useEffect(() => {
    if (animationType === "fade") {
      opacity.value = withTiming(1, {
        duration,
        easing: Easing.inOut(Easing.ease),
      });
    } else if (animationType === "slideUp") {
      translateY.value = withTiming(0, {
        duration,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
}
