import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useTranslation } from '@mycircle/shared';
import { useTrendingPodcasts } from '../hooks/usePodcastData';
import type { Podcast } from '../hooks/usePodcastData';
import PodcastCard from './PodcastCard';

interface TrendingPodcastsProps {
  onSelectPodcast: (podcast: Podcast) => void;
  subscribedIds: Set<string>;
  onToggleSubscribe: (podcast: Podcast) => void;
}

function extractCategories(podcasts: Podcast[]): string[] {
  const counts = new Map<string, number>();
  for (const p of podcasts) {
    const cats = typeof p.categories === 'string' ? (p.categories as string) : '';
    if (!cats) continue;
    for (const cat of cats.split(', ')) {
      const trimmed = cat.trim();
      if (trimmed) counts.set(trimmed, (counts.get(trimmed) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([cat]) => cat);
}

function podcastMatchesCategory(podcast: Podcast, category: string): boolean {
  const cats = typeof podcast.categories === 'string' ? (podcast.categories as string) : '';
  return cats.split(', ').some((c) => c.trim() === category);
}

export default function TrendingPodcasts({
  onSelectPodcast,
  subscribedIds,
  onToggleSubscribe,
}: TrendingPodcastsProps) {
  const { t } = useTranslation();
  const { data: podcasts, loading, error } = useTrendingPodcasts();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(
    () => (podcasts ? extractCategories(podcasts) : []),
    [podcasts],
  );

  const filteredPodcasts = useMemo(() => {
    if (!podcasts) return [];
    if (!selectedCategory) return podcasts;
    return podcasts.filter((p) => podcastMatchesCategory(p, selectedCategory));
  }, [podcasts, selectedCategory]);

  if (loading) {
    return (
      <View className="py-12 items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-3">
          {t('podcasts.loading')}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="py-12 items-center">
        <Text className="text-sm text-red-500 dark:text-red-400 font-medium">
          {t('podcasts.error')}
        </Text>
      </View>
    );
  }

  if (!podcasts || podcasts.length === 0) {
    return null;
  }

  return (
    <View>
      {/* Title */}
      <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {selectedCategory ? selectedCategory : t('podcasts.trending')}
      </Text>

      {/* Category filter chips */}
      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
          contentContainerClassName="gap-2 px-1"
          accessibilityLabel={t('podcasts.categories')}
        >
          <Pressable
            onPress={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full min-h-[36px] items-center justify-center ${
              !selectedCategory
                ? 'bg-blue-500 dark:bg-blue-600'
                : 'bg-gray-100 dark:bg-gray-700'
            }`}
            accessibilityLabel={t('podcasts.allCategories')}
            accessibilityRole="button"
          >
            <Text
              className={`text-sm font-medium ${
                !selectedCategory
                  ? 'text-white'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {t('podcasts.allCategories')}
            </Text>
          </Pressable>

          {categories.map((cat) => (
            <Pressable
              key={cat}
              onPress={() =>
                setSelectedCategory((prev) => (prev === cat ? null : cat))
              }
              className={`px-3 py-1.5 rounded-full min-h-[36px] items-center justify-center ${
                selectedCategory === cat
                  ? 'bg-purple-500 dark:bg-purple-600'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}
              accessibilityLabel={cat}
              accessibilityRole="button"
            >
              <Text
                className={`text-sm font-medium ${
                  selectedCategory === cat
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Podcast grid */}
      {filteredPodcasts.length > 0 ? (
        <View className="flex-row flex-wrap gap-3">
          {filteredPodcasts.map((p) => (
            <View key={String(p.id)} className="w-[48%]">
              <PodcastCard
                podcast={p}
                onSelect={onSelectPodcast}
                isSubscribed={subscribedIds.has(String(p.id))}
                onToggleSubscribe={onToggleSubscribe}
              />
            </View>
          ))}
        </View>
      ) : selectedCategory ? (
        <View className="py-12 items-center">
          <Text className="text-gray-500 dark:text-gray-400">
            {t('podcasts.noInCategory')}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
