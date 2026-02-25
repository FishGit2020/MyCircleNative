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
  MFEvents: {
    PODCAST_PLAY_EPISODE: 'podcastPlayEpisode',
  },
}));

// Mock Apollo Client
jest.mock('@apollo/client', () => ({
  useQuery: jest.fn(() => ({ data: null, loading: false, error: null, refetch: jest.fn() })),
  useLazyQuery: jest.fn(() => [jest.fn(), { data: null, loading: false }]),
  useMutation: jest.fn(() => [jest.fn(), { loading: false }]),
  gql: jest.fn((strings: TemplateStringsArray) => strings[0]),
}));

// Mock the hooks
jest.mock('../hooks/usePodcastData', () => ({
  usePodcastEpisodes: jest.fn(() => ({
    data: null,
    loading: false,
    error: null,
  })),
  useSubscriptions: jest.fn(() => ({
    subscribedIds: new Set(),
    toggleSubscribe: jest.fn(),
  })),
}));

// Mock the sub-components - use require inside factory
jest.mock('../components/PodcastSearch', () => {
  const { Text } = require('react-native');
  return function MockPodcastSearch() {
    return require('react').createElement(Text, {}, 'PodcastSearch');
  };
});

jest.mock('../components/TrendingPodcasts', () => {
  const { Text } = require('react-native');
  return function MockTrendingPodcasts() {
    return require('react').createElement(Text, {}, 'TrendingPodcasts');
  };
});

jest.mock('../components/SubscribedPodcasts', () => {
  const { Text } = require('react-native');
  return function MockSubscribedPodcasts() {
    return require('react').createElement(Text, {}, 'SubscribedPodcasts');
  };
});

jest.mock('../components/EpisodeList', () => {
  const { Text } = require('react-native');
  return function MockEpisodeList() {
    return require('react').createElement(Text, {}, 'EpisodeList');
  };
});

jest.mock('../components/AudioPlayer', () => {
  const { Text } = require('react-native');
  return function MockAudioPlayer() {
    return require('react').createElement(Text, {}, 'AudioPlayer');
  };
});

import PodcastsScreen from '../PodcastsScreen';

describe('PodcastsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders trending tab by default', () => {
    render(<PodcastsScreen />);

    // Should show the title
    expect(screen.getByText('podcasts.title')).toBeTruthy();
    // Should show the trending tab as active
    expect(screen.getByText('podcasts.trending')).toBeTruthy();
    // Should render TrendingPodcasts component
    expect(screen.getByText('TrendingPodcasts')).toBeTruthy();
  });
});
