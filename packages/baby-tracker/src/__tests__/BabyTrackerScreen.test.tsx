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
    BABY_DUE_DATE: 'babyDueDate',
  },
  AppEvents: {
    BABY_DUE_DATE_CHANGED: 'babyDueDateChanged',
  },
  GET_BIBLE_PASSAGE: 'GET_BIBLE_PASSAGE',
}));

// Mock Apollo Client
jest.mock('@apollo/client', () => ({
  useQuery: jest.fn(() => ({ data: null, loading: false, error: null, refetch: jest.fn() })),
  useLazyQuery: jest.fn(() => [jest.fn(), { data: null, loading: false }]),
  useMutation: jest.fn(() => [jest.fn(), { loading: false }]),
  gql: jest.fn((strings: TemplateStringsArray) => strings[0]),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: View,
    SafeAreaProvider: ({ children }: any) => children,
  };
});

import BabyTrackerScreen from '../BabyTrackerScreen';

describe('BabyTrackerScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<BabyTrackerScreen />);
    // The screen should render and display the title
    expect(screen.getByText('baby.title')).toBeTruthy();
  });

  it('shows the due date section', () => {
    render(<BabyTrackerScreen />);
    expect(screen.getByText('baby.dueDate')).toBeTruthy();
  });

  it('shows no-due-date message initially when no due date is set', () => {
    render(<BabyTrackerScreen />);
    expect(screen.getByText('baby.noDueDate')).toBeTruthy();
  });

  it('shows the subtitle text', () => {
    render(<BabyTrackerScreen />);
    expect(screen.getByText('baby.subtitle')).toBeTruthy();
  });

  it('shows the due date placeholder when no date is set', () => {
    render(<BabyTrackerScreen />);
    expect(screen.getByText('baby.dueDatePlaceholder')).toBeTruthy();
  });
});
