import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, ActivityIndicator, Alert } from 'react-native';
import { useTranslation, StorageKeys, safeGetItem, safeSetItem } from '@mycircle/shared';
import type { FlashCard, CardType } from './types';
import type { ChineseCharacter, CharacterCategory } from './data/characters';
import { phrases } from './data/phrases';
import { useFlashCards } from './hooks/useFlashCards';
import CardGrid from './components/CardGrid';
import CardPractice from './components/CardPractice';
import AddCardModal from './components/AddCardModal';
import BibleVersePicker from './components/BibleVersePicker';
import QuizView from './components/QuizView';
import CharacterEditor from './components/CharacterEditor';

const TYPE_LABELS: Record<CardType, string> = {
  chinese: 'flashcards.chinese',
  english: 'flashcards.english',
  'bible-first-letter': 'flashcards.bibleFirstLetter',
  'bible-full': 'flashcards.bibleFull',
  custom: 'flashcards.custom',
};

export default function FlashcardsScreen() {
  const { t } = useTranslation();
  const {
    allCards,
    progress,
    loading,
    cardTypes,
    toggleMastered,
    addBibleCards,
    addCustomCard,
    updateCard,
    deleteCard,
    resetProgress,
    addChineseChar,
    updateChineseChar,
    deleteChineseChar,
  } = useFlashCards();

  const [disabledTypes, setDisabledTypes] = useState<Set<CardType>>(() => {
    try {
      const stored = safeGetItem(StorageKeys.FLASHCARD_TYPE_FILTER);
      if (stored) return new Set(JSON.parse(stored) as CardType[]);
    } catch { /* ignore */ }
    return new Set();
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBiblePicker, setShowBiblePicker] = useState(false);
  const [practiceCards, setPracticeCards] = useState<FlashCard[] | null>(null);
  const [practiceStart, setPracticeStart] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<FlashCard | null>(null);
  const [cardToEdit, setCardToEdit] = useState<FlashCard | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showCharEditor, setShowCharEditor] = useState(false);
  const [editingChar, setEditingChar] = useState<ChineseCharacter | undefined>(undefined);

  const filteredCards = useMemo(() => {
    if (disabledTypes.size === 0) return allCards;
    return allCards.filter(c => !disabledTypes.has(c.type));
  }, [allCards, disabledTypes]);

  const toggleType = useCallback((type: CardType) => {
    setDisabledTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      try { safeSetItem(StorageKeys.FLASHCARD_TYPE_FILTER, JSON.stringify(Array.from(next))); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const masteredCount = progress.masteredIds.length;

  const handleCardClick = useCallback((card: FlashCard) => {
    const idx = filteredCards.findIndex(c => c.id === card.id);
    setPracticeStart(idx >= 0 ? idx : 0);
    setPracticeCards(filteredCards);
  }, [filteredCards]);

  const handlePracticeAll = useCallback(() => {
    if (filteredCards.length > 0) {
      setPracticeStart(0);
      setPracticeCards(filteredCards);
    }
  }, [filteredCards]);

  const handleReset = useCallback(() => {
    resetProgress();
    setShowResetConfirm(false);
  }, [resetProgress]);

  const handleDeleteConfirm = useCallback(() => {
    if (!cardToDelete) return;
    if (cardToDelete.type === 'chinese') {
      const rawId = cardToDelete.id.replace(/^zh-/, '');
      deleteChineseChar(rawId);
    } else {
      deleteCard(cardToDelete.id);
    }
    setCardToDelete(null);
  }, [cardToDelete, deleteChineseChar, deleteCard]);

  const handleEditRequest = useCallback((card: FlashCard) => {
    if (card.type === 'chinese') {
      const rawId = card.id.replace(/^zh-/, '');
      setEditingChar({
        id: rawId,
        character: card.front,
        pinyin: card.meta?.pinyin || '',
        meaning: card.back,
        category: (card.category || 'phrases') as CharacterCategory,
      });
      setShowCharEditor(true);
    } else {
      setCardToEdit(card);
    }
  }, []);

  const handleEdit = useCallback((updates: { front: string; back: string; category: string }) => {
    if (cardToEdit) {
      updateCard(cardToEdit.id, updates);
      setCardToEdit(null);
    }
  }, [cardToEdit, updateCard]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center py-12">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 px-4 pb-20" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6 mt-4">
          <Text className="text-2xl font-bold text-gray-800 dark:text-white">
            {t('flashcards.title')}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('flashcards.subtitle')}
          </Text>
        </View>

        {/* Stats bar */}
        <View className="flex-row items-center gap-4 mb-4">
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            {t('flashcards.cardsCount').replace('{count}', String(allCards.length))}
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            {t('flashcards.masteredCount').replace('{count}', String(masteredCount))}
          </Text>
        </View>

        {/* Type filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row gap-2">
            {cardTypes.map(type => {
              const count = allCards.filter(c => c.type === type).length;
              const labelKey = TYPE_LABELS[type] || type;
              const isEnabled = !disabledTypes.has(type);
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => toggleType(type)}
                  className={`px-3 py-1.5 rounded-full min-h-[36px] justify-center ${
                    isEnabled
                      ? 'bg-blue-500 dark:bg-blue-600'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                  accessibilityLabel={`${t(labelKey as any)} (${count})`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isEnabled }}
                >
                  <Text className={`text-sm font-medium ${
                    isEnabled ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                  }`}>
                    {t(labelKey as any)} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Action buttons */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          <View className="flex-row gap-2">
            {/* Practice All */}
            <TouchableOpacity
              onPress={handlePracticeAll}
              disabled={filteredCards.length === 0}
              className={`px-4 py-2 rounded-lg min-h-[44px] justify-center ${
                filteredCards.length === 0
                  ? 'bg-blue-300 dark:bg-blue-800'
                  : 'bg-blue-500 dark:bg-blue-600'
              }`}
              accessibilityLabel={t('flashcards.practiceAll')}
              accessibilityRole="button"
            >
              <Text className="text-sm font-medium text-white">
                {t('flashcards.practiceAll')}
              </Text>
            </TouchableOpacity>

            {/* Quiz */}
            {allCards.some(c => c.type === 'english') && (
              <TouchableOpacity
                onPress={() => setShowQuiz(true)}
                className="px-4 py-2 rounded-lg min-h-[44px] justify-center bg-green-500 dark:bg-green-600"
                accessibilityLabel={t('english.quiz')}
                accessibilityRole="button"
              >
                <Text className="text-sm font-medium text-white">
                  {t('english.quiz')}
                </Text>
              </TouchableOpacity>
            )}

            {/* Add Custom Card */}
            <TouchableOpacity
              onPress={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-lg min-h-[44px] justify-center bg-gray-100 dark:bg-gray-700"
              accessibilityLabel={t('flashcards.addCustomCard')}
              accessibilityRole="button"
            >
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('flashcards.addCustomCard')}
              </Text>
            </TouchableOpacity>

            {/* Add Chinese Character */}
            <TouchableOpacity
              onPress={() => { setEditingChar(undefined); setShowCharEditor(true); }}
              className="px-4 py-2 rounded-lg min-h-[44px] justify-center bg-orange-100 dark:bg-orange-900/30"
              accessibilityLabel={t('chinese.addCharacter')}
              accessibilityRole="button"
            >
              <Text className="text-sm font-medium text-orange-700 dark:text-orange-400">
                {t('chinese.addCharacter')}
              </Text>
            </TouchableOpacity>

            {/* Add Bible Verses */}
            <TouchableOpacity
              onPress={() => setShowBiblePicker(true)}
              className="px-4 py-2 rounded-lg min-h-[44px] justify-center bg-purple-100 dark:bg-purple-900/30"
              accessibilityLabel={t('flashcards.addBibleVerses')}
              accessibilityRole="button"
            >
              <Text className="text-sm font-medium text-purple-700 dark:text-purple-400">
                {t('flashcards.addBibleVerses')}
              </Text>
            </TouchableOpacity>

            {/* Reset Progress */}
            {masteredCount > 0 && (
              <TouchableOpacity
                onPress={() => setShowResetConfirm(true)}
                className="px-4 py-2 rounded-lg min-h-[44px] justify-center"
                accessibilityLabel={t('flashcards.resetProgress')}
                accessibilityRole="button"
              >
                <Text className="text-sm font-medium text-red-600 dark:text-red-400">
                  {t('flashcards.resetProgress')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* Card grid */}
        <CardGrid
          cards={filteredCards}
          masteredIds={progress.masteredIds}
          onCardClick={handleCardClick}
          onDeleteCard={setCardToDelete}
          onEditCard={handleEditRequest}
        />

        {/* Bottom spacer */}
        <View className="h-20" />
      </ScrollView>

      {/* Practice view */}
      {practiceCards && (
        <CardPractice
          cards={practiceCards}
          masteredIds={progress.masteredIds}
          onToggleMastered={toggleMastered}
          onClose={() => setPracticeCards(null)}
          startIndex={practiceStart}
        />
      )}

      {/* Add card modal */}
      {showAddModal && (
        <AddCardModal
          onAdd={addCustomCard}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Edit card modal */}
      {cardToEdit && (
        <AddCardModal
          initialValues={{
            front: cardToEdit.front,
            back: cardToEdit.back,
            category: cardToEdit.category,
          }}
          onEdit={handleEdit}
          onClose={() => setCardToEdit(null)}
        />
      )}

      {/* Bible verse picker */}
      {showBiblePicker && (
        <BibleVersePicker
          onAddCards={addBibleCards}
          onClose={() => setShowBiblePicker(false)}
        />
      )}

      {/* Delete confirmation */}
      {cardToDelete && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setCardToDelete(null)}>
          <View className="flex-1 justify-center items-center bg-black/50 px-4">
            <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6">
              <Text className="text-gray-800 dark:text-white mb-4">
                {t('flashcards.deleteConfirm')}
              </Text>
              <View className="flex-row justify-end gap-2">
                <TouchableOpacity
                  onPress={() => setCardToDelete(null)}
                  className="px-4 py-2 rounded-lg min-h-[44px] justify-center"
                  accessibilityLabel={t('flashcards.cancel')}
                  accessibilityRole="button"
                >
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    {t('flashcards.cancel')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDeleteConfirm}
                  className="px-4 py-2 rounded-lg min-h-[44px] justify-center bg-red-500 dark:bg-red-600"
                  accessibilityLabel={t('flashcards.delete')}
                  accessibilityRole="button"
                >
                  <Text className="text-sm font-medium text-white">
                    {t('flashcards.delete')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Quiz view */}
      {showQuiz && (
        <Modal visible animationType="slide" onRequestClose={() => setShowQuiz(false)}>
          <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            {/* Quiz header */}
            <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <TouchableOpacity
                onPress={() => setShowQuiz(false)}
                className="min-h-[44px] min-w-[44px] justify-center"
                accessibilityLabel={t('flashcards.done')}
                accessibilityRole="button"
              >
                <Text className="text-sm text-gray-600 dark:text-gray-300">
                  {t('flashcards.done')}
                </Text>
              </TouchableOpacity>
              <Text className="text-sm font-medium text-gray-800 dark:text-white">
                {t('english.quiz')}
              </Text>
              <View className="w-10" />
            </View>
            <ScrollView className="flex-1 p-4">
              <QuizView phrases={phrases} onQuizComplete={() => {}} />
            </ScrollView>
          </View>
        </Modal>
      )}

      {/* Character editor */}
      {showCharEditor && (
        <CharacterEditor
          character={editingChar}
          onSave={async (data) => {
            if (editingChar) {
              await updateChineseChar(editingChar.id, data);
            } else {
              await addChineseChar(data);
            }
            setShowCharEditor(false);
            setEditingChar(undefined);
          }}
          onCancel={() => { setShowCharEditor(false); setEditingChar(undefined); }}
          onDelete={editingChar ? async (id) => {
            await deleteChineseChar(id);
            setShowCharEditor(false);
            setEditingChar(undefined);
          } : undefined}
        />
      )}

      {/* Reset confirmation */}
      {showResetConfirm && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setShowResetConfirm(false)}>
          <View className="flex-1 justify-center items-center bg-black/50 px-4">
            <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6">
              <Text className="text-gray-800 dark:text-white mb-4">
                {t('flashcards.resetConfirm')}
              </Text>
              <View className="flex-row justify-end gap-2">
                <TouchableOpacity
                  onPress={() => setShowResetConfirm(false)}
                  className="px-4 py-2 rounded-lg min-h-[44px] justify-center"
                  accessibilityLabel={t('flashcards.cancel')}
                  accessibilityRole="button"
                >
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    {t('flashcards.cancel')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleReset}
                  className="px-4 py-2 rounded-lg min-h-[44px] justify-center bg-red-500 dark:bg-red-600"
                  accessibilityLabel={t('flashcards.resetProgress')}
                  accessibilityRole="button"
                >
                  <Text className="text-sm font-medium text-white">
                    {t('flashcards.resetProgress')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
