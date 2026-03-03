import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@mycircle/shared';
import type { BenchmarkRun } from '@mycircle/shared';

interface BenchmarkHistoryProps {
  history: BenchmarkRun[];
  onDelete: (id: string) => void;
}

export default function BenchmarkHistory({ history, onDelete }: BenchmarkHistoryProps) {
  const { t } = useTranslation();

  if (history.length === 0) {
    return (
      <View className="items-center py-8">
        <Ionicons name="time-outline" size={40} color="#9ca3af" />
        <Text className="text-gray-500 dark:text-gray-400 mt-2">
          {t('benchmark.noHistory')}
        </Text>
      </View>
    );
  }

  return (
    <View>
      <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
        {t('benchmark.history')}
      </Text>
      {history.map((run) => (
        <View
          key={run.id}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm"
        >
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-900 dark:text-white" numberOfLines={2}>
                {run.prompt}
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {new Date(run.timestamp).toLocaleString()}
              </Text>
            </View>
            <Pressable
              className="ml-2 p-1"
              onPress={() => onDelete(run.id)}
              accessibilityRole="button"
              accessibilityLabel={t('benchmark.deleteRun')}
            >
              <Ionicons name="trash-outline" size={16} color="#ef4444" />
            </Pressable>
          </View>
          <View className="flex-row items-center">
            <View className="bg-blue-100 dark:bg-blue-900/30 rounded-full px-2 py-0.5">
              <Text className="text-xs text-blue-700 dark:text-blue-300">
                {run.completedEndpoints}/{run.totalEndpoints} {t('benchmark.success').toLowerCase()}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
