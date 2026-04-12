import React, { useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView, Image, Share, Platform, ActivityIndicator, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useColors } from '@/hooks/use-colors';
import { useI18n } from '@/lib/context/i18n-context';
import type { TaskAttachment } from '@/lib/domain/types';

interface FilePreviewModalProps {
  visible: boolean;
  attachment: TaskAttachment | null;
  onClose: () => void;
}

export function FilePreviewModal({ visible, attachment, onClose }: FilePreviewModalProps) {
  const colors = useColors();
  const { language } = useI18n();
  const isRu = language === 'ru';
  const [loading, setLoading] = useState(false);

  const getFileIcon = (type: string, name: string) => {
    if (type === 'image') return '🖼️';
    if (name.endsWith('.pdf')) return '📕';
    if (name.endsWith('.doc') || name.endsWith('.docx')) return '📄';
    if (name.endsWith('.xls') || name.endsWith('.xlsx')) return '📊';
    if (name.endsWith('.ppt') || name.endsWith('.pptx')) return '📈';
    return '📎';
  };

  const getFileSize = async (uri: string): Promise<string> => {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      if (info.exists && 'size' in info && info.size) {
        const sizeInMB = info.size / (1024 * 1024);
        if (sizeInMB > 1) {
          return `${sizeInMB.toFixed(2)} MB`;
        }
        const sizeInKB = info.size / 1024;
        return `${sizeInKB.toFixed(2)} KB`;
      }
    } catch (e) {
      console.error('Failed to get file size:', e);
    }
    return 'Unknown';
  };

  const handleDownload = async () => {
    if (!attachment) return;
    
    setLoading(true);
    try {
      await Share.share({
        url: attachment.uri,
        title: attachment.name,
        message: isRu ? 'Поделиться файлом' : 'Share file',
      });
    } catch (e) {
      console.error('Failed to share file:', e);
      Alert.alert(
        isRu ? 'Ошибка' : 'Error',
        isRu ? 'Ошибка при открытии файла' : 'Error opening file'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!attachment) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' }}>
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            width: '90%',
            maxHeight: '80%',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, flex: 1 }}>
              {isRu ? 'Просмотр файла' : 'File Preview'}
            </Text>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                {
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: pressed ? colors.border : 'transparent',
                },
              ]}
            >
              <Text style={{ fontSize: 18 }}>✕</Text>
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView contentContainerStyle={{ padding: 16, alignItems: 'center' }}>
            {attachment.type === 'image' ? (
              <Image
                source={{ uri: attachment.uri }}
                style={{ width: '100%', height: 300, borderRadius: 12, marginBottom: 16 }}
                resizeMode="contain"
              />
            ) : (
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 12,
                  backgroundColor: colors.background,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                  borderWidth: 2,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 48 }}>
                  {getFileIcon(attachment.type, attachment.name)}
                </Text>
              </View>
            )}

            {/* File Info */}
            <View style={{ width: '100%', gap: 12, marginBottom: 16 }}>
              <View
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 8,
                  padding: 12,
                  gap: 8,
                }}
              >
                <View style={{ gap: 4 }}>
                  <Text style={{ fontSize: 12, color: colors.muted }}>
                    {isRu ? 'Имя файла' : 'File name'}
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>
                    {attachment.name}
                  </Text>
                </View>

                <View style={{ gap: 4 }}>
                  <Text style={{ fontSize: 12, color: colors.muted }}>
                    {isRu ? 'Тип' : 'Type'}
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.foreground }}>
                    {attachment.type === 'image' ? (isRu ? 'Изображение' : 'Image') : (isRu ? 'Документ' : 'Document')}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={{ width: '100%', gap: 8 }}>
              <Pressable
                onPress={handleDownload}
                disabled={loading}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.primary,
                    borderRadius: 8,
                    paddingVertical: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: pressed || loading ? 0.7 : 1,
                  },
                ]}
              >
                {loading ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text style={{ color: colors.background, fontWeight: '600', fontSize: 14 }}>
                    {isRu ? '📥 Скачать/Поделиться' : '📥 Download/Share'}
                  </Text>
                )}
              </Pressable>

              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.border,
                    borderRadius: 8,
                    paddingVertical: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text style={{ color: colors.foreground, fontWeight: '600', fontSize: 14 }}>
                  {isRu ? 'Закрыть' : 'Close'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
