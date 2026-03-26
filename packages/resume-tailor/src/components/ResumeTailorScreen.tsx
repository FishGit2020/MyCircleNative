import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from '@apollo/client';
import {
  useTranslation,
  safeGetItem,
  safeSetItem,
  StorageKeys,
  eventBus,
} from '@mycircle/shared';

type Tab = 'factBank' | 'generator' | 'applications';

interface Fact {
  id: string;
  text: string;
  createdAt: string;
}

interface Application {
  id: string;
  company: string;
  position: string;
  date: string;
}

const ENDPOINTS = ['GPT-4o', 'Claude', 'Gemini'] as const;

export default function ResumeTailorScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('factBank');

  const tabs: { key: Tab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'factBank', label: t('resumeTailor.factBank' as any), icon: 'library-outline' },
    { key: 'generator', label: t('resumeTailor.generator' as any), icon: 'document-text-outline' },
    { key: 'applications', label: t('resumeTailor.applications' as any), icon: 'briefcase-outline' },
  ];

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Tab bar */}
      <View className="flex-row bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 items-center min-h-[44px] justify-center ${
                active ? 'border-b-2 border-blue-600 dark:border-blue-400' : ''
              }`}
              accessibilityLabel={tab.label}
              accessibilityRole="tab"
            >
              <Ionicons
                name={tab.icon}
                size={20}
                color={active ? '#3b82f6' : '#9ca3af'}
              />
              <Text
                className={`text-xs mt-1 ${
                  active
                    ? 'text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {activeTab === 'factBank' && <FactBankTab />}
      {activeTab === 'generator' && <GeneratorTab />}
      {activeTab === 'applications' && <ApplicationsTab />}
    </View>
  );
}

/* ─── Fact Bank Tab ─── */
function FactBankTab() {
  const { t } = useTranslation();
  const [facts, setFacts] = useState<Fact[]>(() => {
    const stored = safeGetItem(StorageKeys.RESUME_FACTS as any);
    return stored ? JSON.parse(stored) : [];
  });
  const [newFact, setNewFact] = useState('');

  const saveFacts = useCallback(
    (updated: Fact[]) => {
      setFacts(updated);
      safeSetItem(StorageKeys.RESUME_FACTS as any, JSON.stringify(updated));
    },
    [],
  );

  const addFact = useCallback(() => {
    if (!newFact.trim()) return;
    const fact: Fact = {
      id: Date.now().toString(),
      text: newFact.trim(),
      createdAt: new Date().toISOString(),
    };
    saveFacts([fact, ...facts]);
    setNewFact('');
  }, [newFact, facts, saveFacts]);

  const removeFact = useCallback(
    (id: string) => {
      saveFacts(facts.filter((f) => f.id !== id));
    },
    [facts, saveFacts],
  );

  return (
    <ScrollView className="flex-1 px-4 pt-4">
      <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">
        {t('resumeTailor.factBankTitle' as any)}
      </Text>
      <Text className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {t('resumeTailor.factBankDesc' as any)}
      </Text>

      {/* Add fact input */}
      <View className="flex-row mb-4">
        <TextInput
          className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-l-xl px-4 py-3 text-base text-gray-900 dark:text-white"
          placeholder={t('resumeTailor.addFactPlaceholder' as any)}
          placeholderTextColor="#9ca3af"
          value={newFact}
          onChangeText={setNewFact}
          multiline
          accessibilityLabel={t('resumeTailor.addFactPlaceholder' as any)}
        />
        <Pressable
          onPress={addFact}
          className="bg-blue-600 dark:bg-blue-500 rounded-r-xl px-4 min-w-[44px] min-h-[44px] items-center justify-center"
          accessibilityLabel={t('resumeTailor.save' as any)}
          accessibilityRole="button"
        >
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>

      {/* Facts list */}
      {facts.length === 0 ? (
        <View className="items-center py-12">
          <Ionicons name="library-outline" size={48} color="#9ca3af" />
          <Text className="text-gray-500 dark:text-gray-400 mt-3">
            {t('resumeTailor.noFacts' as any)}
          </Text>
        </View>
      ) : (
        facts.map((fact) => (
          <View
            key={fact.id}
            className="flex-row items-start bg-white dark:bg-gray-800 rounded-xl p-4 mb-2 border border-gray-200 dark:border-gray-700"
          >
            <Text className="flex-1 text-base text-gray-900 dark:text-white">
              {fact.text}
            </Text>
            <Pressable
              onPress={() => removeFact(fact.id)}
              className="min-w-[44px] min-h-[44px] items-center justify-center"
              accessibilityLabel={t('resumeTailor.deleteFact' as any)}
              accessibilityRole="button"
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </Pressable>
          </View>
        ))
      )}
    </ScrollView>
  );
}

