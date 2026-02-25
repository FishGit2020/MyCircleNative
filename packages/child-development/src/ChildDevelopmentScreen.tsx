import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useQuery } from '@apollo/client';
import {
  useTranslation,
  StorageKeys,
  AppEvents,
  eventBus,
  safeGetItem,
  safeSetItem,
  GET_BIBLE_PASSAGE,
} from '@mycircle/shared';
import { getAgeRangeForMonths } from './data/milestones';
import { parentingVerses } from './data/parentingVerses';
import { TimelineView } from './components';

/* --- Verse Section --- */

function VerseSection() {
  const { t } = useTranslation();

  // Day-of-year based verse selection
  const getDayOfYear = (): number => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    return Math.floor(
      (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
  };

  const [verseIndex, setVerseIndex] = useState(
    () => getDayOfYear() % parentingVerses.length,
  );

  const verse = parentingVerses[verseIndex];

  // Fetch verse text from API
  const { data, loading } = useQuery<{
    biblePassage?: { text?: string };
  }>(GET_BIBLE_PASSAGE, {
    variables: { reference: verse.reference },
    errorPolicy: 'ignore',
  });

  const apiText = data?.biblePassage?.text || '';
  const verseText =
    apiText || (verse.textKey ? t(verse.textKey as any) : '');

  const shuffle = useCallback(() => {
    setVerseIndex((prev) => {
      let next = Math.floor(Math.random() * parentingVerses.length);
      while (next === prev && parentingVerses.length > 1) {
        next = Math.floor(Math.random() * parentingVerses.length);
      }
      return next;
    });
  }, []);

  return (
    <View className="bg-amber-50/50 dark:bg-amber-900/10 rounded-lg p-4 mb-6">
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1">
          {loading ? (
            <View className="h-4 bg-amber-200 dark:bg-amber-800/40 rounded w-3/4" />
          ) : verseText ? (
            <Text className="text-sm italic text-amber-700 dark:text-amber-300 leading-relaxed">
              {'\u201C'}
              {verseText}
              {'\u201D'}
            </Text>
          ) : null}
          <Text
            className={`text-xs text-amber-600 dark:text-amber-400 font-medium ${
              verseText || loading ? 'mt-1' : ''
            }`}
          >
            {'— '}
            {verse.reference}
          </Text>
        </View>
        <Pressable
          onPress={shuffle}
          accessibilityRole="button"
          accessibilityLabel={t('childDev.shuffleVerse' as any)}
          className="flex-shrink-0 p-2 rounded-lg min-w-[44px] min-h-[44px] items-center justify-center"
        >
          <Text className="text-amber-500 text-base">{'\u21BB'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* --- Main Component --- */

export default function ChildDevelopmentScreen() {
  const { t } = useTranslation();

  // State
  const [childName, setChildName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [inputName, setInputName] = useState('');
  const [inputBirthDate, setInputBirthDate] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Load from AsyncStorage (via sync cache) on mount
  useEffect(() => {
    const storedName = safeGetItem(StorageKeys.CHILD_NAME);
    const storedDate = safeGetItem(StorageKeys.CHILD_BIRTH_DATE);
    if (storedName) {
      setChildName(storedName);
      setInputName(storedName);
    }
    if (storedDate) {
      // In RN we store plain date strings (no btoa/atob)
      setBirthDate(storedDate);
      setInputBirthDate(storedDate);
    }
  }, []);

  // Listen for external changes (Firestore sync)
  useEffect(() => {
    const unsub = eventBus.subscribe(AppEvents.CHILD_DATA_CHANGED, () => {
      const storedName = safeGetItem(StorageKeys.CHILD_NAME);
      const storedDate = safeGetItem(StorageKeys.CHILD_BIRTH_DATE);
      if (storedName) {
        setChildName(storedName);
        setInputName(storedName);
      } else {
        setChildName('');
        setInputName('');
      }
      if (storedDate) {
        setBirthDate(storedDate);
        setInputBirthDate(storedDate);
      } else {
        setBirthDate('');
        setInputBirthDate('');
      }
    });
    return unsub;
  }, []);

  // Computed
  const ageInMonths = useMemo(() => {
    if (!birthDate) return null;
    const birth = new Date(birthDate + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const months =
      (today.getFullYear() - birth.getFullYear()) * 12 +
      (today.getMonth() - birth.getMonth());
    return Math.max(0, months);
  }, [birthDate]);

  const currentAgeRange = useMemo(() => {
    if (ageInMonths === null) return null;
    return getAgeRangeForMonths(ageInMonths) || null;
  }, [ageInMonths]);

  const ageDisplay = useMemo(() => {
    if (ageInMonths === null) return '';
    if (ageInMonths < 24) {
      return t('childDev.monthsOld' as any).replace(
        '{months}',
        String(ageInMonths),
      );
    }
    const years = Math.floor(ageInMonths / 12);
    const months = ageInMonths % 12;
    return t('childDev.yearsMonthsOld' as any)
      .replace('{years}', String(years))
      .replace('{months}', String(months));
  }, [ageInMonths, t]);

  // Format date for display (YYYY-MM-DD -> locale-friendly)
  const formatDateDisplay = useCallback((dateStr: string): string => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString();
    } catch {
      return dateStr;
    }
  }, []);

  // Actions
  const saveChild = useCallback(() => {
    if (!inputName.trim() || !inputBirthDate) return;
    // Store plain date strings (no btoa in RN)
    safeSetItem(StorageKeys.CHILD_NAME, inputName.trim());
    safeSetItem(StorageKeys.CHILD_BIRTH_DATE, inputBirthDate);
    setChildName(inputName.trim());
    setBirthDate(inputBirthDate);
    setIsEditing(false);
    eventBus.publish(AppEvents.CHILD_DATA_CHANGED);
  }, [inputName, inputBirthDate]);

  // Date picker handler
  const onDateChange = useCallback(
    (_event: any, selectedDate?: Date) => {
      // On Android, the picker dismisses automatically
      if (Platform.OS === 'android') {
        setShowDatePicker(false);
      }
      if (selectedDate) {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        setInputBirthDate(`${year}-${month}-${day}`);
      }
    },
    [],
  );

  const datePickerValue = useMemo(() => {
    if (inputBirthDate) {
      return new Date(inputBirthDate + 'T00:00:00');
    }
    return new Date();
  }, [inputBirthDate]);

  // --- Setup View ---

  if (!birthDate || isEditing) {
    return (
      <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="max-w-md mx-auto px-4 py-6">
          <View className="items-center mb-8">
            <Text className="text-2xl font-bold text-gray-800 dark:text-white mb-2 text-center">
              {t('childDev.title' as any)}
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-center">
              {t('childDev.subtitle' as any)}
            </Text>
          </View>

          <VerseSection />

          <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <View className="gap-4">
              {/* Child Name */}
              <View>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('childDev.childName' as any)}
                </Text>
                <TextInput
                  value={inputName}
                  onChangeText={setInputName}
                  placeholder={t('childDev.childNamePlaceholder' as any)}
                  placeholderTextColor="#9CA3AF"
                  accessibilityLabel={t('childDev.childName' as any)}
                  className="w-full px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </View>

              {/* Birth Date */}
              <View>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('childDev.birthDate' as any)}
                </Text>
                <Pressable
                  onPress={() => setShowDatePicker(true)}
                  accessibilityRole="button"
                  accessibilityLabel={t('childDev.birthDate' as any)}
                  className="w-full px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 min-h-[44px] justify-center"
                >
                  <Text
                    className={`${
                      inputBirthDate
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {inputBirthDate
                      ? formatDateDisplay(inputBirthDate)
                      : t('childDev.birthDatePlaceholder' as any)}
                  </Text>
                </Pressable>

                {showDatePicker && (
                  <View>
                    <DateTimePicker
                      value={datePickerValue}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      maximumDate={new Date()}
                      onChange={onDateChange}
                    />
                    {Platform.OS === 'ios' && (
                      <Pressable
                        onPress={() => setShowDatePicker(false)}
                        accessibilityRole="button"
                        accessibilityLabel={t('childDev.saveChild' as any)}
                        className="mt-2 py-2 items-center min-h-[44px] justify-center"
                      >
                        <Text className="text-blue-600 dark:text-blue-400 font-medium">
                          {t('childDev.saveChild' as any)}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                )}
              </View>

              {/* Save button */}
              <Pressable
                onPress={saveChild}
                disabled={!inputName.trim() || !inputBirthDate}
                accessibilityRole="button"
                accessibilityLabel={
                  isEditing
                    ? t('childDev.saveChild' as any)
                    : t('childDev.getStarted' as any)
                }
                className={`w-full py-3 px-4 rounded-lg min-h-[44px] items-center justify-center ${
                  !inputName.trim() || !inputBirthDate
                    ? 'bg-gray-300 dark:bg-gray-600'
                    : 'bg-blue-600'
                }`}
              >
                <Text className="text-white font-medium">
                  {isEditing
                    ? t('childDev.saveChild' as any)
                    : t('childDev.getStarted' as any)}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  // --- Main View (Timeline) ---

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="px-4 py-6">
        {/* Header */}
        <View className="flex-row items-center justify-between gap-2 mb-4">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-800 dark:text-white">
              {childName}
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-sm">
              {ageDisplay}
            </Text>
          </View>
          <Pressable
            onPress={() => setIsEditing(true)}
            accessibilityRole="button"
            accessibilityLabel={t('childDev.editChild' as any)}
            className="px-3 py-2 min-h-[44px] min-w-[44px] items-center justify-center"
          >
            <Text className="text-sm text-blue-600 dark:text-blue-400">
              {t('childDev.editChild' as any)}
            </Text>
          </Pressable>
        </View>

        {/* Verse */}
        <VerseSection />

        {/* Timeline */}
        <TimelineView
          ageInMonths={ageInMonths}
          currentAgeRange={currentAgeRange}
        />
      </View>
    </ScrollView>
  );
}
