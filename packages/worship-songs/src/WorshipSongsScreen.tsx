import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTranslation } from '@mycircle/shared';
import { useWorshipSongs } from './hooks/useWorshipSongs';
import { SongList, SongViewer, SongEditor } from './components';
import type { WorshipSong } from './types';

type ViewMode = 'list' | 'view' | 'edit' | 'new';

export default function WorshipSongsScreen() {
  const { t } = useTranslation();
  const {
    songs,
    loading,
    isAuthenticated,
    addSong,
    updateSong,
    deleteSong,
    getSong,
    refresh,
  } = useWorshipSongs();

  const [view, setView] = useState<ViewMode>('list');
  const [selectedSong, setSelectedSong] = useState<WorshipSong | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [songLoading, setSongLoading] = useState(false);

  const handleSelectSong = useCallback(
    async (id: string) => {
      setSongLoading(true);
      setErrorMsg(null);
      try {
        const song = await getSong(id);
        if (song) {
          setSelectedSong(song);
          setView('view');
        } else {
          setErrorMsg(t('worship.loadError'));
        }
      } catch {
        setErrorMsg(t('worship.loadError'));
      } finally {
        setSongLoading(false);
      }
    },
    [getSong, t],
  );

  const handleNewSong = useCallback(() => {
    setView('new');
  }, []);

  const handleEdit = useCallback(() => {
    if (selectedSong) {
      setView('edit');
    }
  }, [selectedSong]);

  const handleBack = useCallback(() => {
    setSelectedSong(null);
    setView('list');
  }, []);

  const handleSaveNew = useCallback(
    async (data: Omit<WorshipSong, 'id' | 'createdAt' | 'updatedAt'>) => {
      const id = await addSong(data);
      const song = await getSong(id);
      if (song) {
        setSelectedSong(song);
        setView('view');
      } else {
        setView('list');
      }
    },
    [addSong, getSong],
  );

  const handleSaveEdit = useCallback(
    async (data: Omit<WorshipSong, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!selectedSong) return;
      await updateSong(selectedSong.id, data);
      const updated = await getSong(selectedSong.id);
      if (updated) setSelectedSong(updated);
      setView('view');
    },
    [selectedSong, updateSong, getSong],
  );

  const handleDelete = useCallback(async () => {
    if (!selectedSong) return;
    await deleteSong(selectedSong.id);
    setSelectedSong(null);
    setView('list');
  }, [selectedSong, deleteSong]);

  // Loading state for song detail
  if (songLoading && (view === 'view' || view === 'edit')) {
    return (
      <View className="flex-1 items-center justify-center py-16 bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  switch (view) {
    case 'view':
      return selectedSong ? (
        <SongViewer
          song={selectedSong}
          isAuthenticated={isAuthenticated}
          onEdit={handleEdit}
          onBack={handleBack}
          onDelete={handleDelete}
        />
      ) : null;

    case 'new':
      return (
        <SongEditor
          onSave={handleSaveNew}
          onCancel={handleBack}
        />
      );

    case 'edit':
      return selectedSong ? (
        <SongEditor
          song={selectedSong}
          onSave={handleSaveEdit}
          onDelete={handleDelete}
          onCancel={() => setView('view')}
        />
      ) : null;

    default:
      return (
        <View className="flex-1 bg-white dark:bg-gray-900 px-4 pt-4">
          {/* Refresh button */}
          <View className="flex-row justify-end mb-2">
            <TouchableOpacity
              onPress={() => refresh()}
              className="p-2 rounded-lg min-h-[44px] min-w-[44px] items-center justify-center"
              accessibilityLabel={t('worship.refresh')}
              accessibilityRole="button"
            >
              <Text className="text-gray-400 dark:text-gray-500 text-lg">{'\u21BB'}</Text>
            </TouchableOpacity>
          </View>

          {/* Error message */}
          {errorMsg && (
            <View className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex-row items-center justify-between">
              <Text className="text-sm text-red-700 dark:text-red-300 flex-1">
                {errorMsg}
              </Text>
              <TouchableOpacity
                onPress={() => setErrorMsg(null)}
                className="ml-2 min-h-[44px] min-w-[44px] items-center justify-center"
                accessibilityLabel={t('worship.cancel')}
                accessibilityRole="button"
              >
                <Text className="text-red-400 dark:text-red-500 text-lg">{'\u2715'}</Text>
              </TouchableOpacity>
            </View>
          )}

          <SongList
            songs={songs}
            loading={loading}
            isAuthenticated={isAuthenticated}
            onSelectSong={handleSelectSong}
            onNewSong={handleNewSong}
          />
        </View>
      );
  }
}
