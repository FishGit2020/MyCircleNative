import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Pressable, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  eventBus,
  MFEvents,
  StorageKeys,
  safeGetJSON,
  safeSetItem,
  useTranslation,
} from '@mycircle/shared';
import type { PodcastPlayEpisodeEvent } from '@mycircle/shared';

interface PlaybackState {
  episodeId: string;
  title: string;
  podcastTitle: string;
  audioUrl: string;
  artworkUrl?: string;
  position: number;
  duration: number;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const SLEEP_OPTIONS = [0, 5, 10, 15, 30, 45, 60]; // minutes, 0 = off

export default function GlobalAudioPlayer() {
  const { t } = useTranslation();
  const [state, setState] = useState<PlaybackState | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [sleepTimer, setSleepTimer] = useState(0);
  const [queue, setQueue] = useState<PlaybackState[]>([]);
  const expandAnim = useRef(new Animated.Value(0)).current;
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Listen for play episode events
  useEffect(() => {
    const unsub = eventBus.subscribe(
      MFEvents.PODCAST_PLAY_EPISODE,
      (data: PodcastPlayEpisodeEvent) => {
        if (!data?.episode) return;
        const ep = data.episode;
        const podcast = data.podcast;

        // Check for saved progress
        const savedProgress = safeGetJSON<Record<string, number>>(StorageKeys.PODCAST_PROGRESS, {});
        const savedPosition = savedProgress[String(ep.id)] ?? 0;

        setState({
          episodeId: String(ep.id),
          title: ep.title,
          podcastTitle: podcast?.title ?? '',
          audioUrl: ep.enclosureUrl,
          artworkUrl: ep.image || podcast?.artwork,
          position: savedPosition,
          duration: ep.duration ?? 0,
        });
        setIsPlaying(true);
        setExpanded(false);
      },
    );

    const unsubClose = eventBus.subscribe(MFEvents.PODCAST_CLOSE_PLAYER, () => {
      handleClose();
    });

    const unsubQueue = eventBus.subscribe(
      MFEvents.PODCAST_QUEUE_EPISODE,
      (data: PodcastPlayEpisodeEvent) => {
        if (!data?.episode) return;
        const ep = data.episode;
        const podcast = data.podcast;
        setQueue((prev) => [
          ...prev,
          {
            episodeId: String(ep.id),
            title: ep.title,
            podcastTitle: podcast?.title ?? '',
            audioUrl: ep.enclosureUrl,
            artworkUrl: ep.image || podcast?.artwork,
            position: 0,
            duration: ep.duration ?? 0,
          },
        ]);
      },
    );

    // Load saved speed
    const savedSpeed = safeGetJSON<number | null>(StorageKeys.PODCAST_SPEED, null);
    if (savedSpeed) setSpeed(savedSpeed);

    return () => {
      unsub();
      unsubClose();
      unsubQueue();
    };
  }, []);

  // Simulate playback progress
  useEffect(() => {
    if (isPlaying && state) {
      progressInterval.current = setInterval(() => {
        setState((prev) => {
          if (!prev) return prev;
          const newPosition = prev.position + speed;
          if (newPosition >= prev.duration && prev.duration > 0) {
            // Episode ended — play next in queue
            playNextInQueue();
            return prev;
          }
          return { ...prev, position: newPosition };
        });
      }, 1000);
    } else if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isPlaying, state, speed]);

  // Save progress every 5 seconds
  useEffect(() => {
    if (!state || !isPlaying) return;
    const saveInterval = setInterval(() => {
      if (state) {
        const progress = safeGetJSON<Record<string, number>>(StorageKeys.PODCAST_PROGRESS, {});
        progress[state.episodeId] = state.position;
        safeSetItem(StorageKeys.PODCAST_PROGRESS, JSON.stringify(progress));
      }
    }, 5000);
    return () => clearInterval(saveInterval);
  }, [state, isPlaying]);

  // Sleep timer
  useEffect(() => {
    if (sleepTimer <= 0) return;
    const timeout = setTimeout(() => {
      setIsPlaying(false);
      setSleepTimer(0);
    }, sleepTimer * 60 * 1000);
    return () => clearTimeout(timeout);
  }, [sleepTimer]);

  // Expand/collapse animation
  useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [expanded]);

  const playNextInQueue = useCallback(() => {
    if (queue.length > 0) {
      const [next, ...rest] = queue;
      setState(next);
      setQueue(rest);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [queue]);

  const handleClose = useCallback(() => {
    // Save final progress
    if (state) {
      const progress = safeGetJSON<Record<string, number>>(StorageKeys.PODCAST_PROGRESS, {});
      progress[state.episodeId] = state.position;
      safeSetItem(StorageKeys.PODCAST_PROGRESS, JSON.stringify(progress));
    }
    setState(null);
    setIsPlaying(false);
    setExpanded(false);
    setQueue([]);
  }, [state]);

  const handleSkip = useCallback((seconds: number) => {
    setState((prev) => {
      if (!prev) return prev;
      const newPos = Math.max(0, Math.min(prev.position + seconds, prev.duration));
      return { ...prev, position: newPos };
    });
  }, []);

  const handleSpeedChange = useCallback(() => {
    const idx = SPEEDS.indexOf(speed);
    const newSpeed = SPEEDS[(idx + 1) % SPEEDS.length];
    setSpeed(newSpeed);
    safeSetItem(StorageKeys.PODCAST_SPEED, JSON.stringify(newSpeed));
  }, [speed]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!state) return null;

  const progress = state.duration > 0 ? (state.position / state.duration) * 100 : 0;
  const screenHeight = Dimensions.get('window').height;

  const containerHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [72, screenHeight * 0.55],
  });

