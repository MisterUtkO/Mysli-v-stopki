import React from "react";
import { View, type ViewProps } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { AnimatedBackground } from "./animated-background";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

export interface ScreenWithBackgroundProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
  edges?: Edge[];
}

/**
 * A screen wrapper component that adds animated background to any screen.
 * Combines ScreenContainer + AnimatedBackground functionality.
 * Z-index layering:
 * - z-0: Background color
 * - z-1: Animated background (if enabled)
 * - z-2: Content (children)
 */
export function ScreenWithBackground({
  children,
  style,
  className,
  edges = ["top", "left", "right"],
  ...props
}: ScreenWithBackgroundProps) {
  const colors = useColors();

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: colors.background,
        },
        style,
      ]}
      {...props}
    >
      {/* Animated background layer */}
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

      {/* Content layer - must be on top */}
      <SafeAreaView
        edges={edges}
        style={{
          flex: 1,
          zIndex: 2,
        }}
      >
        <View className={cn("flex-1", className)}>
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
}
