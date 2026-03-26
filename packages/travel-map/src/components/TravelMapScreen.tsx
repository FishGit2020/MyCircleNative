import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useTranslation,
  safeGetItem,
  safeSetItem,
  StorageKeys,
} from '@mycircle/shared';

type PinType = 'lived' | 'visited' | 'wishlist';

interface TravelPin {
  id: string;
  location: string;
  type: PinType;
  notes: string;
  createdAt: string;
}

const PIN_TYPES: { key: PinType; color: string; bgClass: string; textClass: string }[] = [
  { key: 'lived', color: '#ef4444', bgClass: 'bg-red-100 dark:bg-red-900', textClass: 'text-red-700 dark:text-red-300' },
  { key: 'visited', color: '#3b82f6', bgClass: 'bg-blue-100 dark:bg-blue-900', textClass: 'text-blue-700 dark:text-blue-300' },
  { key: 'wishlist', color: '#eab308', bgClass: 'bg-yellow-100 dark:bg-yellow-900', textClass: 'text-yellow-700 dark:text-yellow-300' },
];

function getPinStyle(type: PinType) {
  return PIN_TYPES.find((p) => p.key === type) ?? PIN_TYPES[0];
}

export default function TravelMapScreen() {
  const { t } = useTranslation();
  const [pins, setPins] = useState<TravelPin[]>(() => {
    const stored = safeGetItem(StorageKeys.TRAVEL_PINS as any);
    return stored ? JSON.parse(stored) : [];
  });
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formLocation, setFormLocation] = useState('');
  const [formType, setFormType] = useState<PinType>('visited');
  const [formNotes, setFormNotes] = useState('');

  const savePins = useCallback((updated: TravelPin[]) => {
    setPins(updated);
    safeSetItem(StorageKeys.TRAVEL_PINS as any, JSON.stringify(updated));
  }, []);

  const addPin = useCallback(() => {
    if (!formLocation.trim()) {
      Alert.alert(t('travelMap.errorTitle' as any), t('travelMap.locationRequired' as any));
      return;
    }
    const pin: TravelPin = {
      id: Date.now().toString(),
      location: formLocation.trim(),
      type: formType,
      notes: formNotes.trim(),
      createdAt: new Date().toISOString(),
    };
    savePins([pin, ...pins]);
    setFormLocation('');
    setFormNotes('');
    setFormType('visited');
    setShowForm(false);
  }, [formLocation, formType, formNotes, pins, savePins, t]);

  const removePin = useCallback(
    (id: string) => {
      Alert.alert(
        t('travelMap.deleteTitle' as any),
        t('travelMap.deleteConfirm' as any),
        [
          { text: t('travelMap.cancel' as any), style: 'cancel' },
          {
            text: t('travelMap.delete' as any),
            style: 'destructive',
            onPress: () => savePins(pins.filter((p) => p.id !== id)),
          },
        ],
      );
    },
    [pins, savePins, t],
  );

  const filteredPins = useMemo(() => {
    if (!search.trim()) return pins;
    const q = search.toLowerCase();
    return pins.filter(
      (p) =>
        p.location.toLowerCase().includes(q) ||
        p.notes.toLowerCase().includes(q),
    );
  }, [pins, search]);

  const groupedPins = useMemo(() => {
    const groups: Record<PinType, TravelPin[]> = { lived: [], visited: [], wishlist: [] };
    filteredPins.forEach((p) => groups[p.type].push(p));
    return groups;
  }, [filteredPins]);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Search */}
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center bg-white dark:bg-gray-800 rounded-xl px-3 border border-gray-200 dark:border-gray-700">
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            className="flex-1 py-3 px-2 text-base text-gray-900 dark:text-white"
            placeholder={t('travelMap.searchPlaceholder' as any)}
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
            accessibilityLabel={t('travelMap.searchPlaceholder' as any)}
          />
        </View>
      </View>

      {/* Add pin button */}
      <View className="px-4 pb-2">
        <Pressable
          onPress={() => setShowForm(!showForm)}
          className="flex-row items-center justify-center bg-blue-600 dark:bg-blue-500 rounded-xl py-3 min-h-[44px]"
          accessibilityLabel={t('travelMap.addPin' as any)}
          accessibilityRole="button"
        >
          <Ionicons name={showForm ? 'chevron-up' : 'add'} size={20} color="#fff" />
          <Text className="text-white font-bold ml-2">
            {t('travelMap.addPin' as any)}
          </Text>
        </Pressable>
      </View>

      {/* Add pin form */}
      {showForm && (
        <View className="mx-4 mb-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <TextInput
            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 text-base text-gray-900 dark:text-white mb-3"
            placeholder={t('travelMap.locationName' as any)}
            placeholderTextColor="#9ca3af"
            value={formLocation}
            onChangeText={setFormLocation}
            accessibilityLabel={t('travelMap.locationName' as any)}
          />

          {/* Type selector */}
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('travelMap.type' as any)}
          </Text>
          <View className="flex-row gap-2 mb-3">
            {PIN_TYPES.map((pt) => {
              const active = formType === pt.key;
              return (
                <Pressable
                  key={pt.key}
                  onPress={() => setFormType(pt.key)}
                  className={`flex-1 py-2 rounded-lg min-h-[44px] items-center justify-center border-2 ${
                    active ? 'border-blue-600 dark:border-blue-400' : 'border-transparent'
                  } ${pt.bgClass}`}
                  accessibilityLabel={t(`travelMap.${pt.key}` as any)}
                  accessibilityRole="button"
                >
                  <Text className={`text-sm font-medium ${pt.textClass}`}>
                    {t(`travelMap.${pt.key}` as any)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <TextInput
            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 text-base text-gray-900 dark:text-white mb-3 min-h-[80px]"
            placeholder={t('travelMap.notes' as any)}
            placeholderTextColor="#9ca3af"
            value={formNotes}
            onChangeText={setFormNotes}
            multiline
            textAlignVertical="top"
            accessibilityLabel={t('travelMap.notes' as any)}
          />

          <Pressable
            onPress={addPin}
            className="bg-green-600 dark:bg-green-500 rounded-lg py-3 items-center min-h-[44px] justify-center"
            accessibilityLabel={t('travelMap.save' as any)}
            accessibilityRole="button"
          >
            <Text className="text-white font-bold text-base">
              {t('travelMap.save' as any)}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Pins list grouped by type */}
      <ScrollView className="flex-1 px-4">
        {(['lived', 'visited', 'wishlist'] as PinType[]).map((type) => {
          const group = groupedPins[type];
          if (group.length === 0) return null;
          const style = getPinStyle(type);
          return (
            <View key={type} className="mb-4">
              <View className="flex-row items-center mb-2">
                <View className={`w-3 h-3 rounded-full mr-2`} style={{ backgroundColor: style.color }} />
                <Text className="text-base font-bold text-gray-900 dark:text-white">
                  {t(`travelMap.${type}` as any)} ({group.length})
                </Text>
              </View>
              {group.map((pin) => (
                <View
                  key={pin.id}
                  className="flex-row items-start bg-white dark:bg-gray-800 rounded-xl p-4 mb-2 border border-gray-200 dark:border-gray-700"
                >
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-base font-semibold text-gray-900 dark:text-white">
                        {pin.location}
                      </Text>
                      <View className={`ml-2 px-2 py-0.5 rounded-full ${style.bgClass}`}>
                        <Text className={`text-xs font-medium ${style.textClass}`}>
                          {t(`travelMap.${pin.type}` as any)}
                        </Text>
                      </View>
                    </View>
                    {pin.notes ? (
                      <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {pin.notes}
                      </Text>
                    ) : null}
                  </View>
                  <Pressable
                    onPress={() => removePin(pin.id)}
                    className="min-w-[44px] min-h-[44px] items-center justify-center"
                    accessibilityLabel={t('travelMap.delete' as any)}
                    accessibilityRole="button"
                  >
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </Pressable>
                </View>
              ))}
            </View>
          );
        })}

        {filteredPins.length === 0 && (
          <View className="items-center py-20">
            <Ionicons name="location-outline" size={48} color="#9ca3af" />
            <Text className="text-gray-500 dark:text-gray-400 mt-3 text-base">
              {t('travelMap.noPins' as any)}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
