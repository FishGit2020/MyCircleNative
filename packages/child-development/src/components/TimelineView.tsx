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
import {
  DOMAINS,
  AGE_RANGES,
  getMilestonesByDomainAndAge,
} from '../data/milestones';
import type { DomainId, AgeRangeMeta, AgeRangeId } from '../data/milestones';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/* --- Domain color mapping --- */

const DOMAIN_BG_ACTIVE: Record<string, string> = {
  'bg-blue-500': 'bg-blue-500',
  'bg-purple-500': 'bg-purple-500',
  'bg-amber-500': 'bg-amber-500',
  'bg-green-500': 'bg-green-500',
  'bg-teal-500': 'bg-teal-500',
};

const DOMAIN_TEXT: Record<string, string> = {
  'bg-blue-500': 'text-blue-700 dark:text-blue-300',
  'bg-purple-500': 'text-purple-700 dark:text-purple-300',
  'bg-amber-500': 'text-amber-700 dark:text-amber-300',
  'bg-green-500': 'text-green-700 dark:text-green-300',
  'bg-teal-500': 'text-teal-700 dark:text-teal-300',
};

/* --- CDC / AAP Resource Links per age range --- */

const CDC_LINKS: Record<AgeRangeId, string> = {
  '0-3m': 'https://www.cdc.gov/act-early/milestones/2-months.html',
  '3-6m': 'https://www.cdc.gov/act-early/milestones/4-months.html',
  '6-9m': 'https://www.cdc.gov/act-early/milestones/6-months.html',
  '9-12m': 'https://www.cdc.gov/act-early/milestones/9-months.html',
  '12-18m': 'https://www.cdc.gov/act-early/milestones/1-year.html',
  '18-24m': 'https://www.cdc.gov/act-early/milestones/18-months.html',
  '2-3y': 'https://www.cdc.gov/act-early/milestones/2-years.html',
  '3-4y': 'https://www.cdc.gov/act-early/milestones/3-years.html',
  '4-5y': 'https://www.cdc.gov/act-early/milestones/4-years.html',
};

const AAP_LINKS: Record<AgeRangeId, string> = {
  '0-3m': 'https://www.healthychildren.org/English/ages-stages/baby/Pages/Developmental-Milestones-1-Month.aspx',
  '3-6m': 'https://www.healthychildren.org/English/ages-stages/baby/Pages/Developmental-Milestones-3-Months.aspx',
  '6-9m': 'https://www.healthychildren.org/English/ages-stages/baby/Pages/Developmental-Milestones-7-Months.aspx',
  '9-12m': 'https://www.healthychildren.org/English/ages-stages/baby/Pages/Developmental-Milestones-12-Months.aspx',
  '12-18m': 'https://www.healthychildren.org/English/ages-stages/toddler/Pages/Milestones-During-The-First-2-Years.aspx',
  '18-24m': 'https://www.healthychildren.org/English/ages-stages/toddler/Pages/Developmental-Milestones-2-Year-Olds.aspx',
  '2-3y': 'https://www.healthychildren.org/English/ages-stages/toddler/Pages/Developmental-Milestones-2-Year-Olds.aspx',
  '3-4y': 'https://www.healthychildren.org/English/ages-stages/preschool/Pages/Developmental-Milestones-3-to-4-Year-Olds.aspx',
  '4-5y': 'https://www.healthychildren.org/English/ages-stages/preschool/Pages/Developmental-Milestones-4-to-5-Year-Olds.aspx',
};

/* --- Props --- */

interface TimelineViewProps {
  ageInMonths: number | null;
  currentAgeRange: AgeRangeMeta | null;
  checkedMilestones?: Set<string>;
  onToggleMilestone?: (milestoneId: string) => void;
}

/* --- Component --- */

