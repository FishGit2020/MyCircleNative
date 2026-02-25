import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from '@mycircle/shared';
import type { WorshipSong } from '../types';
import { loadFavorites, saveFavorites } from '../hooks/useWorshipSongs';

type SortMode = 'alpha' | 'recent';

interface SongListProps {
  songs: WorshipSong[];
  loading: boolean;
  isAuthenticated: boolean;
  onSelectSong: (id: string) => void;
  onNewSong: () => void;
}

export default function SongList({
  songs,
  loading,
  isAuthenticated,
  onSelectSong,
  onNewSong,
}: SongListProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState(loadFavorites);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sort, setSort] = useState<SortMode>('alpha');
  const [filterFormat, setFilterFormat] = useState<'all' | 'chordpro' | 'text'>('all');

  const toggleFavorite = useCallback(
    (songId: string) => {
      setFavorites((prev) => {
        const next = new Set(prev);
        if (next.has(songId)) {
          next.delete(songId);
        } else {
          next.add(songId);
        }
        saveFavorites(next);
        return next;
      });
    },
    [],
  );

  const processed = useMemo(() => {
    let result = songs;

    // Filter by favorites
    if (showFavoritesOnly) {
      result = result.filter((s) => favorites.has(s.id));
    }

    // Filter by format
    if (filterFormat !== 'all') {
      result = result.filter((s) => s.format === filterFormat);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q) ||
          s.content.toLowerCase().includes(q) ||
          s.tags?.some((tag) => tag.toLowerCase().includes(q)),
      );
    }

    // Sort
    if (sort === 'alpha') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else {
      result = [...result].sort(
        (a, b) => (b.updatedAt?.seconds ?? 0) - (a.updatedAt?.seconds ?? 0),
      );
    }

    return result;
  }, [songs, search, favorites, showFavoritesOnly, sort, filterFormat]);

  const renderSongItem = useCallback(
    ({ item: song }: { item: WorshipSong }) => (
      <TouchableOpacity
        onPress={() => onSelectSong(song.id)}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-3 min-h-[44px]"
        accessibilityLabel={`${song.title} - ${song.artist}`}
        accessibilityRole="button"
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-8">
            <Text
              className="font-semibold text-gray-900 dark:text-white text-base"
              numberOfLines={1}
            >
              {song.title}
            </Text>
            <Text
              className="text-sm text-gray-500 dark:text-gray-400 mt-1"
              numberOfLines={1}
            >
              {song.artist}
            </Text>
          </View>

          {/* Favorite star */}
          <TouchableOpacity
            onPress={() => toggleFavorite(song.id)}
            className="absolute top-3 right-3 p-1 min-h-[44px] min-w-[44px] items-center justify-center"
            accessibilityLabel={
              favorites.has(song.id) ? t('worship.favorited') : t('worship.favorite')
            }
            accessibilityRole="button"
          >
            <Text
              className={`text-lg ${
                favorites.has(song.id)
                  ? 'text-yellow-500'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            >
              {favorites.has(song.id) ? '\u2605' : '\u2606'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Meta badges */}
        <View className="flex-row items-center gap-2 mt-3">
          <View className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30">
            <Text className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              {song.originalKey}
            </Text>
          </View>
          <View
            className={`px-2 py-0.5 rounded-full ${
              song.format === 'chordpro'
                ? 'bg-purple-50 dark:bg-purple-900/30'
                : 'bg-gray-100 dark:bg-gray-700'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                song.format === 'chordpro'
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {song.format === 'chordpro'
                ? t('worship.formatChordpro')
                : t('worship.formatText')}
            </Text>
          </View>
        </View>

        {/* Tags */}
        {song.tags && song.tags.length > 0 && (
          <View className="flex-row flex-wrap gap-1 mt-2">
            {song.tags.slice(0, 3).map((tag) => (
              <View
                key={tag}
                className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700"
              >
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    ),
    [onSelectSong, toggleFavorite, favorites, t],
  );

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('worship.title')}
        </Text>
        {isAuthenticated && (
          <TouchableOpacity
            onPress={onNewSong}
            className="flex-row items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 rounded-lg min-h-[44px]"
            accessibilityLabel={t('worship.addSong')}
            accessibilityRole="button"
          >
            <Text className="text-white text-lg">+</Text>
            <Text className="text-white text-sm font-semibold">
              {t('worship.addSong')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search */}
      <View className="mb-4">
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={t('worship.searchPlaceholder')}
          placeholderTextColor="#9CA3AF"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          accessibilityLabel={t('worship.searchPlaceholder')}
        />
      </View>

      {/* Filter & sort toolbar */}
      <View className="flex-row flex-wrap items-center gap-2 mb-4">
        {/* Favorites toggle */}
        <TouchableOpacity
          onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`flex-row items-center gap-1 px-3 py-2 rounded-lg border min-h-[44px] ${
            showFavoritesOnly
              ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          }`}
          accessibilityLabel={t('worship.favorites')}
          accessibilityRole="button"
          accessibilityState={{ selected: showFavoritesOnly }}
        >
          <Text
            className={`text-sm ${
              showFavoritesOnly
                ? 'text-yellow-500'
                : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            {showFavoritesOnly ? '\u2605' : '\u2606'}
          </Text>
          <Text
            className={`text-xs font-semibold ${
              showFavoritesOnly
                ? 'text-yellow-700 dark:text-yellow-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {t('worship.favorites')}
          </Text>
        </TouchableOpacity>

        {/* Format filter */}
        <View className="flex-row rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {(['all', 'chordpro', 'text'] as const).map((fmt) => (
            <TouchableOpacity
              key={fmt}
              onPress={() => setFilterFormat(fmt)}
              className={`px-3 py-2 min-h-[44px] justify-center ${
                filterFormat === fmt
                  ? 'bg-blue-600 dark:bg-blue-500'
                  : 'bg-white dark:bg-gray-800'
              }`}
              accessibilityLabel={
                fmt === 'all'
                  ? t('worship.filterAll')
                  : fmt === 'chordpro'
                    ? t('worship.formatChordpro')
                    : t('worship.formatText')
              }
              accessibilityRole="radio"
              accessibilityState={{ checked: filterFormat === fmt }}
            >
              <Text
                className={`text-xs font-semibold ${
                  filterFormat === fmt
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {fmt === 'all'
                  ? t('worship.filterAll')
                  : fmt === 'chordpro'
                    ? t('worship.formatChordpro')
                    : t('worship.formatText')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sort */}
        <View className="flex-row rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ml-auto">
          <TouchableOpacity
            onPress={() => setSort('alpha')}
            className={`px-3 py-2 min-h-[44px] justify-center ${
              sort === 'alpha'
                ? 'bg-blue-600 dark:bg-blue-500'
                : 'bg-white dark:bg-gray-800'
            }`}
            accessibilityLabel={t('worship.sortAlpha')}
            accessibilityRole="radio"
            accessibilityState={{ checked: sort === 'alpha' }}
          >
            <Text
              className={`text-xs font-semibold ${
                sort === 'alpha'
                  ? 'text-white'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {t('worship.sortAlpha')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSort('recent')}
            className={`px-3 py-2 min-h-[44px] justify-center ${
              sort === 'recent'
                ? 'bg-blue-600 dark:bg-blue-500'
                : 'bg-white dark:bg-gray-800'
            }`}
            accessibilityLabel={t('worship.sortRecent')}
            accessibilityRole="radio"
            accessibilityState={{ checked: sort === 'recent' }}
          >
            <Text
              className={`text-xs font-semibold ${
                sort === 'recent'
                  ? 'text-white'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {t('worship.sortRecent')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {!isAuthenticated && (
        <Text className="text-sm text-gray-500 dark:text-gray-400 italic mb-4">
          {t('worship.loginToEdit')}
        </Text>
      )}

      {/* Song list */}
      {loading ? (
        <View className="items-center justify-center py-16">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : processed.length === 0 ? (
        <View className="items-center justify-center py-12">
          <Text className="text-4xl mb-3 opacity-40">{'\u266B'}</Text>
          <Text className="text-gray-500 dark:text-gray-400">
            {songs.length === 0 ? t('worship.noSongs') : t('worship.noResults')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={processed}
          keyExtractor={(item) => item.id}
          renderItem={renderSongItem}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
