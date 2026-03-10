import React, { useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
  ActivityIndicator,

} from 'react-native';
import { useQuery } from '@apollo/client';
import {
  useTranslation,
  StorageKeys,
  safeSetItem,
  GET_BIBLE_VERSIONS,
} from '@mycircle/shared';

interface BibleVersion {
  id: number;
  abbreviation: string;
  title: string;
}

interface VersionsResponse {
  bibleVersions: BibleVersion[];
}

interface TranslationPickerProps {
  visible: boolean;
  currentVersionId: string;
  onSelect: (versionId: string) => void;
  onClose: () => void;
}

export default function TranslationPicker({
  visible,
  currentVersionId,
  onSelect,
  onClose,
}: TranslationPickerProps) {
  const { t } = useTranslation();
  const { data, loading, error } = useQuery<VersionsResponse>(GET_BIBLE_VERSIONS, {
    fetchPolicy: 'cache-first',
  });

  const versions = data?.bibleVersions ?? [];

  const handleSelect = useCallback(
    (versionId: string) => {
      safeSetItem(StorageKeys.BIBLE_TRANSLATION, versionId);
      onSelect(versionId);
      onClose();
    },
    [onSelect, onClose],
  );

  const renderVersion = useCallback(
    ({ item }: { item: BibleVersion }) => {
      const isSelected = String(item.id) === currentVersionId;
      return (
        <Pressable
          onPress={() => handleSelect(String(item.id))}
          accessibilityRole="button"
          accessibilityState={{ selected: isSelected }}
          accessibilityLabel={`${item.abbreviation} - ${item.title}`}
          className={`px-4 py-3.5 border-b border-gray-100 dark:border-gray-700 flex-row items-center justify-between active:bg-gray-50 dark:active:bg-gray-700 ${
            isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
          }`}
        >
          <View className="flex-1 mr-3">
            <Text
              className={`text-sm font-semibold ${
                isSelected
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-800 dark:text-gray-200'
              }`}
            >
              {item.abbreviation}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5" numberOfLines={1}>
              {item.title}
            </Text>
          </View>
          {isSelected ? (
            <Text className="text-blue-600 dark:text-blue-400 text-base">
              &#x2713;
            </Text>
          ) : null}
        </Pressable>
      );
    },
    [currentVersionId, handleSelect],
  );

  const keyExtractor = useCallback((item: BibleVersion) => String(item.id), []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white dark:bg-gray-900">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Text className="text-lg font-bold text-gray-800 dark:text-white">
            {t('bible.translation')}
          </Text>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
            className="px-3 py-1.5 rounded-lg active:bg-gray-100 dark:active:bg-gray-800"
          >
            <Text className="text-blue-600 dark:text-blue-400 font-medium">
              Done
            </Text>
          </Pressable>
        </View>

        {/* Content */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#3b82f6" size="large" />
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              {t('bible.loadingVersions')}
            </Text>
          </View>
        ) : error && versions.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-sm text-red-600 dark:text-red-400 text-center">
              {t('bible.versionError')}
            </Text>
          </View>
        ) : (
          <FlatList
            data={versions}
            renderItem={renderVersion}
            keyExtractor={keyExtractor}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Modal>
  );
}
