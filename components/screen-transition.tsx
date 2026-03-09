import React from "react";
import { ViewProps } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

interface ScreenTransitionProps extends ViewProps {
  children: React.ReactNode;
  duration?: number;
}

export function ScreenTransition({
  children,
  duration = 300,
  style,
  ...props
}: ScreenTransitionProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(duration)}
      exiting={FadeOut.duration(duration)}
      style={[{ flex: 1 }, style]}
      {...props}
    >
      {children}
    </Animated.View>
  );
}
