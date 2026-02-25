import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import { useTranslation } from '@mycircle/shared';
import { useNotes } from './hooks/useNotes';
import { usePublicNotes } from './hooks/usePublicNotes';
import { NoteList, NoteEditor } from './components';
import type { Note, PublicNote } from './types';

type ViewMode = 'list' | 'new' | 'edit';
type Tab = 'my' | 'public';

export default function NotebookScreen() {
  const { t } = useTranslation();
  const user = auth().currentUser;
  const {
    notes,
    loading,
    error,
    saveNote,
    deleteNote,
    reload,
  } = useNotes();
  const {
    notes: publicNotes,
    loading: publicLoading,
    error: publicError,
    publishNote,
    updateNote: updatePublicNote,
    deleteNote: deletePublicNote,
    reload: reloadPublic,
  } = usePublicNotes();

  const [tab, setTab] = useState<Tab>('my');
  const [view, setView] = useState<ViewMode>('list');
  const [selectedNote, setSelectedNote] = useState<Note | PublicNote | null>(
    null,
  );

  // ── Auth wall ──
  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="lock-closed-outline" size={48} color="#d1d5db" />
          <Text className="text-gray-500 dark:text-gray-400 mt-3 text-center">
            {t('notebook.loginToUse')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Loading ──
  const isLoading = tab === 'my' ? loading : publicLoading;
  const currentError = tab === 'my' ? error : publicError;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </SafeAreaView>
    );
  }

  // ── Error ──
  if (currentError) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-500 dark:text-red-400 text-center">
            {currentError}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Handlers ──

  const handleSave = async (
    id: string | null,
    data: { title: string; content: string },
  ) => {
    if (tab === 'public' && id) {
      await updatePublicNote(id, data);
    } else {
      await saveNote(id, data);
    }
    setView('list');
    setSelectedNote(null);
  };

  const handleDelete = async (id: string) => {
    if (tab === 'public') {
      await deletePublicNote(id);
    } else {
      await deleteNote(id);
    }
    if (view === 'edit') {
      setView('list');
      setSelectedNote(null);
    }
  };

  const handleDeleteFromList = (id: string) => {
    Alert.alert(t('notebook.deleteNote'), t('notebook.deleteConfirm'), [
      { text: t('notebook.cancel'), style: 'cancel' },
      {
        text: t('notebook.deleteNote'),
        style: 'destructive',
        onPress: () => handleDelete(id),
      },
    ]);
  };

  const handlePublish = async (data: {
    title: string;
    content: string;
  }) => {
    await publishNote(data);
    setView('list');
    setSelectedNote(null);
  };

  const handleSelect = (note: Note | PublicNote) => {
    setSelectedNote(note);
    setView('edit');
  };

  const handleNew = () => {
    setSelectedNote(null);
    setView('new');
  };

  const handleCancel = () => {
    setView('list');
    setSelectedNote(null);
  };

  // ── Editor view ──
  if (view === 'new' || view === 'edit') {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <NoteEditor
          note={view === 'edit' ? selectedNote : null}
          onSave={handleSave}
          onCancel={handleCancel}
          onDelete={view === 'edit' ? handleDelete : undefined}
          onPublish={tab === 'my' ? handlePublish : undefined}
        />
      </SafeAreaView>
    );
  }

  // ── List view ──
  const tabItems: { key: Tab; label: string }[] = [
    { key: 'my', label: t('notebook.myNotes') },
    { key: 'public', label: t('notebook.publicNotes') },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="px-4 pt-4 pb-2">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('notebook.title')}
          </Text>
          <View className="flex-row items-center gap-2">
            {/* Refresh */}
            <Pressable
              onPress={() => {
                reload();
                reloadPublic();
              }}
              accessibilityRole="button"
              accessibilityLabel={t('notebook.refresh')}
              className="p-2 rounded-lg active:bg-gray-100 dark:active:bg-gray-700"
              style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="refresh-outline" size={20} color="#9ca3af" />
            </Pressable>
            {/* New Note */}
            <Pressable
              onPress={handleNew}
              accessibilityRole="button"
              accessibilityLabel={t('notebook.newNote')}
              className="flex-row items-center gap-1.5 px-4 py-2 bg-blue-600 rounded-lg active:bg-blue-700"
              style={{ minHeight: 44 }}
            >
              <Ionicons name="add" size={18} color="#ffffff" />
              <Text className="text-white font-medium text-sm">
                {t('notebook.newNote')}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Tab bar */}
        <View className="flex-row border-b border-gray-200 dark:border-gray-700">
          {tabItems.map(({ key, label }) => (
            <Pressable
              key={key}
              onPress={() => setTab(key)}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected: tab === key }}
              className={`px-4 py-2.5 border-b-2 ${
                tab === key
                  ? 'border-blue-500'
                  : 'border-transparent'
              }`}
              style={{ minHeight: 44 }}
            >
              <Text
                className={`text-sm font-medium ${
                  tab === key
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Note list */}
      <View className="flex-1 px-4">
        <NoteList
          notes={tab === 'my' ? notes : publicNotes}
          onSelect={handleSelect}
          onDelete={handleDeleteFromList}
          isPublicView={tab === 'public'}
        />
      </View>
    </SafeAreaView>
  );
}
