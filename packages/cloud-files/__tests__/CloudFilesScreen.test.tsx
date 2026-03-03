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
    CLOUD_FILES_CACHE: 'cloud-files-cache',
  },
  eventBus: {
    subscribe: jest.fn(() => jest.fn()),
    publish: jest.fn(),
  },
  AppEvents: {
    CLOUD_FILES_CHANGED: 'cloud-files-changed',
  },
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

import CloudFilesScreen from '../src/CloudFilesScreen';

describe('CloudFilesScreen', () => {
  it('renders the title', () => {
    const { getByText } = render(<CloudFilesScreen />);
    expect(getByText('cloudFiles.title')).toBeTruthy();
  });

  it('renders tab buttons', () => {
    const { getByText } = render(<CloudFilesScreen />);
    expect(getByText('cloudFiles.myFiles')).toBeTruthy();
    expect(getByText('cloudFiles.sharedFiles')).toBeTruthy();
  });

  it('shows empty state when no files', () => {
    const { getByText } = render(<CloudFilesScreen />);
    expect(getByText('cloudFiles.noFiles')).toBeTruthy();
  });

  it('switches between tabs', () => {
    const { getByText } = render(<CloudFilesScreen />);
    fireEvent.press(getByText('cloudFiles.sharedFiles'));
    expect(getByText('cloudFiles.noSharedFiles')).toBeTruthy();
  });
});
