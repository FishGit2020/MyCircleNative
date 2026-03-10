import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
  Alert,
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
import { getAgeRangeForMonths as getYouthAgeRange } from './data/youthMilestones';
import { parentingVerses } from './data/parentingVerses';
import { TimelineView, YouthTimeline } from './components';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChildProfile {
  id: string;
  name: string;
  birthDate: string;
}

type StageTab = 'toddler' | 'middleChildhood' | 'teens';

const MIDDLE_CHILDHOOD_IDS = new Set(['6-8y', '9-11y']);
const TEEN_IDS = new Set(['12-14y', '15-17y']);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function loadChildren(): ChildProfile[] {
  try {
    const raw = safeGetItem(StorageKeys.CHILDREN_LIST);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  // Migrate legacy single-child data
  const legacyName = safeGetItem(StorageKeys.CHILD_NAME);
  const legacyDate = safeGetItem(StorageKeys.CHILD_BIRTH_DATE);
  if (legacyName && legacyDate) {
    const child: ChildProfile = { id: generateId(), name: legacyName, birthDate: legacyDate };
    safeSetItem(StorageKeys.CHILDREN_LIST, JSON.stringify([child]));
    return [child];
  }
  return [];
}

function saveChildren(children: ChildProfile[]): void {
  safeSetItem(StorageKeys.CHILDREN_LIST, JSON.stringify(children));
  eventBus.publish(AppEvents.CHILDREN_LIST_CHANGED);
}

function loadCheckedMilestones(childId: string): Set<string> {
  try {
    const raw = safeGetItem(StorageKeys.CHECKED_MILESTONES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed[childId] && Array.isArray(parsed[childId])) {
        return new Set(parsed[childId]);
      }
    }
  } catch {
    // ignore
  }
  return new Set();
}

function saveCheckedMilestones(childId: string, milestones: Set<string>): void {
  let all: Record<string, string[]> = {};
  try {
    const raw = safeGetItem(StorageKeys.CHECKED_MILESTONES);
    if (raw) all = JSON.parse(raw);
  } catch {
    // ignore
  }
  all[childId] = Array.from(milestones);
  safeSetItem(StorageKeys.CHECKED_MILESTONES, JSON.stringify(all));
}

// ---------------------------------------------------------------------------
// Verse Section
// ---------------------------------------------------------------------------

