import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import {
  SEARCH_PODCASTS,
  GET_TRENDING_PODCASTS,
  GET_PODCAST_EPISODES,
  StorageKeys,
  safeGetItem,
  safeSetItem,
  eventBus,
  AppEvents,
} from '@mycircle/shared';
import type { Podcast, Episode, PodcastSearchResult } from '@mycircle/shared';

// Re-export types for convenience
export type { Podcast, Episode, PodcastSearchResult };

// --- GraphQL Response Types ---

interface SearchPodcastsResponse {
  searchPodcasts: {
    feeds: Podcast[];
    count: number;
  };
}

interface TrendingPodcastsResponse {
  trendingPodcasts: {
    feeds: Podcast[];
    count: number;
  };
}

interface PodcastEpisodesResponse {
  podcastEpisodes: {
    items: Episode[];
    count: number;
  };
}

// --- FetchState type ---

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// --- Hook: usePodcastSearch ---

export function usePodcastSearch(query: string): FetchState<PodcastSearchResult> {
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    if (query.length < 2) {
      setDebouncedQuery('');
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  const { data, loading, error } = useQuery<SearchPodcastsResponse>(SEARCH_PODCASTS, {
    variables: { query: debouncedQuery },
    skip: debouncedQuery.length < 2,
    fetchPolicy: 'cache-first',
  });

  if (debouncedQuery.length < 2) {
    return { data: null, loading: false, error: null };
  }

  return {
    data: data?.searchPodcasts ?? null,
    loading,
    error: error?.message ?? null,
  };
}

// --- Hook: useTrendingPodcasts ---

export function useTrendingPodcasts() {
  const { data, loading, error, refetch } = useQuery<TrendingPodcastsResponse>(
    GET_TRENDING_PODCASTS,
    { fetchPolicy: 'cache-and-network' },
  );

  return {
    data: data?.trendingPodcasts?.feeds ?? null,
    loading,
    error: error?.message ?? null,
    refetch: () => {
      refetch();
    },
  };
}

// --- Hook: usePodcastEpisodes ---

export function usePodcastEpisodes(feedId: string | number | null) {
  const { data, loading, error } = useQuery<PodcastEpisodesResponse>(GET_PODCAST_EPISODES, {
    variables: { feedId: feedId! },
    skip: feedId === null,
    fetchPolicy: 'cache-and-network',
  });

  return {
    data: data?.podcastEpisodes?.items ?? null,
    loading,
    error: error?.message ?? null,
  };
}

// --- Subscription management ---

export function useSubscriptions() {
  const [subscribedIds, setSubscribedIds] = useState<Set<string>>(() => {
    try {
      const stored = safeGetItem(StorageKeys.PODCAST_SUBSCRIPTIONS);
      if (stored) {
        return new Set(JSON.parse(stored).map(String));
      }
    } catch {
      /* ignore */
    }
    return new Set();
  });

  const toggleSubscribe = useCallback((podcast: Podcast) => {
    setSubscribedIds((prev) => {
      const next = new Set(prev);
      const id = String(podcast.id);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        safeSetItem(StorageKeys.PODCAST_SUBSCRIPTIONS, JSON.stringify([...next]));
      } catch {
        /* ignore */
      }
      eventBus.publish(AppEvents.SUBSCRIPTIONS_CHANGED);
      return next;
    });
  }, []);

  return { subscribedIds, toggleSubscribe };
}

// --- Progress tracking ---

export interface EpisodeProgress {
  episodeId: string | number;
  currentTime: number;
}

export function loadSavedProgress(episodeId: string | number): number {
  try {
    const saved = safeGetItem(StorageKeys.PODCAST_PROGRESS);
    if (saved) {
      const data = JSON.parse(saved);
      if (String(data.episodeId) === String(episodeId) && typeof data.currentTime === 'number') {
        return data.currentTime;
      }
    }
  } catch {
    /* ignore */
  }
  return 0;
}

export function saveProgress(episodeId: string | number, currentTime: number): void {
  try {
    safeSetItem(
      StorageKeys.PODCAST_PROGRESS,
      JSON.stringify({ episodeId, currentTime }),
    );
  } catch {
    /* ignore */
  }
}

// --- Playback speed persistence ---

const PLAYBACK_SPEEDS = [0.5, 1, 1.25, 1.5, 2];

export function loadSavedSpeed(): number {
  try {
    const saved = safeGetItem(StorageKeys.PODCAST_SPEED);
    if (saved) {
      const speed = parseFloat(saved);
      if (PLAYBACK_SPEEDS.includes(speed)) return speed;
    }
  } catch {
    /* ignore */
  }
  return 1;
}

export function saveSpeed(speed: number): void {
  try {
    safeSetItem(StorageKeys.PODCAST_SPEED, String(speed));
  } catch {
    /* ignore */
  }
}
