import React from 'react';
import { View, Text, Image } from 'react-native';
import {
  useTranslation,
  getWeatherIconUrl,
  getWindDirection,
  getWeatherDescription,
  getStoredUnits,
  formatTemperature,
  formatWindSpeed,
} from '@mycircle/shared';
import type { CurrentWeather as CurrentWeatherType } from '@mycircle/shared';

interface Props {
  data: CurrentWeatherType;
}

export default function CurrentWeatherCard({ data }: Props) {
  const { t } = useTranslation();
  const { tempUnit, speedUnit } = getStoredUnits();
  const { color, bgColor } = getWeatherDescription(data.weather[0]?.main || 'Clear');

  return (
    <View className={`mb-4 rounded-xl ${bgColor} p-6 shadow-sm dark:bg-gray-800`}>
      {/* Top row: temp + icon */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className={`text-5xl font-bold ${color} dark:text-white`}>
            {formatTemperature(data.temp, tempUnit)}
          </Text>
          <Text className="mt-2 text-base text-gray-600 dark:text-gray-300">
            {t('weather.feelsLike')} {formatTemperature(data.feels_like, tempUnit)}
          </Text>
          {data.weather[0] && (
            <Text className={`mt-1 text-lg capitalize ${color} dark:text-gray-200`}>
              {data.weather[0].description}
            </Text>
          )}
        </View>

        {data.weather[0] && (
          <Image
            source={{ uri: getWeatherIconUrl(data.weather[0].icon) }}
            className="h-24 w-24"
            accessibilityLabel={data.weather[0].description}
            resizeMode="contain"
          />
        )}
      </View>

      {/* Stats grid */}
      <View className="mt-6 flex-row border-t border-gray-200 pt-6 dark:border-gray-700">
        <View className="flex-1 items-center">
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {t('weather.humidity')}
          </Text>
          <Text className="mt-1 text-xl font-semibold text-gray-800 dark:text-white">
            {data.humidity}%
          </Text>
        </View>

        <View className="flex-1 items-center">
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {t('weather.wind')}
          </Text>
          <Text className="mt-1 text-lg font-semibold text-gray-800 dark:text-white">
            {formatWindSpeed(data.wind.speed, speedUnit)} {getWindDirection(data.wind.deg)}
          </Text>
        </View>

        <View className="flex-1 items-center">
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {t('weather.pressure')}
          </Text>
          <Text className="mt-1 text-xl font-semibold text-gray-800 dark:text-white">
            {data.pressure} hPa
          </Text>
        </View>

        <View className="flex-1 items-center">
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {t('weather.cloudiness')}
          </Text>
          <Text className="mt-1 text-xl font-semibold text-gray-800 dark:text-white">
            {data.clouds.all}%
          </Text>
        </View>
      </View>
    </View>
  );
}
