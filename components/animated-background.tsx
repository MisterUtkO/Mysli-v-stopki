import React, { useEffect, useState } from "react";
import { View, Text, Animated, Dimensions } from "react-native";
import { useBackgroundAnimationContext } from "@/lib/context/background-animation-context";

interface Particle {
  id: string;
  initialLeft: number;
  emoji: string;
  animValue: Animated.Value;
}

export function AnimatedBackground() {
  const { animationType, speed, intensity } = useBackgroundAnimationContext();
  const [particles, setParticles] = useState<Particle[]>([]);
  const { width, height } = Dimensions.get("window");

  const getEmoji = () => {
    switch (animationType) {
      case "hearts":
        return "❤️";
      case "stars":
        return "⭐";
      case "bubbles":
        return "🫧";
      case "snowflakes":
        return "❄️";
      case "matrix":
        return String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96)); // Random Japanese/Cyrillic-like character
      default:
        return "";
    }
  };

  const getIntensityCount = () => {
    switch (intensity) {
      case "never":
        return 0;
      case "hourly":
        return 5;
      case "daily":
        return 10;
      case "weekly":
        return 15;
      case "every_30_min":
        return 20;
      default:
        return 10;
    }
  };

  useEffect(() => {
    if (animationType === "none" || getIntensityCount() === 0) {
      setParticles([]);
      return;
    }

    const newParticles: Particle[] = [];
    const count = getIntensityCount();
    const speedMultiplier = 3 / speed;

    for (let i = 0; i < count; i++) {
      const animValue = new Animated.Value(0);
      const particle: Particle = {
        id: `particle-${Date.now()}-${i}`,
        initialLeft: Math.random() * width,
        emoji: getEmoji(),
        animValue,
      };

      newParticles.push(particle);

      // Start animation
      const duration = 3000 * speedMultiplier * (0.5 + Math.random() * 0.5);
      const delay = (i * 200) / count;

      setTimeout(() => {
        Animated.timing(animValue, {
          toValue: height + 100,
          duration: duration,
          useNativeDriver: false,
        }).start(() => {
          // Reset animation when complete
          animValue.setValue(0);
        });
      }, delay);
    }

    setParticles(newParticles);

    // Restart animation periodically
    const interval = setInterval(() => {
      newParticles.forEach((particle, index) => {
        const duration = 3000 * speedMultiplier * (0.5 + Math.random() * 0.5);
        const delay = (index * 200) / count;

        setTimeout(() => {
          Animated.timing(particle.animValue, {
            toValue: height + 100,
            duration: duration,
            useNativeDriver: false,
          }).start(() => {
            particle.animValue.setValue(0);
          });
        }, delay);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [animationType, speed, intensity, width, height]);

  if (animationType === "none" || getIntensityCount() === 0) {
    return null;
  }

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 1,
      }}
    >
      {particles.map((particle) => (
        <Animated.View
          key={particle.id}
          style={{
            position: "absolute",
            left: particle.initialLeft,
            top: particle.animValue,
            opacity: 0.8,
          }}
        >
          <Text
            style={{
              fontSize: 32,
              lineHeight: 32,
              color: animationType === "matrix" ? "#00ff00" : "inherit",
              fontWeight: animationType === "matrix" ? "bold" : "normal",
            }}
          >
            {particle.emoji}
          </Text>
        </Animated.View>
      ))}
    </View>
  );
}
