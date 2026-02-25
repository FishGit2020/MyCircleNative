import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import * as Clipboard from 'expo-clipboard';
import * as WebBrowser from 'expo-web-browser';
import { useTranslation, StorageKeys, safeGetItem, safeSetItem } from '@mycircle/shared';
import type { WorshipSong } from '../types';
import { transposeContent, transposeChord } from '../utils/transpose';
import ChordLine from './ChordLine';
import Metronome from './Metronome';
import CapoCalculator from './CapoCalculator';

const ALL_KEYS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const SCROLL_SPEEDS = [20, 30, 40, 50, 70, 100]; // ms per 1px - lower = faster
const DEFAULT_SCROLL_SPEED = 50;

function getKeyName(originalKey: string, semitones: number): string {
  if (semitones === 0) return originalKey;
  return transposeChord(originalKey, semitones);
}

function semitonesToKey(originalKey: string, targetKey: string): number {
  const normalize: Record<string, string> = {
    Db: 'C#',
    'D#': 'Eb',
    Gb: 'F#',
    'G#': 'Ab',
    'A#': 'Bb',
  };
  const orig = normalize[originalKey] ?? originalKey;
  const tgt = normalize[targetKey] ?? targetKey;
  const fromIdx = ALL_KEYS.indexOf(orig);
  const toIdx = ALL_KEYS.indexOf(tgt);
  if (fromIdx === -1 || toIdx === -1) return 0;
  return ((toIdx - fromIdx) + 12) % 12;
}

