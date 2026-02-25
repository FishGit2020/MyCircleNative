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
jest.mock('../hooks/useCitySearch', () => ({
  useCitySearch: jest.fn(() => ({
    query: '',
    setQuery: jest.fn(),
    loading: false,
    geoLoading: false,
    geoError: null,
    matchingRecents: [],
    filteredResults: [],
    fuzzySuggestions: [],
    showSearchResults: false,
    showFuzzySuggestions: false,
    showNoResults: false,
    showDropdown: false,
    isShowingRecent: false,
    dropdownCities: [],
    handleCitySelect: jest.fn(),
    handleClearAllRecents: jest.fn(),
    handleRemoveCity: jest.fn(),
    handleUseMyLocation: jest.fn(),
  })),
  formatTimeAgo: jest.fn(() => '5 min ago'),
}));

// Mock the WeatherPreview component
jest.mock('../components', () => ({
  WeatherPreview: () => 'WeatherPreview',
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: View,
    SafeAreaProvider: ({ children }: any) => children,
  };
});

import CitySearchScreen from '../CitySearchScreen';

describe('CitySearchScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input', () => {
    render(<CitySearchScreen />);

    // The search input should have the placeholder
    expect(screen.getByPlaceholderText('search.placeholder')).toBeTruthy();
  });

  it('renders header with search title', () => {
    render(<CitySearchScreen />);

    expect(screen.getByText('search.search')).toBeTruthy();
  });
});
