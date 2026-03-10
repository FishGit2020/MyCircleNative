import { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@mycircle/shared';
import { useImmigrationCases } from './hooks/useImmigrationCases';
import CaseCard from './components/CaseCard';
import AddCaseForm from './components/AddCaseForm';
import type { FormType } from '@mycircle/shared';

export default function ImmigrationTrackerScreen() {
  const { t } = useTranslation();
  const { cases, loading, addCase, removeCase, refreshCase } = useImmigrationCases();
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [autoFetching, setAutoFetching] = useState(false);
  const hasFetchedRef = useRef(false);

  // Auto-fetch status for all saved cases on mount
  useEffect(() => {
    if (cases.length > 0 && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      setAutoFetching(true);
      Promise.all(cases.map((c) => refreshCase(c.id)))
        .finally(() => setAutoFetching(false));
    }
  }, [cases, refreshCase]);

  const handleAddCase = useCallback(
    (receiptNumber: string, formType: FormType, nickname: string) => {
      addCase(receiptNumber, formType, nickname);
      setShowAddForm(false);
    },
    [addCase],
  );

  const handleDelete = useCallback(
    (caseId: string) => {
      removeCase(caseId);
    },
    [removeCase],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all(cases.map((c) => refreshCase(c.id)));
    } finally {
      setRefreshing(false);
    }
  }, [cases, refreshCase]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pt-4 pb-20"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('immigration.title')}
          </Text>
          <Pressable
            className="w-11 h-11 rounded-full bg-blue-500 dark:bg-blue-600 items-center justify-center active:bg-blue-600 dark:active:bg-blue-700"
            onPress={() => setShowAddForm(!showAddForm)}
            accessibilityRole="button"
            accessibilityLabel={t('immigration.addCase')}
          >
            <Ionicons name={showAddForm ? 'close' : 'add'} size={24} color="white" />
          </Pressable>
        </View>
        <Text className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {t('immigration.subtitle')}
        </Text>

        {/* Auto-fetch loading indicator */}
        {autoFetching && (
          <View className="flex-row items-center gap-2 mb-4 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <ActivityIndicator size="small" color="#3b82f6" />
            <Text className="text-sm text-blue-600 dark:text-blue-400">
              {t('immigration.fetchingAllCases')}
            </Text>
          </View>
        )}

        {/* Add Case Form */}
        {showAddForm && (
          <AddCaseForm
            onSubmit={handleAddCase}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {/* Cases List */}
        {cases.length === 0 ? (
          <View className="items-center py-16">
            <Ionicons name="document-text-outline" size={48} color="#9ca3af" />
            <Text className="text-gray-500 dark:text-gray-400 mt-4 text-center">
              {t('immigration.noCases')}
            </Text>
          </View>
        ) : (
          cases.map((caseItem) => (
            <CaseCard
              key={caseItem.id}
              caseItem={caseItem}
              onRefresh={refreshCase}
              onDelete={handleDelete}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
