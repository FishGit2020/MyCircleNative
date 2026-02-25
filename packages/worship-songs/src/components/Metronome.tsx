import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useTranslation } from '@mycircle/shared';

interface MetronomeProps {
  initialBpm?: number;
}

const MIN_BPM = 30;
const MAX_BPM = 240;
const TAP_BUFFER_SIZE = 4;
const TAP_TIMEOUT = 2000;

export default function Metronome({ initialBpm = 120 }: MetronomeProps) {
  const { t } = useTranslation();
  const [bpm, setBpm] = useState(Math.max(MIN_BPM, Math.min(MAX_BPM, initialBpm)));
  const [playing, setPlaying] = useState(false);
  const [beat, setBeat] = useState(false);

  const soundRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tapTimesRef = useRef<number[]>([]);

  // Preload click sound
  useEffect(() => {
    let mounted = true;

    async function loadSound() {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/click.wav'),
          { shouldPlay: false },
        );
        if (mounted) {
          soundRef.current = sound;
        } else {
          sound.unloadAsync();
        }
      } catch {
        // Sound asset not available — haptic-only fallback
      }
    }

    loadSound();

    return () => {
      mounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
      soundRef.current?.unloadAsync();
    };
  }, []);

  const playClick = useCallback(async () => {
    // Haptic feedback
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      /* ignore */
    }

    // Audio click
    try {
      if (soundRef.current) {
        await soundRef.current.setPositionAsync(0);
        await soundRef.current.playAsync();
      }
    } catch {
      /* ignore */
    }

    // Flash beat indicator
    setBeat(true);
    setTimeout(() => setBeat(false), 80);
  }, []);

  const startMetronome = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const interval = 60000 / bpm;
    playClick();
    timerRef.current = setInterval(playClick, interval);
    setPlaying(true);
  }, [bpm, playClick]);

  const stopMetronome = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPlaying(false);
    setBeat(false);
  }, []);

  const toggleMetronome = useCallback(() => {
    if (playing) {
      stopMetronome();
    } else {
      startMetronome();
    }
  }, [playing, startMetronome, stopMetronome]);

  // Restart timer when BPM changes while playing
  useEffect(() => {
    if (playing) {
      if (timerRef.current) clearInterval(timerRef.current);
      const interval = 60000 / bpm;
      timerRef.current = setInterval(playClick, interval);
    }
  }, [bpm, playing, playClick]);

  const handleBpmChange = useCallback((newBpm: number) => {
    setBpm(Math.max(MIN_BPM, Math.min(MAX_BPM, newBpm)));
  }, []);

  const handleTapTempo = useCallback(() => {
    const now = Date.now();
    const taps = tapTimesRef.current;

    // Reset if too much time has passed
    if (taps.length > 0 && now - taps[taps.length - 1] > TAP_TIMEOUT) {
      tapTimesRef.current = [now];
      return;
    }

    taps.push(now);
    if (taps.length > TAP_BUFFER_SIZE) taps.shift();

    if (taps.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < taps.length; i++) {
        intervals.push(taps[i] - taps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const newBpm = Math.round(60000 / avgInterval);
      handleBpmChange(newBpm);
    }
  }, [handleBpmChange]);

  return (
    <View
      className="flex-row items-center flex-wrap gap-3"
      accessibilityRole="summary"
      accessibilityLabel={t('worship.metronome')}
    >
      {/* Beat indicator */}
      <View
        className={`w-3 h-3 rounded-full ${
          beat
            ? 'bg-green-500 dark:bg-green-400'
            : 'bg-gray-300 dark:bg-gray-600'
        }`}
        accessibilityElementsHidden
      />

      {/* Play/Stop toggle */}
      <TouchableOpacity
        onPress={toggleMetronome}
        className={`flex-row items-center gap-1.5 px-3 py-2 rounded-lg min-h-[44px] ${
          playing
            ? 'bg-green-100 dark:bg-green-900/30'
            : 'bg-gray-100 dark:bg-gray-700'
        }`}
        accessibilityLabel={playing ? t('worship.metronomeStop') : t('worship.metronomeStart')}
        accessibilityRole="button"
      >
        <Text
          className={`text-xs font-semibold ${
            playing
              ? 'text-green-700 dark:text-green-400'
              : 'text-gray-600 dark:text-gray-300'
          }`}
        >
          {playing ? '\u23F8' : '\u25B6'} {t('worship.metronome')}
        </Text>
      </TouchableOpacity>

      {/* BPM control */}
      <View className="flex-row items-center gap-1.5">
        <TouchableOpacity
          onPress={() => handleBpmChange(bpm - 1)}
          className="w-8 h-8 items-center justify-center rounded bg-gray-100 dark:bg-gray-700 min-h-[44px] min-w-[44px]"
          accessibilityLabel={`${t('worship.bpm')} -1`}
          accessibilityRole="button"
        >
          <Text className="text-sm font-bold text-gray-700 dark:text-gray-300">-</Text>
        </TouchableOpacity>
        <TextInput
          value={String(bpm)}
          onChangeText={(text) => {
            const parsed = parseInt(text, 10);
            if (!isNaN(parsed)) handleBpmChange(parsed);
          }}
          keyboardType="number-pad"
          className="w-14 text-center text-xs font-mono px-1 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          accessibilityLabel={t('worship.bpm')}
        />
        <TouchableOpacity
          onPress={() => handleBpmChange(bpm + 1)}
          className="w-8 h-8 items-center justify-center rounded bg-gray-100 dark:bg-gray-700 min-h-[44px] min-w-[44px]"
          accessibilityLabel={`${t('worship.bpm')} +1`}
          accessibilityRole="button"
        >
          <Text className="text-sm font-bold text-gray-700 dark:text-gray-300">+</Text>
        </TouchableOpacity>
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          {t('worship.bpm')}
        </Text>
      </View>

      {/* Tap tempo */}
      <TouchableOpacity
        onPress={handleTapTempo}
        className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 min-h-[44px] justify-center"
        accessibilityLabel={t('worship.tapTempo')}
        accessibilityRole="button"
      >
        <Text className="text-xs font-semibold text-gray-600 dark:text-gray-300">
          {t('worship.tapTempo')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
