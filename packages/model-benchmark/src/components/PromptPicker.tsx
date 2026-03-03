import { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { useTranslation } from '@mycircle/shared';

interface PromptPickerProps {
  onSelect: (prompt: string) => void;
  selectedPrompt: string;
}

export default function PromptPicker({ onSelect, selectedPrompt }: PromptPickerProps) {
  const { t } = useTranslation();
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const presetPrompts = [
    { key: 'benchmark.prompt1', label: t('benchmark.prompt1') },
    { key: 'benchmark.prompt2', label: t('benchmark.prompt2') },
    { key: 'benchmark.prompt3', label: t('benchmark.prompt3') },
    { key: 'benchmark.prompt4', label: t('benchmark.prompt4') },
    { key: 'benchmark.prompt5', label: t('benchmark.prompt5') },
  ];

  return (
    <View className="mb-4">
      <Text className="text-base font-semibold text-gray-900 dark:text-white mb-2">
        {t('benchmark.selectPrompt')}
      </Text>
      <View className="gap-2">
        {presetPrompts.map((p) => (
          <Pressable
            key={p.key}
            className={`rounded-lg px-3 py-2.5 ${
              selectedPrompt === p.label
                ? 'bg-blue-500 dark:bg-blue-600'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}
            onPress={() => { onSelect(p.label); setShowCustom(false); }}
            accessibilityRole="button"
            accessibilityLabel={p.label}
          >
            <Text
              className={`text-sm ${
                selectedPrompt === p.label
                  ? 'text-white font-medium'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
              numberOfLines={1}
            >
              {p.label}
            </Text>
          </Pressable>
        ))}

        {/* Custom prompt */}
        <Pressable
          className={`rounded-lg px-3 py-2.5 ${
            showCustom
              ? 'bg-blue-500 dark:bg-blue-600'
              : 'bg-gray-100 dark:bg-gray-800'
          }`}
          onPress={() => setShowCustom(true)}
          accessibilityRole="button"
          accessibilityLabel={t('benchmark.customPrompt')}
        >
          <Text
            className={`text-sm ${
              showCustom ? 'text-white font-medium' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {t('benchmark.customPrompt')}
          </Text>
        </Pressable>

        {showCustom && (
          <TextInput
            className="bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2.5 text-gray-900 dark:text-white text-sm"
            value={customPrompt}
            onChangeText={(text) => {
              setCustomPrompt(text);
              onSelect(text);
            }}
            placeholder={t('benchmark.customPromptPlaceholder')}
            placeholderTextColor="#9ca3af"
            multiline
            accessibilityLabel={t('benchmark.customPrompt')}
          />
        )}
      </View>
    </View>
  );
}
