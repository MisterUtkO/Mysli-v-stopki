import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  useWindowDimensions,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { ScreenWithBackground } from "@/components/screen-with-background";
import { AnimatedAchievementCard } from "@/components/animated-achievement-card";
import { useAchievements } from "@/lib/context/achievement-context";
import { useI18n } from "@/lib/context/i18n-context";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";
import type { AchievementDefinition } from "@/lib/domain/types";

const GRID_PADDING = 16;
const GRID_GAP = 8;
const COLUMNS = 4;

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
  const { width: screenWidth } = useWindowDimensions();

  const itemSize = Math.floor((screenWidth - GRID_PADDING * 2 - GRID_GAP * (COLUMNS - 1)) / COLUMNS);

  const unlockedIds = new Set(unlocked.map((u) => u.achievementId));
  const unlockedCount = unlocked.length;
  const totalCount = achievements.length;

  const getUnlockDate = useCallback((id: string): string => {
    const item = unlocked.find((u) => u.achievementId === id);
    if (!item) return "";
    const d = new Date(item.unlockedAt);
    return d.toLocaleDateString(isRu ? "ru-RU" : "en-US", { day: "numeric", month: "short", year: "numeric" });
  }, [unlocked, isRu]);

  // Build rows of COLUMNS items each
  const rows: AchievementDefinition[][] = [];
  for (let i = 0; i < achievements.length; i += COLUMNS) {
    rows.push(achievements.slice(i, i + COLUMNS));
  }

  return (
    <ScreenWithBackground>
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
          <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3, marginTop: 8, overflow: "hidden" }}>
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

        {/* Sticker Grid — explicit rows to prevent layout issues */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={{ flexDirection: "row", gap: GRID_GAP, marginBottom: GRID_GAP }}>
              {row.map((achievement) => {
                const isUnlocked = unlockedIds.has(achievement.id);
                const rarityColor = RARITY_COLORS[achievement.rarity];

                return (
                  <AnimatedAchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    isUnlocked={isUnlocked}
                    itemSize={itemSize}
                    rarityColor={rarityColor}
                    surfaceColor={colors.surface}
                    borderColor={colors.border}
                    onPress={() => setSelectedAchievement(achievement)}
                  />
                );
              })}
              {/* Fill empty slots in last row */}
              {row.length < COLUMNS && Array.from({ length: COLUMNS - row.length }).map((_, i) => (
                <View key={`empty-${i}`} style={{ width: itemSize, height: itemSize }} />
              ))}
            </View>
          ))}
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
              onPress={() => {}}
              style={{
                width: screenWidth * 0.85,
                maxWidth: 340,
                backgroundColor: colors.surface,
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
                    : colors.border,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 3,
                  borderColor: unlockedIds.has(selectedAchievement.id)
                    ? RARITY_COLORS[selectedAchievement.rarity]
                    : colors.border,
                  marginBottom: 16,
                }}
              >
                {unlockedIds.has(selectedAchievement.id) ? (
                  <Text style={{ fontSize: 48 }}>{selectedAchievement.emoji}</Text>
                ) : (
                  <Text style={{ fontSize: 36, color: colors.muted }}>🔒</Text>
                )}
              </View>

              {/* Title */}
              <Text style={{ fontSize: 20, fontWeight: "800", color: colors.foreground, textAlign: "center", marginBottom: 6 }}>
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

              {/* Description */}
              <Text style={{ fontSize: 14, color: colors.muted, textAlign: "center", lineHeight: 20, marginBottom: 8 }}>
                {isRu ? selectedAchievement.descriptionRu : selectedAchievement.descriptionEn}
              </Text>

              {/* Unlock date */}
              {unlockedIds.has(selectedAchievement.id) && (
                <Text style={{ fontSize: 12, color: "#22C55E", marginTop: 4 }}>
                  {isRu ? "Получено: " : "Unlocked: "}{getUnlockDate(selectedAchievement.id)}
                </Text>
              )}

              {!unlockedIds.has(selectedAchievement.id) && (
                <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4, fontStyle: "italic" }}>
                  {isRu ? "Ещё не получено" : "Not yet unlocked"}
                </Text>
              )}

              {/* Close button */}
              <Pressable
                onPress={() => setSelectedAchievement(null)}
                style={({ pressed }) => [{
                  marginTop: 16,
                  backgroundColor: colors.border,
                  paddingHorizontal: 24,
                  paddingVertical: 10,
                  borderRadius: 12,
                  opacity: pressed ? 0.7 : 1,
                }]}
              >
                <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 14 }}>
                  {isRu ? "Закрыть" : "Close"}
                </Text>
              </Pressable>
            </Pressable>
          </Pressable>
        )}
      </Modal>
      </ScreenContainer>
    </ScreenWithBackground>
  );
}
