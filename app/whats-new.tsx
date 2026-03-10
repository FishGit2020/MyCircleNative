import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@mycircle/shared';

interface ChangelogEntry {
  version: string;
  date: string;
  items: { type: 'feature' | 'fix' | 'improvement'; description: string }[];
}

const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.3.0',
    date: '2026-03-01',
    items: [
      { type: 'feature', description: 'Added Recycle Bin for recovering deleted items' },
      { type: 'feature', description: 'Added Privacy Policy and Terms of Service pages' },
      { type: 'improvement', description: 'Improved dark mode consistency across all screens' },
    ],
  },
  {
    version: '1.2.0',
    date: '2026-02-15',
    items: [
      { type: 'feature', description: 'Added Digital Library for managing e-books' },
      { type: 'feature', description: 'Added Family Games with trivia and word games' },
      { type: 'feature', description: 'Added Document Scanner with OCR support' },
      { type: 'improvement', description: 'Improved radio station search and playback' },
    ],
  },
  {
    version: '1.1.0',
    date: '2026-01-20',
    items: [
      { type: 'feature', description: 'Added Trip Planner with itinerary builder' },
      { type: 'feature', description: 'Added Polls for group decision making' },
      { type: 'feature', description: 'Added Radio with live streaming stations' },
      { type: 'fix', description: 'Fixed weather alerts not appearing in some locales' },
    ],
  },
  {
    version: '1.0.0',
    date: '2026-01-01',
    items: [
      { type: 'feature', description: 'Initial release with Weather, Stocks, Podcasts, Bible, and more' },
      { type: 'feature', description: 'AI Assistant powered by multiple language models' },
      { type: 'feature', description: 'Worship songs with chord charts and playlists' },
      { type: 'feature', description: 'Baby Tracker and Child Development milestones' },
    ],
  },
];

const TYPE_ICONS: Record<string, { name: React.ComponentProps<typeof Ionicons>['name']; color: string }> = {
  feature: { name: 'sparkles', color: '#f59e0b' },
  fix: { name: 'build-outline', color: '#6b7280' },
  improvement: { name: 'rocket-outline', color: '#3b82f6' },
};

export default function WhatsNewScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white dark:bg-gray-900" style={{ paddingTop: insets.top }}>
      <ScrollView className="flex-1" contentContainerClassName="pb-20">
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Pressable
            onPress={() => router.back()}
            className="mr-3 p-1 min-w-[44px] min-h-[44px] items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel={t('nav.goBack' as any) || 'Go back'}
          >
            <Ionicons name="arrow-back" size={24} color="#6b7280" />
          </Pressable>
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            {t('whatsNew.title' as any)}
          </Text>
        </View>

        {/* Changelog entries */}
        <View className="px-4 mt-4 gap-6">
          {CHANGELOG.map((entry) => (
            <View
              key={entry.version}
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="bg-blue-100 dark:bg-blue-900/30 px-2.5 py-1 rounded-full">
                  <Text className="text-sm font-bold text-blue-700 dark:text-blue-300">
                    v{entry.version}
                  </Text>
                </View>
                <Text className="text-xs text-gray-400 dark:text-gray-500">
                  {entry.date}
                </Text>
              </View>
              <View className="gap-2.5">
                {entry.items.map((item, idx) => {
                  const icon = TYPE_ICONS[item.type] || TYPE_ICONS.feature;
                  return (
                    <View key={idx} className="flex-row items-start gap-2.5">
                      <View className="mt-0.5">
                        <Ionicons name={icon.name} size={16} color={icon.color} />
                      </View>
                      <Text className="flex-1 text-sm text-gray-700 dark:text-gray-300 leading-5">
                        {item.description}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
