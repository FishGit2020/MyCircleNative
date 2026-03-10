import { Tabs } from 'expo-router';
import { View, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@mycircle/shared';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface TabConfig {
  name: string;
  titleKey: string;
  iconFocused: IoniconsName;
  iconDefault: IoniconsName;
}

const TAB_CONFIG: TabConfig[] = [
  {
    name: 'index',
    titleKey: 'dashboard.title',
    iconFocused: 'grid',
    iconDefault: 'grid-outline',
  },
  {
    name: 'weather',
    titleKey: 'nav.weather',
    iconFocused: 'cloud',
    iconDefault: 'cloud-outline',
  },
  {
    name: 'stocks',
    titleKey: 'nav.stocks',
    iconFocused: 'trending-up',
    iconDefault: 'trending-up-outline',
  },
  {
    name: 'podcasts',
    titleKey: 'nav.podcasts',
    iconFocused: 'headset',
    iconDefault: 'headset-outline',
  },
  {
    name: 'bible',
    titleKey: 'nav.bible',
    iconFocused: 'book',
    iconDefault: 'book-outline',
  },
  {
    name: 'more',
    titleKey: 'bottomNav.more',
    iconFocused: 'ellipsis-horizontal',
    iconDefault: 'ellipsis-horizontal',
  },
];

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();

  const isDark = colorScheme === 'dark';

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: isDark ? '#111827' : '#ffffff' }}>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: isDark ? '#9ca3af' : '#6b7280',
        tabBarStyle: {
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          borderTopColor: isDark ? '#374151' : '#e5e7eb',
          borderTopWidth: 1,
          paddingBottom: 4,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      {TAB_CONFIG.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: t(tab.titleKey as any),
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? tab.iconFocused : tab.iconDefault}
                size={size}
                color={color}
              />
            ),
            tabBarAccessibilityLabel: t(tab.titleKey as any),
          }}
        />
      ))}
    </Tabs>
    </View>
  );
}
