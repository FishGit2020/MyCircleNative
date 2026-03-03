import { View, Text } from 'react-native';
import { useQuery } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import { GET_HISTORICAL_WEATHER, useTranslation } from '@mycircle/shared';

interface HistoricalWeatherProps {
  lat: number;
  lon: number;
  currentTemp: number;
}

export default function HistoricalWeather({ lat, lon, currentTemp }: HistoricalWeatherProps) {
  const { t } = useTranslation();

  // Get this day last year
  const lastYear = new Date();
  lastYear.setFullYear(lastYear.getFullYear() - 1);
  const dateStr = lastYear.toISOString().split('T')[0];

  const { data, loading } = useQuery(GET_HISTORICAL_WEATHER, {
    variables: { lat, lon, date: dateStr },
    fetchPolicy: 'cache-first',
  });

  const historical = data?.historicalWeather;

  if (loading || !historical) {
    return null;
  }

  const tempDiff = currentTemp - ((historical.temp_max + historical.temp_min) / 2);
  const isWarmer = tempDiff > 0;

  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm">
      <Text className="text-lg font-bold text-gray-900 dark:text-white mb-1">
        {t('weather.historicalTitle')}
      </Text>
      <Text className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        {t('weather.historicalDesc')}
      </Text>

      <View className="flex-row justify-between">
        <View className="items-center flex-1">
          <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {t('weather.tempHigh')}
          </Text>
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            {Math.round(historical.temp_max)}{'\u00b0'}
          </Text>
        </View>
        <View className="items-center flex-1">
          <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {t('weather.tempLow')}
          </Text>
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            {Math.round(historical.temp_min)}{'\u00b0'}
          </Text>
        </View>
        <View className="items-center flex-1">
          <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {t('weather.precipitation')}
          </Text>
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            {historical.precipitation}mm
          </Text>
        </View>
      </View>

      {/* Comparison */}
      <View className="flex-row items-center justify-center mt-3 bg-gray-50 dark:bg-gray-700 rounded-lg py-2">
        <Ionicons
          name={isWarmer ? 'trending-up-outline' : 'trending-down-outline'}
          size={16}
          color={isWarmer ? '#ef4444' : '#3b82f6'}
        />
        <Text className="text-sm text-gray-700 dark:text-gray-300 ml-1">
          {Math.abs(Math.round(tempDiff))}{'\u00b0'} {isWarmer ? t('weather.warmer') : t('weather.cooler')}
        </Text>
      </View>
    </View>
  );
}
