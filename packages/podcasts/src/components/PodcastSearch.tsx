import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from '@mycircle/shared';
import { usePodcastSearch } from '../hooks/usePodcastData';
import type { Podcast } from '../hooks/usePodcastData';

interface PodcastSearchProps {
  onSelectPodcast: (podcast: Podcast) => void;
}

export default function PodcastSearch({ onSelectPodcast }: PodcastSearchProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { data, loading, error } = usePodcastSearch(query);
  const results = data?.feeds ?? [];

  const handleSelect = useCallback(
    (podcast: Podcast) => {
      onSelectPodcast(podcast);
      setQuery('');
      setIsOpen(false);
    },
    [onSelectPodcast],
  );

  const showResults = isOpen && query.length >= 2;
  const showNoResults = showResults && !loading && results.length === 0 && !error;

  return (
    <View className="relative">
      {/* Search input */}
      <View className="relative">
        <TextInput
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={t('podcasts.search')}
          placeholderTextColor="#9CA3AF"
          className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base"
          accessibilityLabel={t('podcasts.search')}
          accessibilityRole="search"
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        <View className="absolute right-3 top-0 bottom-0 justify-center">
          <Text className="text-gray-400 dark:text-gray-500 text-lg">
            {'\u{1F50D}'}
          </Text>
        </View>
      </View>

      {/* Loading results */}
      {showResults && loading && (
        <View className="mt-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden p-4 items-center">
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {t('podcasts.loading')}
          </Text>
        </View>
      )}

      {/* Search results */}
      {showResults && !loading && results.length > 0 && (
        <View className="mt-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden max-h-80">
          <FlatList
            data={results}
            keyExtractor={(item) => String(item.id)}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item: podcast }) => (
              <Pressable
                onPress={() => handleSelect(podcast)}
                className="flex-row items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700 min-h-[56px] active:bg-blue-50 dark:active:bg-gray-700"
                accessibilityLabel={`${podcast.title} - ${podcast.author}`}
                accessibilityRole="button"
              >
                {podcast.artwork ? (
                  <Image
                    source={{ uri: podcast.artwork }}
                    className="w-10 h-10 rounded"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-10 h-10 rounded bg-gray-200 dark:bg-gray-600 items-center justify-center">
                    <Text className="text-lg text-gray-400 dark:text-gray-500">
                      🎙
                    </Text>
                  </View>
                )}
                <View className="flex-1 min-w-0">
                  <Text
                    className="font-medium text-gray-900 dark:text-white"
                    numberOfLines={1}
                  >
                    {podcast.title}
                  </Text>
                  <Text
                    className="text-sm text-gray-500 dark:text-gray-400"
                    numberOfLines={1}
                  >
                    {podcast.author}
                  </Text>
                </View>
              </Pressable>
            )}
          />
        </View>
      )}

      {/* No results */}
      {showNoResults && (
        <View className="mt-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden px-4 py-6 items-center">
          <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            {t('podcasts.noResults')}
          </Text>
        </View>
      )}

      {/* Error */}
      {showResults && error && (
        <View className="mt-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden px-4 py-6 items-center">
          <Text className="text-red-500 dark:text-red-400 text-sm">
            {t('podcasts.error')}
          </Text>
        </View>
      )}

      {/* Dismiss overlay when search results are visible */}
      {showResults && (
        <Pressable
          className="absolute top-0 left-0 right-0 -z-10"
          onPress={() => setIsOpen(false)}
          accessibilityLabel="Dismiss search"
          style={{ height: 0 }}
        />
      )}
    </View>
  );
}
