import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@apollo/client';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import * as WebBrowser from 'expo-web-browser';
import {
  useTranslation,
  StorageKeys,
  AppEvents,
  eventBus,
  safeGetItem,
  safeSetItem,
  safeRemoveItem,
  GET_BIBLE_PASSAGE,
} from '@mycircle/shared';

import {
  getGrowthDataForWeek,
  getTrimester,
  getStageForWeek,
  developmentStages,
  type ComparisonCategory,
} from './data/babyGrowthData';
import { pregnancyVerses } from './data/pregnancyVerses';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function calculateGestationalAge(dueDateStr: string): {
  weeks: number;
  days: number;
  totalDays: number;
} {
  const dueDate = new Date(dueDateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysUntilDue = Math.round(
    (dueDate.getTime() - today.getTime()) / msPerDay,
  );
  const totalDays = 280 - daysUntilDue; // 40 weeks = 280 days
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;
  return { weeks, days, totalDays };
}

function getWeeksRemaining(dueDateStr: string): number {
  const dueDate = new Date(dueDateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  return Math.ceil((dueDate.getTime() - today.getTime()) / msPerWeek);
}

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
}

/** Format a Date to YYYY-MM-DD */
function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Format a YYYY-MM-DD string to a locale-friendly display string */
function formatDisplayDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BabyTrackerScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  // ---- Due date state ----
  const [dueDate, setDueDate] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState<Date>(new Date());
  const [compareCategory, setCompareCategory] =
    useState<ComparisonCategory>('fruit');
  const [refreshing, setRefreshing] = useState(false);

  // ---- Verse state ----
  const [verseIndex, setVerseIndex] = useState(
    () => getDayOfYear() % pregnancyVerses.length,
  );
  const verse = pregnancyVerses[verseIndex];

  const { data: verseData, loading: verseLoading } = useQuery<{
    biblePassage?: { text?: string };
  }>(GET_BIBLE_PASSAGE, {
    variables: { reference: verse.reference },
    errorPolicy: 'ignore',
  });

  const verseText = verseData?.biblePassage?.text || '';

  const shuffleVerse = useCallback(() => {
    setVerseIndex((prev) => {
      let next = Math.floor(Math.random() * pregnancyVerses.length);
      while (next === prev && pregnancyVerses.length > 1) {
        next = Math.floor(Math.random() * pregnancyVerses.length);
      }
      return next;
    });
  }, []);

  // ---- Load due date from storage on mount ----
  useEffect(() => {
    const stored = safeGetItem(StorageKeys.BABY_DUE_DATE);
    if (stored) {
      setDueDate(stored);
      setPickerDate(new Date(stored + 'T00:00:00'));
    }
  }, []);

  // ---- Listen for external changes (e.g. Firestore restore on sign-in) ----
  useEffect(() => {
    const unsub = eventBus.subscribe(
      AppEvents.BABY_DUE_DATE_CHANGED,
      () => {
        const stored = safeGetItem(StorageKeys.BABY_DUE_DATE);
        if (stored) {
          setDueDate(stored);
          setPickerDate(new Date(stored + 'T00:00:00'));
        } else {
          setDueDate('');
        }
      },
    );
    return unsub;
  }, []);

  // ---- Date picker handlers ----
  const onDatePickerChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      // On Android the picker is dismissed on any action
      if (Platform.OS === 'android') {
        setShowDatePicker(false);
      }
      if (event.type === 'set' && selectedDate) {
        const dateStr = toDateString(selectedDate);
        setPickerDate(selectedDate);
        setDueDate(dateStr);
        safeSetItem(StorageKeys.BABY_DUE_DATE, dateStr);
        eventBus.publish(AppEvents.BABY_DUE_DATE_CHANGED);
      }
    },
    [],
  );

  const confirmIOSDate = useCallback(() => {
    const dateStr = toDateString(pickerDate);
    setDueDate(dateStr);
    safeSetItem(StorageKeys.BABY_DUE_DATE, dateStr);
    eventBus.publish(AppEvents.BABY_DUE_DATE_CHANGED);
    setShowDatePicker(false);
  }, [pickerDate]);

  const clearDueDate = useCallback(() => {
    safeRemoveItem(StorageKeys.BABY_DUE_DATE);
    setDueDate('');
    eventBus.publish(AppEvents.BABY_DUE_DATE_CHANGED);
  }, []);

  // ---- Pull-to-refresh ----
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Re-read storage in case of external changes
    const stored = safeGetItem(StorageKeys.BABY_DUE_DATE);
    if (stored) {
      setDueDate(stored);
      setPickerDate(new Date(stored + 'T00:00:00'));
    }
    setTimeout(() => setRefreshing(false), 400);
  }, []);

  // ---- Computed pregnancy state ----
  const gestationalAge = useMemo(() => {
    if (!dueDate) return null;
    return calculateGestationalAge(dueDate);
  }, [dueDate]);

  const currentWeek = gestationalAge !== null ? gestationalAge.weeks : null;
  const currentDays = gestationalAge !== null ? gestationalAge.days : null;
  const weeksRemaining = dueDate ? getWeeksRemaining(dueDate) : null;

  const growthData =
    currentWeek !== null
      ? getGrowthDataForWeek(Math.min(Math.max(currentWeek, 1), 40))
      : null;
  const trimester =
    currentWeek !== null && currentWeek >= 1 && currentWeek <= 40
      ? getTrimester(currentWeek)
      : null;
  const progressPercent =
    currentWeek !== null
      ? Math.min(Math.max((currentWeek / 40) * 100, 0), 100)
      : 0;

  const trimesterLabel =
    trimester === 1
      ? t('baby.trimester1')
      : trimester === 2
        ? t('baby.trimester2')
        : trimester === 3
          ? t('baby.trimester3')
          : '';

  // Edge case states
  const isPastDue = weeksRemaining !== null && weeksRemaining < 0;
  const isDueToday = weeksRemaining === 0;
  const isNotPregnantYet = currentWeek !== null && currentWeek < 0;
  const isValidPregnancy =
    currentWeek !== null && currentWeek >= 1 && currentWeek <= 40;

  // ---- External link handler ----
  const openLink = useCallback(async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  }, []);

  const whatToExpectUrl = useMemo(() => {
    if (trimester === 1)
      return 'https://www.whattoexpect.com/first-trimester-of-pregnancy.aspx';
    if (trimester === 2)
      return 'https://www.whattoexpect.com/second-trimester-of-pregnancy.aspx';
    return 'https://www.whattoexpect.com/third-trimester-of-pregnancy.aspx';
  }, [trimester]);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <Pressable
          onPress={() => router.back()}
          className="w-11 h-11 items-center justify-center rounded-full active:bg-gray-100 dark:active:bg-gray-800"
          accessibilityRole="button"
          accessibilityLabel={t('baby.title')}
        >
          <Ionicons name="arrow-back" size={24} color="#ec4899" />
        </Pressable>
        <Ionicons
          name="heart"
          size={22}
          color="#ec4899"
          style={{ marginLeft: 4 }}
        />
        <Text className="text-lg font-semibold text-gray-900 dark:text-white ml-2">
          {t('baby.title')}
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ec4899"
            colors={['#ec4899']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Subtitle */}
        <Text className="text-gray-500 dark:text-gray-400 text-center mb-4">
          {t('baby.subtitle')}
        </Text>

        {/* ---- Verse Section ---- */}
        <View className="bg-pink-50 dark:bg-pink-900/10 rounded-2xl p-5 mb-4 border border-pink-200 dark:border-pink-800">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 mr-3">
              {verseLoading ? (
                <View className="h-4 bg-pink-200 dark:bg-pink-800 rounded w-3/4" />
              ) : verseText ? (
                <Text className="text-pink-800 dark:text-pink-200 italic leading-relaxed">
                  {'\u201C'}
                  {verseText}
                  {'\u201D'}
                </Text>
              ) : null}
              <Text
                className={`text-pink-600 dark:text-pink-400 text-sm font-semibold ${
                  verseText || verseLoading ? 'mt-2' : ''
                }`}
              >
                {'— '}
                {verse.reference}
              </Text>
            </View>
            <Pressable
              onPress={shuffleVerse}
              className="w-11 h-11 items-center justify-center rounded-lg active:bg-pink-100 dark:active:bg-pink-800"
              accessibilityRole="button"
              accessibilityLabel={t('baby.shuffleVerse')}
            >
              <Ionicons name="refresh" size={20} color="#ec4899" />
            </Pressable>
          </View>
        </View>

        {/* ---- Due Date Section ---- */}
        <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 mb-4 border border-gray-200 dark:border-gray-700 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            {t('baby.dueDate')}
          </Text>
          <View className="flex-row items-center">
            <Pressable
              onPress={() => setShowDatePicker(true)}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 min-h-[44px] justify-center"
              accessibilityRole="button"
              accessibilityLabel={t('baby.dueDatePlaceholder')}
            >
              <Text
                className={
                  dueDate
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-400 dark:text-gray-500'
                }
              >
                {dueDate
                  ? formatDisplayDate(dueDate)
                  : t('baby.dueDatePlaceholder')}
              </Text>
            </Pressable>
            {dueDate ? (
              <Pressable
                onPress={clearDueDate}
                className="ml-3 px-4 py-3 bg-gray-200 dark:bg-gray-600 rounded-lg min-h-[44px] justify-center"
                accessibilityRole="button"
                accessibilityLabel={t('baby.clear')}
              >
                <Text className="font-medium text-gray-700 dark:text-gray-200">
                  {t('baby.clear')}
                </Text>
              </Pressable>
            ) : null}
          </View>

          {/* Date picker (iOS shows inline, Android shows modal) */}
          {showDatePicker && (
            <View className="mt-3">
              <DateTimePicker
                value={pickerDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDatePickerChange}
                minimumDate={new Date()}
                maximumDate={
                  new Date(
                    new Date().getFullYear() + 1,
                    new Date().getMonth(),
                    new Date().getDate(),
                  )
                }
              />
              {Platform.OS === 'ios' && (
                <View className="flex-row justify-end mt-2">
                  <Pressable
                    onPress={() => setShowDatePicker(false)}
                    className="px-4 py-2 mr-2 rounded-lg min-h-[44px] justify-center"
                    accessibilityRole="button"
                    accessibilityLabel={t('baby.clear')}
                  >
                    <Text className="text-gray-500 dark:text-gray-400 font-medium">
                      {t('baby.clear')}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={confirmIOSDate}
                    className="px-4 py-2 bg-pink-500 dark:bg-pink-600 rounded-lg min-h-[44px] justify-center"
                    accessibilityRole="button"
                    accessibilityLabel={t('baby.save')}
                  >
                    <Text className="text-white font-medium">
                      {t('baby.save')}
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          )}
        </View>

        {/* ---- No Due Date ---- */}
        {!dueDate && (
          <View className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 mb-4 items-center border border-gray-200 dark:border-gray-700">
            <Ionicons
              name="heart-outline"
              size={48}
              color="#f9a8d4"
              style={{ marginBottom: 12 }}
            />
            <Text className="text-gray-500 dark:text-gray-400 text-center">
              {t('baby.noDueDate')}
            </Text>
          </View>
        )}

        {/* ---- Not Pregnant Yet ---- */}
        {isNotPregnantYet && (
          <View className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-5 mb-4 border border-yellow-200 dark:border-yellow-800">
            <Text className="text-yellow-700 dark:text-yellow-300 text-center">
              {t('baby.notPregnantYet')}
            </Text>
          </View>
        )}

        {/* ---- Past Due / Due Today ---- */}
        {(isPastDue || isDueToday) && (
          <View className="bg-pink-50 dark:bg-pink-900/10 rounded-2xl p-5 mb-4 items-center border border-pink-200 dark:border-pink-800">
            <Text className="text-4xl mb-2">{'\uD83C\uDF89'}</Text>
            <Text className="text-pink-700 dark:text-pink-300 font-semibold text-lg text-center">
              {isDueToday
                ? t('baby.dueToday')
                : t('baby.congratulations')}
            </Text>
            {isPastDue && weeksRemaining !== null && (
              <Text className="text-pink-600 dark:text-pink-400 text-sm mt-1">
                {Math.abs(weeksRemaining)} {t('baby.weeksPast')}
              </Text>
            )}
          </View>
        )}

        {/* ---- Main Growth Card ---- */}
        {isValidPregnancy && growthData && (
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 mb-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            {/* Week + Trimester Header */}
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-baseline">
                <Text className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                  {t('baby.week')} {currentWeek}
                </Text>
                {currentDays !== null && currentDays > 0 && (
                  <Text className="text-lg font-semibold text-pink-400 dark:text-pink-500 ml-1">
                    +{currentDays}d
                  </Text>
                )}
                <Text className="text-gray-400 dark:text-gray-500 mx-2">
                  {'\u00B7'}
                </Text>
                <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {trimesterLabel}
                </Text>
              </View>
              {weeksRemaining !== null && weeksRemaining > 0 && (
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {weeksRemaining} {t('baby.weeksRemaining')}
                </Text>
              )}
            </View>

            {/* Progress Bar */}
            <View className="mb-5">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {t('baby.progress')}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round(progressPercent)}%
                </Text>
              </View>
              <View
                className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                accessibilityRole="progressbar"
                accessibilityValue={{
                  min: 0,
                  max: 100,
                  now: Math.round(progressPercent),
                }}
                accessibilityLabel={t('baby.progress')}
              >
                <View
                  className="h-full bg-pink-500 dark:bg-pink-400 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </View>
              <View className="flex-row justify-between mt-1 px-0.5">
                <Text className="text-xs text-gray-400 dark:text-gray-500">
                  T1
                </Text>
                <Text className="text-xs text-gray-400 dark:text-gray-500">
                  T2
                </Text>
                <Text className="text-xs text-gray-400 dark:text-gray-500">
                  T3
                </Text>
              </View>
            </View>

            {/* Size Comparison */}
            <View className="items-center py-4 bg-pink-50 dark:bg-pink-900/10 rounded-xl mb-5">
              <Text className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                {t('baby.size')}
              </Text>
              {/* Category toggle buttons */}
              <View
                className="flex-row justify-center mb-3"
                accessibilityRole="radiogroup"
                accessibilityLabel={t('baby.compareCategory')}
              >
                {(['fruit', 'animal', 'vegetable'] as ComparisonCategory[]).map(
                  (cat) => {
                    const isSelected = compareCategory === cat;
                    const labelKey = `baby.category${
                      cat.charAt(0).toUpperCase() + cat.slice(1)
                    }` as any;
                    return (
                      <Pressable
                        key={cat}
                        onPress={() => setCompareCategory(cat)}
                        className={`px-3 py-1.5 mx-1 rounded-full min-h-[36px] justify-center ${
                          isSelected
                            ? 'bg-pink-500 dark:bg-pink-600'
                            : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                        }`}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: isSelected }}
                        accessibilityLabel={t(labelKey)}
                      >
                        <Text
                          className={`text-xs font-medium ${
                            isSelected
                              ? 'text-white'
                              : 'text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {t(labelKey)}
                        </Text>
                      </Pressable>
                    );
                  },
                )}
              </View>
              <Text className="text-2xl font-bold text-pink-600 dark:text-pink-400 capitalize">
                {growthData[compareCategory]}
              </Text>
            </View>

            {/* Length & Weight */}
            <View className="flex-row mb-5">
              <View className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 items-center mr-2">
                <Text className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {t('baby.length')}
                </Text>
                <Text className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                  {growthData.lengthCm} cm
                </Text>
                <Text className="text-xs text-gray-400 dark:text-gray-500">
                  ({growthData.lengthIn} in)
                </Text>
              </View>
              <View className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 items-center ml-2">
                <Text className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {t('baby.weight')}
                </Text>
                <Text className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                  {growthData.weightG >= 1000
                    ? `${(growthData.weightG / 1000).toFixed(1)} kg`
                    : `${growthData.weightG} g`}
                </Text>
                <Text className="text-xs text-gray-400 dark:text-gray-500">
                  (
                  {growthData.weightOz >= 16
                    ? `${(growthData.weightOz / 16).toFixed(1)} lb`
                    : `${growthData.weightOz} oz`}
                  )
                </Text>
              </View>
            </View>

            {/* ---- Development Timeline ---- */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                {t('baby.developmentTimeline')}
              </Text>
              <View className="relative">
                {/* Vertical line */}
                <View className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

                {developmentStages.map((stage) => {
                  const currentStage = getStageForWeek(currentWeek!);
                  const isCompleted = currentWeek! > stage.weekEnd;
                  const isCurrent = currentStage?.id === stage.id;
                  const isUpcoming = currentWeek! < stage.weekStart;

                  return (
                    <View
                      key={stage.id}
                      className="relative flex-row items-start mb-4"
                    >
                      {/* Timeline dot */}
                      <View
                        className={`z-10 w-8 h-8 rounded-full items-center justify-center ${
                          isCompleted
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : isCurrent
                              ? 'bg-pink-100 dark:bg-pink-900/30 border-2 border-pink-400 dark:border-pink-500'
                              : 'bg-gray-100 dark:bg-gray-700'
                        }`}
                      >
                        {isCompleted ? (
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color="#22c55e"
                          />
                        ) : (
                          <Text className="text-sm">{stage.icon}</Text>
                        )}
                      </View>

                      {/* Content */}
                      <View
                        className="flex-1 ml-3"
                        style={isUpcoming ? { opacity: 0.5 } : undefined}
                      >
                        <View className="flex-row items-center flex-wrap">
                          <Text
                            className={`text-sm font-semibold ${
                              isCurrent
                                ? 'text-pink-700 dark:text-pink-300'
                                : isCompleted
                                  ? 'text-green-700 dark:text-green-300'
                                  : 'text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            {t(stage.nameKey as any)}
                          </Text>
                          <Text className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                            {t('baby.stageWeeks')
                              .replace('{start}', String(stage.weekStart))
                              .replace('{end}', String(stage.weekEnd))}
                          </Text>
                          {isCurrent && (
                            <View className="ml-2 px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-900/40">
                              <Text className="text-xs font-medium text-pink-600 dark:text-pink-400">
                                {t('baby.stageCurrent')}
                              </Text>
                            </View>
                          )}
                          {isCompleted && (
                            <Text className="text-xs text-green-500 dark:text-green-400 ml-2">
                              {t('baby.stageCompleted')}
                            </Text>
                          )}
                        </View>
                        {(isCurrent || isCompleted) && (
                          <Text
                            className={`text-xs mt-1 leading-relaxed ${
                              isCurrent
                                ? 'text-pink-600 dark:text-pink-400'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            {t(stage.descKey as any)}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* ---- Source Attribution Links ---- */}
            <View>
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                {t('baby.sources')}
              </Text>
              <View className="flex-row flex-wrap">
                <Pressable
                  onPress={() =>
                    openLink(
                      'https://www.acog.org/womens-health/faqs/how-your-fetus-grows-during-pregnancy',
                    )
                  }
                  className="flex-row items-center px-3 py-2 mr-2 mb-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 min-h-[36px]"
                  accessibilityRole="link"
                  accessibilityLabel={t('baby.acogGuide')}
                >
                  <Ionicons
                    name="open-outline"
                    size={12}
                    color="#2563eb"
                    style={{ marginRight: 4 }}
                  />
                  <Text className="text-xs text-blue-600 dark:text-blue-400">
                    {t('baby.acogGuide')}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    openLink(
                      'https://www.mayoclinic.org/healthy-lifestyle/pregnancy-week-by-week/in-depth/prenatal-care/art-20045302',
                    )
                  }
                  className="flex-row items-center px-3 py-2 mr-2 mb-2 rounded-lg bg-green-50 dark:bg-green-900/20 min-h-[36px]"
                  accessibilityRole="link"
                  accessibilityLabel={t('baby.mayoGuide')}
                >
                  <Ionicons
                    name="open-outline"
                    size={12}
                    color="#16a34a"
                    style={{ marginRight: 4 }}
                  />
                  <Text className="text-xs text-green-600 dark:text-green-400">
                    {t('baby.mayoGuide')}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => openLink(whatToExpectUrl)}
                  className="flex-row items-center px-3 py-2 mr-2 mb-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 min-h-[36px]"
                  accessibilityRole="link"
                  accessibilityLabel={t('baby.whatToExpect')}
                >
                  <Ionicons
                    name="open-outline"
                    size={12}
                    color="#9333ea"
                    style={{ marginRight: 4 }}
                  />
                  <Text className="text-xs text-purple-600 dark:text-purple-400">
                    {t('baby.whatToExpect')}
                  </Text>
                </Pressable>
              </View>
              <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {t('baby.sourcesAttribution')}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
