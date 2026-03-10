import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@mycircle/shared';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface MoreMenuItem {
  route: string;
  titleKey: string;
  descriptionKey: string;
  icon: IoniconsName;
}

const MENU_ITEMS: MoreMenuItem[] = [
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
    route: '/work-tracker',
    titleKey: 'workTracker.title',
    descriptionKey: 'home.quickWorkTrackerDesc',
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
    route: '/settings',
    titleKey: 'dashboard.settings',
    descriptionKey: 'dashboard.customizeWidgets',
    icon: 'settings-outline',
  },
];

export default function MoreScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 pb-20 md:pb-8"
      >
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('bottomNav.more')}
          </Text>
        </View>

        {/* Menu items */}
        <View className="gap-2">
          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item.route}
              type="button"
              className="flex-row items-center bg-gray-50 dark:bg-gray-800 rounded-xl p-4 active:bg-gray-100 dark:active:bg-gray-700"
              onPress={() => router.push(item.route as any)}
              accessibilityRole="button"
              accessibilityLabel={t(item.titleKey as any)}
            >
              <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-3">
                <Ionicons name={item.icon} size={22} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900 dark:text-white">
                  {t(item.titleKey as any)}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {t(item.descriptionKey as any)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
