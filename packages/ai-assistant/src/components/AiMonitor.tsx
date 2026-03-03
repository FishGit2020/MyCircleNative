import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useQuery } from '@apollo/client';
import { GET_AI_USAGE_SUMMARY, useTranslation } from '@mycircle/shared';
import MonitorUsageStats from './MonitorUsageStats';
import MonitorOllamaStatus from './MonitorOllamaStatus';
import MonitorRecentLogs from './MonitorRecentLogs';

type MonitorTab = 'usage' | 'logs' | 'ollama';

export default function AiMonitor() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<MonitorTab>('usage');

  const { data: usageData } = useQuery(GET_AI_USAGE_SUMMARY, {
    fetchPolicy: 'cache-and-network',
  });

  const tabs: { key: MonitorTab; label: string }[] = [
    { key: 'usage', label: t('monitor.usage') },
    { key: 'logs', label: t('monitor.logs') },
    { key: 'ollama', label: t('monitor.ollama') },
  ];

  return (
    <View className="flex-1">
      {/* Tabs */}
      <View className="flex-row mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            className={`flex-1 py-2 rounded-md items-center ${
              activeTab === tab.key ? 'bg-white dark:bg-gray-700 shadow-sm' : ''
            }`}
            onPress={() => setActiveTab(tab.key)}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
          >
            <Text
              className={`text-sm font-medium ${
                activeTab === tab.key
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      {activeTab === 'usage' && (
        <MonitorUsageStats data={usageData?.aiUsageSummary ?? null} />
      )}
      {activeTab === 'logs' && <MonitorRecentLogs />}
      {activeTab === 'ollama' && <MonitorOllamaStatus />}
    </View>
  );
}
