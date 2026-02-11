import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  Dimensions,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useAchievements } from "@/lib/context/achievement-context";
import { useI18n } from "@/lib/context/i18n-context";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";
import type { AchievementDefinition } from "@/lib/domain/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_PADDING = 16;
const GRID_GAP = 10;
const COLUMNS = 4;
const ITEM_SIZE = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP * (COLUMNS - 1)) / COLUMNS;

const RARITY_COLORS = {
  common: "#9CA3AF",
  rare: "#3B82F6",
  epic: "#8B5CF6",
  legendary: "#F59E0B",
};

const RARITY_LABELS_EN = { common: "Common", rare: "Rare", epic: "Epic", legendary: "Legendary" };
const RARITY_LABELS_RU = { common: "Обычное", rare: "Редкое", epic: "Эпическое", legendary: "Легендарное" };

export default function AchievementsScreen() {
  const { achievements, unlocked } = useAchievements();
  const { language } = useI18n();
  const colors = useColors();
  const router = useRouter();
  const isRu = language === "ru";
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementDefinition | null>(null);

  const unlockedIds = new Set(unlocked.map((u) => u.achievementId));
  const unlockedCount = unlocked.length;
  const totalCount = achievements.length;

  const getUnlockDate = (id: string): string => {
    const item = unlocked.find((u) => u.achievementId === id);
    if (!item) return "";
    const d = new Date(item.unlockedAt);
    return d.toLocaleDateString(isRu ? "ru-RU" : "en-US", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <ScreenContainer className="p-4">
      <View className="flex-1">
        {/* Header */}
        <View style={{ marginBottom: 12 }}>
          <Text className="text-foreground font-bold" style={{ fontSize: 28, lineHeight: 34 }}>
            {isRu ? "Достижения" : "Achievements"}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text className="text-muted" style={{ fontSize: 14, marginTop: 4 }}>
              {isRu
                ? `Открыто: ${unlockedCount} из ${totalCount}`
                : `Unlocked: ${unlockedCount} of ${totalCount}`}
            </Text>
            <Pressable
              onPress={() => router.push("/statistics")}
              style={({ pressed }) => [{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.primary,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 10,
                opacity: pressed ? 0.7 : 1,
                gap: 4,
              }]}
            >
              <Text style={{ fontSize: 14 }}>📊</Text>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#FFF" }}>
                {isRu ? "Статистика" : "Stats"}
              </Text>
            </Pressable>
          </View>
          {/* Progress bar */}
          <View style={{ height: 6, backgroundColor: "#E5E7EB", borderRadius: 3, marginTop: 8, overflow: "hidden" }}>
            <View
              style={{
                height: 6,
                backgroundColor: "#F59E0B",
                borderRadius: 3,
                width: `${totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0}%`,
              }}
            />
          </View>
        </View>

        {/* Sticker Grid */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: GRID_GAP }}>
            {achievements.map((achievement) => {
              const isUnlocked = unlockedIds.has(achievement.id);
              const rarityColor = RARITY_COLORS[achievement.rarity];

              return (
                <Pressable
                  key={achievement.id}
                  onPress={() => setSelectedAchievement(achievement)}
                  style={({ pressed }) => [{
                    width: ITEM_SIZE,
                    height: ITEM_SIZE,
                    borderRadius: 16,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: isUnlocked ? `${rarityColor}15` : "#1A1A2E",
                    borderWidth: 2,
                    borderColor: isUnlocked ? rarityColor : "#333",
                    opacity: pressed ? 0.7 : 1,
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                    // Glow effect for unlocked
                    ...(isUnlocked ? {
                      shadowColor: rarityColor,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.4,
                      shadowRadius: 8,
                      elevation: 6,
                    } : {}),
                  }]}
                >
                  {isUnlocked ? (
                    <Text style={{ fontSize: ITEM_SIZE * 0.5 }}>{achievement.emoji}</Text>
                  ) : (
                    // Silhouette: dark circle with question mark
                    <View style={{
                      width: ITEM_SIZE * 0.6,
                      height: ITEM_SIZE * 0.6,
                      borderRadius: ITEM_SIZE * 0.3,
                      backgroundColor: "#0D0D1A",
                      justifyContent: "center",
                      alignItems: "center",
                    }}>
                      <Text style={{ fontSize: ITEM_SIZE * 0.3, color: "#333" }}>?</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Achievement Detail Modal */}
      <Modal
        visible={!!selectedAchievement}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedAchievement(null)}
      >
        {selectedAchievement && (
          <Pressable
            onPress={() => setSelectedAchievement(null)}
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.6)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Pressable
              onPress={() => {}} // Prevent closing when tapping modal content
              style={{
                width: SCREEN_WIDTH * 0.85,
                maxWidth: 340,
                backgroundColor: "#1A1A2E",
                borderRadius: 24,
                padding: 24,
                alignItems: "center",
                borderWidth: 2,
                borderColor: RARITY_COLORS[selectedAchievement.rarity],
              }}
            >
              {/* Emoji / Silhouette */}
              <View
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 45,
                  backgroundColor: unlockedIds.has(selectedAchievement.id)
                    ? `${RARITY_COLORS[selectedAchievement.rarity]}25`
                    : "#0D0D1A",
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 3,
                  borderColor: unlockedIds.has(selectedAchievement.id)
                    ? RARITY_COLORS[selectedAchievement.rarity]
                    : "#333",
                  marginBottom: 16,
                }}
              >
                {unlockedIds.has(selectedAchievement.id) ? (
                  <Text style={{ fontSize: 48 }}>{selectedAchievement.emoji}</Text>
                ) : (
                  <Text style={{ fontSize: 36, color: "#333" }}>🔒</Text>
                )}
              </View>

              {/* Title */}
              <Text style={{ fontSize: 20, fontWeight: "800", color: "#FFFFFF", textAlign: "center", marginBottom: 6 }}>
                {isRu ? selectedAchievement.titleRu : selectedAchievement.titleEn}
              </Text>

              {/* Rarity */}
              <View style={{
                backgroundColor: `${RARITY_COLORS[selectedAchievement.rarity]}40`,
                paddingHorizontal: 12, paddingVertical: 3, borderRadius: 10, marginBottom: 12,
              }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: RARITY_COLORS[selectedAchievement.rarity] }}>
                  {isRu ? RARITY_LABELS_RU[selectedAchievement.rarity] : RARITY_LABELS_EN[selectedAchievement.rarity]}
                </Text>
              </View>

              {/* Description (condition) - always shown */}
              <Text style={{ fontSize: 14, color: "#B0B0C0", textAlign: "center", lineHeight: 20, marginBottom: 8 }}>
                {isRu ? selectedAchievement.descriptionRu : selectedAchievement.descriptionEn}
              </Text>

              {/* Unlock date */}
              {unlockedIds.has(selectedAchievement.id) && (
                <Text style={{ fontSize: 12, color: "#22C55E", marginTop: 4 }}>
                  {isRu ? "Получено: " : "Unlocked: "}{getUnlockDate(selectedAchievement.id)}
                </Text>
              )}

              {!unlockedIds.has(selectedAchievement.id) && (
                <Text style={{ fontSize: 12, color: "#666", marginTop: 4, fontStyle: "italic" }}>
                  {isRu ? "Ещё не получено" : "Not yet unlocked"}
                </Text>
              )}

              {/* Close button */}
              <Pressable
                onPress={() => setSelectedAchievement(null)}
                style={({ pressed }) => [{
                  marginTop: 16,
                  backgroundColor: "#333",
                  paddingHorizontal: 24,
                  paddingVertical: 10,
                  borderRadius: 12,
                  opacity: pressed ? 0.7 : 1,
                }]}
              >
                <Text style={{ color: "#FFF", fontWeight: "600", fontSize: 14 }}>
                  {isRu ? "Закрыть" : "Close"}
                </Text>
              </Pressable>
            </Pressable>
          </Pressable>
        )}
      </Modal>
    </ScreenContainer>
  );
}