export default function TimelineView({
  ageInMonths,
  currentAgeRange,
  checkedMilestones,
  onToggleMilestone,
}: TimelineViewProps) {
  const { t } = useTranslation();

  const [visibleDomains, setVisibleDomains] = useState<Set<DomainId>>(
    () => new Set(DOMAINS.map((d) => d.id)),
  );
  const [expandedStages, setExpandedStages] = useState<Set<AgeRangeId>>(
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

  /* Toggle a domain chip on/off (keep at least one visible) */
  const toggleDomain = useCallback((domainId: DomainId) => {
    setVisibleDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domainId)) {
        if (next.size > 1) next.delete(domainId);
      } else {
        next.add(domainId);
      }
      return next;
    });
  }, []);

  /* Toggle expand/collapse for a stage */
  const toggleStage = useCallback((ageRangeId: AgeRangeId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedStages((prev) => {
      const next = new Set(prev);
      if (next.has(ageRangeId)) next.delete(ageRangeId);
      else next.add(ageRangeId);
      return next;
    });
  }, []);

  /* Determine stage status: past / current / upcoming */
  const getStageStatus = useCallback(
    (ar: AgeRangeMeta): 'past' | 'current' | 'upcoming' => {
      if (currentAgeRange?.id === ar.id) return 'current';
      if (ageInMonths !== null && ar.maxMonths <= ageInMonths) return 'past';
      return 'upcoming';
    },
    [currentAgeRange, ageInMonths],
  );

  /* Count milestones for a stage */
  const milestoneCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const ar of AGE_RANGES) {
      let count = 0;
      for (const domain of DOMAINS) {
        if (visibleDomains.has(domain.id)) {
          count += getMilestonesByDomainAndAge(domain.id, ar.id).length;
        }
      }
      counts[ar.id] = count;
    }
    return counts;
  }, [visibleDomains]);

  const activeDomains = DOMAINS.filter((d) => visibleDomains.has(d.id));

  /* Open external link */
  const openLink = useCallback((url: string) => {
    WebBrowser.openBrowserAsync(url);
  }, []);

  /* --- Render --- */

  return (
    <View className="gap-4">
      {/* CDC attribution */}
      <Text className="text-xs text-gray-500 dark:text-gray-400 italic">
        {t('childDev.cdcAttribution' as any)}
      </Text>

      {/* Domain filter chips */}
      <View
        className="flex-row flex-wrap gap-2"
        accessibilityRole="none"
        accessibilityLabel={t('childDev.domainPhysical' as any)}
      >
        {DOMAINS.map((domain) => {
          const active = visibleDomains.has(domain.id);
          const bgClass = DOMAIN_BG_ACTIVE[domain.color];
          return (
            <Pressable
              key={domain.id}
              onPress={() => toggleDomain(domain.id)}
              accessibilityRole="button"
              accessibilityLabel={t(domain.nameKey as any)}
              accessibilityState={{ selected: active }}
              className={`px-3 py-2 rounded-full min-h-[44px] items-center justify-center ${
                active
                  ? `${bgClass}`
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  active
                    ? 'text-white'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {t(domain.nameKey as any)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Vertical Timeline */}
      <View className="pl-8 relative">
        {/* Vertical line */}
        <View className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

        <View className="gap-6">
          {AGE_RANGES.map((ar) => {
            const status = getStageStatus(ar);
            const expanded = expandedStages.has(ar.id);
            const milestoneCount = milestoneCounts[ar.id];

            return (
              <View key={ar.id}>
                {/* Timeline node (header) */}
                <Pressable
                  onPress={() => toggleStage(ar.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${t(ar.labelKey as any)}, ${
                    status === 'past'
                      ? t('childDev.pastStage' as any)
                      : status === 'current'
                      ? t('childDev.currentStage' as any)
                      : t('childDev.upcomingStage' as any)
                  }`}
                  accessibilityState={{ expanded }}
                  className="flex-row items-start gap-3 min-h-[44px]"
                >
                  {/* Dot */}
                  <View className="-ml-8 flex-shrink-0 mt-0.5">
                    {status === 'past' && (
                      <View className="w-6 h-6 rounded-full bg-green-500 items-center justify-center">
                        <Text className="text-white text-xs font-bold">
                          {'\u2713'}
                        </Text>
                      </View>
                    )}
                    {status === 'current' && (
                      <View className="w-6 h-6 rounded-full border-[3px] border-blue-500 bg-white dark:bg-gray-900 items-center justify-center">
                        <View className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      </View>
                    )}
                    {status === 'upcoming' && (
                      <View className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600" />
                    )}
                  </View>

                  {/* Label + badge + count */}
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 flex-wrap">
                      <Text
                        className={`text-sm font-semibold ${
                          status === 'upcoming'
                            ? 'text-gray-400 dark:text-gray-500'
                            : 'text-gray-800 dark:text-white'
                        }`}
                      >
                        {t(ar.labelKey as any)}
                      </Text>
                      {status === 'past' && (
                        <View className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30">
                          <Text className="text-xs text-green-600 dark:text-green-400 font-medium">
                            {t('childDev.pastStage' as any)}
                          </Text>
                        </View>
                      )}
                      {status === 'current' && (
                        <View className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30">
                          <Text className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                            {t('childDev.currentStage' as any)}
                          </Text>
                        </View>
                      )}
                      {status === 'upcoming' && (
                        <View className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">
                          <Text className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                            {t('childDev.upcomingStage' as any)}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text
                      className={`text-xs mt-0.5 ${
                        status === 'upcoming'
                          ? 'text-gray-400 dark:text-gray-500'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {t('childDev.milestoneCount' as any).replace(
                        '{count}',
                        String(milestoneCount),
                      )}
                    </Text>
                  </View>

                  {/* Expand/collapse chevron */}
                  <Text
                    className={`text-gray-400 dark:text-gray-500 text-sm mt-1 flex-shrink-0 ${
                      expanded ? '' : ''
                    }`}
                  >
                    {expanded ? '\u25B2' : '\u25BC'}
                  </Text>
                </Pressable>

                {/* Expanded milestones */}
                {expanded && (
                  <View className="mt-3 gap-3">
                    {/* Resource links */}
                    <View className="flex-row flex-wrap gap-2">
                      <Pressable
                        onPress={() => openLink(CDC_LINKS[ar.id])}
                        accessibilityRole="link"
                        accessibilityLabel={t('childDev.cdcGuide' as any)}
                        className="flex-row items-center gap-1 px-2.5 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 min-h-[44px]"
                      >
                        <Text className="text-xs text-blue-600 dark:text-blue-400">
                          {'\u2197'}
                        </Text>
                        <Text className="text-xs text-blue-600 dark:text-blue-400">
                          {t('childDev.cdcGuide' as any)}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => openLink(AAP_LINKS[ar.id])}
                        accessibilityRole="link"
                        accessibilityLabel={t('childDev.aapGuide' as any)}
                        className="flex-row items-center gap-1 px-2.5 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 min-h-[44px]"
                      >
                        <Text className="text-xs text-green-600 dark:text-green-400">
                          {'\u2197'}
                        </Text>
                        <Text className="text-xs text-green-600 dark:text-green-400">
                          {t('childDev.aapGuide' as any)}
                        </Text>
                      </Pressable>
                    </View>

                    {/* Milestones grouped by domain */}
                    {activeDomains.map((domain) => {
                      const milestones = getMilestonesByDomainAndAge(
                        domain.id,
                        ar.id,
                      );
                      if (milestones.length === 0) return null;
                      const textClass = DOMAIN_TEXT[domain.color];

                      return (
                        <View
                          key={domain.id}
                          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3"
                        >
                          <View className="flex-row items-center gap-2 mb-2">
                            <View
                              className={`w-5 h-5 rounded items-center justify-center ${domain.color}`}
                            >
                              <Text className="text-white text-[10px]">
                                {domain.icon === 'runner'
                                  ? '\u26A1'
                                  : domain.icon === 'speech-bubble'
                                  ? '\u{1F4AC}'
                                  : domain.icon === 'brain'
                                  ? '\u{1F4A1}'
                                  : domain.icon === 'handshake'
                                  ? '\u2764'
                                  : '\u{1F476}'}
                              </Text>
                            </View>
                            <Text
                              className={`text-xs font-semibold ${textClass}`}
                            >
                              {t(domain.nameKey as any)}
                            </Text>
                          </View>
                          <View className="gap-1">
                            {milestones.map((m) => {
                              const checked = checkedMilestones?.has(m.id) ?? false;
                              return (
                                <Pressable
                                  key={m.id}
                                  onPress={() => onToggleMilestone?.(m.id)}
                                  accessibilityRole="checkbox"
                                  accessibilityState={{ checked }}
                                  accessibilityLabel={t(m.nameKey as any)}
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
                                    className={`text-sm leading-relaxed flex-1 ${
                                      checked
                                        ? 'text-gray-400 dark:text-gray-500 line-through'
                                        : 'text-gray-700 dark:text-gray-300'
                                    }`}
                                    style={checked ? { opacity: 0.5 } : undefined}
                                  >
                                    {t(m.nameKey as any)}
                                  </Text>
                                  {m.isRedFlag && !checked && (
                                    <View className="flex-shrink-0 px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30">
                                      <Text className="text-[10px] text-red-600 dark:text-red-400 font-medium">
                                        {t('childDev.redFlag' as any)}
                                      </Text>
                                    </View>
                                  )}
                                </Pressable>
                              );
                            })}
                          </View>
                        </View>
                      );
                    })}
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
