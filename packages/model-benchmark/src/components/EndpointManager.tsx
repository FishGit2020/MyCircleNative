import { useState, useCallback } from 'react';
import { View, Text, Pressable, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@mycircle/shared';
import type { BenchmarkEndpoint } from '@mycircle/shared';
import { useEndpoints } from '../hooks/useEndpoints';

interface EndpointFormData {
  name: string;
  url: string;
  model: string;
  provider: BenchmarkEndpoint['provider'];
}

const EMPTY_FORM: EndpointFormData = {
  name: '',
  url: '',
  model: '',
  provider: 'ollama',
};

export default function EndpointManager() {
  const { t } = useTranslation();
  const { endpoints, addEndpoint, updateEndpoint, deleteEndpoint } = useEndpoints();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EndpointFormData>(EMPTY_FORM);

  const resetForm = useCallback(() => {
    setForm(EMPTY_FORM);
    setShowForm(false);
    setEditingId(null);
  }, []);

  const handleAdd = useCallback(() => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  }, []);

  const handleEdit = useCallback((ep: BenchmarkEndpoint) => {
    setForm({
      name: ep.name,
      url: ep.url,
      model: ep.model,
      provider: ep.provider,
    });
    setEditingId(ep.id);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback((ep: BenchmarkEndpoint) => {
    Alert.alert(
      t('benchmark.endpoints.delete'),
      t('benchmark.endpoints.deleteConfirm'),
      [
        { text: t('benchmark.endpoints.cancel'), style: 'cancel' },
        {
          text: t('benchmark.endpoints.delete'),
          style: 'destructive',
          onPress: () => deleteEndpoint(ep.id),
        },
      ],
    );
  }, [t, deleteEndpoint]);

  const handleSave = useCallback(() => {
    if (!form.name.trim() || !form.url.trim()) return;

    if (editingId) {
      updateEndpoint(editingId, {
        name: form.name.trim(),
        url: form.url.trim(),
        model: form.model.trim(),
        provider: form.provider,
      });
    } else {
      addEndpoint({
        name: form.name.trim(),
        url: form.url.trim(),
        model: form.model.trim(),
        provider: form.provider,
      });
    }
    resetForm();
  }, [form, editingId, addEndpoint, updateEndpoint, resetForm]);

  const providers: BenchmarkEndpoint['provider'][] = ['ollama', 'openai', 'anthropic', 'custom'];

  return (
    <View>
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-base font-semibold text-gray-900 dark:text-white">
          {t('benchmark.endpoints.title')}
        </Text>
        <Pressable
          className="flex-row items-center bg-blue-500 dark:bg-blue-600 rounded-lg px-3 py-2 active:bg-blue-600 dark:active:bg-blue-700"
          onPress={handleAdd}
          accessibilityRole="button"
          accessibilityLabel={t('benchmark.endpoints.add')}
        >
          <Ionicons name="add" size={18} color="white" />
          <Text className="text-white text-sm font-medium ml-1">
            {t('benchmark.endpoints.add')}
          </Text>
        </Pressable>
      </View>

      {/* Add/Edit Form */}
      {showForm && (
        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            {editingId ? t('benchmark.endpoints.edit') : t('benchmark.endpoints.add')}
          </Text>

          {/* Name */}
          <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            {t('benchmark.endpoints.name')}
          </Text>
          <TextInput
            className="bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2.5 text-gray-900 dark:text-white text-sm mb-3 border border-gray-200 dark:border-gray-600"
            value={form.name}
            onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
            placeholder={t('benchmark.endpoints.namePlaceholder')}
            placeholderTextColor="#9ca3af"
            accessibilityLabel={t('benchmark.endpoints.name')}
          />

          {/* URL */}
          <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            {t('benchmark.endpoints.urlLabel')}
          </Text>
          <TextInput
            className="bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2.5 text-gray-900 dark:text-white text-sm mb-3 border border-gray-200 dark:border-gray-600"
            value={form.url}
            onChangeText={(text) => setForm((prev) => ({ ...prev, url: text }))}
            placeholder={t('benchmark.endpoints.urlPlaceholder')}
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            keyboardType="url"
            accessibilityLabel={t('benchmark.endpoints.urlLabel')}
          />

          {/* Model */}
          <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            {t('benchmark.endpointModel')}
          </Text>
          <TextInput
            className="bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2.5 text-gray-900 dark:text-white text-sm mb-3 border border-gray-200 dark:border-gray-600"
            value={form.model}
            onChangeText={(text) => setForm((prev) => ({ ...prev, model: text }))}
            placeholder={t('benchmark.endpoints.modelPlaceholder')}
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            accessibilityLabel={t('benchmark.endpointModel')}
          />

          {/* Provider */}
          <Text className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            {t('benchmark.endpoints.provider')}
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {providers.map((p) => (
              <Pressable
                key={p}
                className={`rounded-lg px-3 py-2 ${
                  form.provider === p
                    ? 'bg-blue-500 dark:bg-blue-600'
                    : 'bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                }`}
                onPress={() => setForm((prev) => ({ ...prev, provider: p }))}
                accessibilityRole="radio"
                accessibilityLabel={p}
              >
                <Text className={`text-sm ${
                  form.provider === p
                    ? 'text-white font-medium'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {t(`benchmark.${p}`)}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Actions */}
          <View className="flex-row gap-2">
            <Pressable
              className="flex-1 rounded-lg py-2.5 items-center bg-blue-500 dark:bg-blue-600 active:bg-blue-600 dark:active:bg-blue-700"
              onPress={handleSave}
              accessibilityRole="button"
              accessibilityLabel={t('benchmark.endpoints.save')}
            >
              <Text className="text-white font-medium text-sm">
                {t('benchmark.endpoints.save')}
              </Text>
            </Pressable>
            <Pressable
              className="flex-1 rounded-lg py-2.5 items-center bg-gray-200 dark:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600"
              onPress={resetForm}
              accessibilityRole="button"
              accessibilityLabel={t('benchmark.endpoints.cancel')}
            >
              <Text className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                {t('benchmark.endpoints.cancel')}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Endpoints List */}
      {endpoints.length === 0 ? (
        <View className="items-center py-8">
          <Ionicons name="server-outline" size={40} color="#9ca3af" />
          <Text className="text-gray-500 dark:text-gray-400 mt-2">
            {t('benchmark.endpoints.none')}
          </Text>
        </View>
      ) : (
        <View className="gap-3">
          {endpoints.map((ep) => (
            <View
              key={ep.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="text-sm font-bold text-gray-900 dark:text-white">
                    {ep.name}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {ep.model}
                  </Text>
                  <Text className="text-xs text-gray-400 dark:text-gray-500 mt-0.5" numberOfLines={1}>
                    {ep.url}
                  </Text>
                  <View className="mt-1.5">
                    <View className="bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-0.5 self-start">
                      <Text className="text-xs text-gray-600 dark:text-gray-400">
                        {t(`benchmark.${ep.provider}`)}
                      </Text>
                    </View>
                  </View>
                </View>
                <View className="flex-row gap-1 ml-2">
                  <Pressable
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600"
                    onPress={() => handleEdit(ep)}
                    accessibilityRole="button"
                    accessibilityLabel={t('benchmark.endpoints.edit')}
                  >
                    <Ionicons name="pencil-outline" size={16} color="#6b7280" />
                  </Pressable>
                  <Pressable
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 active:bg-red-100 dark:active:bg-red-900/30"
                    onPress={() => handleDelete(ep)}
                    accessibilityRole="button"
                    accessibilityLabel={t('benchmark.endpoints.delete')}
                  >
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
