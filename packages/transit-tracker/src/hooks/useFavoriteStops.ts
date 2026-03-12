import { useState, useCallback } from 'react';
import {
  safeGetItem,
  safeSetItem,
  StorageKeys,
  AppEvents,
  eventBus,
} from '@mycircle/shared';
import type { TransitStop } from '../types';

function loadFavorites(): TransitStop[] {
  try {
    const raw = safeGetItem(StorageKeys.TRANSIT_FAVORITES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useFavoriteStops() {
  const [favorites, setFavorites] = useState<TransitStop[]>(loadFavorites);

  const isFavorite = useCallback(
    (stopId: string) => favorites.some((s) => s.id === stopId),
    [favorites],
  );

  const toggleFavorite = useCallback(
    (stop: TransitStop) => {
      const exists = favorites.some((s) => s.id === stop.id);
      const updated = exists
        ? favorites.filter((s) => s.id !== stop.id)
        : [...favorites, stop];

      setFavorites(updated);
      safeSetItem(StorageKeys.TRANSIT_FAVORITES, JSON.stringify(updated));
      eventBus.publish(AppEvents.TRANSIT_FAVORITES_CHANGED);
    },
    [favorites],
  );

  return { favorites, isFavorite, toggleFavorite };
}
