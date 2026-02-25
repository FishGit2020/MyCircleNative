import React from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import { useQuery } from '@apollo/client';
import {
  GET_CURRENT_WEATHER,
  getWeatherIconUrl,
  getStoredUnits,
  formatTemperature,
} from '@mycircle/shared';

interface CurrentWeatherData {
  currentWeather: {
    temp: number;
    weather: Array<{ icon: string; main: string }>;
  };
}

interface Props {
  lat: number;
  lon: number;
}

export default function WeatherPreview({ lat, lon }: Props) {
  const { tempUnit } = getStoredUnits();
  const { data, loading } = useQuery<CurrentWeatherData>(GET_CURRENT_WEATHER, {
    variables: { lat, lon },
    fetchPolicy: 'cache-first',
  });

  if (loading) {
    return (
      <View className="flex-row items-center gap-1 ml-auto pl-2 opacity-50">
        <ActivityIndicator size="small" color="#9ca3af" />
      </View>
    );
  }

  if (!data?.currentWeather) return null;

  const { temp, weather } = data.currentWeather;
  const icon = weather[0]?.icon;
  const iconUrl = icon ? getWeatherIconUrl(icon) : null;

  return (
    <View className="flex-row items-center gap-1 ml-auto pl-2">
      {iconUrl && (
        <Image
          source={{ uri: iconUrl }}
          className="w-8 h-8"
          accessibilityLabel={weather[0]?.main ?? 'weather icon'}
        />
      )}
      <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        {formatTemperature(temp, tempUnit)}
      </Text>
    </View>
  );
}
