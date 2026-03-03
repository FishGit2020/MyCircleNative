import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock @mycircle/shared
jest.mock('@mycircle/shared', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  safeGetJSON: jest.fn(() => null),
  safeSetItem: jest.fn(),
  safeGetItem: jest.fn(() => null),
  StorageKeys: {
    IMMIGRATION_CASES_CACHE: 'immigration-cases-cache',
  },
  eventBus: {
    subscribe: jest.fn(() => jest.fn()),
    publish: jest.fn(),
  },
  AppEvents: {
    IMMIGRATION_CASES_CHANGED: 'immigration-cases-changed',
  },
  CHECK_USCIS_STATUS: 'mock-query',
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock @apollo/client
jest.mock('@apollo/client', () => ({
  useMutation: () => [jest.fn(), { loading: false }],
  useQuery: () => ({ data: null, loading: false }),
}));

import ImmigrationTrackerScreen from '../src/ImmigrationTrackerScreen';

describe('ImmigrationTrackerScreen', () => {
  it('renders the title', () => {
    const { getByText } = render(<ImmigrationTrackerScreen />);
    expect(getByText('immigration.title')).toBeTruthy();
  });

  it('shows empty state when no cases', () => {
    const { getByText } = render(<ImmigrationTrackerScreen />);
    expect(getByText('immigration.noCases')).toBeTruthy();
  });

  it('renders add case button', () => {
    const { getByLabelText } = render(<ImmigrationTrackerScreen />);
    expect(getByLabelText('immigration.addCase')).toBeTruthy();
  });

  it('shows add case form when button pressed', () => {
    const { getByLabelText, getByText } = render(<ImmigrationTrackerScreen />);
    fireEvent.press(getByLabelText('immigration.addCase'));
    expect(getByText('immigration.receiptNumber')).toBeTruthy();
  });
});
