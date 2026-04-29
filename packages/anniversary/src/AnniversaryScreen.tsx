import { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@mycircle/shared';

interface Anniversary {
  id: string;
  title: string;
  originalDate: string;
  daysUntilNext: number;
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const original = new Date(dateStr);
  const thisYear = new Date(today.getFullYear(), original.getMonth(), original.getDate());
  const next = thisYear < today
    ? new Date(today.getFullYear() + 1, original.getMonth(), original.getDate())
    : thisYear;
  return Math.round((next.getTime() - today.getTime()) / 86400000);
}

export default function AnniversaryScreen() {
  const { t } = useTranslation();

  const anniversaries: Anniversary[] = useMemo(() => [], []);
  const loading = false;

  const sorted = useMemo(
    () =>
      anniversaries
        .map((a) => ({ ...a, daysUntilNext: daysUntil(a.originalDate) }))
        .sort((a, b) => a.daysUntilNext - b.daysUntilNext),
    [anniversaries],
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {t('anniversary.title')}
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t('anniversary.subtitle')}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('anniversary.add')}
          className="flex-row items-center justify-center bg-blue-500 dark:bg-blue-600 rounded-xl py-3 mb-4"
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text className="ml-2 text-white font-semibold">{t('anniversary.add')}</Text>
        </Pressable>

        {sorted.length === 0 ? (
          <View className="py-12 items-center">
            <Ionicons name="calendar-outline" size={48} color="#9ca3af" />
            <Text className="mt-3 text-gray-500 dark:text-gray-400">
              {t('anniversary.empty')}
            </Text>
          </View>
        ) : (
          sorted.map((a) => (
            <View
              key={a.id}
              className="mb-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <Text className="text-base font-semibold text-gray-900 dark:text-white">
                {a.title}
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {t('anniversary.daysUntil')}: {a.daysUntilNext}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
