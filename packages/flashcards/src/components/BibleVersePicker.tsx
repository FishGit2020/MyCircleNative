import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, SafeAreaView, ActivityIndicator, Switch } from 'react-native';
import { useLazyQuery } from '@apollo/client';
import { useTranslation, GET_BIBLE_PASSAGE } from '@mycircle/shared';
import type { FlashCard } from '../types';

// 66 canonical books with chapter counts
const BIBLE_BOOKS = [
  { name: 'Genesis', chapters: 50 }, { name: 'Exodus', chapters: 40 }, { name: 'Leviticus', chapters: 27 },
  { name: 'Numbers', chapters: 36 }, { name: 'Deuteronomy', chapters: 34 }, { name: 'Joshua', chapters: 24 },
  { name: 'Judges', chapters: 21 }, { name: 'Ruth', chapters: 4 }, { name: '1 Samuel', chapters: 31 },
  { name: '2 Samuel', chapters: 24 }, { name: '1 Kings', chapters: 22 }, { name: '2 Kings', chapters: 25 },
  { name: '1 Chronicles', chapters: 29 }, { name: '2 Chronicles', chapters: 36 }, { name: 'Ezra', chapters: 10 },
  { name: 'Nehemiah', chapters: 13 }, { name: 'Esther', chapters: 10 }, { name: 'Job', chapters: 42 },
  { name: 'Psalms', chapters: 150 }, { name: 'Proverbs', chapters: 31 }, { name: 'Ecclesiastes', chapters: 12 },
  { name: 'Song of Solomon', chapters: 8 }, { name: 'Isaiah', chapters: 66 }, { name: 'Jeremiah', chapters: 52 },
  { name: 'Lamentations', chapters: 5 }, { name: 'Ezekiel', chapters: 48 }, { name: 'Daniel', chapters: 12 },
  { name: 'Hosea', chapters: 14 }, { name: 'Joel', chapters: 3 }, { name: 'Amos', chapters: 9 },
  { name: 'Obadiah', chapters: 1 }, { name: 'Jonah', chapters: 4 }, { name: 'Micah', chapters: 7 },
  { name: 'Nahum', chapters: 3 }, { name: 'Habakkuk', chapters: 3 }, { name: 'Zephaniah', chapters: 3 },
  { name: 'Haggai', chapters: 2 }, { name: 'Zechariah', chapters: 14 }, { name: 'Malachi', chapters: 4 },
  { name: 'Matthew', chapters: 28 }, { name: 'Mark', chapters: 16 }, { name: 'Luke', chapters: 24 },
  { name: 'John', chapters: 21 }, { name: 'Acts', chapters: 28 }, { name: 'Romans', chapters: 16 },
  { name: '1 Corinthians', chapters: 16 }, { name: '2 Corinthians', chapters: 13 }, { name: 'Galatians', chapters: 6 },
  { name: 'Ephesians', chapters: 6 }, { name: 'Philippians', chapters: 4 }, { name: 'Colossians', chapters: 4 },
  { name: '1 Thessalonians', chapters: 5 }, { name: '2 Thessalonians', chapters: 3 }, { name: '1 Timothy', chapters: 6 },
  { name: '2 Timothy', chapters: 4 }, { name: 'Titus', chapters: 3 }, { name: 'Philemon', chapters: 1 },
  { name: 'Hebrews', chapters: 13 }, { name: 'James', chapters: 5 }, { name: '1 Peter', chapters: 5 },
  { name: '2 Peter', chapters: 3 }, { name: '1 John', chapters: 5 }, { name: '2 John', chapters: 1 },
  { name: '3 John', chapters: 1 }, { name: 'Jude', chapters: 1 }, { name: 'Revelation', chapters: 22 },
];

interface VerseItem {
  number: number;
  text: string;
}

interface PassageResponse {
  biblePassage: {
    text: string;
    reference: string;
    verseCount: number;
    verses: VerseItem[];
  };
}

interface BibleVersePickerProps {
  onAddCards: (cards: FlashCard[]) => void;
  onClose: () => void;
}

type Step = 'book' | 'chapter' | 'verse';
type CardTypeOption = 'both' | 'first-letter' | 'full';

/** Fallback: split plain text into verses using common markers */
function splitVerses(text: string): Array<{ number: number; text: string }> {
  const bracketParts = text.split(/\[(\d+)\]\s*/);
  if (bracketParts.length > 2) {
    const verses: Array<{ number: number; text: string }> = [];
    for (let i = 1; i < bracketParts.length; i += 2) {
      const num = parseInt(bracketParts[i], 10);
      const content = (bracketParts[i + 1] || '').trim();
      if (content) verses.push({ number: num, text: content });
    }
    if (verses.length > 1) return verses;
  }
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length > 1) {
    return lines.map((line, idx) => ({ number: idx + 1, text: line.trim() }));
  }
  return [{ number: 1, text: text.trim() }];
}

