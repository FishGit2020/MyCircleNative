import { useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useTranslation } from '@mycircle/shared';
import type { ToolCall } from '../hooks/useAiChat';

/* ── Props ────────────────────────────────────────────────── */

export interface ToolCallWithPending extends ToolCall {
  pending?: boolean;
}

interface ToolCallDisplayProps {
  toolCalls: (ToolCall | ToolCallWithPending)[];
  debugMode?: boolean;
}

/* ── Tool icons & labels ──────────────────────────────────── */

const TOOL_ICONS: Record<string, string> = {
  getWeather: '\u2601\uFE0F',
  searchCities: '\uD83D\uDD0D',
  getStockQuote: '\uD83D\uDCC8',
  getCryptoPrices: '\uD83E\uDE99',
  navigateTo: '\uD83E\uDDED',
  addFlashcard: '\uD83D\uDCDD',
  getBibleVerse: '\uD83D\uDCD6',
  searchPodcasts: '\uD83C\uDFA7',
  addBookmark: '\uD83D\uDD16',
  listFlashcards: '\uD83D\uDCCB',
  checkCaseStatus: '\uD83D\uDDC2\uFE0F',
  addNote: '\uD83D\uDDD2\uFE0F',
  addDailyLogEntry: '\u23F1\uFE0F',
  setBabyDueDate: '\uD83D\uDC76',
  addChildMilestone: '\uD83C\uDF1F',
  addImmigrationCase: '\uD83D\uDCCE',
};

const TOOL_LABEL_KEYS: Record<string, string> = {
  getWeather: 'ai.toolWeather',
  searchCities: 'ai.toolCitySearch',
  getStockQuote: 'ai.toolStockQuote',
  getCryptoPrices: 'ai.toolCrypto',
  navigateTo: 'ai.toolNavigate',
  addFlashcard: 'ai.toolFlashcard',
  getBibleVerse: 'ai.toolBibleVerse',
  searchPodcasts: 'ai.toolPodcastSearch',
  addBookmark: 'ai.toolBookmark',
  listFlashcards: 'ai.toolFlashcardList',
  checkCaseStatus: 'ai.toolCheckCase',
  addNote: 'ai.toolAddNote',
  addDailyLogEntry: 'ai.toolAddDailyLogEntry',
  setBabyDueDate: 'ai.toolSetDueDate',
  addChildMilestone: 'ai.toolAddMilestone',
  addImmigrationCase: 'ai.toolAddCase',
};

/* ── Color-coded badge styles per tool category ──────────── */

type BadgeCategory = 'data' | 'navigation' | 'action' | 'search' | 'default';

const TOOL_CATEGORY: Record<string, BadgeCategory> = {
  getWeather: 'data',
  getStockQuote: 'data',
  getCryptoPrices: 'data',
  getBibleVerse: 'data',
  searchCities: 'search',
  searchPodcasts: 'search',
  listFlashcards: 'search',
  checkCaseStatus: 'search',
  navigateTo: 'navigation',
  addFlashcard: 'action',
  addBookmark: 'action',
  addNote: 'action',
  addDailyLogEntry: 'action',
  setBabyDueDate: 'action',
  addChildMilestone: 'action',
  addImmigrationCase: 'action',
};

const BADGE_STYLES: Record<BadgeCategory, { bg: string; text: string }> = {
  data: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-300',
  },
  search: {
    bg: 'bg-purple-50 dark:bg-purple-900/30',
    text: 'text-purple-700 dark:text-purple-300',
  },
  navigation: {
    bg: 'bg-green-50 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-300',
  },
  action: {
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-300',
  },
  default: {
    bg: 'bg-gray-50 dark:bg-gray-700',
    text: 'text-gray-700 dark:text-gray-300',
  },
};

/* ── JSON block sub-component ─────────────────────────────── */

