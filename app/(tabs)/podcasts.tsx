import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@mycircle/shared';

export default function PodcastsScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('podcasts.title')}
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 mt-2">
          Podcast player coming soon
        </Text>
      </View>
    </SafeAreaView>
  );
}
