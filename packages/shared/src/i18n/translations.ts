// Re-export types and all locale files synchronously.
// Files are ~2600 lines each — small enough that lazy-loading adds complexity
// (async errors, flash-of-English) without meaningful bundle savings.
export type { TranslationKey } from './locales/en';
export type Locale = 'en' | 'es' | 'zh';

import en from './locales/en';
import es from './locales/es';
import zh from './locales/zh';

export { en };

export const allLocales: Record<Locale, Record<string, string>> = { en, es, zh };
