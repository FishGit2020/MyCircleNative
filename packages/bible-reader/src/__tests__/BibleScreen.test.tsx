import React from 'react';
import { render, screen } from '@testing-library/react-native';

// Mock the shared package
jest.mock('@mycircle/shared', () => ({
  useTranslation: () => ({ t: (key: string) => key, locale: 'en', setLocale: jest.fn() }),
  safeGetItem: jest.fn(() => null),
  safeSetItem: jest.fn(),
  safeGetJSON: jest.fn((_key: string, fallback: any) => fallback ?? null),
  safeRemoveItem: jest.fn(),
  eventBus: { subscribe: jest.fn(() => jest.fn()), publish: jest.fn() },
  StorageKeys: {
    BIBLE_LAST_READ: 'bibleLastRead',
    BIBLE_BOOKMARKS: 'bibleBookmarks',
  },
  AppEvents: {},
  GET_BIBLE_PASSAGE: 'GET_BIBLE_PASSAGE',
}));

// Mock Apollo Client
jest.mock('@apollo/client', () => ({
  useQuery: jest.fn(() => ({ data: null, loading: false, error: null, refetch: jest.fn() })),
  useLazyQuery: jest.fn(() => [jest.fn(), { data: null, loading: false }]),
  useMutation: jest.fn(() => [jest.fn(), { loading: false }]),
  gql: jest.fn((strings: TemplateStringsArray) => strings[0]),
}));

// Mock the sub-components - use require inside factory
jest.mock('../components', () => {
  const { Text } = require('react-native');
  const mockReact = require('react');
  return {
    VerseOfDay: () => mockReact.createElement(Text, {}, 'VerseOfDay'),
    BookGrid: () => mockReact.createElement(Text, {}, 'BookGrid'),
    ChapterGrid: () => mockReact.createElement(Text, {}, 'ChapterGrid'),
    PassageView: () => mockReact.createElement(Text, {}, 'PassageView'),
    DailyDevotional: () => mockReact.createElement(Text, {}, 'DailyDevotional'),
    TranslationPicker: () => null,
  };
});

// Mock the data
jest.mock('../data/books', () => ({
  BIBLE_BOOKS: [
    { name: 'Genesis', chapters: 50 },
    { name: 'Exodus', chapters: 40 },
    { name: 'Psalms', chapters: 150 },
  ],
}));

import BibleScreen from '../BibleScreen';

describe('BibleScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders book selection', () => {
    render(<BibleScreen />);

    // Should show the read scripture header
    expect(screen.getByText('bible.readScripture')).toBeTruthy();
    // Should render the BookGrid component
    expect(screen.getByText('BookGrid')).toBeTruthy();
    // Should render VerseOfDay
    expect(screen.getByText('VerseOfDay')).toBeTruthy();
  });
});
