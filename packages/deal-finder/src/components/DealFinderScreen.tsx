import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@apollo/client';
import { GET_DEALS, useTranslation } from '@mycircle/shared';

const SOURCES = ['SlickDeals', 'DealNews', 'Reddit'] as const;
type Source = (typeof SOURCES)[number];

export default function DealFinderScreen() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedSources, setSelectedSources] = useState<Set<Source>>(new Set());

  const { data, loading, refetch } = useQuery(GET_DEALS, {
    variables: {
      search,
      sources: selectedSources.size > 0 ? Array.from(selectedSources) : undefined,
    },
  });

  const deals = data?.getDeals ?? [];

  const toggleSource = useCallback((source: Source) => {
    setSelectedSources((prev) => {
      const next = new Set(prev);
      if (next.has(source)) {
        next.delete(source);
      } else {
        next.add(source);
      }
      return next;
    });
  }, []);

  const renderDeal = useCallback(
    ({ item }: { item: any }) => (
      <View className="mx-4 mb-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              {item.title}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {item.store ?? t('deals.unknownStore' as any)}
            </Text>
          </View>
          {item.discount && (
            <View className="bg-red-100 dark:bg-red-900 px-3 py-1 rounded-full">
              <Text className="text-red-700 dark:text-red-300 text-sm font-bold">
                {item.discount}
              </Text>
            </View>
          )}
        </View>
        <View className="flex-row items-center mt-2">
          <Ionicons name="arrow-up" size={16} color="#22c55e" />
          <Text className="text-sm text-green-600 dark:text-green-400 ml-1 font-medium">
            {item.score ?? 0}
          </Text>
          {item.source && (
            <View className="ml-3 bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">
              <Text className="text-xs text-blue-700 dark:text-blue-300">{item.source}</Text>
            </View>
          )}
        </View>
      </View>
    ),
    [t],
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Search bar */}
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center bg-white dark:bg-gray-800 rounded-xl px-3 border border-gray-200 dark:border-gray-700">
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            className="flex-1 py-3 px-2 text-base text-gray-900 dark:text-white"
            placeholder={t('deals.searchPlaceholder' as any)}
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
            accessibilityLabel={t('deals.searchPlaceholder' as any)}
          />
          {search.length > 0 && (
            <Pressable
              onPress={() => setSearch('')}
              className="min-w-[44px] min-h-[44px] items-center justify-center"
              accessibilityLabel={t('deals.clearSearch' as any)}
              accessibilityRole="button"
            >
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Source filters */}
      <View className="flex-row px-4 pb-3 gap-2">
        {SOURCES.map((source) => {
          const active = selectedSources.has(source);
          return (
            <Pressable
              key={source}
              onPress={() => toggleSource(source)}
              className={`px-4 py-2 rounded-full min-h-[44px] justify-center ${
                active
                  ? 'bg-blue-600 dark:bg-blue-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
              accessibilityLabel={source}
              accessibilityRole="button"
            >
              <Text
                className={`text-sm font-medium ${
                  active ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {source}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Deals list */}
      {loading && deals.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-gray-500 dark:text-gray-400 mt-3">
            {t('deals.loading' as any)}
          </Text>
        </View>
      ) : (
        <FlatList
          data={deals}
          keyExtractor={(item, index) => item.id ?? String(index)}
          renderItem={renderDeal}
          contentContainerStyle={{ paddingVertical: 8 }}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={() => refetch()} />
          }
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-20">
              <Ionicons name="pricetag-outline" size={48} color="#9ca3af" />
              <Text className="text-gray-500 dark:text-gray-400 mt-3 text-base">
                {t('deals.noDeals' as any)}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
