import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_TRANSIT_ARRIVALS, GET_TRANSIT_STOP } from '@mycircle/shared';
import type { TransitArrival, TransitStop } from '../types';

export function useTransitArrivals(stopId: string | null) {
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const {
    data: arrivalsData,
    loading: arrivalsLoading,
    error: arrivalsError,
    refetch: refetchArrivals,
  } = useQuery(GET_TRANSIT_ARRIVALS, {
    variables: { stopId: stopId ?? '' },
    skip: !stopId,
    fetchPolicy: 'cache-and-network',
    onCompleted: () => {
      setLastUpdated(new Date().toLocaleTimeString());
    },
  });

  const {
    data: stopData,
    loading: stopLoading,
    error: stopError,
  } = useQuery(GET_TRANSIT_STOP, {
    variables: { stopId: stopId ?? '' },
    skip: !stopId,
    fetchPolicy: 'cache-and-network',
  });

  const refresh = async () => {
    if (stopId) {
      await refetchArrivals();
      setLastUpdated(new Date().toLocaleTimeString());
    }
  };

  const arrivals: TransitArrival[] = arrivalsData?.transitArrivals ?? [];
  const stop: TransitStop | null = stopData?.transitStop ?? null;
  const loading = arrivalsLoading || stopLoading;
  const error = arrivalsError || stopError;

  return { arrivals, stop, loading, error, refresh, lastUpdated };
}
