import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useTranslation,
  safeGetItem,
  safeSetItem,
  StorageKeys,
} from '@mycircle/shared';
import { useTransitArrivals } from '../hooks/useTransitArrivals';
import { useNearbyStops } from '../hooks/useNearbyStops';
import { useFavoriteStops } from '../hooks/useFavoriteStops';
import type { TransitArrival, TransitStop } from '../types';

function getRecentStops(): string[] {
  try {
    const raw = safeGetItem(StorageKeys.TRANSIT_RECENT_STOPS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentStop(stopId: string) {
  const recent = getRecentStops().filter((id) => id !== stopId);
  recent.unshift(stopId);
  safeSetItem(
    StorageKeys.TRANSIT_RECENT_STOPS,
    JSON.stringify(recent.slice(0, 10)),
  );
}

function getEtaColor(minutes: number): string {
  if (minutes <= 5) return 'text-green-600 dark:text-green-400';
  if (minutes <= 15) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-teal-600 dark:text-teal-400';
}

function ArrivalRow({
  arrival,
  t,
}: {
  arrival: TransitArrival;
  t: (key: string) => string;
}) {
  return (
    <View className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800">
      {/* Route badge */}
      <View className="min-w-[44px] min-h-[44px] items-center justify-center rounded-lg bg-blue-600 dark:bg-blue-500 px-2">
        <Text className="text-white font-bold text-sm">
          {arrival.routeShortName}
        </Text>
      </View>

      {/* Trip info */}
      <View className="flex-1 ml-3">
        <Text className="text-base font-medium text-gray-900 dark:text-gray-100">
          {arrival.tripHeadsign}
        </Text>
        <View className="flex-row items-center mt-1">
          {arrival.isRealTime ? (
            <View className="flex-row items-center bg-green-100 dark:bg-green-900 rounded px-2 py-0.5 mr-2">
              <Ionicons name="radio" size={12} color="#16a34a" />
              <Text className="text-green-700 dark:text-green-300 text-xs ml-1">
                {t('transit.realTime' as any)}
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded px-2 py-0.5 mr-2">
              <Ionicons name="time-outline" size={12} color="#6b7280" />
              <Text className="text-gray-500 dark:text-gray-400 text-xs ml-1">
                {t('transit.scheduled' as any)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* ETA */}
      <View className="min-w-[44px] min-h-[44px] items-center justify-center">
        <Text className={`text-xl font-bold ${getEtaColor(arrival.minutesUntilArrival)}`}>
          {arrival.minutesUntilArrival}
        </Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          {t('transit.minutes' as any)}
        </Text>
      </View>
    </View>
  );
}

function StopPill({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="min-w-[44px] min-h-[44px] items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 mr-2 mb-2"
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text className="text-sm text-gray-700 dark:text-gray-300">{label}</Text>
    </Pressable>
  );
}

export function TransitTrackerScreen() {
  const { t } = useTranslation();
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [recentStops, setRecentStops] = useState<string[]>(getRecentStops);

  const { arrivals, stop, loading, error, refresh, lastUpdated } =
    useTransitArrivals(selectedStopId);
  const {
    stops: nearbyStops,
    loading: nearbyLoading,
    error: nearbyError,
    findNearby,
  } = useNearbyStops();
  const { favorites, isFavorite, toggleFavorite } = useFavoriteStops();

  const selectStop = useCallback((stopId: string) => {
    setSelectedStopId(stopId);
    saveRecentStop(stopId);
    setRecentStops(getRecentStops());
  }, []);

  const goBack = useCallback(() => {
    setSelectedStopId(null);
  }, []);

  const handleSearch = useCallback(() => {
    const trimmed = searchText.trim();
    if (trimmed) {
      selectStop(trimmed);
      setSearchText('');
    }
  }, [searchText, selectStop]);

  // Details mode
  if (selectedStopId) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900">
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Pressable
            onPress={goBack}
            className="min-w-[44px] min-h-[44px] items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel={t('transit.back' as any)}
          >
            <Ionicons name="arrow-back" size={24} color="#6b7280" />
          </Pressable>

          <View className="flex-1 mx-2">
            <Text
              className="text-lg font-semibold text-gray-900 dark:text-gray-100"
              numberOfLines={1}
            >
              {stop?.name ?? selectedStopId}
            </Text>
            {stop?.direction && (
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {stop.direction}
              </Text>
            )}
          </View>

          {stop && (
            <Pressable
              onPress={() => toggleFavorite(stop)}
              className="min-w-[44px] min-h-[44px] items-center justify-center"
              accessibilityRole="button"
              accessibilityLabel={t('transit.toggleFavorite' as any)}
            >
              <Ionicons
                name={isFavorite(stop.id) ? 'star' : 'star-outline'}
                size={24}
                color={isFavorite(stop.id) ? '#f59e0b' : '#6b7280'}
              />
            </Pressable>
          )}

          <Pressable
            onPress={refresh}
            className="min-w-[44px] min-h-[44px] items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel={t('transit.refresh' as any)}
          >
            <Ionicons name="refresh" size={24} color="#6b7280" />
          </Pressable>
        </View>

        {/* Last updated */}
        {lastUpdated && (
          <Text className="text-xs text-gray-400 dark:text-gray-500 px-4 py-1">
            {t('transit.lastUpdated' as any)}: {lastUpdated}
          </Text>
        )}

        {/* Content */}
        {loading && arrivals.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" />
            <Text className="mt-2 text-gray-500 dark:text-gray-400">
              {t('transit.loading' as any)}
            </Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-4">
            <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
            <Text className="mt-2 text-red-600 dark:text-red-400 text-center">
              {t('transit.error' as any)}
            </Text>
          </View>
        ) : arrivals.length === 0 ? (
          <View className="flex-1 items-center justify-center px-4">
            <Ionicons name="bus-outline" size={48} color="#9ca3af" />
            <Text className="mt-2 text-gray-500 dark:text-gray-400 text-center">
              {t('transit.noArrivals' as any)}
            </Text>
          </View>
        ) : (
          <ScrollView className="flex-1">
            {arrivals.map((arrival, index) => (
              <ArrivalRow
                key={`${arrival.routeId}-${arrival.scheduledArrival}-${index}`}
                arrival={arrival}
                t={t as (key: string) => string}
              />
            ))}
          </ScrollView>
        )}
      </View>
    );
  }

  // Search mode
  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      {/* Search input */}
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center">
          <TextInput
            className="flex-1 min-h-[44px] bg-gray-100 dark:bg-gray-800 rounded-lg px-4 text-base text-gray-900 dark:text-gray-100"
            placeholder={t('transit.searchPlaceholder' as any)}
            placeholderTextColor="#9ca3af"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            accessibilityLabel={t('transit.searchPlaceholder' as any)}
          />
          <Pressable
            onPress={handleSearch}
            className="min-w-[44px] min-h-[44px] items-center justify-center ml-2 bg-blue-600 dark:bg-blue-500 rounded-lg"
            accessibilityRole="button"
            accessibilityLabel={t('transit.search' as any)}
          >
            <Ionicons name="search" size={20} color="#ffffff" />
          </Pressable>
        </View>
      </View>

      {/* Find nearby button */}
      <View className="px-4 pb-4">
        <Pressable
          onPress={findNearby}
          className="min-h-[44px] flex-row items-center justify-center bg-teal-600 dark:bg-teal-500 rounded-lg px-4 py-3"
          accessibilityRole="button"
          accessibilityLabel={t('transit.findNearby' as any)}
        >
          {nearbyLoading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Ionicons name="locate" size={20} color="#ffffff" />
              <Text className="text-white font-medium ml-2">
                {t('transit.findNearby' as any)}
              </Text>
            </>
          )}
        </Pressable>
        {nearbyError && (
          <Text className="text-red-500 dark:text-red-400 text-sm mt-1">
            {nearbyError}
          </Text>
        )}
      </View>

      {/* Nearby stops */}
      {nearbyStops.length > 0 && (
        <View className="px-4 pb-4">
          <Text className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {t('transit.nearbyStops' as any)}
          </Text>
          {nearbyStops.map((ns) => (
            <Pressable
              key={ns.id}
              onPress={() => selectStop(ns.id)}
              className="min-h-[44px] flex-row items-center py-3 border-b border-gray-100 dark:border-gray-800"
              accessibilityRole="button"
              accessibilityLabel={ns.name}
            >
              <Ionicons name="bus-outline" size={20} color="#6b7280" />
              <View className="flex-1 ml-3">
                <Text className="text-base text-gray-900 dark:text-gray-100">
                  {ns.name}
                </Text>
                {ns.direction && (
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    {ns.direction}
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
            </Pressable>
          ))}
        </View>
      )}

      {/* Favorite stops */}
      {favorites.length > 0 && (
        <View className="px-4 pb-4">
          <Text className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {t('transit.favoriteStops' as any)}
          </Text>
          <View className="flex-row flex-wrap">
            {favorites.map((fav) => (
              <StopPill
                key={fav.id}
                label={fav.name}
                onPress={() => selectStop(fav.id)}
              />
            ))}
          </View>
        </View>
      )}

      {/* Recent stops */}
      {recentStops.length > 0 && (
        <View className="px-4 pb-4">
          <Text className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {t('transit.recentStops' as any)}
          </Text>
          <View className="flex-row flex-wrap">
            {recentStops.map((stopId) => (
              <StopPill
                key={stopId}
                label={stopId}
                onPress={() => selectStop(stopId)}
              />
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}
