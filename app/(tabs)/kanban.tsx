import React, { useRef } from "react";
import { View } from "react-native";
import { ScreenContainer } from "@/components/common/screen-container";
import { ScreenTransition } from "@/components/animations/screen-transition";
import { useColors } from "@/hooks/use-colors";
import { KanbanBoard, type KanbanBoardRef } from "@/components/kanban/kanban-board";
import { useFocusEffect } from "expo-router";

export default function KanbanScreen() {
  const colors = useColors();
  const boardRef = useRef<KanbanBoardRef>(null);

  // Reload board data every time this tab comes into focus
  useFocusEffect(
    React.useCallback(() => {
      boardRef.current?.reload();
    }, [])
  );

  return (
    <ScreenTransition>
      <ScreenContainer className="bg-background">
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <KanbanBoard ref={boardRef} />
        </View>
      </ScreenContainer>
    </ScreenTransition>
  );
}
