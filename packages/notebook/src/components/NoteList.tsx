import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@mycircle/shared';
import type { Note, PublicNote } from '../types';
import NoteCard from './NoteCard';

interface NoteListProps {
  notes: (Note | PublicNote)[];
  onSelect: (note: Note | PublicNote) => void;
  onDelete: (id: string) => void;
  isPublicView?: boolean;
}

export default function NoteList({
  notes,
  onSelect,
  onDelete,
  isPublicView,
}: NoteListProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return notes;
    const q = search.toLowerCase();
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q),
    );
  }, [notes, search]);

  const renderItem = ({ item }: { item: Note | PublicNote }) => (
    <NoteCard
      note={item}
      onPress={() => onSelect(item)}
      onDelete={() => onDelete(item.id)}
    />
  );

  const emptyComponent = () => {
    if (notes.length === 0) {
      return (
        <View className="items-center py-12">
          <Ionicons name="document-text-outline" size={48} color="#d1d5db" />
          <Text className="text-gray-500 dark:text-gray-400 mt-3 text-center">
            {isPublicView
              ? t('notebook.noPublicNotes')
              : t('notebook.noNotes')}
          </Text>
        </View>
      );
    }
    return (
      <View className="items-center py-8">
        <Text className="text-gray-500 dark:text-gray-400 text-center">
          {t('notebook.noResults')}
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1">
      {/* Search bar */}
      <View className="flex-row items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 mb-4">
        <Ionicons name="search-outline" size={18} color="#9ca3af" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={t('notebook.searchPlaceholder')}
          placeholderTextColor="#9ca3af"
          accessibilityLabel={t('notebook.searchPlaceholder')}
          className="flex-1 py-2.5 px-2 text-sm text-gray-900 dark:text-white"
          style={{ minHeight: 44 }}
        />
      </View>

      {/* Note count */}
      {notes.length > 0 && (
        <Text className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          {t('notebook.noteCount').replace('{count}', String(filtered.length))}
        </Text>
      )}

      {/* Notes list */}
      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={emptyComponent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}
