import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation, safeGetItem, safeSetItem } from '@mycircle/shared';

/* ── Types ───────────────────────────────────────────────── */

interface AiEndpoint {
  id: string;
  name: string;
  url: string;
  apiKey: string;
}

type TabKey = 'endpoints' | 'appInfo';

const ENDPOINTS_STORAGE_KEY = 'setup-ai-endpoints';

/* ── Component ───────────────────────────────────────────── */

export default function SetupScreen() {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<TabKey>('endpoints');
  const [endpoints, setEndpoints] = useState<AiEndpoint[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState('');

  // App Info
  const [storageUsage, setStorageUsage] = useState<string>('--');

  /* ── Persistence ─────────────────────────────────────────── */

  useEffect(() => {
    const raw = safeGetItem(ENDPOINTS_STORAGE_KEY);
    if (raw) {
      try {
        setEndpoints(JSON.parse(raw));
      } catch {
        // ignore corrupt data
      }
    }
  }, []);

  const persistEndpoints = useCallback((next: AiEndpoint[]) => {
    setEndpoints(next);
    safeSetItem(ENDPOINTS_STORAGE_KEY, JSON.stringify(next));
  }, []);

  /* ── Storage usage estimation ────────────────────────────── */

  useEffect(() => {
    try {
      const endpointData = safeGetItem(ENDPOINTS_STORAGE_KEY) || '';
      const bytes = new Blob([endpointData]).size;
      if (bytes < 1024) {
        setStorageUsage(`${bytes} B`);
      } else if (bytes < 1024 * 1024) {
        setStorageUsage(`${(bytes / 1024).toFixed(1)} KB`);
      } else {
        setStorageUsage(`${(bytes / (1024 * 1024)).toFixed(1)} MB`);
      }
    } catch {
      setStorageUsage('--');
    }
  }, [endpoints]);

  /* ── Endpoint actions ────────────────────────────────────── */

  const resetForm = () => {
    setName('');
    setUrl('');
    setApiKey('');
    setShowForm(false);
  };

  const handleAddEndpoint = () => {
    if (!name.trim() || !url.trim()) {
      Alert.alert(
        t('setup.validationError' as any),
        t('setup.fillRequired' as any),
      );
      return;
    }
    const newEndpoint: AiEndpoint = {
      id: Date.now().toString(),
      name: name.trim(),
      url: url.trim(),
      apiKey: apiKey.trim(),
    };
    persistEndpoints([...endpoints, newEndpoint]);
    resetForm();
  };

  const handleDeleteEndpoint = (id: string) => {
    Alert.alert(
      t('setup.confirmDelete' as any),
      t('setup.deleteEndpointMessage' as any),
      [
        { text: t('setup.cancel' as any), style: 'cancel' },
        {
          text: t('setup.delete' as any),
          style: 'destructive',
          onPress: () => persistEndpoints(endpoints.filter((e) => e.id !== id)),
        },
      ],
    );
  };

  const handleTestConnection = async (endpoint: AiEndpoint) => {
    setTestingId(endpoint.id);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(endpoint.url, {
        method: 'HEAD',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        Alert.alert(t('setup.testSuccess' as any), t('setup.connectionOk' as any));
      } else {
        Alert.alert(t('setup.testFailed' as any), `${t('setup.statusCode' as any)}: ${response.status}`);
      }
    } catch {
      Alert.alert(t('setup.testFailed' as any), t('setup.connectionError' as any));
    } finally {
      setTestingId(null);
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      t('setup.clearCache' as any),
      t('setup.clearCacheMessage' as any),
      [
        { text: t('setup.cancel' as any), style: 'cancel' },
        {
          text: t('setup.clear' as any),
          style: 'destructive',
          onPress: () => {
            persistEndpoints([]);
            Alert.alert(t('setup.cacheCleared' as any));
          },
        },
      ],
    );
  };

  /* ── Tab Bar ─────────────────────────────────────────────── */

  const tabs: { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'endpoints', label: t('setup.aiEndpoints' as any), icon: 'cloud-outline' },
    { key: 'appInfo', label: t('setup.appInfo' as any), icon: 'information-circle-outline' },
  ];

  /* ── Render ──────────────────────────────────────────────── */

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Tab Bar */}
      <View className="flex-row bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 items-center flex-row justify-center min-h-[44px] ${
              activeTab === tab.key
                ? 'border-b-2 border-indigo-600 dark:border-indigo-400'
                : ''
            }`}
            accessibilityLabel={tab.label}
            accessibilityRole="tab"
          >
            <Ionicons
              name={tab.icon}
              size={18}
              color={activeTab === tab.key ? '#6366f1' : '#6b7280'}
            />
            <Text
              className={`ml-2 text-sm font-medium ${
                activeTab === tab.key
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* ── AI Endpoints Tab ──────────────────────────────── */}
        {activeTab === 'endpoints' && (
          <>
            {/* Add Button */}
            <Pressable
              onPress={() => { resetForm(); setShowForm(true); }}
              className="bg-indigo-600 dark:bg-indigo-500 rounded-xl py-3 mb-4 flex-row items-center justify-center min-h-[44px]"
              accessibilityLabel={t('setup.addEndpoint' as any)}
              accessibilityRole="button"
            >
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text className="text-white font-semibold ml-2">
                {t('setup.addEndpoint' as any)}
              </Text>
            </Pressable>

            {/* Add Form */}
            {showForm && (
              <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm">
                <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                  {t('setup.newEndpoint' as any)}
                </Text>

                <Text className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                  {t('setup.endpointName' as any)}
                </Text>
                <TextInput
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 min-h-[44px]"
                  value={name}
                  onChangeText={setName}
                  placeholder={t('setup.endpointNamePlaceholder' as any)}
                  placeholderTextColor="#9ca3af"
                  accessibilityLabel={t('setup.endpointName' as any)}
                />

                <Text className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                  {t('setup.endpointUrl' as any)}
                </Text>
                <TextInput
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 min-h-[44px]"
                  value={url}
                  onChangeText={setUrl}
                  placeholder="https://api.example.com/v1"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                  keyboardType="url"
                  accessibilityLabel={t('setup.endpointUrl' as any)}
                />

                <Text className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                  {t('setup.apiKey' as any)}
                </Text>
                <TextInput
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 mb-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 min-h-[44px]"
                  value={apiKey}
                  onChangeText={setApiKey}
                  placeholder={t('setup.apiKeyPlaceholder' as any)}
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                  secureTextEntry
                  accessibilityLabel={t('setup.apiKey' as any)}
                />

                <View className="flex-row gap-3">
                  <Pressable
                    onPress={resetForm}
                    className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-lg py-3 items-center min-h-[44px] justify-center"
                    accessibilityLabel={t('setup.cancel' as any)}
                    accessibilityRole="button"
                  >
                    <Text className="text-gray-700 dark:text-gray-300 font-medium">
                      {t('setup.cancel' as any)}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleAddEndpoint}
                    className="flex-1 bg-indigo-600 dark:bg-indigo-500 rounded-lg py-3 items-center min-h-[44px] justify-center"
                    accessibilityLabel={t('setup.save' as any)}
                    accessibilityRole="button"
                  >
                    <Text className="text-white font-medium">
                      {t('setup.save' as any)}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Endpoint List */}
            {endpoints.length === 0 && !showForm && (
              <View className="items-center py-12">
                <Ionicons name="cloud-offline-outline" size={48} color="#9ca3af" />
                <Text className="text-gray-500 dark:text-gray-400 mt-3 text-base">
                  {t('setup.noEndpoints' as any)}
                </Text>
              </View>
            )}

            {endpoints.map((endpoint) => (
              <View
                key={endpoint.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-base font-semibold text-gray-900 dark:text-white flex-1 mr-2" numberOfLines={1}>
                    {endpoint.name}
                  </Text>
                  <View className="flex-row items-center">
                    <Pressable
                      onPress={() => handleTestConnection(endpoint)}
                      className="p-2 min-w-[44px] min-h-[44px] items-center justify-center"
                      accessibilityLabel={t('setup.testConnection' as any)}
                      accessibilityRole="button"
                      disabled={testingId === endpoint.id}
                    >
                      {testingId === endpoint.id ? (
                        <ActivityIndicator size="small" color="#6366f1" />
                      ) : (
                        <Ionicons name="flash-outline" size={18} color="#6366f1" />
                      )}
                    </Pressable>
                    <Pressable
                      onPress={() => handleDeleteEndpoint(endpoint.id)}
                      className="p-2 min-w-[44px] min-h-[44px] items-center justify-center"
                      accessibilityLabel={t('setup.delete' as any)}
                      accessibilityRole="button"
                    >
                      <Ionicons name="trash-outline" size={18} color="#ef4444" />
                    </Pressable>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="link-outline" size={14} color="#6b7280" />
                  <Text className="text-sm text-gray-500 dark:text-gray-400 ml-1 flex-1" numberOfLines={1}>
                    {endpoint.url}
                  </Text>
                </View>
                {endpoint.apiKey ? (
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="key-outline" size={14} color="#6b7280" />
                    <Text className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                      ••••••••{endpoint.apiKey.slice(-4)}
                    </Text>
                  </View>
                ) : null}
              </View>
            ))}
          </>
        )}

        {/* ── App Info Tab ──────────────────────────────────── */}
        {activeTab === 'appInfo' && (
          <>
            <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm">
              <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {t('setup.appInfo' as any)}
              </Text>

              {/* Version */}
              <View className="flex-row items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <View className="flex-row items-center">
                  <Ionicons name="information-circle-outline" size={18} color="#6b7280" />
                  <Text className="text-sm text-gray-700 dark:text-gray-300 ml-2">
                    {t('setup.appVersion' as any)}
                  </Text>
                </View>
                <Text className="text-sm font-medium text-gray-900 dark:text-white">
                  1.0.0
                </Text>
              </View>

              {/* Build */}
              <View className="flex-row items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <View className="flex-row items-center">
                  <Ionicons name="hammer-outline" size={18} color="#6b7280" />
                  <Text className="text-sm text-gray-700 dark:text-gray-300 ml-2">
                    {t('setup.buildInfo' as any)}
                  </Text>
                </View>
                <Text className="text-sm font-medium text-gray-900 dark:text-white">
                  {__DEV__ ? 'Development' : 'Production'}
                </Text>
              </View>

              {/* Storage */}
              <View className="flex-row items-center justify-between py-3">
                <View className="flex-row items-center">
                  <Ionicons name="server-outline" size={18} color="#6b7280" />
                  <Text className="text-sm text-gray-700 dark:text-gray-300 ml-2">
                    {t('setup.storageUsage' as any)}
                  </Text>
                </View>
                <Text className="text-sm font-medium text-gray-900 dark:text-white">
                  {storageUsage}
                </Text>
              </View>
            </View>

            {/* Clear Cache */}
            <Pressable
              onPress={handleClearCache}
              className="bg-red-600 dark:bg-red-500 rounded-xl py-3 flex-row items-center justify-center min-h-[44px]"
              accessibilityLabel={t('setup.clearCache' as any)}
              accessibilityRole="button"
            >
              <Ionicons name="trash-outline" size={20} color="#fff" />
              <Text className="text-white font-semibold ml-2">
                {t('setup.clearCache' as any)}
              </Text>
            </Pressable>
          </>
        )}

        {/* Bottom spacing */}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
