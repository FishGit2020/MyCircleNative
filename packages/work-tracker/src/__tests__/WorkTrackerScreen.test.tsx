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
jest.mock('../hooks/useWorkEntries', () => ({
  useWorkEntries: jest.fn(() => ({
    entries: [],
    loading: false,
    isAuthenticated: false,
    authChecked: true,
    addEntry: jest.fn(),
    updateEntry: jest.fn(),
    deleteEntry: jest.fn(),
  })),
}));

// Mock the components
jest.mock('../components', () => ({
  EntryForm: () => 'EntryForm',
  TimelineView: () => 'TimelineView',
}));

import WorkTrackerScreen from '../WorkTrackerScreen';
import { useWorkEntries } from '../hooks/useWorkEntries';

describe('WorkTrackerScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders sign-in wall for unauthenticated users', () => {
    (useWorkEntries as jest.Mock).mockReturnValue({
      entries: [],
      loading: false,
      isAuthenticated: false,
      authChecked: true,
      addEntry: jest.fn(),
      updateEntry: jest.fn(),
      deleteEntry: jest.fn(),
    });

    render(<WorkTrackerScreen />);

    expect(screen.getByText('workTracker.title')).toBeTruthy();
    expect(screen.getByText('workTracker.signInRequired')).toBeTruthy();
  });
});
