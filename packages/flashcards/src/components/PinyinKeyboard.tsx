import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from '@mycircle/shared';

interface PinyinKeyboardProps {
  onInsert: (char: string) => void;
}

const TONE_GROUPS = [
  ['\u0101', '\u00e1', '\u01ce', '\u00e0'],
  ['\u0113', '\u00e9', '\u011b', '\u00e8'],
  ['\u012b', '\u00ed', '\u01d0', '\u00ec'],
  ['\u014d', '\u00f3', '\u01d2', '\u00f2'],
  ['\u016b', '\u00fa', '\u01d4', '\u00f9'],
  ['\u01d6', '\u01d8', '\u01da', '\u01dc'],
];

export default function PinyinKeyboard({ onInsert }: PinyinKeyboardProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  return (
    <View>
      <TouchableOpacity
        onPress={() => setVisible((v) => !v)}
        className="mt-1 min-h-[44px] justify-center"
        accessibilityLabel={t('chinese.pinyinKeyboard')}
        accessibilityRole="button"
      >
        <Text className="text-xs text-blue-600 dark:text-blue-400">
          {t('chinese.pinyinKeyboard')} {visible ? '\u25B2' : '\u25BC'}
        </Text>
      </TouchableOpacity>

      {visible && (
        <View className="flex-row flex-wrap gap-1 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          {TONE_GROUPS.map((group, gi) => (
            <View key={gi} className="flex-row gap-0.5">
              {group.map((char) => (
                <TouchableOpacity
                  key={char}
                  onPress={() => onInsert(char)}
                  className="px-2.5 py-1.5 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded min-w-[32px] min-h-[32px] items-center justify-center"
                  accessibilityLabel={`Pinyin tone ${char}`}
                  accessibilityRole="button"
                >
                  <Text className="text-sm text-gray-800 dark:text-white">{char}</Text>
                </TouchableOpacity>
              ))}
              {gi < TONE_GROUPS.length - 1 && (
                <Text className="text-gray-300 dark:text-gray-500 self-center mx-0.5">|</Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
