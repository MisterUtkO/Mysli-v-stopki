/**
 * Overdue Task Wrapper Component
 * Displays animated red border and burning clock indicator for overdue tasks
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";

export interface OverdueTaskWrapperProps {
  isOverdue: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper component that adds animated red border for overdue tasks
 */
export function OverdueTaskWrapper({
  isOverdue,
  children,
  className,
}: OverdueTaskWrapperProps) {
  const colors = useColors();
  const borderOpacity = useSharedValue(0.3);

  React.useEffect(() => {
    if (isOverdue) {
      borderOpacity.value = withRepeat(
        withTiming(1, {
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    } else {
      borderOpacity.value = 0;
    }
  }, [isOverdue, borderOpacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      borderColor: `rgba(239, 68, 68, ${borderOpacity.value})`,
      borderWidth: isOverdue ? 2 : 0,
    };
  });

  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
        {
          backgroundColor: isOverdue ? "rgba(239, 68, 68, 0.05)" : "transparent",
        },
      ]}
      className={className}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Overdue indicator badge with burning clock emoji
 */
export function OverdueIndicator({ isOverdue }: { isOverdue: boolean }) {
  if (!isOverdue) return null;

  return (
    <View style={styles.indicatorContainer}>
      <Text style={styles.indicatorEmoji}>🔥⏰</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
  },
  indicatorContainer: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#EF4444",
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    borderWidth: 2,
    borderColor: "white",
  },
  indicatorEmoji: {
    fontSize: 16,
    lineHeight: 20,
  },
});
