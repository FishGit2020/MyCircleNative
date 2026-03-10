import React, { useState, useCallback } from 'react';
import {

  ScrollView,
  View,
  Text,
  Image,
  Pressable,
} from 'react-native';
import {
  useTranslation,
  eventBus,
  MFEvents,
} from '@mycircle/shared';
import type { Podcast, Episode } from './hooks/usePodcastData';
import { usePodcastEpisodes, useSubscriptions } from './hooks/usePodcastData';
import PodcastSearch from './components/PodcastSearch';
import TrendingPodcasts from './components/TrendingPodcasts';
import SubscribedPodcasts from './components/SubscribedPodcasts';
import EpisodeList from './components/EpisodeList';
import AudioPlayer from './components/AudioPlayer';

export default function PodcastsScreen() {
  const { t } = useTranslation();
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'discover' | 'subscribed'>(
    'discover',
  );
  const { subscribedIds, toggleSubscribe } = useSubscriptions();

  const feedId = selectedPodcast?.id ?? null;
  const {
    data: episodes,
    loading: episodesLoading,
    error: episodesError,
  } = usePodcastEpisodes(feedId);

  const handleSelectPodcast = useCallback((podcast: Podcast) => {
    setSelectedPodcast(podcast);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedPodcast(null);
  }, []);

  const handlePlayEpisode = useCallback(
    (episode: Episode) => {
      if (currentEpisode && String(currentEpisode.id) === String(episode.id)) {
        setIsPlaying((prev) => !prev);
      } else {
        setCurrentEpisode(episode);
        setIsPlaying(true);
      }
      eventBus.publish(MFEvents.PODCAST_PLAY_EPISODE, {
        episode,
        podcast: selectedPodcast,
      });
    },
    [currentEpisode, selectedPodcast],
  );

  const handleClosePlayer = useCallback(() => {
    setCurrentEpisode(null);
    setIsPlaying(false);
  }, []);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-6 pb-32"
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('podcasts.title')}
          </Text>
          <PodcastSearch onSelectPodcast={handleSelectPodcast} />
        </View>

        {/* Tab bar (shown when no podcast is selected) */}
        {!selectedPodcast && (
          <View className="flex-row mb-6 border-b border-gray-200 dark:border-gray-700">
            <Pressable
              onPress={() => setActiveTab('discover')}
              className={`px-4 py-2 min-h-[44px] items-center justify-center border-b-2 ${
                activeTab === 'discover'
                  ? 'border-blue-500'
                  : 'border-transparent'
              }`}
              accessibilityLabel={t('podcasts.trending')}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'discover' }}
            >
              <Text
                className={`text-sm font-medium ${
                  activeTab === 'discover'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {t('podcasts.trending')}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('subscribed')}
              className={`px-4 py-2 min-h-[44px] flex-row items-center justify-center border-b-2 ${
                activeTab === 'subscribed'
                  ? 'border-blue-500'
                  : 'border-transparent'
              }`}
              accessibilityLabel={t('podcasts.subscriptions')}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'subscribed' }}
            >
              <Text
                className={`text-sm font-medium ${
                  activeTab === 'subscribed'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {t('podcasts.subscriptions')}
              </Text>
              {subscribedIds.size > 0 && (
                <View className="ml-1.5 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 items-center justify-center">
                  <Text className="text-xs text-blue-600 dark:text-blue-400">
                    {subscribedIds.size}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        )}

        {/* Content area */}
        {selectedPodcast ? (
          <View>
            {/* Back button */}
            <Pressable
              onPress={handleBack}
              className="flex-row items-center gap-1 mb-4 min-h-[44px]"
              accessibilityLabel={t('podcasts.trending')}
              accessibilityRole="button"
            >
              <Text className="text-blue-600 dark:text-blue-400 text-lg">
                {'\u2190'}
              </Text>
              <Text className="text-sm text-blue-600 dark:text-blue-400">
                {t('podcasts.trending')}
              </Text>
            </Pressable>

            {/* Selected podcast header */}
            <View className="flex-row items-start gap-4 mb-6">
              {selectedPodcast.artwork ? (
                <Image
                  source={{ uri: selectedPodcast.artwork }}
                  className="w-24 h-24 rounded-xl"
                  resizeMode="cover"
                  accessibilityLabel={selectedPodcast.title}
                />
              ) : (
                <View className="w-24 h-24 rounded-xl bg-gray-200 dark:bg-gray-700 items-center justify-center">
                  <Text className="text-4xl text-gray-400 dark:text-gray-500">
                    🎙
                  </Text>
                </View>
              )}

              <View className="flex-1 min-w-0">
                <Text className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedPodcast.title}
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedPodcast.author}
                </Text>
                {selectedPodcast.description ? (
                  <Text
                    className="text-sm text-gray-500 dark:text-gray-400 mt-2"
                    numberOfLines={3}
                  >
                    {stripHtml(selectedPodcast.description)}
                  </Text>
                ) : null}

                {/* Subscribe button */}
                <Pressable
                  onPress={() => toggleSubscribe(selectedPodcast)}
                  className={`mt-3 px-4 py-2 rounded-full self-start min-h-[40px] items-center justify-center ${
                    subscribedIds.has(String(selectedPodcast.id))
                      ? 'bg-red-50 dark:bg-red-900/30'
                      : 'bg-blue-500 dark:bg-blue-600'
                  }`}
                  accessibilityLabel={
                    subscribedIds.has(String(selectedPodcast.id))
                      ? `${t('podcasts.unsubscribe')} ${selectedPodcast.title}`
                      : `${t('podcasts.subscribe')} ${selectedPodcast.title}`
                  }
                  accessibilityRole="button"
                >
                  <Text
                    className={`text-sm font-medium ${
                      subscribedIds.has(String(selectedPodcast.id))
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-white'
                    }`}
                  >
                    {subscribedIds.has(String(selectedPodcast.id))
                      ? t('podcasts.unsubscribe')
                      : t('podcasts.subscribe')}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Episodes */}
            <View>
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {t('podcasts.episodes')}
              </Text>
              <EpisodeList
                episodes={episodes ?? []}
                loading={episodesLoading}
                error={episodesError}
                currentEpisodeId={currentEpisode?.id ?? null}
                isPlaying={isPlaying}
                onPlayEpisode={handlePlayEpisode}
                podcast={selectedPodcast}
              />
            </View>
          </View>
        ) : activeTab === 'discover' ? (
          <TrendingPodcasts
            onSelectPodcast={handleSelectPodcast}
            subscribedIds={subscribedIds}
            onToggleSubscribe={toggleSubscribe}
          />
        ) : (
          <SubscribedPodcasts
            subscribedIds={subscribedIds}
            onSelectPodcast={handleSelectPodcast}
            onUnsubscribe={toggleSubscribe}
          />
        )}
      </ScrollView>

      {/* Audio Player (fixed at bottom) */}
      {currentEpisode && (
        <View className="absolute bottom-0 left-0 right-0">
          <AudioPlayer
            episode={currentEpisode}
            podcast={selectedPodcast}
            onClose={handleClosePlayer}
          />
        </View>
      )}
    </View>
  );
}

/** Strip HTML tags for plain text display (no DOMParser in RN) */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
