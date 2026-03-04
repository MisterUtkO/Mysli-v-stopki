import React, { useEffect } from "react";
import { View, Text, Pressable, useWindowDimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withSpring,
  useAnimatedReaction,
  runOnJS,
} from "react-native-reanimated";
import type { AchievementDefinition } from "@/lib/domain/types";

interface AnimatedAchievementCardProps {
  achievement: AchievementDefinition;
  isUnlocked: boolean;
  itemSize: number;
  rarityColor: string;
  surfaceColor: string;
  borderColor: string;
  onPress: () => void;
}

const RARITY_COLORS = {
  common: "#9CA3AF",
  rare: "#3B82F6",
  epic: "#8B5CF6",
  legendary: "#F59E0B",
};

export function AnimatedAchievementCard({
  achievement,
  isUnlocked,
  itemSize,
  rarityColor,
  surfaceColor,
  borderColor,
  onPress,
}: AnimatedAchievementCardProps) {
  // Shared values for animations
  const scale = useSharedValue(1);
  const rotateZ = useSharedValue(0);
  const shadowOpacity = useSharedValue(isUnlocked ? 0.5 : 0);
  const pulseScale = useSharedValue(1);

  // Idle floating animation for unlocked achievements
  useEffect(() => {
    if (isUnlocked) {
      // Subtle floating animation
      rotateZ.value = withRepeat(
        withTiming(2, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );

      // Subtle pulse animation
      pulseScale.value = withRepeat(
        withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );

      // Glow pulse
      shadowOpacity.value = withRepeat(
        withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );
    }
  }, [isUnlocked]);

  // Animated style for the card
  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: pulseScale.value },
      { rotateZ: `${rotateZ.value}deg` },
    ],
  }));

  // Animated shadow style
  const animatedShadowStyle = useAnimatedStyle(() => ({
    shadowOpacity: shadowOpacity.value,
  }));

  const handlePress = () => {
    // Spring animation on press
    scale.value = withSpring(0.93, { damping: 8, mass: 1 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 8, mass: 1 });
    }, 100);
    onPress();
  };

  return (
    <Animated.View
      style={[
        {
          width: itemSize,
          height: itemSize,
          borderRadius: 14,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: isUnlocked ? `${rarityColor}20` : surfaceColor,
          borderWidth: 2,
          borderColor: isUnlocked ? rarityColor : borderColor,
          shadowColor: rarityColor,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 8,
          elevation: 6,
        },
        animatedCardStyle,
        animatedShadowStyle,
      ]}
    >
      <Pressable
        onPress={handlePress}
        style={{
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {isUnlocked ? (
          <Text style={{ fontSize: itemSize * 0.45 }}>{achievement.emoji}</Text>
        ) : (
          <View
            style={{
              width: itemSize * 0.5,
              height: itemSize * 0.5,
              borderRadius: itemSize * 0.25,
              backgroundColor: borderColor,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: itemSize * 0.22, color: "#9CA3AF" }}>?</Text>
          </View>
        )}
      </Pressable>

      {/* Rarity dot */}
      <View
        style={{
          position: "absolute",
          bottom: 4,
          right: 4,
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: isUnlocked ? rarityColor : borderColor,
        }}
      />
    </Animated.View>
  );
}
