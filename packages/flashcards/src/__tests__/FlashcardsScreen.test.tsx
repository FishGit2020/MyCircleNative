import React from 'react';
import { render, screen } from '@testing-library/react-native';

// Mock the shared package
jest.mock('@mycircle/shared', () => ({
  useTranslation: () => ({ t: (key: string) => key, locale: 'en', setLocale: jest.fn() }),
  safeGetItem: jest.fn(() => null),
  safeSetItem: jest.fn(),
  safeGetJSON: jest.fn(() => null),
  safeRemoveItem: jest.fn(),
  eventBus: { subscribe: jest.fn(() => jest.fn()), publish: jest.fn() },
  StorageKeys: {
    FLASHCARD_TYPE_FILTER: 'flashcardTypeFilter',
  },
  AppEvents: {},
  createLogger: jest.fn(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

// Mock Apollo Client
jest.mock('@apollo/client', () => ({
  useQuery: jest.fn(() => ({ data: null, loading: false, error: null, refetch: jest.fn() })),
  useLazyQuery: jest.fn(() => [jest.fn(), { data: null, loading: false }]),
  useMutation: jest.fn(() => [jest.fn(), { loading: false }]),
  gql: jest.fn((strings: TemplateStringsArray) => strings[0]),
}));

// Mock the hooks
jest.mock('../hooks/useFlashCards', () => ({
  useFlashCards: jest.fn(() => ({
    allCards: [
      { id: '1', type: 'chinese', category: 'phrases', front: 'hello', back: 'world', meta: {} },
      { id: '2', type: 'english', category: 'greetings', front: 'hi', back: 'there', meta: {} },
    ],
    progress: { masteredIds: [] },
    loading: false,
    cardTypes: ['chinese', 'english'],
    toggleMastered: jest.fn(),
    addBibleCards: jest.fn(),
    addCustomCard: jest.fn(),
    updateCard: jest.fn(),
    deleteCard: jest.fn(),
    resetProgress: jest.fn(),
    addChineseChar: jest.fn(),
    updateChineseChar: jest.fn(),
    deleteChineseChar: jest.fn(),
  })),
}));

// Mock the sub-components - use require inside factory
jest.mock('../components/CardGrid', () => {
  const { Text } = require('react-native');
  return function MockCardGrid() {
    return require('react').createElement(Text, {}, 'CardGrid');
  };
});

jest.mock('../components/CardPractice', () => {
  return function MockCardPractice() {
    return null;
  };
});

jest.mock('../components/AddCardModal', () => {
  return function MockAddCardModal() {
    return null;
  };
});

jest.mock('../components/BibleVersePicker', () => {
  return function MockBibleVersePicker() {
    return null;
  };
});

jest.mock('../components/QuizView', () => {
  return function MockQuizView() {
    return null;
  };
});

jest.mock('../components/CharacterEditor', () => {
  return function MockCharacterEditor() {
    return null;
  };
});

import FlashcardsScreen from '../FlashcardsScreen';

describe('FlashcardsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders main screen with filter chips', () => {
    render(<FlashcardsScreen />);

    // Should show the title
    expect(screen.getByText('flashcards.title')).toBeTruthy();
    // Should show the subtitle
    expect(screen.getByText('flashcards.subtitle')).toBeTruthy();
    // Should show the Practice All button
    expect(screen.getByText('flashcards.practiceAll')).toBeTruthy();
    // Should render the CardGrid
    expect(screen.getByText('CardGrid')).toBeTruthy();
  });
});
