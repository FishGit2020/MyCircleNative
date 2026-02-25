import React from 'react';
import { render, screen } from '@testing-library/react-native';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock @mycircle/shared
jest.mock('@mycircle/shared', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: 'en',
    setLocale: jest.fn(),
  }),
  safeGetItem: jest.fn(() => null),
  safeSetItem: jest.fn(),
  safeGetJSON: jest.fn(() => null),
  safeRemoveItem: jest.fn(),
  eventBus: { subscribe: jest.fn(() => jest.fn()), publish: jest.fn() },
  StorageKeys: {
    TEMP_UNIT: 'tempUnit',
    SPEED_UNIT: 'speedUnit',
    THEME: 'theme',
    WEATHER_ALERTS: 'weather-alerts-enabled',
    ANNOUNCEMENT_ALERTS: 'announcement-alerts-enabled',
  },
  AppEvents: {
    UNITS_CHANGED: 'units-changed',
    NOTIFICATION_ALERTS_CHANGED: 'notification-alerts-changed',
  },
  WindowEvents: {},
  I18nProvider: ({ children }: any) => children,
  initStorage: jest.fn().mockResolvedValue(undefined),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: View,
    SafeAreaProvider: ({ children }: any) => children,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// Mock nativewind (colorScheme)
jest.mock('nativewind', () => ({
  colorScheme: { set: jest.fn() },
}));

// Keep references so tests can swap auth state
const mockSignOut = jest.fn();
const mockUpdateTempUnit = jest.fn();
const mockUpdateSpeedUnit = jest.fn();

let mockUser: { email: string; displayName: string } | null = {
  email: 'test@test.com',
  displayName: 'Test User',
};

jest.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    profile: null,
    loading: false,
    signOut: mockSignOut,
    updateTempUnit: mockUpdateTempUnit,
    updateSpeedUnit: mockUpdateSpeedUnit,
  }),
}));

const mockSetThemeMode = jest.fn();

jest.mock('../../src/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light',
    themeMode: 'system',
    setThemeMode: mockSetThemeMode,
    isDark: false,
  }),
  ThemeProvider: ({ children }: any) => children,
}));

// Import the component AFTER mocks are in place
import SettingsScreen from '../settings';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = { email: 'test@test.com', displayName: 'Test User' };
  });

  it('renders language selector with all three language options', () => {
    render(<SettingsScreen />);

    // The section header uses t('language.label')
    expect(screen.getByText('language.label')).toBeTruthy();

    // Each language option is rendered with its translated key
    expect(screen.getByText('language.en')).toBeTruthy();
    expect(screen.getByText('language.es')).toBeTruthy();
    expect(screen.getByText('language.zh')).toBeTruthy();
  });

  it('renders theme toggle with system, light, and dark options', () => {
    render(<SettingsScreen />);

    // The section header for Theme
    expect(screen.getByText('Theme')).toBeTruthy();

    // The three theme option labels
    expect(screen.getByText('System')).toBeTruthy();
    expect(screen.getByText('theme.light')).toBeTruthy();
    expect(screen.getByText('theme.dark')).toBeTruthy();
  });

  it('renders temperature unit toggle with Celsius and Fahrenheit options', () => {
    render(<SettingsScreen />);

    // The section header
    expect(screen.getByText('Temperature')).toBeTruthy();

    // Temperature unit options (Unicode degree symbol)
    expect(screen.getByText('\u00B0C')).toBeTruthy();
    expect(screen.getByText('\u00B0F')).toBeTruthy();
  });

  it('renders sign out button when user is authenticated', () => {
    render(<SettingsScreen />);

    // The sign out button label is t('auth.signOut') and appears in multiple
    // places (button text + accessibilityLabel), so query for at least one.
    const signOutElements = screen.getAllByText('auth.signOut');
    expect(signOutElements.length).toBeGreaterThanOrEqual(1);
  });

  it('does not render sign out button when user is null', () => {
    mockUser = null;
    render(<SettingsScreen />);

    // With no user there should be no sign out text
    expect(screen.queryByText('auth.signOut')).toBeNull();
  });

  it('renders the user profile section when authenticated', () => {
    render(<SettingsScreen />);

    // Display name and email should appear
    expect(screen.getByText('Test User')).toBeTruthy();
    expect(screen.getByText('test@test.com')).toBeTruthy();
  });

  it('renders speed unit options', () => {
    render(<SettingsScreen />);

    expect(screen.getByText('units.speed')).toBeTruthy();
    expect(screen.getByText('units.speedMs')).toBeTruthy();
    expect(screen.getByText('units.speedMph')).toBeTruthy();
    expect(screen.getByText('units.speedKmh')).toBeTruthy();
  });

  it('renders notification preference toggles', () => {
    render(<SettingsScreen />);

    expect(screen.getByText('notifications.preferences')).toBeTruthy();
    expect(screen.getByText('notifications.weatherAlerts')).toBeTruthy();
    expect(screen.getByText('notifications.announcementAlerts')).toBeTruthy();
  });

  it('renders the app version footer', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('MyCircle Native v1.0.0')).toBeTruthy();
  });
});
