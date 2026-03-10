import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from '@mycircle/shared';
import type { WorkEntry } from '../types';
import EntryForm from './EntryForm';

interface DayNodeProps {
  date: string;
  entries: WorkEntry[];
  onUpdate: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onMove?: (id: string, newDate: string) => Promise<void>;
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

export default function DayNode({ date, entries, onUpdate, onDelete, onMove }: DayNodeProps) {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [movingEntryId, setMovingEntryId] = useState<string | null>(null);
  const [moveDate, setMoveDate] = useState(new Date());

  const dayLabel = isToday(date)
    ? t('dailyLog.today')
    : isYesterday(date)
      ? t('dailyLog.yesterday')
      : '';

  const handleDelete = (entryId: string) => {
    Alert.alert(
      t('dailyLog.delete'),
      t('dailyLog.deleteConfirm'),
      [
        { text: t('dailyLog.cancel'), style: 'cancel' },
        {
          text: t('dailyLog.delete'),
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
          {t('dailyLog.entriesCount').replace('{count}', String(entries.length))}
        </Text>
      </View>

      {/* Entry cards */}
      <View className="mb-6 gap-2">
        {entries.map((entry) => (
          <TouchableOpacity
            key={entry.id}
            activeOpacity={0.8}
            onLongPress={() => {
              if (onMove) {
                setMovingEntryId(entry.id);
                setMoveDate(new Date(entry.date + 'T00:00:00'));
              }
            }}
            accessibilityLabel={entry.content}
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
                  {onMove && (
                    <TouchableOpacity
                      onPress={() => {
                        setMovingEntryId(entry.id);
                        setMoveDate(new Date(entry.date + 'T00:00:00'));
                      }}
                      className="p-2 min-w-[44px] min-h-[44px] items-center justify-center"
                      accessibilityLabel={t('dailyLog.moveToDate')}
                      accessibilityRole="button"
                    >
                      <Text className="text-purple-500 dark:text-purple-400 text-xs font-medium">
                        {t('dailyLog.moveDate')}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => setEditingId(entry.id)}
                    className="p-2 min-w-[44px] min-h-[44px] items-center justify-center"
                    accessibilityLabel={t('dailyLog.edit')}
                    accessibilityRole="button"
                  >
                    <Text className="text-blue-500 dark:text-blue-400 text-xs font-medium">
                      {t('dailyLog.edit')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(entry.id)}
                    className="p-2 min-w-[44px] min-h-[44px] items-center justify-center"
                    accessibilityLabel={t('dailyLog.delete')}
                    accessibilityRole="button"
                  >
                    <Text className="text-red-500 dark:text-red-400 text-xs font-medium">
                      {t('dailyLog.delete')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Date picker for move entry */}
        {movingEntryId && (
          <View className="bg-white dark:bg-gray-800 rounded-xl border border-purple-200 dark:border-purple-700 p-3">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('dailyLog.moveDatePicker')}
            </Text>
            <DateTimePicker
              value={moveDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={async (_event: any, selectedDate?: Date) => {
                if (Platform.OS === 'android') {
                  // Android dismisses on selection
                  if (!selectedDate) {
                    setMovingEntryId(null);
                    return;
                  }
                  const newDateStr = selectedDate.toISOString().split('T')[0];
                  if (onMove && movingEntryId) {
                    await onMove(movingEntryId, newDateStr);
                  }
                  setMovingEntryId(null);
                } else {
                  if (selectedDate) {
                    setMoveDate(selectedDate);
                  }
                }
              }}
            />
            {Platform.OS === 'ios' && (
              <View className="flex-row justify-end gap-2 mt-2">
                <TouchableOpacity
                  onPress={() => setMovingEntryId(null)}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg min-h-[44px] justify-center"
                  accessibilityLabel={t('dailyLog.cancel')}
                  accessibilityRole="button"
                >
                  <Text className="text-sm text-gray-700 dark:text-gray-300">
                    {t('dailyLog.cancel')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={async () => {
                    const newDateStr = moveDate.toISOString().split('T')[0];
                    if (onMove && movingEntryId) {
                      await onMove(movingEntryId, newDateStr);
                    }
                    setMovingEntryId(null);
                  }}
                  className="px-3 py-2 bg-purple-500 dark:bg-purple-600 rounded-lg min-h-[44px] justify-center"
                  accessibilityLabel={t('dailyLog.moveDate')}
                  accessibilityRole="button"
                >
                  <Text className="text-sm text-white font-medium">
                    {t('dailyLog.moveDate')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
