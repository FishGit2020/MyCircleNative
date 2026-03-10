import { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@mycircle/shared';
import { useTheme } from '../src/contexts/ThemeContext';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface SearchItem {
  route: string;
  titleKey: string;
  descriptionKey: string;
  icon: IoniconsName;
}

// All navigable features: tab screens + more menu items
const SEARCH_ITEMS: SearchItem[] = [
  // Tab screens
  {
    route: '/(tabs)',
    titleKey: 'dashboard.title',
    descriptionKey: 'home.subtitle',
    icon: 'grid-outline',
  },
  {
    route: '/(tabs)/weather',
    titleKey: 'nav.weather',
    descriptionKey: 'home.quickWeatherDesc',
    icon: 'cloud-outline',
  },
  {
    route: '/(tabs)/stocks',
    titleKey: 'nav.stocks',
    descriptionKey: 'home.quickStocksDesc',
    icon: 'trending-up-outline',
  },
  {
    route: '/(tabs)/podcasts',
    titleKey: 'nav.podcasts',
    descriptionKey: 'home.quickPodcastsDesc',
    icon: 'headset-outline',
  },
  {
    route: '/(tabs)/bible',
    titleKey: 'nav.bible',
    descriptionKey: 'widgets.verseDesc',
    icon: 'book-outline',
  },
  // More menu items
  {
    route: '/profile',
    titleKey: 'profile.title',
    descriptionKey: 'profile.subtitle',
    icon: 'person-circle-outline',
  },
  {
    route: '/ai-assistant',
    titleKey: 'dashboard.ai',
    descriptionKey: 'ai.subtitle',
    icon: 'chatbubble-ellipses-outline',
  },
  {
    route: '/worship',
    titleKey: 'worship.title',
    descriptionKey: 'home.quickWorshipDesc',
    icon: 'musical-notes-outline',
  },
  {
    route: '/notebook',
    titleKey: 'notebook.title',
    descriptionKey: 'home.quickNotebookDesc',
    icon: 'document-text-outline',
  },
  {
    route: '/baby-tracker',
    titleKey: 'dashboard.baby',
    descriptionKey: 'home.quickBabyDesc',
    icon: 'heart-outline',
  },
  {
    route: '/child-development',
    titleKey: 'dashboard.childDev',
    descriptionKey: 'home.quickChildDevDesc',
    icon: 'people-outline',
  },
  {
    route: '/flashcards',
    titleKey: 'flashcards.title',
    descriptionKey: 'home.quickFlashcardsDesc',
    icon: 'layers-outline',
  },
  {
    route: '/daily-log',
    titleKey: 'dailyLog.title',
    descriptionKey: 'home.quickDailyLogDesc',
    icon: 'briefcase-outline',
  },
  {
    route: '/cloud-files',
    titleKey: 'cloudFiles.title',
    descriptionKey: 'home.quickCloudFilesDesc',
    icon: 'cloud-outline',
  },
  {
    route: '/immigration',
    titleKey: 'immigration.title',
    descriptionKey: 'home.quickImmigrationDesc',
    icon: 'globe-outline',
  },
  {
    route: '/benchmark',
    titleKey: 'benchmark.title',
    descriptionKey: 'home.quickBenchmarkDesc',
    icon: 'speedometer-outline',
  },
  {
    route: '/radio',
    titleKey: 'radio.title',
    descriptionKey: 'radio.subtitle',
    icon: 'radio-outline',
  },
  {
    route: '/polls',
    titleKey: 'poll.title',
    descriptionKey: 'poll.subtitle',
    icon: 'bar-chart-outline',
  },
  {
    route: '/trip-planner',
    titleKey: 'trip.title',
    descriptionKey: 'trip.subtitle',
    icon: 'airplane-outline',
  },
  {
    route: '/digital-library',
    titleKey: 'library.title',
    descriptionKey: 'library.subtitle',
    icon: 'book-outline',
  },
  {
    route: '/family-games',
    titleKey: 'games.title',
    descriptionKey: 'games.subtitle',
    icon: 'game-controller-outline',
  },
  {
    route: '/doc-scanner',
    titleKey: 'scanner.title',
    descriptionKey: 'scanner.subtitle',
    icon: 'scan-outline',
  },
  {
    route: '/hiking-map',
    titleKey: 'hiking.title',
    descriptionKey: 'hiking.subtitle',
    icon: 'trail-sign-outline',
  },
  {
    route: '/trash',
    titleKey: 'recycleBin.title',
    descriptionKey: 'recycleBin.subtitle',
    icon: 'trash-outline',
  },
  {
    route: '/whats-new',
    titleKey: 'whatsNew.title',
    descriptionKey: 'whatsNew.subtitle',
    icon: 'newspaper-outline',
  },
  {
    route: '/settings',
    titleKey: 'dashboard.settings',
    descriptionKey: 'dashboard.customizeWidgets',
    icon: 'settings-outline',
  },
  {
    route: '/privacy',
    titleKey: 'privacy.title',
    descriptionKey: 'privacy.subtitle',
    icon: 'shield-checkmark-outline',
  },
  {
    route: '/terms',
    titleKey: 'terms.title',
    descriptionKey: 'terms.subtitle',
    icon: 'reader-outline',
  },
];

export default function SearchScreen() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');

  // Auto-focus the search input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Resolve translated titles once and filter by query
  const filtered = useMemo(() => {
    const items = SEARCH_ITEMS.map((item) => ({
      ...item,
      title: t(item.titleKey as any),
      description: t(item.descriptionKey as any),
    }));

    if (!query.trim()) return items;

    const lowerQuery = query.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery),
    );
  }, [query, t]);

  return (
    <View className="flex-1 bg-white dark:bg-gray-900" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {/* Search input */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <Ionicons
          name="search-outline"
          size={20}
          color={isDark ? '#9ca3af' : '#6b7280'}
        />
        <TextInput
          ref={inputRef}
          value={query}
          onChangeText={setQuery}
          placeholder={t('globalSearch.placeholder' as any)}
          placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
          accessibilityLabel={t('globalSearch.placeholder' as any)}
          className="flex-1 ml-3 text-base text-gray-900 dark:text-white"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Pressable
            onPress={() => setQuery('')}
            accessibilityLabel={t('globalSearch.clear' as any)}
            accessibilityRole="button"
            className="ml-2 p-2 min-w-[44px] min-h-[44px] items-center justify-center"
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={isDark ? '#6b7280' : '#9ca3af'}
            />
          </Pressable>
        )}
      </View>

      {/* Results */}
      {filtered.length === 0 ? (
        <View className="flex-1 items-center justify-center px-4">
          <Ionicons
            name="search-outline"
            size={48}
            color={isDark ? '#374151' : '#d1d5db'}
          />
          <Text className="text-base text-gray-400 dark:text-gray-500 mt-4 text-center">
            {t('globalSearch.noResults' as any)}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.route}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="pb-8"
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                router.back();
                // Small delay to let the modal dismiss before navigating
                setTimeout(() => {
                  router.push(item.route as any);
                }, 100);
              }}
              accessibilityLabel={item.title}
              accessibilityRole="button"
              className="flex-row items-center px-4 py-3 active:bg-gray-50 dark:active:bg-gray-800 min-h-[56px]"
            >
              <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-3">
                <Ionicons name={item.icon} size={22} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900 dark:text-white">
                  {item.title}
                </Text>
                <Text
                  className="text-sm text-gray-500 dark:text-gray-400 mt-0.5"
                  numberOfLines={1}
                >
                  {item.description}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={isDark ? '#6b7280' : '#9ca3af'}
              />
            </Pressable>
          )}
          ItemSeparatorComponent={() => (
            <View className="h-px bg-gray-100 dark:bg-gray-800 ml-16" />
          )}
        />
      )}
    </View>
  );
}
