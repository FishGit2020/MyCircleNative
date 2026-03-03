import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@mycircle/shared';
import type { ImmigrationCase } from '@mycircle/shared';
import { getStatusBadgeClass } from '../utils/statusColors';

interface CaseCardProps {
  caseItem: ImmigrationCase;
  onRefresh: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function CaseCard({ caseItem, onRefresh, onDelete }: CaseCardProps) {
  const { t } = useTranslation();
  const badgeClass = getStatusBadgeClass(caseItem.status);

  const formatDate = (ts: number) => {
    if (!ts) return '--';
    return new Date(ts).toLocaleDateString();
  };

  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            {caseItem.nickname || caseItem.receiptNumber}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {caseItem.receiptNumber} {'\u2022'} {caseItem.formType}
          </Text>
        </View>
      </View>

      {/* Status Badge */}
      <View className={`self-start rounded-full px-3 py-1 mb-3 ${badgeClass}`}>
        <Text className={`text-xs font-medium ${badgeClass}`}>
          {caseItem.status}
        </Text>
      </View>

      {/* Last Checked */}
      <Text className="text-xs text-gray-400 dark:text-gray-500 mb-3">
        {t('immigration.lastChecked')}: {formatDate(caseItem.lastChecked)}
      </Text>

      {/* Actions */}
      <View className="flex-row gap-2">
        <Pressable
          className="flex-1 flex-row items-center justify-center bg-blue-50 dark:bg-blue-900/20 rounded-lg py-2.5 active:bg-blue-100 dark:active:bg-blue-900/40"
          onPress={() => onRefresh(caseItem.id)}
          accessibilityRole="button"
          accessibilityLabel={t('immigration.refresh')}
        >
          <Ionicons name="refresh-outline" size={16} color="#3b82f6" />
          <Text className="text-sm font-medium text-blue-600 dark:text-blue-400 ml-1">
            {t('immigration.refresh')}
          </Text>
        </Pressable>
        <Pressable
          className="flex-row items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-2.5 active:bg-red-100 dark:active:bg-red-900/40"
          onPress={() => onDelete(caseItem.id)}
          accessibilityRole="button"
          accessibilityLabel={t('immigration.delete')}
        >
          <Ionicons name="trash-outline" size={16} color="#ef4444" />
        </Pressable>
      </View>
    </View>
  );
}
