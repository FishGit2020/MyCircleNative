/**
 * Safe wrappers around AsyncStorage with sync in-memory cache.
 *
 * Unlike the web version which uses synchronous localStorage,
 * React Native uses AsyncStorage which is async. We maintain an
 * in-memory cache for synchronous reads (after initialisation).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// In-memory cache for synchronous reads
const cache = new Map<string, string>();
let initialised = false;

/**
 * Call once at app startup to hydrate the in-memory cache.
 * After this, safeGetItem reads are synchronous.
 */
export async function initStorage(keys: string[]): Promise<void> {
  try {
    const pairs = await AsyncStorage.multiGet(keys);
    for (const [key, value] of pairs) {
      if (value !== null) {
        cache.set(key, value);
      }
    }
    initialised = true;
  } catch {
    initialised = true;
  }
}

/** Synchronous read from in-memory cache. Returns null if not found. */
export function safeGetItem(key: string): string | null {
  return cache.get(key) ?? null;
}

/** Write to both in-memory cache and AsyncStorage. */
export function safeSetItem(key: string, value: string): void {
  cache.set(key, value);
  AsyncStorage.setItem(key, value).catch(() => {
    /* ignore — storage full or unavailable */
  });
}

/** Remove from both in-memory cache and AsyncStorage. */
export function safeRemoveItem(key: string): void {
  cache.delete(key);
  AsyncStorage.removeItem(key).catch(() => {});
}

/** Synchronous JSON read with fallback. */
export function safeGetJSON<T>(key: string, fallback: T): T {
  try {
    const raw = cache.get(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/** Async read directly from AsyncStorage (bypasses cache). */
export async function asyncGetItem(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Async JSON read directly from AsyncStorage. */
export async function asyncGetJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export { initialised as isStorageInitialised };
