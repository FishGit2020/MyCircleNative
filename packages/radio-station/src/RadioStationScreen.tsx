import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  useTranslation,
  safeGetItem,
  safeSetItem,
  eventBus,
  MFEvents,
  StorageKeys,
  AppEvents,
} from '@mycircle/shared';

// ── Types ────────────────────────────────────────────────────
interface RadioStation {
  stationuuid: string;
  name: string;
  url: string;
  url_resolved: string;
  favicon: string;
  tags: string;
  country: string;
  language: string;
  codec: string;
  bitrate: number;
  votes: number;
}

type Tab = 'browse' | 'favorites';

const API_BASE = 'https://de1.api.radio-browser.info/json/stations/search';

// ── Helpers ──────────────────────────────────────────────────
function loadFavorites(): RadioStation[] {
  try {
    const raw = safeGetItem(StorageKeys.RADIO_FAVORITES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFavorites(stations: RadioStation[]): void {
  safeSetItem(StorageKeys.RADIO_FAVORITES, JSON.stringify(stations));
  eventBus.publish(AppEvents.RADIO_CHANGED);
}

// ── Component ────────────────────────────────────────────────
export default function RadioStationScreen() {
  const { t } = useTranslation();

  // Browse state
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [favorites, setFavorites] = useState<RadioStation[]>(loadFavorites);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('browse');

  // Player state
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // ── Fetch stations ─────────────────────────────────────────
  const fetchStations = useCallback(async (params: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        ...params,
        limit: '50',
        hidebroken: 'true',
      });
      const res = await fetch(`${API_BASE}?${query.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: RadioStation[] = await res.json();
      setStations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stations');
      setStations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const topStations = useCallback(() => {
    fetchStations({ order: 'votes', reverse: 'true' });
  }, [fetchStations]);

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      topStations();
      return;
    }
    fetchStations({ name: searchQuery, order: 'votes', reverse: 'true' });
  }, [searchQuery, fetchStations, topStations]);

  // Load top stations on mount
  useEffect(() => {
    topStations();
  }, [topStations]);

  // ── Favorites ──────────────────────────────────────────────
  const toggleFavorite = useCallback((station: RadioStation) => {
    setFavorites((prev) => {
      const exists = prev.some((s) => s.stationuuid === station.stationuuid);
      const next = exists
        ? prev.filter((s) => s.stationuuid !== station.stationuuid)
        : [...prev, station];
      saveFavorites(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (stationuuid: string) => favorites.some((s) => s.stationuuid === stationuuid),
    [favorites],
  );

  // ── Player ─────────────────────────────────────────────────
  const handlePlay = useCallback(
    (station: RadioStation) => {
      if (currentStation?.stationuuid === station.stationuuid && isPlaying) {
        // Toggle pause via event bus
        eventBus.publish(MFEvents.PODCAST_CLOSE_PLAYER);
        setIsPlaying(false);
        setCurrentStation(null);
        return;
      }

      // Use the podcast play event to leverage GlobalAudioPlayer
      eventBus.publish(MFEvents.PODCAST_PLAY_EPISODE, {
        episode: {
          id: station.stationuuid,
          title: station.name,
          enclosureUrl: station.url_resolved || station.url,
          description: `${station.country} ${station.bitrate > 0 ? `${station.bitrate} kbps` : ''}`,
          datePublished: 0,
          duration: 0,
          image: station.favicon || '',
          feedId: 'radio',
        },
        podcast: {
          id: 'radio',
          title: station.name,
          author: station.country,
          artwork: station.favicon || '',
          description: '',
          categories: {},
          episodeCount: 0,
          language: station.language,
        },
      });
      setCurrentStation(station);
      setIsPlaying(true);
    },
    [currentStation, isPlaying],
  );

  const handleStop = useCallback(() => {
    eventBus.publish(MFEvents.PODCAST_CLOSE_PLAYER);
    setCurrentStation(null);
    setIsPlaying(false);
  }, []);

  // ── Display data ───────────────────────────────────────────
  const displayStations = activeTab === 'browse' ? stations : favorites;

  // ── Render station card ────────────────────────────────────
  const renderStation = useCallback(
    ({ item: station }: { item: RadioStation }) => {
      const stationIsPlaying =
        isPlaying && currentStation?.stationuuid === station.stationuuid;
      const tags = station.tags
        ? station.tags.split(',').filter(Boolean).slice(0, 3)
        : [];

      return (
        <View
          className={`flex-row items-center gap-3 rounded-lg border p-3 mb-2 ${
            stationIsPlaying
              ? 'border-orange-500 bg-orange-50 dark:border-orange-400 dark:bg-orange-950'
              : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
          }`}
        >
          {/* Station icon */}
          <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-orange-100 dark:bg-orange-900">
            {station.favicon ? (
              <Image
                source={{ uri: station.favicon }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="radio-outline" size={24} color="#f97316" />
            )}
          </View>

          {/* Station info */}
          <View className="flex-1 min-w-0">
            <Text
              className="text-sm font-medium text-gray-900 dark:text-gray-100"
              numberOfLines={1}
            >
              {station.name}
            </Text>
            <Text
              className="text-xs text-gray-500 dark:text-gray-400"
              numberOfLines={1}
            >
              {station.country}
              {station.bitrate > 0 && ` \u00B7 ${station.bitrate} kbps`}
            </Text>
            {tags.length > 0 && (
              <View className="flex-row flex-wrap gap-1 mt-1">
                {tags.map((tag) => (
                  <View
                    key={tag}
                    className="rounded bg-orange-100 px-1.5 py-0.5 dark:bg-orange-900"
                  >
                    <Text className="text-xs text-orange-700 dark:text-orange-300">
                      {tag.trim()}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Actions */}
          <View className="flex-row items-center gap-1">
            <Pressable
              onPress={() => handlePlay(station)}
              accessibilityRole="button"
              accessibilityLabel={
                stationIsPlaying ? t('radio.stop') : t('radio.play')
              }
              className="h-10 w-10 items-center justify-center rounded-full bg-orange-500 dark:bg-orange-600"
              style={{ minWidth: 44, minHeight: 44 }}
            >
              <Ionicons
                name={stationIsPlaying ? 'stop' : 'play'}
                size={20}
                color="#ffffff"
              />
            </Pressable>
            <Pressable
              onPress={() => toggleFavorite(station)}
              accessibilityRole="button"
              accessibilityLabel={
                isFavorite(station.stationuuid)
                  ? t('radio.removeFavorite')
                  : t('radio.addFavorite')
              }
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{ minWidth: 44, minHeight: 44 }}
            >
              <Ionicons
                name={isFavorite(station.stationuuid) ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorite(station.stationuuid) ? '#f97316' : '#9ca3af'}
              />
            </Pressable>
          </View>
        </View>
      );
    },
    [isPlaying, currentStation, handlePlay, toggleFavorite, isFavorite, t],
  );

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="px-4 pt-4 pb-2">
        {/* Header */}
        <View className="mb-4">
          <Text className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {t('radio.title')}
          </Text>
          <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('radio.subtitle')}
          </Text>
        </View>

        {/* Search bar */}
        <View className="flex-row gap-2 mb-4">
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            placeholder={t('radio.searchPlaceholder')}
            placeholderTextColor="#9ca3af"
            returnKeyType="search"
            accessibilityLabel={t('radio.search')}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
          <Pressable
            onPress={handleSearch}
            accessibilityRole="button"
            accessibilityLabel={t('radio.search')}
            className="rounded-lg bg-orange-500 px-4 py-2 items-center justify-center dark:bg-orange-600"
            style={{ minWidth: 44, minHeight: 44 }}
          >
            <Ionicons name="search" size={18} color="#ffffff" />
          </Pressable>
        </View>

        {/* Tabs */}
        <View className="flex-row border-b border-gray-200 dark:border-gray-700">
          <Pressable
            onPress={() => setActiveTab('browse')}
            accessibilityRole="tab"
            accessibilityLabel={t('radio.browse')}
            accessibilityState={{ selected: activeTab === 'browse' }}
            className={`px-4 py-2.5 border-b-2 ${
              activeTab === 'browse'
                ? 'border-orange-500 dark:border-orange-400'
                : 'border-transparent'
            }`}
            style={{ minHeight: 44 }}
          >
            <Text
              className={`text-sm font-medium ${
                activeTab === 'browse'
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {t('radio.browse')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('favorites')}
            accessibilityRole="tab"
            accessibilityLabel={t('radio.favorites')}
            accessibilityState={{ selected: activeTab === 'favorites' }}
            className={`px-4 py-2.5 border-b-2 flex-row items-center ${
              activeTab === 'favorites'
                ? 'border-orange-500 dark:border-orange-400'
                : 'border-transparent'
            }`}
            style={{ minHeight: 44 }}
          >
            <Text
              className={`text-sm font-medium ${
                activeTab === 'favorites'
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {t('radio.favorites')}
            </Text>
            {favorites.length > 0 && (
              <View className="ml-1.5 h-5 w-5 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                <Text className="text-xs text-orange-600 dark:text-orange-300">
                  {favorites.length}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 px-4">
        {loading && (
          <View className="flex-1 items-center justify-center py-12">
            <ActivityIndicator size="large" color="#f97316" />
            <Text className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {t('radio.loading')}
            </Text>
          </View>
        )}

        {error && !loading && (
          <View className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
            <Text className="text-sm text-red-600 dark:text-red-400">
              {t('radio.error')}: {error}
            </Text>
          </View>
        )}

        {!loading && !error && displayStations.length === 0 && (
          <View className="flex-1 items-center justify-center py-12">
            <Ionicons name="radio-outline" size={48} color="#d1d5db" />
            <Text className="mt-3 text-gray-500 dark:text-gray-400">
              {activeTab === 'favorites'
                ? t('radio.noFavorites')
                : t('radio.noResults')}
            </Text>
          </View>
        )}

        {!loading && !error && displayStations.length > 0 && (
          <FlatList
            data={displayStations}
            keyExtractor={(item) => item.stationuuid}
            renderItem={renderStation}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
          />
        )}
      </View>

      {/* Now Playing Bar */}
      {currentStation && isPlaying && (
        <View className="absolute bottom-0 left-0 right-0 border-t border-orange-200 bg-white px-4 py-2 dark:border-orange-800 dark:bg-gray-900">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-orange-100 dark:bg-orange-900">
              {currentStation.favicon ? (
                <Image
                  source={{ uri: currentStation.favicon }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="radio-outline" size={20} color="#f97316" />
              )}
            </View>
            <View className="flex-1 min-w-0">
              <Text
                className="text-sm font-medium text-gray-900 dark:text-gray-100"
                numberOfLines={1}
              >
                {currentStation.name}
              </Text>
              <Text
                className="text-xs text-gray-500 dark:text-gray-400"
                numberOfLines={1}
              >
                {t('radio.playing')}
              </Text>
            </View>
            <Pressable
              onPress={handleStop}
              accessibilityRole="button"
              accessibilityLabel={t('radio.stop')}
              className="h-10 w-10 items-center justify-center rounded-full bg-orange-500 dark:bg-orange-600"
              style={{ minWidth: 44, minHeight: 44 }}
            >
              <Ionicons name="stop" size={20} color="#ffffff" />
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
