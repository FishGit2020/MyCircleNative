import React from 'react';
import { View, Text, Image, Pressable, ActivityIndicator } from 'react-native';
import { useQuery } from '@apollo/client';
import { GET_PODCAST_FEED, useTranslation } from '@mycircle/shared';
import type { Podcast } from '../hooks/usePodcastData';

interface SubscribedPodcastsProps {
  subscribedIds: Set<string>;
  onSelectPodcast: (podcast: Podcast) => void;
  onUnsubscribe: (podcast: Podcast) => void;
}

function SubscribedPodcastCard({
  feedId,
  onSelect,
  onUnsubscribe,
}: {
  feedId: string;
  onSelect: (podcast: Podcast) => void;
  onUnsubscribe: (podcast: Podcast) => void;
}) {
  const { t } = useTranslation();
  const { data, loading } = useQuery(GET_PODCAST_FEED, {
    variables: { feedId },
    fetchPolicy: 'cache-first',
  });

  const feed = data?.podcastFeed as Podcast | undefined;

  if (loading) {
    return (
      <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <View className="aspect-square bg-gray-200 dark:bg-gray-700 items-center justify-center">
          <ActivityIndicator size="small" color="#6B7280" />
        </View>
        <View className="p-3">
          <View className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
          <View className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </View>
      </View>
    );
  }

  if (!feed) return null;

  const episodeCountText = t('podcasts.episodeCount').replace(
    '{count}',
    String(feed.episodeCount ?? 0),
  );

  return (
    <Pressable
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      onPress={() => onSelect(feed)}
      accessibilityLabel={`${feed.title} - ${feed.author}`}
      accessibilityRole="button"
    >
      {/* Artwork */}
      <View className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
        {feed.artwork ? (
          <Image
            source={{ uri: feed.artwork }}
            className="w-full h-full"
            resizeMode="cover"
            accessibilityLabel={feed.title}
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
          {feed.title}
        </Text>
        <Text
          className="text-xs text-gray-500 dark:text-gray-400 mt-0.5"
          numberOfLines={1}
        >
          {feed.author}
        </Text>

        <View className="flex-row items-center justify-between mt-2">
          <View className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700">
            <Text className="text-xs font-medium text-gray-600 dark:text-gray-300">
              {episodeCountText}
            </Text>
          </View>

          <Pressable
            onPress={() => onUnsubscribe(feed)}
            className="px-2.5 py-1 rounded-full min-h-[32px] items-center justify-center bg-red-50 dark:bg-red-900/30"
            accessibilityLabel={`${t('podcasts.unsubscribe')} ${feed.title}`}
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text className="text-xs font-medium text-red-600 dark:text-red-400">
              {t('podcasts.unsubscribe')}
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

export default function SubscribedPodcasts({
  subscribedIds,
  onSelectPodcast,
  onUnsubscribe,
}: SubscribedPodcastsProps) {
  const { t } = useTranslation();
  const ids = Array.from(subscribedIds);

  if (ids.length === 0) {
    return (
      <View className="py-12 items-center">
        <Text className="text-4xl mb-4">🎙</Text>
        <Text className="text-gray-500 dark:text-gray-400 font-medium text-center">
          {t('podcasts.noSubscriptions')}
        </Text>
        <Text className="text-sm text-gray-400 dark:text-gray-500 mt-1 text-center px-8">
          {t('podcasts.addSome')}
        </Text>
      </View>
    );
  }

  return (
    <View>
      <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {t('podcasts.subscriptions')}
      </Text>
      <View className="flex-row flex-wrap gap-3">
        {ids.map((id) => (
          <View key={id} className="w-[48%]">
            <SubscribedPodcastCard
              feedId={id}
              onSelect={onSelectPodcast}
              onUnsubscribe={onUnsubscribe}
            />
          </View>
        ))}
      </View>
    </View>
  );
}
