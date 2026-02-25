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

// Mock Apollo Client
jest.mock('@apollo/client', () => ({
  useQuery: jest.fn(() => ({ data: null, loading: false, error: null, refetch: jest.fn() })),
  useLazyQuery: jest.fn(() => [jest.fn(), { data: null, loading: false }]),
  useMutation: jest.fn(() => [jest.fn(), { loading: false }]),
  gql: jest.fn((strings: TemplateStringsArray) => strings[0]),
}));

// Mock the hooks
jest.mock('../hooks/useWatchlist', () => ({
  useWatchlist: jest.fn(() => ({
    watchlist: [],
    addToWatchlist: jest.fn(),
    removeFromWatchlist: jest.fn(),
  })),
}));

// Mock the sub-components - use require inside factory
jest.mock('../components', () => {
  const { Text } = require('react-native');
  const mockReact = require('react');
  return {
    StockSearch: () => mockReact.createElement(Text, {}, 'StockSearch'),
    Watchlist: () => mockReact.createElement(Text, {}, 'Watchlist'),
    CryptoSection: () => mockReact.createElement(Text, {}, 'CryptoSection'),
    CompanyNews: () => mockReact.createElement(Text, {}, 'CompanyNews'),
  };
});

import StocksScreen from '../StocksScreen';

describe('StocksScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders watchlist section', () => {
    render(<StocksScreen />);

    // Should show the title
    expect(screen.getByText('stocks.title')).toBeTruthy();
    // Should show the watchlist section header
    expect(screen.getByText('stocks.watchlist')).toBeTruthy();
    // Should render the Watchlist component
    expect(screen.getByText('Watchlist')).toBeTruthy();
  });
});
