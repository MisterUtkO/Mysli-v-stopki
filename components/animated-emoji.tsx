import { useEffect, useRef } from "react";
import { Animated, Easing, Platform, View } from "react-native";

/**
 * AnimatedEmoji — renders an emoji with SUBTLE looping animation.
 * Animations are gentle and unobtrusive.
 */

type AnimationType = "flicker" | "sparkle" | "heartbeat" | "float" | "wiggle" | "bounce";

const EMOJI_ANIMATION_MAP: Record<string, AnimationType> = {
  "🔥": "flicker", "⚡": "sparkle", "💥": "flicker", "✨": "sparkle",
  "⭐": "sparkle", "🌟": "sparkle", "💫": "sparkle", "❤️": "heartbeat",
  "💖": "heartbeat", "💗": "heartbeat", "💪": "bounce", "🎯": "wiggle",
  "🏆": "sparkle", "🚀": "float", "💡": "sparkle", "📌": "wiggle",
  "🎵": "float", "🎶": "float", "🌊": "float", "🍀": "wiggle",
  "🎲": "wiggle", "🔔": "wiggle", "⏰": "wiggle", "🎉": "bounce",
  "🎊": "bounce", "💎": "sparkle", "🌈": "float", "☀️": "flicker",
  "🌙": "float", "❄️": "float", "🎁": "bounce", "📚": "wiggle",
  "✏️": "wiggle", "🏃": "bounce", "🧠": "sparkle", "💰": "sparkle",
  "🛒": "wiggle", "🏠": "float", "✈️": "float", "🚗": "wiggle",
  "🐢": "float", "🧊": "sparkle", "🤢": "wiggle", "🎨": "wiggle",
  "🔧": "wiggle", "🎪": "bounce",
};

function getAnimationType(emoji: string): AnimationType {
  return EMOJI_ANIMATION_MAP[emoji] || "float";
}

interface AnimatedEmojiProps {
  emoji: string;
  size?: number;
}

export function AnimatedEmoji({ emoji, size = 18 }: AnimatedEmojiProps) {
  const anim1 = useRef(new Animated.Value(0)).current;
  const animType = getAnimationType(emoji);

  useEffect(() => {
    // Skip animations on web for performance
    if (Platform.OS === "web") return;

    let animation: Animated.CompositeAnimation;

    switch (animType) {
      case "flicker":
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(anim1, {
              toValue: 1, duration: 700,
              easing: Easing.inOut(Easing.sin), useNativeDriver: true,
            }),
            Animated.timing(anim1, {
              toValue: 0, duration: 700,
              easing: Easing.inOut(Easing.sin), useNativeDriver: true,
            }),
            Animated.delay(1200),
          ])
        );
        break;

      case "sparkle":
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(anim1, {
              toValue: 1, duration: 900,
              easing: Easing.inOut(Easing.sin), useNativeDriver: true,
            }),
            Animated.timing(anim1, {
              toValue: 0, duration: 900,
              easing: Easing.inOut(Easing.sin), useNativeDriver: true,
            }),
            Animated.delay(1500),
          ])
        );
        break;

      case "heartbeat":
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(anim1, {
              toValue: 1, duration: 200,
              easing: Easing.out(Easing.ease), useNativeDriver: true,
            }),
            Animated.timing(anim1, {
              toValue: 0, duration: 200,
              easing: Easing.in(Easing.ease), useNativeDriver: true,
            }),
            Animated.delay(2000),
          ])
        );
        break;

      case "wiggle":
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(anim1, {
              toValue: 1, duration: 100,
              easing: Easing.inOut(Easing.ease), useNativeDriver: true,
            }),
            Animated.timing(anim1, {
              toValue: -1, duration: 200,
              easing: Easing.inOut(Easing.ease), useNativeDriver: true,
            }),
            Animated.timing(anim1, {
              toValue: 0, duration: 100,
              easing: Easing.inOut(Easing.ease), useNativeDriver: true,
            }),
            Animated.delay(2500),
          ])
        );
        break;

      case "bounce":
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(anim1, {
              toValue: 1, duration: 300,
              easing: Easing.out(Easing.ease), useNativeDriver: true,
            }),
            Animated.timing(anim1, {
              toValue: 0, duration: 300,
              easing: Easing.in(Easing.ease), useNativeDriver: true,
            }),
            Animated.delay(2000),
          ])
        );
        break;

      case "float":
      default:
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(anim1, {
              toValue: 1, duration: 1500,
              easing: Easing.inOut(Easing.sin), useNativeDriver: true,
            }),
            Animated.timing(anim1, {
              toValue: 0, duration: 1500,
              easing: Easing.inOut(Easing.sin), useNativeDriver: true,
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
        opacity: anim1.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.75, 1, 0.75],
        }),
        transform: [
          {
            scale: anim1.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.95, 1.08, 0.95],
            }),
          },
        ],
      };
      break;

    case "sparkle":
      animatedStyle = {
        opacity: anim1.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.7, 1, 0.7],
        }),
        transform: [
          {
            scale: anim1.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.92, 1.1, 0.92],
            }),
          },
        ],
      };
      break;

    case "heartbeat":
      animatedStyle = {
        transform: [
          {
            scale: anim1.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.15],
            }),
          },
        ],
      };
      break;

    case "wiggle":
      animatedStyle = {
        transform: [
          {
            rotate: anim1.interpolate({
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
            translateY: anim1.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -4],
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
            translateY: anim1.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -3],
            }),
          },
        ],
        opacity: anim1.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.8, 1, 0.8],
        }),
      };
      break;
  }

  return (
    <View style={{ width: size + 4, height: size + 4, alignItems: "center", justifyContent: "center" }}>
      <Animated.Text style={[{ fontSize: size }, animatedStyle]}>
        {emoji}
      </Animated.Text>
    </View>
  );
}
