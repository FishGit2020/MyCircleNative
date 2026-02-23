import React, { useCallback } from 'react';
import { View, Text, Image, FlatList } from 'react-native';
import {
  useTranslation,
  getWeatherIconUrl,
  getStoredUnits,
  formatTemperature,
} from '@mycircle/shared';
import type { HourlyForecast as HourlyForecastType } from '@mycircle/shared';

interface Props {
  data: HourlyForecastType[];
}

export default function HourlyForecast({ data }: Props) {
  const { t, locale } = useTranslation();
  const { tempUnit } = getStoredUnits();

  const formatTime = useCallback(
    (timestamp: number) => {
      return new Date(timestamp * 1000).toLocaleTimeString(locale, {
        hour: 'numeric',
        minute: '2-digit',
      });
    },
    [locale],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: HourlyForecastType; index: number }) => (
      <View className="mr-3 w-20 items-center rounded-xl bg-white p-3 shadow-sm dark:bg-gray-800">
        {/* Time */}
        <Text className="text-xs text-gray-600 dark:text-gray-400">
          {index === 0 ? t('weather.now') : formatTime(item.dt)}
        </Text>

        {/* Weather icon */}
        {item.weather[0] && (
          <Image
            source={{ uri: getWeatherIconUrl(item.weather[0].icon) }}
            className="my-1 h-10 w-10"
            accessibilityLabel={item.weather[0].description}
            resizeMode="contain"
          />
        )}

        {/* Temperature */}
        <Text className="text-sm font-semibold text-gray-800 dark:text-white">
          {formatTemperature(item.temp, tempUnit)}
        </Text>

        {/* Rain probability */}
        {item.pop > 0 && (
          <Text className="mt-0.5 text-xs text-blue-500 dark:text-blue-400">
            {Math.round(item.pop * 100)}%
          </Text>
        )}

        {/* Wind speed */}
        {item.wind_speed > 0 && (
          <Text className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
            {Math.round(item.wind_speed)} m/s
          </Text>
        )}
      </View>
    ),
    [t, formatTime, tempUnit],
  );

  const keyExtractor = useCallback(
    (item: HourlyForecastType) => String(item.dt),
    [],
  );

  return (
    <FlatList
      data={data.slice(0, 12)}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel={t('weather.hourlyForecast')}
    />
  );
}
