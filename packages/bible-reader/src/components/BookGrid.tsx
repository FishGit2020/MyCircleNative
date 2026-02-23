import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, TextInput, FlatList } from 'react-native';
import { useTranslation } from '@mycircle/shared';
import { BIBLE_BOOKS } from '../data/books';
import type { BibleBook } from '../data/books';

interface BookGridProps {
  onSelectBook: (bookName: string, chapterCount: number) => void;
}

type Tab = 'OT' | 'NT';

export default function BookGrid({ onSelectBook }: BookGridProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('OT');
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    const books = BIBLE_BOOKS.filter((b) => b.testament === activeTab);
    if (!filter) return books;
    const lower = filter.toLowerCase();
    return books.filter((b) => b.name.toLowerCase().includes(lower));
  }, [activeTab, filter]);

  const handleSelect = useCallback(
    (book: BibleBook) => {
      onSelectBook(book.name, book.chapters);
    },
    [onSelectBook],
  );

  const renderBook = useCallback(
    ({ item }: { item: BibleBook }) => (
      <Pressable
        onPress={() => handleSelect(item)}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, ${item.chapters} chapters`}
        className="flex-1 m-1 px-3 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 active:bg-blue-50 dark:active:bg-blue-900/20 min-w-[45%] max-w-[48%]"
      >
        <Text className="text-sm font-medium text-gray-800 dark:text-gray-200" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          {item.chapters} {t('bible.chapter')}
        </Text>
      </Pressable>
    ),
    [handleSelect, t],
  );

  const keyExtractor = useCallback((item: BibleBook) => item.name, []);

  return (
    <View className="flex-1">
      {/* Search */}
      <TextInput
        value={filter}
        onChangeText={setFilter}
        placeholder={t('bible.searchBooks')}
        placeholderTextColor="#9ca3af"
        accessibilityLabel={t('bible.searchBooks')}
        className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm mb-4"
      />

      {/* Tabs */}
      <View className="flex-row mb-4">
        <Pressable
          onPress={() => setActiveTab('OT')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'OT' }}
          className={`flex-1 py-2.5 rounded-l-lg border ${
            activeTab === 'OT'
              ? 'bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500'
              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
          }`}
        >
          <Text
            className={`text-center text-sm font-semibold ${
              activeTab === 'OT'
                ? 'text-white'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {t('bible.oldTestament')}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('NT')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'NT' }}
          className={`flex-1 py-2.5 rounded-r-lg border ${
            activeTab === 'NT'
              ? 'bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500'
              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
          }`}
        >
          <Text
            className={`text-center text-sm font-semibold ${
              activeTab === 'NT'
                ? 'text-white'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {t('bible.newTestament')}
          </Text>
        </Pressable>
      </View>

      {/* Book Grid */}
      <FlatList
        data={filtered}
        renderItem={renderBook}
        keyExtractor={keyExtractor}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
