import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  createLogger,
  StorageKeys,
  AppEvents,
  eventBus,
  safeGetItem,
  safeSetItem,
  safeGetJSON,
} from '@mycircle/shared';
import type { FlashCard, FlashCardProgress, CardType } from '../types';
import { phrases } from '../data/phrases';

const log = createLogger('flashcards');

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = safeGetItem(key);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return fallback;
}

function saveToStorage(key: string, value: unknown) {
  try {
    safeSetItem(key, JSON.stringify(value));
  } catch { /* ignore */ }
}

// All 88 English phrases mapped to FlashCards
const ENGLISH_PHRASES: FlashCard[] = phrases.map(p => ({
  id: `en-${p.id}`,
  type: 'english' as CardType,
  category: p.category,
  front: p.english,
  back: p.chinese,
  meta: { phonetic: p.phonetic },
}));

export function useFlashCards() {
  const [bibleCards, setBibleCards] = useState<FlashCard[]>(() =>
    loadFromStorage(StorageKeys.FLASHCARD_BIBLE_CARDS, [])
  );
  const [customCards, setCustomCards] = useState<FlashCard[]>(() =>
    loadFromStorage(StorageKeys.FLASHCARD_CUSTOM_CARDS, [])
  );
  const [chineseCards, setChineseCards] = useState<FlashCard[]>([]);
  const [progress, setProgress] = useState<FlashCardProgress>(() =>
    loadFromStorage(StorageKeys.FLASHCARD_PROGRESS, { masteredIds: [], lastPracticed: '' })
  );
  const [loading, setLoading] = useState(false);

  // Load Chinese characters from storage
  useEffect(() => {
    try {
      const cached = safeGetJSON<Array<{ id: string; character: string; pinyin: string; meaning: string; category: string }>>(
        StorageKeys.CHINESE_CHARACTERS_CACHE,
        []
      );
      if (cached.length > 0) {
        setChineseCards(cached.map(c => ({
          id: `zh-${c.id}`,
          type: 'chinese' as CardType,
          category: c.category,
          front: c.character,
          back: c.meaning,
          meta: { pinyin: c.pinyin },
        })));
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  // Listen for progress changes from other features via eventBus
  useEffect(() => {
    const unsub = eventBus.subscribe(AppEvents.FLASHCARD_PROGRESS_CHANGED, () => {
      setProgress(loadFromStorage(StorageKeys.FLASHCARD_PROGRESS, { masteredIds: [], lastPracticed: '' }));
      setBibleCards(loadFromStorage(StorageKeys.FLASHCARD_BIBLE_CARDS, []));
      setCustomCards(loadFromStorage(StorageKeys.FLASHCARD_CUSTOM_CARDS, []));
    });
    return unsub;
  }, []);

  // Listen for Chinese character changes
  useEffect(() => {
    const unsub = eventBus.subscribe(AppEvents.CHINESE_CHARACTERS_CHANGED, () => {
      try {
        const cached = safeGetJSON<Array<{ id: string; character: string; pinyin: string; meaning: string; category: string }>>(
          StorageKeys.CHINESE_CHARACTERS_CACHE,
          []
        );
        setChineseCards(cached.map(c => ({
          id: `zh-${c.id}`,
          type: 'chinese' as CardType,
          category: c.category,
          front: c.character,
          back: c.meaning,
          meta: { pinyin: c.pinyin },
        })));
      } catch { /* ignore */ }
    });
    return unsub;
  }, []);

  const allCards: FlashCard[] = useMemo(() => {
    return [...chineseCards, ...bibleCards, ...customCards, ...ENGLISH_PHRASES];
  }, [chineseCards, bibleCards, customCards]);

  const categories = useMemo(() => Array.from(new Set(allCards.map(c => c.category))), [allCards]);

  const cardTypes = useMemo(() => Array.from(new Set(allCards.map(c => c.type))), [allCards]);

  const toggleMastered = useCallback((cardId: string) => {
    setProgress(prev => {
      const isMastered = prev.masteredIds.includes(cardId);
      const next: FlashCardProgress = {
        masteredIds: isMastered
          ? prev.masteredIds.filter(id => id !== cardId)
          : [...prev.masteredIds, cardId],
        lastPracticed: new Date().toISOString(),
      };
      saveToStorage(StorageKeys.FLASHCARD_PROGRESS, next);
      eventBus.publish(AppEvents.FLASHCARD_PROGRESS_CHANGED);
      return next;
    });
  }, []);

  const addBibleCards = useCallback((cards: FlashCard[]) => {
    setBibleCards(prev => {
      const existingIds = new Set(prev.map(c => c.id));
      const newCards = cards.filter(c => !existingIds.has(c.id));
      const next = [...prev, ...newCards];
      saveToStorage(StorageKeys.FLASHCARD_BIBLE_CARDS, next);
      eventBus.publish(AppEvents.FLASHCARD_PROGRESS_CHANGED);
      return next;
    });
  }, []);

  const addCustomCard = useCallback((card: Omit<FlashCard, 'id' | 'type'> & { type?: CardType }) => {
    const cardType = card.type || 'custom';
    const prefix = cardType === 'chinese' ? 'zh' : 'custom';
    const newCard: FlashCard = {
      ...card,
      id: `${prefix}-${Date.now()}`,
      type: cardType,
    };
    if (cardType === 'chinese') {
      setChineseCards(prev => [...prev, newCard]);
    } else {
      setCustomCards(prev => {
        const next = [...prev, newCard];
        saveToStorage(StorageKeys.FLASHCARD_CUSTOM_CARDS, next);
        return next;
      });
    }
    eventBus.publish(AppEvents.FLASHCARD_PROGRESS_CHANGED);
  }, []);

  const updateCard = useCallback((cardId: string, updates: { front: string; back: string; category: string }) => {
    setChineseCards(prev => {
      if (!prev.some(c => c.id === cardId)) return prev;
      return prev.map(c => c.id === cardId ? { ...c, ...updates } : c);
    });
    setCustomCards(prev => {
      if (!prev.some(c => c.id === cardId)) return prev;
      const next = prev.map(c => c.id === cardId ? { ...c, ...updates } : c);
      saveToStorage(StorageKeys.FLASHCARD_CUSTOM_CARDS, next);
      return next;
    });
    setBibleCards(prev => {
      if (!prev.some(c => c.id === cardId)) return prev;
      const next = prev.map(c => c.id === cardId ? { ...c, ...updates } : c);
      saveToStorage(StorageKeys.FLASHCARD_BIBLE_CARDS, next);
      return next;
    });
    eventBus.publish(AppEvents.FLASHCARD_PROGRESS_CHANGED);
  }, []);

  const deleteCard = useCallback((cardId: string) => {
    setChineseCards(prev => prev.filter(c => c.id !== cardId));
    setBibleCards(prev => {
      const next = prev.filter(c => c.id !== cardId);
      saveToStorage(StorageKeys.FLASHCARD_BIBLE_CARDS, next);
      return next;
    });
    setCustomCards(prev => {
      const next = prev.filter(c => c.id !== cardId);
      saveToStorage(StorageKeys.FLASHCARD_CUSTOM_CARDS, next);
      return next;
    });
    eventBus.publish(AppEvents.FLASHCARD_PROGRESS_CHANGED);
  }, []);

  const resetProgress = useCallback(() => {
    const next: FlashCardProgress = { masteredIds: [], lastPracticed: '' };
    setProgress(next);
    saveToStorage(StorageKeys.FLASHCARD_PROGRESS, next);
    eventBus.publish(AppEvents.FLASHCARD_PROGRESS_CHANGED);
  }, []);

  // Chinese character CRUD — stores in cache and publishes event
  const addChineseChar = useCallback(async (data: { character: string; pinyin: string; meaning: string; category: string }) => {
    const id = `${Date.now()}`;
    const cached = safeGetJSON<Array<{ id: string; character: string; pinyin: string; meaning: string; category: string }>>(
      StorageKeys.CHINESE_CHARACTERS_CACHE,
      []
    );
    cached.push({ id, ...data });
    saveToStorage(StorageKeys.CHINESE_CHARACTERS_CACHE, cached);
    eventBus.publish(AppEvents.CHINESE_CHARACTERS_CHANGED);
  }, []);

  const updateChineseChar = useCallback(async (id: string, data: { character: string; pinyin: string; meaning: string; category: string }) => {
    const cached = safeGetJSON<Array<{ id: string; character: string; pinyin: string; meaning: string; category: string }>>(
      StorageKeys.CHINESE_CHARACTERS_CACHE,
      []
    );
    const updated = cached.map(c => c.id === id ? { ...c, ...data } : c);
    saveToStorage(StorageKeys.CHINESE_CHARACTERS_CACHE, updated);
    eventBus.publish(AppEvents.CHINESE_CHARACTERS_CHANGED);
  }, []);

  const deleteChineseChar = useCallback(async (id: string) => {
    const cached = safeGetJSON<Array<{ id: string; character: string; pinyin: string; meaning: string; category: string }>>(
      StorageKeys.CHINESE_CHARACTERS_CACHE,
      []
    );
    const filtered = cached.filter(c => c.id !== id);
    saveToStorage(StorageKeys.CHINESE_CHARACTERS_CACHE, filtered);
    eventBus.publish(AppEvents.CHINESE_CHARACTERS_CHANGED);
  }, []);

  return {
    allCards,
    chineseCards,
    englishCards: ENGLISH_PHRASES,
    bibleCards,
    customCards,
    progress,
    loading,
    categories,
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
  };
}
