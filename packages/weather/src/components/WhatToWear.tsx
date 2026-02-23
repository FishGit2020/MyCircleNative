import React, { useState, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from '@mycircle/shared';
import type { CurrentWeather, TranslationKey } from '@mycircle/shared';

interface Suggestion {
  icon: string;
  key: TranslationKey;
}

interface Category {
  labelKey: TranslationKey;
  icon: string;
  items: Suggestion[];
}

function getComfortLabel(
  temp: number,
  humidity: number,
  windSpeed: number,
): { key: TranslationKey; color: string } {
  // Wind chill makes cold feel colder
  const windChill =
    temp <= 10 && windSpeed > 4.8
      ? 13.12 +
        0.6215 * temp -
        11.37 * Math.pow(windSpeed * 3.6, 0.16) +
        0.3965 * temp * Math.pow(windSpeed * 3.6, 0.16)
      : temp;
  // Heat index makes heat feel hotter
  const heatIndex =
    temp >= 27 && humidity >= 40
      ? temp +
        0.33 * ((humidity / 100) * 6.105 * Math.exp((17.27 * temp) / (237.7 + temp))) -
        4
      : temp;

  const effective = temp <= 10 ? windChill : temp >= 27 ? heatIndex : temp;

  if (effective <= -10)
    return { key: 'wear.comfortExtremeCold' as TranslationKey, color: 'text-blue-600 dark:text-blue-300' };
  if (effective <= 5)
    return { key: 'wear.comfortCold' as TranslationKey, color: 'text-cyan-600 dark:text-cyan-300' };
  if (effective <= 15)
    return { key: 'wear.comfortCool' as TranslationKey, color: 'text-teal-600 dark:text-teal-300' };
  if (effective <= 25)
    return { key: 'wear.comfortComfortable' as TranslationKey, color: 'text-green-600 dark:text-green-300' };
  if (effective <= 33)
    return { key: 'wear.comfortWarm' as TranslationKey, color: 'text-orange-600 dark:text-orange-300' };
  return { key: 'wear.comfortHot' as TranslationKey, color: 'text-red-600 dark:text-red-300' };
}

function getSuggestions(weather: CurrentWeather): Category[] {
  const temp = weather.temp;
  const humidity = weather.humidity;
  const windSpeed = weather.wind.speed;
  const mainWeather = weather.weather[0]?.main?.toLowerCase() || '';
  const isRainy =
    mainWeather.includes('rain') ||
    mainWeather.includes('drizzle') ||
    mainWeather.includes('thunderstorm');
  const isSnowy = mainWeather.includes('snow');
  const isClear = mainWeather === 'clear';
  const isWindy = windSpeed >= 10;

  const tops: Suggestion[] = [];
  const bottoms: Suggestion[] = [];
  const footwear: Suggestion[] = [];
  const accessories: Suggestion[] = [];
  const protection: Suggestion[] = [];
  const tips: Suggestion[] = [];

  // Tops based on temperature
  if (temp <= -10) {
    tops.push({ icon: '\u{1F9E5}', key: 'wear.heavyWinterCoat' as TranslationKey });
    tops.push({ icon: '\u{1F9F5}', key: 'wear.thermalBaseLayer' as TranslationKey });
    tops.push({ icon: '\u{1F9E3}', key: 'wear.fleeceMiddleLayer' as TranslationKey });
  } else if (temp <= 0) {
    tops.push({ icon: '\u{1F9E5}', key: 'wear.winterCoat' as TranslationKey });
    tops.push({ icon: '\u{1F9F5}', key: 'wear.thermalBaseLayer' as TranslationKey });
  } else if (temp <= 10) {
    tops.push({ icon: '\u{1F9E5}', key: 'wear.warmJacket' as TranslationKey });
    tops.push({ icon: '\u{1F455}', key: 'wear.layeredTop' as TranslationKey });
  } else if (temp <= 18) {
    tops.push({ icon: '\u{1F9E5}', key: 'wear.lightJacketSweater' as TranslationKey });
    tops.push({ icon: '\u{1F455}', key: 'wear.longSleeveShirt' as TranslationKey });
  } else if (temp <= 25) {
    tops.push({ icon: '\u{1F455}', key: 'wear.tshirtLightShirt' as TranslationKey });
  } else if (temp <= 35) {
    tops.push({ icon: '\u{1F455}', key: 'wear.lightBreathable' as TranslationKey });
    if (isClear) tops.push({ icon: '\u{1F455}', key: 'wear.uvProtectiveShirt' as TranslationKey });
  } else {
    tops.push({ icon: '\u{1FA72}', key: 'wear.tankTopSleeveless' as TranslationKey });
    tops.push({ icon: '\u{1F455}', key: 'wear.minimalLight' as TranslationKey });
  }

  // Bottoms based on temperature
  if (temp <= -10) {
    bottoms.push({ icon: '\u{1F9F5}', key: 'wear.insulatedPants' as TranslationKey });
    bottoms.push({ icon: '\u{1F9F5}', key: 'wear.thermalLeggings' as TranslationKey });
  } else if (temp <= 5) {
    bottoms.push({ icon: '\u{1F456}', key: 'wear.longPants' as TranslationKey });
  } else if (temp <= 18) {
    bottoms.push({ icon: '\u{1F456}', key: 'wear.jeansPants' as TranslationKey });
  } else if (temp <= 25) {
    bottoms.push({ icon: '\u{1F456}', key: 'wear.lightPantsJeans' as TranslationKey });
  } else {
    bottoms.push({ icon: '\u{1FA73}', key: 'wear.shorts' as TranslationKey });
    if (humidity > 70) bottoms.push({ icon: '\u{1F456}', key: 'wear.lightLinenPants' as TranslationKey });
  }

  // Footwear
  if (temp <= -5 || isSnowy) {
    footwear.push({ icon: '\u{1F97E}', key: 'wear.winterBoots' as TranslationKey });
    if (temp <= -10) footwear.push({ icon: '\u{1F9E6}', key: 'wear.woolSocks' as TranslationKey });
  } else if (isRainy) {
    footwear.push({ icon: '\u{1F97E}', key: 'wear.waterproofBoots' as TranslationKey });
  } else if (temp <= 18) {
    footwear.push({ icon: '\u{1F45F}', key: 'wear.closedShoes' as TranslationKey });
  } else if (temp <= 28) {
    footwear.push({ icon: '\u{1F45F}', key: 'wear.sneakers' as TranslationKey });
  } else {
    footwear.push({ icon: '\u{1FA74}', key: 'wear.openShoesSandals' as TranslationKey });
  }

  // Accessories
  if (temp <= -10) {
    accessories.push({ icon: '\u{1F9E4}', key: 'wear.insulatedGloves' as TranslationKey });
    accessories.push({ icon: '\u{1F9E3}', key: 'wear.scarfWarmHat' as TranslationKey });
    if (isWindy) accessories.push({ icon: '\u{1F32C}\uFE0F', key: 'wear.faceCovering' as TranslationKey });
  } else if (temp <= 0) {
    accessories.push({ icon: '\u{1F9E4}', key: 'wear.gloves' as TranslationKey });
    accessories.push({ icon: '\u{1F9E3}', key: 'wear.scarf' as TranslationKey });
    accessories.push({ icon: '\u{1F9E2}', key: 'wear.warmHat' as TranslationKey });
  } else if (temp <= 10) {
    accessories.push({ icon: '\u{1F9E3}', key: 'wear.lightScarf' as TranslationKey });
    if (temp <= 5) accessories.push({ icon: '\u{1F9E2}', key: 'wear.beanie' as TranslationKey });
  }
  if (temp > 25 && isClear) {
    accessories.push({ icon: '\u{1F576}\uFE0F', key: 'wear.sunglasses' as TranslationKey });
    accessories.push({ icon: '\u{1F452}', key: 'wear.hatSunProtection' as TranslationKey });
  }
  if (isSnowy && temp <= -5) {
    accessories.push({ icon: '\u{1F97D}', key: 'wear.snowGoggles' as TranslationKey });
  }

  // Protection
  if (isRainy) {
    protection.push({ icon: '\u2602\uFE0F', key: 'wear.umbrella' as TranslationKey });
    protection.push({ icon: '\u{1F9E5}', key: 'wear.waterproofJacket' as TranslationKey });
    if (mainWeather.includes('thunderstorm') || mainWeather.includes('rain')) {
      protection.push({ icon: '\u{1F456}', key: 'wear.waterproofPants' as TranslationKey });
    }
  }
  if (isWindy && !isRainy) {
    protection.push({ icon: '\u{1F32C}\uFE0F', key: 'wear.windbreaker' as TranslationKey });
  }
  if (temp > 25 && isClear) {
    protection.push({ icon: '\u2600\uFE0F', key: 'wear.sunscreen' as TranslationKey });
  }

  // Tips
  if (temp > 30 || (temp > 25 && humidity > 60)) {
    tips.push({ icon: '\u{1F4A7}', key: 'wear.moistureWicking' as TranslationKey });
    tips.push({ icon: '\u{1F455}', key: 'wear.looseFittingClothes' as TranslationKey });
    tips.push({ icon: '\u{1F4A7}', key: 'wear.waterBottle' as TranslationKey });
  }
  if (temp > 35) {
    tips.push({ icon: '\u{1F455}', key: 'wear.cottonOrLinen' as TranslationKey });
    tips.push({ icon: '\u{1F9CA}', key: 'wear.coolingTowel' as TranslationKey });
  }
  if (isWindy) {
    tips.push({ icon: '\u{1F455}', key: 'wear.secureFittingClothes' as TranslationKey });
  }
  if (temp >= 5 && temp <= 18) {
    tips.push({ icon: '\u{1F9E5}', key: 'wear.dressInLayers' as TranslationKey });
  }
  if (temp <= -5 || (temp <= 0 && isWindy)) {
    tips.push({ icon: '\u26A0\uFE0F', key: 'wear.brightReflective' as TranslationKey });
  }

  const categories: Category[] = [];
  if (tops.length) categories.push({ labelKey: 'wear.catTops' as TranslationKey, icon: '\u{1F455}', items: tops });
  if (bottoms.length) categories.push({ labelKey: 'wear.catBottoms' as TranslationKey, icon: '\u{1F456}', items: bottoms });
  if (footwear.length) categories.push({ labelKey: 'wear.catFootwear' as TranslationKey, icon: '\u{1F45F}', items: footwear });
  if (accessories.length) categories.push({ labelKey: 'wear.catAccessories' as TranslationKey, icon: '\u{1F9E3}', items: accessories });
  if (protection.length) categories.push({ labelKey: 'wear.catProtection' as TranslationKey, icon: '\u2602\uFE0F', items: protection });
  if (tips.length) categories.push({ labelKey: 'wear.catTips' as TranslationKey, icon: '\u{1F4A1}', items: tips });

  return categories;
}

interface WhatToWearProps {
  data: CurrentWeather;
}

export default function WhatToWear({ data }: WhatToWearProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);
  const categories = getSuggestions(data);

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  if (categories.length === 0) return null;

  const comfort = getComfortLabel(data.temp, data.humidity, data.wind.speed);
  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <View className="mb-4 rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
      {/* Header */}
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-gray-800 dark:text-white">
          {'\u{1F455}'} {t('weather.whatToWear')}
        </Text>
        <Pressable
          onPress={toggleExpanded}
          className="min-h-[44px] min-w-[44px] items-center justify-center"
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          accessibilityLabel={expanded ? 'Collapse' : 'Expand'}
        >
          <Text
            className={`text-sm text-gray-500 dark:text-gray-400 ${expanded ? 'rotate-180' : ''}`}
          >
            {'\u25BC'}
          </Text>
        </Pressable>
      </View>

      {/* Comfort summary */}
      <View className="mb-3 flex-row items-center rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700/50">
        <Text className={`text-sm font-medium ${comfort.color}`}>
          {t(comfort.key)}
        </Text>
        <Text className="mx-2 text-xs text-gray-400 dark:text-gray-500">
          {'\u00B7'}
        </Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          {totalItems} {t('wear.suggestions' as TranslationKey)}
        </Text>
      </View>

      {/* Category list */}
      {expanded && (
        <View>
          {categories.map((cat) => (
            <View key={cat.labelKey} className="mb-3">
              <Text className="mb-1.5 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {cat.icon} {t(cat.labelKey)}
              </Text>
              <View className="flex-row flex-wrap">
                {cat.items.map((s, i) => (
                  <View
                    key={i}
                    className="mb-1.5 mr-1.5 flex-row items-center rounded-full bg-gray-50 px-2.5 py-1 dark:bg-gray-700"
                  >
                    <Text className="mr-1">{s.icon}</Text>
                    <Text className="text-sm text-gray-700 dark:text-gray-300">
                      {t(s.key)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
