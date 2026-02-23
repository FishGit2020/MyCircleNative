import { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@mycircle/shared';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: Refresh widget data
    // Simulate a brief delay for refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 pb-20 md:pb-8"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
        }
      >
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('dashboard.title')}
          </Text>
          <Text className="text-base text-gray-500 dark:text-gray-400 mt-1">
            {t('home.subtitle')}
          </Text>
        </View>

        {/* Placeholder widget cards */}
        <View className="gap-4">
          {/* Weather Widget Placeholder */}
          <View className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('widgets.weather')}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('widgets.weatherDesc')}
            </Text>
          </View>

          {/* Stocks Widget Placeholder */}
          <View className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('widgets.stocks')}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('widgets.stocksDesc')}
            </Text>
          </View>

          {/* Verse of the Day Widget Placeholder */}
          <View className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('widgets.verse')}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('widgets.verseDesc')}
            </Text>
          </View>

          {/* Now Playing Widget Placeholder */}
          <View className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('widgets.nowPlaying')}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('widgets.nowPlayingDesc')}
            </Text>
          </View>

          {/* Notebook Widget Placeholder */}
          <View className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('widgets.notebook')}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('widgets.notebookDesc')}
            </Text>
          </View>

          {/* Worship Widget Placeholder */}
          <View className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('widgets.worship')}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('widgets.worshipDesc')}
            </Text>
          </View>
        </View>

        {/* Placeholder message */}
        <View className="mt-8 items-center">
          <Text className="text-sm text-gray-400 dark:text-gray-500 text-center">
            Widget cards will be added here
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
