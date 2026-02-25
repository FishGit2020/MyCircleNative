import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from '@mycircle/shared';
import type { WorkEntry } from '../types';
import EntryForm from './EntryForm';

interface DayNodeProps {
  date: string;
  entries: WorkEntry[];
  onUpdate: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  return date.toLocaleDateString(undefined, options);
}

function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().split('T')[0];
}

function isYesterday(dateStr: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr === yesterday.toISOString().split('T')[0];
}

export default function DayNode({ date, entries, onUpdate, onDelete }: DayNodeProps) {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);

  const dayLabel = isToday(date)
    ? t('workTracker.today')
    : isYesterday(date)
      ? t('workTracker.yesterday')
      : '';

  const handleDelete = (entryId: string) => {
    Alert.alert(
      t('workTracker.delete'),
      t('workTracker.deleteConfirm'),
      [
        { text: t('workTracker.cancel'), style: 'cancel' },
        {
          text: t('workTracker.delete'),
          style: 'destructive',
          onPress: () => onDelete(entryId),
        },
      ],
    );
  };

  return (
    <View className="relative pl-14 mb-2">
      {/* Timeline line */}
      <View className="absolute left-[9px] top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

      {/* Timeline dot */}
      <View
        className={`absolute left-1 top-1 w-3 h-3 rounded-full border-2 ${
          isToday(date)
            ? 'bg-blue-500 dark:bg-blue-400 border-blue-500 dark:border-blue-400'
            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
        }`}
      />

      {/* Date label */}
      <View className="mb-2 flex-row items-center">
        <Text className="text-sm font-semibold text-gray-800 dark:text-white">
          {formatDate(date)}
        </Text>
        {dayLabel !== '' && (
          <Text className="ml-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
            {dayLabel}
          </Text>
        )}
        <Text className="ml-2 text-xs text-gray-400 dark:text-gray-500">
          {t('workTracker.entriesCount').replace('{count}', String(entries.length))}
        </Text>
      </View>

      {/* Entry cards */}
      <View className="mb-6 gap-2">
        {entries.map((entry) => (
          <View
            key={entry.id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3"
          >
            {editingId === entry.id ? (
              <EntryForm
                initialValue={entry.content}
                onSubmit={async (content) => {
                  await onUpdate(entry.id, content);
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <View className="flex-row items-start justify-between gap-2">
                <Text className="text-sm text-gray-700 dark:text-gray-300 flex-1 flex-wrap">
                  {entry.content}
                </Text>
                <View className="flex-row gap-1 flex-shrink-0">
                  <TouchableOpacity
                    onPress={() => setEditingId(entry.id)}
                    className="p-2 min-w-[44px] min-h-[44px] items-center justify-center"
                    accessibilityLabel={t('workTracker.edit')}
                    accessibilityRole="button"
                  >
                    <Text className="text-blue-500 dark:text-blue-400 text-xs font-medium">
                      {t('workTracker.edit')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(entry.id)}
                    className="p-2 min-w-[44px] min-h-[44px] items-center justify-center"
                    accessibilityLabel={t('workTracker.delete')}
                    accessibilityRole="button"
                  >
                    <Text className="text-red-500 dark:text-red-400 text-xs font-medium">
                      {t('workTracker.delete')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
