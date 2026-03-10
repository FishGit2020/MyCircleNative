import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLazyQuery } from '@apollo/client';
import * as Clipboard from 'expo-clipboard';
import {
  useTranslation,
  StorageKeys,
  safeGetItem,
  safeSetItem,
  safeGetJSON,
  GET_BIBLE_PASSAGE,
} from '@mycircle/shared';
import TranslationPicker from './TranslationPicker';

// ── Types ──

interface BibleVerseItem {
  number: number;
  text: string;
}

interface BiblePassage {
  text: string;
  reference: string;
  translation: string | null;
  verseCount: number;
  copyright: string | null;
  verses: BibleVerseItem[];
}

interface PassageResponse {
  biblePassage: BiblePassage;
}

interface Bookmark {
  book: string;
  chapter: number;
  label: string;
  timestamp: number;
}

// ── Constants ──

const DEFAULT_VERSION_ID = '111';
const FONT_SIZES = [14, 16, 18, 20, 22];
const DEFAULT_FONT_SIZE = 16;

// ── Props ──

interface PassageViewProps {
  bookName: string;
  chapterCount: number;
  chapter: number;
  onBack: () => void;
  onNavigateChapter: (chapter: number) => void;
}

export default function PassageView({
  bookName,
  chapterCount,
  chapter,
  onBack,
  onNavigateChapter,
}: PassageViewProps) {
  const { t } = useTranslation();

  // ── State ──
  const [fontSize, setFontSize] = useState(() => {
    const stored = safeGetItem(StorageKeys.BIBLE_FONT_SIZE);
    if (stored) {
      const n = parseInt(stored, 10);
      if (FONT_SIZES.includes(n)) return n;
    }
    return DEFAULT_FONT_SIZE;
  });

  const [bibleVersion, setBibleVersion] = useState(() => {
    return safeGetItem(StorageKeys.BIBLE_TRANSLATION) ?? DEFAULT_VERSION_ID;
  });

  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [showTranslationPicker, setShowTranslationPicker] = useState(false);

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() =>
    safeGetJSON<Bookmark[]>(StorageKeys.BIBLE_BOOKMARKS, []),
  );

  const isBookmarked = bookmarks.some(
    (b) => b.book === bookName && b.chapter === chapter,
  );

  // ── GraphQL ──
  const [fetchPassage, { data, loading, error }] =
    useLazyQuery<PassageResponse>(GET_BIBLE_PASSAGE, {
      fetchPolicy: 'cache-first',
    });

  const passage = data?.biblePassage ?? null;

  // Load passage when chapter/book/version changes
  useEffect(() => {
    fetchPassage({
      variables: {
        reference: `${bookName} ${chapter}`,
        translation: bibleVersion,
      },
    });
  }, [bookName, chapter, bibleVersion, fetchPassage]);

  // Save last read
  useEffect(() => {
    safeSetItem(
      StorageKeys.BIBLE_LAST_READ,
      JSON.stringify({ book: bookName, chapter, chapters: chapterCount }),
    );
  }, [bookName, chapter, chapterCount]);

  // ── Handlers ──

  const changeFontSize = useCallback((delta: number) => {
    setFontSize((prev) => {
      const idx = FONT_SIZES.indexOf(prev);
      const next =
        FONT_SIZES[Math.max(0, Math.min(FONT_SIZES.length - 1, idx + delta))];
      safeSetItem(StorageKeys.BIBLE_FONT_SIZE, String(next));
      return next;
    });
  }, []);

  const handleCopy = useCallback(async () => {
    if (!passage) return;
    try {
      const text =
        passage.verses && passage.verses.length > 0
          ? passage.verses.map((v) => `${v.number} ${v.text}`).join('\n')
          : passage.text;
      await Clipboard.setStringAsync(`${text}\n\n\u2014 ${passage.reference}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [passage]);

  const handleShare = useCallback(async () => {
    if (!passage) return;
    try {
      const text =
        passage.verses && passage.verses.length > 0
          ? passage.verses.map((v) => `${v.number} ${v.text}`).join('\n')
          : passage.text;
      await Clipboard.setStringAsync(`${text}\n\n\u2014 ${passage.reference}`);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      /* ignore */
    }
  }, [passage]);

  const toggleBookmark = useCallback(() => {
    setBookmarks((prev) => {
      const exists = prev.findIndex(
        (b) => b.book === bookName && b.chapter === chapter,
      );
      let next: Bookmark[];
      if (exists >= 0) {
        next = prev.filter((_, i) => i !== exists);
      } else {
        next = [
          ...prev,
          {
            book: bookName,
            chapter,
            label: `${bookName} ${chapter}`,
            timestamp: Date.now(),
          },
        ];
      }
      safeSetItem(StorageKeys.BIBLE_BOOKMARKS, JSON.stringify(next));
      return next;
    });
  }, [bookName, chapter]);

  const handleVersionChange = useCallback(
    (versionId: string) => {
      setBibleVersion(versionId);
      safeSetItem(StorageKeys.BIBLE_TRANSLATION, versionId);
      fetchPassage({
        variables: {
          reference: `${bookName} ${chapter}`,
          translation: versionId,
        },
      });
    },
    [bookName, chapter, fetchPassage],
  );

  // ── Render ──

  return (
    <View className="flex-1">
      {/* Navigation header */}
      <View className="flex-row items-center justify-between mb-3">
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={bookName}
          className="flex-row items-center active:opacity-70"
        >
          <Text className="text-blue-600 dark:text-blue-400 text-lg mr-1">
            &#x2039;
          </Text>
          <Text className="text-sm text-blue-600 dark:text-blue-400">
            {bookName}
          </Text>
        </Pressable>

        {/* Chapter navigation */}
        <View className="flex-row items-center gap-1">
          <Pressable
            onPress={() => onNavigateChapter(chapter - 1)}
            disabled={chapter <= 1}
            accessibilityRole="button"
            accessibilityLabel={t('bible.prevChapter')}
            className={`px-2 py-1.5 rounded ${
              chapter <= 1 ? 'opacity-30' : 'active:bg-gray-100 dark:active:bg-gray-700'
            }`}
          >
            <Text className="text-gray-500 dark:text-gray-400 text-base">
              &#x2039;
            </Text>
          </Pressable>
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[80px] text-center">
            {t('bible.chapter')} {chapter}
          </Text>
          <Pressable
            onPress={() => onNavigateChapter(chapter + 1)}
            disabled={chapter >= chapterCount}
            accessibilityRole="button"
            accessibilityLabel={t('bible.nextChapter')}
            className={`px-2 py-1.5 rounded ${
              chapter >= chapterCount
                ? 'opacity-30'
                : 'active:bg-gray-100 dark:active:bg-gray-700'
            }`}
          >
            <Text className="text-gray-500 dark:text-gray-400 text-base">
              &#x203a;
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Title */}
      <Text className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
        {bookName} {chapter}
      </Text>

      {/* Toolbar */}
      {passage && !loading ? (
        <View className="flex-row flex-wrap items-center gap-2 mb-4">
          {/* Font size controls */}
          <View className="flex-row items-center border border-gray-200 dark:border-gray-700 rounded-lg px-1">
            <Pressable
              onPress={() => changeFontSize(-1)}
              disabled={fontSize <= FONT_SIZES[0]}
              accessibilityRole="button"
              accessibilityLabel={t('bible.fontSmaller')}
              className={`p-1.5 ${fontSize <= FONT_SIZES[0] ? 'opacity-30' : ''}`}
            >
              <Text className="text-xs font-bold text-gray-500 dark:text-gray-400">
                A-
              </Text>
            </Pressable>
            <Text className="text-xs text-gray-400 dark:text-gray-500 min-w-[28px] text-center">
              {fontSize}
            </Text>
            <Pressable
              onPress={() => changeFontSize(1)}
              disabled={fontSize >= FONT_SIZES[FONT_SIZES.length - 1]}
              accessibilityRole="button"
              accessibilityLabel={t('bible.fontLarger')}
              className={`p-1.5 ${
                fontSize >= FONT_SIZES[FONT_SIZES.length - 1] ? 'opacity-30' : ''
              }`}
            >
              <Text className="text-sm font-bold text-gray-500 dark:text-gray-400">
                A+
              </Text>
            </Pressable>
          </View>

          {/* Copy */}
          <Pressable
            onPress={handleCopy}
            accessibilityRole="button"
            accessibilityLabel={t('bible.copy')}
            className="flex-row items-center px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg active:opacity-70"
          >
            <Text
              className={`text-xs ${
                copied
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {copied ? t('bible.copied') : t('bible.copy')}
            </Text>
          </Pressable>

          {/* Share */}
          <Pressable
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel={t('bible.sharePassage')}
            className="flex-row items-center px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg active:opacity-70"
          >
            <Text
              className={`text-xs ${
                shared
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {shared ? t('bible.copied') : t('bible.sharePassage')}
            </Text>
          </Pressable>

          {/* Bookmark */}
          <Pressable
            onPress={toggleBookmark}
            accessibilityRole="button"
            accessibilityLabel={
              isBookmarked ? t('bible.bookmarked') : t('bible.bookmark')
            }
            className={`flex-row items-center px-2.5 py-1.5 border rounded-lg active:opacity-70 ${
              isBookmarked
                ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <Text
              className={`text-xs ${
                isBookmarked
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {isBookmarked ? t('bible.bookmarked') : t('bible.bookmark')}
            </Text>
          </Pressable>

          {/* Translation selector */}
          <Pressable
            onPress={() => setShowTranslationPicker(true)}
            accessibilityRole="button"
            accessibilityLabel={t('bible.versionSelect')}
            className="flex-row items-center px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg active:opacity-70"
          >
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {t('bible.translation')}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {/* Loading state */}
      {loading ? (
        <View className="flex-1 items-center justify-center py-12">
          <ActivityIndicator color="#3b82f6" size="large" />
        </View>
      ) : null}

      {/* Error state */}
      {error && !loading ? (
        <View className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800/40">
          <Text className="text-sm text-red-700 dark:text-red-300">
            {t('bible.passageError')}
          </Text>
        </View>
      ) : null}

      {/* Passage text */}
      {passage && !loading ? (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {passage.verses && passage.verses.length > 0 ? (
            <Text
              className="text-gray-700 dark:text-gray-300 leading-relaxed"
              style={{
                fontSize,
                lineHeight: fontSize * (fontSize > 18 ? 1.8 : 1.6),
              }}
            >
              {passage.verses.map((verse) => (
                <Text key={verse.number}>
                  <Text className="text-xs font-bold text-blue-400 dark:text-blue-500">
                    {verse.number}{' '}
                  </Text>
                  <Text>{verse.text} </Text>
                </Text>
              ))}
            </Text>
          ) : (
            <Text
              className="text-gray-700 dark:text-gray-300 leading-relaxed"
              style={{
                fontSize,
                lineHeight: fontSize * (fontSize > 18 ? 1.8 : 1.6),
              }}
            >
              {passage.text}
            </Text>
          )}

          {passage.translation ? (
            <Text className="text-xs text-gray-400 dark:text-gray-500 mt-4">
              {t('bible.translation')}: {passage.translation}
              {passage.verseCount > 0
                ? ` \u2014 ${passage.verseCount} ${t('bible.verses')}`
                : ''}
            </Text>
          ) : null}

          {passage.copyright ? (
            <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">
              {passage.copyright}
            </Text>
          ) : null}

          {/* Bottom chapter navigation */}
          <View className="flex-row justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Pressable
              onPress={() => onNavigateChapter(chapter - 1)}
              disabled={chapter <= 1}
              accessibilityRole="button"
              accessibilityLabel={t('bible.prevChapter')}
              className={`flex-row items-center gap-1 ${
                chapter <= 1 ? 'opacity-30' : 'active:opacity-70'
              }`}
            >
              <Text className="text-sm text-blue-600 dark:text-blue-400">
                &#x2039; {t('bible.prevChapter')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => onNavigateChapter(chapter + 1)}
              disabled={chapter >= chapterCount}
              accessibilityRole="button"
              accessibilityLabel={t('bible.nextChapter')}
              className={`flex-row items-center gap-1 ${
                chapter >= chapterCount ? 'opacity-30' : 'active:opacity-70'
              }`}
            >
              <Text className="text-sm text-blue-600 dark:text-blue-400">
                {t('bible.nextChapter')} &#x203a;
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      ) : null}

      {/* Translation picker modal */}
      <TranslationPicker
        visible={showTranslationPicker}
        currentVersionId={bibleVersion}
        onSelect={handleVersionChange}
        onClose={() => setShowTranslationPicker(false)}
      />
    </View>
  );
}
