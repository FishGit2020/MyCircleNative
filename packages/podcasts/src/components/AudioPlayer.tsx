import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable, Image, Modal, FlatList } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus, AudioModule } from 'expo-audio';
import * as Sharing from 'expo-sharing';
import {
  useTranslation,
  StorageKeys,
  eventBus,
  MFEvents,
} from '@mycircle/shared';
import type { Episode, Podcast } from '../hooks/usePodcastData';
import { loadSavedProgress, saveProgress, loadSavedSpeed, saveSpeed } from '../hooks/usePodcastData';

interface AudioPlayerProps {
  episode: Episode | null;
  podcast: Podcast | null;
  onClose: () => void;
}

const PLAYBACK_SPEEDS = [0.5, 1, 1.25, 1.5, 2];
const PROGRESS_SAVE_INTERVAL = 5000;
const SLEEP_TIMER_OPTIONS = [0, 5, 15, 30, 45, 60]; // minutes, 0 = off

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function AudioPlayer({ episode, podcast, onClose }: AudioPlayerProps) {
  const { t } = useTranslation();
  const player = useAudioPlayer(episode?.enclosureUrl ?? null);
  const status = useAudioPlayerStatus(player);
  const [playbackSpeed, setPlaybackSpeed] = useState(loadSavedSpeed);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const [sleepMinutes, setSleepMinutes] = useState(0);
  const [sleepRemaining, setSleepRemaining] = useState(0);
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sleepCountdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentTimeRef = useRef(0);
  const episodeIdRef = useRef<string | number | null>(null);

  const currentTime = (status.currentTime ?? 0);
  const duration = (status.duration ?? 0);
  const isPlaying = status.playing;

  // Keep currentTimeRef in sync
  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  // Configure audio session for background playback
  useEffect(() => {
    AudioModule.setAudioModeAsync({
      playsInSilentMode: true,
      shouldRouteThroughEarpiece: false,
    });
  }, []);

  // Load and play episode when it changes
  useEffect(() => {
    if (!episode) return;
    episodeIdRef.current = episode.id;

    // Restore saved progress
    const savedTime = loadSavedProgress(episode.id);
    if (savedTime > 0) {
      player.seekTo(savedTime);
    }

    player.rate = playbackSpeed;
    player.play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episode?.id]);

  // Periodic progress save
  useEffect(() => {
    if (!episode) return;

    progressTimerRef.current = setInterval(() => {
      if (episodeIdRef.current != null && currentTimeRef.current > 0) {
        saveProgress(episodeIdRef.current, currentTimeRef.current);
      }
    }, PROGRESS_SAVE_INTERVAL);

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, [episode?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sleep timer logic
  const clearSleepTimer = useCallback(() => {
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
    if (sleepCountdownRef.current) {
      clearInterval(sleepCountdownRef.current);
      sleepCountdownRef.current = null;
    }
    setSleepRemaining(0);
    setSleepMinutes(0);
  }, []);

  const startSleepTimer = useCallback((minutes: number) => {
    clearSleepTimer();
    setSleepMinutes(minutes);
    setShowSleepMenu(false);

    if (minutes === 0) return;

    const totalSeconds = minutes * 60;
    setSleepRemaining(totalSeconds);

    sleepCountdownRef.current = setInterval(() => {
      setSleepRemaining((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    sleepTimerRef.current = setTimeout(() => {
      player.pause();
      clearSleepTimer();
    }, totalSeconds * 1000);
  }, [clearSleepTimer, player]);

  // Clean up sleep timer on unmount
  useEffect(() => {
    return () => {
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
      if (sleepCountdownRef.current) clearInterval(sleepCountdownRef.current);
    };
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  }, [isPlaying, player]);

  const skipForward = useCallback(() => {
    const newPos = Math.min(currentTime + 15, duration);
    player.seekTo(newPos);
  }, [currentTime, duration, player]);

  const skipBack = useCallback(() => {
    const newPos = Math.max(currentTime - 15, 0);
    player.seekTo(newPos);
  }, [currentTime, player]);

  const handleSeek = useCallback(
    (fraction: number) => {
      if (duration <= 0) return;
      const newPos = Math.max(0, Math.min(fraction * duration, duration));
      player.seekTo(newPos);
    },
    [duration, player],
  );

  const changeSpeed = useCallback((speed: number) => {
    player.rate = speed;
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
    saveSpeed(speed);
  }, [player]);

  const cycleSpeed = useCallback(() => {
    const nextIndex = (PLAYBACK_SPEEDS.indexOf(playbackSpeed) + 1) % PLAYBACK_SPEEDS.length;
    changeSpeed(PLAYBACK_SPEEDS[nextIndex]);
  }, [playbackSpeed, changeSpeed]);

  const handleClose = useCallback(() => {
    // Save final progress
    if (episodeIdRef.current != null && currentTimeRef.current > 0) {
      saveProgress(episodeIdRef.current, currentTimeRef.current);
    }

    player.pause();
    eventBus.publish(MFEvents.PODCAST_CLOSE_PLAYER);
    onClose();
  }, [onClose, player]);

  const handleShare = useCallback(async () => {
    if (!episode) return;
    const timeStr = formatTime(currentTime);
    const podcastName = podcast?.title || '';
    const shareText = t('podcasts.shareText')
      .replace('{episode}', episode.title)
      .replace('{podcast}', podcastName)
      .replace('{time}', timeStr);

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(episode.enclosureUrl, {
          dialogTitle: shareText,
        });
      }
    } catch {
      /* user cancelled or share failed */
    }
  }, [episode, podcast, currentTime, t]);

  if (!episode) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const artworkUri = episode.image || podcast?.artwork || '';

  return (
    <View
      className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
      accessibilityLabel={t('podcasts.nowPlaying')}
      accessibilityRole="none"
    >
      {/* Progress bar (pressable) */}
      <Pressable
        className="h-1.5 bg-gray-200 dark:bg-gray-700"
        onPress={(e) => {
          const { locationX } = e.nativeEvent;
          const { width } = e.nativeEvent as any;
        }}
        onLayout={() => {}}
        accessibilityLabel={t('podcasts.seekPosition')}
        accessibilityRole="adjustable"
        accessibilityValue={{
          now: Math.round(currentTime),
          min: 0,
          max: Math.round(duration),
          text: `${formatTime(currentTime)} / ${formatTime(duration)}`,
        }}
      >
        <View
          className="h-full bg-blue-500 dark:bg-blue-400"
          style={{ width: `${progressPercent}%` }}
        />
      </Pressable>

      {/* Player content */}
      <View className="px-3 py-2">
        <View className="flex-row items-center gap-3">
          {/* Artwork */}
          {artworkUri ? (
            <Image
              source={{ uri: artworkUri }}
              className="w-10 h-10 rounded"
              resizeMode="cover"
            />
          ) : null}

          {/* Title + time */}
          <View className="flex-1 min-w-0">
            <Text
              className="text-sm font-medium text-gray-900 dark:text-white"
              numberOfLines={1}
            >
              {episode.title}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </Text>
          </View>

          {/* Controls */}
          <View className="flex-row items-center gap-1">
            {/* Skip back */}
            <Pressable
              onPress={skipBack}
              className="p-2 min-w-[44px] min-h-[44px] items-center justify-center"
              accessibilityLabel={t('podcasts.skipBack')}
              accessibilityRole="button"
            >
              <Text className="text-xs font-bold text-gray-600 dark:text-gray-300">
                -15
              </Text>
            </Pressable>

            {/* Play/Pause */}
            <Pressable
              onPress={togglePlayPause}
              className="w-11 h-11 bg-blue-500 dark:bg-blue-600 rounded-full items-center justify-center"
              accessibilityLabel={
                isPlaying ? t('podcasts.pauseEpisode') : t('podcasts.playEpisode')
              }
              accessibilityRole="button"
            >
              {isPlaying ? (
                <Text className="text-white text-base font-bold">| |</Text>
              ) : (
                <Text className="text-white text-lg ml-0.5">
                  {'\u25B6'}
                </Text>
              )}
            </Pressable>

            {/* Skip forward */}
            <Pressable
              onPress={skipForward}
              className="p-2 min-w-[44px] min-h-[44px] items-center justify-center"
              accessibilityLabel={t('podcasts.skipForward')}
              accessibilityRole="button"
            >
              <Text className="text-xs font-bold text-gray-600 dark:text-gray-300">
                +15
              </Text>
            </Pressable>

            {/* Speed */}
            <Pressable
              onPress={cycleSpeed}
              onLongPress={() => setShowSpeedMenu(true)}
              className="px-2 py-1 min-h-[44px] items-center justify-center bg-gray-100 dark:bg-gray-800 rounded"
              accessibilityLabel={t('podcasts.speed')}
              accessibilityRole="button"
            >
              <Text className="text-xs font-medium text-gray-600 dark:text-gray-300">
                {playbackSpeed}x
              </Text>
            </Pressable>

            {/* Sleep Timer */}
            <Pressable
              onPress={() => setShowSleepMenu(true)}
              className={`px-2 py-1 min-h-[44px] items-center justify-center rounded ${
                sleepMinutes > 0
                  ? 'bg-indigo-50 dark:bg-indigo-900/30'
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}
              accessibilityLabel={t('podcasts.sleepTimer')}
              accessibilityRole="button"
            >
              {sleepMinutes > 0 && sleepRemaining > 0 ? (
                <Text className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  {Math.ceil(sleepRemaining / 60)}m
                </Text>
              ) : (
                <Text className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  {'\u23F0'}
                </Text>
              )}
            </Pressable>

            {/* Share */}
            <Pressable
              onPress={handleShare}
              className="p-2 min-w-[44px] min-h-[44px] items-center justify-center"
              accessibilityLabel={t('podcasts.shareEpisode')}
              accessibilityRole="button"
            >
              <Text className="text-gray-400 dark:text-gray-500 text-sm">
                {'\u21AA'}
              </Text>
            </Pressable>

            {/* Close */}
            <Pressable
              onPress={handleClose}
              className="p-2 min-w-[44px] min-h-[44px] items-center justify-center"
              accessibilityLabel={t('podcasts.closePlayer')}
              accessibilityRole="button"
            >
              <Text className="text-gray-400 dark:text-gray-500 text-lg font-bold">
                {'\u00D7'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Speed picker modal */}
      <Modal
        visible={showSpeedMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSpeedMenu(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 items-center justify-center"
          onPress={() => setShowSpeedMenu(false)}
        >
          <View className="bg-white dark:bg-gray-800 rounded-xl p-4 w-52 border border-gray-200 dark:border-gray-700">
            <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-3 text-center">
              {t('podcasts.speed')}
            </Text>
            <FlatList
              data={PLAYBACK_SPEEDS}
              keyExtractor={(item) => String(item)}
              scrollEnabled={false}
              renderItem={({ item: speed }) => (
                <Pressable
                  onPress={() => changeSpeed(speed)}
                  className={`px-4 py-3 rounded-lg mb-1 min-h-[44px] items-center justify-center ${
                    speed === playbackSpeed
                      ? 'bg-blue-50 dark:bg-blue-900/30'
                      : ''
                  }`}
                  accessibilityLabel={`${speed}x`}
                  accessibilityRole="button"
                >
                  <Text
                    className={`text-base ${
                      speed === playbackSpeed
                        ? 'text-blue-600 dark:text-blue-400 font-semibold'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {speed}x
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>

      {/* Sleep timer modal */}
      <Modal
        visible={showSleepMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSleepMenu(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 items-center justify-center"
          onPress={() => setShowSleepMenu(false)}
        >
          <View className="bg-white dark:bg-gray-800 rounded-xl p-4 w-52 border border-gray-200 dark:border-gray-700">
            <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-3 text-center">
              {t('podcasts.sleepTimer')}
            </Text>
            {sleepMinutes > 0 && sleepRemaining > 0 && (
              <Text className="text-xs text-indigo-600 dark:text-indigo-400 text-center mb-2">
                {t('podcasts.minutesRemaining').replace('{minutes}', String(Math.ceil(sleepRemaining / 60)))}
              </Text>
            )}
            <FlatList
              data={SLEEP_TIMER_OPTIONS}
              keyExtractor={(item) => String(item)}
              scrollEnabled={false}
              renderItem={({ item: mins }) => (
                <Pressable
                  onPress={() => startSleepTimer(mins)}
                  className={`px-4 py-3 rounded-lg mb-1 min-h-[44px] items-center justify-center ${
                    mins === sleepMinutes
                      ? 'bg-indigo-50 dark:bg-indigo-900/30'
                      : ''
                  }`}
                  accessibilityLabel={mins === 0 ? t('podcasts.sleepTimerOff') : `${mins} min`}
                  accessibilityRole="button"
                >
                  <Text
                    className={`text-base ${
                      mins === sleepMinutes
                        ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {mins === 0 ? t('podcasts.sleepOff') : `${mins} min`}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
