import { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@mycircle/shared';
import { useBenchmark } from './hooks/useBenchmark';
import PromptPicker from './components/PromptPicker';
import BenchmarkResults from './components/BenchmarkResults';
import BenchmarkHistory from './components/BenchmarkHistory';

export default function ModelBenchmarkScreen() {
  const { t } = useTranslation();
  const {
    endpoints,
    selectedEndpoints,
    toggleEndpoint,
    results,
    running,
    runBenchmark,
    history,
    saveRun,
    deleteRun,
  } = useBenchmark();
  const [prompt, setPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'benchmark' | 'history'>('benchmark');

  const handleRun = useCallback(async () => {
    if (!prompt || running) return;
    const runResults = await runBenchmark(prompt);
    saveRun(prompt, runResults);
  }, [prompt, running, runBenchmark, saveRun]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pt-4 pb-20"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
          {t('benchmark.title')}
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {t('benchmark.subtitle')}
        </Text>

        {/* Tabs */}
        <View className="flex-row mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <Pressable
            className={`flex-1 py-2.5 rounded-md items-center ${
              activeTab === 'benchmark' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''
            }`}
            onPress={() => setActiveTab('benchmark')}
            accessibilityRole="tab"
            accessibilityLabel={t('benchmark.results')}
          >
            <Text className={`text-sm font-medium ${
              activeTab === 'benchmark' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {t('benchmark.results')}
            </Text>
          </Pressable>
          <Pressable
            className={`flex-1 py-2.5 rounded-md items-center ${
              activeTab === 'history' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''
            }`}
            onPress={() => setActiveTab('history')}
            accessibilityRole="tab"
            accessibilityLabel={t('benchmark.history')}
          >
            <Text className={`text-sm font-medium ${
              activeTab === 'history' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {t('benchmark.history')}
            </Text>
          </Pressable>
        </View>

        {activeTab === 'benchmark' ? (
          <>
            {/* Endpoint Selection */}
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              {t('benchmark.selectEndpoints')}
            </Text>
            <View className="gap-2 mb-4">
              {endpoints.map((ep) => (
                <Pressable
                  key={ep.id}
                  className={`flex-row items-center rounded-lg px-3 py-2.5 ${
                    selectedEndpoints.has(ep.id)
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700'
                      : 'bg-gray-100 dark:bg-gray-800 border border-transparent'
                  }`}
                  onPress={() => toggleEndpoint(ep.id)}
                  accessibilityRole="checkbox"
                  accessibilityLabel={ep.name}
                >
                  <Ionicons
                    name={selectedEndpoints.has(ep.id) ? 'checkbox' : 'square-outline'}
                    size={20}
                    color={selectedEndpoints.has(ep.id) ? '#3b82f6' : '#9ca3af'}
                  />
                  <View className="ml-2">
                    <Text className="text-sm font-medium text-gray-900 dark:text-white">
                      {ep.name}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      {ep.model}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>

            {/* Prompt Picker */}
            <PromptPicker onSelect={setPrompt} selectedPrompt={prompt} />

            {/* Run Button */}
            <Pressable
              className={`rounded-xl py-3.5 items-center mb-6 ${
                running || !prompt
                  ? 'bg-gray-300 dark:bg-gray-700'
                  : 'bg-blue-500 dark:bg-blue-600 active:bg-blue-600 dark:active:bg-blue-700'
              }`}
              onPress={handleRun}
              disabled={running || !prompt}
              accessibilityRole="button"
              accessibilityLabel={running ? t('benchmark.running') : t('benchmark.run')}
            >
              {running ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-bold ml-2">{t('benchmark.running')}</Text>
                </View>
              ) : (
                <Text className="text-white font-bold">{t('benchmark.run')}</Text>
              )}
            </Pressable>

            {/* Results */}
            <BenchmarkResults results={results} />
          </>
        ) : (
          <BenchmarkHistory history={history} onDelete={deleteRun} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
