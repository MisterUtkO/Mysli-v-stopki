import React, { useEffect, useState } from "react";
import { View, Animated, Dimensions, Text } from "react-native";
import { useColors } from "@/hooks/use-colors";

export type BackgroundAnimationType = "hearts" | "stars" | "bubbles" | "snowflakes" | "none";

interface AnimatedBackgroundProps {
  animationType: BackgroundAnimationType;
  speed: number; // 0.5 to 2.0
  intensity: number; // 0.2 to 1.0 (percentage of screen filled)
}

interface AnimatedElement {
  id: string;
  animatedValue: Animated.Value;
  duration: number;
  delay: number;
  size: number;
  horizontalOffset: number;
}

const WINDOW_HEIGHT = Dimensions.get("window").height;
const WINDOW_WIDTH = Dimensions.get("window").width;

// Generate random elements for animation
const generateElements = (
  count: number,
  duration: number
): AnimatedElement[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `element-${i}`,
    animatedValue: new Animated.Value(0),
    duration: duration + Math.random() * 1000,
    delay: Math.random() * 2000,
    size: 16 + Math.random() * 24,
    horizontalOffset: Math.random() * WINDOW_WIDTH - WINDOW_WIDTH / 2,
  }));
};

// Hearts animation
const HeartsAnimation: React.FC<Omit<AnimatedBackgroundProps, 'animationType'>> = ({
  speed,
  intensity,
}) => {
  const colors = useColors();
  const elementCount = Math.ceil(intensity * 15);
  const [elements] = useState(() =>
    generateElements(elementCount, 3000 / speed)
  );

  useEffect(() => {
    const animations = elements.map((element) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(element.delay),
          Animated.timing(element.animatedValue, {
            toValue: 1,
            duration: element.duration,
            useNativeDriver: true,
          }),
        ])
      )
    );

    animations.forEach((anim) => anim.start());

    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, [elements, speed]);

  return (
    <View
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {elements.map((element) => (
        <Animated.View
          key={element.id}
          style={{
            position: "absolute",
            left: WINDOW_WIDTH / 2 + element.horizontalOffset,
            top: -50,
            opacity: element.animatedValue.interpolate({
              inputRange: [0, 0.1, 0.9, 1],
              outputRange: [0, 1, 1, 0],
            }),
            transform: [
              {
                translateY: element.animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, WINDOW_HEIGHT + 100],
                }),
              },
              {
                rotate: element.animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "360deg"],
                }),
              },
            ],
          }}
        >
          <Text style={{ fontSize: element.size, color: colors.primary }}>
            ❤️
          </Text>
        </Animated.View>
      ))}
    </View>
  );
};

// Stars animation
const StarsAnimation: React.FC<Omit<AnimatedBackgroundProps, 'animationType'>> = ({
  speed,
  intensity,
}) => {
  const colors = useColors();
  const elementCount = Math.ceil(intensity * 20);
  const [elements] = useState(() =>
    generateElements(elementCount, 4000 / speed)
  );

  useEffect(() => {
    const animations = elements.map((element) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(element.delay),
          Animated.timing(element.animatedValue, {
            toValue: 1,
            duration: element.duration,
            useNativeDriver: true,
          }),
        ])
      )
    );

    animations.forEach((anim) => anim.start());

    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, [elements, speed]);

  return (
    <View
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {elements.map((element) => (
        <Animated.View
          key={element.id}
          style={{
            position: "absolute",
            left: WINDOW_WIDTH / 2 + element.horizontalOffset,
            top: -50,
            opacity: element.animatedValue.interpolate({
              inputRange: [0, 0.1, 0.9, 1],
              outputRange: [0, 0.8, 0.8, 0],
            }),
            transform: [
              {
                translateY: element.animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, WINDOW_HEIGHT + 100],
                }),
              },
              {
                scaleX: element.animatedValue.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.5, 1, 0.5],
                }),
              },
              {
                scaleY: element.animatedValue.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.5, 1, 0.5],
                }),
              },
            ],
          }}
        >
          <Text style={{ fontSize: element.size, color: colors.warning }}>
            ⭐
          </Text>
        </Animated.View>
      ))}
    </View>
  );
};

// Bubbles animation
const BubblesAnimation: React.FC<Omit<AnimatedBackgroundProps, 'animationType'>> = ({
  speed,
  intensity,
}) => {
  const colors = useColors();
  const elementCount = Math.ceil(intensity * 12);
  const [elements] = useState(() =>
    generateElements(elementCount, 5000 / speed)
  );

  useEffect(() => {
    const animations = elements.map((element) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(element.delay),
          Animated.timing(element.animatedValue, {
            toValue: 1,
            duration: element.duration,
            useNativeDriver: true,
          }),
        ])
      )
    );

    animations.forEach((anim) => anim.start());

    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, [elements, speed]);

  return (
    <View
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {elements.map((element) => (
        <Animated.View
          key={element.id}
          style={{
            position: "absolute",
            left: WINDOW_WIDTH / 2 + element.horizontalOffset,
            bottom: -50,
            opacity: element.animatedValue.interpolate({
              inputRange: [0, 0.1, 0.9, 1],
              outputRange: [0, 0.6, 0.6, 0],
            }),
            transform: [
              {
                translateY: element.animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -WINDOW_HEIGHT - 100],
                }),
              },
            ],
          }}
        >
          <View
            style={{
              width: element.size,
              height: element.size,
              borderRadius: element.size / 2,
              borderWidth: 2,
              borderColor: colors.primary,
              opacity: 0.5,
            }}
          />
        </Animated.View>
      ))}
    </View>
  );
};

// Snowflakes animation
const SnowflakesAnimation: React.FC<Omit<AnimatedBackgroundProps, 'animationType'>> = ({
  speed,
  intensity,
}) => {
  const colors = useColors();
  const elementCount = Math.ceil(intensity * 18);
  const [elements] = useState(() =>
    generateElements(elementCount, 6000 / speed)
  );

  useEffect(() => {
    const animations = elements.map((element) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(element.delay),
          Animated.timing(element.animatedValue, {
            toValue: 1,
            duration: element.duration,
            useNativeDriver: true,
          }),
        ])
      )
    );

    animations.forEach((anim) => anim.start());

    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, [elements, speed]);

  return (
    <View
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {elements.map((element) => (
        <Animated.View
          key={element.id}
          style={{
            position: "absolute",
            left: WINDOW_WIDTH / 2 + element.horizontalOffset,
            top: -50,
            opacity: element.animatedValue.interpolate({
              inputRange: [0, 0.1, 0.9, 1],
              outputRange: [0, 0.7, 0.7, 0],
            }),
            transform: [
              {
                translateY: element.animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, WINDOW_HEIGHT + 100],
                }),
              },
              {
                rotate: element.animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "720deg"],
                }),
              },
            ],
          }}
        >
          <Text style={{ fontSize: element.size, color: colors.muted }}>
            ❄️
          </Text>
        </Animated.View>
      ))}
    </View>
  );
};

// Main component
export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  animationType,
  speed,
  intensity,
}) => {
  if (animationType === "none") {
    return null;
  }

  switch (animationType) {
    case "hearts":
      return <HeartsAnimation speed={speed} intensity={intensity} />;
    case "stars":
      return <StarsAnimation speed={speed} intensity={intensity} />;
    case "bubbles":
      return <BubblesAnimation speed={speed} intensity={intensity} />;
    case "snowflakes":
      return <SnowflakesAnimation speed={speed} intensity={intensity} />;
    default:
      return null;
  }
};