function getFirstLetters(text: string): string {
  return text
    .split(/\s+/)
    .map(word => word.charAt(0))
    .join(' ');
}

export default function BibleVersePicker({ onAddCards, onClose }: BibleVersePickerProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('book');
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [selectedVerses, setSelectedVerses] = useState<Set<number>>(new Set());
  const [cardType, setCardType] = useState<CardTypeOption>('both');

  const [fetchPassage, { data, loading }] = useLazyQuery<PassageResponse>(GET_BIBLE_PASSAGE, {
    fetchPolicy: 'cache-first',
  });

  const book = BIBLE_BOOKS.find(b => b.name === selectedBook);

  const verses = useMemo(() => {
    if (!data?.biblePassage) return [];
    const apiVerses = data.biblePassage.verses;
    if (apiVerses && apiVerses.length > 0) return apiVerses;
    return splitVerses(data.biblePassage.text);
  }, [data]);

  const handleBookSelect = (bookName: string) => {
    setSelectedBook(bookName);
    setStep('chapter');
  };

  const handleChapterSelect = (ch: number) => {
    setSelectedChapter(ch);
    setSelectedVerses(new Set());
    fetchPassage({ variables: { reference: `${selectedBook} ${ch}` } });
    setStep('verse');
  };

  const toggleVerse = (num: number) => {
    setSelectedVerses(prev => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedVerses(new Set(verses.map(v => v.number)));
  };

  const handleAddCards = () => {
    if (selectedVerses.size === 0) return;
    const sorted = [...selectedVerses].sort((a, b) => a - b);
    const cards: FlashCard[] = [];

    for (const verseNum of sorted) {
      const verse = verses.find(v => v.number === verseNum);
      if (!verse) continue;
      const ref = `${selectedBook} ${selectedChapter}:${verseNum}`;

      if (cardType === 'both' || cardType === 'first-letter') {
        cards.push({
          id: `bible-${selectedBook.toLowerCase().replace(/\s/g, '')}-${selectedChapter}-${verseNum}-fl`,
          type: 'bible-first-letter',
          category: selectedBook,
          front: getFirstLetters(verse.text),
          back: verse.text,
          meta: {
            reference: ref,
            book: selectedBook,
            chapter: selectedChapter,
            verses: String(verseNum),
          },
        });
      }
      if (cardType === 'both' || cardType === 'full') {
        cards.push({
          id: `bible-${selectedBook.toLowerCase().replace(/\s/g, '')}-${selectedChapter}-${verseNum}-ft`,
          type: 'bible-full',
          category: selectedBook,
          front: ref,
          back: verse.text,
          meta: {
            reference: ref,
            book: selectedBook,
            chapter: selectedChapter,
            verses: String(verseNum),
          },
        });
      }
    }

    onAddCards(cards);
    onClose();
  };

  const cardCount = selectedVerses.size * (cardType === 'both' ? 2 : 1);

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-800">
        {/* Header */}
        <View className="px-4 pt-4 pb-3 flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <Text className="text-lg font-semibold text-gray-800 dark:text-white">
            {t('flashcards.addBibleVerses')}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            className="min-h-[44px] min-w-[44px] items-center justify-center"
            accessibilityLabel={t('flashcards.done')}
            accessibilityRole="button"
          >
            <Text className="text-2xl text-gray-400 dark:text-gray-500">{'\u2715'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-4 py-4">
          {/* Step 1: Book selector */}
          {step === 'book' && (
            <View>
              <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                {t('flashcards.selectBook')}
              </Text>
              <View className="flex-row flex-wrap gap-1.5">
                {BIBLE_BOOKS.map(b => (
                  <TouchableOpacity
                    key={b.name}
                    onPress={() => handleBookSelect(b.name)}
                    className="px-3 py-2 rounded-lg min-h-[44px] justify-center w-[48%]"
                    accessibilityLabel={b.name}
                    accessibilityRole="button"
                  >
                    <Text className="text-sm text-gray-700 dark:text-gray-300">
                      {b.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Step 2: Chapter selector */}
          {step === 'chapter' && book && (
            <View>
              <TouchableOpacity
                onPress={() => setStep('book')}
                className="mb-3 min-h-[44px] justify-center"
                accessibilityLabel={t('flashcards.selectBook')}
                accessibilityRole="button"
              >
                <Text className="text-sm text-blue-600 dark:text-blue-400">
                  {'\u2190'} {t('flashcards.selectBook')}
                </Text>
              </TouchableOpacity>
              <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                {selectedBook} {'\u2014'} {t('flashcards.selectChapter')}
              </Text>
              <View className="flex-row flex-wrap gap-1.5">
                {Array.from({ length: book.chapters }, (_, i) => i + 1).map(ch => (
                  <TouchableOpacity
                    key={ch}
                    onPress={() => handleChapterSelect(ch)}
                    className="py-2 rounded-lg bg-gray-100 dark:bg-gray-700 min-h-[44px] min-w-[44px] items-center justify-center"
                    accessibilityLabel={`Chapter ${ch}`}
                    accessibilityRole="button"
                  >
                    <Text className="text-sm text-gray-700 dark:text-gray-300">{ch}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Step 3: Verse picker */}
          {step === 'verse' && (
            <View>
              {loading ? (
                <View className="items-center py-8">
                  <ActivityIndicator size="large" />
                  <Text className="text-gray-500 dark:text-gray-400 mt-2">{t('flashcards.loading')}</Text>
                </View>
              ) : data?.biblePassage ? (
                <View>
                  <View className="flex-row items-center justify-between mb-4">
                    <TouchableOpacity
                      onPress={() => setStep('chapter')}
                      className="min-h-[44px] justify-center"
                      accessibilityLabel={t('flashcards.selectChapter')}
                      accessibilityRole="button"
                    >
                      <Text className="text-sm text-blue-600 dark:text-blue-400">
                        {'\u2190'} {t('flashcards.selectChapter')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={selectAll}
                      className="min-h-[44px] justify-center"
                      accessibilityLabel={t('flashcards.selectAll')}
                      accessibilityRole="button"
                    >
                      <Text className="text-sm text-blue-600 dark:text-blue-400">
                        {t('flashcards.selectAll')}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                    {data.biblePassage.reference} {'\u2014'} {t('flashcards.selectVerses')}
                  </Text>

                  {/* Card type selector */}
                  <View className="flex-row gap-2 mb-3">
                    {(['both', 'first-letter', 'full'] as const).map(option => (
                      <TouchableOpacity
                        key={option}
                        onPress={() => setCardType(option)}
                        className={`px-3 py-1.5 rounded-full min-h-[36px] justify-center ${
                          cardType === option
                            ? 'bg-blue-500 dark:bg-blue-600'
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}
                        accessibilityLabel={
                          option === 'both'
                            ? t('flashcards.cardTypeBoth')
                            : option === 'first-letter'
                              ? t('flashcards.firstLetterCard')
                              : t('flashcards.fullTextCard')
                        }
                        accessibilityRole="button"
                      >
                        <Text className={`text-xs ${
                          cardType === option
                            ? 'text-white'
                            : 'text-gray-600 dark:text-gray-300'
                        }`}>
                          {option === 'both'
                            ? t('flashcards.cardTypeBoth')
                            : option === 'first-letter'
                              ? t('flashcards.firstLetterCard')
                              : t('flashcards.fullTextCard')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Verse checkboxes */}
                  <View className="gap-2 mb-4">
                    {verses.map(verse => (
                      <TouchableOpacity
                        key={verse.number}
                        onPress={() => toggleVerse(verse.number)}
                        className={`flex-row items-start gap-3 p-2 rounded-lg min-h-[44px] ${
                          selectedVerses.has(verse.number)
                            ? 'bg-blue-50 dark:bg-blue-900/30'
                            : ''
                        }`}
                        accessibilityLabel={`Verse ${verse.number}: ${verse.text}`}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: selectedVerses.has(verse.number) }}
                      >
                        <View className={`w-5 h-5 rounded border-2 mt-0.5 items-center justify-center ${
                          selectedVerses.has(verse.number)
                            ? 'bg-blue-500 border-blue-500 dark:bg-blue-600 dark:border-blue-600'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {selectedVerses.has(verse.number) && (
                            <Text className="text-white text-xs">{'\u2713'}</Text>
                          )}
                        </View>
                        <Text className="text-sm text-gray-800 dark:text-white flex-1">
                          <Text className="font-bold text-gray-500 dark:text-gray-400">{verse.number} </Text>
                          {verse.text}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Add button */}
                  <TouchableOpacity
                    onPress={handleAddCards}
                    disabled={selectedVerses.size === 0}
                    className={`w-full py-3 rounded-lg min-h-[44px] items-center justify-center ${
                      selectedVerses.size === 0
                        ? 'bg-blue-300 dark:bg-blue-800'
                        : 'bg-blue-500 dark:bg-blue-600'
                    }`}
                    accessibilityLabel={`${t('flashcards.addAsCards')} (${cardCount})`}
                    accessibilityRole="button"
                  >
                    <Text className="text-sm font-medium text-white">
                      {t('flashcards.addAsCards')} ({cardCount})
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text className="text-center text-gray-500 dark:text-gray-400 py-8">
                  Failed to load passage
                </Text>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
