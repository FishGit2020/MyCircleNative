import { useState, useCallback } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@mycircle/shared';
import type { BenchmarkResult } from '@mycircle/shared';

interface ResultsDashboardProps {
  results: BenchmarkResult[];
  onClear: () => void;
  saved: boolean;
}

export default function ResultsDashboard({ results, onClear, saved }: ResultsDashboardProps) {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleClear = useCallback(() => {
    Alert.alert(
      t('benchmark.results.clearAll'),
      t('benchmark.results.clearConfirm'),
      [
        { text: t('benchmark.endpoints.cancel'), style: 'cancel' },
        {
          text: t('benchmark.results.clearAll'),
          style: 'destructive',
          onPress: onClear,
        },
      ],
    );
  }, [t, onClear]);

  if (results.length === 0) {
    return (
      <View className="items-center py-8">
        <Ionicons name="bar-chart-outline" size={40} color="#9ca3af" />
        <Text className="text-gray-500 dark:text-gray-400 mt-2">
          {t('benchmark.results.noResults')}
        </Text>
      </View>
    );
  }

  const successfulResults = results.filter((r) => r.success);
  const fastest = successfulResults.length > 0
    ? successfulResults.sort((a, b) => b.tokensPerSecond - a.tokensPerSecond)[0]
    : null;
  const averageTps = successfulResults.length > 0
    ? Math.round(
        (successfulResults.reduce((sum, r) => sum + r.tokensPerSecond, 0) /
          successfulResults.length) *
          10,
      ) / 10
    : 0;

  return (
    <View>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-base font-semibold text-gray-900 dark:text-white">
          {t('benchmark.results.title')}
        </Text>
        <View className="flex-row items-center gap-2">
          {saved && (
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
              <Text className="text-xs text-green-600 dark:text-green-400 ml-1">
                {t('benchmark.results.autoSaved')}
              </Text>
            </View>
          )}
          <Pressable
            className="px-2 py-1 rounded-md active:bg-gray-100 dark:active:bg-gray-800"
            onPress={handleClear}
            accessibilityRole="button"
            accessibilityLabel={t('benchmark.results.clearAll')}
          >
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {t('benchmark.results.clearAll')}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Summary Stats */}
      <View className="flex-row gap-3 mb-4">
        {fastest && (
          <View className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-xl p-3 border border-green-200 dark:border-green-800">
            <Text className="text-xs text-green-600 dark:text-green-400 mb-1">
              {t('benchmark.results.bestPerformer')}
            </Text>
            <Text className="text-sm font-bold text-green-800 dark:text-green-300">
              {fastest.endpointName}
            </Text>
            <Text className="text-xs text-green-600 dark:text-green-400">
              {fastest.tokensPerSecond} {t('benchmark.tokensPerSec')}
            </Text>
          </View>
        )}
        <View className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800">
          <Text className="text-xs text-blue-600 dark:text-blue-400 mb-1">
            {t('benchmark.results.averageTps')}
          </Text>
          <Text className="text-sm font-bold text-blue-800 dark:text-blue-300">
            {averageTps}
          </Text>
          <Text className="text-xs text-blue-600 dark:text-blue-400">
            {t('benchmark.tokensPerSec')}
          </Text>
        </View>
      </View>

      {/* Summary bar */}
      <View className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 mb-4 flex-row items-center justify-between">
        <Text className="text-xs text-gray-600 dark:text-gray-400">
          {t('benchmark.results.summary')}
        </Text>
        <Text className="text-xs font-medium text-gray-900 dark:text-white">
          {successfulResults.length}/{results.length} {t('benchmark.success')}
        </Text>
      </View>

      {/* Per-endpoint Results */}
      <View className="gap-3">
        {results.map((result) => {
          const isFastest = fastest && result.endpointId === fastest.endpointId;
          const isExpanded = expandedId === result.endpointId;

          return (
            <Pressable
              key={result.endpointId}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
              onPress={() =>
                setExpandedId(isExpanded ? null : result.endpointId)
              }
              accessibilityRole="button"
              accessibilityLabel={`${result.endpointName} ${t('benchmark.viewDetails')}`}
            >
              {/* Header row */}
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center flex-1">
                  <Text className="text-base font-bold text-gray-900 dark:text-white">
                    {result.endpointName}
                  </Text>
                  {isFastest && (
                    <View className="bg-green-100 dark:bg-green-900/30 rounded-full px-2 py-0.5 ml-2">
                      <Text className="text-xs text-green-700 dark:text-green-300">
                        {t('benchmark.fastest')}
                      </Text>
                    </View>
                  )}
                </View>
                <View
                  className={`rounded-full px-2 py-0.5 ${
                    result.success
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-red-100 dark:bg-red-900/30'
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      result.success
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-red-700 dark:text-red-300'
                    }`}
                  >
                    {result.success
                      ? t('benchmark.success')
                      : t('benchmark.failed')}
                  </Text>
                </View>
              </View>

              <Text className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {result.model}
              </Text>

              {/* Key metrics row */}
              <View className="flex-row flex-wrap gap-x-4 gap-y-1">
                <Text className="text-xs text-gray-600 dark:text-gray-400">
                  {t('benchmark.tokensPerSec')}:{' '}
                  <Text className="font-medium text-gray-900 dark:text-white">
                    {result.tokensPerSecond}
                  </Text>
                </Text>
                <Text className="text-xs text-gray-600 dark:text-gray-400">
                  {t('benchmark.totalTime')}:{' '}
                  <Text className="font-medium text-gray-900 dark:text-white">
                    {result.totalTime}ms
                  </Text>
                </Text>
                <Text className="text-xs text-gray-600 dark:text-gray-400">
                  {t('benchmark.timeToFirst')}:{' '}
                  <Text className="font-medium text-gray-900 dark:text-white">
                    {result.timeToFirstToken}ms
                  </Text>
                </Text>
              </View>

              {/* Expanded details */}
              {isExpanded && (
                <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <View className="flex-row flex-wrap gap-x-4 gap-y-2">
                    <View>
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        {t('benchmark.tokens')}
                      </Text>
                      <Text className="text-sm font-medium text-gray-900 dark:text-white">
                        {result.tokensUsed}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        {t('benchmark.tokensPerSec')}
                      </Text>
                      <Text className="text-sm font-medium text-gray-900 dark:text-white">
                        {result.tokensPerSecond}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        {t('benchmark.timeToFirst')}
                      </Text>
                      <Text className="text-sm font-medium text-gray-900 dark:text-white">
                        {result.timeToFirstToken}ms
                      </Text>
                    </View>
                    <View>
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        {t('benchmark.totalTime')}
                      </Text>
                      <Text className="text-sm font-medium text-gray-900 dark:text-white">
                        {result.totalTime}ms
                      </Text>
                    </View>
                  </View>

                  {result.response ? (
                    <View className="mt-3">
                      <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {t('benchmark.results.response')}
                      </Text>
                      <View className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <Text className="text-xs text-gray-700 dark:text-gray-300" numberOfLines={6}>
                          {result.response}
                        </Text>
                      </View>
                    </View>
                  ) : null}

                  {result.error ? (
                    <Text className="text-xs text-red-500 dark:text-red-400 mt-2">
                      {t('benchmark.results.error')}: {result.error}
                    </Text>
                  ) : null}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
