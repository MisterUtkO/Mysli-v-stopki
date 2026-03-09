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
  Easing,
} from "react-native-reanimated";

export type TransitionType = "fade" | "slideUp" | "slideDown" | "slideLeft" | "slideRight";

interface ScreenTransitionProps extends ViewProps {
  children: React.ReactNode;
  duration?: number;
  type?: TransitionType;
}

/**
 * ScreenTransition component wraps screen content with smooth entrance/exit animations.
 * Uses ease-out for entering (decelerating feel) and ease-in for exiting (accelerating feel).
 * Default duration 250ms for a snappy but smooth feel.
 */
export function ScreenTransition({
  children,
  duration = 250,
  type = "fade",
  style,
  ...props
}: ScreenTransitionProps) {
  const easeOut = Easing.out(Easing.cubic);
  const easeIn = Easing.in(Easing.cubic);

  const getEnteringAnimation = () => {
    switch (type) {
      case "slideUp":
        return SlideInUp.duration(duration).easing(easeOut);
      case "slideDown":
        return SlideInDown.duration(duration).easing(easeOut);
      case "slideLeft":
        return SlideInLeft.duration(duration).easing(easeOut);
      case "slideRight":
        return SlideInRight.duration(duration).easing(easeOut);
      case "fade":
      default:
        return FadeIn.duration(duration).easing(easeOut);
    }
  };

  const getExitingAnimation = () => {
    switch (type) {
      case "slideUp":
        return SlideOutUp.duration(duration * 0.8).easing(easeIn);
      case "slideDown":
        return SlideOutDown.duration(duration * 0.8).easing(easeIn);
      case "slideLeft":
        return SlideOutLeft.duration(duration * 0.8).easing(easeIn);
      case "slideRight":
        return SlideOutRight.duration(duration * 0.8).easing(easeIn);
      case "fade":
      default:
        return FadeOut.duration(duration * 0.8).easing(easeIn);
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
