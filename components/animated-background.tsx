import React, { useState, useEffect } from "react";
import { View, Text, Dimensions } from "react-native";
import { useBackgroundAnimationContext } from "@/lib/context/background-animation-context";

interface Particle {
  id: string;
  left: number;
  top: number;
  emoji: string;
  duration: number;
}

export function AnimatedBackground() {
  const context = useBackgroundAnimationContext();
  const { animationType, speed, animationIntensity } = context;
  const [particles, setParticles] = useState<Particle[]>([]);
  const dims = Dimensions.get("window");
  const width = dims.width || 400;
  const height = dims.height || 800;

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
        return String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96));
      default:
        return "";
    }
  };

  // Generate particles
  useEffect(() => {
    if (animationType === "none" || animationIntensity === 0) {
      setParticles([]);
      return;
    }

    const newParticles: Particle[] = [];
    for (let i = 0; i < animationIntensity; i++) {
      const duration = 3000 / speed + Math.random() * 2000;
      newParticles.push({
        id: `particle-${i}`,
        left: Math.random() * width,
        top: -50,
        emoji: getEmoji(),
        duration,
      });
    }
    setParticles(newParticles);
  }, [animationType, speed, animationIntensity, width]);

  // Regenerate particles periodically
  useEffect(() => {
    if (animationType === "none" || animationIntensity === 0) {
      return;
    }

    const interval = setInterval(() => {
      const refreshedParticles: Particle[] = [];
      for (let i = 0; i < animationIntensity; i++) {
        const duration = 3000 / speed + Math.random() * 2000;
        refreshedParticles.push({
          id: `particle-${Date.now()}-${i}`,
          left: Math.random() * width,
          top: -50,
          emoji: getEmoji(),
          duration,
        });
      }
      setParticles(refreshedParticles);
    }, 5000);

    return () => clearInterval(interval);
  }, [animationType, speed, animationIntensity, width]);

  if (animationType === "none" || animationIntensity === 0) {
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
      }}
    >
      {particles.map((particle) => (
        <ParticleAnimation
          key={particle.id}
          particle={particle}
          screenHeight={height}
          animationType={animationType}
        />
      ))}
    </View>
  );
}

interface ParticleAnimationProps {
  particle: Particle;
  screenHeight: number;
  animationType: string;
}

function ParticleAnimation({ particle, screenHeight, animationType }: ParticleAnimationProps) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    let startTime: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = (elapsed % particle.duration) / particle.duration;
      const newOffset = progress * (screenHeight + 100);

      setOffset(newOffset);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [particle.duration, screenHeight]);

  return (
    <View
      style={{
        position: "absolute",
        left: particle.left,
        top: particle.top + offset,
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
    </View>
  );
}