/* ─── Generator Tab ─── */
function GeneratorTab() {
  const { t } = useTranslation();
  const [jobDescription, setJobDescription] = useState('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>(ENDPOINTS[0]);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState('');

  const handleGenerate = useCallback(async () => {
    if (!jobDescription.trim()) {
      Alert.alert(t('resumeTailor.errorTitle' as any), t('resumeTailor.pasteJobDesc' as any));
      return;
    }
    setGenerating(true);
    setResult('');
    try {
      // Simulate generation — in production this calls a mutation
      eventBus.publish('resume:generate', {
        jobDescription,
        endpoint: selectedEndpoint,
      });
      // Placeholder result
      setTimeout(() => {
        setResult(t('resumeTailor.generatedPlaceholder' as any));
        setGenerating(false);
      }, 2000);
    } catch {
      setGenerating(false);
      Alert.alert(t('resumeTailor.errorTitle' as any), t('resumeTailor.generateError' as any));
    }
  }, [jobDescription, selectedEndpoint, t]);

  return (
    <ScrollView className="flex-1 px-4 pt-4">
      <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">
        {t('resumeTailor.generatorTitle' as any)}
      </Text>

      {/* Job description input */}
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {t('resumeTailor.jobDescription' as any)}
      </Text>
      <TextInput
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white mb-4 min-h-[120px]"
        placeholder={t('resumeTailor.pasteJobDesc' as any)}
        placeholderTextColor="#9ca3af"
        value={jobDescription}
        onChangeText={setJobDescription}
        multiline
        textAlignVertical="top"
        accessibilityLabel={t('resumeTailor.jobDescription' as any)}
      />

      {/* Endpoint selector */}
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {t('resumeTailor.selectModel' as any)}
      </Text>
      <View className="flex-row gap-2 mb-4">
        {ENDPOINTS.map((ep) => {
          const active = selectedEndpoint === ep;
          return (
            <Pressable
              key={ep}
              onPress={() => setSelectedEndpoint(ep)}
              className={`px-4 py-2 rounded-full min-h-[44px] justify-center ${
                active
                  ? 'bg-blue-600 dark:bg-blue-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
              accessibilityLabel={ep}
              accessibilityRole="button"
            >
              <Text
                className={`text-sm font-medium ${
                  active ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {ep}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Generate button */}
      <Pressable
        onPress={handleGenerate}
        disabled={generating}
        className="bg-green-600 dark:bg-green-500 rounded-xl py-4 items-center min-h-[44px] justify-center mb-4"
        accessibilityLabel={t('resumeTailor.generate' as any)}
        accessibilityRole="button"
      >
        {generating ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold text-base">
            {t('resumeTailor.generate' as any)}
          </Text>
        )}
      </Pressable>

      {/* Result */}
      {result ? (
        <View className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-8">
          <Text className="text-base text-gray-900 dark:text-white">{result}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

/* ─── Applications Tab ─── */
function ApplicationsTab() {
  const { t } = useTranslation();
  const [applications] = useState<Application[]>(() => {
    const stored = safeGetItem(StorageKeys.RESUME_APPLICATIONS as any);
    return stored ? JSON.parse(stored) : [];
  });

  return (
    <View className="flex-1">
      {applications.length === 0 ? (
        <View className="flex-1 justify-center items-center py-20">
          <Ionicons name="briefcase-outline" size={48} color="#9ca3af" />
          <Text className="text-gray-500 dark:text-gray-400 mt-3 text-base">
            {t('resumeTailor.noApplications' as any)}
          </Text>
        </View>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 border border-gray-200 dark:border-gray-700">
              <Text className="text-base font-semibold text-gray-900 dark:text-white">
                {item.company}
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {item.position}
              </Text>
              <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {new Date(item.date).toLocaleDateString()}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
