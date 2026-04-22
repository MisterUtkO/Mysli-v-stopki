import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/use-colors';

interface AnimatedTaskBorderProps {
  isOverdue: boolean;
  isOld: boolean;
  children: React.ReactNode;
}

/**
 * Component that wraps a task and adds an animated glowing border if it's overdue or old.
 * - Overdue tasks: red/orange glowing animated border
 * - Old tasks (>3 days without date): yellow/warning glowing animated border
 */
export function AnimatedTaskBorder({
  isOverdue,
  isOld,
  children,
}: AnimatedTaskBorderProps) {
  const colors = useColors();
  const glowAnimation = useSharedValue(0);

  useEffect(() => {
    if (isOverdue || isOld) {
      glowAnimation.value = withRepeat(
        withTiming(1, {
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    }
  }, [isOverdue, isOld, glowAnimation]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      glowAnimation.value,
      [0, 1],
      [0.4, 1],
      Extrapolate.CLAMP
    );

    const shadowRadius = interpolate(
      glowAnimation.value,
      [0, 1],
      [2, 8],
      Extrapolate.CLAMP
    );

    return {
      borderWidth: isOverdue || isOld ? 2.5 : 0,
      borderColor: isOverdue
        ? `rgba(239, 68, 68, ${opacity})`
        : isOld
          ? `rgba(245, 158, 11, ${opacity})`
          : 'transparent',
      shadowColor: isOverdue
        ? 'rgb(239, 68, 68)'
        : isOld
          ? 'rgb(245, 158, 11)'
          : 'transparent',
      shadowOpacity: opacity * 0.8,
      shadowRadius: shadowRadius,
      shadowOffset: { width: 0, height: 0 },
      elevation: isOverdue || isOld ? shadowRadius : 0,
    };
  });

  if (!isOverdue && !isOld) {
    return <>{children}</>;
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'visible',
  },
});