  return (
    <Animated.View
      className="absolute left-0 right-0 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700"
      style={{ bottom: 80, height: containerHeight, zIndex: 50 }}
    >
      {/* Progress bar */}
      <View className="h-0.5 bg-gray-200 dark:bg-gray-700">
        <View
          className="h-0.5 bg-blue-500"
          style={{ width: `${progress}%` }}
        />
      </View>

      {/* Mini Player (always visible) */}
      <Pressable
        className="flex-row items-center px-4 py-3"
        onPress={() => setExpanded(!expanded)}
        accessibilityRole="button"
        accessibilityLabel={state.title}
      >
        {/* Artwork placeholder */}
        <View className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 items-center justify-center mr-3">
          <Ionicons name="musical-notes" size={20} color="#6b7280" />
        </View>

        {/* Title */}
        <View className="flex-1 mr-2">
          <Text className="text-sm font-semibold text-gray-900 dark:text-white" numberOfLines={1}>
            {state.title}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
            {state.podcastTitle}
          </Text>
        </View>

        {/* Controls */}
        <Pressable
          className="w-11 h-11 items-center justify-center"
          onPress={() => setIsPlaying(!isPlaying)}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? t('podcasts.pauseEpisode') : t('podcasts.playEpisode')}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={24}
            color="#3b82f6"
          />
        </Pressable>
        <Pressable
          className="w-11 h-11 items-center justify-center"
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel={t('podcasts.closePlayer')}
        >
          <Ionicons name="close" size={22} color="#6b7280" />
        </Pressable>
      </Pressable>

      {/* Expanded Player */}
      {expanded && (
        <View className="px-4 pb-4 flex-1">
          {/* Seek bar */}
          <View className="flex-row items-center mb-4">
            <Text className="text-xs text-gray-500 dark:text-gray-400 w-10">
              {formatTime(state.position)}
            </Text>
            <View className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-2">
              <View
                className="h-1 bg-blue-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </View>
            <Text className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">
              {formatTime(state.duration)}
            </Text>
          </View>

          {/* Main controls */}
          <View className="flex-row items-center justify-center gap-6 mb-4">
            <Pressable
              className="w-11 h-11 items-center justify-center"
              onPress={() => handleSkip(-15)}
              accessibilityRole="button"
              accessibilityLabel={t('podcasts.skipBack')}
            >
              <Ionicons name="play-back" size={24} color="#6b7280" />
            </Pressable>
            <Pressable
              className="w-14 h-14 rounded-full bg-blue-500 dark:bg-blue-600 items-center justify-center"
              onPress={() => setIsPlaying(!isPlaying)}
              accessibilityRole="button"
              accessibilityLabel={isPlaying ? t('podcasts.pauseEpisode') : t('podcasts.playEpisode')}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={28}
                color="white"
              />
            </Pressable>
            <Pressable
              className="w-11 h-11 items-center justify-center"
              onPress={() => handleSkip(15)}
              accessibilityRole="button"
              accessibilityLabel={t('podcasts.skipForward')}
            >
              <Ionicons name="play-forward" size={24} color="#6b7280" />
            </Pressable>
          </View>

          {/* Speed & Sleep */}
          <View className="flex-row items-center justify-center gap-4 mb-4">
            <Pressable
              className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700"
              onPress={handleSpeedChange}
              accessibilityRole="button"
              accessibilityLabel={t('podcasts.speed')}
            >
              <Text className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {speed}x
              </Text>
            </Pressable>
            <Pressable
              className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700"
              onPress={() => {
                const idx = SLEEP_OPTIONS.indexOf(sleepTimer);
                setSleepTimer(SLEEP_OPTIONS[(idx + 1) % SLEEP_OPTIONS.length]);
              }}
              accessibilityRole="button"
              accessibilityLabel={t('podcasts.sleepTimer')}
            >
              <Text className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {sleepTimer > 0 ? `${sleepTimer}m` : t('podcasts.sleepOff')}
              </Text>
            </Pressable>
          </View>

          {/* Queue */}
          {queue.length > 0 && (
            <View>
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('podcasts.queue')} ({queue.length})
              </Text>
              {queue.slice(0, 3).map((item, i) => (
                <View key={item.episodeId} className="flex-row items-center py-1.5">
                  <Text className="text-xs text-gray-500 dark:text-gray-400 w-5">{i + 1}</Text>
                  <Text className="text-sm text-gray-900 dark:text-white flex-1" numberOfLines={1}>
                    {item.title}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </Animated.View>
  );
}
