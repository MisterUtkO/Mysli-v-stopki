import React, { useEffect } from "react";
import { View, Animated, Easing, Platform } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useColors } from "@/hooks/use-colors";

/**
 * AnimatedSplashScreen — Minimal splash screen for native platforms
 * 
 * Simplified to avoid font/image loading issues on native
 * Features:
 * - Simple colored background
 * - Loading indicator animation
 * - Smooth transition to main app
 */

interface AnimatedSplashScreenProps {
  isReady: boolean;
}

export function AnimatedSplashScreen({ isReady }: AnimatedSplashScreenProps) {
  const colors = useColors();
  
  const dotScale1 = React.useRef(new Animated.Value(1)).current;
  const dotScale2 = React.useRef(new Animated.Value(1)).current;
  const dotScale3 = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (Platform.OS === "web") return;

    SplashScreen.preventAutoHideAsync().catch(() => {});

    // Animate loading dots
    const createDotAnimation = (dotValue: Animated.Value) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(dotValue, {
            toValue: 1.3,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dotValue, {
            toValue: 1,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    };

    const dotAnim1 = createDotAnimation(dotScale1);
    const dotAnim2 = createDotAnimation(dotScale2);
    const dotAnim3 = createDotAnimation(dotScale3);

    setTimeout(() => dotAnim1.start(), 0);
    setTimeout(() => dotAnim2.start(), 150);
    setTimeout(() => dotAnim3.start(), 300);

    return () => {
      dotAnim1.stop();
      dotAnim2.stop();
      dotAnim3.stop();
    };
  }, []);

  useEffect(() => {
    if (isReady && Platform.OS !== "web") {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isReady]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
      }}
    >
      {/* Loading indicator with animation */}
      <View
        style={{
          flexDirection: "row",
          gap: 8,
        }}
      >
        <Animated.View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: colors.primary,
            transform: [{ scale: dotScale1 }],
          }}
        />
        <Animated.View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: colors.primary,
            transform: [{ scale: dotScale2 }],
          }}
        />
        <Animated.View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: colors.primary,
            transform: [{ scale: dotScale3 }],
          }}
        />
      </View>
    </View>
  );
}
