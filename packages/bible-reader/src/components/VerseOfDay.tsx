import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useQuery } from '@apollo/client';
import {
  useTranslation,
  getDailyVerse,
  getAllDailyVerses,
  GET_BIBLE_VOTD_API,
} from '@mycircle/shared';
import type { DailyVerse } from '@mycircle/shared';

interface VotdApiResponse {
  bibleVotdApi: {
    text: string;
    reference: string;
    translation: string | null;
    copyright: string | null;
  };
}

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export default function VerseOfDay() {
  const { t } = useTranslation();
  const [localVerse, setLocalVerse] = useState<DailyVerse>(() => getDailyVerse());

  const day = getDayOfYear();
  const { data, loading, error } = useQuery<VotdApiResponse>(GET_BIBLE_VOTD_API, {
    variables: { day },
    fetchPolicy: 'cache-first',
  });

  const handleShuffle = useCallback(() => {
    const all = getAllDailyVerses();
    const random = all[Math.floor(Math.random() * all.length)];
    setLocalVerse(random);
  }, []);

  const verse = data?.bibleVotdApi;
  const displayText = verse?.text ?? localVerse.text ?? '';
  const displayRef = verse?.reference ?? localVerse.reference;
  const displayTranslation = verse?.translation ?? null;
  const displayCopyright = verse?.copyright ?? localVerse.copyright ?? null;

  if (loading) {
    return (
      <View className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800/40 min-h-[140px] items-center justify-center">
        <ActivityIndicator color="#3b82f6" />
      </View>
    );
  }

  if (error && !localVerse.text) {
    return (
      <View className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800/40">
        <Text className="text-sm text-yellow-700 dark:text-yellow-300">
          {t('bible.votdError')}
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800/40 min-h-[140px]">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
          {t('bible.verseOfDay')}
        </Text>
        <Pressable
          onPress={handleShuffle}
          accessibilityLabel="Shuffle verse"
          accessibilityRole="button"
          className="w-8 h-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800/40 active:opacity-70"
        >
          <Text className="text-blue-600 dark:text-blue-400 text-base">
            &#x21bb;
          </Text>
        </Pressable>
      </View>
      <Text className="text-lg italic text-blue-700 dark:text-blue-300 leading-relaxed">
        &ldquo;{displayText}&rdquo;
      </Text>
      <Text className="text-sm text-blue-500 dark:text-blue-400 mt-3 font-medium">
        — {displayRef}
        {displayTranslation ? ` (${displayTranslation})` : ''}
      </Text>
      {displayCopyright ? (
        <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {displayCopyright}
        </Text>
      ) : null}
    </View>
  );
}
