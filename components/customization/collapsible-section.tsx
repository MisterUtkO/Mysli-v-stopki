import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface CollapsibleSectionProps {
  title: string;
  emoji?: string;
  children: React.ReactNode;
}

export function CollapsibleSection({ title, emoji, children }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const colors = useColors();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 12,
      }}
    >
      <Pressable
        onPress={() => setIsOpen(!isOpen)}
        style={({ pressed }) => ({
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: 14,
          paddingHorizontal: 14,
          backgroundColor: pressed ? colors.background : "transparent",
        })}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
          {emoji && <Text style={{ fontSize: 18 }}>{emoji}</Text>}
          <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 15, flex: 1 }}>
            {title}
          </Text>
        </View>
        <Text style={{ fontSize: 16, color: colors.muted, marginRight: 4 }}>
          {isOpen ? "▼" : "▶"}
        </Text>
      </Pressable>

      {isOpen && (
        <View
          style={{
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            gap: 8,
          }}
        >
          {children}
        </View>
      )}
    </View>
  );
}
