import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  useTranslation,
  safeGetItem,
  safeGetJSON,
  safeSetItem,
  StorageKeys,
  AppEvents,
  eventBus,
  getDailyVerse,
} from '@mycircle/shared';
import { useTheme } from '../../src/contexts/ThemeContext';
import { babyGrowthData } from '../../packages/baby-tracker/src/data/babyGrowthData';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WidgetConfig {
  id: string;
  visible: boolean;
}

const DEFAULT_LAYOUT: WidgetConfig[] = [
  { id: 'weather', visible: true },
  { id: 'stocks', visible: true },
  { id: 'verse', visible: true },
  { id: 'nowPlaying', visible: true },
  { id: 'notebook', visible: true },
  { id: 'babyTracker', visible: true },
  { id: 'childDev', visible: true },
  { id: 'worship', visible: true },
  { id: 'flashcards', visible: true },
  { id: 'workTracker', visible: true },
];

const VALID_IDS = new Set(DEFAULT_LAYOUT.map((w) => w.id));

// Navigation paths for each widget
const WIDGET_ROUTES: Record<string, string> = {
  weather: '/(tabs)/weather',
  stocks: '/(tabs)/stocks',
  verse: '/(tabs)/bible',
  nowPlaying: '/(tabs)/podcasts',
  notebook: '/notebook',
  babyTracker: '/baby-tracker',
  childDev: '/child-development',
  worship: '/worship',
  flashcards: '/flashcards',
  workTracker: '/daily-log',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function calculateGestationalWeek(dueDateStr: string): number {
  const dueDate = new Date(dueDateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysUntilDue = Math.round(
    (dueDate.getTime() - today.getTime()) / msPerDay,
  );
  const totalDays = 280 - daysUntilDue;
  return Math.max(1, Math.min(40, Math.floor(totalDays / 7)));
}

function calculateChildAge(birthDateStr: string): string {
  const birth = new Date(birthDateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const months =
    (today.getFullYear() - birth.getFullYear()) * 12 +
    (today.getMonth() - birth.getMonth());
  if (months < 12) {
    return `${months}m`;
  }
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) {
    return `${years}y`;
  }
  return `${years}y ${remainingMonths}m`;
}

function getEntriesThisMonth(entries: Array<{ date?: string }>): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  return entries.filter((e) => {
    if (!e.date) return false;
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() === month;
  }).length;
}

// ---------------------------------------------------------------------------
// Widget data loading
// ---------------------------------------------------------------------------

interface WidgetData {
  // Weather
  weatherCity: string | null;
  weatherTemp: string | null;
  // Stocks
  stockCount: number;
  // Verse
  verseRef: string;
  verseText: string | undefined;
  // Now Playing
  podcastTitle: string | null;
  episodeTitle: string | null;
  // Notebook
  noteCount: number;
  // Baby Tracker
  babyWeek: number | null;
  babyFruit: string | null;
  // Child Dev
  childName: string | null;
  childAge: string | null;
  // Worship
  worshipSongCount: number;
  worshipFavCount: number;
  // Flashcards
  flashcardMastered: number;
  // Work Tracker
  workEntriesThisMonth: number;
}

function loadWidgetData(): WidgetData {
  // Weather — load from RECENT_CITIES
  let weatherCity: string | null = null;
  let weatherTemp: string | null = null;
  try {
    const citiesRaw = safeGetItem(StorageKeys.RECENT_CITIES);
    if (citiesRaw) {
      const cities = JSON.parse(citiesRaw);
      if (Array.isArray(cities) && cities.length > 0) {
        const first = cities[0];
        weatherCity = first.name || first.city || null;
        if (first.temp !== undefined && first.temp !== null) {
          weatherTemp = `${Math.round(first.temp)}°`;
        }
      }
    }
  } catch {
    /* ignore */
  }

  // Stocks
  const watchlist = safeGetJSON<string[]>(StorageKeys.STOCK_WATCHLIST, []);
  const stockCount = watchlist.length;

  // Verse of the Day
  const verse = getDailyVerse();

  // Now Playing
  let podcastTitle: string | null = null;
  let episodeTitle: string | null = null;
  try {
    const nowPlayingRaw = safeGetItem(StorageKeys.PODCAST_NOW_PLAYING);
    if (nowPlayingRaw) {
      const np = JSON.parse(nowPlayingRaw);
      podcastTitle = np.podcastTitle || np.podcast?.title || null;
      episodeTitle = np.title || np.episodeTitle || null;
    }
  } catch {
    /* ignore */
  }

  // Notebook
  const notes = safeGetJSON<Array<unknown>>(StorageKeys.NOTEBOOK_CACHE, []);
  const noteCount = notes.length;

  // Baby Tracker
  let babyWeek: number | null = null;
  let babyFruit: string | null = null;
  const dueDateStr = safeGetItem(StorageKeys.BABY_DUE_DATE);
  if (dueDateStr) {
    babyWeek = calculateGestationalWeek(dueDateStr);
    const growthData = babyGrowthData.find((d) => d.week === babyWeek);
    if (growthData) {
      babyFruit = growthData.fruit;
    }
  }

  // Child Dev
  const childName = safeGetItem(StorageKeys.CHILD_NAME);
  const childBirthDate = safeGetItem(StorageKeys.CHILD_BIRTH_DATE);
  const childAge = childBirthDate ? calculateChildAge(childBirthDate) : null;

  // Worship
  const worshipSongs = safeGetJSON<Array<unknown>>(
    StorageKeys.WORSHIP_SONGS_CACHE,
    [],
  );
  const worshipFavs = safeGetJSON<Array<unknown>>(
    StorageKeys.WORSHIP_FAVORITES,
    [],
  );

  // Flashcards
  const flashProgress = safeGetJSON<Record<string, boolean>>(
    StorageKeys.FLASHCARD_PROGRESS,
    {},
  );
  const flashcardMastered = Object.values(flashProgress).filter(Boolean).length;

  // Daily Log
  const workEntries = safeGetJSON<Array<{ date?: string }>>(
    StorageKeys.DAILY_LOG_CACHE,
    [],
  );
  const workEntriesThisMonth = getEntriesThisMonth(workEntries);

  return {
    weatherCity,
    weatherTemp,
    stockCount,
    verseRef: verse.reference,
    verseText: verse.text,
    podcastTitle,
    episodeTitle,
    noteCount,
    babyWeek,
    babyFruit,
    childName,
    childAge,
    worshipSongCount: worshipSongs.length,
    worshipFavCount: worshipFavs.length,
    flashcardMastered,
    workEntriesThisMonth,
  };
}

// ---------------------------------------------------------------------------
// Layout persistence
// ---------------------------------------------------------------------------

function loadLayout(): WidgetConfig[] {
  const stored = safeGetJSON<WidgetConfig[]>(StorageKeys.WIDGET_LAYOUT, []);
  if (!Array.isArray(stored) || stored.length === 0) return DEFAULT_LAYOUT;
  // Filter stale IDs
  const filtered = stored.filter((w) => VALID_IDS.has(w.id));
  // If some widgets are missing, append them as visible
  const existingIds = new Set(filtered.map((w) => w.id));
  for (const def of DEFAULT_LAYOUT) {
    if (!existingIds.has(def.id)) {
      filtered.push({ id: def.id, visible: true });
    }
  }
  return filtered;
}

function saveLayout(layout: WidgetConfig[]): void {
  safeSetItem(StorageKeys.WIDGET_LAYOUT, JSON.stringify(layout));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DashboardScreen() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [layout, setLayout] = useState<WidgetConfig[]>(loadLayout);
  const [data, setData] = useState<WidgetData>(loadWidgetData);

  // Reload data
  const reloadData = useCallback(() => {
    setData(loadWidgetData());
    setLayout(loadLayout());
  }, []);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    reloadData();
    // Brief delay for visual feedback
    await new Promise((resolve) => setTimeout(resolve, 600));
    setRefreshing(false);
  }, [reloadData]);

  // Subscribe to data change events
  useEffect(() => {
    const unsubscribers = [
      eventBus.subscribe(AppEvents.WATCHLIST_CHANGED, reloadData),
      eventBus.subscribe(AppEvents.SUBSCRIPTIONS_CHANGED, reloadData),
      eventBus.subscribe(AppEvents.WORSHIP_SONGS_CHANGED, reloadData),
      eventBus.subscribe(AppEvents.NOTEBOOK_CHANGED, reloadData),
      eventBus.subscribe(AppEvents.BABY_DUE_DATE_CHANGED, reloadData),
      eventBus.subscribe(AppEvents.CHILD_DATA_CHANGED, reloadData),
      eventBus.subscribe(AppEvents.FLASHCARD_PROGRESS_CHANGED, reloadData),
      eventBus.subscribe(AppEvents.DAILY_LOG_CHANGED, reloadData),
      eventBus.subscribe(AppEvents.WORSHIP_FAVORITES_CHANGED, reloadData),
      eventBus.subscribe(AppEvents.UNITS_CHANGED, reloadData),
    ];
    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [reloadData]);

  // Layout mutation helpers
  const toggleVisibility = useCallback((id: string) => {
    setLayout((prev) => {
      const next = prev.map((w) =>
        w.id === id ? { ...w, visible: !w.visible } : w,
      );
      saveLayout(next);
      return next;
    });
  }, []);

  const moveUp = useCallback((index: number) => {
    if (index <= 0) return;
    setLayout((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      saveLayout(next);
      return next;
    });
  }, []);

  const moveDown = useCallback((index: number) => {
    setLayout((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      saveLayout(next);
      return next;
    });
  }, []);

  const resetLayout = useCallback(() => {
    saveLayout(DEFAULT_LAYOUT);
    setLayout(DEFAULT_LAYOUT);
  }, []);

  // Build visible list
  const visibleWidgets = useMemo(
    () => (editMode ? layout : layout.filter((w) => w.visible)),
    [layout, editMode],
  );

  // Widget title map
  const widgetTitles: Record<string, string> = useMemo(
    () => ({
      weather: t('widgets.weather'),
      stocks: t('widgets.stocks'),
      verse: t('widgets.verse'),
      nowPlaying: t('widgets.nowPlaying'),
      notebook: t('widgets.notebook'),
      babyTracker: t('widgets.babyTracker'),
      childDev: t('widgets.childDev'),
      worship: t('widgets.worship'),
      flashcards: t('widgets.flashcards'),
      workTracker: t('widgets.dailyLog'),
    }),
    [t],
  );

  // ---------------------------------------------------------------------------
  // Widget summary renderer
  // ---------------------------------------------------------------------------
  const renderWidgetSummary = useCallback(
    (id: string): string => {
      switch (id) {
        case 'weather':
          if (data.weatherCity) {
            return data.weatherTemp
              ? `${data.weatherCity}: ${data.weatherTemp}`
              : data.weatherCity;
          }
          return t('widgets.noFavoriteCity');

        case 'stocks':
          if (data.stockCount > 0) {
            return t('widgets.stocksWatching').replace(
              '{count}',
              String(data.stockCount),
            );
          }
          return t('widgets.noStocks');

        case 'verse':
          return data.verseRef;

        case 'nowPlaying':
          if (data.episodeTitle) {
            return data.podcastTitle
              ? `${data.episodeTitle} \u2014 ${data.podcastTitle}`
              : data.episodeTitle;
          }
          return t('widgets.nothingPlaying');

        case 'notebook':
          if (data.noteCount > 0) {
            return t('widgets.noteCount').replace(
              '{count}',
              String(data.noteCount),
            );
          }
          return t('widgets.noNotes');

        case 'babyTracker':
          if (data.babyWeek !== null && data.babyFruit) {
            return t('widgets.babyWeek')
              .replace('{week}', String(data.babyWeek))
              .replace('{fruit}', data.babyFruit);
          }
          return t('widgets.noDueDate');

        case 'childDev':
          if (data.childName && data.childAge) {
            return t('widgets.childAge')
              .replace('{name}', data.childName)
              .replace('{age}', data.childAge);
          }
          return t('widgets.noChildData');

        case 'worship':
          if (data.worshipSongCount > 0) {
            const songs = t('widgets.worshipSongCount').replace(
              '{count}',
              String(data.worshipSongCount),
            );
            const favs =
              data.worshipFavCount > 0
                ? ` \u00B7 ${t('widgets.worshipFavCount').replace('{count}', String(data.worshipFavCount))}`
                : '';
            return `${songs}${favs}`;
          }
          return t('widgets.noWorshipSongs');

        case 'flashcards':
          if (data.flashcardMastered > 0) {
            return t('widgets.flashcardsMastered').replace(
              '{count}',
              String(data.flashcardMastered),
            );
          }
          return t('widgets.noFlashcardProgress');

        case 'workTracker':
          if (data.workEntriesThisMonth > 0) {
            return t('widgets.dailyLogEntries').replace(
              '{count}',
              String(data.workEntriesThisMonth),
            );
          }
          return t('widgets.noDailyLogEntries');

        default:
          return '';
      }
    },
    [data, t],
  );

  // Widget description map
  const widgetDescs: Record<string, string> = useMemo(
    () => ({
      weather: t('widgets.weatherDesc'),
      stocks: t('widgets.stocksDesc'),
      verse: t('widgets.verseDesc'),
      nowPlaying: t('widgets.nowPlayingDesc'),
      notebook: t('widgets.notebookDesc'),
      babyTracker: t('widgets.babyTrackerDesc'),
      childDev: t('widgets.childDevDesc'),
      worship: t('widgets.worshipDesc'),
      flashcards: t('widgets.flashcardsDesc'),
      workTracker: t('widgets.dailyLogDesc'),
    }),
    [t],
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 pb-20 md:pb-8"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? '#60a5fa' : '#3b82f6'}
          />
        }
      >
        {/* Header */}
        <View className="mb-6 flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('dashboard.title')}
            </Text>
            <Text className="text-base text-gray-500 dark:text-gray-400 mt-1">
              {t('home.subtitle')}
            </Text>
          </View>
          <Pressable
            onPress={() => {
              if (editMode) {
                setEditMode(false);
              } else {
                setEditMode(true);
              }
            }}
            accessibilityLabel={
              editMode ? t('widgets.done') : t('widgets.customize')
            }
            accessibilityRole="button"
            className="ml-3 mt-1 rounded-full bg-blue-100 dark:bg-blue-900 px-4 py-2 min-h-[44px] min-w-[44px] items-center justify-center"
          >
            <Text className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              {editMode ? t('widgets.done') : t('widgets.customize')}
            </Text>
          </Pressable>
        </View>

        {/* Edit mode hint & reset */}
        {editMode && (
          <View className="mb-4 flex-row items-center justify-between bg-blue-50 dark:bg-blue-950 rounded-xl px-4 py-3">
            <Text className="text-sm text-blue-700 dark:text-blue-300 flex-1">
              {t('widgets.reorderHint')}
            </Text>
            <Pressable
              onPress={resetLayout}
              accessibilityLabel={t('widgets.reset')}
              accessibilityRole="button"
              className="ml-3 rounded-lg bg-blue-200 dark:bg-blue-800 px-3 py-1 min-h-[44px] items-center justify-center"
            >
              <Text className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {t('widgets.reset')}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Widget cards */}
        <View className="gap-3">
          {visibleWidgets.map((widget, index) => {
            const title = widgetTitles[widget.id] ?? widget.id;
            const summary = renderWidgetSummary(widget.id);
            const desc = widgetDescs[widget.id] ?? '';
            const route = WIDGET_ROUTES[widget.id];

            return (
              <View key={widget.id}>
                {editMode ? (
                  /* Edit mode card — reorder + toggle */
                  <View className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
                    <View className="flex-row items-center justify-between">
                      {/* Reorder arrows */}
                      <View className="flex-row items-center gap-1 mr-3">
                        <Pressable
                          onPress={() => moveUp(index)}
                          disabled={index === 0}
                          accessibilityLabel={t('widgets.moveUp')}
                          accessibilityRole="button"
                          className="rounded-lg bg-gray-200 dark:bg-gray-700 w-11 h-11 items-center justify-center"
                          style={{ opacity: index === 0 ? 0.3 : 1 }}
                        >
                          <Text className="text-lg text-gray-700 dark:text-gray-300">
                            {'\u2191'}
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => moveDown(index)}
                          disabled={index === visibleWidgets.length - 1}
                          accessibilityLabel={t('widgets.moveDown')}
                          accessibilityRole="button"
                          className="rounded-lg bg-gray-200 dark:bg-gray-700 w-11 h-11 items-center justify-center"
                          style={{
                            opacity:
                              index === visibleWidgets.length - 1 ? 0.3 : 1,
                          }}
                        >
                          <Text className="text-lg text-gray-700 dark:text-gray-300">
                            {'\u2193'}
                          </Text>
                        </Pressable>
                      </View>

                      {/* Widget title + visibility status */}
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-gray-900 dark:text-white">
                          {title}
                        </Text>
                        <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {widget.visible
                            ? t('widgets.visible')
                            : t('widgets.hidden')}
                        </Text>
                      </View>

                      {/* Toggle */}
                      <Switch
                        value={widget.visible}
                        onValueChange={() => toggleVisibility(widget.id)}
                        accessibilityLabel={t('widgets.toggleVisibility')}
                        trackColor={{
                          false: '#d1d5db',
                          true: '#3b82f6',
                        }}
                        thumbColor={widget.visible ? '#ffffff' : '#f3f4f6'}
                      />
                    </View>
                  </View>
                ) : (
                  /* Normal mode — pressable widget card */
                  <Pressable
                    onPress={() => {
                      if (route) {
                        router.push(route as any);
                      }
                    }}
                    accessibilityLabel={`${title}: ${summary}`}
                    accessibilityRole="button"
                    className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 active:bg-gray-100 dark:active:bg-gray-750 min-h-[44px]"
                  >
                    <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                      {title}
                    </Text>
                    <Text
                      className="text-sm text-gray-700 dark:text-gray-300 mt-1"
                      numberOfLines={2}
                    >
                      {summary}
                    </Text>
                    <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {desc}
                    </Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
