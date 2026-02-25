import React from 'react';
import { Text, Pressable } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('@mycircle/shared', () => ({
  StorageKeys: { THEME: 'theme' },
  safeGetItem: jest.fn(() => null),
  safeSetItem: jest.fn(),
}));

jest.mock('nativewind', () => ({
  colorScheme: { set: jest.fn() },
}));

// Import AFTER mocks
import { ThemeProvider, useTheme } from '../ThemeContext';

// ---------------------------------------------------------------------------
// Test consumer component — reads and exposes context values
// ---------------------------------------------------------------------------

function ThemeConsumer() {
  const { theme, themeMode, setThemeMode, isDark } = useTheme();
  return (
    <>
      <Text testID="theme">{theme}</Text>
      <Text testID="themeMode">{themeMode}</Text>
      <Text testID="isDark">{String(isDark)}</Text>
      <Pressable testID="setLight" onPress={() => setThemeMode('light')} />
      <Pressable testID="setDark" onPress={() => setThemeMode('dark')} />
      <Pressable testID="setSystem" onPress={() => setThemeMode('system')} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: safeGetItem returns null (no stored preference)
    const { safeGetItem } = require('@mycircle/shared');
    (safeGetItem as jest.Mock).mockReturnValue(null);
  });

  it('provides default theme mode as system', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('themeMode').props.children).toBe('system');
  });

  it('resolves to light theme when system scheme is light (default)', () => {
    // useColorScheme returns 'light' by default in jest-expo
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('theme').props.children).toBe('light');
    expect(screen.getByTestId('isDark').props.children).toBe('false');
  });

  it('setThemeMode updates themeMode to dark', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    // Initially system
    expect(screen.getByTestId('themeMode').props.children).toBe('system');

    // Switch to dark
    fireEvent.press(screen.getByTestId('setDark'));

    expect(screen.getByTestId('themeMode').props.children).toBe('dark');
    expect(screen.getByTestId('theme').props.children).toBe('dark');
  });

  it('isDark is true when theme is dark', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    fireEvent.press(screen.getByTestId('setDark'));

    expect(screen.getByTestId('isDark').props.children).toBe('true');
  });

  it('setThemeMode updates themeMode to light', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    // Switch to dark first, then back to light
    fireEvent.press(screen.getByTestId('setDark'));
    expect(screen.getByTestId('theme').props.children).toBe('dark');

    fireEvent.press(screen.getByTestId('setLight'));
    expect(screen.getByTestId('theme').props.children).toBe('light');
    expect(screen.getByTestId('isDark').props.children).toBe('false');
  });

  it('reads stored theme preference from safeGetItem on mount', () => {
    const { safeGetItem } = require('@mycircle/shared');
    (safeGetItem as jest.Mock).mockReturnValue('dark');

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('themeMode').props.children).toBe('dark');
    expect(screen.getByTestId('theme').props.children).toBe('dark');
    expect(screen.getByTestId('isDark').props.children).toBe('true');
  });

  it('throws when useTheme is used outside ThemeProvider', () => {
    // Suppress console.error noise from React for the expected error
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<ThemeConsumer />);
    }).toThrow('useTheme must be used within a ThemeProvider');

    spy.mockRestore();
  });
});
