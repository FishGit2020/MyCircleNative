import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  useTranslation,
  StorageKeys,
  safeGetItem,
  safeSetItem,
  AppEvents,
  eventBus,
} from '@mycircle/shared';
import { useAuth } from '../src/contexts/AuthContext';
import { useTheme } from '../src/contexts/ThemeContext';

type ThemeMode = 'light' | 'dark' | 'system';
type UnitSystem = 'us' | 'metric';

export default function SettingsScreen() {
  const { t, locale, setLocale } = useTranslation();
  const { user, signOut, updateUnitSystem } = useAuth();
  const { themeMode, setThemeMode } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [unitSystem, setUnitSystemState] = useState<UnitSystem>(() => {
    const temp = safeGetItem(StorageKeys.TEMP_UNIT);
    const dist = safeGetItem(StorageKeys.DISTANCE_UNIT);
    return temp === 'F' && dist === 'mi' ? 'us' : 'metric';
  });

  function handleUnitSystemChange(system: UnitSystem) {
    const isUS = system === 'us';
    setUnitSystemState(system);
    safeSetItem(StorageKeys.TEMP_UNIT, isUS ? 'F' : 'C');
    safeSetItem(StorageKeys.SPEED_UNIT, isUS ? 'mph' : 'kmh');
    safeSetItem(StorageKeys.DISTANCE_UNIT, isUS ? 'mi' : 'km');
    eventBus.publish(AppEvents.UNITS_CHANGED);
    updateUnitSystem(system);
  }

  function handleSignOut() {
    Alert.alert(t('auth.signOut'), 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: t('auth.signOut'),
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }

  const languageOptions: { value: 'en' | 'es' | 'zh'; label: string }[] = [
    { value: 'en', label: t('language.en') },
    { value: 'es', label: t('language.es') },
    { value: 'zh', label: t('language.zh') },
  ];

  const themeOptions: { value: ThemeMode; label: string; icon: string }[] = [
    { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
    { value: 'light', label: t('theme.light'), icon: 'sunny-outline' },
    { value: 'dark', label: t('theme.dark'), icon: 'moon-outline' },
  ];

  const unitSystemOptions: { value: UnitSystem; label: string }[] = [
    { value: 'metric', label: t('settings.unitSystemMetric') },
    { value: 'us', label: t('settings.unitSystemUS') },
  ];

  return (
    <View className="flex-1 bg-white dark:bg-gray-900" style={{ paddingTop: insets.top }}>
      <ScrollView className="flex-1" contentContainerClassName="pb-20">
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Pressable
            onPress={() => router.back()}
            className="mr-3 p-1 min-w-[44px] min-h-[44px] items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#6b7280" />
          </Pressable>
          <Text className="text-xl font-bold text-gray-900 dark:text-white">{t('dashboard.settings')}</Text>
        </View>

        {/* User profile section */}
        {user && (
          <View className="px-4 py-5 border-b border-gray-200 dark:border-gray-700">
            <View className="flex-row items-center">
              <View className="w-14 h-14 rounded-full bg-primary-500 items-center justify-center">
                <Text className="text-white text-xl font-bold">
                  {(user.displayName || user.email || '?')[0].toUpperCase()}
                </Text>
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                  {user.displayName || 'User'}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">{user.email}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Language */}
        <SectionHeader title={t('language.label')} />
        <SegmentedControl
          options={languageOptions}
          selected={locale}
          onSelect={(value) => setLocale(value as 'en' | 'es' | 'zh')}
        />

        {/* Theme */}
        <SectionHeader title="Theme" />
        <View className="px-4 flex-row gap-2">
          {themeOptions.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => setThemeMode(opt.value)}
              className={`flex-1 flex-row items-center justify-center py-3 rounded-xl border ${
                themeMode === opt.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              accessibilityRole="button"
              accessibilityLabel={opt.label}
            >
              <Ionicons
                name={opt.icon as any}
                size={18}
                color={themeMode === opt.value ? '#3b82f6' : '#9ca3af'}
              />
              <Text
                className={`ml-1.5 text-sm font-medium ${
                  themeMode === opt.value
                    ? 'text-primary-500'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Unit system — unified Metric / US toggle */}
        <SectionHeader title={t('settings.units')} />
        <SegmentedControl
          options={unitSystemOptions}
          selected={unitSystem}
          onSelect={(value) => handleUnitSystemChange(value as UnitSystem)}
        />
        <Text className="px-5 mt-1 text-xs text-gray-400 dark:text-gray-500">
          {unitSystem === 'us' ? '\u00B0F \u00B7 mph \u00B7 mi' : '\u00B0C \u00B7 km/h \u00B7 km'}
        </Text>

        {/* Notification preferences */}
        <SectionHeader title={t('notifications.preferences')} />
        <NotificationToggle
          label={t('notifications.weatherAlerts')}
          description={t('notifications.weatherAlertsDesc')}
          storageKey={StorageKeys.WEATHER_ALERTS}
        />
        <NotificationToggle
          label={t('notifications.announcementAlerts')}
          description={t('notifications.announcementAlertsDesc')}
          storageKey={StorageKeys.ANNOUNCEMENT_ALERTS}
        />

        {/* Sign out */}
        {user && (
          <View className="px-4 mt-8">
            <Pressable
              onPress={handleSignOut}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl py-3.5 items-center active:bg-red-100"
              accessibilityRole="button"
              accessibilityLabel={t('auth.signOut')}
            >
              <Text className="text-red-600 dark:text-red-400 font-semibold text-base">
                {t('auth.signOut')}
              </Text>
            </Pressable>
          </View>
        )}

        {/* App version */}
        <View className="items-center mt-8 mb-4">
          <Text className="text-xs text-gray-400 dark:text-gray-600">MyCircle Native v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

// --- Helper components ---

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="px-4 pt-6 pb-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
      {title}
    </Text>
  );
}

function SegmentedControl<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  return (
    <View className="px-4 flex-row gap-2">
      {options.map((opt) => (
        <Pressable
          key={opt.value}
          onPress={() => onSelect(opt.value)}
          className={`flex-1 py-2.5 rounded-xl items-center border ${
            selected === opt.value
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-200 dark:border-gray-700'
          }`}
          accessibilityRole="button"
          accessibilityLabel={opt.label}
        >
          <Text
            className={`text-sm font-medium ${
              selected === opt.value
                ? 'text-primary-500'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function NotificationToggle({
  label,
  description,
  storageKey,
}: {
  label: string;
  description: string;
  storageKey: string;
}) {
  const [enabled, setEnabled] = useState(() => safeGetItem(storageKey) === 'true');

  function handleToggle(value: boolean) {
    setEnabled(value);
    safeSetItem(storageKey, String(value));
    eventBus.publish(AppEvents.NOTIFICATION_ALERTS_CHANGED);
  }

  return (
    <View className="px-4 py-3 flex-row items-center justify-between">
      <View className="flex-1 mr-4">
        <Text className="text-base text-gray-900 dark:text-white">{label}</Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</Text>
      </View>
      <Switch
        value={enabled}
        onValueChange={handleToggle}
        trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
        thumbColor={enabled ? '#3b82f6' : '#f3f4f6'}
      />
    </View>
  );
}
