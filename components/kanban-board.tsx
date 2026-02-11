import React, { useState, useRef, useCallback } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useI18n } from "@/lib/context/i18n-context";
import { useColors } from "@/hooks/use-colors";

const STORAGE_KEY = "@sdvgnote_kanban";
const SCREEN_WIDTH = Dimensions.get("window").width;

// Sticky note colors
const STICKER_COLORS = [
  "#FFEB3B", // Yellow (default)
  "#FF9800", // Orange
  "#F44336", // Red
  "#E91E63", // Pink
  "#9C27B0", // Purple
  "#2196F3", // Blue
  "#00BCD4", // Cyan
  "#4CAF50", // Green
  "#8BC34A", // Light green
  "#FFFFFF", // White
];

const TEXT_COLORS = [
  "#000000", // Black (default)
  "#333333", // Dark gray
  "#FFFFFF", // White
  "#F44336", // Red
  "#2196F3", // Blue
  "#4CAF50", // Green
  "#FF9800", // Orange
  "#9C27B0", // Purple
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

const defaultData: KanbanData = {
  columns: [
    { id: "col_1", title: "To Do", stickers: [] },
    { id: "col_2", title: "In Progress", stickers: [] },
    { id: "col_3", title: "Done", stickers: [] },
  ],
};

export function KanbanBoard() {
  const { t, language } = useI18n();
  const colors = useColors();
  const isRu = language === "ru";

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

  // Load data
  React.useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setData(JSON.parse(stored));
        } else {
          // Set default column names based on language
          setData({
            columns: [
              { id: "col_1", title: isRu ? "Сделать" : "To Do", stickers: [] },
              { id: "col_2", title: isRu ? "В процессе" : "In Progress", stickers: [] },
              { id: "col_3", title: isRu ? "Готово" : "Done", stickers: [] },
            ],
          });
        }
      } catch (e) {
        console.log("Failed to load kanban:", e);
      }
      setLoaded(true);
    };
    load();
  }, []);

  const saveData = useCallback(async (newData: KanbanData) => {
    setData(newData);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (e) {
      console.log("Failed to save kanban:", e);
    }
  }, []);

  // Add column
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

  // Rename column
  const handleRenameColumn = () => {
    if (!renamingColumn || !renameText.trim()) return;
    const newColumns = data.columns.map((col) => {
      if (col.id === renamingColumn.id) {
        return { ...col, title: renameText.trim() };
      }
      return col;
    });
    saveData({ columns: newColumns });
    setRenamingColumn(null);
    setRenameText("");
  };

  // Delete column
  const handleDeleteColumn = (colId: string) => {
    const col = data.columns.find((c) => c.id === colId);
    Alert.alert(
      isRu ? "Удалить столбец?" : "Delete column?",
      `"${col?.title}"${col && col.stickers.length > 0 ? (isRu ? ` (${col.stickers.length} стикеров)` : ` (${col.stickers.length} stickers)`) : ""}`,
      [
        { text: isRu ? "Отмена" : "Cancel", style: "cancel" },
        {
          text: isRu ? "Удалить" : "Delete",
          style: "destructive",
          onPress: () => {
            saveData({ columns: data.columns.filter((c) => c.id !== colId) });
          },
        },
      ]
    );
  };

  // Add sticker
  const handleAddSticker = () => {
    if (!newStickerText.trim() || !addStickerColumnId) return;
    const sticker: KanbanSticker = {
      id: `s_${Date.now()}`,
      text: newStickerText.trim(),
      bgColor: newStickerBg,
      textColor: newStickerTextColor,
    };
    const newColumns = data.columns.map((col) => {
      if (col.id === addStickerColumnId) {
        return { ...col, stickers: [...col.stickers, sticker] };
      }
      return col;
    });
    saveData({ columns: newColumns });
    setNewStickerText("");
    setNewStickerBg("#FFEB3B");
    setNewStickerTextColor("#000000");
    setShowAddSticker(false);
    setShowBgPicker(false);
    setShowTextPicker(false);
  };

  // Delete sticker
  const handleDeleteSticker = (columnId: string, stickerId: string) => {
    const newColumns = data.columns.map((col) => {
      if (col.id === columnId) {
        return { ...col, stickers: col.stickers.filter((s) => s.id !== stickerId) };
      }
      return col;
    });
    saveData({ columns: newColumns });
  };

  // Move sticker to another column
  const handleMoveSticker = (targetColumnId: string) => {
    if (!movingSticker) return;
    const { columnId: fromCol, sticker } = movingSticker;
    if (fromCol === targetColumnId) {
      setMovingSticker(null);
      return;
    }
    const newColumns = data.columns.map((col) => {
      if (col.id === fromCol) {
        return { ...col, stickers: col.stickers.filter((s) => s.id !== sticker.id) };
      }
      if (col.id === targetColumnId) {
        return { ...col, stickers: [...col.stickers, sticker] };
      }
      return col;
    });
    saveData({ columns: newColumns });
    setMovingSticker(null);
  };

  // Zoom controls
  const zoomIn = () => setScale((s) => Math.min(s + 0.15, 2));
  const zoomOut = () => setScale((s) => Math.max(s - 0.15, 0.5));

  const COLUMN_WIDTH = Math.max(180, (SCREEN_WIDTH - 60) / Math.min(data.columns.length, 3));

  if (!loaded) return null;

  return (
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
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.primary,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
            opacity: pressed ? 0.7 : 1,
          }]}
        >
          <Text style={{ color: "#FFF", fontSize: 13, fontWeight: "700" }}>+ {t.matrix.addColumn}</Text>
        </Pressable>
      </View>

      {/* Board */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 20 }}>
        <View style={{ flexDirection: "row", gap: 10, transform: [{ scale }] }}>
          {data.columns.map((column) => (
            <View
              key={column.id}
              style={{
                width: COLUMN_WIDTH,
                backgroundColor: colors.surface,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                overflow: "hidden",
              }}
            >
              {/* Column header */}
              <View style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 10,
                paddingVertical: 8,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                backgroundColor: `${colors.primary}15`,
              }}>
                <Text style={{ fontSize: 14, fontWeight: "800", color: colors.foreground, flex: 1 }} numberOfLines={1}>
                  {column.title}
                </Text>
                <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                  <Text style={{ fontSize: 11, color: colors.muted, fontWeight: "600" }}>
                    {column.stickers.length}
                  </Text>
                  <Pressable
                    onPress={() => {
                      setRenamingColumn({ id: column.id, title: column.title });
                      setRenameText(column.title);
                    }}
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
              <ScrollView style={{ maxHeight: 400, paddingHorizontal: 6, paddingTop: 6 }} showsVerticalScrollIndicator={false}>
                {column.stickers.length === 0 ? (
                  <Text style={{ color: colors.muted, fontSize: 12, fontStyle: "italic", textAlign: "center", paddingVertical: 20 }}>
                    {t.matrix.emptyColumn}
                  </Text>
                ) : (
                  column.stickers.map((sticker) => (
                    <Pressable
                      key={sticker.id}
                      onPress={() => setEditingSticker({ columnId: column.id, sticker })}
                      onLongPress={() => setMovingSticker({ columnId: column.id, sticker })}
                      style={({ pressed }) => [{
                        backgroundColor: sticker.bgColor,
                        borderRadius: 4,
                        padding: 10,
                        marginBottom: 6,
                        minHeight: 50,
                        opacity: pressed ? 0.8 : 1,
                        // Paper shadow
                        shadowColor: "#000",
                        shadowOffset: { width: 1, height: 2 },
                        shadowOpacity: 0.15,
                        shadowRadius: 3,
                        elevation: 3,
                        // Slight tilt for sticky note feel
                        transform: [{ rotate: `${(parseInt(sticker.id.slice(-2), 16) % 5 - 2) * 0.5}deg` }],
                      }]}
                    >
                      {/* Pin */}
                      <View style={{
                        position: "absolute",
                        top: -4,
                        left: "50%",
                        marginLeft: -6,
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: "#E53935",
                        borderWidth: 1.5,
                        borderColor: "#B71C1C",
                        zIndex: 1,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.3,
                        shadowRadius: 1,
                        elevation: 2,
                      }} />
                      <Text style={{
                        color: sticker.textColor,
                        fontSize: 13,
                        lineHeight: 18,
                        fontFamily: Platform.OS === "ios" ? "Noteworthy" : undefined,
                      }}>
                        {sticker.text}
                      </Text>
                    </Pressable>
                  ))
                )}
                <View style={{ height: 6 }} />
              </ScrollView>

              {/* Add sticker button */}
              <Pressable
                onPress={() => {
                  setAddStickerColumnId(column.id);
                  setShowAddSticker(true);
                }}
                style={({ pressed }) => [{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 8,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                  opacity: pressed ? 0.6 : 1,
                }]}
              >
                <Text style={{ fontSize: 13, color: colors.primary, fontWeight: "700" }}>
                  + {t.matrix.newSticker}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>

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
                backgroundColor: newStickerBg,
                color: newStickerTextColor,
                borderRadius: 8,
                padding: 12,
                fontSize: 15,
                minHeight: 80,
                textAlignVertical: "top",
                marginBottom: 12,
              }}
            />

            {/* Color pickers */}
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
              <Pressable
                onPress={() => { setShowBgPicker(!showBgPicker); setShowTextPicker(false); }}
                style={({ pressed }) => [{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  opacity: pressed ? 0.7 : 1,
                }]}
              >
                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: newStickerBg, borderWidth: 2, borderColor: colors.border }} />
                <Text style={{ fontSize: 12, color: colors.muted }}>{t.matrix.stickerColor}</Text>
              </Pressable>
              <Pressable
                onPress={() => { setShowTextPicker(!showTextPicker); setShowBgPicker(false); }}
                style={({ pressed }) => [{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  opacity: pressed ? 0.7 : 1,
                }]}
              >
                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: newStickerTextColor, borderWidth: 2, borderColor: colors.border }} />
                <Text style={{ fontSize: 12, color: colors.muted }}>{t.matrix.textColor}</Text>
              </Pressable>
            </View>

            {/* Background color picker */}
            {showBgPicker && (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                {STICKER_COLORS.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => { setNewStickerBg(c); setShowBgPicker(false); }}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: c,
                      borderWidth: newStickerBg === c ? 3 : 1,
                      borderColor: newStickerBg === c ? colors.primary : colors.border,
                    }}
                  />
                ))}
              </View>
            )}

            {/* Text color picker */}
            {showTextPicker && (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                {TEXT_COLORS.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => { setNewStickerTextColor(c); setShowTextPicker(false); }}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: c,
                      borderWidth: newStickerTextColor === c ? 3 : 1,
                      borderColor: newStickerTextColor === c ? colors.primary : colors.border,
                    }}
                  />
                ))}
              </View>
            )}

            {/* Buttons */}
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
                backgroundColor: colors.background,
                color: colors.foreground,
                borderRadius: 10,
                padding: 12,
                fontSize: 15,
                borderWidth: 1,
                borderColor: colors.border,
                marginBottom: 16,
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
              {/* Preview */}
              <View style={{
                backgroundColor: editingSticker.sticker.bgColor,
                borderRadius: 8,
                padding: 14,
                marginBottom: 16,
                minHeight: 60,
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
                backgroundColor: colors.background,
                color: colors.foreground,
                borderRadius: 10,
                padding: 12,
                fontSize: 15,
                borderWidth: 1,
                borderColor: colors.border,
                marginBottom: 16,
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
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                {isRu ? "Переместить в:" : "Move to:"}
              </Text>
              {data.columns
                .filter((c) => c.id !== movingSticker.columnId)
                .map((col) => (
                  <Pressable
                    key={col.id}
                    onPress={() => handleMoveSticker(col.id)}
                    style={({ pressed }) => [{
                      backgroundColor: pressed ? `${colors.primary}20` : colors.background,
                      borderRadius: 10,
                      padding: 14,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }]}
                  >
                    <Text style={{ color: colors.foreground, fontSize: 15, fontWeight: "600" }}>
                      {col.title} ({col.stickers.length})
                    </Text>
                  </Pressable>
                ))}
              <Pressable
                onPress={() => setMovingSticker(null)}
                style={({ pressed }) => [styles.modalBtn, { backgroundColor: colors.border, marginTop: 4, opacity: pressed ? 0.7 : 1 }]}
              >
                <Text style={{ color: colors.foreground, fontWeight: "600" }}>{t.common.cancel}</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        )}
      </Modal>
    </View>
  );
}

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
