import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLazyQuery } from '@apollo/client';
import * as Location from 'expo-location';
import {
  SEARCH_CITIES,
  REVERSE_GEOCODE,
  useTranslation,
  fuzzySearchCities,
  eventBus,
  MFEvents,
  StorageKeys,
  safeGetItem,
  safeSetItem,
} from '@mycircle/shared';
import type { City } from '@mycircle/shared';

// ── Static data for fuzzy fallback ────────────────────────────
interface StaticCity {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

const MAJOR_CITIES: StaticCity[] = [
  { name: 'New York', country: 'US', state: 'New York', lat: 40.71, lon: -74.01 },
  { name: 'Los Angeles', country: 'US', state: 'California', lat: 34.05, lon: -118.24 },
  { name: 'Chicago', country: 'US', state: 'Illinois', lat: 41.88, lon: -87.63 },
  { name: 'Houston', country: 'US', state: 'Texas', lat: 29.76, lon: -95.37 },
  { name: 'Phoenix', country: 'US', state: 'Arizona', lat: 33.45, lon: -112.07 },
  { name: 'London', country: 'GB', lat: 51.51, lon: -0.13 },
  { name: 'Tokyo', country: 'JP', lat: 35.68, lon: 139.69 },
  { name: 'Paris', country: 'FR', lat: 48.86, lon: 2.35 },
  { name: 'Sydney', country: 'AU', state: 'New South Wales', lat: -33.87, lon: 151.21 },
  { name: 'Berlin', country: 'DE', lat: 52.52, lon: 13.41 },
  { name: 'Toronto', country: 'CA', state: 'Ontario', lat: 43.65, lon: -79.38 },
  { name: 'Mexico City', country: 'MX', lat: 19.43, lon: -99.13 },
  { name: 'Mumbai', country: 'IN', state: 'Maharashtra', lat: 19.08, lon: 72.88 },
  { name: 'Beijing', country: 'CN', lat: 39.90, lon: 116.40 },
  { name: 'Seoul', country: 'KR', lat: 37.57, lon: 126.98 },
  { name: 'Singapore', country: 'SG', lat: 1.35, lon: 103.82 },
  { name: 'Dubai', country: 'AE', lat: 25.20, lon: 55.27 },
  { name: 'San Francisco', country: 'US', state: 'California', lat: 37.77, lon: -122.42 },
  { name: 'Miami', country: 'US', state: 'Florida', lat: 25.76, lon: -80.19 },
  { name: 'Denver', country: 'US', state: 'Colorado', lat: 39.74, lon: -104.99 },
];

// ── Popular cities shown when no recents exist ────────────────
export interface RecentCity {
  id: string;
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
  searchedAt?: number;
}

export const POPULAR_CITIES: RecentCity[] = [
  { id: '40.71,-74.01', name: 'New York', country: 'US', state: 'New York', lat: 40.7128, lon: -74.006 },
  { id: '51.51,-0.13', name: 'London', country: 'GB', lat: 51.5074, lon: -0.1278 },
  { id: '35.68,139.69', name: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503 },
  { id: '48.86,2.35', name: 'Paris', country: 'FR', lat: 48.8566, lon: 2.3522 },
  { id: '-33.87,151.21', name: 'Sydney', country: 'AU', state: 'New South Wales', lat: -33.8688, lon: 151.2093 },
];

const MAX_LOCAL_RECENTS = 10;

// ── GraphQL response types ────────────────────────────────────
interface SearchCitiesResponse {
  searchCities: City[];
}

interface ReverseGeocodeResponse {
  reverseGeocode: City | null;
}

// ── Helper: format relative time ──────────────────────────────
export function formatTimeAgo(timestamp?: number): string {
  if (!timestamp) return '';
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return '<1m';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

// ── Storage helpers ───────────────────────────────────────────
function loadLocalRecents(): RecentCity[] {
  try {
    const stored = safeGetItem(StorageKeys.RECENT_CITIES);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLocalRecents(cities: RecentCity[]) {
  try {
    safeSetItem(StorageKeys.RECENT_CITIES, JSON.stringify(cities.slice(0, MAX_LOCAL_RECENTS)));
  } catch {
    /* ignore */
  }
}

// ── Main hook ─────────────────────────────────────────────────
export interface UseCitySearchOptions {
  onCitySelect?: (city: City) => void;
  recentCities?: RecentCity[];
  onRemoveCity?: (cityId: string) => void;
  onClearRecents?: () => void;
}

export function useCitySearch(options: UseCitySearchOptions = {}) {
  const { onCitySelect, recentCities = [], onRemoveCity, onClearRecents } = options;
  const { t } = useTranslation();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<City[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [localRecents, setLocalRecents] = useState<RecentCity[]>(loadLocalRecents);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Apollo queries
  const [searchCities, { loading, data }] = useLazyQuery<SearchCitiesResponse>(SEARCH_CITIES);
  const [reverseGeocode] = useLazyQuery<ReverseGeocodeResponse>(REVERSE_GEOCODE);

  const hasAuthRecents = recentCities.length > 0;

  // Merge prop-based recents (Firebase) with local recents (AsyncStorage)
  const allRecents = useMemo(() => {
    if (recentCities.length > 0) return recentCities;
    return localRecents;
  }, [recentCities, localRecents]);

  // Sync API results to local state
  useEffect(() => {
    if (data?.searchCities) {
      setResults(data.searchCities);
    }
  }, [data]);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      searchCities({ variables: { query, limit: 5 } });
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, searchCities]);

  // Filter recent cities matching query for inline display
  const matchingRecents = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return allRecents
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q) ||
          (c.state && c.state.toLowerCase().includes(q)),
      )
      .slice(0, 3);
  }, [query, allRecents]);

  // Deduplicate: remove matching recents from API results
  const filteredResults = useMemo(() => {
    if (matchingRecents.length === 0) return results;
    const recentIds = new Set(matchingRecents.map((c) => c.id));
    return results.filter((r) => !recentIds.has(r.id));
  }, [results, matchingRecents]);

  // Fuzzy search fallback when API returns 0 results
  const fuzzySuggestions = useMemo(() => {
    if (query.length >= 2 && !loading && results.length === 0 && data?.searchCities !== undefined) {
      return fuzzySearchCities(MAJOR_CITIES, query, 5).map((city) => ({
        ...city,
        id: `${city.lat.toFixed(2)},${city.lon.toFixed(2)}`,
      }));
    }
    return [];
  }, [query, loading, results, data]);

  // Add city to local recents
  const addToLocalRecents = useCallback((city: City | RecentCity) => {
    setLocalRecents((prev) => {
      const id = city.id || `${city.lat},${city.lon}`;
      const filtered = prev.filter((c) => c.id !== id);
      const updated: RecentCity[] = [
        {
          id,
          name: city.name,
          country: city.country,
          state: city.state,
          lat: city.lat,
          lon: city.lon,
          searchedAt: Date.now(),
        },
        ...filtered,
      ].slice(0, MAX_LOCAL_RECENTS);
      saveLocalRecents(updated);
      return updated;
    });
  }, []);

  // Handle city selection
  const handleCitySelect = useCallback(
    (city: City | RecentCity) => {
      eventBus.publish(MFEvents.CITY_SELECTED, {
        city: {
          id: city.id,
          name: city.name,
          lat: city.lat,
          lon: city.lon,
          country: city.country,
          state: city.state,
        },
      });
      addToLocalRecents(city);

      if (onCitySelect) {
        onCitySelect(city as City);
      }

      setQuery('');
      setResults([]);
      setGeoError(null);
    },
    [onCitySelect, addToLocalRecents],
  );

  // Clear all recents
  const handleClearAllRecents = useCallback(() => {
    if (hasAuthRecents && onClearRecents) {
      onClearRecents();
    }
    setLocalRecents([]);
    saveLocalRecents([]);
  }, [hasAuthRecents, onClearRecents]);

  // Remove individual recent city
  const handleRemoveCity = useCallback(
    (cityId: string) => {
      if (hasAuthRecents && onRemoveCity) {
        onRemoveCity(cityId);
      } else {
        setLocalRecents((prev) => {
          const updated = prev.filter((c) => c.id !== cityId);
          saveLocalRecents(updated);
          return updated;
        });
      }
    },
    [hasAuthRecents, onRemoveCity],
  );

  // Use my location
  const handleUseMyLocation = useCallback(async () => {
    setGeoError(null);
    setGeoLoading(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGeoLoading(false);
        setGeoError(t('search.locationPermissionDenied'));
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      const { data: geoData } = await reverseGeocode({
        variables: { lat: latitude, lon: longitude },
      });

      setGeoLoading(false);

      if (geoData?.reverseGeocode) {
        handleCitySelect(geoData.reverseGeocode);
      } else {
        setGeoError(t('search.couldNotDetermineLocation'));
      }
    } catch (err: any) {
      setGeoLoading(false);
      if (err?.code === 'ERR_LOCATION_SETTINGS_UNSATISFIED') {
        setGeoError(t('search.locationUnavailable'));
      } else {
        setGeoError(t('search.unableToGetLocation'));
      }
    }
  }, [reverseGeocode, handleCitySelect, t]);

  // Derive display states
  const isSearching = query.length >= 2;
  const hasInlineRecents = matchingRecents.length > 0 && !loading;
  const showSearchResults = (filteredResults.length > 0 || hasInlineRecents) && !loading;
  const showFuzzySuggestions = fuzzySuggestions.length > 0 && !loading && !showSearchResults;
  const showNoResults =
    isSearching &&
    !loading &&
    results.length === 0 &&
    data?.searchCities !== undefined &&
    fuzzySuggestions.length === 0 &&
    matchingRecents.length === 0;
  const showDropdown = !isSearching && !loading && results.length === 0;
  const isShowingRecent = allRecents.length > 0;
  const dropdownCities = isShowingRecent ? allRecents.slice(0, 5) : POPULAR_CITIES;

  return {
    query,
    setQuery,
    loading,
    geoLoading,
    geoError,
    allRecents,
    matchingRecents,
    filteredResults,
    fuzzySuggestions,
    isSearching,
    showSearchResults,
    showFuzzySuggestions,
    showNoResults,
    showDropdown,
    isShowingRecent,
    dropdownCities,
    handleCitySelect,
    handleClearAllRecents,
    handleRemoveCity,
    handleUseMyLocation,
  };
}
