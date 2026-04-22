import { View, Text, Pressable, ScrollView, Modal } from "react-native";
import { TASK_EMOJIS_BASE, ACHIEVEMENT_EMOJI_IDS } from "@/lib/domain/types";
import { useI18n } from "@/lib/context/i18n-context";
import { useAchievements } from "@/lib/context/achievement-context";
import { ACHIEVEMENTS } from "@/lib/services/achievement/definitions";

interface EmojiPickerProps {
  visible: boolean;
  onSelect: (emoji: string) => void;
  onClose: () => void;
  selectedEmoji?: string;
}

export function EmojiPicker({
  visible,
  onSelect,
  onClose,
  selectedEmoji,
}: EmojiPickerProps) {
  const { language } = useI18n();
  const isRu = language === "ru";
  const { unlocked } = useAchievements();

  const unlockedIds = new Set(unlocked.map((u) => u.achievementId));

  // Build unlocked achievement emojis list (in order of ACHIEVEMENT_EMOJI_IDS)
  const unlockedAchievementEmojis: { emoji: string; title: string }[] = [];
  const lockedAchievementEmojis: { emoji: string; title: string }[] = [];

  for (const id of ACHIEVEMENT_EMOJI_IDS) {
    const def = ACHIEVEMENTS.find((a) => a.id === id);
    if (!def) continue;
    const title = isRu ? def.titleRu : def.titleEn;
    if (unlockedIds.has(id)) {
      unlockedAchievementEmojis.push({ emoji: def.emoji, title });
    } else {
      lockedAchievementEmojis.push({ emoji: def.emoji, title });
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 16 }}>
        <View style={{ backgroundColor: "white", borderRadius: 12, padding: 16, width: "100%", maxWidth: 360, maxHeight: "80%" }}>
          <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12, color: "#11181C" }}>
            {isRu ? "Выберите эмодзи" : "Choose emoji"}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
            {/* Base emojis */}
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#687076", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {isRu ? "Базовые" : "Base"}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {TASK_EMOJIS_BASE.map((emoji) => (
                <Pressable
                  key={emoji}
                  onPress={() => {
                    onSelect(emoji);
                    onClose();
                  }}
                  style={({ pressed }) => ({
                    width: 56,
                    height: 56,
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: selectedEmoji === emoji ? "#0a7ea4" : "#f5f5f5",
                    borderWidth: 1,
                    borderColor: selectedEmoji === emoji ? "#0a7ea4" : "#E5E7EB",
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text style={{ fontSize: 30 }}>{emoji}</Text>
                </Pressable>
              ))}
            </View>

            {/* Unlocked achievement emojis */}
            {unlockedAchievementEmojis.length > 0 && (
              <>
                <Text style={{ fontSize: 12, fontWeight: "600", color: "#22C55E", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  🏆 {isRu ? "Разблокировано" : "Unlocked"}
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                  {unlockedAchievementEmojis.map(({ emoji, title }) => (
                    <Pressable
                      key={emoji}
                      onPress={() => {
                        onSelect(emoji);
                        onClose();
                      }}
                      style={({ pressed }) => ({
                        width: 56,
                        height: 56,
                        borderRadius: 10,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: selectedEmoji === emoji ? "#0a7ea4" : "#f0fdf4",
                        borderWidth: 1.5,
                        borderColor: selectedEmoji === emoji ? "#0a7ea4" : "#22C55E",
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      <Text style={{ fontSize: 30 }}>{emoji}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            {/* Locked achievement emojis */}
            {lockedAchievementEmojis.length > 0 && (
              <>
                <Text style={{ fontSize: 12, fontWeight: "600", color: "#9BA1A6", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  🔒 {isRu ? "Заблокировано (открывается через достижения)" : "Locked (unlock via achievements)"}
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                  {lockedAchievementEmojis.map(({ emoji, title }) => (
                    <View
                      key={emoji}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 10,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#f5f5f5",
                        borderWidth: 1,
                        borderColor: "#E5E7EB",
                        opacity: 0.4,
                      }}
                    >
                      <Text style={{ fontSize: 30 }}>{emoji}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </ScrollView>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => ({
              marginTop: 12,
              backgroundColor: "#f5f5f5",
              borderRadius: 10,
              padding: 12,
              alignItems: "center",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ fontWeight: "600", color: "#11181C" }}>
              {isRu ? "Закрыть" : "Close"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
