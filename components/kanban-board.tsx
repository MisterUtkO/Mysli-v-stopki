import React, { useState, useCallback, forwardRef, useImperativeHandle, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  Platform,
  Dimensions,
  StyleSheet,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useI18n } from "@/lib/context/i18n-context";
import { useColors } from "@/hooks/use-colors";
import { useTaskContext } from "@/lib/context/task-context";
import { KANBAN_STORAGE_KEY } from "@/lib/kanban-sync";

const STORAGE_KEY = KANBAN_STORAGE_KEY;
const SCREEN_WIDTH = Dimensions.get("window").width;

const STICKER_COLORS = [
  "#FFEB3B", "#FF9800", "#F44336", "#E91E63", "#9C27B0",
  "#2196F3", "#00BCD4", "#4CAF50", "#8BC34A", "#FFFFFF",
];

const TEXT_COLORS = [
  "#000000", "#333333", "#FFFFFF", "#F44336",
  "#2196F3", "#4CAF50", "#FF9800", "#9C27B0",
];

interface KanbanSticker {
  id: string;
  text: string;
  bgColor: string;
  textColor: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  stickers: KanbanSticker[];
}

interface KanbanData {
  columns: KanbanColumn[];
}

interface ColumnLayout {
  id: string;
  x: number;
  width: number;
}

interface DragState {
  sticker: KanbanSticker;
  fromColId: string;
  startX: number;
  startY: number;
}

const defaultData: KanbanData = {
  columns: [
    { id: "col_1", title: "Start", stickers: [] },
    { id: "col_2", title: "In Progress", stickers: [] },
    { id: "col_3", title: "Done", stickers: [] },
  ],
};

export interface KanbanBoardRef {
  reload: () => void;
}

// ─── Draggable Sticker ────────────────────────────────────────────────────────

interface DraggableStickerProps {
  sticker: KanbanSticker;
  columnId: string;
  colIndex: number;
  stickerIndex: number;
  totalInCol: number;
  totalCols: number;
  onPress: () => void;
  onDragStart: (state: DragState, pageX: number, pageY: number) => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  colors: ReturnType<typeof import("@/hooks/use-colors").useColors>;
}

