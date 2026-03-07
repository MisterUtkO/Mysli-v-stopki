import React from "react";
import { View } from "react-native";
import { AnimatedBackground } from "./animated-background";
import { useBackgroundAnimation } from "@/lib/context/background-animation-context";

interface ScreenWithBackgroundProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that adds animated background to any screen.
 * The background animation is controlled by BackgroundAnimationContext settings.
 */
export const ScreenWithBackground: React.FC<ScreenWithBackgroundProps> = ({
  children,
}) => {
  const { settings } = useBackgroundAnimation();

  return (
    <View style={{ flex: 1, position: "relative" }}>
      <AnimatedBackground
        animationType={settings.animationType}
        speed={settings.speed}
        intensity={settings.intensity}
      />
      <View style={{ flex: 1, position: "relative", zIndex: 1 }}>
        {children}
      </View>
    </View>
  );
};
