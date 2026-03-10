import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import {
  useTranslation,
  StorageKeys,
  safeGetItem,
  safeSetItem,
  AppEvents,
  eventBus,
} from '@mycircle/shared';
import type { TemperatureUnit, SpeedUnit } from '@mycircle/shared';
import { useAuth } from '../src/contexts/AuthContext';

type DistanceUnit = 'km' | 'mi';

const EXPORT_VERSION = 1;
const KNOWN_ACCOUNTS_KEY = 'known-accounts';
const DISTANCE_UNIT_KEY = 'distanceUnit';

// Keys to skip during export (sensitive or device-specific)
const SKIP_KEYS = new Set([KNOWN_ACCOUNTS_KEY]);

interface KnownAccountEntry {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  lastSignedInAt: number;
}

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user, signOut, updateTempUnit, updateSpeedUnit } = useAuth();
  const router = useRouter();

  const [tempUnit, setTempUnitState] = useState<TemperatureUnit>(
    () => (safeGetItem(StorageKeys.TEMP_UNIT) as TemperatureUnit) || 'C',
  );
  const [speedUnit, setSpeedUnitState] = useState<SpeedUnit>(
    () => (safeGetItem(StorageKeys.SPEED_UNIT) as SpeedUnit) || 'ms',
  );
  const [distanceUnit, setDistanceUnitState] = useState<DistanceUnit>(
    () => (safeGetItem(DISTANCE_UNIT_KEY) as DistanceUnit) || 'km',
  );
  const [knownAccounts, setKnownAccounts] = useState<KnownAccountEntry[]>([]);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Load known accounts from AsyncStorage
  useEffect(() => {
    try {
      const stored = safeGetItem(KNOWN_ACCOUNTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setKnownAccounts(parsed);
        }
      }
    } catch {
      /* ignore parse errors */
    }
  }, []);

  // ---------- Unit handlers ----------

  function handleTempUnitChange(unit: TemperatureUnit) {
    setTempUnitState(unit);
    safeSetItem(StorageKeys.TEMP_UNIT, unit);
    eventBus.publish(AppEvents.UNITS_CHANGED);
    updateTempUnit(unit);
  }

  function handleSpeedUnitChange(unit: SpeedUnit) {
    setSpeedUnitState(unit);
    safeSetItem(StorageKeys.SPEED_UNIT, unit);
    eventBus.publish(AppEvents.UNITS_CHANGED);
    updateSpeedUnit(unit);
  }

  function handleDistanceUnitChange(unit: DistanceUnit) {
    setDistanceUnitState(unit);
    safeSetItem(DISTANCE_UNIT_KEY, unit);
    eventBus.publish(AppEvents.UNITS_CHANGED);
  }

  // ---------- Sign out ----------

  function handleSignOut() {
    Alert.alert(t('profile.signOut' as any), t('profile.signOutConfirm' as any), [
      { text: t('common.cancel' as any) || 'Cancel', style: 'cancel' },
      {
        text: t('profile.signOut' as any),
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }

  // ---------- Data export ----------

  const handleExport = useCallback(async () => {
    try {
      const data: Record<string, unknown> = {};
      const allKeys = Object.values(StorageKeys);
      for (const key of allKeys) {
        if (SKIP_KEYS.has(key)) continue;
        const value = safeGetItem(key);
        if (value !== null) {
          try {
            data[key] = JSON.parse(value);
          } catch {
            data[key] = value;
          }
        }
      }
      const exportObj = {
        version: EXPORT_VERSION,
        exportedAt: new Date().toISOString(),
        data,
      };
      const fileName = `mycircle-backup-${new Date().toISOString().slice(0, 10)}.json`;
      const filePath = `${(FileSystem as any).cacheDirectory ?? FileSystem.Paths.cache}/${fileName}`;
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(exportObj, null, 2));
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/json',
        dialogTitle: t('profile.export' as any),
      });
      Alert.alert(t('profile.exportSuccess' as any));
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Export failed');
    }
  }, [t]);

  // ---------- Data import ----------

  const handleImport = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const fileUri = result.assets[0].uri;
      const content = await FileSystem.readAsStringAsync(fileUri);
      const parsed = JSON.parse(content);
      if (!parsed.version || !parsed.data || typeof parsed.data !== 'object') {
        Alert.alert('Error', 'Invalid backup file format');
        return;
      }
      const validKeys = new Set(Object.values(StorageKeys));
      let imported = 0;
      for (const [key, value] of Object.entries(parsed.data)) {
        if (SKIP_KEYS.has(key) || !validKeys.has(key as any)) continue;
        safeSetItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        imported++;
      }
      setImportStatus(`${imported} items restored`);
      Alert.alert(t('profile.importSuccess' as any));
      // Notify listeners that data changed
      eventBus.publish(AppEvents.UNITS_CHANGED);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Import failed');
    }
  }, [t]);

  // ---------- Account helpers ----------

  const otherAccounts = knownAccounts
    .filter((a) => a.uid !== user?.uid)
    .sort((a, b) => b.lastSignedInAt - a.lastSignedInAt);

  // ---------- Render helpers ----------

  const initials = user
    ? (user.displayName || user.email || '?')[0].toUpperCase()
    : '?';

  const tempOptions: { value: TemperatureUnit; label: string }[] = [
    { value: 'C', label: '\u00B0C' },
    { value: 'F', label: '\u00B0F' },
  ];

  const speedOptions: { value: SpeedUnit; label: string }[] = [
    { value: 'ms', label: 'm/s' },
    { value: 'mph', label: 'mph' },
    { value: 'kmh', label: 'km/h' },
  ];

  const distanceOptions: { value: DistanceUnit; label: string }[] = [
    { value: 'km', label: 'km' },
    { value: 'mi', label: 'mi' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
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
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            {t('profile.title' as any)}
          </Text>
        </View>

        {/* User avatar / profile section */}
        {user && (
          <View className="px-4 py-6 border-b border-gray-200 dark:border-gray-700 items-center">
            {user.photoURL ? (
              <Image
                source={{ uri: user.photoURL }}
                className="w-20 h-20 rounded-full"
                accessibilityLabel={user.displayName || 'User avatar'}
              />
            ) : (
              <View className="w-20 h-20 rounded-full bg-primary-500 items-center justify-center">
                <Text className="text-white text-3xl font-bold">{initials}</Text>
              </View>
            )}
            <Text className="mt-3 text-xl font-semibold text-gray-900 dark:text-white">
              {user.displayName || 'User'}
            </Text>
            <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {user.email}
            </Text>
          </View>
        )}

        {/* Multiple accounts section */}
        <SectionHeader title={t('profile.accounts' as any)} />
        {otherAccounts.length > 0 ? (
          <View className="px-4 gap-2">
            {otherAccounts.map((account) => (
              <View
                key={account.uid}
                className="flex-row items-center bg-gray-50 dark:bg-gray-800 rounded-xl p-3"
              >
                {account.photoURL ? (
                  <Image
                    source={{ uri: account.photoURL }}
                    className="w-10 h-10 rounded-full"
                    accessibilityLabel={account.displayName || 'Account avatar'}
                  />
                ) : (
                  <View className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center">
                    <Text className="text-white text-sm font-bold">
                      {(account.displayName || account.email || 'U')[0].toUpperCase()}
                    </Text>
                  </View>
                )}
                <View className="ml-3 flex-1">
                  <Text className="text-base font-medium text-gray-900 dark:text-white" numberOfLines={1}>
                    {account.displayName || 'User'}
                  </Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400" numberOfLines={1}>
                    {account.email}
                  </Text>
                </View>
                <Pressable
                  className="px-3 py-1.5 bg-primary-500 rounded-lg min-w-[44px] min-h-[44px] items-center justify-center"
                  accessibilityRole="button"
                  accessibilityLabel={`${t('profile.switchAccount' as any)} ${account.displayName || account.email}`}
                  onPress={() => {
                    Alert.alert(
                      t('profile.switchAccount' as any),
                      `${account.email}`,
                      [
                        { text: t('common.cancel' as any) || 'Cancel', style: 'cancel' },
                        {
                          text: t('profile.switchAccount' as any),
                          onPress: async () => {
                            await signOut();
                            router.replace('/(auth)/login');
                          },
                        },
                      ],
                    );
                  }}
                >
                  <Ionicons name="swap-horizontal" size={18} color="#ffffff" />
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <View className="px-4">
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {t('profile.noAccounts' as any)}
            </Text>
          </View>
        )}

        {/* Unit system toggle */}
        <SectionHeader title={t('profile.units' as any)} />

        {/* Temperature */}
        <View className="px-4 mb-3">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('profile.tempUnit' as any)}
          </Text>
          <SegmentedControl
            options={tempOptions}
            selected={tempUnit}
            onSelect={(value) => handleTempUnitChange(value as TemperatureUnit)}
          />
        </View>

        {/* Speed */}
        <View className="px-4 mb-3">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('profile.speedUnit' as any)}
          </Text>
          <SegmentedControl
            options={speedOptions}
            selected={speedUnit}
            onSelect={(value) => handleSpeedUnitChange(value as SpeedUnit)}
          />
        </View>

        {/* Distance */}
        <View className="px-4 mb-3">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('profile.distanceUnit' as any)}
          </Text>
          <SegmentedControl
            options={distanceOptions}
            selected={distanceUnit}
            onSelect={(value) => handleDistanceUnitChange(value as DistanceUnit)}
          />
        </View>

        {/* Data management */}
        <SectionHeader title={t('profile.dataManagement' as any)} />
        <View className="px-4 gap-2">
          <Pressable
            onPress={handleExport}
            className="flex-row items-center bg-gray-50 dark:bg-gray-800 rounded-xl p-4 active:bg-gray-100 dark:active:bg-gray-700"
            accessibilityRole="button"
            accessibilityLabel={t('profile.export' as any)}
          >
            <View className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mr-3">
              <Ionicons name="download-outline" size={22} color="#22c55e" />
            </View>
            <Text className="flex-1 text-base font-medium text-gray-900 dark:text-white">
              {t('profile.export' as any)}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </Pressable>

          <Pressable
            onPress={handleImport}
            className="flex-row items-center bg-gray-50 dark:bg-gray-800 rounded-xl p-4 active:bg-gray-100 dark:active:bg-gray-700"
            accessibilityRole="button"
            accessibilityLabel={t('profile.import' as any)}
          >
            <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-3">
              <Ionicons name="cloud-upload-outline" size={22} color="#3b82f6" />
            </View>
            <Text className="flex-1 text-base font-medium text-gray-900 dark:text-white">
              {t('profile.import' as any)}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </Pressable>

          {importStatus && (
            <Text className="text-sm text-blue-600 dark:text-blue-400 px-2">
              {importStatus}
            </Text>
          )}
        </View>

        {/* Link to Settings */}
        <SectionHeader title={t('dashboard.settings' as any)} />
        <View className="px-4">
          <Pressable
            onPress={() => router.push('/settings')}
            className="flex-row items-center bg-gray-50 dark:bg-gray-800 rounded-xl p-4 active:bg-gray-100 dark:active:bg-gray-700"
            accessibilityRole="button"
            accessibilityLabel={t('dashboard.settings' as any)}
          >
            <View className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center mr-3">
              <Ionicons name="settings-outline" size={22} color="#6b7280" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-gray-900 dark:text-white">
                {t('dashboard.settings' as any)}
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {t('dashboard.customizeWidgets' as any)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </Pressable>
        </View>

        {/* Sign out */}
        {user && (
          <View className="px-4 mt-8">
            <Pressable
              onPress={handleSignOut}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl py-3.5 items-center active:bg-red-100 min-h-[44px] justify-center"
              accessibilityRole="button"
              accessibilityLabel={t('profile.signOut' as any)}
            >
              <Text className="text-red-600 dark:text-red-400 font-semibold text-base">
                {t('profile.signOut' as any)}
              </Text>
            </Pressable>
          </View>
        )}

        {/* App version */}
        <View className="items-center mt-8 mb-4">
          <Text className="text-xs text-gray-400 dark:text-gray-600">
            MyCircle Native v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    <View className="flex-row gap-2">
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
