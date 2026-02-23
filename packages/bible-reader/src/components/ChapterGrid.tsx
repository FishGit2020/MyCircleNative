import React, { useCallback } from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import { useTranslation } from '@mycircle/shared';

interface ChapterGridProps {
  bookName: string;
  chapterCount: number;
  onSelectChapter: (chapter: number) => void;
  onBack: () => void;
}

export default function ChapterGrid({
  bookName,
  chapterCount,
  onSelectChapter,
  onBack,
}: ChapterGridProps) {
  const { t } = useTranslation();

  const chapters = Array.from({ length: chapterCount }, (_, i) => i + 1);

  const renderChapter = useCallback(
    ({ item }: { item: number }) => (
      <Pressable
        onPress={() => onSelectChapter(item)}
        accessibilityRole="button"
        accessibilityLabel={`${t('bible.chapter')} ${item}`}
        className="flex-1 m-1 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 active:bg-blue-100 dark:active:bg-blue-900/30 items-center justify-center min-w-[17%] max-w-[19%]"
      >
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {item}
        </Text>
      </Pressable>
    ),
    [onSelectChapter, t],
  );

  const keyExtractor = useCallback((item: number) => String(item), []);

  return (
    <View className="flex-1">
      {/* Back button */}
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel={t('bible.allBooks')}
        className="flex-row items-center mb-4 active:opacity-70"
      >
        <Text className="text-blue-600 dark:text-blue-400 text-lg mr-1">
          &#x2039;
        </Text>
        <Text className="text-sm text-blue-600 dark:text-blue-400">
          {t('bible.allBooks')}
        </Text>
      </Pressable>

      {/* Book title */}
      <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
        {bookName}
      </Text>

      {/* Chapter grid */}
      <FlatList
        data={chapters}
        renderItem={renderChapter}
        keyExtractor={keyExtractor}
        numColumns={5}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
