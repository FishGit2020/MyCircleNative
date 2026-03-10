import { View, Text, Pressable } from 'react-native';
import { useTranslation } from '@mycircle/shared';

const SUGGESTION_KEYS = [
  'ai.suggestWeather',
  'ai.suggestStocks',
  'ai.suggestCrypto',
  'ai.suggestNavigate',
  'ai.suggestCompare',
  'ai.suggestFlashcard',
  'ai.suggestBible',
  'ai.suggestPodcast',
  'ai.suggestNote',
  'ai.suggestWorkEntry',
  'ai.suggestBaby',
  'ai.suggestImmigration',
  'ai.suggestChildDev',
] as const;

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

export default function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center px-6">
      {/* Empty state icon */}
      <Text className="text-6xl mb-4 opacity-50">💬</Text>

      <Text className="text-lg font-semibold text-gray-400 dark:text-gray-500 text-center">
        {t('ai.emptyTitle')}
      </Text>
      <Text className="text-sm text-gray-400 dark:text-gray-500 mt-2 text-center max-w-xs">
        {t('ai.emptyHint')}
      </Text>

      {/* Prompt chips */}
      <View className="flex-row flex-wrap justify-center gap-2 mt-6 max-w-sm">
        {SUGGESTION_KEYS.map((key) => (
          <Pressable
            key={key}
            onPress={() => onSelect(t(key))}
            accessibilityLabel={t(key)}
            accessibilityRole="button"
            className="px-3 py-2 rounded-full border border-gray-300 dark:border-gray-600 active:bg-blue-50 dark:active:bg-blue-900/20"
            style={{ minHeight: 44 }}
          >
            <Text className="text-sm text-gray-600 dark:text-gray-300">
              {t(key)}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
