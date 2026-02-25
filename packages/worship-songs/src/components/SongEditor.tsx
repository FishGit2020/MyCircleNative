import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from '@mycircle/shared';
import type { WorshipSong, SongFormat } from '../types';

const KEYS = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F',
  'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
];

interface SongEditorProps {
  song?: WorshipSong | null;
  onSave: (data: Omit<WorshipSong, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancel: () => void;
}

export default function SongEditor({ song, onSave, onDelete, onCancel }: SongEditorProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [originalKey, setOriginalKey] = useState('G');
  const [format, setFormat] = useState<SongFormat>('chordpro');
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [bpmInput, setBpmInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [showKeyPicker, setShowKeyPicker] = useState(false);

  const titleEmpty = !title.trim();
  const contentEmpty = !content.trim();
  const canSave = !saving && !titleEmpty && !contentEmpty;

  useEffect(() => {
    if (song) {
      setTitle(song.title);
      setArtist(song.artist);
      setOriginalKey(song.originalKey);
      setFormat(song.format);
      setContent(song.content);
      setNotes(song.notes);
      setYoutubeUrl(song.youtubeUrl || '');
      setBpmInput(song.bpm ? String(song.bpm) : '');
      setTagsInput(song.tags?.join(', ') || '');
    }
  }, [song]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const parsedBpm = parseInt(bpmInput, 10);
      await onSave({
        title: title.trim(),
        artist: artist.trim(),
        originalKey,
        format,
        content,
        notes: notes.trim(),
        youtubeUrl: youtubeUrl.trim() || undefined,
        bpm: parsedBpm >= 30 && parsedBpm <= 240 ? parsedBpm : undefined,
        tags: tags.length > 0 ? tags : undefined,
      } as Omit<WorshipSong, 'id' | 'createdAt' | 'updatedAt'>);
    } catch (err) {
      console.error('Failed to save song:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!onDelete) return;
    Alert.alert(
      t('worship.deleteSong'),
      t('worship.deleteConfirm'),
      [
        { text: t('worship.cancel'), style: 'cancel' },
        {
          text: t('worship.deleteSong'),
          style: 'destructive',
          onPress: async () => {
            setSaving(true);
            try {
              await onDelete();
            } catch (err) {
              console.error('Failed to delete song:', err);
            } finally {
              setSaving(false);
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      <View className="px-4 py-4">
        {/* Header */}
        <View className="flex-row items-center gap-3 mb-6">
          <TouchableOpacity
            onPress={onCancel}
            className="min-h-[44px] min-w-[44px] items-center justify-center"
            accessibilityLabel={t('worship.back')}
            accessibilityRole="button"
          >
            <Text className="text-gray-500 dark:text-gray-400 text-xl">{'\u2190'}</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            {song ? t('worship.editSong') : t('worship.addSong')}
          </Text>
        </View>

        <Text className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          {t('worship.requiredFieldLegend')}
        </Text>

        {/* Title */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            {t('worship.songTitle')} <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={t('worship.songTitle')}
            placeholderTextColor="#9CA3AF"
            className="w-full px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            accessibilityLabel={t('worship.songTitle')}
          />
        </View>

        {/* Artist */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            {t('worship.artist')}
          </Text>
          <TextInput
            value={artist}
            onChangeText={setArtist}
            placeholder={t('worship.artist')}
            placeholderTextColor="#9CA3AF"
            className="w-full px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            accessibilityLabel={t('worship.artist')}
          />
        </View>

        {/* Key & Format row */}
        <View className="flex-row gap-4 mb-4">
          {/* Key picker */}
          <View className="flex-1">
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {t('worship.originalKey')}
            </Text>
            <TouchableOpacity
              onPress={() => setShowKeyPicker(!showKeyPicker)}
              className="px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 min-h-[44px] justify-center"
              accessibilityLabel={`${t('worship.originalKey')}: ${originalKey}`}
              accessibilityRole="button"
            >
              <Text className="text-gray-900 dark:text-white">{originalKey}</Text>
            </TouchableOpacity>
            {showKeyPicker && (
              <View className="flex-row flex-wrap gap-1 mt-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                {KEYS.map((k) => (
                  <TouchableOpacity
                    key={k}
                    onPress={() => {
                      setOriginalKey(k);
                      setShowKeyPicker(false);
                    }}
                    className={`px-2 py-1 rounded min-h-[36px] min-w-[36px] items-center justify-center ${
                      originalKey === k
                        ? 'bg-blue-600 dark:bg-blue-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                    accessibilityLabel={k}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: originalKey === k }}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        originalKey === k
                          ? 'text-white'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {k}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Format toggle */}
          <View className="flex-1">
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {t('worship.format')}
            </Text>
            <View className="flex-row rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
              <TouchableOpacity
                onPress={() => setFormat('chordpro')}
                className={`flex-1 px-3 py-3 items-center min-h-[44px] justify-center ${
                  format === 'chordpro'
                    ? 'bg-blue-600 dark:bg-blue-500'
                    : 'bg-white dark:bg-gray-800'
                }`}
                accessibilityLabel={t('worship.formatChordpro')}
                accessibilityRole="radio"
                accessibilityState={{ checked: format === 'chordpro' }}
              >
                <Text
                  className={`text-xs font-semibold ${
                    format === 'chordpro'
                      ? 'text-white'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {t('worship.formatChordpro')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFormat('text')}
                className={`flex-1 px-3 py-3 items-center min-h-[44px] justify-center ${
                  format === 'text'
                    ? 'bg-blue-600 dark:bg-blue-500'
                    : 'bg-white dark:bg-gray-800'
                }`}
                accessibilityLabel={t('worship.formatText')}
                accessibilityRole="radio"
                accessibilityState={{ checked: format === 'text' }}
              >
                <Text
                  className={`text-xs font-semibold ${
                    format === 'text'
                      ? 'text-white'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {t('worship.formatText')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Content */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            {t('worship.content')} <Text className="text-red-500">*</Text>
          </Text>
          <Text className="text-xs text-gray-400 dark:text-gray-500 mb-2">
            {format === 'chordpro'
              ? t('worship.contentHintChordpro')
              : t('worship.contentHintText')}
          </Text>
          <TextInput
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={12}
            textAlignVertical="top"
            className="w-full px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm min-h-[200px]"
            accessibilityLabel={t('worship.content')}
          />
        </View>

        {/* Notes */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            {t('worship.notes')}
          </Text>
          <Text className="text-xs text-gray-400 dark:text-gray-500 mb-2">
            {t('worship.notesHint')}
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            className="w-full px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm min-h-[80px]"
            accessibilityLabel={t('worship.notes')}
          />
        </View>

        {/* YouTube URL */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            {t('worship.youtubeUrl')}
          </Text>
          <Text className="text-xs text-gray-400 dark:text-gray-500 mb-2">
            {t('worship.youtubeUrlHint')}
          </Text>
          <TextInput
            value={youtubeUrl}
            onChangeText={setYoutubeUrl}
            placeholder="https://youtube.com/watch?v=..."
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            keyboardType="url"
            className="w-full px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            accessibilityLabel={t('worship.youtubeUrl')}
          />
        </View>

        {/* BPM */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            {t('worship.bpm')}
          </Text>
          <Text className="text-xs text-gray-400 dark:text-gray-500 mb-2">
            {t('worship.bpmHint')}
          </Text>
          <TextInput
            value={bpmInput}
            onChangeText={setBpmInput}
            keyboardType="number-pad"
            placeholder="120"
            placeholderTextColor="#9CA3AF"
            className="w-32 px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            accessibilityLabel={t('worship.bpm')}
          />
        </View>

        {/* Tags */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            {t('worship.tags')}
          </Text>
          <TextInput
            value={tagsInput}
            onChangeText={setTagsInput}
            placeholder="praise, hymn, christmas..."
            placeholderTextColor="#9CA3AF"
            className="w-full px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            accessibilityLabel={t('worship.tags')}
          />
        </View>

        {/* Validation hint */}
        {!canSave && !saving && (titleEmpty || contentEmpty) && (
          <Text className="text-xs text-amber-600 dark:text-amber-400 mb-3">
            {t('worship.fillRequiredFields')}
          </Text>
        )}

        {/* Action buttons */}
        <View className="flex-row items-center gap-3 mb-4">
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canSave}
            className={`px-5 py-3 rounded-lg min-h-[44px] justify-center ${
              canSave
                ? 'bg-blue-600 dark:bg-blue-500'
                : 'bg-blue-400 dark:bg-blue-800 opacity-50'
            }`}
            accessibilityLabel={saving ? t('worship.saving') : t('worship.save')}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSave }}
          >
            <Text className="text-sm font-semibold text-white">
              {saving ? t('worship.saving') : t('worship.save')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onCancel}
            className="px-5 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg min-h-[44px] justify-center"
            accessibilityLabel={t('worship.cancel')}
            accessibilityRole="button"
          >
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {t('worship.cancel')}
            </Text>
          </TouchableOpacity>

          {song && onDelete && (
            <TouchableOpacity
              onPress={handleDelete}
              disabled={saving}
              className="ml-auto px-4 py-3 rounded-lg min-h-[44px] justify-center"
              accessibilityLabel={t('worship.deleteSong')}
              accessibilityRole="button"
            >
              <Text className="text-sm font-semibold text-red-600 dark:text-red-400">
                {t('worship.deleteSong')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
