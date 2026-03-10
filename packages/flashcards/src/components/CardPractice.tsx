import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@mycircle/shared';
import type { FlashCard } from '../types';
import type { ChineseCharacter } from '../data/characters';
import PracticeCanvas from './PracticeCanvas';
import FlipCard from './FlipCard';

interface CardPracticeProps {
  cards: FlashCard[];
  masteredIds: string[];
  onToggleMastered: (cardId: string) => void;
  onClose: () => void;
  startIndex?: number;
}

function CardFront({ card }: { card: FlashCard }) {
  return (
    <View className="items-center">
      <Text className="text-3xl font-bold text-gray-800 dark:text-white mb-2 text-center">
        {card.front}
      </Text>
      {card.meta?.pinyin && (
        <Text className="text-lg text-gray-500 dark:text-gray-400">{card.meta.pinyin}</Text>
      )}
      {card.meta?.reference && (
        <Text className="text-sm text-blue-600 dark:text-blue-400 mt-2">{card.meta.reference}</Text>
      )}
    </View>
  );
}

function CardBack({ card }: { card: FlashCard }) {
  return (
    <View className="items-center">
      <Text className="text-xl text-gray-800 dark:text-white leading-relaxed text-center">
        {card.back}
      </Text>
      {card.meta?.reference && (
        <Text className="text-sm text-blue-600 dark:text-blue-400 mt-3">{card.meta.reference}</Text>
      )}
    </View>
  );
}

export default function CardPractice({ cards, masteredIds, onToggleMastered, onClose, startIndex = 0 }: CardPracticeProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showWritingPractice, setShowWritingPractice] = useState(false);

  const card = cards[currentIndex];
  const isMastered = card ? masteredIds.includes(card.id) : false;

  const flip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const resetFlip = useCallback(() => {
    setIsFlipped(false);
  }, []);

  const goNext = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(i => i + 1);
      resetFlip();
    }
  }, [currentIndex, cards.length, resetFlip]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
      resetFlip();
    }
  }, [currentIndex, resetFlip]);

  if (!card) return null;

  // Map current card to ChineseCharacter for PracticeCanvas
  const chineseCharForCanvas: ChineseCharacter | null = card.type === 'chinese' ? {
    id: card.id.replace('zh-', ''),
    character: card.front,
    pinyin: card.meta?.pinyin || '',
    meaning: card.back,
    category: card.category as any,
  } : null;

  if (showWritingPractice && chineseCharForCanvas) {
    return (
      <Modal visible animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setShowWritingPractice(false)}>
        <View style={{ flex: 1, backgroundColor: '#f9fafb', paddingTop: insets.top, paddingBottom: insets.bottom }}>
          <PracticeCanvas
            character={chineseCharForCanvas}
            onBack={() => setShowWritingPractice(false)}
          />
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#f9fafb', paddingTop: insets.top, paddingBottom: insets.bottom }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <TouchableOpacity
            onPress={onClose}
            className="min-h-[44px] min-w-[44px] justify-center"
            accessibilityLabel={t('flashcards.done')}
            accessibilityRole="button"
          >
            <Text className="text-sm text-gray-600 dark:text-gray-300">
              {t('flashcards.done')}
            </Text>
          </TouchableOpacity>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {t('flashcards.progress').replace('{current}', String(currentIndex + 1)).replace('{total}', String(cards.length))}
          </Text>
          <TouchableOpacity
            onPress={() => onToggleMastered(card.id)}
            className={`min-h-[44px] px-3 rounded-lg justify-center ${
              isMastered
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-gray-100 dark:bg-gray-700'
            }`}
            accessibilityLabel={isMastered ? t('flashcards.unmarkMastered') : t('flashcards.markMastered')}
            accessibilityRole="button"
          >
            <Text className={`text-sm font-medium ${
              isMastered
                ? 'text-green-700 dark:text-green-400'
                : 'text-gray-600 dark:text-gray-300'
            }`}>
              {isMastered ? t('flashcards.unmarkMastered') : t('flashcards.markMastered')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <View className="h-1 bg-gray-200 dark:bg-gray-700">
          <View
            className="h-full bg-blue-500"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </View>

        {/* Flip card */}
        <View className="flex-1 justify-center items-center px-4">
          <FlipCard
            front={<CardFront card={card} />}
            back={<CardBack card={card} />}
            flipped={isFlipped}
            onFlip={flip}
          />
        </View>

        {/* Controls */}
        <View className="flex-row items-center justify-center gap-3 px-4 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <TouchableOpacity
            onPress={goPrev}
            disabled={currentIndex === 0}
            className={`px-4 py-2 rounded-lg min-h-[44px] justify-center bg-gray-100 dark:bg-gray-700 ${
              currentIndex === 0 ? 'opacity-30' : ''
            }`}
            accessibilityLabel={t('flashcards.previous')}
            accessibilityRole="button"
          >
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('flashcards.previous')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={flip}
            className="px-6 py-2 rounded-lg min-h-[44px] justify-center bg-blue-500 dark:bg-blue-600"
            accessibilityLabel={t('flashcards.flip')}
            accessibilityRole="button"
          >
            <Text className="text-sm font-medium text-white">
              {t('flashcards.flip')}
            </Text>
          </TouchableOpacity>

          {card.type === 'chinese' && (
            <TouchableOpacity
              onPress={() => setShowWritingPractice(true)}
              className="px-4 py-2 rounded-lg min-h-[44px] justify-center bg-orange-500 dark:bg-orange-600"
              accessibilityLabel={t('chinese.practice')}
              accessibilityRole="button"
            >
              <Text className="text-sm font-medium text-white">
                {t('chinese.practice')}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={goNext}
            disabled={currentIndex === cards.length - 1}
            className={`px-4 py-2 rounded-lg min-h-[44px] justify-center bg-gray-100 dark:bg-gray-700 ${
              currentIndex === cards.length - 1 ? 'opacity-30' : ''
            }`}
            accessibilityLabel={t('flashcards.next')}
            accessibilityRole="button"
          >
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('flashcards.next')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
