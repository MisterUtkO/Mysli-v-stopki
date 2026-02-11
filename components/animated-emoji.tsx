import { useEffect, useRef } from "react";
import { Animated, Easing, Platform } from "react-native";

/**
 * AnimatedEmoji — renders an emoji with subtle looping animation.
 * Different emojis get different animation styles:
 * - Fire emojis: flicker (scale pulse)
 * - Lightning/star: sparkle (opacity pulse)
 * - Heart emojis: heartbeat (scale)
 * - Default: gentle float (translateY)
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
  const animType = getAnimationType(emoji);

  useEffect(() => {
    // Skip animations on web for performance
    if (Platform.OS === "web") return;

    let animation: Animated.CompositeAnimation;

    switch (animType) {
      case "flicker":
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1,
              duration: 600,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 600,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        );
        break;

      case "sparkle":
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1,
              duration: 1200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 1200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
        break;

      case "heartbeat":
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1,
              duration: 300,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 200,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0.8,
              duration: 250,
              easing: Easing.out(Easing.ease),
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
        );
        break;

      case "wiggle":
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1,
              duration: 150,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: -1,
              duration: 300,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 150,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.delay(2000),
          ])
        );
        break;

      case "bounce":
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1,
              duration: 400,
              easing: Easing.out(Easing.back(1.5)),
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 400,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.delay(1500),
          ])
        );
        break;

      case "float":
      default:
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1,
              duration: 1500,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 1500,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        );
        break;
    }

    animation.start();
    return () => animation.stop();
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
              outputRange: [1, 1.12],
            }),
          },
        ],
        opacity: animValue.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.85, 1, 0.85],
        }),
      };
      break;

    case "sparkle":
      animatedStyle = {
        opacity: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.7, 1],
        }),
        transform: [
          {
            scale: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.95, 1.05],
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
              inputRange: [0, 0.8, 1],
              outputRange: [1, 1.08, 1.15],
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
              outputRange: ["-8deg", "0deg", "8deg"],
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
              outputRange: [0, -3],
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
              outputRange: [0, -2.5],
            }),
          },
        ],
      };
      break;
  }

  return (
    <Animated.Text style={[{ fontSize: size }, animatedStyle]}>
      {emoji}
    </Animated.Text>
  );
}
