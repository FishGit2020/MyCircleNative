import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { useTranslation } from '@mycircle/shared';
import type { Podcast } from '../hooks/usePodcastData';

interface PodcastCardProps {
  podcast: Podcast;
  onSelect: (podcast: Podcast) => void;
  isSubscribed: boolean;
  onToggleSubscribe: (podcast: Podcast) => void;
}

function PodcastCard({
  podcast,
  onSelect,
  isSubscribed,
  onToggleSubscribe,
}: PodcastCardProps) {
  const { t } = useTranslation();

  const episodeCountText =
    podcast.episodeCount != null
      ? t('podcasts.episodeCount').replace('{count}', String(podcast.episodeCount))
      : null;

  const categoriesStr =
    typeof podcast.categories === 'string' ? (podcast.categories as string) : '';

  return (
    <Pressable
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
      onPress={() => onSelect(podcast)}
      accessibilityLabel={`${podcast.title} - ${podcast.author}`}
      accessibilityRole="button"
    >
      {/* Artwork */}
      <View className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
        {podcast.artwork ? (
          <Image
            source={{ uri: podcast.artwork }}
            className="w-full h-full"
            resizeMode="cover"
            accessibilityLabel={podcast.title}
          />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <Text className="text-4xl text-gray-300 dark:text-gray-600">
              🎙
            </Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View className="p-3">
        <Text
          className="text-sm font-semibold text-gray-900 dark:text-white"
          numberOfLines={1}
        >
          {podcast.title}
        </Text>
        <Text
          className="text-xs text-gray-500 dark:text-gray-400 mt-0.5"
          numberOfLines={1}
        >
          {podcast.author}
        </Text>

        {/* Category tags */}
        {categoriesStr.length > 0 && (
          <View className="flex-row flex-wrap gap-1 mt-1.5">
            {categoriesStr
              .split(', ')
              .slice(0, 2)
              .map((cat: string) => (
                <View
                  key={cat}
                  className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-900/30"
                >
                  <Text
                    className="text-[10px] text-purple-600 dark:text-purple-400"
                    numberOfLines={1}
                  >
                    {cat}
                  </Text>
                </View>
              ))}
          </View>
        )}

        <View className="flex-row items-center justify-between mt-2">
          {episodeCountText != null && (
            <View className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700">
              <Text
                className="text-xs font-medium text-gray-600 dark:text-gray-300"
                accessibilityLabel={episodeCountText}
              >
                {episodeCountText}
              </Text>
            </View>
          )}

          <Pressable
            onPress={() => onToggleSubscribe(podcast)}
            className={`px-2.5 py-1 rounded-full min-h-[32px] items-center justify-center ${
              isSubscribed
                ? 'bg-red-50 dark:bg-red-900/30'
                : 'bg-blue-50 dark:bg-blue-900/30'
            }`}
            accessibilityLabel={
              isSubscribed
                ? `${t('podcasts.unsubscribe')} ${podcast.title}`
                : `${t('podcasts.subscribe')} ${podcast.title}`
            }
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text
              className={`text-xs font-medium ${
                isSubscribed
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-blue-600 dark:text-blue-400'
              }`}
            >
              {isSubscribed ? t('podcasts.unsubscribe') : t('podcasts.subscribe')}
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

export default React.memo(PodcastCard);
