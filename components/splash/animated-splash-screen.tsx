import React, { useEffect } from "react";
import { View, Animated, Easing, Image, Platform } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useColors } from "@/hooks/use-colors";

/**
 * AnimatedSplashScreen — Custom splash screen with animated logo
 * 
 * Simplified version without text to avoid font loading issues
 * Features:
 * - Animated logo fade-in and scale
 * - Loading indicator animation
 * - Smooth transition to main app
 */

interface AnimatedSplashScreenProps {
  isReady: boolean;
}

export function AnimatedSplashScreen({ isReady }: AnimatedSplashScreenProps) {
  const colors = useColors();
  
  const logoScale = React.useRef(new Animated.Value(0.3)).current;
  const logoOpacity = React.useRef(new Animated.Value(0)).current;
  const loadingOpacity = React.useRef(new Animated.Value(0)).current;
  const dotScale1 = React.useRef(new Animated.Value(1)).current;
  const dotScale2 = React.useRef(new Animated.Value(1)).current;
  const dotScale3 = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (Platform.OS === "web") return;

    SplashScreen.preventAutoHideAsync().catch(() => {});

    // Sequence of animations
    Animated.sequence([
      // Logo fade in and scale up (0-600ms)
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // Loading indicator fade in
      Animated.timing(loadingOpacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

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
      Animated.timing(logoOpacity, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        SplashScreen.hideAsync().catch(() => {});
      });
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
      {/* Logo with animation */}
      <Animated.View
        style={{
          opacity: logoOpacity,
          transform: [{ scale: logoScale }],
          marginBottom: 48,
        }}
      >
        <Image
          source={require("@/assets/images/splash-icon.png")}
          style={{
            width: 200,
            height: 200,
            resizeMode: "contain",
          }}
        />
      </Animated.View>

      {/* Loading indicator with animation */}
      <Animated.View
        style={{
          opacity: loadingOpacity,
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
      </Animated.View>
    </View>
  );
}
