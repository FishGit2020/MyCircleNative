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
    CHILD_NAME: 'childName',
    CHILD_BIRTH_DATE: 'childBirthDate',
    CHILDREN_LIST: 'children-list',
    CHECKED_MILESTONES: 'checked-milestones',
  },
  AppEvents: {
    CHILD_DATA_CHANGED: 'childDataChanged',
    CHILDREN_LIST_CHANGED: 'childrenListChanged',
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

import ChildDevelopmentScreen from '../ChildDevelopmentScreen';
import { safeGetItem } from '@mycircle/shared';

describe('ChildDevelopmentScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders setup form when no child data is stored', () => {
    (safeGetItem as jest.Mock).mockReturnValue(null);

    render(<ChildDevelopmentScreen />);

    // Should show the title in the setup form
    expect(screen.getByText('childDev.title')).toBeTruthy();
    // Should show the subtitle
    expect(screen.getByText('childDev.subtitle')).toBeTruthy();
    // Should show the child name input label
    expect(screen.getByText('childDev.childName')).toBeTruthy();
    // Should show the birth date label
    expect(screen.getByText('childDev.birthDate')).toBeTruthy();
    // Should show get started button
    expect(screen.getByText('childDev.getStarted')).toBeTruthy();
  });

  it('renders timeline when child data exists in CHILDREN_LIST', () => {
    const child = { id: 'test1', name: 'Emma', birthDate: '2024-06-15' };
    // Must set up mock BEFORE render since loadChildren runs in useState initializer
    const mockGetItem = safeGetItem as jest.Mock;
    mockGetItem.mockImplementation((key: string) => {
      if (key === 'children-list') return JSON.stringify([child]);
      return null;
    });

    const { unmount } = render(<ChildDevelopmentScreen />);

    // Should show the child's name in the main view (appears in selector and header)
    expect(screen.getAllByText('Emma').length).toBeGreaterThanOrEqual(1);
    // Should show the edit and delete buttons
    expect(screen.getByText('children.editChild')).toBeTruthy();
    expect(screen.getByText('children.deleteChild')).toBeTruthy();

    unmount();
  });
});
