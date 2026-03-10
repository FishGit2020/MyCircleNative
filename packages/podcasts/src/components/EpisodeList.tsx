import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import {
  useTranslation,
  StorageKeys,
  safeGetItem,
  eventBus,
  MFEvents,
} from '@mycircle/shared';
import type { Episode, Podcast } from '../hooks/usePodcastData';

interface EpisodeListProps {
  episodes: Episode[];
  loading: boolean;
  error: string | null;
  currentEpisodeId: string | number | null;
  isPlaying: boolean;
  onPlayEpisode: (episode: Episode) => void;
  podcast?: Podcast | null;
}

interface EpisodeProgress {
  episodeId: string | number;
  currentTime: number;
}

function loadProgress(): EpisodeProgress | null {
  try {
    const stored = safeGetItem(StorageKeys.PODCAST_PROGRESS);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '--:--';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) {
    return `${h}h ${m}m`;
  }
  return `${m} min`;
}

function formatDate(timestamp: number): string {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
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

export default function EpisodeList({
  episodes,
  loading,
  error,
  currentEpisodeId,
  isPlaying,
  onPlayEpisode,
  podcast,
}: EpisodeListProps) {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [visibleCount, setVisibleCount] = useState(20);

  const progress = useMemo(() => loadProgress(), [currentEpisodeId]);

  const visibleEpisodes = useMemo(
    () => episodes.slice(0, visibleCount),
    [episodes, visibleCount],
  );
  const hasMore = episodes.length > visibleCount;

  const handleShowMore = useCallback(() => {
    setVisibleCount((prev) => prev + 20);
  }, []);

  if (loading) {
    return (
      <View className="py-8 items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-3">
          {t('podcasts.loading')}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="py-8 items-center">
        <Text className="text-sm text-red-500 dark:text-red-400">
          {t('podcasts.error')}
        </Text>
      </View>
    );
  }

  if (episodes.length === 0) {
    return (
      <View className="py-8 items-center">
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          {t('podcasts.noResults')}
        </Text>
      </View>
    );
  }

  return (
    <View accessibilityRole="list" accessibilityLabel={t('podcasts.episodes')}>
      {visibleEpisodes.map((episode) => {
        const isCurrent = String(episode.id) === String(currentEpisodeId);
        const isCurrentlyPlaying = isCurrent && isPlaying;
        const isExpanded = expandedId === episode.id;

        // Check progress for this episode
        const hasEpisodeProgress =
          progress &&
          String(progress.episodeId) === String(episode.id) &&
          progress.currentTime > 0;
        const progressPercent =
          hasEpisodeProgress && episode.duration > 0
            ? Math.min((progress!.currentTime / episode.duration) * 100, 100)
            : 0;
        const isComplete =
          hasEpisodeProgress && progress!.currentTime >= episode.duration - 5;

        return (
          <View
            key={String(episode.id)}
            accessibilityRole="none"
            className={`rounded-lg border mb-2 ${
              isCurrent
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}
          >
            <Pressable
              className="flex-row items-center gap-3 p-3 min-h-[56px]"
              onPress={() => onPlayEpisode(episode)}
              accessibilityLabel={
                isCurrentlyPlaying
                  ? `${t('podcasts.pauseEpisode')}: ${episode.title}`
                  : `${t('podcasts.playEpisode')}: ${episode.title}`
              }
              accessibilityRole="button"
            >
              {/* Play button */}
              <View
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  isCurrent
                    ? 'bg-blue-500 dark:bg-blue-600'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                {isCurrentlyPlaying ? (
                  <Text className="text-white text-xs font-bold">| |</Text>
                ) : (
                  <Text
                    className={`text-sm ml-0.5 ${
                      isCurrent
                        ? 'text-white'
                        : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {'\u25B6'}
                  </Text>
                )}
              </View>

              {/* Episode info */}
              <View className="flex-1 min-w-0">
                <Text
                  className={`text-sm font-medium ${
                    isCurrent
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-gray-900 dark:text-white'
                  }`}
                  numberOfLines={2}
                >
                  {episode.title}
                </Text>
                <View className="flex-row items-center gap-2 mt-0.5">
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(episode.datePublished)}
                  </Text>
                  {episode.duration > 0 && (
                    <>
                      <Text className="text-xs text-gray-300 dark:text-gray-600">
                        |
                      </Text>
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDuration(episode.duration)}
                      </Text>
                    </>
                  )}
                  {isComplete && (
                    <>
                      <Text className="text-xs text-gray-300 dark:text-gray-600">
                        |
                      </Text>
                      <Text className="text-xs text-green-600 dark:text-green-400 font-medium">
                        {t('podcasts.completed')}
                      </Text>
                    </>
                  )}
                </View>

                {/* Progress bar */}
                {hasEpisodeProgress && !isComplete && (
                  <View className="mt-1.5 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-blue-400 dark:bg-blue-500 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </View>
                )}
              </View>

              {/* Action buttons */}
              <View className="flex-row items-center gap-1">
                {/* Show notes toggle */}
                {episode.description ? (
                  <Pressable
                    onPress={() =>
                      setExpandedId(isExpanded ? null : episode.id)
                    }
                    className="p-2 min-w-[44px] min-h-[44px] items-center justify-center"
                    accessibilityLabel={t('podcasts.showNotes')}
                    accessibilityRole="button"
                    hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                  >
                    <Text
                      className={`text-gray-400 dark:text-gray-500 text-sm ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    >
                      {'\u25BC'}
                    </Text>
                  </Pressable>
                ) : null}

                {/* Add to queue */}
                {!isCurrent && (
                  <Pressable
                    onPress={() => {
                      eventBus.publish(MFEvents.PODCAST_QUEUE_EPISODE, {
                        episode,
                        podcast: podcast ?? null,
                      });
                    }}
                    className="p-2 min-w-[44px] min-h-[44px] items-center justify-center"
                    accessibilityLabel={t('podcasts.addToQueue')}
                    accessibilityRole="button"
                    hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                  >
                    <Text className="text-gray-400 dark:text-gray-500 text-sm">
                      {'\u2795'}
                    </Text>
                  </Pressable>
                )}

                {/* Playing indicator */}
                {isCurrent && isCurrentlyPlaying && (
                  <View className="flex-row items-center gap-0.5 ml-1">
                    <View className="w-0.5 h-3 bg-blue-500 dark:bg-blue-400 rounded-full" />
                    <View className="w-0.5 h-4 bg-blue-500 dark:bg-blue-400 rounded-full" />
                    <View className="w-0.5 h-2 bg-blue-500 dark:bg-blue-400 rounded-full" />
                  </View>
                )}
              </View>
            </Pressable>

            {/* Expandable show notes */}
            {isExpanded && episode.description ? (
              <View className="px-3 pb-3 ml-[52px]">
                <View className="border-t border-gray-100 dark:border-gray-700 pt-2">
                  <Text className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {stripHtml(episode.description)}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        );
      })}

      {/* Show more */}
      {hasMore && (
        <Pressable
          onPress={handleShowMore}
          className="py-3 items-center rounded-lg min-h-[48px] justify-center"
          accessibilityLabel={t('podcasts.showMore')}
          accessibilityRole="button"
        >
          <Text className="text-sm font-medium text-blue-600 dark:text-blue-400">
            {t('podcasts.showMore')} ({episodes.length - visibleCount}{' '}
            {t('podcasts.episodes').toLowerCase()})
          </Text>
        </Pressable>
      )}
    </View>
  );
}
