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
  GET_WEATHER: 'GET_WEATHER',
  GET_AIR_QUALITY: 'GET_AIR_QUALITY',
}));

// Mock Apollo Client - loading state
jest.mock('@apollo/client', () => ({
  useQuery: jest.fn(() => ({ data: null, loading: true, error: null, refetch: jest.fn() })),
  useLazyQuery: jest.fn(() => [jest.fn(), { data: null, loading: false }]),
  useMutation: jest.fn(() => [jest.fn(), { loading: false }]),
  gql: jest.fn((strings: TemplateStringsArray) => strings[0]),
}));

// Mock the useSelectedCity hook
jest.mock('../useSelectedCity', () => ({
  useSelectedCity: jest.fn(() => ({
    city: { name: 'New York', lat: 40.7128, lon: -74.006 },
    setCity: jest.fn(),
  })),
}));

// Mock the sub-components
jest.mock('../components', () => ({
  CurrentWeatherCard: () => 'CurrentWeatherCard',
  Forecast: () => 'Forecast',
  HourlyForecast: () => 'HourlyForecast',
  AirQuality: () => 'AirQuality',
  SunVisibility: () => 'SunVisibility',
  WhatToWear: () => 'WhatToWear',
}));

import WeatherScreen from '../WeatherScreen';

describe('WeatherScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    const { toJSON } = render(<WeatherScreen />);

    // In loading state, the skeleton UI is rendered (no actual data text)
    // The component renders a SafeAreaView with skeleton placeholders
    const tree = toJSON();
    expect(tree).toBeTruthy();
    // The loading state shows skeleton views (gray boxes), not the city name as text
    // Verify we don't see actual weather data components
    expect(screen.queryByText('CurrentWeatherCard')).toBeNull();
  });
});
