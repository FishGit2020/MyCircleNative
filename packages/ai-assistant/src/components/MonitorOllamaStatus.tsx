import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@apollo/client';
import { GET_OLLAMA_STATUS, useTranslation } from '@mycircle/shared';

export default function MonitorOllamaStatus() {
  const { t } = useTranslation();
  const { data, loading, refetch } = useQuery(GET_OLLAMA_STATUS, {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  });

  const status = data?.ollamaStatus;
  const isRunning = status?.running ?? false;

  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-semibold text-gray-900 dark:text-white">
          {t('monitor.ollama')}
        </Text>
        <Pressable
          onPress={() => refetch()}
          className="p-2 active:bg-gray-100 dark:active:bg-gray-700 rounded-lg"
          accessibilityRole="button"
          accessibilityLabel={t('monitor.refreshStatus')}
        >
          <Ionicons name="refresh-outline" size={18} color="#6b7280" />
        </Pressable>
      </View>

      {/* Status indicator */}
      <View className="flex-row items-center mb-3">
        <View className={`w-3 h-3 rounded-full mr-2 ${isRunning ? 'bg-green-500' : 'bg-red-500'}`} />
        <Text className="text-sm text-gray-700 dark:text-gray-300">
          {isRunning ? t('monitor.ollamaRunning') : t('monitor.ollamaStopped')}
        </Text>
      </View>

      {isRunning && status?.version && (
        <Text className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          {t('monitor.ollamaVersion')}: {status.version}
        </Text>
      )}

      {/* Models */}
      {isRunning && status?.models?.length > 0 && (
        <View>
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('monitor.ollamaModels')}
          </Text>
          {status.models.map((model: any, i: number) => (
            <View key={i} className="flex-row items-center justify-between py-1.5">
              <Text className="text-sm text-gray-900 dark:text-white">{model.name}</Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {model.size}
              </Text>
            </View>
          ))}
        </View>
      )}

      {isRunning && (!status?.models || status.models.length === 0) && (
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          {t('monitor.noModels')}
        </Text>
      )}
    </View>
  );
}
