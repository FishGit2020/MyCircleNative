import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@mycircle/shared';

export default function FlashcardsScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      {/* Header with back button */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <Pressable
          type="button"
          onPress={() => router.back()}
          className="w-11 h-11 items-center justify-center rounded-full active:bg-gray-100 dark:active:bg-gray-800"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color="#3b82f6" />
        </Pressable>
        <Text className="text-lg font-semibold text-gray-900 dark:text-white ml-2">
          {t('flashcards.title')}
        </Text>
      </View>

      {/* Content */}
      <View className="flex-1 items-center justify-center p-4">
        <Ionicons name="layers-outline" size={64} color="#9ca3af" />
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
          {t('flashcards.title')}
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 mt-2 text-center">
          {t('flashcards.subtitle')}
        </Text>
        <Text className="text-sm text-gray-400 dark:text-gray-500 mt-4">
          Coming soon
        </Text>
      </View>
    </SafeAreaView>
  );
}
