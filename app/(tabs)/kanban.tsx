import React from "react";
import { View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { ScreenTransition } from "@/components/screen-transition";
import { useColors } from "@/hooks/use-colors";
import { KanbanBoard } from "@/components/kanban-board";

export default function KanbanScreen() {
  const colors = useColors();

  return (
    <ScreenTransition>
      <ScreenContainer className="bg-background">
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <KanbanBoard />
        </View>
      </ScreenContainer>
    </ScreenTransition>
  );
}
