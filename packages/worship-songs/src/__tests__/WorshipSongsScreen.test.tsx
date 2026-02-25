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
}));

// Mock the hooks
jest.mock('../hooks/useWorshipSongs', () => ({
  useWorshipSongs: jest.fn(() => ({
    songs: [],
    loading: false,
    isAuthenticated: false,
    addSong: jest.fn(),
    updateSong: jest.fn(),
    deleteSong: jest.fn(),
    getSong: jest.fn(),
    refresh: jest.fn(),
  })),
}));

// Mock the components - use require inside factory to avoid _ReactNativeCSSInterop error
jest.mock('../components', () => {
  const { Text } = require('react-native');
  return {
    SongList: () => require('react').createElement(Text, {}, 'SongList'),
    SongViewer: () => 'SongViewer',
    SongEditor: () => 'SongEditor',
  };
});

import WorshipSongsScreen from '../WorshipSongsScreen';

describe('WorshipSongsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders song list view by default', () => {
    render(<WorshipSongsScreen />);

    // Should render the SongList component and the refresh button
    expect(screen.getByText('SongList')).toBeTruthy();
  });
});
