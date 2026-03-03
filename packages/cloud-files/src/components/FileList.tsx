import { useState } from 'react';
import { View, Text, TextInput, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@mycircle/shared';
import type { CloudFile } from '@mycircle/shared';
import FileCard from './FileCard';

interface FileListProps {
  files: CloudFile[];
  onDelete: (id: string) => void;
  onShare: (id: string) => void;
  emptyMessage: string;
}

export default function FileList({ files, onDelete, onShare, emptyMessage }: FileListProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const filtered = search
    ? files.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    : files;

  return (
    <View className="flex-1">
      {/* Search */}
      <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 mb-4">
        <Ionicons name="search-outline" size={18} color="#9ca3af" />
        <TextInput
          className="flex-1 ml-2 text-gray-900 dark:text-white text-sm"
          value={search}
          onChangeText={setSearch}
          placeholder={t('cloudFiles.searchPlaceholder')}
          placeholderTextColor="#9ca3af"
          accessibilityLabel={t('cloudFiles.searchPlaceholder')}
        />
      </View>

      {filtered.length === 0 ? (
        <View className="items-center py-16">
          <Ionicons name="folder-open-outline" size={48} color="#9ca3af" />
          <Text className="text-gray-500 dark:text-gray-400 mt-4 text-center">
            {search ? t('cloudFiles.noResults') : emptyMessage}
          </Text>
        </View>
      ) : (
        filtered.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            onDelete={onDelete}
            onShare={onShare}
          />
        ))
      )}
    </View>
  );
}
