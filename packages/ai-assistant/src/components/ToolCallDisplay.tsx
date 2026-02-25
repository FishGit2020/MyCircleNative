import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useTranslation } from '@mycircle/shared';
import type { ToolCall } from '../hooks/useAiChat';

/* ── Props ────────────────────────────────────────────────── */

interface ToolCallDisplayProps {
  toolCalls: ToolCall[];
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

        return (
          <View key={i} accessibilityRole="none">
            <Pressable
              onPress={() => toggle(i)}
              accessibilityLabel={t((TOOL_LABEL_KEYS[tc.name] || 'ai.toolGeneric') as any)}
              accessibilityRole="button"
              accessibilityState={{ expanded: isExpanded }}
              className="flex-row items-center gap-1 px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 self-start"
              style={{ minHeight: 44 }}
            >
              <Text className="text-xs">{TOOL_ICONS[tc.name] || '\uD83D\uDD27'}</Text>
              <Text className="text-xs font-medium text-blue-700 dark:text-blue-300">
                {t((TOOL_LABEL_KEYS[tc.name] || 'ai.toolGeneric') as any)}
              </Text>
              {tc.args && Object.keys(tc.args).length > 0 && (
                <Text className="text-xs text-blue-500 dark:text-blue-400">
                  ({Object.values(tc.args).join(', ')})
                </Text>
              )}
              <Text
                className={`text-xs text-blue-500 dark:text-blue-400 ml-1 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              >
                {'\u25BC'}
              </Text>
            </Pressable>

            {isExpanded && (
              <View className="mt-1 ml-2 pl-2 border-l-2 border-blue-200 dark:border-blue-800">
                {tc.args && Object.keys(tc.args).length > 0 && (
                  <JsonBlock data={tc.args} label={t('ai.debugArgs')} />
                )}
                {hasResult ? (
                  <JsonBlock data={tc.result} label={t('ai.debugResult')} />
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
