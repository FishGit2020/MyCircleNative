import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from '@mycircle/shared';
import type { CurrentWeather } from '@mycircle/shared';

interface Props {
  data: CurrentWeather;
}

function formatTimestamp(ts: number, timezoneOffset: number): string {
  const date = new Date((ts + timezoneOffset) * 1000);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}

function getDaylightHours(sunrise: number, sunset: number): string {
  const diff = sunset - sunrise;
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export default function SunVisibility({ data }: Props) {
  const { t } = useTranslation();

  if (!data.sunrise || !data.sunset) return null;

  const daylight = getDaylightHours(data.sunrise, data.sunset);
  const isDay = data.dt >= data.sunrise && data.dt <= data.sunset;

  return (
    <View className="mb-4 rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
      <Text className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
        {t('weather.sunVisibility')}
      </Text>

      {/* Sunrise / Daylight / Sunset row */}
      <View className="flex-row justify-between">
        {/* Sunrise */}
        <View className="items-center">
          <Text className="text-2xl">{'\u2600\uFE0F'}</Text>
          <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {t('weather.sunrise')}
          </Text>
          <Text className="mt-0.5 text-sm font-semibold text-orange-500">
            {formatTimestamp(data.sunrise, data.timezone)}
          </Text>
        </View>

        {/* Daylight duration */}
        <View className="items-center">
          <Text className="text-2xl">{isDay ? '\u2600\uFE0F' : '\u{1F319}'}</Text>
          <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {t('weather.daylight')}
          </Text>
          <Text className="mt-0.5 text-sm font-semibold text-gray-800 dark:text-white">
            {daylight}
          </Text>
        </View>

        {/* Sunset */}
        <View className="items-center">
          <Text className="text-2xl">{'\u{1F305}'}</Text>
          <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {t('weather.sunset')}
          </Text>
          <Text className="mt-0.5 text-sm font-semibold text-orange-600">
            {formatTimestamp(data.sunset, data.timezone)}
          </Text>
        </View>
      </View>

      {/* Daylight progress bar */}
      <View className="mt-4">
        <View className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
          <View
            className="h-full rounded-full bg-yellow-400"
            style={{
              width: `${getDaylightProgress(data.sunrise, data.sunset, data.dt)}%`,
            }}
          />
        </View>
        <View className="mt-1 flex-row justify-between">
          <Text className="text-xs text-gray-400 dark:text-gray-500">
            {formatTimestamp(data.sunrise, data.timezone)}
          </Text>
          <Text className="text-xs text-gray-400 dark:text-gray-500">
            {formatTimestamp(data.sunset, data.timezone)}
          </Text>
        </View>
      </View>

      {/* Visibility */}
      {data.visibility != null && (
        <View className="mt-4 flex-row items-center rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
          <Text className="mr-3 text-xl">{'\u{1F441}\uFE0F'}</Text>
          <View>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {t('weather.visibility')}
            </Text>
            <Text className="text-base font-semibold text-gray-800 dark:text-white">
              {(data.visibility / 1000).toFixed(1)} km
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

function getDaylightProgress(sunrise: number, sunset: number, dt: number): number {
  if (dt <= sunrise) return 0;
  if (dt >= sunset) return 100;
  return ((dt - sunrise) / (sunset - sunrise)) * 100;
}
