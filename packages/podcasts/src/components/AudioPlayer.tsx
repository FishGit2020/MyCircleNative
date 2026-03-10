import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable, Image, Modal, FlatList } from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
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
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(loadSavedSpeed);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const [sleepMinutes, setSleepMinutes] = useState(0);
  const [sleepRemaining, setSleepRemaining] = useState(0); // seconds remaining
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sleepCountdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentTimeRef = useRef(0);
  const episodeIdRef = useRef<string | number | null>(null);

  // Keep currentTimeRef in sync
  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  // Configure audio session for background playback
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  // Load and play episode when it changes
  useEffect(() => {
    if (!episode) return;

    let isCancelled = false;

    async function loadSound() {
      // Unload previous sound
      if (soundRef.current) {
        try {
          await soundRef.current.unloadAsync();
        } catch {
          /* ignore */
        }
        soundRef.current = null;
      }

      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: episode!.enclosureUrl },
          {
            shouldPlay: false,
            rate: playbackSpeed,
            shouldCorrectPitch: true,
          },
        );

        if (isCancelled) {
          await sound.unloadAsync();
          return;
        }

        soundRef.current = sound;
        episodeIdRef.current = episode!.id;

        // Set playback status update handler
        sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
          if (!status.isLoaded) return;
          setCurrentTime(status.positionMillis / 1000);
          if (status.durationMillis) {
            setDuration(status.durationMillis / 1000);
          }
          setIsPlaying(status.isPlaying);
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        });

        // Restore saved progress
        const savedTime = loadSavedProgress(episode!.id);
        if (savedTime > 0) {
          await sound.setPositionAsync(savedTime * 1000);
        }

        // Start playing
        await sound.playAsync();
      } catch (err) {
        console.warn('Failed to load audio:', err);
      }
    }

    loadSound();

    return () => {
      isCancelled = true;
    };
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

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, []);

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

    // Countdown interval (update every second)
    sleepCountdownRef.current = setInterval(() => {
      setSleepRemaining((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    // Pause playback when timer expires
    sleepTimerRef.current = setTimeout(async () => {
      const sound = soundRef.current;
      if (sound) {
        try {
          await sound.pauseAsync();
        } catch {
          /* ignore */
        }
      }
      clearSleepTimer();
    }, totalSeconds * 1000);
  }, [clearSleepTimer]);

  // Clean up sleep timer on unmount
  useEffect(() => {
    return () => {
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
      if (sleepCountdownRef.current) clearInterval(sleepCountdownRef.current);
    };
  }, []);

  const togglePlayPause = useCallback(async () => {
    const sound = soundRef.current;
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch {
      /* ignore */
    }
  }, [isPlaying]);

  const skipForward = useCallback(async () => {
    const sound = soundRef.current;
    if (!sound) return;
    try {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        const newPos = Math.min(
          (status.positionMillis || 0) + 15000,
          status.durationMillis || 0,
        );
        await sound.setPositionAsync(newPos);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const skipBack = useCallback(async () => {
    const sound = soundRef.current;
    if (!sound) return;
    try {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        const newPos = Math.max((status.positionMillis || 0) - 15000, 0);
        await sound.setPositionAsync(newPos);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const handleSeek = useCallback(
    async (fraction: number) => {
      const sound = soundRef.current;
      if (!sound || duration <= 0) return;
      try {
        const newPos = Math.max(0, Math.min(fraction * duration * 1000, duration * 1000));
        await sound.setPositionAsync(newPos);
      } catch {
        /* ignore */
      }
    },
    [duration],
  );

  const changeSpeed = useCallback(async (speed: number) => {
    const sound = soundRef.current;
    if (sound) {
      try {
        await sound.setRateAsync(speed, true);
      } catch {
        /* ignore */
      }
    }
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
    saveSpeed(speed);
  }, []);

  const cycleSpeed = useCallback(() => {
    const nextIndex = (PLAYBACK_SPEEDS.indexOf(playbackSpeed) + 1) % PLAYBACK_SPEEDS.length;
    changeSpeed(PLAYBACK_SPEEDS[nextIndex]);
  }, [playbackSpeed, changeSpeed]);

  const handleClose = useCallback(async () => {
    // Save final progress
    if (episodeIdRef.current != null && currentTimeRef.current > 0) {
      saveProgress(episodeIdRef.current, currentTimeRef.current);
    }

    // Stop and unload
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {
        /* ignore */
      }
      soundRef.current = null;
    }

    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    eventBus.publish(MFEvents.PODCAST_CLOSE_PLAYER);
    onClose();
  }, [onClose]);

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
        // expo-sharing works with files; for text share we use the URL
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
          // Use layout width from the event target
          // We approximate with locationX / estimated width
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