function JsonBlock({ data, label }: { data: unknown; label: string }) {
  const formatted =
    typeof data === 'string'
      ? (() => {
          try {
            return JSON.stringify(JSON.parse(data), null, 2);
          } catch {
            return data;
          }
        })()
      : JSON.stringify(data, null, 2);

  return (
    <View className="mt-1">
      <Text className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
        {label}
      </Text>
      <ScrollView
        horizontal
        className="mt-0.5 p-2 rounded bg-gray-50 dark:bg-gray-800 max-h-40"
      >
        <Text
          className="text-[11px] text-gray-700 dark:text-gray-300 font-mono"
          selectable
        >
          {formatted}
        </Text>
      </ScrollView>
    </View>
  );
}

/* ── Main component ───────────────────────────────────────── */

export default function ToolCallDisplay({
  toolCalls,
  debugMode = false,
}: ToolCallDisplayProps) {
  const { t } = useTranslation();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (toolCalls.length === 0) return null;

  const toggle = (i: number) =>
    setExpandedIndex((prev) => (prev === i ? null : i));

  return (
    <View
      className="mt-2 gap-2"
      accessibilityLabel={t('ai.toolsUsed')}
      accessibilityRole="list"
    >
      {toolCalls.map((tc, i) => {
        const isExpanded = debugMode || expandedIndex === i;
        const hasResult = tc.result !== undefined && tc.result !== '';
        const isPending = 'pending' in tc && tc.pending === true;
        const category: BadgeCategory = TOOL_CATEGORY[tc.name] || 'default';
        const badge = BADGE_STYLES[category];

        return (
          <View key={i} accessibilityRole="none">
            {/* Badge button */}
            <Pressable
              onPress={() => toggle(i)}
              accessibilityLabel={`${t((TOOL_LABEL_KEYS[tc.name] || 'ai.toolGeneric') as any)} — ${isPending ? t('ai.toolPending') : t('ai.toolComplete')}`}
              accessibilityRole="button"
              accessibilityState={{ expanded: isExpanded }}
              accessibilityHint={
                isExpanded ? t('ai.hideToolArgs') : t('ai.showToolArgs')
              }
              className={`flex-row items-center gap-1.5 px-2.5 py-1.5 rounded-lg self-start ${badge.bg}`}
              style={{ minHeight: 44 }}
            >
              {/* Pending spinner or icon */}
              {isPending ? (
                <ActivityIndicator
                  size="small"
                  color="#6366f1"
                  accessibilityLabel={t('ai.toolPending')}
                />
              ) : (
                <Text className="text-xs">
                  {TOOL_ICONS[tc.name] || '\uD83D\uDD27'}
                </Text>
              )}

              {/* Tool name */}
              <Text className={`text-xs font-medium ${badge.text}`}>
                {t((TOOL_LABEL_KEYS[tc.name] || 'ai.toolGeneric') as any)}
              </Text>

              {/* Inline argument summary */}
              {tc.args && Object.keys(tc.args).length > 0 && (
                <Text className={`text-xs opacity-70 ${badge.text}`}>
                  ({Object.values(tc.args).join(', ')})
                </Text>
              )}

              {/* Status badge */}
              {isPending ? (
                <View className="ml-1 px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/40">
                  <Text className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-300">
                    {t('ai.toolPending')}
                  </Text>
                </View>
              ) : (
                <View className="ml-1 px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40">
                  <Text className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-300">
                    {'\u2713'}
                  </Text>
                </View>
              )}

              {/* Expand/collapse chevron */}
              <Text
                className={`text-xs ml-0.5 ${badge.text} ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              >
                {'\u25BC'}
              </Text>
            </Pressable>

            {/* Expanded details */}
            {isExpanded && (
              <View className="mt-1 ml-2 pl-2 border-l-2 border-blue-200 dark:border-blue-800">
                {tc.args && Object.keys(tc.args).length > 0 && (
                  <JsonBlock data={tc.args} label={t('ai.toolCallArgs')} />
                )}
                {hasResult ? (
                  <JsonBlock data={tc.result} label={t('ai.toolCallResult')} />
                ) : (
                  <Text className="mt-1 text-[11px] text-gray-400 dark:text-gray-500 italic">
                    {t('ai.debugNoResult')}
                  </Text>
                )}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
