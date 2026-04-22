import { useEffect, useRef } from "react";
import { View, Text, Pressable, Animated, Dimensions, Platform } from "react-native";
import type { AchievementDefinition } from "@/lib/domain/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const RARITY_COLORS = {
  common: "#9CA3AF",
  rare: "#3B82F6",
  epic: "#8B5CF6",
  legendary: "#F59E0B",
};

const RARITY_LABELS_EN = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

const RARITY_LABELS_RU = {
  common: "Обычное",
  rare: "Редкое",
  epic: "Эпическое",
  legendary: "Легендарное",
};

interface Props {
  achievement: AchievementDefinition;
  isRu: boolean;
  onDismiss: () => void;
}

export function AchievementCelebration({ achievement, isRu, onDismiss }: Props) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const emojiScale = useRef(new Animated.Value(0.3)).current;
  const sparkleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(emojiScale, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }),
    ]).start();

    // Sparkle loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(sparkleOpacity, { toValue: 0.3, duration: 600, useNativeDriver: true }),
      ])
    ).start();

    // Auto-dismiss after 4 seconds
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, []);

  const rarityColor = RARITY_COLORS[achievement.rarity];
  const rarityLabel = isRu ? RARITY_LABELS_RU[achievement.rarity] : RARITY_LABELS_EN[achievement.rarity];
  const title = isRu ? achievement.titleRu : achievement.titleEn;
  const description = isRu ? achievement.descriptionRu : achievement.descriptionEn;

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        alignItems: "center",
        opacity: opacityAnim,
      }}
    >
      <Pressable onPress={onDismiss} style={{ flex: 1, width: "100%", justifyContent: "center", alignItems: "center" }}>
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            width: SCREEN_WIDTH * 0.8,
            maxWidth: 320,
            backgroundColor: "#1A1A2E",
            borderRadius: 24,
            padding: 28,
            alignItems: "center",
            borderWidth: 3,
            borderColor: rarityColor,
            shadowColor: rarityColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 20,
            elevation: 20,
          }}
        >
          {/* Sparkle decorations */}
          <Animated.Text style={{ position: "absolute", top: 8, left: 16, fontSize: 20, opacity: sparkleOpacity }}>✨</Animated.Text>
          <Animated.Text style={{ position: "absolute", top: 12, right: 20, fontSize: 16, opacity: sparkleOpacity }}>⭐</Animated.Text>
          <Animated.Text style={{ position: "absolute", bottom: 12, left: 24, fontSize: 14, opacity: sparkleOpacity }}>🎉</Animated.Text>
          <Animated.Text style={{ position: "absolute", bottom: 16, right: 16, fontSize: 18, opacity: sparkleOpacity }}>✨</Animated.Text>

          {/* Header */}
          <Text style={{ fontSize: 14, color: "#FFD700", fontWeight: "800", letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" }}>
            {isRu ? "🏅 ДОСТИЖЕНИЕ" : "🏅 ACHIEVEMENT"}
          </Text>

          {/* Emoji sticker */}
          <Animated.View
            style={{
              transform: [{ scale: emojiScale }],
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: `${rarityColor}30`,
              borderWidth: 3,
              borderColor: rarityColor,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 56 }}>{achievement.emoji}</Text>
          </Animated.View>

          {/* Title */}
          <Text style={{ fontSize: 22, fontWeight: "800", color: "#FFFFFF", textAlign: "center", marginBottom: 6 }}>
            {title}
          </Text>

          {/* Rarity badge */}
          <View style={{ backgroundColor: `${rarityColor}40`, paddingHorizontal: 12, paddingVertical: 3, borderRadius: 10, marginBottom: 10 }}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: rarityColor }}>
              {rarityLabel}
            </Text>
          </View>

          {/* Description */}
          <Text style={{ fontSize: 14, color: "#B0B0C0", textAlign: "center", lineHeight: 20 }}>
            {description}
          </Text>

          {/* Tap to dismiss */}
          <Text style={{ fontSize: 11, color: "#666", marginTop: 16 }}>
            {isRu ? "Нажмите, чтобы закрыть" : "Tap to dismiss"}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
