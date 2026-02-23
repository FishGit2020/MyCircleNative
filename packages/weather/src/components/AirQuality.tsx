import React, { useState, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from '@mycircle/shared';
import type { AirQuality as AirQualityType, TranslationKey } from '@mycircle/shared';

interface Props {
  data: AirQualityType;
}

const AQI_CONFIG: Array<{
  label: TranslationKey;
  desc: TranslationKey;
  textColor: string;
  bgColor: string;
  barColor: string;
  badgeBg: string;
}> = [
  {
    label: 'weather.aqiGood' as TranslationKey,
    desc: 'weather.aqiGoodDesc' as TranslationKey,
    textColor: 'text-green-700 dark:text-green-300',
    bgColor: 'bg-green-100 dark:bg-green-900/40',
    barColor: 'bg-green-500',
    badgeBg: 'bg-green-500',
  },
  {
    label: 'weather.aqiFair' as TranslationKey,
    desc: 'weather.aqiFairDesc' as TranslationKey,
    textColor: 'text-yellow-700 dark:text-yellow-300',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/40',
    barColor: 'bg-yellow-500',
    badgeBg: 'bg-yellow-500',
  },
  {
    label: 'weather.aqiModerate' as TranslationKey,
    desc: 'weather.aqiModerateDesc' as TranslationKey,
    textColor: 'text-orange-700 dark:text-orange-300',
    bgColor: 'bg-orange-100 dark:bg-orange-900/40',
    barColor: 'bg-orange-500',
    badgeBg: 'bg-orange-500',
  },
  {
    label: 'weather.aqiPoor' as TranslationKey,
    desc: 'weather.aqiPoorDesc' as TranslationKey,
    textColor: 'text-red-700 dark:text-red-300',
    bgColor: 'bg-red-100 dark:bg-red-900/40',
    barColor: 'bg-red-500',
    badgeBg: 'bg-red-500',
  },
  {
    label: 'weather.aqiVeryPoor' as TranslationKey,
    desc: 'weather.aqiVeryPoorDesc' as TranslationKey,
    textColor: 'text-purple-700 dark:text-purple-300',
    bgColor: 'bg-purple-100 dark:bg-purple-900/40',
    barColor: 'bg-purple-500',
    badgeBg: 'bg-purple-500',
  },
];

const POLLUTANTS: Array<{
  key: keyof Omit<AirQualityType, 'aqi'>;
  label: string;
  unit: string;
}> = [
  { key: 'pm2_5', label: 'PM2.5', unit: '\u00B5g/m\u00B3' },
  { key: 'pm10', label: 'PM10', unit: '\u00B5g/m\u00B3' },
  { key: 'o3', label: 'O\u2083', unit: '\u00B5g/m\u00B3' },
  { key: 'no2', label: 'NO\u2082', unit: '\u00B5g/m\u00B3' },
  { key: 'so2', label: 'SO\u2082', unit: '\u00B5g/m\u00B3' },
  { key: 'co', label: 'CO', unit: '\u00B5g/m\u00B3' },
];

export default function AirQuality({ data }: Props) {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);

  const idx = Math.max(0, Math.min(data.aqi - 1, 4));
  const config = AQI_CONFIG[idx];

  const toggleDetails = useCallback(() => {
    setShowDetails((prev) => !prev);
  }, []);

  return (
    <View className="mb-4">
      <Text className="mb-3 text-xl font-semibold text-gray-800 dark:text-white">
        {t('weather.airQuality')}
      </Text>

      <View className={`rounded-xl p-5 shadow-sm ${config.bgColor}`}>
        {/* AQI header */}
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className={`text-2xl font-bold ${config.textColor}`}>
              {t(config.label)}
            </Text>
            <Text className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {t(config.desc)}
            </Text>
          </View>

          {/* AQI badge */}
          <View
            className={`h-14 w-14 items-center justify-center rounded-full ${config.badgeBg}`}
            accessibilityLabel={`AQI ${data.aqi}`}
          >
            <Text className="text-xl font-bold text-white">{data.aqi}</Text>
          </View>
        </View>

        {/* AQI scale bar */}
        <View className="mt-4">
          <View className="h-2 flex-row overflow-hidden rounded-full">
            {AQI_CONFIG.map((c, i) => (
              <View
                key={i}
                className={`flex-1 ${c.barColor} ${i === idx ? 'border-2 border-white dark:border-gray-900' : 'opacity-40'}`}
              />
            ))}
          </View>
          <View className="mt-1 flex-row justify-between">
            <Text className="text-xs text-gray-500 dark:text-gray-400">1</Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">5</Text>
          </View>
        </View>

        {/* Pollutant details toggle */}
        <Pressable
          onPress={toggleDetails}
          className="mt-4 min-h-[44px] flex-row items-center"
          accessibilityRole="button"
          accessibilityState={{ expanded: showDetails }}
          accessibilityLabel={t('weather.pollutants')}
        >
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {t('weather.pollutants')}
          </Text>
          <Text
            className={`ml-1 text-sm text-gray-600 dark:text-gray-300 ${showDetails ? 'rotate-180' : ''}`}
          >
            {'\u25BC'}
          </Text>
        </Pressable>

        {/* Pollutant grid */}
        {showDetails && (
          <View className="mt-3 flex-row flex-wrap">
            {POLLUTANTS.map(({ key, label, unit }) => (
              <View
                key={key}
                className="mb-2 w-1/2 px-1"
              >
                <View className="rounded-lg bg-white/60 p-3 dark:bg-gray-800/60">
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    {label}
                  </Text>
                  <Text className="text-sm font-bold text-gray-900 dark:text-white">
                    {data[key].toFixed(1)}{' '}
                    <Text className="text-xs font-normal">{unit}</Text>
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
