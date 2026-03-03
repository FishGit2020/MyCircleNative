import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock @mycircle/shared
jest.mock('@mycircle/shared', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  safeGetJSON: jest.fn((_key: string, fallback: any) => fallback ?? null),
  safeSetItem: jest.fn(),
  safeGetItem: jest.fn(() => null),
  StorageKeys: {
    BENCHMARK_HISTORY_CACHE: 'benchmark-history-cache',
  },
  eventBus: {
    subscribe: jest.fn(() => jest.fn()),
    publish: jest.fn(),
  },
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

import ModelBenchmarkScreen from '../src/ModelBenchmarkScreen';

describe('ModelBenchmarkScreen', () => {
  it('renders the title', () => {
    const { getByText } = render(<ModelBenchmarkScreen />);
    expect(getByText('benchmark.title')).toBeTruthy();
  });

  it('renders tabs', () => {
    const { getByText } = render(<ModelBenchmarkScreen />);
    expect(getByText('benchmark.results')).toBeTruthy();
    expect(getByText('benchmark.history')).toBeTruthy();
  });

  it('renders endpoint selection', () => {
    const { getByText } = render(<ModelBenchmarkScreen />);
    expect(getByText('benchmark.selectEndpoints')).toBeTruthy();
  });

  it('renders run button', () => {
    const { getByText } = render(<ModelBenchmarkScreen />);
    expect(getByText('benchmark.run')).toBeTruthy();
  });

  it('switches to history tab', () => {
    const { getByText } = render(<ModelBenchmarkScreen />);
    fireEvent.press(getByText('benchmark.history'));
    expect(getByText('benchmark.noHistory')).toBeTruthy();
  });
});
