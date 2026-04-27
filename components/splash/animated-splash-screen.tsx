import React, { useEffect } from "react";
import { View, Text, Animated, Easing, Image, Platform } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useColors } from "@/hooks/use-colors";

/**
 * AnimatedSplashScreen — Custom splash screen with animated logo and text
 * 
 * Features:
 * - Animated logo fade-in and scale
 * - Animated text fade-in with staggered timing
 * - Loading indicator animation
 * - Smooth transition to main app
 * 
 * Usage in app/_layout.tsx:
 * <AnimatedSplashScreen isReady={!loading} />
 */

interface AnimatedSplashScreenProps {
  isReady: boolean; // When true, splash screen will hide
}

export function AnimatedSplashScreen({ isReady }: AnimatedSplashScreenProps) {
  const colors = useColors();
  
  // Animation values
  const logoScale = React.useRef(new Animated.Value(0.3)).current;
  const logoOpacity = React.useRef(new Animated.Value(0)).current;
  const titleOpacity = React.useRef(new Animated.Value(0)).current;
  const subtitleOpacity = React.useRef(new Animated.Value(0)).current;
  const loadingOpacity = React.useRef(new Animated.Value(0)).current;
  const dotScale1 = React.useRef(new Animated.Value(1)).current;
  const dotScale2 = React.useRef(new Animated.Value(1)).current;
  const dotScale3 = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (Platform.OS === "web") return;

    // Keep splash screen visible while animating
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
      // Title fade in (200ms delay, then 400ms duration)
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // Subtitle fade in (100ms delay, then 400ms duration)
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
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

    // Stagger the animations
    setTimeout(() => dotAnim1.start(), 0);
    setTimeout(() => dotAnim2.start(), 150);
    setTimeout(() => dotAnim3.start(), 300);

    return () => {
      dotAnim1.stop();
      dotAnim2.stop();
      dotAnim3.stop();
    };
  }, []);

  // Hide splash screen when ready
  useEffect(() => {
    if (isReady && Platform.OS !== "web") {
      // Fade out animation before hiding
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
          marginBottom: 32,
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

      {/* Title with animation */}
      <Animated.Text
        style={{
          opacity: titleOpacity,
          fontSize: 28,
          fontWeight: "700",
          color: colors.foreground,
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        Мысли в стопки
      </Animated.Text>

      {/* Subtitle with animation */}
      <Animated.Text
        style={{
          opacity: subtitleOpacity,
          fontSize: 14,
          color: colors.muted,
          textAlign: "center",
          marginBottom: 48,
          lineHeight: 20,
        }}
      >
        Управляйте задачами по матрице Эйзенхауэра
      </Animated.Text>

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
