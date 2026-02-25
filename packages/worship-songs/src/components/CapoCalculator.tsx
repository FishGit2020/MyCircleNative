import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from '@mycircle/shared';
import { transposeChord } from '../utils/transpose';

const EASY_KEYS = new Set(['C', 'G', 'D', 'A', 'E']);
const MAX_FRET = 9;

interface CapoCalculatorProps {
  soundingKey: string;
  capoFret: number;
  onCapoChange: (fret: number) => void;
}

export default function CapoCalculator({ soundingKey, capoFret, onCapoChange }: CapoCalculatorProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const options = Array.from({ length: MAX_FRET }, (_, i) => {
    const fret = i + 1;
    const shapeKey = transposeChord(soundingKey, -fret);
    return { fret, shapeKey, isEasy: EASY_KEYS.has(shapeKey) };
  });

  const suggestions = options.filter((o) => o.isEasy);
  const activeOption = options.find((o) => o.fret === capoFret);

  return (
    <View className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        className="flex-row items-center gap-2 min-h-[44px]"
        accessibilityLabel={t('worship.capoCalculator')}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
      >
        <Text className="text-sm text-gray-600 dark:text-gray-400">
          {open ? '\u25BC' : '\u25B6'}
        </Text>
        <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400">
          {t('worship.capoCalculator')}
        </Text>
        {capoFret > 0 && activeOption && (
          <View className="ml-auto px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Text className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              {t('worship.capoFret').replace('{n}', String(capoFret))} {'\u2192'} {activeOption.shapeKey}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {open && (
        <View className="mt-3 gap-3">
          {/* Fret selector grid */}
          <View
            className="flex-row items-center gap-1.5 flex-wrap"
            accessibilityRole="radiogroup"
            accessibilityLabel={t('worship.capoCalculator')}
          >
            <TouchableOpacity
              onPress={() => onCapoChange(0)}
              className={`px-3 py-2 rounded-lg min-h-[44px] justify-center ${
                capoFret === 0
                  ? 'bg-blue-500 dark:bg-blue-600'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}
              accessibilityLabel={t('worship.capoOff')}
              accessibilityRole="radio"
              accessibilityState={{ checked: capoFret === 0 }}
            >
              <Text
                className={`text-xs font-semibold ${
                  capoFret === 0
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {t('worship.capoOff')}
              </Text>
            </TouchableOpacity>

            {options.map(({ fret, shapeKey, isEasy }) => (
              <TouchableOpacity
                key={fret}
                onPress={() => onCapoChange(capoFret === fret ? 0 : fret)}
                className={`items-center px-2 py-1 rounded-lg min-w-[40px] min-h-[44px] justify-center ${
                  capoFret === fret
                    ? 'bg-blue-500 dark:bg-blue-600'
                    : isEasy
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700'
                      : 'bg-gray-100 dark:bg-gray-700'
                }`}
                accessibilityLabel={`${t('worship.capoFret').replace('{n}', String(fret))}: ${shapeKey}${isEasy ? ` (${t('worship.capoEasyKey')})` : ''}`}
                accessibilityRole="radio"
                accessibilityState={{ checked: capoFret === fret }}
              >
                <Text
                  className={`text-[10px] ${
                    capoFret === fret
                      ? 'text-white/70'
                      : isEasy
                        ? 'text-green-700/70 dark:text-green-400/70'
                        : 'text-gray-600/70 dark:text-gray-300/70'
                  }`}
                >
                  {fret}
                </Text>
                <Text
                  className={`text-xs font-bold ${
                    capoFret === fret
                      ? 'text-white'
                      : isEasy
                        ? 'text-green-700 dark:text-green-400'
                        : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {shapeKey}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Current capo info */}
          {capoFret > 0 && activeOption && (
            <View className="flex-row items-center gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30">
              <Text className="text-amber-600 dark:text-amber-400 text-sm">{'\u2139'}</Text>
              <Text className="text-xs text-amber-800 dark:text-amber-300 flex-1">
                {t('worship.capoInstruction')
                  .replace('{fret}', String(capoFret))
                  .replace('{shapeKey}', activeOption.shapeKey)
                  .replace('{soundingKey}', soundingKey)}
              </Text>
            </View>
          )}

          {/* Easy key suggestions (when no capo is selected) */}
          {capoFret === 0 && suggestions.length > 0 && (
            <View className="flex-row flex-wrap items-center gap-1">
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {t('worship.capoSuggested')}:{' '}
              </Text>
              {suggestions.map((s, i) => (
                <TouchableOpacity
                  key={s.fret}
                  onPress={() => onCapoChange(s.fret)}
                  className="min-h-[44px] justify-center px-1"
                  accessibilityLabel={`${t('worship.capoFret').replace('{n}', String(s.fret))}: ${s.shapeKey}`}
                  accessibilityRole="button"
                >
                  <Text className="text-xs font-semibold text-green-600 dark:text-green-400">
                    {i > 0 ? ', ' : ''}
                    {s.fret}{'\u2192'}{s.shapeKey}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}
