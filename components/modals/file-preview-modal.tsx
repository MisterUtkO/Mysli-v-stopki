import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  Image,
  Share,
  Platform,
  ActivityIndicator,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  clamp,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { openBrowserAsync } from 'expo-web-browser';
import { useColors } from '@/hooks/use-colors';
import { useI18n } from '@/lib/context/i18n-context';
import type { TaskAttachment } from '@/lib/domain/types';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const MIN_SCALE = 1;
const MAX_SCALE = 4;

interface FilePreviewModalProps {
  visible: boolean;
  attachment: TaskAttachment | null;
  onClose: () => void;
}

// ─── Fullscreen image viewer with pinch-zoom and double-tap ───────────────────
function ImageViewer({ uri, onClose }: { uri: string; onClose: () => void }) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const resetTransform = useCallback(() => {
    'worklet';
    scale.value = withSpring(1, { damping: 20 });
    translateX.value = withSpring(0, { damping: 20 });
    translateY.value = withSpring(0, { damping: 20 });
    savedScale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }, []);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = clamp(savedScale.value * e.scale, MIN_SCALE, MAX_SCALE);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value < 1.05) {
        resetTransform();
      }
    });

  const panGesture = Gesture.Pan()
    .minPointers(1)
    .onUpdate((e) => {
      if (savedScale.value > 1) {
        const maxX = (SCREEN_W * (savedScale.value - 1)) / 2;
        const maxY = (SCREEN_H * (savedScale.value - 1)) / 2;
        translateX.value = clamp(savedTranslateX.value + e.translationX, -maxX, maxX);
        translateY.value = clamp(savedTranslateY.value + e.translationY, -maxY, maxY);
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1.5) {
        resetTransform();
      } else {
        scale.value = withSpring(2.5, { damping: 20 });
        savedScale.value = 2.5;
      }
    });

  const composed = Gesture.Simultaneous(
    doubleTapGesture,
    pinchGesture,
    panGesture
  );

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
      <StatusBar hidden />
      {/* Close button */}
      <Pressable
        onPress={onClose}
        style={({ pressed }) => ({
          position: 'absolute',
          top: 52,
          right: 20,
          zIndex: 10,
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: 'rgba(0,0,0,0.65)',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>✕</Text>
      </Pressable>
      {/* Hint */}
      <Text style={{
        position: 'absolute',
        top: 62,
        left: 0,
        right: 60,
        textAlign: 'center',
        color: 'rgba(255,255,255,0.35)',
        fontSize: 12,
        zIndex: 5,
      }}>
        2× tap to zoom · pinch to zoom
      </Text>
      <GestureDetector gesture={composed}>
        <Animated.View style={[
          { width: SCREEN_W, height: SCREEN_H, justifyContent: 'center', alignItems: 'center' },
          animStyle,
        ]}>
          <Image
            source={{ uri }}
            style={{ width: SCREEN_W, height: SCREEN_H }}
            resizeMode="contain"
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

// ─── File icon helper ─────────────────────────────────────────────────────────
function getFileIcon(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith('.pdf')) return '📕';
  if (lower.endsWith('.doc') || lower.endsWith('.docx')) return '📄';
  if (lower.endsWith('.xls') || lower.endsWith('.xlsx')) return '📊';
  if (lower.endsWith('.ppt') || lower.endsWith('.pptx')) return '📈';
  if (lower.endsWith('.zip') || lower.endsWith('.rar') || lower.endsWith('.7z')) return '🗜️';
  if (lower.endsWith('.mp3') || lower.endsWith('.wav') || lower.endsWith('.aac')) return '🎵';
  if (lower.endsWith('.mp4') || lower.endsWith('.mov') || lower.endsWith('.avi')) return '🎬';
  if (lower.endsWith('.txt') || lower.endsWith('.md')) return '📝';
  return '📎';
}

// ─── File viewer card ─────────────────────────────────────────────────────────
function FileCard({ attachment, onClose, isRu, colors }: {
  attachment: TaskAttachment;
  onClose: () => void;
  isRu: boolean;
  colors: ReturnType<typeof useColors>;
}) {
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    try {
      if (Platform.OS === 'web') {
        Alert.alert(
          isRu ? 'Недоступно' : 'Not available',
          isRu ? 'Скачивание недоступно в веб-версии' : 'Download not available on web'
        );
        return;
      }
      await Share.share({ url: attachment.uri, title: attachment.name });
    } catch {
      try {
        await openBrowserAsync(attachment.uri);
      } catch {
        Alert.alert(
          isRu ? 'Ошибка' : 'Error',
          isRu ? 'Не удалось открыть файл' : 'Could not open file'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const ext = attachment.name.split('.').pop()?.toUpperCase() || 'FILE';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 56,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <Text
          style={{ fontSize: 17, fontWeight: '600', color: colors.foreground, flex: 1 }}
          numberOfLines={1}
        >
          {attachment.name}
        </Text>
        <Pressable
          onPress={onClose}
          style={({ pressed }) => ({
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: pressed ? colors.border : colors.surface,
            marginLeft: 12,
          })}
        >
          <Text style={{ fontSize: 16, color: colors.muted }}>✕</Text>
        </Pressable>
      </View>

      {/* File icon */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        <View style={{
          width: 128,
          height: 128,
          borderRadius: 28,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          <Text style={{ fontSize: 60 }}>{getFileIcon(attachment.name)}</Text>
        </View>
        <Text
          style={{ fontSize: 18, fontWeight: '700', color: colors.foreground, textAlign: 'center', marginBottom: 10 }}
          numberOfLines={2}
        >
          {attachment.name}
        </Text>
        <View style={{
          backgroundColor: colors.primary + '22',
          paddingHorizontal: 14,
          paddingVertical: 5,
          borderRadius: 10,
        }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primary }}>{ext}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={{ padding: 20, paddingBottom: 36, gap: 12 }}>
        <Pressable
          onPress={handleShare}
          disabled={loading}
          style={({ pressed }) => ({
            backgroundColor: colors.primary,
            borderRadius: 16,
            paddingVertical: 17,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed || loading ? 0.7 : 1,
          })}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
              {isRu ? '📤 Открыть / Поделиться' : '📤 Open / Share'}
            </Text>
          )}
        </Pressable>
        <Pressable
          onPress={onClose}
          style={({ pressed }) => ({
            backgroundColor: colors.surface,
            borderRadius: 16,
            paddingVertical: 17,
            alignItems: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ color: colors.foreground, fontWeight: '600', fontSize: 16 }}>
            {isRu ? 'Закрыть' : 'Close'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────
export function FilePreviewModal({ visible, attachment, onClose }: FilePreviewModalProps) {
  const colors = useColors();
  const { language } = useI18n();
  const isRu = language === 'ru';

  if (!attachment) return null;

  const isImage = attachment.type === 'image';

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType={isImage ? 'fade' : 'slide'}
      onRequestClose={onClose}
      statusBarTranslucent={isImage}
    >
      {isImage ? (
        <ImageViewer uri={attachment.uri} onClose={onClose} />
      ) : (
        <FileCard attachment={attachment} onClose={onClose} isRu={isRu} colors={colors} />
      )}
    </Modal>
  );
}
