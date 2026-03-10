import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useTranslation, eventBus, AppEvents } from '@mycircle/shared';

// ── Types ────────────────────────────────────────────────────
interface Activity {
  id: string;
  time: string;
  title: string;
  location: string;
  notes: string;
}

interface ItineraryDay {
  date: string;
  activities: Activity[];
}

interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  notes: string;
  itinerary: ItineraryDay[];
  createdAt: number;
  updatedAt: number;
}

type ViewMode = 'list' | 'new' | 'detail';
type Filter = 'upcoming' | 'past';

// ── Helpers ──────────────────────────────────────────────────
function getTripStatus(trip: Trip): 'upcoming' | 'ongoing' | 'past' {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const start = new Date(trip.startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(trip.endDate);
  end.setHours(0, 0, 0, 0);
  if (now < start) return 'upcoming';
  if (now > end) return 'past';
  return 'ongoing';
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  if (s.getFullYear() !== e.getFullYear()) {
    return `${s.toLocaleDateString(undefined, { ...opts, year: 'numeric' })} \u2013 ${e.toLocaleDateString(undefined, { ...opts, year: 'numeric' })}`;
  }
  return `${s.toLocaleDateString(undefined, opts)} \u2013 ${e.toLocaleDateString(undefined, { ...opts, year: 'numeric' })}`;
}

function generateDates(start: string, end: string): string[] {
  const dates: string[] = [];
  const [sy, sm, sd] = start.split('-').map(Number);
  const [ey, em, ed] = end.split('-').map(Number);
  const current = new Date(sy, sm - 1, sd);
  const endDate = new Date(ey, em - 1, ed);
  while (current <= endDate) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

// ── Component ────────────────────────────────────────────────
export default function TripPlannerScreen() {
  const { t } = useTranslation();
  const user = auth().currentUser;

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>('list');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [filter, setFilter] = useState<Filter>('upcoming');

  // Form state
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');

  // Itinerary add state
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [actTitle, setActTitle] = useState('');
  const [actTime, setActTime] = useState('09:00');
  const [actLocation, setActLocation] = useState('');

  // ── Subscribe to trips ─────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const unsubscribe = firestore()
      .collection('users')
      .doc(user.uid)
      .collection('trips')
      .orderBy('startDate', 'asc')
      .onSnapshot(
        (snapshot) => {
          const data: Trip[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Trip[];
          setTrips(data);
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        },
      );
    return unsubscribe;
  }, [user]);

  // ── CRUD ───────────────────────────────────────────────────
  const handleSaveTrip = useCallback(async () => {
    if (!user) return;
    if (!destination.trim() || !startDate || !endDate) return;

    try {
      const data = {
        destination: destination.trim(),
        startDate,
        endDate,
        notes: notes.trim(),
        itinerary: selectedTrip?.itinerary || [],
        updatedAt: Date.now(),
      };

      if (selectedTrip) {
        await firestore()
          .collection('users')
          .doc(user.uid)
          .collection('trips')
          .doc(selectedTrip.id)
          .update(data);
      } else {
        await firestore()
          .collection('users')
          .doc(user.uid)
          .collection('trips')
          .add({ ...data, createdAt: Date.now() });
      }
      eventBus.publish(AppEvents.TRIPS_CHANGED);
      resetForm();
      setView('list');
    } catch (err) {
      Alert.alert(t('trip.error'), err instanceof Error ? err.message : 'Unknown error');
    }
  }, [destination, startDate, endDate, notes, selectedTrip, user, t]);

  const handleDeleteTrip = useCallback(
    (tripId: string) => {
      if (!user) return;
      Alert.alert(t('trip.delete'), t('trip.deleteConfirm'), [
        { text: t('trip.cancel'), style: 'cancel' },
        {
          text: t('trip.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await firestore()
                .collection('users')
                .doc(user.uid)
                .collection('trips')
                .doc(tripId)
                .delete();
              eventBus.publish(AppEvents.TRIPS_CHANGED);
              if (view === 'detail') {
                setView('list');
                setSelectedTrip(null);
              }
            } catch (err) {
              Alert.alert(
                t('trip.error'),
                err instanceof Error ? err.message : 'Unknown error',
              );
            }
          },
        },
      ]);
    },
    [user, t, view],
  );

  // ── Itinerary ──────────────────────────────────────────────
  const handleAddActivity = useCallback(
    async (tripId: string, date: string) => {
      if (!user) return;
      if (!actTitle.trim()) return;
      const trip = trips.find((tr) => tr.id === tripId);
      if (!trip) return;

      const activity: Activity = {
        id: `act-${Date.now()}`,
        time: actTime,
        title: actTitle.trim(),
        location: actLocation.trim(),
        notes: '',
      };

      const existingDay = trip.itinerary.find((d) => d.date === date);
      let updated: ItineraryDay[];
      if (existingDay) {
        updated = trip.itinerary.map((d) =>
          d.date === date
            ? {
                ...d,
                activities: [...d.activities, activity].sort((a, b) =>
                  a.time.localeCompare(b.time),
                ),
              }
            : d,
        );
      } else {
        updated = [...trip.itinerary, { date, activities: [activity] }];
      }

      try {
        await firestore()
          .collection('users')
          .doc(user.uid)
          .collection('trips')
          .doc(tripId)
          .update({ itinerary: updated, updatedAt: Date.now() });
        setActTitle('');
        setActLocation('');
        setAddingTo(null);
      } catch (err) {
        Alert.alert(t('trip.error'), err instanceof Error ? err.message : 'Unknown error');
      }
    },
    [actTitle, actTime, actLocation, trips, user, t],
  );

  const handleDeleteActivity = useCallback(
    async (tripId: string, date: string, activityId: string) => {
      if (!user) return;
      const trip = trips.find((tr) => tr.id === tripId);
      if (!trip) return;

      const updated = trip.itinerary
        .map((d) =>
          d.date === date
            ? { ...d, activities: d.activities.filter((a) => a.id !== activityId) }
            : d,
        )
        .filter((d) => d.activities.length > 0);

      try {
        await firestore()
          .collection('users')
          .doc(user.uid)
          .collection('trips')
          .doc(tripId)
          .update({ itinerary: updated, updatedAt: Date.now() });
      } catch (err) {
        Alert.alert(t('trip.error'), err instanceof Error ? err.message : 'Unknown error');
      }
    },
    [trips, user, t],
  );

  const resetForm = useCallback(() => {
    setDestination('');
    setStartDate('');
    setEndDate('');
    setNotes('');
    setSelectedTrip(null);
  }, []);

  const openEdit = useCallback((trip: Trip) => {
    setSelectedTrip(trip);
    setDestination(trip.destination);
    setStartDate(trip.startDate);
    setEndDate(trip.endDate);
    setNotes(trip.notes);
    setView('new');
  }, []);

  // ── Filtered trips ─────────────────────────────────────────
  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const status = getTripStatus(trip);
      if (filter === 'upcoming') return status === 'upcoming' || status === 'ongoing';
      return status === 'past';
    });
  }, [trips, filter]);

  // ── Auth wall ──────────────────────────────────────────────
  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="lock-closed-outline" size={48} color="#d1d5db" />
          <Text className="text-gray-500 dark:text-gray-400 mt-3 text-center">
            {t('trip.loginToUse')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Loading ────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#06b6d4" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-500 dark:text-red-400 text-center">{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Create/Edit view ───────────────────────────────────────
  if (view === 'new') {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-800 dark:text-white">
              {selectedTrip ? t('trip.edit') : t('trip.create')}
            </Text>
            <Pressable
              onPress={() => {
                resetForm();
                setView('list');
              }}
              accessibilityRole="button"
              accessibilityLabel={t('trip.cancel')}
              style={{ minWidth: 44, minHeight: 44, justifyContent: 'center' }}
            >
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {t('trip.cancel')}
              </Text>
            </Pressable>
          </View>

          {/* Destination */}
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('trip.destination')} *
          </Text>
          <TextInput
            value={destination}
            onChangeText={setDestination}
            placeholder={t('trip.destinationPlaceholder')}
            placeholderTextColor="#9ca3af"
            accessibilityLabel={t('trip.destination')}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 mb-4 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />

          {/* Dates */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('trip.startDate')} *
              </Text>
              <TextInput
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
                accessibilityLabel={t('trip.startDate')}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('trip.endDate')} *
              </Text>
              <TextInput
                value={endDate}
                onChangeText={setEndDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
                accessibilityLabel={t('trip.endDate')}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </View>
          </View>

          {/* Notes */}
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('trip.notes')}
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder={t('trip.notesPlaceholder')}
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
            accessibilityLabel={t('trip.notes')}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 mb-4 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            style={{ textAlignVertical: 'top', minHeight: 80 }}
          />

          {/* Submit */}
          <Pressable
            onPress={handleSaveTrip}
            disabled={!destination.trim() || !startDate || !endDate}
            accessibilityRole="button"
            accessibilityLabel={selectedTrip ? t('trip.edit') : t('trip.create')}
            className={`w-full py-2.5 px-4 rounded-lg items-center ${
              !destination.trim() || !startDate || !endDate
                ? 'bg-cyan-400 dark:bg-cyan-800'
                : 'bg-cyan-500 dark:bg-cyan-600'
            }`}
            style={{ minHeight: 44 }}
          >
            <Text className="text-white text-sm font-medium">
              {selectedTrip ? t('trip.save') : t('trip.create')}
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Detail view ────────────────────────────────────────────
  if (view === 'detail' && selectedTrip) {
    const currentTrip = trips.find((tr) => tr.id === selectedTrip.id) || selectedTrip;
    const dates = generateDates(currentTrip.startDate, currentTrip.endDate);

    // Deduplicate itinerary
    const dedupedMap = new Map<string, ItineraryDay>();
    for (const day of currentTrip.itinerary) {
      const existing = dedupedMap.get(day.date);
      if (existing) {
        dedupedMap.set(day.date, {
          ...existing,
          activities: [...existing.activities, ...day.activities],
        });
      } else {
        dedupedMap.set(day.date, day);
      }
    }

    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled">
          {/* Back */}
          <Pressable
            onPress={() => {
              setView('list');
              setSelectedTrip(null);
            }}
            accessibilityRole="button"
            accessibilityLabel={t('trip.back')}
            className="mb-2"
            style={{ minHeight: 44, justifyContent: 'center' }}
          >
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {'\u2190'} {t('trip.back')}
            </Text>
          </Pressable>

          {/* Header */}
          <View className="flex-row items-start justify-between mb-4">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentTrip.destination}
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {formatDateRange(currentTrip.startDate, currentTrip.endDate)}
              </Text>
            </View>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => openEdit(currentTrip)}
                accessibilityRole="button"
                accessibilityLabel={t('trip.edit')}
                className="px-3 py-1.5 bg-gray-100 rounded-lg dark:bg-gray-700"
                style={{ minWidth: 44, minHeight: 44, justifyContent: 'center' }}
              >
                <Text className="text-sm text-gray-700 dark:text-gray-200">
                  {t('trip.edit')}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleDeleteTrip(currentTrip.id)}
                accessibilityRole="button"
                accessibilityLabel={t('trip.delete')}
                style={{ minWidth: 44, minHeight: 44, justifyContent: 'center' }}
              >
                <Text className="text-sm text-red-600 dark:text-red-400">
                  {t('trip.delete')}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Notes */}
          {currentTrip.notes ? (
            <View className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-4">
              <Text className="text-sm text-gray-600 dark:text-gray-300">
                {currentTrip.notes}
              </Text>
            </View>
          ) : null}

          {/* Itinerary */}
          <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
            {t('trip.itinerary')}
          </Text>
          {dates.map((date, idx) => {
            const day = dedupedMap.get(date);
            const dayLabel = new Date(date).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });

            return (
              <View
                key={date}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-3"
              >
                <View className="flex-row items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800">
                  <Text className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {t('trip.day')} {idx + 1} {'\u2014'} {dayLabel}
                  </Text>
                  <Pressable
                    onPress={() => setAddingTo(addingTo === date ? null : date)}
                    accessibilityRole="button"
                    accessibilityLabel={t('trip.addItem')}
                    style={{ minWidth: 44, minHeight: 44, justifyContent: 'center' }}
                  >
                    <Text className="text-xs text-cyan-600 dark:text-cyan-400">
                      + {t('trip.addItem')}
                    </Text>
                  </Pressable>
                </View>

                {/* Activities */}
                {day &&
                  day.activities.length > 0 &&
                  day.activities.map((act) => (
                    <View
                      key={act.id}
                      className="flex-row items-center gap-3 px-4 py-2.5 border-t border-gray-100 dark:border-gray-700"
                    >
                      <Text className="text-xs text-gray-400 dark:text-gray-500 w-12">
                        {act.time}
                      </Text>
                      <View className="flex-1 min-w-0">
                        <Text
                          className="text-sm font-medium text-gray-800 dark:text-white"
                          numberOfLines={1}
                        >
                          {act.title}
                        </Text>
                        {act.location ? (
                          <Text
                            className="text-xs text-gray-400 dark:text-gray-500"
                            numberOfLines={1}
                          >
                            {act.location}
                          </Text>
                        ) : null}
                      </View>
                      <Pressable
                        onPress={() =>
                          handleDeleteActivity(currentTrip.id, date, act.id)
                        }
                        accessibilityRole="button"
                        accessibilityLabel={t('trip.deleteActivity')}
                        style={{ minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
                      >
                        <Ionicons name="close" size={16} color="#9ca3af" />
                      </Pressable>
                    </View>
                  ))}

                {/* Add activity form */}
                {addingTo === date && (
                  <View className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <View className="flex-row gap-2 mb-2">
                      <TextInput
                        value={actTime}
                        onChangeText={setActTime}
                        placeholder="09:00"
                        placeholderTextColor="#9ca3af"
                        accessibilityLabel={t('trip.time')}
                        className="w-20 px-2 py-1.5 text-sm rounded border border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                      <TextInput
                        value={actTitle}
                        onChangeText={setActTitle}
                        placeholder={t('trip.activityTitle')}
                        placeholderTextColor="#9ca3af"
                        accessibilityLabel={t('trip.activityTitle')}
                        className="flex-1 px-2 py-1.5 text-sm rounded border border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </View>
                    <TextInput
                      value={actLocation}
                      onChangeText={setActLocation}
                      placeholder={t('trip.location')}
                      placeholderTextColor="#9ca3af"
                      accessibilityLabel={t('trip.location')}
                      className="w-full px-2 py-1.5 text-sm rounded border border-gray-300 bg-white text-gray-900 mb-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                    <View className="flex-row justify-end gap-2">
                      <Pressable
                        onPress={() => setAddingTo(null)}
                        accessibilityRole="button"
                        accessibilityLabel={t('trip.cancel')}
                        style={{ minWidth: 44, minHeight: 44, justifyContent: 'center' }}
                      >
                        <Text className="text-xs text-gray-500 dark:text-gray-400">
                          {t('trip.cancel')}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleAddActivity(currentTrip.id, date)}
                        disabled={!actTitle.trim()}
                        accessibilityRole="button"
                        accessibilityLabel={t('trip.add')}
                        className={`px-3 py-1 rounded ${
                          !actTitle.trim()
                            ? 'bg-cyan-400 dark:bg-cyan-800'
                            : 'bg-cyan-500 dark:bg-cyan-600'
                        }`}
                        style={{ minHeight: 44, justifyContent: 'center' }}
                      >
                        <Text className="text-xs text-white">{t('trip.add')}</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            );
          })}

          {/* Bottom spacer */}
          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── List view ──────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <Ionicons name="map-outline" size={24} color="#06b6d4" />
            <Text className="text-2xl font-bold text-gray-800 dark:text-white">
              {t('trip.title')}
            </Text>
          </View>
          <Pressable
            onPress={() => {
              resetForm();
              setView('new');
            }}
            accessibilityRole="button"
            accessibilityLabel={t('trip.create')}
            className="px-4 py-2 bg-cyan-500 rounded-lg dark:bg-cyan-600"
            style={{ minHeight: 44, justifyContent: 'center' }}
          >
            <Text className="text-white text-sm font-medium">{t('trip.create')}</Text>
          </Pressable>
        </View>

        {/* Filter tabs */}
        <View className="flex-row border-b border-gray-200 dark:border-gray-700">
          <Pressable
            onPress={() => setFilter('upcoming')}
            accessibilityRole="tab"
            accessibilityLabel={t('trip.upcoming')}
            accessibilityState={{ selected: filter === 'upcoming' }}
            className={`px-4 py-2.5 border-b-2 ${
              filter === 'upcoming'
                ? 'border-cyan-500 dark:border-cyan-400'
                : 'border-transparent'
            }`}
            style={{ minHeight: 44 }}
          >
            <Text
              className={`text-sm font-medium ${
                filter === 'upcoming'
                  ? 'text-cyan-600 dark:text-cyan-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {t('trip.upcoming')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setFilter('past')}
            accessibilityRole="tab"
            accessibilityLabel={t('trip.past')}
            accessibilityState={{ selected: filter === 'past' }}
            className={`px-4 py-2.5 border-b-2 ${
              filter === 'past'
                ? 'border-cyan-500 dark:border-cyan-400'
                : 'border-transparent'
            }`}
            style={{ minHeight: 44 }}
          >
            <Text
              className={`text-sm font-medium ${
                filter === 'past'
                  ? 'text-cyan-600 dark:text-cyan-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {t('trip.past')}
            </Text>
          </Pressable>
        </View>
      </View>

      {filteredTrips.length === 0 ? (
        <View className="flex-1 items-center justify-center py-12">
          <Ionicons name="map-outline" size={48} color="#d1d5db" />
          <Text className="mt-3 text-gray-500 dark:text-gray-400">
            {t('trip.noTrips')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTrips}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: trip }) => {
            const status = getTripStatus(trip);
            const statusColors: Record<string, string> = {
              upcoming:
                'bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300',
              ongoing:
                'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
              past: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
            };

            return (
              <Pressable
                onPress={() => {
                  setSelectedTrip(trip);
                  setView('detail');
                }}
                accessibilityRole="button"
                accessibilityLabel={trip.destination}
                className="p-4 bg-white border border-gray-200 rounded-xl mb-3 dark:bg-gray-800 dark:border-gray-700"
                style={{ minHeight: 44 }}
              >
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1 min-w-0">
                    <Text
                      className="font-semibold text-gray-900 dark:text-white"
                      numberOfLines={1}
                    >
                      {trip.destination}
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {formatDateRange(trip.startDate, trip.endDate)}
                    </Text>
                    {trip.notes ? (
                      <Text
                        className="text-sm text-gray-400 dark:text-gray-500 mt-1"
                        numberOfLines={1}
                      >
                        {trip.notes}
                      </Text>
                    ) : null}
                  </View>
                  <View className={`rounded-full px-2 py-0.5 ${statusColors[status]}`}>
                    <Text className="text-xs font-medium">
                      {t(`trip.status.${status}`)}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
