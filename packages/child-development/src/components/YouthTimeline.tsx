import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useTranslation } from '@mycircle/shared';
import { AGE_RANGES, MILESTONES, DOMAINS } from '../data/youthMilestones';
import type { AgeRange, Domain } from '../data/youthMilestones';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/* --- Domain color mapping --- */

const DOMAIN_COLORS: Record<Domain, { bg: string; text: string; darkBg: string; darkText: string }> = {
  physical:  { bg: 'bg-green-50',  text: 'text-green-700',  darkBg: 'dark:bg-green-900/20',  darkText: 'dark:text-green-300' },
  academic:  { bg: 'bg-blue-50',   text: 'text-blue-700',   darkBg: 'dark:bg-blue-900/20',   darkText: 'dark:text-blue-300' },
  social:    { bg: 'bg-purple-50', text: 'text-purple-700', darkBg: 'dark:bg-purple-900/20', darkText: 'dark:text-purple-300' },
  lifeSkills: { bg: 'bg-amber-50',  text: 'text-amber-700',  darkBg: 'dark:bg-amber-900/20',  darkText: 'dark:text-amber-300' },
};

/* --- Props --- */

interface YouthTimelineProps {
  ageInMonths: number | null;
  currentAgeRange: AgeRange | null;
  ageRangeIds?: Set<string>;
  checkedMilestones?: Set<string>;
  onToggleMilestone?: (milestoneId: string) => void;
}

/* --- Component --- */

