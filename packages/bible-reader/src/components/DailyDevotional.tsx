import React, { useState, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  useTranslation,
  getDailyDevotional,
  StorageKeys,
  safeGetItem,
  safeSetItem,
} from '@mycircle/shared';

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function isDevotionalCompleted(): boolean {
  try {
    const log = safeGetItem(StorageKeys.BIBLE_DEVOTIONAL_LOG);
    if (!log) return false;
    const parsed: string[] = JSON.parse(log);
    return parsed.includes(getTodayKey());
  } catch {
    return false;
  }
}

function markDevotionalCompleted(): void {
  try {
    const log = safeGetItem(StorageKeys.BIBLE_DEVOTIONAL_LOG);
    const parsed: string[] = log ? JSON.parse(log) : [];
    const key = getTodayKey();
    if (!parsed.includes(key)) {
      // Keep last 90 days to avoid unbounded growth
      const updated = [...parsed.slice(-89), key];
      safeSetItem(StorageKeys.BIBLE_DEVOTIONAL_LOG, JSON.stringify(updated));
    }
  } catch {
    /* ignore */
  }
}

interface DailyDevotionalProps {
  onReadPassage: (book: string, chapter: number) => void;
}

export default function DailyDevotional({ onReadPassage }: DailyDevotionalProps) {
  const { t } = useTranslation();
  const devotional = getDailyDevotional();
  const [completed, setCompleted] = useState(isDevotionalCompleted);

  const handleRead = useCallback(() => {
    markDevotionalCompleted();
    setCompleted(true);
    onReadPassage(devotional.book, devotional.chapter);
  }, [devotional.book, devotional.chapter, onReadPassage]);

  const handleToggleComplete = useCallback(() => {
    if (!completed) {
      markDevotionalCompleted();
      setCompleted(true);
    }
  }, [completed]);

  return (
    <View className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-5 border border-amber-200 dark:border-amber-700/60">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-sm font-semibold text-amber-700 dark:text-amber-100 uppercase tracking-wide mb-1">
            {t('bible.dailyDevotional')}
          </Text>
          <Text className="text-base font-medium text-gray-800 dark:text-white">
            {devotional.book} {devotional.chapter}
          </Text>
          <Text className="text-sm text-amber-600 dark:text-amber-200/90 mt-1 italic">
            &ldquo;{devotional.theme}&rdquo;
          </Text>
        </View>

        <View className="items-end gap-2">
          {/* Read Passage button */}
          <Pressable
            onPress={handleRead}
            accessibilityRole="button"
            accessibilityLabel={t('bible.devotionalRead')}
            className={`flex-row items-center gap-1.5 px-3 py-2 rounded-lg active:opacity-80 ${
              completed
                ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800'
                : 'bg-amber-600 dark:bg-amber-500'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                completed
                  ? 'text-green-700 dark:text-green-400'
                  : 'text-white'
              }`}
            >
              {completed ? t('bible.devotionalCompleted') : t('bible.devotionalRead')}
            </Text>
          </Pressable>

          {/* Completion checkbox */}
          {!completed ? (
            <Pressable
              onPress={handleToggleComplete}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: completed }}
              accessibilityLabel={t('bible.devotionalCompleted')}
              className="flex-row items-center gap-1.5 active:opacity-70"
            >
              <View className="w-5 h-5 rounded border-2 border-amber-400 dark:border-amber-500 items-center justify-center" />
              <Text className="text-xs text-amber-600 dark:text-amber-400">
                {t('bible.devotionalCompleted')}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}
