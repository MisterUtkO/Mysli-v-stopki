import { useEffect, useRef } from "react";
import { Animated, Easing, Platform, View } from "react-native";

/**
 * AnimatedEmoji — renders an emoji with VERY ACTIVE looping animation.
 * Includes shimmer/glow effects via pulsing shadow-like backgrounds.
 * Animations are aggressive and noticeable.
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

// Glow colors for shimmer effect
const GLOW_COLORS: Record<AnimationType, string> = {
  flicker: "#FF6B0020",
  sparkle: "#FFD70030",
  heartbeat: "#FF4D6D25",
  float: "#4FC3F720",
  wiggle: "#A78BFA20",
  bounce: "#34D39920",
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
  const anim2 = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const animType = getAnimationType(emoji);

  useEffect(() => {
    // Skip animations on web for performance
    if (Platform.OS === "web") return;

    const animations: Animated.CompositeAnimation[] = [];

    // Glow/shimmer pulse — always active
    animations.push(
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false, // backgroundColor can't use native driver
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 600,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
        ])
      )
    );

    switch (animType) {
      case "flicker":
        animations.push(
          Animated.loop(
            Animated.sequence([
              Animated.timing(anim1, {
                toValue: 1, duration: 250,
                easing: Easing.inOut(Easing.sin), useNativeDriver: true,
              }),
              Animated.timing(anim1, {
                toValue: 0, duration: 250,
                easing: Easing.inOut(Easing.sin), useNativeDriver: true,
              }),
              Animated.timing(anim1, {
                toValue: 0.8, duration: 200,
                easing: Easing.inOut(Easing.sin), useNativeDriver: true,
              }),
              Animated.timing(anim1, {
                toValue: 0.2, duration: 200,
                easing: Easing.inOut(Easing.sin), useNativeDriver: true,
              }),
            ])
          )
        );
        animations.push(
          Animated.loop(
            Animated.sequence([
              Animated.timing(anim2, {
                toValue: 1, duration: 200,
                easing: Easing.inOut(Easing.ease), useNativeDriver: true,
              }),
              Animated.timing(anim2, {
                toValue: -1, duration: 400,
                easing: Easing.inOut(Easing.ease), useNativeDriver: true,
              }),
              Animated.timing(anim2, {
                toValue: 0, duration: 200,
                easing: Easing.inOut(Easing.ease), useNativeDriver: true,
              }),
            ])
          )
        );
        break;

      case "sparkle":
        animations.push(
          Animated.loop(
            Animated.sequence([
              Animated.timing(anim1, {
                toValue: 1, duration: 400,
                easing: Easing.out(Easing.ease), useNativeDriver: true,
              }),
              Animated.timing(anim1, {
                toValue: 0, duration: 400,
                easing: Easing.in(Easing.ease), useNativeDriver: true,
              }),
              Animated.timing(anim1, {
                toValue: 0.7, duration: 300,
                easing: Easing.out(Easing.ease), useNativeDriver: true,
              }),
              Animated.timing(anim1, {
                toValue: 0.2, duration: 300,
                easing: Easing.in(Easing.ease), useNativeDriver: true,
              }),
            ])
          )
        );
        animations.push(
          Animated.loop(
            Animated.timing(anim2, {
              toValue: 1, duration: 1200,
              easing: Easing.linear, useNativeDriver: true,
            })
          )
        );
        break;

      case "heartbeat":
        animations.push(
          Animated.loop(
            Animated.sequence([
              Animated.timing(anim1, {
                toValue: 1, duration: 150,
                easing: Easing.out(Easing.ease), useNativeDriver: true,
              }),
              Animated.timing(anim1, {
                toValue: 0.2, duration: 120,
                easing: Easing.in(Easing.ease), useNativeDriver: true,
              }),
              Animated.timing(anim1, {
                toValue: 0.85, duration: 140,
                easing: Easing.out(Easing.ease), useNativeDriver: true,
              }),
              Animated.timing(anim1, {
                toValue: 0, duration: 200,
                easing: Easing.in(Easing.ease), useNativeDriver: true,
              }),
              Animated.delay(400),
            ])
          )
        );
        break;

      case "wiggle":
        animations.push(
          Animated.loop(
            Animated.sequence([
              Animated.timing(anim1, {
                toValue: 1, duration: 80,
                easing: Easing.inOut(Easing.ease), useNativeDriver: true,
              }),
              Animated.timing(anim1, {
                toValue: -1, duration: 160,
                easing: Easing.inOut(Easing.ease), useNativeDriver: true,
              }),
              Animated.timing(anim1, {
                toValue: 0.8, duration: 120,
                easing: Easing.inOut(Easing.ease), useNativeDriver: true,
              }),
              Animated.timing(anim1, {
                toValue: -0.6, duration: 120,
                easing: Easing.inOut(Easing.ease), useNativeDriver: true,
              }),
              Animated.timing(anim1, {
                toValue: 0.3, duration: 80,
                easing: Easing.inOut(Easing.ease), useNativeDriver: true,
              }),
              Animated.timing(anim1, {
                toValue: 0, duration: 80,
                easing: Easing.inOut(Easing.ease), useNativeDriver: true,
              }),
              Animated.delay(700),
            ])
          )
        );
        break;

      case "bounce":
        animations.push(
          Animated.loop(
            Animated.sequence([
              Animated.timing(anim1, {
                toValue: 1, duration: 200,
                easing: Easing.out(Easing.back(3)), useNativeDriver: true,
              }),
              Animated.timing(anim1, {
                toValue: 0, duration: 200,
                easing: Easing.in(Easing.ease), useNativeDriver: true,
              }),
              Animated.timing(anim1, {
                toValue: 0.6, duration: 150,
                easing: Easing.out(Easing.back(2)), useNativeDriver: true,
              }),
              Animated.timing(anim1, {
                toValue: 0, duration: 150,
                easing: Easing.in(Easing.ease), useNativeDriver: true,
              }),
              Animated.delay(500),
            ])
          )
        );
        break;

      case "float":
      default:
        animations.push(
          Animated.loop(
            Animated.sequence([
              Animated.timing(anim1, {
                toValue: 1, duration: 800,
                easing: Easing.inOut(Easing.sin), useNativeDriver: true,
              }),
              Animated.timing(anim1, {
                toValue: 0, duration: 800,
                easing: Easing.inOut(Easing.sin), useNativeDriver: true,
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
            scale: anim1.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.85, 1.3, 0.85],
            }),
          },
          {
            rotate: anim2.interpolate({
              inputRange: [-1, 0, 1],
              outputRange: ["-8deg", "0deg", "8deg"],
            }),
          },
        ],
        opacity: anim1.interpolate({
          inputRange: [0, 0.3, 0.7, 1],
          outputRange: [0.6, 1, 1, 0.6],
        }),
      };
      break;

    case "sparkle":
      animatedStyle = {
        opacity: anim1.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.5, 1, 0.5],
        }),
        transform: [
          {
            scale: anim1.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.8, 1.25, 0.8],
            }),
          },
          {
            rotate: anim2.interpolate({
              inputRange: [0, 1],
              outputRange: ["0deg", "20deg"],
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
              inputRange: [0, 0.2, 0.85, 1],
              outputRange: [1, 1.08, 1.3, 1.35],
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
              outputRange: ["-18deg", "0deg", "18deg"],
            }),
          },
          {
            scale: anim1.interpolate({
              inputRange: [-1, 0, 1],
              outputRange: [1.05, 1, 1.05],
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
              outputRange: [0, -8],
            }),
          },
          {
            scale: anim1.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [1, 1.15, 1.08],
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
              outputRange: [0, -5],
            }),
          },
          {
            scale: anim1.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.95, 1.08, 0.95],
            }),
          },
        ],
        opacity: anim1.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.7, 1, 0.7],
        }),
      };
      break;
  }

  const glowColor = GLOW_COLORS[animType];

  // Shimmer glow background
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.8],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.6],
  });

  return (
    <View style={{ width: size + 8, height: size + 8, alignItems: "center", justifyContent: "center" }}>
      {/* Shimmer glow layer */}
      <Animated.View
        style={{
          position: "absolute",
          width: size + 4,
          height: size + 4,
          borderRadius: (size + 4) / 2,
          backgroundColor: glowColor,
          opacity: glowOpacity,
          transform: [{ scale: glowScale }],
        }}
      />
      {/* Emoji */}
      <Animated.Text style={[{ fontSize: size }, animatedStyle]}>
        {emoji}
      </Animated.Text>
    </View>
  );
}
