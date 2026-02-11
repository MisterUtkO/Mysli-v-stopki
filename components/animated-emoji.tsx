import { useEffect, useRef } from "react";
import { Animated, Easing, Platform } from "react-native";

/**
 * AnimatedEmoji — renders an emoji with NOTICEABLE looping animation.
 * Enhanced for "liveliness" — bigger movements, faster cycles, more visible.
 * Different emojis get different animation styles:
 * - Fire emojis: flicker (scale pulse + opacity)
 * - Lightning/star: sparkle (scale + rotation)
 * - Heart emojis: heartbeat (double-pump scale)
 * - Default: gentle float (translateY bob)
 * - Wiggle: rotation wiggle
 * - Bounce: vertical bounce
 */

type AnimationType = "flicker" | "sparkle" | "heartbeat" | "float" | "wiggle" | "bounce";

const EMOJI_ANIMATION_MAP: Record<string, AnimationType> = {
  "🔥": "flicker",
  "⚡": "sparkle",
  "💥": "flicker",
  "✨": "sparkle",
  "⭐": "sparkle",
  "🌟": "sparkle",
  "💫": "sparkle",
  "❤️": "heartbeat",
  "💖": "heartbeat",
  "💗": "heartbeat",
  "💪": "bounce",
  "🎯": "wiggle",
  "🏆": "sparkle",
  "🚀": "float",
  "💡": "sparkle",
  "📌": "wiggle",
  "🎵": "float",
  "🎶": "float",
  "🌊": "float",
  "🍀": "wiggle",
  "🎲": "wiggle",
  "🔔": "wiggle",
  "⏰": "wiggle",
  "🎉": "bounce",
  "🎊": "bounce",
  "💎": "sparkle",
  "🌈": "float",
  "☀️": "flicker",
  "🌙": "float",
  "❄️": "float",
  "🎁": "bounce",
  "📚": "wiggle",
  "✏️": "wiggle",
  "🏃": "bounce",
  "🧠": "sparkle",
  "💰": "sparkle",
  "🛒": "wiggle",
  "🏠": "float",
  "✈️": "float",
  "🚗": "wiggle",
  "🐢": "float",
  "🧊": "sparkle",
  "🤢": "wiggle",
  "🎨": "wiggle",
  "🔧": "wiggle",
  "🎪": "bounce",
};

function getAnimationType(emoji: string): AnimationType {
  return EMOJI_ANIMATION_MAP[emoji] || "float";
}

interface AnimatedEmojiProps {
  emoji: string;
  size?: number;
}

