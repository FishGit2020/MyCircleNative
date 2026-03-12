import { useState, useCallback } from 'react';
import { useLazyQuery } from '@apollo/client';
import * as Location from 'expo-location';
import { GET_TRANSIT_NEARBY_STOPS } from '@mycircle/shared';
import type { TransitStop } from '../types';

export function useNearbyStops() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fetchNearby, { data }] = useLazyQuery(GET_TRANSIT_NEARBY_STOPS);

  const stops: TransitStop[] = data?.transitNearbyStops ?? [];

  const findNearby = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      await fetchNearby({
        variables: { lat: latitude, lon: longitude, radius: 500 },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get location');
    } finally {
      setLoading(false);
    }
  }, [fetchNearby]);

  return { stops, loading, error, findNearby };
}