function DraggableSticker({
  sticker,
  columnId,
  colIndex,
  stickerIndex,
  totalInCol,
  totalCols,
  onPress,
  onDragStart,
  onMoveLeft,
  onMoveRight,
  onMoveUp,
  onMoveDown,
  colors,
}: DraggableStickerProps) {
  const scale = useSharedValue(1);
  const isDragging = useSharedValue(false);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: isDragging.value ? 0.3 : 1,
  }));

  const rotation = (parseInt(sticker.id.slice(-2), 16) % 5 - 2) * 0.5;

  const startDrag = useCallback(
    (pageX: number, pageY: number) => {
      isDragging.value = true;
      onDragStart({ sticker, fromColId: columnId, startX: pageX, startY: pageY }, pageX, pageY);
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    },
    [sticker, columnId, onDragStart, isDragging]
  );

  const resetDrag = useCallback(() => {
    isDragging.value = false;
    scale.value = withSpring(1);
  }, [isDragging, scale]);

  // Long-press + pan gesture
  const longPress = Gesture.LongPress()
    .minDuration(400)
    .onStart((e) => {
      scale.value = withTiming(1.08, { duration: 150 });
      runOnJS(startDrag)(e.absoluteX, e.absoluteY);
    });

  const tap = Gesture.Tap()
    .maxDuration(300)
    .onEnd(() => {
      runOnJS(onPress)();
    });

  const composed = Gesture.Exclusive(longPress, tap);

  return (
    <View style={{ marginBottom: 5 }}>
      <GestureDetector gesture={composed}>
        <Animated.View
          style={[
            animStyle,
            {
              backgroundColor: sticker.bgColor,
              borderRadius: 4,
              padding: 8,
              minHeight: 36,
              shadowColor: "#000",
              shadowOffset: { width: 1, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 3,
              elevation: 3,
              transform: [{ rotate: `${rotation}deg` }, { scale: scale.value }],
            },
          ]}
        >
          {/* Pin */}
          <View style={{
            position: "absolute", top: -3, left: "50%", marginLeft: -5,
            width: 10, height: 10, borderRadius: 5,
            backgroundColor: "#E53935", borderWidth: 1.5, borderColor: "#B71C1C", zIndex: 1,
          }} />
          <Text style={{
            color: sticker.textColor, fontSize: 12, lineHeight: 16,
            fontFamily: Platform.OS === "ios" ? "Noteworthy" : undefined,
          }}>
            {sticker.text}
          </Text>
          {/* Linked task indicator */}
          {sticker.id.startsWith("task_") && (
            <Text style={{ fontSize: 9, color: sticker.textColor, opacity: 0.6, marginTop: 2 }}>🔗</Text>
          )}
        </Animated.View>
      </GestureDetector>

      {/* Navigation arrows: ← ↑ ↓ → */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
        <Pressable
          onPress={onMoveLeft}
          disabled={colIndex === 0}
          style={({ pressed }) => [{
            opacity: colIndex === 0 ? 0.2 : pressed ? 0.5 : 0.6,
            paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4,
            backgroundColor: `${colors.primary}15`,
          }]}
        >
          <Text style={{ fontSize: 11, color: colors.primary, fontWeight: "700" }}>←</Text>
        </Pressable>
        <View style={{ flexDirection: "row", gap: 4 }}>
          <Pressable
            onPress={onMoveUp}
            disabled={stickerIndex === 0}
            style={({ pressed }) => [{
              opacity: stickerIndex === 0 ? 0.2 : pressed ? 0.5 : 0.6,
              paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4,
              backgroundColor: `${colors.primary}15`,
            }]}
          >
            <Text style={{ fontSize: 11, color: colors.primary, fontWeight: "700" }}>↑</Text>
          </Pressable>
          <Pressable
            onPress={onMoveDown}
            disabled={stickerIndex === totalInCol - 1}
            style={({ pressed }) => [{
              opacity: stickerIndex === totalInCol - 1 ? 0.2 : pressed ? 0.5 : 0.6,
              paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4,
              backgroundColor: `${colors.primary}15`,
            }]}
          >
            <Text style={{ fontSize: 11, color: colors.primary, fontWeight: "700" }}>↓</Text>
          </Pressable>
        </View>
        <Pressable
          onPress={onMoveRight}
          disabled={colIndex === totalCols - 1}
          style={({ pressed }) => [{
            opacity: colIndex === totalCols - 1 ? 0.2 : pressed ? 0.5 : 0.6,
            paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4,
            backgroundColor: `${colors.primary}15`,
          }]}
        >
          <Text style={{ fontSize: 11, color: colors.primary, fontWeight: "700" }}>→</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Main Board ───────────────────────────────────────────────────────────────

export const KanbanBoard = forwardRef<KanbanBoardRef, object>(function KanbanBoardInner(_props, ref) {
  const { t, language } = useI18n();
  const colors = useColors();
  const isRu = language === "ru";
  const { updateTask } = useTaskContext();

  const [data, setData] = useState<KanbanData>(defaultData);
  const [loaded, setLoaded] = useState(false);
  const [scale, setScale] = useState(1);

  // Add sticker modal
  const [showAddSticker, setShowAddSticker] = useState(false);
  const [addStickerColumnId, setAddStickerColumnId] = useState<string | null>(null);
  const [newStickerText, setNewStickerText] = useState("");
  const [newStickerBg, setNewStickerBg] = useState("#FFEB3B");
  const [newStickerTextColor, setNewStickerTextColor] = useState("#000000");
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showTextPicker, setShowTextPicker] = useState(false);

  // Add column modal
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  // Edit sticker modal
  const [editingSticker, setEditingSticker] = useState<{ columnId: string; sticker: KanbanSticker } | null>(null);

  // Move sticker modal
  const [movingSticker, setMovingSticker] = useState<{ columnId: string; sticker: KanbanSticker } | null>(null);

  // Rename column modal
  const [renamingColumn, setRenamingColumn] = useState<{ id: string; title: string } | null>(null);
  const [renameText, setRenameText] = useState("");

  // Drag state
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [hoveredColId, setHoveredColId] = useState<string | null>(null);
  const columnLayouts = useRef<ColumnLayout[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const boardOffsetX = useRef(0);

  // ─── Data loading ───────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setData(JSON.parse(stored));
      } else {
        setData({
          columns: [
            { id: "col_1", title: isRu ? "Начать" : "Start", stickers: [] },
            { id: "col_2", title: isRu ? "В процессе" : "In Progress", stickers: [] },
            { id: "col_3", title: isRu ? "Готово" : "Done", stickers: [] },
          ],
        });
      }
    } catch (e) {
      console.log("Failed to load kanban:", e);
    }
    setLoaded(true);
  }, [isRu]);

  React.useEffect(() => { loadData(); }, [loadData]);
  useImperativeHandle(ref, () => ({ reload: loadData }), [loadData]);

  const saveData = useCallback(async (newData: KanbanData) => {
    setData(newData);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (e) {
      console.log("Failed to save kanban:", e);
    }
  }, []);

  // ─── Column operations ──────────────────────────────────────────────────────

  const handleAddColumn = () => {
    if (!newColumnName.trim()) return;
    const newCol: KanbanColumn = {
      id: `col_${Date.now()}`,
      title: newColumnName.trim(),
      stickers: [],
    };
    saveData({ columns: [...data.columns, newCol] });
    setNewColumnName("");
    setShowAddColumn(false);
  };

  const handleRenameColumn = () => {
    if (!renamingColumn || !renameText.trim()) return;
    const newColumns = data.columns.map((col) =>
      col.id === renamingColumn.id ? { ...col, title: renameText.trim() } : col
    );
    saveData({ columns: newColumns });
    setRenamingColumn(null);
    setRenameText("");
  };

  const handleDeleteColumn = (colId: string) => {
    const col = data.columns.find((c) => c.id === colId);
    Alert.alert(
      isRu ? "Удалить столбец?" : "Delete column?",
      `"${col?.title}"${col && col.stickers.length > 0 ? (isRu ? ` (${col.stickers.length} стикеров)` : ` (${col.stickers.length} stickers)`) : ""}`,
      [
        { text: isRu ? "Отмена" : "Cancel", style: "cancel" },
        { text: isRu ? "Удалить" : "Delete", style: "destructive", onPress: () => saveData({ columns: data.columns.filter((c) => c.id !== colId) }) },
      ]
    );
  };

  // ─── Sticker operations ─────────────────────────────────────────────────────

  const handleAddSticker = () => {
    if (!newStickerText.trim() || !addStickerColumnId) return;
    const sticker: KanbanSticker = {
      id: `s_${Date.now()}`,
      text: newStickerText.trim(),
      bgColor: newStickerBg,
      textColor: newStickerTextColor,
    };
    const newColumns = data.columns.map((col) =>
      col.id === addStickerColumnId ? { ...col, stickers: [...col.stickers, sticker] } : col
    );
    saveData({ columns: newColumns });
    setNewStickerText("");
    setNewStickerBg("#FFEB3B");
    setNewStickerTextColor("#000000");
    setShowAddSticker(false);
    setShowBgPicker(false);
    setShowTextPicker(false);
  };

  const handleDeleteSticker = (columnId: string, stickerId: string) => {
    const newColumns = data.columns.map((col) =>
      col.id === columnId ? { ...col, stickers: col.stickers.filter((s) => s.id !== stickerId) } : col
    );
    saveData({ columns: newColumns });
  };

  const handleMoveSticker = useCallback((fromColId: string, sticker: KanbanSticker, targetColumnId: string) => {
    if (fromColId === targetColumnId) return;
    const newColumns = data.columns.map((col) => {
      if (col.id === fromColId) return { ...col, stickers: col.stickers.filter((s) => s.id !== sticker.id) };
      if (col.id === targetColumnId) return { ...col, stickers: [...col.stickers, sticker] };
      return col;
    });
    saveData({ columns: newColumns });

    // Reverse sync to task
    if (sticker.id.startsWith("task_")) {
      const targetColIndex = newColumns.findIndex((c) => c.id === targetColumnId);
      const STATUS_MAP: Record<number, "not_started" | "in_progress" | "completed"> = {
        0: "not_started",
        1: "in_progress",
        2: "completed",
      };
      const newStatus = STATUS_MAP[targetColIndex];
      if (newStatus) {
        const withoutPrefix = sticker.id.replace(/^task_/, "");
        const taskId = withoutPrefix.replace(/_\d+$/, "");
        if (taskId) {
          updateTask(taskId, { status: newStatus }).catch((e) =>
            console.error("[KanbanBoard] Failed to reverse-sync task status:", e)
          );
        }
      }
    }
  }, [data.columns, saveData, updateTask]);

  const handleMoveArrow = (columnId: string, sticker: KanbanSticker, direction: "left" | "right") => {
    const colIndex = data.columns.findIndex((c) => c.id === columnId);
    if (colIndex < 0) return;
    const targetIndex = direction === "left" ? colIndex - 1 : colIndex + 1;
    if (targetIndex < 0 || targetIndex >= data.columns.length) return;
    handleMoveSticker(columnId, sticker, data.columns[targetIndex].id);
  };

  const handleSwapVertical = (columnId: string, stickerId: string, direction: "up" | "down") => {
    const newColumns = data.columns.map((col) => {
      if (col.id !== columnId) return col;
      const idx = col.stickers.findIndex((s) => s.id === stickerId);
      if (idx < 0) return col;
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= col.stickers.length) return col;
      const newStickers = [...col.stickers];
      [newStickers[idx], newStickers[targetIdx]] = [newStickers[targetIdx], newStickers[idx]];
      return { ...col, stickers: newStickers };
    });
    saveData({ columns: newColumns });
  };

  // ─── Drag-and-drop ──────────────────────────────────────────────────────────

  const handleDragStart = useCallback((state: DragState, pageX: number, pageY: number) => {
    setDragging(state);
    setDragX(pageX);
    setDragY(pageY);
    setHoveredColId(state.fromColId);
  }, []);

  const getColIdAtX = useCallback((pageX: number): string | null => {
    // Adjust for board horizontal scroll offset
    const relX = pageX - boardOffsetX.current;
    for (const layout of columnLayouts.current) {
      if (relX >= layout.x && relX <= layout.x + layout.width) {
        return layout.id;
      }
    }
    return null;
  }, []);

  const handleDragMove = useCallback((pageX: number, pageY: number) => {
    setDragX(pageX);
    setDragY(pageY);
    const colId = getColIdAtX(pageX);
    setHoveredColId(colId);
  }, [getColIdAtX]);

  const handleDragEnd = useCallback((pageX: number) => {
    if (!dragging) return;
    const targetColId = getColIdAtX(pageX);
    if (targetColId && targetColId !== dragging.fromColId) {
      handleMoveSticker(dragging.fromColId, dragging.sticker, targetColId);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
    setDragging(null);
    setHoveredColId(null);
  }, [dragging, getColIdAtX, handleMoveSticker]);

  // Board-level pan gesture to track drag movement and end
  const boardPan = Gesture.Pan()
    .enabled(dragging !== null)
    .onUpdate((e) => {
      runOnJS(handleDragMove)(e.absoluteX, e.absoluteY);
    })
    .onEnd((e) => {
      runOnJS(handleDragEnd)(e.absoluteX);
    })
    .onFinalize(() => {
      runOnJS(setDragging)(null);
      runOnJS(setHoveredColId)(null);
    });

  // ─── Zoom ───────────────────────────────────────────────────────────────────

  const zoomIn = () => setScale((s) => Math.min(s + 0.15, 2));
  const zoomOut = () => setScale((s) => Math.max(s - 0.15, 0.5));

  const COLUMN_WIDTH = Math.max(180, (SCREEN_WIDTH - 60) / Math.min(data.columns.length, 3));

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {/* Zoom controls */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Pressable
              onPress={zoomOut}
              style={({ pressed }) => [styles.zoomBtn, { opacity: pressed ? 0.6 : 1, backgroundColor: colors.surface }]}
            >
              <Text style={{ fontSize: 18, color: colors.foreground, fontWeight: "700" }}>−</Text>
            </Pressable>
            <Text style={{ fontSize: 12, color: colors.muted, fontWeight: "600" }}>{Math.round(scale * 100)}%</Text>
            <Pressable
              onPress={zoomIn}
              style={({ pressed }) => [styles.zoomBtn, { opacity: pressed ? 0.6 : 1, backgroundColor: colors.surface }]}
            >
              <Text style={{ fontSize: 18, color: colors.foreground, fontWeight: "700" }}>+</Text>
            </Pressable>
          </View>
          <Pressable
            onPress={() => setShowAddColumn(true)}
            style={({ pressed }) => [{
              flexDirection: "row", alignItems: "center",
              backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6,
              borderRadius: 8, opacity: pressed ? 0.7 : 1,
            }]}
          >
            <Text style={{ color: "#FFF", fontSize: 13, fontWeight: "700" }}>+ {t.matrix.addColumn}</Text>
          </Pressable>
        </View>

        {/* Drag hint */}
        {!dragging && (
          <Text style={{ textAlign: "center", fontSize: 11, color: colors.muted, marginBottom: 4 }}>
            {isRu ? "Удерживайте стикер для перетаскивания" : "Long-press a sticker to drag it"}
          </Text>
        )}

        {/* Board */}
        <GestureDetector gesture={boardPan}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled={!dragging}
            contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 8 }}
            style={{ flex: 1 }}
            onLayout={(e) => {
              boardOffsetX.current = e.nativeEvent.layout.x;
            }}
            ref={scrollViewRef}
          >
            <View style={{ flexDirection: "row", gap: 10, transform: [{ scale }] }}>
              {data.columns.map((column, colIndex) => {
                const isHovered = hoveredColId === column.id && dragging !== null && dragging.fromColId !== column.id;
                return (
                  <View
                    key={column.id}
                    onLayout={(e) => {
                      const { x, width } = e.nativeEvent.layout;
                      const existing = columnLayouts.current.findIndex((l) => l.id === column.id);
                      const entry = { id: column.id, x, width };
                      if (existing >= 0) {
                        columnLayouts.current[existing] = entry;
                      } else {
                        columnLayouts.current.push(entry);
                      }
                    }}
                    style={{
                      width: COLUMN_WIDTH,
                      backgroundColor: isHovered ? `${colors.primary}20` : colors.surface,
                      borderRadius: 14,
                      borderWidth: isHovered ? 2 : 1,
                      borderColor: isHovered ? colors.primary : colors.border,
                      overflow: "hidden",
                      flex: 1,
                      minHeight: 300,
                    }}
                  >
                    {/* Column header */}
                    <View style={{
                      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                      paddingHorizontal: 10, paddingVertical: 8,
                      borderBottomWidth: 1, borderBottomColor: colors.border,
                      backgroundColor: isHovered ? `${colors.primary}30` : `${colors.primary}15`,
                    }}>
                      <Text style={{ fontSize: 14, fontWeight: "800", color: colors.foreground, flex: 1 }} numberOfLines={1}>
                        {column.title}
                      </Text>
                      <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                        <Text style={{ fontSize: 11, color: colors.muted, fontWeight: "600", backgroundColor: `${colors.primary}20`, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8 }}>
                          {column.stickers.length}
                        </Text>
                        <Pressable
                          onPress={() => { setRenamingColumn({ id: column.id, title: column.title }); setRenameText(column.title); }}
                          style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1, padding: 2 }]}
                        >
                          <Text style={{ fontSize: 13 }}>✏️</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => handleDeleteColumn(column.id)}
                          style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1, padding: 2 }]}
                        >
                          <Text style={{ fontSize: 13 }}>🗑</Text>
                        </Pressable>
                      </View>
                    </View>

                    {/* Stickers */}
                    <ScrollView
                      style={{ flex: 1, paddingHorizontal: 6, paddingTop: 6 }}
                      showsVerticalScrollIndicator={false}
                      scrollEnabled={!dragging}
                    >
                      {column.stickers.length === 0 ? (
                        <Text style={{ color: colors.muted, fontSize: 12, fontStyle: "italic", textAlign: "center", paddingVertical: 12 }}>
                          {isHovered
                            ? (isRu ? "Отпустите здесь" : "Drop here")
                            : t.matrix.emptyColumn}
                        </Text>
                      ) : (
                        column.stickers.map((sticker, stickerIndex) => (
                          <DraggableSticker
                            key={sticker.id}
                            sticker={sticker}
                            columnId={column.id}
                            colIndex={colIndex}
                            stickerIndex={stickerIndex}
                            totalInCol={column.stickers.length}
                            totalCols={data.columns.length}
                            colors={colors}
                            onPress={() => setEditingSticker({ columnId: column.id, sticker })}
                            onDragStart={handleDragStart}
                            onMoveLeft={() => colIndex > 0 && handleMoveArrow(column.id, sticker, "left")}
                            onMoveRight={() => colIndex < data.columns.length - 1 && handleMoveArrow(column.id, sticker, "right")}
                            onMoveUp={() => stickerIndex > 0 && handleSwapVertical(column.id, sticker.id, "up")}
                            onMoveDown={() => stickerIndex < column.stickers.length - 1 && handleSwapVertical(column.id, sticker.id, "down")}
                          />
                        ))
                      )}
                      {/* Drop zone indicator when dragging over non-empty column */}
                      {isHovered && column.stickers.length > 0 && (
                        <View style={{
                          height: 48, borderRadius: 6, borderWidth: 2, borderStyle: "dashed",
                          borderColor: colors.primary, backgroundColor: `${colors.primary}10`,
                          justifyContent: "center", alignItems: "center", marginBottom: 6,
                        }}>
                          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "700" }}>
                            {isRu ? "↓ Отпустите здесь" : "↓ Drop here"}
                          </Text>
                        </View>
                      )}
                      <View style={{ height: 6 }} />
                    </ScrollView>

                    {/* Add sticker button */}
                    <Pressable
                      onPress={() => { setAddStickerColumnId(column.id); setShowAddSticker(true); }}
                      style={({ pressed }) => [{
                        flexDirection: "row", alignItems: "center", justifyContent: "center",
                        paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border,
                        backgroundColor: `${colors.primary}15`,
                        opacity: pressed ? 0.6 : 1,
                      }]}
                    >
                      <Text style={{ fontSize: 14, color: colors.primary, fontWeight: "800" }}>
                        + {t.matrix.newSticker}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </GestureDetector>

        {/* Floating drag ghost */}
        {dragging && (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: dragX - 50,
              top: dragY - 30,
              width: 100,
              zIndex: 9999,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.35,
              shadowRadius: 12,
              elevation: 20,
              transform: [{ rotate: "-3deg" }, { scale: 1.1 }],
            }}
          >
            <View style={{
              backgroundColor: dragging.sticker.bgColor,
              borderRadius: 4, padding: 8,
            }}>
              <View style={{
                position: "absolute", top: -3, left: "50%", marginLeft: -5,
                width: 10, height: 10, borderRadius: 5,
                backgroundColor: "#E53935", borderWidth: 1.5, borderColor: "#B71C1C",
              }} />
              <Text style={{
                color: dragging.sticker.textColor, fontSize: 12, lineHeight: 16,
                fontFamily: Platform.OS === "ios" ? "Noteworthy" : undefined,
              }} numberOfLines={3}>
                {dragging.sticker.text}
              </Text>
            </View>
          </View>
        )}

        {/* Add Sticker Modal */}
        <Modal visible={showAddSticker} transparent animationType="slide" onRequestClose={() => setShowAddSticker(false)}>
          <Pressable onPress={() => setShowAddSticker(false)} style={styles.modalOverlay}>
            <Pressable onPress={() => {}} style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>{t.matrix.addSticker}</Text>

              <TextInput
                value={newStickerText}
                onChangeText={setNewStickerText}
                placeholder={isRu ? "Текст стикера..." : "Sticker text..."}
                placeholderTextColor={colors.muted}
                multiline
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleAddSticker}
                style={{
                  backgroundColor: newStickerBg, color: newStickerTextColor,
                  borderRadius: 8, padding: 12, fontSize: 15,
                  minHeight: 80, textAlignVertical: "top", marginBottom: 12,
                }}
              />

              <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
                <Pressable
                  onPress={() => { setShowBgPicker(!showBgPicker); setShowTextPicker(false); }}
                  style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", gap: 6, opacity: pressed ? 0.7 : 1 }]}
                >
                  <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: newStickerBg, borderWidth: 2, borderColor: colors.border }} />
                  <Text style={{ fontSize: 12, color: colors.muted }}>{t.matrix.stickerColor}</Text>
                </Pressable>
                <Pressable
                  onPress={() => { setShowTextPicker(!showTextPicker); setShowBgPicker(false); }}
                  style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", gap: 6, opacity: pressed ? 0.7 : 1 }]}
                >
                  <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: newStickerTextColor, borderWidth: 2, borderColor: colors.border }} />
                  <Text style={{ fontSize: 12, color: colors.muted }}>{t.matrix.textColor}</Text>
                </Pressable>
              </View>

              {showBgPicker && (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                  {STICKER_COLORS.map((c) => (
                    <Pressable
                      key={c}
                      onPress={() => { setNewStickerBg(c); setShowBgPicker(false); }}
                      style={{
                        width: 36, height: 36, borderRadius: 18, backgroundColor: c,
                        borderWidth: newStickerBg === c ? 3 : 1,
                        borderColor: newStickerBg === c ? colors.primary : colors.border,
                      }}
                    />
                  ))}
                </View>
              )}

              {showTextPicker && (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                  {TEXT_COLORS.map((c) => (
                    <Pressable
                      key={c}
                      onPress={() => { setNewStickerTextColor(c); setShowTextPicker(false); }}
                      style={{
                        width: 36, height: 36, borderRadius: 18, backgroundColor: c,
                        borderWidth: newStickerTextColor === c ? 3 : 1,
                        borderColor: newStickerTextColor === c ? colors.primary : colors.border,
                      }}
                    />
                  ))}
                </View>
              )}

              <View style={{ flexDirection: "row", gap: 10 }}>
                <Pressable
                  onPress={() => { setShowAddSticker(false); setShowBgPicker(false); setShowTextPicker(false); }}
                  style={({ pressed }) => [styles.modalBtn, { backgroundColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
                >
                  <Text style={{ color: colors.foreground, fontWeight: "600" }}>{t.common.cancel}</Text>
                </Pressable>
                <Pressable
                  onPress={handleAddSticker}
                  style={({ pressed }) => [styles.modalBtn, { backgroundColor: colors.primary, flex: 1, opacity: pressed ? 0.7 : 1 }]}
                >
                  <Text style={{ color: "#FFF", fontWeight: "700" }}>{t.common.add}</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Add Column Modal */}
        <Modal visible={showAddColumn} transparent animationType="fade" onRequestClose={() => setShowAddColumn(false)}>
          <Pressable onPress={() => setShowAddColumn(false)} style={styles.modalOverlay}>
            <Pressable onPress={() => {}} style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>{t.matrix.addColumn}</Text>
              <TextInput
                value={newColumnName}
                onChangeText={setNewColumnName}
                placeholder={t.matrix.columnName}
                placeholderTextColor={colors.muted}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleAddColumn}
                style={{
                  backgroundColor: colors.background, color: colors.foreground,
                  borderRadius: 10, padding: 12, fontSize: 15,
                  borderWidth: 1, borderColor: colors.border, marginBottom: 16,
                }}
              />
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Pressable
                  onPress={() => setShowAddColumn(false)}
                  style={({ pressed }) => [styles.modalBtn, { backgroundColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
                >
                  <Text style={{ color: colors.foreground, fontWeight: "600" }}>{t.common.cancel}</Text>
                </Pressable>
                <Pressable
                  onPress={handleAddColumn}
                  style={({ pressed }) => [styles.modalBtn, { backgroundColor: colors.primary, flex: 1, opacity: pressed ? 0.7 : 1 }]}
                >
                  <Text style={{ color: "#FFF", fontWeight: "700" }}>{t.common.add}</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Edit/Delete Sticker Modal */}
        <Modal visible={!!editingSticker} transparent animationType="fade" onRequestClose={() => setEditingSticker(null)}>
          {editingSticker && (
            <Pressable onPress={() => setEditingSticker(null)} style={styles.modalOverlay}>
              <Pressable onPress={() => {}} style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                <View style={{
                  backgroundColor: editingSticker.sticker.bgColor,
                  borderRadius: 8, padding: 14, marginBottom: 16, minHeight: 60,
                }}>
                  <Text style={{ color: editingSticker.sticker.textColor, fontSize: 14, lineHeight: 20 }}>
                    {editingSticker.sticker.text}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Pressable
                    onPress={() => {
                      setMovingSticker(editingSticker);
                      setEditingSticker(null);
                    }}
                    style={({ pressed }) => [styles.modalBtn, { backgroundColor: "#3B82F6", opacity: pressed ? 0.7 : 1 }]}
                  >
                    <Text style={{ color: "#FFF", fontWeight: "600" }}>📋 {isRu ? "Переместить" : "Move"}</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      handleDeleteSticker(editingSticker.columnId, editingSticker.sticker.id);
                      setEditingSticker(null);
                    }}
                    style={({ pressed }) => [styles.modalBtn, { backgroundColor: "#EF4444", opacity: pressed ? 0.7 : 1 }]}
                  >
                    <Text style={{ color: "#FFF", fontWeight: "600" }}>🗑 {t.common.delete}</Text>
                  </Pressable>
                </View>

                <Pressable
                  onPress={() => setEditingSticker(null)}
                  style={({ pressed }) => [styles.modalBtn, { backgroundColor: colors.border, marginTop: 8, opacity: pressed ? 0.7 : 1 }]}
                >
                  <Text style={{ color: colors.foreground, fontWeight: "600" }}>{t.common.close}</Text>
                </Pressable>
              </Pressable>
            </Pressable>
          )}
        </Modal>

        {/* Rename Column Modal */}
        <Modal visible={!!renamingColumn} transparent animationType="fade" onRequestClose={() => setRenamingColumn(null)}>
          <Pressable onPress={() => setRenamingColumn(null)} style={styles.modalOverlay}>
            <Pressable onPress={() => {}} style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                {isRu ? "Переименовать столбец" : "Rename Column"}
              </Text>
              <TextInput
                value={renameText}
                onChangeText={setRenameText}
                placeholder={isRu ? "Новое название..." : "New name..."}
                placeholderTextColor={colors.muted}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleRenameColumn}
                style={{
                  backgroundColor: colors.background, color: colors.foreground,
                  borderRadius: 10, padding: 12, fontSize: 15,
                  borderWidth: 1, borderColor: colors.border, marginBottom: 16,
                }}
              />
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Pressable
                  onPress={() => setRenamingColumn(null)}
                  style={({ pressed }) => [styles.modalBtn, { backgroundColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
                >
                  <Text style={{ color: colors.foreground, fontWeight: "600" }}>{t.common.cancel}</Text>
                </Pressable>
                <Pressable
                  onPress={handleRenameColumn}
                  style={({ pressed }) => [styles.modalBtn, { backgroundColor: colors.primary, flex: 1, opacity: pressed ? 0.7 : 1 }]}
                >
                  <Text style={{ color: "#FFF", fontWeight: "700" }}>{t.common.save}</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Move Sticker Modal */}
        <Modal visible={!!movingSticker} transparent animationType="fade" onRequestClose={() => setMovingSticker(null)}>
          {movingSticker && (
            <Pressable onPress={() => setMovingSticker(null)} style={styles.modalOverlay}>
              <Pressable onPress={() => {}} style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                <View style={{ alignItems: "center", marginBottom: 12 }}>
                  <View style={{
                    backgroundColor: movingSticker.sticker.bgColor,
                    borderRadius: 6, padding: 8, minWidth: 100, maxWidth: 200,
                    shadowColor: "#000", shadowOffset: { width: 2, height: 3 },
                    shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
                    transform: [{ rotate: "-2deg" }],
                  }}>
                    <Text style={{ color: movingSticker.sticker.textColor, fontSize: 12, textAlign: "center" }} numberOfLines={2}>
                      {movingSticker.sticker.text}
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 14, fontWeight: "700", color: colors.muted, textAlign: "center", marginBottom: 10 }}>
                  {isRu ? "Переместить в столбец:" : "Move to column:"}
                </Text>
                <View style={{ gap: 6 }}>
                  {data.columns.map((col) => {
                    const isCurrent = col.id === movingSticker.columnId;
                    return (
                      <Pressable
                        key={col.id}
                        onPress={() => {
                          if (!isCurrent) {
                            handleMoveSticker(movingSticker.columnId, movingSticker.sticker, col.id);
                            setMovingSticker(null);
                          }
                        }}
                        disabled={isCurrent}
                        style={({ pressed }) => [{
                          backgroundColor: isCurrent ? `${colors.border}40` : pressed ? `${colors.primary}30` : colors.background,
                          borderRadius: 12, padding: 12,
                          borderWidth: isCurrent ? 2 : 1.5,
                          borderColor: isCurrent ? colors.muted : colors.primary,
                          borderStyle: isCurrent ? "solid" : "dashed",
                          flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                          opacity: isCurrent ? 0.4 : 1,
                        }]}
                      >
                        <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "700" }}>{col.title}</Text>
                        <Text style={{ color: colors.muted, fontSize: 12 }}>
                          {isCurrent ? (isRu ? "текущий" : "current") : `${col.stickers.length} ✉`}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Pressable
                  onPress={() => setMovingSticker(null)}
                  style={({ pressed }) => [styles.modalBtn, { backgroundColor: colors.border, marginTop: 10, opacity: pressed ? 0.7 : 1 }]}
                >
                  <Text style={{ color: colors.foreground, fontWeight: "600" }}>{t.common.cancel}</Text>
                </Pressable>
              </Pressable>
            </Pressable>
          )}
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "88%",
    maxWidth: 380,
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 16,
    textAlign: "center",
  },
  modalBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  zoomBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