function loadScrollSpeed(): number {
  try {
    const stored = safeGetItem(StorageKeys.WORSHIP_SCROLL_SPEED);
    if (stored) {
      const n = parseInt(stored, 10);
      if (SCROLL_SPEEDS.includes(n)) return n;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_SCROLL_SPEED;
}

function saveScrollSpeed(speed: number) {
  try {
    safeSetItem(StorageKeys.WORSHIP_SCROLL_SPEED, String(speed));
  } catch {
    /* ignore */
  }
}

interface SongViewerProps {
  song: WorshipSong;
  isAuthenticated: boolean;
  onEdit: () => void;
  onBack: () => void;
  onDelete?: () => Promise<void>;
}

export default function SongViewer({
  song,
  isAuthenticated,
  onEdit,
  onBack,
  onDelete,
}: SongViewerProps) {
  const { t } = useTranslation();
  const [semitones, setSemitones] = useState(0);
  const [capoFret, setCapoFret] = useState(0);
  const [notesOpen, setNotesOpen] = useState(false);
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(loadScrollSpeed);
  const [copied, setCopied] = useState(false);
  const [showKeyPicker, setShowKeyPicker] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollOffsetRef = useRef(0);

  const isChordPro = song.format === 'chordpro';
  // soundingKey = the actual pitch the audience hears (original + transpose)
  const soundingKey = isChordPro
    ? getKeyName(song.originalKey, semitones)
    : song.originalKey;
  // When capo is active, display chord shapes offset back by capoFret
  const transposedContent = isChordPro
    ? transposeContent(song.content, semitones - capoFret)
    : song.content;
  // shapeKey = the chord shapes the guitarist plays
  const shapeKey =
    capoFret > 0 && isChordPro ? getKeyName(soundingKey, -capoFret) : null;
  const currentKey = soundingKey;

  // Auto-scroll with adjustable speed
  useEffect(() => {
    if (autoScroll) {
      scrollIntervalRef.current = setInterval(() => {
        scrollOffsetRef.current += 1;
        scrollViewRef.current?.scrollTo({
          y: scrollOffsetRef.current,
          animated: false,
        });
      }, scrollSpeed);
    } else if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, [autoScroll, scrollSpeed]);

  const handleCopyLyrics = useCallback(async () => {
    try {
      // Strip ChordPro bracket notation for clean lyrics
      const clean = isChordPro
        ? transposedContent
            .replace(/\[([^\]]+)\]/g, '')
            .replace(/\n{3,}/g, '\n\n')
        : song.content;
      await Clipboard.setStringAsync(
        `${song.title}\n${song.artist ? `${song.artist}\n` : ''}\n${clean}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [song, transposedContent, isChordPro]);

  const handleTargetKeyChange = useCallback(
    (targetKey: string) => {
      setSemitones(semitonesToKey(song.originalKey, targetKey));
      setShowKeyPicker(false);
    },
    [song.originalKey],
  );

  const handleScrollSpeedChange = useCallback((speed: number) => {
    setScrollSpeed(speed);
    saveScrollSpeed(speed);
  }, []);

  const handleYouTube = useCallback(async () => {
    if (song.youtubeUrl) {
      await WebBrowser.openBrowserAsync(song.youtubeUrl);
    }
  }, [song.youtubeUrl]);

  const handleScroll = useCallback(
    (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
    },
    [],
  );

  return (
    <ScrollView
      ref={scrollViewRef}
      className="flex-1 bg-white dark:bg-gray-900"
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      <View className="px-4 py-4">
        {/* Top bar */}
        <View className="flex-row items-center gap-3 mb-4">
          <TouchableOpacity
            onPress={onBack}
            className="min-h-[44px] min-w-[44px] items-center justify-center"
            accessibilityLabel={t('worship.back')}
            accessibilityRole="button"
          >
            <Text className="text-gray-500 dark:text-gray-400 text-xl">{'\u2190'}</Text>
          </TouchableOpacity>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {t('worship.back')}
          </Text>
        </View>

        {/* Song header */}
        <View className="mb-6">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                {song.title}
              </Text>
              {song.artist ? (
                <Text className="text-gray-500 dark:text-gray-400 mt-1">
                  {song.artist}
                </Text>
              ) : null}
            </View>
            {isAuthenticated && (
              <TouchableOpacity
                onPress={onEdit}
                className="flex-row items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg min-h-[44px]"
                accessibilityLabel={t('worship.editSong')}
                accessibilityRole="button"
              >
                <Text className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                  {'\u270E'} {t('worship.editSong')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Meta badges */}
          <View className="flex-row flex-wrap items-center gap-2 mt-3">
            <View className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30">
              <Text className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                {t('worship.currentKey')}: {currentKey}
              </Text>
            </View>
            {shapeKey && (
              <View className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30">
                <Text className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  {t('worship.capoFret').replace('{n}', String(capoFret))} {'\u2192'}{' '}
                  {shapeKey}
                </Text>
              </View>
            )}
            <View
              className={`px-2 py-0.5 rounded-full ${
                isChordPro
                  ? 'bg-purple-50 dark:bg-purple-900/30'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  isChordPro
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {isChordPro
                  ? t('worship.formatChordpro')
                  : t('worship.formatText')}
              </Text>
            </View>
            {song.tags?.map((tag) => (
              <View
                key={tag}
                className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700"
              >
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Transpose controls */}
        <View className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          {isChordPro ? (
            <View className="gap-3">
              <View className="flex-row items-center gap-2 flex-wrap">
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  {t('worship.transpose')}:
                </Text>
                <TouchableOpacity
                  onPress={() => setSemitones((s) => s - 1)}
                  className="w-10 h-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 min-h-[44px] min-w-[44px]"
                  accessibilityLabel={t('worship.semitoneDown')}
                  accessibilityRole="button"
                >
                  <Text className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    -
                  </Text>
                </TouchableOpacity>
                <Text className="text-sm font-mono w-8 text-center text-gray-700 dark:text-gray-300">
                  {semitones > 0 ? `+${semitones}` : semitones}
                </Text>
                <TouchableOpacity
                  onPress={() => setSemitones((s) => s + 1)}
                  className="w-10 h-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 min-h-[44px] min-w-[44px]"
                  accessibilityLabel={t('worship.semitoneUp')}
                  accessibilityRole="button"
                >
                  <Text className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    +
                  </Text>
                </TouchableOpacity>
                {semitones !== 0 && (
                  <TouchableOpacity
                    onPress={() => setSemitones(0)}
                    className="ml-1 min-h-[44px] justify-center"
                    accessibilityLabel={t('worship.resetKey')}
                    accessibilityRole="button"
                  >
                    <Text className="text-xs text-blue-600 dark:text-blue-400">
                      {t('worship.resetKey')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Direct key picker */}
              <View className="flex-row items-center gap-1.5">
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {t('worship.targetKey')}:
                </Text>
                <TouchableOpacity
                  onPress={() => setShowKeyPicker(!showKeyPicker)}
                  className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 min-h-[44px] justify-center"
                  accessibilityLabel={`${t('worship.targetKey')}: ${currentKey}`}
                  accessibilityRole="button"
                >
                  <Text className="text-xs text-gray-700 dark:text-gray-300">
                    {currentKey}
                  </Text>
                </TouchableOpacity>
              </View>

              {showKeyPicker && (
                <View className="flex-row flex-wrap gap-1 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  {ALL_KEYS.map((k) => (
                    <TouchableOpacity
                      key={k}
                      onPress={() => handleTargetKeyChange(k)}
                      className={`px-2 py-1 rounded min-h-[36px] min-w-[36px] items-center justify-center ${
                        currentKey === k
                          ? 'bg-blue-600 dark:bg-blue-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                      accessibilityLabel={k}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: currentKey === k }}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          currentKey === k
                            ? 'text-white'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {k}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Capo calculator */}
              <CapoCalculator
                soundingKey={soundingKey}
                capoFret={capoFret}
                onCapoChange={setCapoFret}
              />
            </View>
          ) : (
            <Text className="text-xs text-gray-400 dark:text-gray-500 italic">
              {t('worship.noTransposeText')}
            </Text>
          )}
        </View>

        {/* Action buttons row */}
        <View className="flex-row flex-wrap items-center gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          {/* Copy lyrics */}
          <TouchableOpacity
            onPress={handleCopyLyrics}
            className="flex-row items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 min-h-[44px]"
            accessibilityLabel={t('worship.copyLyrics')}
            accessibilityRole="button"
          >
            <Text className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              {copied ? `\u2713 ${t('worship.copied')}` : t('worship.copyLyrics')}
            </Text>
          </TouchableOpacity>

          {/* Auto-scroll toggle */}
          <TouchableOpacity
            onPress={() => setAutoScroll(!autoScroll)}
            className={`flex-row items-center gap-1.5 px-3 py-2 rounded-lg min-h-[44px] ${
              autoScroll
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-gray-100 dark:bg-gray-700'
            }`}
            accessibilityLabel={t('worship.autoScroll')}
            accessibilityRole="button"
            accessibilityState={{ selected: autoScroll }}
          >
            <Text
              className={`text-xs font-semibold ${
                autoScroll
                  ? 'text-green-700 dark:text-green-400'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {'\u2193'} {t('worship.autoScroll')}
            </Text>
          </TouchableOpacity>

          {/* Scroll speed slider (visible when auto-scroll is active) */}
          {autoScroll && (
            <View className="flex-row items-center gap-1.5">
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {t('worship.scrollSpeed')}:
              </Text>
              <Slider
                style={{ width: 80, height: 44 }}
                minimumValue={0}
                maximumValue={SCROLL_SPEEDS.length - 1}
                step={1}
                value={SCROLL_SPEEDS.indexOf(scrollSpeed)}
                onValueChange={(val: number) =>
                  handleScrollSpeedChange(SCROLL_SPEEDS[Math.round(val)])
                }
                minimumTrackTintColor="#22C55E"
                maximumTrackTintColor="#D1D5DB"
                accessibilityLabel={t('worship.scrollSpeed')}
              />
            </View>
          )}

          {/* YouTube link */}
          {song.youtubeUrl ? (
            <TouchableOpacity
              onPress={handleYouTube}
              className="flex-row items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 min-h-[44px]"
              accessibilityLabel={t('worship.watchOnYoutube')}
              accessibilityRole="button"
            >
              <Text className="text-xs font-semibold text-red-600 dark:text-red-400">
                {'\u25B6'} {t('worship.watchOnYoutube')}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Metronome */}
        <View className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <Metronome initialBpm={song.bpm} />
        </View>

        {/* Song content */}
        <View className="mb-8">
          {isChordPro ? (
            <View className="gap-1">
              {transposedContent.split('\n').map((line, i) => (
                <ChordLine key={i} line={line} />
              ))}
            </View>
          ) : (
            <Text className="font-mono text-sm leading-relaxed text-gray-800 dark:text-gray-200">
              {song.content}
            </Text>
          )}
        </View>

        {/* Notes section (collapsible) */}
        {song.notes ? (
          <View className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <TouchableOpacity
              onPress={() => setNotesOpen(!notesOpen)}
              className="flex-row items-center gap-2 min-h-[44px]"
              accessibilityLabel={t('worship.notes')}
              accessibilityRole="button"
              accessibilityState={{ expanded: notesOpen }}
            >
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                {notesOpen ? '\u25BC' : '\u25B6'}
              </Text>
              <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                {t('worship.notes')}
              </Text>
            </TouchableOpacity>
            {notesOpen && (
              <View className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800/30">
                <Text className="text-sm text-gray-700 dark:text-gray-300">
                  {song.notes}
                </Text>
              </View>
            )}
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}
