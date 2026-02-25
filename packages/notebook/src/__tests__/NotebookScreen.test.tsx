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
  StorageKeys: {},
  AppEvents: {},
  WindowEvents: {},
}));

// Mock firebase auth - return null user (unauthenticated)
jest.mock('@react-native-firebase/auth', () => {
  const mockAuth = jest.fn(() => ({
    currentUser: null,
    onAuthStateChanged: jest.fn((cb: any) => {
      cb(null);
      return jest.fn();
    }),
  }));
  return { __esModule: true, default: mockAuth };
});

// Mock the hooks
jest.mock('../hooks/useNotes', () => ({
  useNotes: jest.fn(() => ({
    notes: [],
    loading: false,
    error: null,
    saveNote: jest.fn(),
    deleteNote: jest.fn(),
    reload: jest.fn(),
  })),
}));

jest.mock('../hooks/usePublicNotes', () => ({
  usePublicNotes: jest.fn(() => ({
    notes: [],
    loading: false,
    error: null,
    publishNote: jest.fn(),
    updateNote: jest.fn(),
    deleteNote: jest.fn(),
    reload: jest.fn(),
  })),
}));

// Mock the components
jest.mock('../components', () => ({
  NoteList: () => 'NoteList',
  NoteEditor: () => 'NoteEditor',
  NoteCard: () => 'NoteCard',
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: View,
    SafeAreaProvider: ({ children }: any) => children,
  };
});

import NotebookScreen from '../NotebookScreen';

describe('NotebookScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders auth wall for unauthenticated users', () => {
    render(<NotebookScreen />);

    expect(screen.getByText('notebook.loginToUse')).toBeTruthy();
  });
});