export default function YouthTimeline({
  ageInMonths,
  currentAgeRange,
  ageRangeIds,
  checkedMilestones,
  onToggleMilestone,
}: YouthTimelineProps) {
  const { t } = useTranslation();

  const [expandedStages, setExpandedStages] = useState<Set<string>>(
    () => new Set(currentAgeRange ? [currentAgeRange.id] : []),
  );

  // Auto-expand current stage when it changes
  useEffect(() => {
    if (currentAgeRange) {
      setExpandedStages((prev) => {
        if (prev.has(currentAgeRange.id)) return prev;
        const next = new Set(prev);
        next.add(currentAgeRange.id);
        return next;
      });
    }
  }, [currentAgeRange]);

  const toggleStage = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedStages((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const stageStatus = useMemo(() => {
    if (!ageInMonths) return {};
    const result: Record<string, 'past' | 'current' | 'upcoming'> = {};
    for (const range of AGE_RANGES) {
      if (ageInMonths >= range.maxMonths) result[range.id] = 'past';
      else if (currentAgeRange?.id === range.id) result[range.id] = 'current';
      else result[range.id] = 'upcoming';
    }
    return result;
  }, [ageInMonths, currentAgeRange]);

  const filteredRanges = ageRangeIds
    ? AGE_RANGES.filter((r) => ageRangeIds.has(r.id))
    : AGE_RANGES;

  const openLink = useCallback((url: string) => {
    WebBrowser.openBrowserAsync(url);
  }, []);

  return (
    <View className="gap-4">
      {/* Domain Legend */}
      <View className="flex-row flex-wrap gap-2">
        {DOMAINS.map((d) => {
          const colors = DOMAIN_COLORS[d.id];
          return (
            <View
              key={d.id}
              className={`px-2.5 py-1 rounded-full ${colors.bg} ${colors.darkBg}`}
            >
              <Text className={`text-xs font-medium ${colors.text} ${colors.darkText}`}>
                {t(d.labelKey as any)}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Timeline */}
      <View className="pl-8 relative">
        {/* Vertical line */}
        <View className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

        <View className="gap-6">
          {filteredRanges.map((range) => {
            const status = stageStatus[range.id] || 'upcoming';
            const milestones = MILESTONES.filter((m) => m.ageRangeId === range.id);
            const isPast = status === 'past';
            const isCurrent = status === 'current';
            const expanded = expandedStages.has(range.id);

            return (
              <View key={range.id}>
                {/* Timeline node (header) */}
                <Pressable
                  onPress={() => toggleStage(range.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${range.label}, ${
                    isPast
                      ? t('childDev.pastStage' as any)
                      : isCurrent
                      ? t('childDev.currentStage' as any)
                      : t('childDev.upcomingStage' as any)
                  }`}
                  accessibilityState={{ expanded }}
                  className="flex-row items-start gap-3 min-h-[44px]"
                >
                  {/* Dot */}
                  <View className="-ml-8 flex-shrink-0 mt-0.5">
                    {isPast && (
                      <View className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center">
                        <Text className="text-green-600 dark:text-green-400 text-xs font-bold">
                          {'\u2713'}
                        </Text>
                      </View>
                    )}
                    {isCurrent && (
                      <View className="w-6 h-6 rounded-full border-[3px] border-indigo-500 dark:border-indigo-400 bg-white dark:bg-gray-900 items-center justify-center">
                        <View className="w-2.5 h-2.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                      </View>
                    )}
                    {!isPast && !isCurrent && (
                      <View className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 items-center justify-center">
                        <Text className="text-xs font-bold text-gray-500 dark:text-gray-400">
                          {range.id.split('-')[0]}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Label + badge + count */}
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 flex-wrap">
                      <Text
                        className={`text-sm font-semibold ${
                          isCurrent
                            ? 'text-indigo-700 dark:text-indigo-300'
                            : isPast
                            ? 'text-green-700 dark:text-green-300'
                            : 'text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {range.label}
                      </Text>
                      {isCurrent && (
                        <View className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40">
                          <Text className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                            {t('childDev.currentStage' as any)}
                          </Text>
                        </View>
                      )}
                      {isPast && (
                        <Text className="text-xs text-green-500 dark:text-green-400">
                          {t('childDev.pastStage' as any)}
                        </Text>
                      )}
                    </View>
                    <Text
                      className={`text-xs mt-0.5 ${
                        !isPast && !isCurrent
                          ? 'text-gray-400 dark:text-gray-500'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {milestones.length} {t('childDev.milestones' as any)}
                    </Text>
                  </View>

                  {/* Expand/collapse chevron */}
                  <Text className="text-gray-400 dark:text-gray-500 text-sm mt-1 flex-shrink-0">
                    {expanded ? '\u25B2' : '\u25BC'}
                  </Text>
                </Pressable>

                {/* Expanded milestones */}
                {expanded && (
                  <View className="mt-3 gap-2">
                    {DOMAINS.map((domain) => {
                      const domainMilestones = milestones.filter(
                        (m) => m.domain === domain.id,
                      );
                      if (domainMilestones.length === 0) return null;
                      const colors = DOMAIN_COLORS[domain.id];

                      return (
                        <View
                          key={domain.id}
                          className={`rounded-lg p-2.5 ${colors.bg} ${colors.darkBg}`}
                        >
                          <Text
                            className={`text-xs font-semibold mb-1 ${colors.text} ${colors.darkText}`}
                          >
                            {t(domain.labelKey as any)}
                          </Text>
                          <View className="gap-0.5">
                            {domainMilestones.map((ms) => {
                              const checked =
                                checkedMilestones?.has(ms.id) ?? false;
                              return (
                                <Pressable
                                  key={ms.id}
                                  onPress={() => onToggleMilestone?.(ms.id)}
                                  accessibilityRole="checkbox"
                                  accessibilityState={{ checked }}
                                  accessibilityLabel={t(ms.titleKey as any)}
                                  className="flex-row items-start gap-2 py-1 min-h-[36px]"
                                >
                                  <View
                                    className={`mt-0.5 w-4 h-4 rounded border items-center justify-center flex-shrink-0 ${
                                      checked
                                        ? 'bg-blue-500 dark:bg-blue-600 border-blue-500 dark:border-blue-600'
                                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                                    }`}
                                  >
                                    {checked && (
                                      <Text className="text-white text-[10px] font-bold">
                                        {'\u2713'}
                                      </Text>
                                    )}
                                  </View>
                                  <Text
                                    className={`text-xs flex-1 ${
                                      checked
                                        ? 'text-gray-400 dark:text-gray-500 line-through'
                                        : `${colors.text} ${colors.darkText}`
                                    }`}
                                    style={checked ? { opacity: 0.5 } : undefined}
                                  >
                                    {t(ms.titleKey as any)}
                                  </Text>
                                </Pressable>
                              );
                            })}
                          </View>
                        </View>
                      );
                    })}

                    {/* CDC guide link */}
                    {range.cdcLink && (
                      <Pressable
                        onPress={() => openLink(range.cdcLink!)}
                        accessibilityRole="link"
                        accessibilityLabel={t('childDev.cdcGuide' as any)}
                        className="flex-row items-center gap-1 px-2.5 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 min-h-[44px] self-start"
                      >
                        <Text className="text-xs text-blue-600 dark:text-blue-400">
                          {'\u2197'}
                        </Text>
                        <Text className="text-xs text-blue-600 dark:text-blue-400">
                          {t('childDev.cdcGuide' as any)}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
