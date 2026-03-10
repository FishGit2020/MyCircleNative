import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { en, allLocales, Locale, TranslationKey } from './translations';
import { StorageKeys } from '../utils/eventBus';
import { safeGetItem, safeSetItem } from '../utils/safeStorage';
import { getLocales } from 'expo-localization';

function getInitialLocale(): Locale {
  try {
    const stored = safeGetItem(StorageKeys.LOCALE);
    if (stored === 'en' || stored === 'es' || stored === 'zh') return stored;
  } catch { /* ignore */ }
  // Auto-detect from device locale preference list (first supported match wins)
  const supported: Record<string, Locale> = { en: 'en', es: 'es', zh: 'zh' };
  try {
    const deviceLocales = getLocales();
    for (const loc of deviceLocales) {
      const match = supported[loc.languageCode ?? ''];
      if (match) return match;
    }
  } catch { /* ignore — expo-localization may not be available in tests */ }
  return 'en';
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    safeSetItem(StorageKeys.LOCALE, newLocale);
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    const strings = allLocales[locale];
    return strings[key] ?? en[key] ?? key;
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    // Fallback for components outside I18nProvider
    return {
      locale: 'en' as Locale,
      setLocale: () => {},
      t: (key: TranslationKey) => en[key] ?? key,
    };
  }
  return context;
}
