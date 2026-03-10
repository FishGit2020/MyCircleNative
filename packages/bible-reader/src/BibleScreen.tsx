import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import {
  useTranslation,
  StorageKeys,
  safeGetJSON,
} from '@mycircle/shared';
import { BIBLE_BOOKS } from './data/books';
import { VerseOfDay, BookGrid, ChapterGrid, PassageView, DailyDevotional } from './components';

// ── Types ──

type ViewMode = 'books' | 'chapters' | 'passage';

interface LastRead {
  book: string;
  chapter: number;
  chapters: number;
}

interface Bookmark {
  book: string;
  chapter: number;
  label: string;
  timestamp: number;
}

// ── Main Screen ──

export default function BibleScreen() {
  const { t } = useTranslation();
  const [view, setView] = useState<ViewMode>('books');
  const [currentBook, setCurrentBook] = useState('');
  const [currentChapters, setCurrentChapters] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(0);

  const lastRead = useMemo<LastRead | null>(
    () => safeGetJSON<LastRead | null>(StorageKeys.BIBLE_LAST_READ, null),
    [],
  );

  const bookmarks = useMemo<Bookmark[]>(
    () => safeGetJSON<Bookmark[]>(StorageKeys.BIBLE_BOOKMARKS, []),
    [],
  );

  // ── Navigation handlers ──

  const handleBookSelect = useCallback(
    (bookName: string, chapterCount: number) => {
      setCurrentBook(bookName);
      setCurrentChapters(chapterCount);
      if (chapterCount === 1) {
        // Single-chapter books go directly to passage
        setCurrentChapter(1);
        setView('passage');
      } else {
        setView('chapters');
      }
    },
    [],
  );

  const handleChapterSelect = useCallback((chapter: number) => {
    setCurrentChapter(chapter);
    setView('passage');
  }, []);

  const handleNavigateChapter = useCallback(
    (chapter: number) => {
      if (chapter < 1 || chapter > currentChapters) return;
      setCurrentChapter(chapter);
    },
    [currentChapters],
  );

  const handleContinueReading = useCallback(() => {
    if (!lastRead) return;
    setCurrentBook(lastRead.book);
    setCurrentChapters(lastRead.chapters);
    setCurrentChapter(lastRead.chapter);
    setView('passage');
  }, [lastRead]);

  const handleBookmarkClick = useCallback((bm: Bookmark) => {
    const bookData = BIBLE_BOOKS.find((b) => b.name === bm.book);
    if (!bookData) return;
    setCurrentBook(bm.book);
    setCurrentChapters(bookData.chapters);
    setCurrentChapter(bm.chapter);
    setView('passage');
  }, []);

  const handleDevotionalRead = useCallback((book: string, chapter: number) => {
    const bookData = BIBLE_BOOKS.find((b) => b.name === book);
    if (!bookData) return;
    setCurrentBook(book);
    setCurrentChapters(bookData.chapters);
    setCurrentChapter(chapter);
    setView('passage');
  }, []);

  const handleBackToBooks = useCallback(() => {
    setView('books');
  }, []);

  const handleBackToChapters = useCallback(() => {
    setView('chapters');
  }, []);

  // ── Render ──

  // Passage view is full-screen (no ScrollView wrapper)
  if (view === 'passage') {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 px-4 pt-2 pb-20 md:pb-8">
        <PassageView
          bookName={currentBook}
          chapterCount={currentChapters}
          chapter={currentChapter}
          onBack={handleBackToChapters}
          onNavigateChapter={handleNavigateChapter}
        />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-gray-900"
      contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Verse of the Day */}
      <VerseOfDay onReadChapter={handleDevotionalRead} />

      {/* Daily Devotional */}
      <View className="mt-4">
        <DailyDevotional onReadPassage={handleDevotionalRead} />
      </View>

      {/* Continue reading & bookmarks */}
      {view === 'books' && (lastRead || bookmarks.length > 0) ? (
        <View className="flex-row flex-wrap gap-2 mt-4">
          {lastRead ? (
            <Pressable
              onPress={handleContinueReading}
              accessibilityRole="button"
              accessibilityLabel={`${t('bible.continueReading')}: ${lastRead.book} ${lastRead.chapter}`}
              className="flex-row items-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg active:opacity-80"
            >
              <Text className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {t('bible.continueReading')}: {lastRead.book} {lastRead.chapter}
              </Text>
            </Pressable>
          ) : null}
          {bookmarks.slice(0, 5).map((bm, i) => (
            <Pressable
              key={`${bm.book}-${bm.chapter}-${i}`}
              onPress={() => handleBookmarkClick(bm)}
              accessibilityRole="button"
              accessibilityLabel={bm.label}
              className="flex-row items-center gap-1 px-2.5 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg active:opacity-80"
            >
              <Text className="text-xs text-yellow-700 dark:text-yellow-400">
                {bm.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {/* Main content area */}
      <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mt-4">
        <Text className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          {t('bible.readScripture')}
        </Text>

        {view === 'books' ? (
          <BookGrid onSelectBook={handleBookSelect} />
        ) : null}

        {view === 'chapters' ? (
          <ChapterGrid
            bookName={currentBook}
            chapterCount={currentChapters}
            onSelectChapter={handleChapterSelect}
            onBack={handleBackToBooks}
          />
        ) : null}
      </View>

      {/* Attribution */}
      <Text className="text-xs text-center text-gray-400 dark:text-gray-500 mt-4">
        {t('bible.attributionYouVersion')}
      </Text>
    </ScrollView>
  );
}
