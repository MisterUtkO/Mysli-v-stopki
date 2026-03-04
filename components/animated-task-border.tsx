import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/use-colors';

interface AnimatedTaskBorderProps {
  isOverdue: boolean;
  isOld: boolean;
  children: React.ReactNode;
}

/**
 * Component that wraps a task and adds an animated border if it's overdue or old.
 * - Overdue tasks: red/orange animated border
 * - Old tasks (>3 days without date): yellow/warning animated border
 */
export function AnimatedTaskBorder({
  isOverdue,
  isOld,
  children,
}: AnimatedTaskBorderProps) {
  const colors = useColors();
  const borderOffset = useSharedValue(0);

  useEffect(() => {
    if (isOverdue || isOld) {
      borderOffset.value = withRepeat(
        withTiming(100, {
          duration: 2000,
          easing: Easing.linear,
        }),
        -1,
        true
      );
    }
  }, [isOverdue, isOld, borderOffset]);

  const animatedStyle = useAnimatedStyle(() => ({
    borderWidth: isOverdue || isOld ? 2 : 0,
    borderColor: isOverdue ? colors.error : isOld ? colors.warning : 'transparent',
    opacity: isOverdue || isOld ? 1 : 1,
  }));

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
    overflow: 'hidden',
  },
});
