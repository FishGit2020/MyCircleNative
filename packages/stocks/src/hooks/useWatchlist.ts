import { useState, useCallback, useEffect } from 'react';
import {
  StorageKeys,
  WindowEvents,
  eventBus,
  safeGetJSON,
  safeSetItem,
} from '@mycircle/shared';

export interface WatchlistItem {
  symbol: string;
  companyName: string;
}

/**
 * Custom hook managing the stock watchlist backed by AsyncStorage.
 *
 * Reads the initial list synchronously from the in-memory cache
 * (populated by `initStorage` at app startup) and persists every
 * mutation back to AsyncStorage. Publishes `WATCHLIST_CHANGED` on
 * the shared event bus so other features can react.
 */
export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() =>
    safeGetJSON<WatchlistItem[]>(StorageKeys.STOCK_WATCHLIST, []),
  );

  // Persist to AsyncStorage and notify other features whenever the list changes.
  useEffect(() => {
    safeSetItem(StorageKeys.STOCK_WATCHLIST, JSON.stringify(watchlist));
    eventBus.publish(WindowEvents.WATCHLIST_CHANGED);
  }, [watchlist]);

  const addToWatchlist = useCallback(
    (symbol: string, companyName: string) => {
      setWatchlist((prev) => {
        if (prev.some((item) => item.symbol === symbol)) return prev;
        return [...prev, { symbol, companyName }];
      });
    },
    [],
  );

  const removeFromWatchlist = useCallback((symbol: string) => {
    setWatchlist((prev) => prev.filter((item) => item.symbol !== symbol));
  }, []);

  return { watchlist, addToWatchlist, removeFromWatchlist } as const;
}
