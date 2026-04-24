import React, { useEffect } from "react";
import { Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
  withDelay,
} from "react-native-reanimated";

interface HeartbeatEmojiProps {
  emoji?: string;
  size?: number;
}

/**
 * HeartbeatEmoji — Animated emoji with subtle heartbeat effect
 * Scales up and down in a gentle rhythm to attract attention without being intrusive
 */
export function HeartbeatEmoji({ emoji = "❤️", size = 24 }: HeartbeatEmojiProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    // Create a single heartbeat cycle
    const heartbeatCycle = () => {
      scale.value = withSequence(
        // First beat: scale up quickly
        withTiming(1.15, {
          duration: 100,
          easing: Easing.out(Easing.cubic),
        }),
        // Return to normal
        withTiming(1, {
          duration: 100,
          easing: Easing.out(Easing.cubic),
        }),
        // Pause before second beat
        withTiming(1, {
          duration: 50,
          easing: Easing.linear,
        }),
        // Second beat: scale up quickly
        withTiming(1.15, {
          duration: 100,
          easing: Easing.out(Easing.cubic),
        }),
        // Return to normal
        withTiming(1, {
          duration: 100,
          easing: Easing.out(Easing.cubic),
        }),
        // Long pause before next cycle (2 beats per 2 seconds)
        withDelay(1550, withTiming(1, { duration: 0 }))
      );
    };

    // Start the animation
    heartbeatCycle();

    // Restart animation every 2 seconds
    const interval = setInterval(() => {
      heartbeatCycle();
    }, 2000);

    return () => clearInterval(interval);
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text style={{ fontSize: size, lineHeight: size }}>{emoji}</Text>
    </Animated.View>
  );
}
