import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useQuery, useLazyQuery } from '@apollo/client';
import {
  GET_CURRENT_WEATHER,
  SEARCH_CITIES,
  useTranslation,
} from '@mycircle/shared';

interface City {
  id: string;
  name: string;
  country?: string;
  state?: string;
  lat: number;
  lon: number;
}

interface CurrentWeatherData {
  temp: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  wind: { speed: number; deg: number; gust?: number };
  clouds: { all: number };
  weather: { main: string; description: string; icon: string }[];
  visibility: number;
}

interface CurrentWeatherResponse {
  currentWeather: CurrentWeatherData;
}

interface SearchCitiesResponse {
  searchCities: City[];
}

/** Inline city search input */
function CitySearchInput({
  onSelect,
  placeholder,
}: {
  onSelect: (city: City) => void;
  placeholder: string;
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [searchCities, { data, loading }] =
    useLazyQuery<SearchCitiesResponse>(SEARCH_CITIES);

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      if (value.trim().length >= 2) {
        searchCities({ variables: { query: value.trim(), limit: 5 } });
      }
    },
    [searchCities],
  );

  const results = data?.searchCities ?? [];

  return (
    <View>
      <TextInput
        value={query}
        onChangeText={handleSearch}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        className="px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        accessibilityLabel={placeholder}
      />
      {query.trim().length >= 2 && (
        <View className="mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
          {loading && (
            <View className="px-3 py-2">
              <ActivityIndicator size="small" color="#3b82f6" />
            </View>
          )}
          {!loading && results.length === 0 && (
            <Text className="px-3 py-2 text-sm text-gray-400 dark:text-gray-500">
              {t('podcasts.noResults')}
            </Text>
          )}
          {results.map((city) => (
            <Pressable
              key={city.id}
              onPress={() => {
                onSelect(city);
                setQuery('');
              }}
              className="px-3 py-2.5 min-h-[44px] justify-center active:bg-blue-50 dark:active:bg-blue-900/20"
              accessibilityLabel={`${city.name}${city.state ? `, ${city.state}` : ''}${city.country ? `, ${city.country}` : ''}`}
              accessibilityRole="button"
            >
              <Text className="text-sm text-gray-700 dark:text-gray-300">
                {city.name}
                {city.state ? `, ${city.state}` : ''}
                {city.country ? `, ${city.country}` : ''}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

/** Card showing weather for a single city */
function CompareCard({
  city,
  color,
}: {
  city: City;
  color: 'blue' | 'orange';
}) {
  const { t } = useTranslation();
  const { data, loading } = useQuery<CurrentWeatherResponse>(
    GET_CURRENT_WEATHER,
    {
      variables: { lat: city.lat, lon: city.lon },
      fetchPolicy: 'cache-first',
    },
  );

  const w = data?.currentWeather;
  const borderColor =
    color === 'blue'
      ? 'border-t-blue-500 dark:border-t-blue-400'
      : 'border-t-orange-500 dark:border-t-orange-400';

  return (
    <View
      className={`flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-t-4 ${borderColor}`}
    >
      <Text className="text-base font-bold text-gray-800 dark:text-white mb-0.5">
        {city.name}
      </Text>
      {city.country && (
        <Text className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          {city.state ? `${city.state}, ` : ''}
          {city.country}
        </Text>
      )}

      {loading && (
        <View className="py-4 items-center">
          <ActivityIndicator size="small" color="#3b82f6" />
        </View>
      )}

      {w && (
        <>
          {/* Temperature */}
          <Text className="text-2xl font-bold text-gray-800 dark:text-white">
            {Math.round(w.temp)}{'\u00B0'}
          </Text>
          {w.weather[0] && (
            <Text className="text-xs text-gray-500 dark:text-gray-400 capitalize mb-3">
              {w.weather[0].description}
            </Text>
          )}

          {/* Metric grid */}
          <View className="gap-1.5">
            <View className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
              <Text className="text-gray-500 dark:text-gray-400 text-xs">
                {t('weather.feelsLike')}
              </Text>
              <Text className="font-semibold text-gray-800 dark:text-white text-sm">
                {Math.round(w.feels_like)}{'\u00B0'}
              </Text>
            </View>
            <View className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
              <Text className="text-gray-500 dark:text-gray-400 text-xs">
                {t('weather.humidity')}
              </Text>
              <Text className="font-semibold text-gray-800 dark:text-white text-sm">
                {w.humidity}%
              </Text>
            </View>
            <View className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
              <Text className="text-gray-500 dark:text-gray-400 text-xs">
                {t('weather.wind')}
              </Text>
              <Text className="font-semibold text-gray-800 dark:text-white text-sm">
                {Math.round(w.wind.speed)} m/s
              </Text>
            </View>
            <View className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
              <Text className="text-gray-500 dark:text-gray-400 text-xs">
                {t('weather.pressure')}
              </Text>
              <Text className="font-semibold text-gray-800 dark:text-white text-sm">
                {w.pressure} hPa
              </Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

/** Comparison bar for a metric */
function CompareBar({
  label,
  valueA,
  valueB,
  unit,
  max,
}: {
  label: string;
  valueA: number;
  valueB: number;
  unit: string;
  max: number;
}) {
  const pctA = max > 0 ? Math.min((valueA / max) * 100, 100) : 0;
  const pctB = max > 0 ? Math.min((valueB / max) * 100, 100) : 0;

  return (
    <View className="mb-2">
      <View className="flex-row justify-between mb-1">
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          {label}
        </Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400 font-mono">
          {Math.round(valueA)}
          {unit} vs {Math.round(valueB)}
          {unit}
        </Text>
      </View>
      <View className="flex-row gap-1 h-2">
        <View className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <View
            className="h-full bg-blue-400 dark:bg-blue-500 rounded-full"
            style={{ width: `${pctA}%` }}
          />
        </View>
        <View className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <View
            className="h-full bg-orange-400 dark:bg-orange-500 rounded-full"
            style={{ width: `${pctB}%` }}
          />
        </View>
      </View>
    </View>
  );
}

/** Metric comparison section */
function MetricComparison({
  cityA,
  cityB,
}: {
  cityA: City;
  cityB: City;
}) {
  const { t } = useTranslation();
  const { data: dataA } = useQuery<CurrentWeatherResponse>(
    GET_CURRENT_WEATHER,
    {
      variables: { lat: cityA.lat, lon: cityA.lon },
      fetchPolicy: 'cache-first',
    },
  );
  const { data: dataB } = useQuery<CurrentWeatherResponse>(
    GET_CURRENT_WEATHER,
    {
      variables: { lat: cityB.lat, lon: cityB.lon },
      fetchPolicy: 'cache-first',
    },
  );

  const wA = dataA?.currentWeather;
  const wB = dataB?.currentWeather;

  if (!wA || !wB) return null;

  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mt-3">
      <Text className="text-base font-semibold text-gray-800 dark:text-white mb-2">
        {t('compare.metrics')}
      </Text>
      <View className="flex-row items-center gap-3 mb-3">
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-2 bg-blue-400 dark:bg-blue-500 rounded" />
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {cityA.name}
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-2 bg-orange-400 dark:bg-orange-500 rounded" />
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {cityB.name}
          </Text>
        </View>
      </View>
      <CompareBar
        label={t('weather.humidity')}
        valueA={wA.humidity}
        valueB={wB.humidity}
        unit="%"
        max={100}
      />
      <CompareBar
        label={t('weather.wind')}
        valueA={wA.wind.speed}
        valueB={wB.wind.speed}
        unit=" m/s"
        max={Math.max(wA.wind.speed, wB.wind.speed, 1) * 1.2}
      />
      <CompareBar
        label={t('weather.cloudiness')}
        valueA={wA.clouds.all}
        valueB={wB.clouds.all}
        unit="%"
        max={100}
      />
      <CompareBar
        label={t('weather.pressure')}
        valueA={wA.pressure}
        valueB={wB.pressure}
        unit=" hPa"
        max={Math.max(wA.pressure, wB.pressure, 1) * 1.02}
      />
    </View>
  );
}

interface WeatherComparisonProps {
  currentCity: { name: string; lat: number; lon: number };
}

export default function WeatherComparison({
  currentCity,
}: WeatherComparisonProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [compareCity, setCompareCity] = useState<City | null>(null);

  const currentAsCityObj: City = {
    id: `${currentCity.lat}_${currentCity.lon}`,
    name: currentCity.name,
    lat: currentCity.lat,
    lon: currentCity.lon,
  };

  return (
    <View className="mb-4">
      {/* Toggle button */}
      <Pressable
        onPress={() => setExpanded((prev) => !prev)}
        className="flex-row items-center gap-2 py-2 min-h-[44px]"
        accessibilityLabel={
          expanded ? t('compare.hide') : t('compare.compareButton')
        }
        accessibilityRole="button"
      >
        <Text
          className={`text-sm ${expanded ? 'rotate-90' : ''} text-blue-600 dark:text-blue-400`}
        >
          {'\u25B6'}
        </Text>
        <Text className="text-sm font-medium text-blue-600 dark:text-blue-400">
          {t('compare.title')}
        </Text>
      </Pressable>

      {expanded && (
        <View className="mt-2">
          {/* City search */}
          <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
            {t('compare.selectCityPrompt')}
          </Text>
          <CitySearchInput
            onSelect={(city) => setCompareCity(city)}
            placeholder={t('compare.searchCity')}
          />

          {/* Comparison cards */}
          {compareCity && (
            <View className="mt-4">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-3"
              >
                <CompareCard city={currentAsCityObj} color="blue" />
                <CompareCard city={compareCity} color="orange" />
              </ScrollView>

              <MetricComparison
                cityA={currentAsCityObj}
                cityB={compareCity}
              />
            </View>
          )}

          {!compareCity && (
            <View className="items-center py-6">
              <Text className="text-sm text-gray-400 dark:text-gray-500">
                {t('compare.noCity')}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
