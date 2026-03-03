import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@mycircle/shared';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface UsageSummary {
  totalRequests: number;
  totalTokens: number;
  averageResponseTime: number;
}

interface MonitorUsageStatsProps {
  data: UsageSummary | null;
}

interface StatCardConfig {
  labelKey: string;
  value: string;
  icon: IoniconsName;
  color: string;
  bgClass: string;
  darkBgClass: string;
}

export default function MonitorUsageStats({ data }: MonitorUsageStatsProps) {
  const { t } = useTranslation();

  const stats: StatCardConfig[] = [
    {
      labelKey: 'monitor.totalRequests',
      value: data ? data.totalRequests.toLocaleString() : '--',
      icon: 'chatbubbles-outline',
      color: '#3b82f6',
      bgClass: 'bg-blue-50',
      darkBgClass: 'dark:bg-blue-900/20',
    },
    {
      labelKey: 'monitor.totalTokens',
      value: data ? data.totalTokens.toLocaleString() : '--',
      icon: 'code-outline',
      color: '#8b5cf6',
      bgClass: 'bg-purple-50',
      darkBgClass: 'dark:bg-purple-900/20',
    },
    {
      labelKey: 'monitor.avgResponseTime',
      value: data ? `${data.averageResponseTime}${t('monitor.ms')}` : '--',
      icon: 'timer-outline',
      color: '#10b981',
      bgClass: 'bg-green-50',
      darkBgClass: 'dark:bg-green-900/20',
    },
  ];

  return (
    <View className="gap-3">
      {stats.map((stat) => (
        <View
          key={stat.labelKey}
          className={`flex-row items-center rounded-xl p-4 ${stat.bgClass} ${stat.darkBgClass}`}
        >
          <View className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 items-center justify-center mr-3">
            <Ionicons name={stat.icon} size={20} color={stat.color} />
          </View>
          <View className="flex-1">
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {t(stat.labelKey as any)}
            </Text>
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
