import React from "react";
import { View, type ViewProps } from "react-native";
import { AnimatedBackground } from "./animated-background";
import { useColors } from "@/hooks/use-colors";

export interface ScreenWithBackgroundProps extends ViewProps {
  children: React.ReactNode;
}

/**
 * A screen wrapper component that adds animated background to any screen.
 * Z-index layering:
 * - z-0: Background color (ScreenContainer)
 * - z-1: Animated background (if enabled)
 * - z-2: Content (children)
 */
export function ScreenWithBackground({
  children,
  style,
  ...props
}: ScreenWithBackgroundProps) {
  const colors = useColors();

  return (
    <View
      style={[
        {
          flex: 1,
          position: "relative",
          backgroundColor: colors.background,
        },
        style,
      ]}
      {...props}
    >
      {/* Base background layer - z-index 0 */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: colors.background,
          zIndex: 0,
        }}
      />

      {/* Animated background layer - z-index 1 */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          pointerEvents: "none",
        }}
      >
        <AnimatedBackground />
      </View>

      {/* Content layer - z-index 2 */}
      <View
        style={{
          flex: 1,
          position: "relative",
          zIndex: 2,
        }}
      >
        {children}
      </View>
    </View>
  );
}
