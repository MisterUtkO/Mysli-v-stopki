import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface AnimatedTabIndicatorProps {
  isActive: boolean;
  color?: string;
}

export function AnimatedTabIndicator({
  isActive,
  color = "#0a7ea4",
}: AnimatedTabIndicatorProps) {
  const opacity = useSharedValue(0.3);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      // Glow animation: fade in and out
      opacity.value = withRepeat(
        withTiming(1, {
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );

      // Subtle scale pulse
      scale.value = withRepeat(
        withTiming(1.1, {
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    } else {
      opacity.value = 0;
      scale.value = 1;
    }
  }, [isActive, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View
      style={{
        position: "absolute",
        top: -8,
        left: -8,
        right: -8,
        bottom: -8,
        borderRadius: 50,
        overflow: "hidden",
      }}
    >
      <Animated.View
        style={[
          {
            flex: 1,
            backgroundColor: color,
            borderRadius: 50,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}
