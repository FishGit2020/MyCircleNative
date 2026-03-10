import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,

  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from '@mycircle/shared';
import { useWorkEntries } from './hooks/useWorkEntries';
import { EntryForm, TimelineView } from './components';

type TimeFilter = 'today' | 'thisMonth' | 'all' | 'weekdays' | 'weekends';

export default function DailyLogScreen() {
  const { t } = useTranslation();
  const {
    entries,
    loading,
    isAuthenticated,
    authChecked,
    addEntry,
    updateEntry,
    deleteEntry,
    moveEntry,
  } = useWorkEntries();
  const [filter, setFilter] = useState<TimeFilter>('all');

  const today = new Date().toISOString().split('T')[0];
  const currentMonth = today.slice(0, 7); // "2026-02"

  const filteredEntries = useMemo(() => {
    switch (filter) {
      case 'today':
        return entries.filter((e) => e.date === today);
      case 'thisMonth':
        return entries.filter((e) => e.date.startsWith(currentMonth));
      case 'weekdays': {
        return entries.filter((e) => {
          const day = new Date(e.date).getDay();
          return day >= 1 && day <= 5;
        });
      }
      case 'weekends': {
        return entries.filter((e) => {
          const day = new Date(e.date).getDay();
          return day === 0 || day === 6;
        });
      }
      default:
        return entries;
    }
  }, [entries, filter, today, currentMonth]);

  // Loading state
  if (!authChecked || loading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="px-4 pt-4">
          <Text className="text-2xl font-bold text-gray-800 dark:text-white">
            {t('dailyLog.title')}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('dailyLog.subtitle')}
          </Text>
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-gray-500 dark:text-gray-400 mt-3 text-sm">
            {t('dailyLog.loading')}
          </Text>
        </View>
      </View>
    );
  }

  // Sign-in wall
  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="px-4 pt-4 flex-1">
          <Text className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {t('dailyLog.title')}
          </Text>
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500 dark:text-gray-400 text-center">
              {t('dailyLog.signInRequired')}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const filterChips: { key: TimeFilter; label: string }[] = [
    { key: 'today', label: t('dailyLog.today') },
    { key: 'thisMonth', label: t('dailyLog.thisMonth') },
    { key: 'weekdays', label: t('dailyLog.weekdays') },
    { key: 'weekends', label: t('dailyLog.weekends') },
    { key: 'all', label: t('dailyLog.allTime') },
  ];

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pt-4 pb-20"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800 dark:text-white">
            {t('dailyLog.title')}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('dailyLog.subtitle')}
          </Text>
        </View>

        {/* Entry form */}
        <View className="mb-6">
          <EntryForm
            onSubmit={async (content) => {
              await addEntry(content);
            }}
          />
        </View>

        {/* Filter chips */}
        <View className="flex-row gap-2 mb-4 items-center">
          {filterChips.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              className={`px-3 py-2 rounded-full min-h-[44px] justify-center ${
                filter === f.key
                  ? 'bg-blue-500 dark:bg-blue-600'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}
              accessibilityLabel={f.label}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === f.key }}
            >
              <Text
                className={`text-sm font-medium ${
                  filter === f.key
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
          <Text className="text-xs text-gray-400 dark:text-gray-500 ml-2">
            {t('dailyLog.entriesCount').replace('{count}', String(filteredEntries.length))}
          </Text>
        </View>

        {/* Timeline */}
        <TimelineView
          entries={filteredEntries}
          onUpdate={updateEntry}
          onDelete={deleteEntry}
          onMove={moveEntry}
        />
      </ScrollView>
    </View>
  );
}