export function AnimatedEmoji({ emoji, size = 18 }: AnimatedEmojiProps) {
  const animValue = useRef(new Animated.Value(0)).current;
  const animValue2 = useRef(new Animated.Value(0)).current;
  const animType = getAnimationType(emoji);

  useEffect(() => {
    // Skip animations on web for performance
    if (Platform.OS === "web") return;

    const animations: Animated.CompositeAnimation[] = [];

    switch (animType) {
      case "flicker":
        animations.push(
          Animated.loop(
            Animated.sequence([
              Animated.timing(animValue, {
                toValue: 1,
                duration: 400,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
              }),
              Animated.timing(animValue, {
                toValue: 0,
                duration: 400,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
              }),
            ])
          )
        );
        // Second animation for rotation
        animations.push(
          Animated.loop(
            Animated.sequence([
              Animated.timing(animValue2, {
                toValue: 1,
                duration: 300,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(animValue2, {
                toValue: -1,
                duration: 600,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(animValue2, {
                toValue: 0,
                duration: 300,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
            ])
          )
        );
        break;

      case "sparkle":
        animations.push(
          Animated.loop(
            Animated.sequence([
              Animated.timing(animValue, {
                toValue: 1,
                duration: 700,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(animValue, {
                toValue: 0,
                duration: 700,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
            ])
          )
        );
        // Rotation sparkle
        animations.push(
          Animated.loop(
            Animated.sequence([
              Animated.timing(animValue2, {
                toValue: 1,
                duration: 1400,
                easing: Easing.linear,
                useNativeDriver: true,
              }),
            ])
          )
        );
        break;

      case "heartbeat":
        animations.push(
          Animated.loop(
            Animated.sequence([
              Animated.timing(animValue, {
                toValue: 1,
                duration: 200,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(animValue, {
                toValue: 0.3,
                duration: 150,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(animValue, {
                toValue: 0.9,
                duration: 180,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(animValue, {
                toValue: 0,
                duration: 250,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.delay(600),
            ])
          )
        );
        break;

      case "wiggle":
        animations.push(
          Animated.loop(
            Animated.sequence([
              Animated.timing(animValue, {
                toValue: 1,
                duration: 100,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(animValue, {
                toValue: -1,
                duration: 200,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(animValue, {
                toValue: 0.7,
                duration: 150,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(animValue, {
                toValue: -0.5,
                duration: 150,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(animValue, {
                toValue: 0,
                duration: 100,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.delay(1200),
            ])
          )
        );
        break;

      case "bounce":
        animations.push(
          Animated.loop(
            Animated.sequence([
              Animated.timing(animValue, {
                toValue: 1,
                duration: 300,
                easing: Easing.out(Easing.back(2)),
                useNativeDriver: true,
              }),
              Animated.timing(animValue, {
                toValue: 0,
                duration: 300,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.delay(800),
            ])
          )
        );
        break;

      case "float":
      default:
        animations.push(
          Animated.loop(
            Animated.sequence([
              Animated.timing(animValue, {
                toValue: 1,
                duration: 1000,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
              }),
              Animated.timing(animValue, {
                toValue: 0,
                duration: 1000,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
              }),
            ])
          )
        );
        break;
    }

    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, [animType]);

  // On web, just render static emoji
  if (Platform.OS === "web") {
    return (
      <Animated.Text style={{ fontSize: size }}>
        {emoji}
      </Animated.Text>
    );
  }

  let animatedStyle: any = {};

  switch (animType) {
    case "flicker":
      animatedStyle = {
        transform: [
          {
            scale: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1.2],
            }),
          },
          {
            rotate: animValue2.interpolate({
              inputRange: [-1, 0, 1],
              outputRange: ["-5deg", "0deg", "5deg"],
            }),
          },
        ],
        opacity: animValue.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.75, 1, 0.75],
        }),
      };
      break;

    case "sparkle":
      animatedStyle = {
        opacity: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.6, 1],
        }),
        transform: [
          {
            scale: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.85, 1.15],
            }),
          },
          {
            rotate: animValue2.interpolate({
              inputRange: [0, 1],
              outputRange: ["0deg", "15deg"],
            }),
          },
        ],
      };
      break;

    case "heartbeat":
      animatedStyle = {
        transform: [
          {
            scale: animValue.interpolate({
              inputRange: [0, 0.3, 0.9, 1],
              outputRange: [1, 1.05, 1.18, 1.25],
            }),
          },
        ],
      };
      break;

    case "wiggle":
      animatedStyle = {
        transform: [
          {
            rotate: animValue.interpolate({
              inputRange: [-1, 0, 1],
              outputRange: ["-15deg", "0deg", "15deg"],
            }),
          },
        ],
      };
      break;

    case "bounce":
      animatedStyle = {
        transform: [
          {
            translateY: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -6],
            }),
          },
          {
            scale: animValue.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [1, 1.1, 1.05],
            }),
          },
        ],
      };
      break;

    case "float":
    default:
      animatedStyle = {
        transform: [
          {
            translateY: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -4],
            }),
          },
        ],
        opacity: animValue.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.85, 1, 0.85],
        }),
      };
      break;
  }

  return (
    <Animated.Text style={[{ fontSize: size }, animatedStyle]}>
      {emoji}
    </Animated.Text>
  );
}