function VerseSection() {
  const { t } = useTranslation();

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

// ---------------------------------------------------------------------------
// Child Selector
// ---------------------------------------------------------------------------

function ChildSelector({
  children,
  selectedId,
  onSelect,
  onAdd,
}: {
  children: ChildProfile[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
}) {
  const { t } = useTranslation();

  return (
    <View className="flex-row flex-wrap gap-2 mb-4" accessibilityLabel={t('children.selectChild' as any)}>
      {children.map((child) => {
        const isSelected = child.id === selectedId;
        return (
          <Pressable
            key={child.id}
            onPress={() => onSelect(child.id)}
            accessibilityRole="button"
            accessibilityLabel={child.name}
            accessibilityState={{ selected: isSelected }}
            className={`px-4 py-2 rounded-full min-h-[44px] items-center justify-center ${
              isSelected
                ? 'bg-blue-600 dark:bg-blue-500'
                : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                isSelected
                  ? 'text-white'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {child.name}
            </Text>
          </Pressable>
        );
      })}
      <Pressable
        onPress={onAdd}
        accessibilityRole="button"
        accessibilityLabel={t('children.addChild' as any)}
        className="px-4 py-2 rounded-full min-h-[44px] items-center justify-center border border-dashed border-gray-300 dark:border-gray-600"
      >
        <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">
          + {t('children.add' as any)}
        </Text>
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function ChildDevelopmentScreen() {
  const { t } = useTranslation();

  // Multi-child state
  const [children, setChildren] = useState<ChildProfile[]>(() => loadChildren());
  const [selectedId, setSelectedId] = useState<string | null>(
    () => children.length > 0 ? children[0].id : null,
  );
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputName, setInputName] = useState('');
  const [inputBirthDate, setInputBirthDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [stageTab, setStageTab] = useState<StageTab | null>(null);

  // Checked milestones per child
  const [checkedMilestones, setCheckedMilestones] = useState<Set<string>>(
    () => selectedId ? loadCheckedMilestones(selectedId) : new Set(),
  );

  const selectedChild = useMemo(
    () => children.find((c) => c.id === selectedId) ?? null,
    [children, selectedId],
  );

  // Reload checked milestones when child changes
  useEffect(() => {
    if (selectedId) {
      setCheckedMilestones(loadCheckedMilestones(selectedId));
    } else {
      setCheckedMilestones(new Set());
    }
  }, [selectedId]);

  // Listen for external changes
  useEffect(() => {
    const unsub = eventBus.subscribe(AppEvents.CHILDREN_LIST_CHANGED, () => {
      const loaded = loadChildren();
      setChildren(loaded);
      if (loaded.length > 0 && !loaded.find((c) => c.id === selectedId)) {
        setSelectedId(loaded[0].id);
      }
    });
    return unsub;
  }, [selectedId]);

  // Computed
  const ageInMonths = useMemo(() => {
    if (!selectedChild) return null;
    const birth = new Date(selectedChild.birthDate + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const months =
      (today.getFullYear() - birth.getFullYear()) * 12 +
      (today.getMonth() - birth.getMonth());
    return Math.max(0, months);
  }, [selectedChild]);

  const currentAgeRange = useMemo(() => {
    if (ageInMonths === null) return null;
    return getAgeRangeForMonths(ageInMonths) || null;
  }, [ageInMonths]);

  const youthAgeRange = useMemo(() => {
    if (ageInMonths === null) return null;
    return getYouthAgeRange(ageInMonths);
  }, [ageInMonths]);

  // Auto-select stage tab based on child age
  const activeStageTab: StageTab = useMemo(() => {
    if (stageTab) return stageTab;
    if (ageInMonths === null) return 'toddler';
    if (ageInMonths >= 144) return 'teens';
    if (ageInMonths >= 72) return 'middleChildhood';
    return 'toddler';
  }, [stageTab, ageInMonths]);

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

  const formatDateDisplay = useCallback((dateStr: string): string => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString();
    } catch {
      return dateStr;
    }
  }, []);

  // Toggle milestone
  const toggleMilestone = useCallback(
    (milestoneId: string) => {
      if (!selectedId) return;
      setCheckedMilestones((prev) => {
        const next = new Set(prev);
        if (next.has(milestoneId)) next.delete(milestoneId);
        else next.add(milestoneId);
        saveCheckedMilestones(selectedId, next);
        return next;
      });
    },
    [selectedId],
  );

  // Add child
  const addChild = useCallback(() => {
    if (!inputName.trim() || !inputBirthDate) return;
    const newChild: ChildProfile = {
      id: generateId(),
      name: inputName.trim(),
      birthDate: inputBirthDate,
    };
    const updated = [...children, newChild];
    setChildren(updated);
    saveChildren(updated);
    setSelectedId(newChild.id);
    setInputName('');
    setInputBirthDate('');
    setIsAdding(false);
  }, [inputName, inputBirthDate, children]);

  // Save edit
  const saveEdit = useCallback(() => {
    if (!selectedChild || !inputName.trim() || !inputBirthDate) return;
    const updated = children.map((c) =>
      c.id === selectedChild.id
        ? { ...c, name: inputName.trim(), birthDate: inputBirthDate }
        : c,
    );
    setChildren(updated);
    saveChildren(updated);
    setIsEditing(false);
  }, [selectedChild, inputName, inputBirthDate, children]);

  // Delete child
  const deleteChild = useCallback(() => {
    if (!selectedChild) return;
    Alert.alert(
      t('children.deleteChild' as any),
      t('children.deleteConfirm' as any).replace('{name}', selectedChild.name),
      [
        { text: t('children.cancel' as any), style: 'cancel' },
        {
          text: t('children.deleteChild' as any),
          style: 'destructive',
          onPress: () => {
            const updated = children.filter((c) => c.id !== selectedChild.id);
            setChildren(updated);
            saveChildren(updated);
            setSelectedId(updated.length > 0 ? updated[0].id : null);
          },
        },
      ],
    );
  }, [selectedChild, children, t]);

  // Start editing
  const startEditing = useCallback(() => {
    if (!selectedChild) return;
    setInputName(selectedChild.name);
    setInputBirthDate(selectedChild.birthDate);
    setIsEditing(true);
  }, [selectedChild]);

  // Date picker handler
  const onDateChange = useCallback(
    (_event: any, selectedDate?: Date) => {
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

  // --- Edit Child View ---

  if (isEditing && selectedChild) {
    return (
      <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="max-w-md mx-auto px-4 py-6">
          <View className="items-center mb-8">
            <Text className="text-2xl font-bold text-gray-800 dark:text-white mb-2 text-center">
              {t('children.editChild' as any)}
            </Text>
          </View>

          <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <View className="gap-4">
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
                    className={
                      inputBirthDate
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-400 dark:text-gray-500'
                    }
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
                        accessibilityLabel={t('children.save' as any)}
                        className="mt-2 py-2 items-center min-h-[44px] justify-center"
                      >
                        <Text className="text-blue-600 dark:text-blue-400 font-medium">
                          {t('children.save' as any)}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                )}
              </View>

              <View className="flex-row gap-2">
                <Pressable
                  onPress={saveEdit}
                  disabled={!inputName.trim() || !inputBirthDate}
                  accessibilityRole="button"
                  accessibilityLabel={t('children.save' as any)}
                  className={`flex-1 py-3 px-4 rounded-lg min-h-[44px] items-center justify-center ${
                    !inputName.trim() || !inputBirthDate
                      ? 'bg-gray-300 dark:bg-gray-600'
                      : 'bg-blue-600 dark:bg-blue-500'
                  }`}
                >
                  <Text className="text-white font-medium">
                    {t('children.save' as any)}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setIsEditing(false)}
                  accessibilityRole="button"
                  accessibilityLabel={t('children.cancel' as any)}
                  className="py-3 px-4 bg-gray-200 dark:bg-gray-600 rounded-lg min-h-[44px] items-center justify-center"
                >
                  <Text className="font-medium text-gray-700 dark:text-gray-200">
                    {t('children.cancel' as any)}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  // --- Add Child View ---

  if (children.length === 0 || isAdding) {
    return (
      <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="max-w-md mx-auto px-4 py-6">
          <View className="items-center mb-8">
            <Text className="text-2xl font-bold text-gray-800 dark:text-white mb-2 text-center">
              {isAdding ? t('children.addChild' as any) : t('childDev.title' as any)}
            </Text>
            {!isAdding && (
              <Text className="text-gray-600 dark:text-gray-400 text-center">
                {t('childDev.subtitle' as any)}
              </Text>
            )}
          </View>

          <VerseSection />

          <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <View className="gap-4">
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
                    className={
                      inputBirthDate
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-400 dark:text-gray-500'
                    }
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
                        accessibilityLabel={t('children.save' as any)}
                        className="mt-2 py-2 items-center min-h-[44px] justify-center"
                      >
                        <Text className="text-blue-600 dark:text-blue-400 font-medium">
                          {t('children.save' as any)}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                )}
              </View>

              <View className="flex-row gap-2">
                <Pressable
                  onPress={addChild}
                  disabled={!inputName.trim() || !inputBirthDate}
                  accessibilityRole="button"
                  accessibilityLabel={
                    isAdding
                      ? t('children.addChild' as any)
                      : t('childDev.getStarted' as any)
                  }
                  className={`flex-1 py-3 px-4 rounded-lg min-h-[44px] items-center justify-center ${
                    !inputName.trim() || !inputBirthDate
                      ? 'bg-gray-300 dark:bg-gray-600'
                      : 'bg-blue-600 dark:bg-blue-500'
                  }`}
                >
                  <Text className="text-white font-medium">
                    {isAdding
                      ? t('children.addChild' as any)
                      : t('childDev.getStarted' as any)}
                  </Text>
                </Pressable>
                {isAdding && (
                  <Pressable
                    onPress={() => setIsAdding(false)}
                    accessibilityRole="button"
                    accessibilityLabel={t('children.cancel' as any)}
                    className="py-3 px-4 bg-gray-200 dark:bg-gray-600 rounded-lg min-h-[44px] items-center justify-center"
                  >
                    <Text className="font-medium text-gray-700 dark:text-gray-200">
                      {t('children.cancel' as any)}
                    </Text>
                  </Pressable>
                )}
              </View>
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
        {/* Child Selector */}
        <ChildSelector
          children={children}
          selectedId={selectedId}
          onSelect={(id) => {
            setSelectedId(id);
            setStageTab(null);
          }}
          onAdd={() => {
            setInputName('');
            setInputBirthDate('');
            setIsAdding(true);
          }}
        />

        {/* Header */}
        {selectedChild && (
          <>
            <View className="flex-row items-center justify-between gap-2 mb-4">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-800 dark:text-white">
                  {selectedChild.name}
                </Text>
                <Text className="text-gray-600 dark:text-gray-400 text-sm">
                  {ageDisplay}
                </Text>
              </View>
              <View className="flex-row gap-1">
                <Pressable
                  onPress={startEditing}
                  accessibilityRole="button"
                  accessibilityLabel={t('children.editChild' as any)}
                  className="px-3 py-2 min-h-[44px] min-w-[44px] items-center justify-center"
                >
                  <Text className="text-sm text-blue-600 dark:text-blue-400">
                    {t('children.editChild' as any)}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={deleteChild}
                  accessibilityRole="button"
                  accessibilityLabel={t('children.deleteChild' as any)}
                  className="px-3 py-2 min-h-[44px] min-w-[44px] items-center justify-center"
                >
                  <Text className="text-sm text-red-600 dark:text-red-400">
                    {t('children.deleteChild' as any)}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Verse */}
            <VerseSection />

            {/* CDC-aligned stage tabs */}
            <View className="flex-row border-b border-gray-200 dark:border-gray-700 mb-4">
              {([
                { id: 'toddler' as StageTab, labelKey: 'childDev.tabToddler', ages: '0\u20135' },
                { id: 'middleChildhood' as StageTab, labelKey: 'childDev.tabMiddleChildhood', ages: '6\u201311' },
                { id: 'teens' as StageTab, labelKey: 'childDev.tabTeens', ages: '12\u201317' },
              ]).map((tab) => {
                const isActive = activeStageTab === tab.id;
                return (
                  <Pressable
                    key={tab.id}
                    onPress={() => setStageTab(tab.id)}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: isActive }}
                    accessibilityLabel={t(tab.labelKey as any)}
                    className={`px-3 py-2.5 min-h-[44px] justify-center border-b-2 ${
                      isActive
                        ? 'border-blue-500'
                        : 'border-transparent'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {t(tab.labelKey as any)}
                    </Text>
                    <Text className="text-xs text-gray-400 dark:text-gray-500">
                      ({tab.ages})
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Content based on active CDC stage */}
            {activeStageTab === 'toddler' ? (
              <TimelineView
                ageInMonths={ageInMonths}
                currentAgeRange={currentAgeRange}
                checkedMilestones={checkedMilestones}
                onToggleMilestone={toggleMilestone}
              />
            ) : (
              <YouthTimeline
                ageInMonths={ageInMonths}
                currentAgeRange={youthAgeRange}
                ageRangeIds={
                  activeStageTab === 'middleChildhood'
                    ? MIDDLE_CHILDHOOD_IDS
                    : TEEN_IDS
                }
                checkedMilestones={checkedMilestones}
                onToggleMilestone={toggleMilestone}
              />
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}
