import React, { useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from '@mycircle/shared';
import type { City } from '@mycircle/shared';
import { WeatherPreview } from './components';
import { useCitySearch, formatTimeAgo } from './hooks/useCitySearch';
import type { RecentCity } from './hooks/useCitySearch';

interface Props {
  onCitySelect?: (city: City) => void;
  recentCities?: RecentCity[];
  onRemoveCity?: (cityId: string) => void;
  onClearRecents?: () => void;
}

export default function CitySearchScreen({
  onCitySelect,
  recentCities,
  onRemoveCity,
  onClearRecents,
}: Props) {
  const { t } = useTranslation();
  const router = useRouter();

  const handleCitySelectWithNav = useCallback(
    (city: City) => {
      if (onCitySelect) {
        onCitySelect(city);
      }
      if (router.canGoBack()) {
        router.back();
      }
    },
    [onCitySelect, router],
  );

  const {
    query,
    setQuery,
    loading,
    geoLoading,
    geoError,
    matchingRecents,
    filteredResults,
    fuzzySuggestions,
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
  } = useCitySearch({
    onCitySelect: handleCitySelectWithNav,
    recentCities,
    onRemoveCity,
    onClearRecents,
  });

  // ── Render helpers ────────────────────────────────────────────

  const renderCityItem = useCallback(
    (city: City | RecentCity, options?: { isRecent?: boolean; showRemove?: boolean }) => (
      <TouchableOpacity
        key={city.id}
        className="flex-row items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700 min-h-[52px]"
        onPress={() => {
          Keyboard.dismiss();
          handleCitySelect(city);
        }}
        accessibilityLabel={`${city.name}, ${city.state ? city.state + ', ' : ''}${city.country}`}
        accessibilityRole="button"
        activeOpacity={0.7}
      >
        <View className="flex-1 min-w-0">
          <View className="flex-row items-center">
            <Text className="font-medium text-gray-900 dark:text-white" numberOfLines={1}>
              {city.name}
            </Text>
            {options?.isRecent && (
              <View className="flex-row items-center px-1.5 py-0.5 ml-2 bg-blue-50 dark:bg-blue-900/30 rounded">
                <Text className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  {t('search.recentMatch')}
                </Text>
              </View>
            )}
          </View>
          <Text className="text-sm text-gray-500 dark:text-gray-400" numberOfLines={1}>
            {city.state && `${city.state}, `}
            {city.country}
            {'searchedAt' in city && city.searchedAt ? (
              <Text className="text-xs text-gray-400 dark:text-gray-500">
                {`  ${formatTimeAgo(city.searchedAt)}`}
              </Text>
            ) : null}
          </Text>
        </View>
        <WeatherPreview lat={city.lat} lon={city.lon} />
        {options?.showRemove && (
          <TouchableOpacity
            className="ml-2 p-2 rounded-full min-w-[44px] min-h-[44px] items-center justify-center"
            onPress={(e) => {
              e.stopPropagation?.();
              handleRemoveCity(city.id);
            }}
            accessibilityLabel={`${t('search.removeFromRecent')} ${city.name}`}
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text className="text-gray-400 dark:text-gray-500 text-lg font-bold">
              {'\u00D7'}
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    ),
    [handleCitySelect, handleRemoveCity, t],
  );

  // ── Loading skeleton ──────────────────────────────────────────

  const renderSkeletons = () => (
    <View className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden mt-2">
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          className="flex-row items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700"
        >
          <View className="flex-1">
            <View className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-32 mb-2" />
            <View className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-20" />
          </View>
          <View className="flex-row items-center gap-1 ml-auto pl-2">
            <View className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600" />
            <View className="w-8 h-4 rounded bg-gray-200 dark:bg-gray-600" />
          </View>
        </View>
      ))}
    </View>
  );

  // ── Use my location button ────────────────────────────────────

  const renderLocationButton = () => (
    <TouchableOpacity
      className="flex-row items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 min-h-[52px] bg-white dark:bg-gray-800"
      onPress={handleUseMyLocation}
      disabled={geoLoading}
      accessibilityLabel={t('search.useMyLocation')}
      accessibilityRole="button"
      activeOpacity={0.7}
    >
      {geoLoading ? (
        <ActivityIndicator size="small" color="#3b82f6" />
      ) : (
        <Text className="text-blue-600 dark:text-blue-400 text-base">
          {'\uD83D\uDCCD'}
        </Text>
      )}
      <Text className="text-sm font-medium text-blue-600 dark:text-blue-400">
        {geoLoading ? t('search.gettingLocation') : t('search.useMyLocation')}
      </Text>
    </TouchableOpacity>
  );

  // ── Section header ────────────────────────────────────────────

  const renderSectionHeader = (label: string, showClear?: boolean) => (
    <View className="flex-row items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
      <Text className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {label}
      </Text>
      {showClear && (
        <TouchableOpacity
          onPress={handleClearAllRecents}
          accessibilityLabel={t('search.clearAllRecents')}
          accessibilityRole="button"
          className="min-w-[44px] min-h-[44px] items-center justify-center"
        >
          <Text className="text-xs text-red-500 dark:text-red-400 font-medium">
            {t('search.clearAllRecents')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // ── Build the list data ───────────────────────────────────────

  type ListItem =
    | { type: 'location-button' }
    | { type: 'geo-error'; message: string }
    | { type: 'section-header'; label: string; showClear?: boolean }
    | { type: 'city'; city: City | RecentCity; isRecent?: boolean; showRemove?: boolean }
    | { type: 'no-results' }
    | { type: 'skeleton' };

  const listData: ListItem[] = [];

  if (loading) {
    listData.push({ type: 'skeleton' });
  } else if (showSearchResults) {
    // Matching recents
    for (const city of matchingRecents) {
      listData.push({ type: 'city', city, isRecent: true });
    }
    // API results
    for (const city of filteredResults) {
      listData.push({ type: 'city', city });
    }
  } else if (showFuzzySuggestions) {
    listData.push({ type: 'section-header', label: t('search.suggestedCities') });
    for (const city of fuzzySuggestions) {
      listData.push({ type: 'city', city });
    }
  } else if (showNoResults) {
    listData.push({ type: 'no-results' });
  } else if (showDropdown) {
    listData.push({ type: 'location-button' });
    if (geoError) {
      listData.push({ type: 'geo-error', message: geoError });
    }
    const label = isShowingRecent ? t('search.recentSearches') : t('search.popularCities');
    listData.push({ type: 'section-header', label, showClear: isShowingRecent });
    for (const city of dropdownCities) {
      listData.push({ type: 'city', city, showRemove: isShowingRecent });
    }
  }

  const renderItem = ({ item }: { item: ListItem }) => {
    switch (item.type) {
      case 'location-button':
        return renderLocationButton();
      case 'geo-error':
        return (
          <View className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <Text className="text-xs text-red-500 dark:text-red-400">{item.message}</Text>
          </View>
        );
      case 'section-header':
        return renderSectionHeader(item.label, item.showClear);
      case 'city':
        return renderCityItem(item.city, {
          isRecent: item.isRecent,
          showRemove: item.showRemove,
        });
      case 'no-results':
        return (
          <View className="items-center justify-center px-4 py-8 bg-white dark:bg-gray-800 rounded-lg mt-2">
            <Text className="text-4xl mb-2">{'\uD83D\uDD0D'}</Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              {t('search.noResults')}
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 text-xs mt-1">
              {t('search.noResultsHint')}
            </Text>
          </View>
        );
      case 'skeleton':
        return renderSkeletons();
      default:
        return null;
    }
  };

  const keyExtractor = (item: ListItem, index: number) => {
    if (item.type === 'city') return `city-${item.city.id}`;
    return `${item.type}-${index}`;
  };

  // ── Main render ───────────────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-900" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            }
          }}
          accessibilityLabel={t('weather.backToSearch')}
          accessibilityRole="button"
          className="min-w-[44px] min-h-[44px] items-center justify-center mr-2"
        >
          <Text className="text-2xl text-blue-600 dark:text-blue-400">{'\u2190'}</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900 dark:text-white flex-1">
          {t('search.search')}
        </Text>
      </View>

      {/* Search Input */}
      <View className="px-4 py-3 bg-white dark:bg-gray-800">
        <View className="relative">
          <TextInput
            className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-base"
            value={query}
            onChangeText={(text) => {
              setQuery(text);
            }}
            placeholder={t('search.placeholder')}
            placeholderTextColor="#9ca3af"
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel={t('search.placeholder')}
          />
          {query.length > 0 && (
            <TouchableOpacity
              className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] items-center justify-center"
              onPress={() => {
                setQuery('');
              }}
              accessibilityLabel="Clear search"
              accessibilityRole="button"
            >
              <Text className="text-gray-400 dark:text-gray-500 text-lg font-bold">
                {'\u00D7'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results List */}
      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      />
    </SafeAreaView>
  );
}
