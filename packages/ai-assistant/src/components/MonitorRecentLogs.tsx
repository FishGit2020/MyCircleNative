import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@apollo/client';
import { GET_AI_RECENT_LOGS, useTranslation } from '@mycircle/shared';

interface LogEntry {
  id: string;
  timestamp: number;
  model: string;
  prompt: string;
  response: string;
  tokens: number;
  responseTime: number;
  success: boolean;
  error?: string;
}

export default function MonitorRecentLogs() {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data } = useQuery(GET_AI_RECENT_LOGS, {
    variables: { limit: 20 },
    fetchPolicy: 'cache-and-network',
  });

  const logs: LogEntry[] = data?.aiRecentLogs ?? [];

  if (logs.length === 0) {
    return (
      <View className="items-center py-8">
        <Ionicons name="document-text-outline" size={40} color="#9ca3af" />
        <Text className="text-gray-500 dark:text-gray-400 mt-2">
          {t('monitor.noLogs')}
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-2">
      {logs.map((log) => (
        <Pressable
          key={log.id}
          className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm"
          onPress={() => setExpandedId(expandedId === log.id ? null : log.id)}
          accessibilityRole="button"
          accessibilityLabel={t('monitor.logDetails')}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-sm text-gray-900 dark:text-white" numberOfLines={1}>
                {log.prompt}
              </Text>
              <View className="flex-row items-center mt-1 gap-2">
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {log.model}
                </Text>
                <Text className="text-xs text-gray-400 dark:text-gray-500">
                  {log.responseTime}{t('monitor.ms')}
                </Text>
                <Text className="text-xs text-gray-400 dark:text-gray-500">
                  {log.tokens} tokens
                </Text>
              </View>
            </View>
            <View className={`w-2 h-2 rounded-full ml-2 ${log.success ? 'bg-green-500' : 'bg-red-500'}`} />
          </View>

          {expandedId === log.id && (
            <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <Text className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('monitor.response')}
              </Text>
              <Text className="text-xs text-gray-700 dark:text-gray-300" numberOfLines={5}>
                {log.response}
              </Text>
              {log.error && (
                <Text className="text-xs text-red-500 dark:text-red-400 mt-2">
                  {log.error}
                </Text>
              )}
            </View>
          )}
        </Pressable>
      ))}
    </View>
  );
}
