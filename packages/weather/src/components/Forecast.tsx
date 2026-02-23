import React, { useCallback } from 'react';
import { View, Text, Image, FlatList, Pressable } from 'react-native';
import {
  useTranslation,
  getWeatherIconUrl,
  getStoredUnits,
  convertTemp,
  formatWindSpeed,
} from '@mycircle/shared';
import type { ForecastDay } from '@mycircle/shared';

interface Props {
  data: ForecastDay[];
}

export default function Forecast({ data }: Props) {
  const { t, locale } = useTranslation();
  const { tempUnit, speedUnit } = getStoredUnits();

  const formatDate = useCallback(
    (timestamp: number) => {
      return new Date(timestamp * 1000).toLocaleDateString(locale, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    },
    [locale],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: ForecastDay; index: number }) => {
      const dayLabel = index === 0 ? t('weather.today') : formatDate(item.dt);

      return (
        <View className="mb-2 flex-row items-center rounded-xl bg-white px-4 py-3 shadow-sm dark:bg-gray-800">
          {/* Day name */}
          <Text
            className="w-20 text-sm font-medium text-gray-700 dark:text-gray-200"
            numberOfLines={1}
          >
            {dayLabel}
          </Text>

          {/* Weather icon */}
          {item.weather[0] && (
            <Image
              source={{ uri: getWeatherIconUrl(item.weather[0].icon) }}
              className="mx-2 h-10 w-10"
              accessibilityLabel={item.weather[0].description}
              resizeMode="contain"
            />
          )}

          {/* Description */}
          <Text
            className="flex-1 text-xs capitalize text-gray-500 dark:text-gray-400"
            numberOfLines={1}
          >
            {item.weather[0]?.description}
          </Text>

          {/* Rain probability */}
          {item.pop > 0 && (
            <Text className="mr-2 text-xs text-blue-500 dark:text-blue-400">
              {Math.round(item.pop * 100)}%
            </Text>
          )}

          {/* High / Low temps */}
          <View className="flex-row items-center">
            <Text className="text-sm font-semibold text-gray-800 dark:text-white">
              {convertTemp(item.temp.max, tempUnit)}{'\u00B0'}
            </Text>
            <Text className="ml-2 text-sm text-gray-400 dark:text-gray-500">
              {convertTemp(item.temp.min, tempUnit)}{'\u00B0'}
            </Text>
          </View>
        </View>
      );
    },
    [t, formatDate, tempUnit],
  );

  const keyExtractor = useCallback((item: ForecastDay) => String(item.dt), []);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
    />
  );
}
