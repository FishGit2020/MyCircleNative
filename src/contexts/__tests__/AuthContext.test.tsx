import React from 'react';
import { Text } from 'react-native';
import { render, screen, waitFor } from '@testing-library/react-native';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('@mycircle/shared', () => ({
  useTranslation: () => ({ t: (key: string) => key, locale: 'en', setLocale: jest.fn() }),
  safeGetItem: jest.fn(() => null),
  safeSetItem: jest.fn(),
  safeGetJSON: jest.fn(() => null),
  safeRemoveItem: jest.fn(),
  eventBus: { subscribe: jest.fn(() => jest.fn()), publish: jest.fn() },
  StorageKeys: {
    TEMP_UNIT: 'tempUnit',
    SPEED_UNIT: 'speedUnit',
    THEME: 'theme',
    LOCALE: 'locale',
    WEATHER_ALERTS: 'weather-alerts-enabled',
    ANNOUNCEMENT_ALERTS: 'announcement-alerts-enabled',
    STOCK_WATCHLIST: 'stock-watchlist',
    PODCAST_SUBSCRIPTIONS: 'podcast-subscriptions',
    BABY_DUE_DATE: 'baby-due-date',
    BOTTOM_NAV_ORDER: 'bottom-nav-order',
    BIBLE_BOOKMARKS: 'bible-bookmarks',
    WORSHIP_FAVORITES: 'worship-favorites',
    CHILD_NAME: 'child-name',
    CHILD_BIRTH_DATE: 'child-birth-date',
  },
  WindowEvents: {
    UNITS_CHANGED: 'units-changed',
    WATCHLIST_CHANGED: 'watchlist-changed',
    SUBSCRIPTIONS_CHANGED: 'subscriptions-changed',
    BABY_DUE_DATE_CHANGED: 'baby-due-date-changed',
    BOTTOM_NAV_ORDER_CHANGED: 'bottom-nav-order-changed',
    NOTIFICATION_ALERTS_CHANGED: 'notification-alerts-changed',
    BIBLE_BOOKMARKS_CHANGED: 'bible-bookmarks-changed',
    WORSHIP_FAVORITES_CHANGED: 'worship-favorites-changed',
    WORSHIP_SONGS_CHANGED: 'worship-songs-changed',
    NOTEBOOK_CHANGED: 'notebook-changed',
    FLASHCARD_PROGRESS_CHANGED: 'flashcard-progress-changed',
    DAILY_LOG_CHANGED: 'daily-log-changed',
    CHILD_DATA_CHANGED: 'child-data-changed',
  },
  AppEvents: {},
  initStorage: jest.fn().mockResolvedValue(undefined),
}));

// Store a reference to the auth state callback so tests can control it
let authStateCallback: ((user: any) => void) | null = null;

jest.mock('../../firebase/config', () => {
  const mockAuth = jest.fn(() => ({
    onAuthStateChanged: jest.fn((cb: (user: any) => void) => {
      authStateCallback = cb;
      // Fire immediately with null to simulate initial check
      cb(null);
      return jest.fn(); // unsubscribe
    }),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: jest.fn(),
    currentUser: null,
  }));

  const mockFirestore = jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn().mockResolvedValue({ exists: false, data: () => null }),
        set: jest.fn().mockResolvedValue(undefined),
        update: jest.fn().mockResolvedValue(undefined),
      })),
    })),
  }));
  (mockFirestore as any).FieldValue = {
    serverTimestamp: jest.fn(() => new Date()),
    delete: jest.fn(),
  };

  return {
    auth: mockAuth,
    firestore: mockFirestore,
    messaging: jest.fn(() => ({})),
  };
});

// Import AFTER mocks
import { AuthProvider, useAuth } from '../AuthContext';

// ---------------------------------------------------------------------------
// Test consumer component
// ---------------------------------------------------------------------------

function AuthConsumer() {
  const { user, loading } = useAuth();
  return (
    <>
      <Text testID="user">{user ? user.email ?? 'no-email' : 'null'}</Text>
      <Text testID="loading">{String(loading)}</Text>
    </>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authStateCallback = null;
  });

  it('provides null user initially when no one is signed in', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    // The mock fires onAuthStateChanged(null) immediately, so after the
    // effect settles the user should be null and loading false.
    await waitFor(() => {
      expect(screen.getByTestId('user').props.children).toBe('null');
    });
  });

  it('loading becomes false after auth state check completes', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    // Once the auth state callback fires, loading should transition to false
    await waitFor(() => {
      expect(screen.getByTestId('loading').props.children).toBe('false');
    });
  });

  it('renders children without crashing', () => {
    const { toJSON } = render(
      <AuthProvider>
        <Text>child content</Text>
      </AuthProvider>,
    );

    // The provider should render its children
    expect(toJSON()).toBeTruthy();
  });

  it('throws when useAuth is used outside AuthProvider', () => {
    // Suppress console.error noise from React for the expected error
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<AuthConsumer />);
    }).toThrow('useAuth must be used within an AuthProvider');

    spy.mockRestore();
  });
});
