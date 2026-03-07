import React from "react";
import { View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { ScreenWithBackground } from "@/components/screen-with-background";
import { useColors } from "@/hooks/use-colors";
import { KanbanBoard } from "@/components/kanban-board";

export default function KanbanScreen() {
  const colors = useColors();

  return (
    <ScreenWithBackground>
      <ScreenContainer className="bg-background">
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <KanbanBoard />
        </View>
      </ScreenContainer>
    </ScreenWithBackground>
  );
}
