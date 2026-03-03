import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@mycircle/shared';
import type { BenchmarkResult } from '@mycircle/shared';

interface BenchmarkResultsProps {
  results: BenchmarkResult[];
}

export default function BenchmarkResults({ results }: BenchmarkResultsProps) {
  const { t } = useTranslation();

  if (results.length === 0) {
    return (
      <View className="items-center py-8">
        <Text className="text-gray-500 dark:text-gray-400">
          {t('benchmark.noResults')}
        </Text>
      </View>
    );
  }

  const fastest = results.filter((r) => r.success).sort((a, b) => a.totalTime - b.totalTime)[0];

  return (
    <View className="mb-4">
      <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
        {t('benchmark.results')}
      </Text>

      {results.map((result) => {
        const isFastest = fastest && result.endpointId === fastest.endpointId;
        return (
          <View
            key={result.endpointId}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm"
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
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
              <View className={`rounded-full px-2 py-0.5 ${
                result.success
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                <Text className={`text-xs font-medium ${
                  result.success
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {result.success ? t('benchmark.success') : t('benchmark.failed')}
                </Text>
              </View>
            </View>

            <Text className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {result.model}
            </Text>

            {/* Metrics */}
            <View className="flex-row flex-wrap gap-x-4 gap-y-1">
              <Text className="text-xs text-gray-600 dark:text-gray-400">
                {t('benchmark.tokens')}: <Text className="font-medium text-gray-900 dark:text-white">{result.tokensUsed}</Text>
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-400">
                {t('benchmark.timeToFirst')}: <Text className="font-medium text-gray-900 dark:text-white">{result.timeToFirstToken}ms</Text>
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-400">
                {t('benchmark.totalTime')}: <Text className="font-medium text-gray-900 dark:text-white">{result.totalTime}ms</Text>
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-400">
                {t('benchmark.tokensPerSec')}: <Text className="font-medium text-gray-900 dark:text-white">{result.tokensPerSecond}</Text>
              </Text>
            </View>

            {result.error && (
              <Text className="text-xs text-red-500 dark:text-red-400 mt-2">
                {result.error}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}
