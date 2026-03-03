import React, { useCallback, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  RefreshControl,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@apollo/client';
import {
  GET_WEATHER,
  GET_AIR_QUALITY,
  useTranslation,
} from '@mycircle/shared';
import type {
  CurrentWeather,
  ForecastDay,
  HourlyForecast as HourlyForecastType,
  AirQuality as AirQualityType,
} from '@mycircle/shared';
import { useSelectedCity } from './useSelectedCity';
import {
  CurrentWeatherCard,
  Forecast,
  HourlyForecast,
  AirQuality,
  SunVisibility,
  WhatToWear,
  WeatherAlerts,
  ActivitySuggestions,
  HistoricalWeather,
  HourlyChart,
} from './components';

interface WeatherResponse {
  weather: {
    current: CurrentWeather;
    forecast: ForecastDay[];
    hourly: HourlyForecastType[];
  };
}

interface AirQualityResponse {
  airQuality: AirQualityType | null;
}

export default function WeatherScreen() {
  const { t } = useTranslation();
  const { city } = useSelectedCity();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: weatherData,
    loading: weatherLoading,
    error: weatherError,
    refetch: refetchWeather,
  } = useQuery<WeatherResponse>(GET_WEATHER, {
    variables: { lat: city.lat, lon: city.lon },
    fetchPolicy: 'cache-and-network',
  });

  const {
    data: airQualityData,
    refetch: refetchAirQuality,
  } = useQuery<AirQualityResponse>(GET_AIR_QUALITY, {
    variables: { lat: city.lat, lon: city.lon },
    fetchPolicy: 'cache-and-network',
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchWeather(), refetchAirQuality()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchWeather, refetchAirQuality]);

  const current = weatherData?.weather?.current ?? null;
  const forecast = weatherData?.weather?.forecast ?? null;
  const hourly = weatherData?.weather?.hourly ?? null;
  const airQuality = airQualityData?.airQuality ?? null;

  // Loading skeleton
  if (weatherLoading && !current) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <ScrollView
          className="flex-1 px-4 pt-4"
          contentContainerStyle={{ paddingBottom: 80 }}
        >
          {/* City name skeleton */}
          <View className="mb-6">
            <View className="h-8 w-48 rounded-lg bg-gray-200 dark:bg-gray-700" />
          </View>

          {/* Current weather skeleton */}
          <View className="mb-4 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <View className="flex-row items-center">
              <View className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
              <View className="ml-4 flex-1">
                <View className="mb-3 h-10 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                <View className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700" />
              </View>
            </View>
            <View className="mt-6 flex-row justify-between">
              {[0, 1, 2, 3].map((i) => (
                <View key={i} className="items-center">
                  <View className="mb-2 h-3 w-14 rounded bg-gray-200 dark:bg-gray-700" />
                  <View className="h-5 w-10 rounded bg-gray-200 dark:bg-gray-700" />
                </View>
              ))}
            </View>
          </View>

          {/* Hourly forecast skeleton */}
          <View className="mb-4">
            <View className="mb-3 h-6 w-40 rounded bg-gray-200 dark:bg-gray-700" />
            <View className="flex-row">
              {[0, 1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  className="mr-3 w-20 items-center rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800"
                >
                  <View className="mb-2 h-3 w-10 rounded bg-gray-200 dark:bg-gray-700" />
                  <View className="mb-2 h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <View className="h-4 w-8 rounded bg-gray-200 dark:bg-gray-700" />
                </View>
              ))}
            </View>
          </View>

          {/* Forecast skeleton */}
          <View>
            <View className="mb-3 h-6 w-36 rounded bg-gray-200 dark:bg-gray-700" />
            {[0, 1, 2, 3, 4].map((i) => (
              <View
                key={i}
                className="mb-2 flex-row items-center rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800"
              >
                <View className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                <View className="ml-3 h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                <View className="ml-3 h-4 flex-1 rounded bg-gray-200 dark:bg-gray-700" />
                <View className="ml-3 h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Error state
  if (weatherError && !current) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-full rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
            <Text className="text-center text-base text-red-600 dark:text-red-400">
              {weatherError.message}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3b82f6"
            colors={['#3b82f6']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* City name header */}
        <Text className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">
          {city.name}
        </Text>

        {/* Weather Alerts */}
        {current && <WeatherAlerts current={current} />}

        {/* Current Weather */}
        {current && <CurrentWeatherCard data={current} />}

        {/* Sun & Visibility */}
        {current && <SunVisibility data={current} />}

        {/* What to Wear */}
        {current && <WhatToWear data={current} />}

        {/* Activity Suggestions */}
        {current && <ActivitySuggestions current={current} />}

        {/* Hourly Chart */}
        {hourly && hourly.length > 0 && <HourlyChart hourly={hourly} />}

        {/* Hourly Forecast */}
        {hourly && hourly.length > 0 && (
          <View className="mb-4">
            <Text className="mb-3 text-xl font-semibold text-gray-800 dark:text-white">
              {t('weather.hourlyForecast')}
            </Text>
            <HourlyForecast data={hourly} />
          </View>
        )}

        {/* 7-Day Forecast */}
        {forecast && forecast.length > 0 && (
          <View className="mb-4">
            <Text className="mb-3 text-xl font-semibold text-gray-800 dark:text-white">
              {t('weather.7dayForecast')}
            </Text>
            <Forecast data={forecast} />
          </View>
        )}

        {/* Air Quality */}
        {airQuality && <AirQuality data={airQuality} />}

        {/* Historical Weather */}
        {current && (
          <HistoricalWeather
            lat={city.lat}
            lon={city.lon}
            currentTemp={current.temp}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
