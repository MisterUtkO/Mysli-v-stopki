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
  Easing,
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
import { useCallback, useState, useRef, forwardRef, useImperativeHandle } from "react";
import React from "react";

const STORAGE_KEY = KANBAN_STORAGE_KEY;
const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCROLL_EDGE_THRESHOLD = 60;
const SCROLL_SPEED = 8;

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
  y: number;
  height: number;
}

interface DropZone {
  columnId: string;
  position: number;
  type: "between" | "end";
}

interface DragState {
  sticker: KanbanSticker;
  fromColId: string;
  fromIndex: number;
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
  isDragging: boolean;
  onPress: () => void;
  onDragStart: (state: DragState, pageX: number, pageY: number) => void;
  onDragMove: (pageX: number, pageY: number) => void;
  onDragEnd: (pageX: number, pageY: number) => void;
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
  isDragging,
  onPress,
  onDragStart,
  onDragMove,
  onDragEnd,
  onMoveLeft,
  onMoveRight,
  onMoveUp,
  onMoveDown,
  colors,
}: DraggableStickerProps) {
  const scale = useSharedValue(1);
  const elevation = useSharedValue(0);
  const isBeingDragged = useSharedValue(false);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: isBeingDragged.value ? 0.7 : 1,
    elevation: elevation.value,
  }));

  const rotation = (parseInt(sticker.id.slice(-2), 16) % 5 - 2) * 0.5;

  const startDrag = useCallback(
    (pageX: number, pageY: number) => {
      isBeingDragged.value = true;
      scale.value = withSpring(1.15, { damping: 10, mass: 1 });
      elevation.value = 10;
      onDragStart(
        { sticker, fromColId: columnId, fromIndex: stickerIndex, startX: pageX, startY: pageY },
        pageX,
        pageY
      );
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    },
    [sticker, columnId, stickerIndex, onDragStart, isBeingDragged, scale, elevation]
  );

  const resetDrag = useCallback(() => {
    isBeingDragged.value = false;
    scale.value = withSpring(1);
    elevation.value = 0;
  }, [isBeingDragged, scale, elevation]);

  // Long-press to start drag
  const longPress = Gesture.LongPress()
    .minDuration(300)
    .onStart((e: any) => {
      runOnJS(startDrag)(e.absoluteX, e.absoluteY);
    });

  // Pan gesture for continuous drag after long-press
  const pan = Gesture.Pan()
    .onUpdate((e: any) => {
      if (isBeingDragged.value) {
        runOnJS(onDragMove)(e.absoluteX, e.absoluteY);
      }
    })
    .onEnd((e: any) => {
      if (isBeingDragged.value) {
        runOnJS(onDragEnd)(e.absoluteX, e.absoluteY);
        runOnJS(resetDrag)();
      }
    });

  // Tap to open edit modal (only if not dragging)
  const tap = Gesture.Tap()
    .maxDuration(300)
    .onEnd(() => {
      if (!isDragging) {
        runOnJS(onPress)();
      }
    });

  const composed = Gesture.Exclusive(longPress, tap);
  const withPan = Gesture.Simultaneous(composed, pan);

  return (
    <View style={{ marginBottom: 5 }}>
      <GestureDetector gesture={withPan}>
        <Animated.View
          style={[
            animStyle,
            {
              backgroundColor: sticker.bgColor,
              borderRadius: 4,
              padding: 8,
              minHeight: 36,
              shadowColor: "#000",
              shadowOffset: { width: 2, height: 4 },
              shadowOpacity: isDragging ? 0.3 : 0.15,
              shadowRadius: isDragging ? 8 : 3,
              elevation: isDragging ? 15 : 3,
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

// ─── Drop Zone Indicator ───────────────────────────────────────────────────────

interface DropZoneIndicatorProps {
  colors: ReturnType<typeof import("@/hooks/use-colors").useColors>;
  isRu: boolean;
}

function DropZoneIndicator({ colors, isRu }: DropZoneIndicatorProps) {
  return (
    <View style={{
      height: 32, borderRadius: 4, borderWidth: 2, borderStyle: "dashed",
      borderColor: colors.primary, backgroundColor: `${colors.primary}08`,
      justifyContent: "center", alignItems: "center", marginVertical: 2,
    }}>
      <Text style={{ color: colors.primary, fontSize: 10, fontWeight: "600" }}>
        {isRu ? "↓ Отпустить" : "↓ Drop"}
      </Text>
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
  const [hoveredDropZone, setHoveredDropZone] = useState<DropZone | null>(null);
  const columnLayouts = useRef<ColumnLayout[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const boardOffsetX = useRef(0);   // left edge of ScrollView on screen
  const scrollOffsetX = useRef(0);  // how far the user has scrolled horizontally
  const autoScrollInterval = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const handleMoveSticker = useCallback((fromColId: string, fromIndex: number, sticker: KanbanSticker, targetColumnId: string, targetIndex?: number) => {
    const newColumns = data.columns.map((col) => {
      if (col.id === fromColId && col.id === targetColumnId) {
        const newStickers = [...col.stickers];
        const [removed] = newStickers.splice(fromIndex, 1);
        const insertIdx = targetIndex ?? newStickers.length;
        newStickers.splice(insertIdx, 0, removed);
        return { ...col, stickers: newStickers };
      }
      if (col.id === fromColId) {
        return { ...col, stickers: col.stickers.filter((s) => s.id !== sticker.id) };
      }
      if (col.id === targetColumnId) {
        const newStickers = [...col.stickers];
        const insertIdx = targetIndex ?? newStickers.length;
        newStickers.splice(insertIdx, 0, sticker);
        return { ...col, stickers: newStickers };
      }
      return col;
    });
    saveData({ columns: newColumns });

    // Reverse sync to task (only if moving to different column)
    if (fromColId !== targetColumnId && sticker.id.startsWith("task_")) {
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

  const handleMoveArrow = (columnId: string, stickerIndex: number, sticker: KanbanSticker, direction: "left" | "right") => {
    const colIndex = data.columns.findIndex((c) => c.id === columnId);
    if (colIndex < 0) return;
    const targetIndex = direction === "left" ? colIndex - 1 : colIndex + 1;
    if (targetIndex < 0 || targetIndex >= data.columns.length) return;
    handleMoveSticker(columnId, stickerIndex, sticker, data.columns[targetIndex].id);
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

  // ─── Drag-and-drop with auto-scroll ────────────────────────────────────────

  const startAutoScroll = useCallback((direction: "left" | "right") => {
    if (autoScrollInterval.current) clearInterval(autoScrollInterval.current);
    autoScrollInterval.current = setInterval(() => {
      scrollViewRef.current?.scrollTo({
        x: direction === "left" ? Math.max(0, boardOffsetX.current - SCROLL_SPEED) : boardOffsetX.current + SCROLL_SPEED,
        animated: false,
      });
    }, 16);
  }, []);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = null;
    }
  }, []);

  const handleDragStart = useCallback((state: DragState, pageX: number, pageY: number) => {
    // Re-measure the ScrollView's position on screen at drag start for accuracy on native
    if (scrollViewRef.current) {
      (scrollViewRef.current as any).measure?.(
        (_fx: number, _fy: number, _w: number, _h: number, px: number, _py: number) => {
          boardOffsetX.current = px;
        }
      );
    }
    setDragging(state);
    setDragX(pageX);
    setDragY(pageY);
    stopAutoScroll();
  }, [stopAutoScroll]);

  const getDropZonesAtX = useCallback((pageX: number): DropZone[] => {
    // Convert screen pageX to position within the scrollable content:
    // pageX (absolute screen coord) - boardOffsetX (left edge of ScrollView on screen) + scrollOffsetX (how far scrolled)
    const contentX = pageX - boardOffsetX.current + scrollOffsetX.current;
    const zones: DropZone[] = [];

    // Find ALL columns that could be drop targets
    for (const layout of columnLayouts.current) {
      const col = data.columns.find((c) => c.id === layout.id);
      if (!col) continue;

      // layout.x is relative to the scrollable content (not the screen)
      const tolerance = layout.width * 0.25; // 25% tolerance for easier targeting
      if (contentX >= layout.x - tolerance && contentX <= layout.x + layout.width + tolerance) {
        for (let i = 0; i <= col.stickers.length; i++) {
          zones.push({
            columnId: layout.id,
            position: i,
            type: i === col.stickers.length ? "end" : "between",
          });
        }
      }
    }

    // If no zones found, find closest column as fallback
    if (zones.length === 0) {
      let closestLayout: ColumnLayout | null = null;
      let minDistX = Infinity;

      for (const layout of columnLayouts.current) {
        const colCenterX = layout.x + layout.width / 2;
        const distX = Math.abs(contentX - colCenterX);
        if (distX < minDistX) {
          minDistX = distX;
          closestLayout = layout;
        }
      }

      if (closestLayout) {
        const col = data.columns.find((c) => c.id === closestLayout!.id);
        if (col) {
          for (let i = 0; i <= col.stickers.length; i++) {
            zones.push({
              columnId: closestLayout.id,
              position: i,
              type: i === col.stickers.length ? "end" : "between",
            });
          }
        }
      }
    }

    return zones;
  }, [data.columns])

  const getClosestDropZone = useCallback((pageX: number, pageY: number): DropZone | null => {
    const zones = getDropZonesAtX(pageX);
    if (zones.length === 0) return null;

    if (zones.length === 1) {
      return zones[0];
    }

    let closest = zones[0];
    let minDist = Infinity;

    for (const zone of zones) {
      const col = data.columns.find((c) => c.id === zone.columnId);
      if (!col) continue;

      const layout = columnLayouts.current.find((l) => l.id === zone.columnId);
      if (!layout) continue;

      const estimatedY = layout.y + 50 + zone.position * 50;
      const dist = Math.abs(pageY - estimatedY);

      if (dist < minDist) {
        minDist = dist;
        closest = zone;
      }
    }

    return closest;
  }, [data.columns, getDropZonesAtX]);

  const handleDragMove = useCallback((pageX: number, pageY: number) => {
    setDragX(pageX);
    setDragY(pageY);

    if (pageX < SCROLL_EDGE_THRESHOLD) {
      startAutoScroll("left");
    } else if (pageX > SCREEN_WIDTH - SCROLL_EDGE_THRESHOLD) {
      startAutoScroll("right");
    } else {
      stopAutoScroll();
    }

    const zone = getClosestDropZone(pageX, pageY);
    setHoveredDropZone(zone);
  }, [startAutoScroll, stopAutoScroll, getClosestDropZone]);

  const handleDragEnd = useCallback((pageX: number, pageY: number) => {
    stopAutoScroll();
    if (!dragging || !hoveredDropZone) {
      setDragging(null);
      setHoveredDropZone(null);
      return;
    }

    const { columnId: targetColId, position: targetIndex } = hoveredDropZone;
    const { fromColId, fromIndex, sticker } = dragging;

    if (fromColId === targetColId && fromIndex === targetIndex) {
      setDragging(null);
      setHoveredDropZone(null);
      return;
    }

    handleMoveSticker(fromColId, fromIndex, sticker, targetColId, targetIndex);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setDragging(null);
    setHoveredDropZone(null);
  }, [dragging, hoveredDropZone, handleMoveSticker, stopAutoScroll]);

  // ─── Zoom ───────────────────────────────────────────────────────────────────

  const zoomIn = () => setScale((s) => Math.min(s + 0.15, 2));
  const zoomOut = () => setScale((s) => Math.max(s - 0.15, 0.5));

  const COLUMN_WIDTH = Math.max(180, (SCREEN_WIDTH - 60) / Math.max(data.columns.length, 1));

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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={!dragging}
          contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 8 }}
          style={{ flex: 1 } as any}
          onLayout={(e) => {
            boardOffsetX.current = e.nativeEvent.layout.x;
          }}
          onScroll={(e) => {
            scrollOffsetX.current = e.nativeEvent.contentOffset.x;
          }}
          scrollEventThrottle={16}
          ref={scrollViewRef}
        >
          <View style={{ flexDirection: "row", gap: 10, transform: [{ scale }] }}>
            {data.columns.map((column, colIndex) => (
              <View
                key={column.id as any}
                onLayout={(e) => {
                  const { x, y, width, height } = e.nativeEvent.layout;
                  const existing = columnLayouts.current.findIndex((l) => l.id === column.id);
                  const entry = { id: column.id, x, y, width, height };
                  if (existing >= 0) {
                    columnLayouts.current[existing] = entry;
                  } else {
                    columnLayouts.current.push(entry);
                  }
                }}
                style={{
                  width: COLUMN_WIDTH,
                  backgroundColor: colors.surface,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
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
                  backgroundColor: `${colors.primary}15`,
                }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: colors.foreground }}>
                      {column.title}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.muted }}>
                      {column.stickers.length} {isRu ? "стикеров" : "stickers"}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    <Pressable
                      onPress={() => {
                        setRenamingColumn({ id: column.id, title: column.title });
                        setRenameText(column.title);
                      }}
                      style={({ pressed }) => [{ opacity: pressed ? 0.5 : 0.7 }]}
                    >
                      <Text style={{ fontSize: 14 }}>✏️</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleDeleteColumn(column.id)}
                      style={({ pressed }) => [{ opacity: pressed ? 0.5 : 0.7 }]}
                    >
                      <Text style={{ fontSize: 14 }}>🗑️</Text>
                    </Pressable>
                  </View>
                </View>

                {/* Stickers */}
                <ScrollView style={{ flex: 1, paddingHorizontal: 8, paddingVertical: 8 }} scrollEnabled={!dragging}>
                  {column.stickers.map((sticker, stickerIndex) => (
                    <View key={sticker.id as any}>
                      {dragging && hoveredDropZone?.columnId === column.id && hoveredDropZone?.position === stickerIndex && (
                        <DropZoneIndicator colors={colors} isRu={isRu} />
                      )}
                      <DraggableSticker
                        sticker={sticker}
                        columnId={column.id}
                        colIndex={colIndex}
                        stickerIndex={stickerIndex}
                        totalInCol={column.stickers.length}
                        totalCols={data.columns.length}
                        isDragging={dragging?.sticker.id === sticker.id}
                        onPress={() => setEditingSticker({ columnId: column.id, sticker })}
                        onDragStart={handleDragStart}
                        onDragMove={handleDragMove}
                        onDragEnd={handleDragEnd}
                        onMoveLeft={() => handleMoveArrow(column.id, stickerIndex, sticker, "left")}
                        onMoveRight={() => handleMoveArrow(column.id, stickerIndex, sticker, "right")}
                        onMoveUp={() => handleSwapVertical(column.id, sticker.id, "up")}
                        onMoveDown={() => handleSwapVertical(column.id, sticker.id, "down")}
                        colors={colors}
                      />
                    </View>
                  ))}
                  {dragging && hoveredDropZone?.columnId === column.id && hoveredDropZone?.position === column.stickers.length && (
                    <DropZoneIndicator colors={colors} isRu={isRu} />
                  )}
                  <Pressable
                    onPress={() => {
                      setAddStickerColumnId(column.id);
                      setShowAddSticker(true);
                    }}
                    style={({ pressed }) => [{
                      marginTop: 8, paddingVertical: 10, borderWidth: 1, borderStyle: "dashed",
                      borderColor: colors.border, borderRadius: 4, alignItems: "center",
                      opacity: pressed ? 0.6 : 1,
                    }]}
                  >
                    <Text style={{ fontSize: 12, color: colors.muted, fontWeight: "600" }}>+ {isRu ? "Добавить" : "Add"}</Text>
                  </Pressable>
                </ScrollView>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Modals */}
        {/* Add Sticker Modal */}
        <Modal visible={showAddSticker} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
            <View style={{ backgroundColor: colors.background, borderRadius: 12, padding: 16, width: "85%", maxWidth: 400 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground, marginBottom: 12 }}>
                {isRu ? "Добавить стикер" : "Add Sticker"}
              </Text>
              <TextInput
                placeholder={isRu ? "Текст стикера" : "Sticker text"}
                value={newStickerText}
                onChangeText={setNewStickerText}
                style={{
                  borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10,
                  marginBottom: 12, color: colors.foreground, backgroundColor: colors.surface,
                }}
                placeholderTextColor={colors.muted}
              />
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
                <Pressable
                  onPress={() => setShowBgPicker(!showBgPicker)}
                  style={{ flex: 1, backgroundColor: newStickerBg, borderRadius: 8, paddingVertical: 12, alignItems: "center" }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "600" }}>{isRu ? "Фон" : "BG"}</Text>
                </Pressable>
                <Pressable
                  onPress={() => setShowTextPicker(!showTextPicker)}
                  style={{ flex: 1, backgroundColor: newStickerTextColor, borderRadius: 8, paddingVertical: 12, alignItems: "center" }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "600", color: newStickerBg }}>{isRu ? "Текст" : "Text"}</Text>
                </Pressable>
              </View>
              {showBgPicker && (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                  {STICKER_COLORS.map((color) => (
                    <Pressable
                      key={color}
                      onPress={() => { setNewStickerBg(color); setShowBgPicker(false); }}
                      style={{ width: "23%", aspectRatio: 1, backgroundColor: color, borderRadius: 8, borderWidth: newStickerBg === color ? 3 : 0, borderColor: colors.primary }}
                    />
                  ))}
                </View>
              )}
              {showTextPicker && (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                  {TEXT_COLORS.map((color) => (
                    <Pressable
                      key={color}
                      onPress={() => { setNewStickerTextColor(color); setShowTextPicker(false); }}
                      style={{ width: "23%", aspectRatio: 1, backgroundColor: color, borderRadius: 8, borderWidth: newStickerTextColor === color ? 3 : 0, borderColor: colors.primary }}
                    />
                  ))}
                </View>
              )}
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Pressable
                  onPress={() => setShowAddSticker(false)}
                  style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 8, paddingVertical: 10, alignItems: "center" }}
                >
                  <Text style={{ color: colors.foreground, fontWeight: "600" }}>{isRu ? "Отмена" : "Cancel"}</Text>
                </Pressable>
                <Pressable
                  onPress={handleAddSticker}
                  style={{ flex: 1, backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 10, alignItems: "center" }}
                >
                  <Text style={{ color: "#FFF", fontWeight: "600" }}>{isRu ? "Добавить" : "Add"}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Add Column Modal */}
        <Modal visible={showAddColumn} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
            <View style={{ backgroundColor: colors.background, borderRadius: 12, padding: 16, width: "85%", maxWidth: 400 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground, marginBottom: 12 }}>
                {isRu ? "Добавить столбец" : "Add Column"}
              </Text>
              <TextInput
                placeholder={isRu ? "Название столбца" : "Column name"}
                value={newColumnName}
                onChangeText={setNewColumnName}
                style={{
                  borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10,
                  marginBottom: 12, color: colors.foreground, backgroundColor: colors.surface,
                }}
                placeholderTextColor={colors.muted}
              />
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Pressable
                  onPress={() => setShowAddColumn(false)}
                  style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 8, paddingVertical: 10, alignItems: "center" }}
                >
                  <Text style={{ color: colors.foreground, fontWeight: "600" }}>{isRu ? "Отмена" : "Cancel"}</Text>
                </Pressable>
                <Pressable
                  onPress={handleAddColumn}
                  style={{ flex: 1, backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 10, alignItems: "center" }}
                >
                  <Text style={{ color: "#FFF", fontWeight: "600" }}>{isRu ? "Добавить" : "Add"}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Rename Column Modal */}
        <Modal visible={renamingColumn !== null} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
            <View style={{ backgroundColor: colors.background, borderRadius: 12, padding: 16, width: "85%", maxWidth: 400 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground, marginBottom: 12 }}>
                {isRu ? "Переименовать столбец" : "Rename Column"}
              </Text>
              <TextInput
                placeholder={isRu ? "Новое название" : "New name"}
                value={renameText}
                onChangeText={setRenameText}
                style={{
                  borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10,
                  marginBottom: 12, color: colors.foreground, backgroundColor: colors.surface,
                }}
                placeholderTextColor={colors.muted}
              />
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Pressable
                  onPress={() => setRenamingColumn(null)}
                  style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 8, paddingVertical: 10, alignItems: "center" }}
                >
                  <Text style={{ color: colors.foreground, fontWeight: "600" }}>{isRu ? "Отмена" : "Cancel"}</Text>
                </Pressable>
                <Pressable
                  onPress={handleRenameColumn}
                  style={{ flex: 1, backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 10, alignItems: "center" }}
                >
                  <Text style={{ color: "#FFF", fontWeight: "600" }}>{isRu ? "Переименовать" : "Rename"}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Edit Sticker Modal */}
        <Modal visible={editingSticker !== null} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
            <View style={{ backgroundColor: colors.background, borderRadius: 12, padding: 16, width: "85%", maxWidth: 400 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground, marginBottom: 12 }}>
                {isRu ? "Редактировать стикер" : "Edit Sticker"}
              </Text>
              <Pressable
                onPress={() => {
                  if (editingSticker) {
                    handleDeleteSticker(editingSticker.columnId, editingSticker.sticker.id);
                    setEditingSticker(null);
                  }
                }}
                style={{ backgroundColor: "#EF4444", borderRadius: 8, paddingVertical: 10, alignItems: "center", marginBottom: 8 }}
              >
                <Text style={{ color: "#FFF", fontWeight: "600" }}>{isRu ? "Удалить" : "Delete"}</Text>
              </Pressable>
              <Pressable
                onPress={() => setEditingSticker(null)}
                style={{ backgroundColor: colors.surface, borderRadius: 8, paddingVertical: 10, alignItems: "center" }}
              >
                <Text style={{ color: colors.foreground, fontWeight: "600" }}>{isRu ? "Закрыть" : "Close"}</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
});

const styles = StyleSheet.create({
  zoomBtn: {
    width: 32, height: 32, borderRadius: 8, justifyContent: "center", alignItems: "center",
  },
});
