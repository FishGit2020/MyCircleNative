import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useTranslation } from '@mycircle/shared';
import type { Note } from '../types';

interface NoteEditorProps {
  note: Note | null;
  onSave: (
    id: string | null,
    data: { title: string; content: string },
  ) => Promise<void>;
  onCancel: () => void;
  onDelete?: (id: string) => void;
  onPublish?: (data: { title: string; content: string }) => Promise<void>;
}

export default function NoteEditor({
  note,
  onSave,
  onCancel,
  onDelete,
  onPublish,
}: NoteEditorProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [wantsPublish, setWantsPublish] = useState(false);

  const canSubmit = title.trim().length > 0 || content.trim().length > 0;

  const handleSave = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      await onSave(note?.id ?? null, {
        title: title.trim(),
        content: content.trim(),
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = () => {
    if (!onPublish || !canSubmit) return;
    Alert.alert(
      t('notebook.publish'),
      t('notebook.publishConfirm'),
      [
        { text: t('notebook.cancel'), style: 'cancel' },
        {
          text: t('notebook.publish'),
          onPress: async () => {
            setPublishing(true);
            try {
              await onPublish({
                title: title.trim(),
                content: content.trim(),
              });
            } finally {
              setPublishing(false);
            }
          },
        },
      ],
    );
  };

  const handleDelete = () => {
    if (!note || !onDelete) return;
    Alert.alert(
      t('notebook.deleteNote'),
      t('notebook.deleteConfirm'),
      [
        { text: t('notebook.cancel'), style: 'cancel' },
        {
          text: t('notebook.deleteNote'),
          style: 'destructive',
          onPress: () => onDelete(note.id),
        },
      ],
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-gray-900"
      contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Breadcrumb */}
      <View className="flex-row items-center gap-1.5 mb-4">
        <Pressable
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel={t('notebook.back')}
          style={{ minHeight: 44, justifyContent: 'center' }}
        >
          <Text className="text-blue-600 dark:text-blue-400 text-sm">
            {t('notebook.title')}
          </Text>
        </Pressable>
        <Text className="text-gray-400 dark:text-gray-500 text-sm">/</Text>
        <Text className="text-gray-700 dark:text-gray-300 font-medium text-sm">
          {note ? t('notebook.editNote') : t('notebook.newNote')}
        </Text>
      </View>

      {/* Title input */}
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {t('notebook.noteTitle')}
      </Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder={t('notebook.noteTitlePlaceholder')}
        placeholderTextColor="#9ca3af"
        accessibilityLabel={t('notebook.noteTitle')}
        className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base mb-4"
        style={{ minHeight: 44 }}
        autoFocus={!note}
      />

      {/* Content input */}
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {t('notebook.content')}
      </Text>
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder={t('notebook.contentPlaceholder')}
        placeholderTextColor="#9ca3af"
        accessibilityLabel={t('notebook.content')}
        multiline
        textAlignVertical="top"
        className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm mb-4"
        style={{ minHeight: 200 }}
      />

      {/* Publish toggle (only when creating or editing own notes) */}
      {onPublish && (
        <View className="flex-row items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4 border border-gray-200 dark:border-gray-700">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('notebook.publish')}
          </Text>
          <Switch
            value={wantsPublish}
            onValueChange={setWantsPublish}
            accessibilityLabel={t('notebook.publish')}
            trackColor={{ false: '#d1d5db', true: '#22c55e' }}
            thumbColor="#ffffff"
          />
        </View>
      )}

      {/* Action buttons */}
      <View className="flex-row items-center justify-between pt-2">
        <View className="flex-row gap-2">
          {/* Save button */}
          <Pressable
            onPress={wantsPublish && onPublish ? handlePublish : handleSave}
            disabled={saving || publishing || !canSubmit}
            accessibilityRole="button"
            accessibilityLabel={
              wantsPublish && onPublish ? t('notebook.publish') : t('notebook.save')
            }
            className={`px-4 py-2.5 rounded-lg ${
              wantsPublish && onPublish
                ? 'bg-green-600 active:bg-green-700'
                : 'bg-blue-600 active:bg-blue-700'
            } ${saving || publishing || !canSubmit ? 'opacity-50' : ''}`}
            style={{ minHeight: 44 }}
          >
            {saving || publishing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white font-medium text-sm">
                {wantsPublish && onPublish
                  ? t('notebook.publish')
                  : t('notebook.save')}
              </Text>
            )}
          </Pressable>

          {/* Cancel button */}
          <Pressable
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel={t('notebook.cancel')}
            className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg active:bg-gray-200 dark:active:bg-gray-600"
            style={{ minHeight: 44 }}
          >
            <Text className="text-gray-700 dark:text-gray-300 text-sm">
              {t('notebook.cancel')}
            </Text>
          </Pressable>
        </View>

        {/* Delete button */}
        {note && onDelete && (
          <Pressable
            onPress={handleDelete}
            accessibilityRole="button"
            accessibilityLabel={t('notebook.deleteNote')}
            className="px-4 py-2.5 rounded-lg active:bg-red-50 dark:active:bg-red-900/20"
            style={{ minHeight: 44 }}
          >
            <Text className="text-red-600 dark:text-red-400 text-sm">
              {t('notebook.deleteNote')}
            </Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}
