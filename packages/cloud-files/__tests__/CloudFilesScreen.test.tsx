import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';

// Mock @mycircle/shared
jest.mock('@mycircle/shared', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  safeGetJSON: jest.fn((_key: string, fallback: any) => fallback ?? null),
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

// Mock @react-native-firebase/auth — simulate authenticated user
jest.mock('@react-native-firebase/auth', () => {
  const mockAuth = jest.fn(() => ({
    onAuthStateChanged: jest.fn((cb: (user: unknown) => void) => {
      cb({ uid: 'test-uid', email: 'test@test.com' });
      return jest.fn();
    }),
    currentUser: { uid: 'test-uid' },
  }));
  return { __esModule: true, default: mockAuth };
});

// Mock expo-document-picker
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  getInfoAsync: jest.fn(),
}));

import CloudFilesScreen from '../src/CloudFilesScreen';

describe('CloudFilesScreen', () => {
  it('renders the title', async () => {
    const { getByText } = render(<CloudFilesScreen />);
    await act(async () => {});
    expect(getByText('cloudFiles.title')).toBeTruthy();
  });

  it('renders tab buttons', async () => {
    const { getByText } = render(<CloudFilesScreen />);
    await act(async () => {});
    expect(getByText('cloudFiles.myFiles')).toBeTruthy();
    expect(getByText('cloudFiles.sharedFiles')).toBeTruthy();
  });

  it('shows empty state when no files', async () => {
    const { getByText } = render(<CloudFilesScreen />);
    await act(async () => {});
    expect(getByText('cloudFiles.noFiles')).toBeTruthy();
  });

  it('switches between tabs', async () => {
    const { getByText } = render(<CloudFilesScreen />);
    await act(async () => {});
    fireEvent.press(getByText('cloudFiles.sharedFiles'));
    expect(getByText('cloudFiles.noSharedFiles')).toBeTruthy();
  });
});
