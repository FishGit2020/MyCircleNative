import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { colorScheme } from 'nativewind';
import { StorageKeys } from '@mycircle/shared';
import { safeGetItem, safeSetItem } from '@mycircle/shared';

type Theme = 'light' | 'dark';
type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  /** The resolved theme: always 'light' or 'dark' */
  theme: Theme;
  /** The user's preference: 'light', 'dark', or 'system' */
  themeMode: ThemeMode;
  /** Update the user's theme preference */
  setThemeMode: (mode: ThemeMode) => void;
  /** Convenience boolean for dark mode checks */
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Resolve the effective theme given a user preference and the OS color scheme.
 */
function resolveTheme(mode: ThemeMode, systemScheme: 'light' | 'dark' | null | undefined): Theme {
  if (mode === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }
  return mode;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useRNColorScheme();

  // Initialise from AsyncStorage (synchronous read via safeGetItem).
  // safeGetItem may return null on first launch — default to 'system'.
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const stored = safeGetItem(StorageKeys.THEME) as ThemeMode | null;
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
    return 'system';
  });

  const theme = resolveTheme(themeMode, systemScheme);
  const isDark = theme === 'dark';

  // Persist preference and sync NativeWind whenever themeMode or system scheme changes
  useEffect(() => {
    safeSetItem(StorageKeys.THEME, themeMode);

    // NativeWind's colorScheme.set() drives Tailwind dark: variants in RN
    colorScheme.set(theme);
  }, [themeMode, theme]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
