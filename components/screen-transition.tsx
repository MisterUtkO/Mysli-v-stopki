import React from "react";
import { ViewProps } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutDown,
  SlideInDown,
  SlideOutUp,
  SlideInLeft,
  SlideOutRight,
  SlideInRight,
  SlideOutLeft,
} from "react-native-reanimated";

export type TransitionType = "fade" | "slideUp" | "slideDown" | "slideLeft" | "slideRight";

interface ScreenTransitionProps extends ViewProps {
  children: React.ReactNode;
  duration?: number;
  type?: TransitionType;
}

/**
 * ScreenTransition component wraps screen content with smooth entrance/exit animations
 * Supports fade, slide up/down/left/right transitions
 * Uses react-native-reanimated for performant animations
 */
export function ScreenTransition({
  children,
  duration = 300,
  type = "fade",
  style,
  ...props
}: ScreenTransitionProps) {
  // Select animation based on type
  const getEnteringAnimation = () => {
    switch (type) {
      case "slideUp":
        return SlideInUp.duration(duration);
      case "slideDown":
        return SlideInDown.duration(duration);
      case "slideLeft":
        return SlideInLeft.duration(duration);
      case "slideRight":
        return SlideInRight.duration(duration);
      case "fade":
      default:
        return FadeIn.duration(duration);
    }
  };

  const getExitingAnimation = () => {
    switch (type) {
      case "slideUp":
        return SlideOutUp.duration(duration);
      case "slideDown":
        return SlideOutDown.duration(duration);
      case "slideLeft":
        return SlideOutLeft.duration(duration);
      case "slideRight":
        return SlideOutRight.duration(duration);
      case "fade":
      default:
        return FadeOut.duration(duration);
    }
  };

  return (
    <Animated.View
      entering={getEnteringAnimation()}
      exiting={getExitingAnimation()}
      style={[{ flex: 1 }, style]}
      {...props}
    >
      {children}
    </Animated.View>
  );
}
