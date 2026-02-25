import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@mycircle/shared';
import type { Note, PublicNote } from '../types';

function formatDate(date: Note['updatedAt']): string {
  const d =
    date && typeof (date as any).toDate === 'function'
      ? (date as any).toDate()
      : date instanceof Date
        ? date
        : new Date();
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function isPublicNote(note: Note): note is PublicNote {
  return 'isPublic' in note && (note as PublicNote).isPublic === true;
}

interface NoteCardProps {
  note: Note | PublicNote;
  onPress: () => void;
  onDelete: () => void;
}

export default function NoteCard({ note, onPress, onDelete }: NoteCardProps) {
  const { t } = useTranslation();
  const isPublic = isPublicNote(note);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${note.title || t('notebook.noteTitle')} — ${t('notebook.lastEdited')} ${formatDate(note.updatedAt)}`}
      className={`rounded-xl border p-4 mb-3 ${
        isPublic
          ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}
      style={{ minHeight: 44 }}
    >
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-row items-center gap-2 flex-1">
          <Text
            className="font-semibold text-gray-900 dark:text-white text-base flex-shrink"
            numberOfLines={1}
          >
            {note.title || t('notebook.noteTitle')}
          </Text>
          {isPublic && (
            <View className="px-1.5 py-0.5 bg-green-100 dark:bg-green-800/40 rounded">
              <Text className="text-[10px] font-semibold uppercase tracking-wide text-green-700 dark:text-green-300">
                {t('notebook.public')}
              </Text>
            </View>
          )}
        </View>
        <Pressable
          onPress={(e) => {
            e.stopPropagation?.();
            onDelete();
          }}
          accessibilityRole="button"
          accessibilityLabel={t('notebook.deleteNote')}
          className="p-2 rounded active:bg-red-100 dark:active:bg-red-900/30"
          style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="trash-outline" size={18} color="#9ca3af" />
        </Pressable>
      </View>

      <Text
        className="text-sm text-gray-500 dark:text-gray-400 mt-1"
        numberOfLines={2}
      >
        {note.content ? note.content.slice(0, 120) : ''}
      </Text>

      <View className="flex-row items-center justify-between mt-2">
        <Text className="text-xs text-gray-400 dark:text-gray-500">
          {t('notebook.lastEdited')} {formatDate(note.updatedAt)}
        </Text>
        {isPublic && note.createdBy && (
          <Text className="text-xs text-green-600 dark:text-green-400 font-medium">
            {t('notebook.publishedBy').replace('{name}', note.createdBy.displayName)}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
