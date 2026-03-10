import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@apollo/client';
import {
  useTranslation,
  GET_STOCK_QUOTE,
  GET_STOCK_CANDLES,
} from '@mycircle/shared';
import StockChart from './StockChart';
import CompanyNews from './CompanyNews';

/* ── Types ───────────────────────────────────────────────── */

interface StockQuote {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
}

interface StockQuoteResponse {
  stockQuote: StockQuote | null;
}

interface CandleData {
  c: number[];
  h: number[];
  l: number[];
  o: number[];
  t: number[];
  v: number[];
  s: string;
}

interface StockCandlesResponse {
  stockCandles: CandleData | null;
}

export type Timeframe = '1W' | '1M' | '3M' | '6M' | '1Y';

const TIMEFRAMES: { id: Timeframe; days: number; resolution: string }[] = [
  { id: '1W', days: 7, resolution: '60' },
  { id: '1M', days: 30, resolution: 'D' },
  { id: '3M', days: 90, resolution: 'D' },
  { id: '6M', days: 180, resolution: 'D' },
  { id: '1Y', days: 365, resolution: 'W' },
];

interface StockDetailViewProps {
  symbol: string;
  companyName: string;
  isInWatchlist: boolean;
  onBack: () => void;
  onToggleWatchlist: (symbol: string, companyName: string) => void;
}

/* ── Component ───────────────────────────────────────────── */

export default function StockDetailView({
  symbol,
  companyName,
  isInWatchlist,
  onBack,
  onToggleWatchlist,
}: StockDetailViewProps) {
  const { t } = useTranslation();
  const [timeframe, setTimeframe] = useState<Timeframe>('1M');
  const [refreshing, setRefreshing] = useState(false);

  /* ── Quote query ─────────────────────────────────────── */

  const {
    data: quoteData,
    loading: quoteLoading,
    refetch: refetchQuote,
  } = useQuery<StockQuoteResponse>(GET_STOCK_QUOTE, {
    variables: { symbol },
    fetchPolicy: 'cache-and-network',
  });

  const quote = quoteData?.stockQuote ?? null;
  const isPositive = quote ? quote.d >= 0 : true;

  /* ── Candles query with timeframe ────────────────────── */

  const tf = TIMEFRAMES.find((f) => f.id === timeframe) ?? TIMEFRAMES[1];
  const now = useMemo(() => Math.floor(Date.now() / 1000), []);
  const from = useMemo(() => now - tf.days * 24 * 60 * 60, [now, tf.days]);

  const {
    data: candlesData,
    loading: candlesLoading,
    refetch: refetchCandles,
  } = useQuery<StockCandlesResponse>(GET_STOCK_CANDLES, {
    variables: { symbol, resolution: tf.resolution, from, to: now },
    fetchPolicy: 'cache-and-network',
  });

  /* ── Refresh handler ─────────────────────────────────── */

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([refetchQuote(), refetchCandles()]).finally(() => {
      setTimeout(() => setRefreshing(false), 500);
    });
  }, [refetchQuote, refetchCandles]);

  /* ── Timeframe label key ─────────────────────────────── */

  const timeframeLabel = (tf: Timeframe): string => {
    switch (tf) {
      case '1W': return t('stocks.1W');
      case '1M': return t('stocks.1M');
      case '3M': return t('stocks.3M');
      case '6M': return t('stocks.6M');
      case '1Y': return t('stocks.1Y');
    }
  };

  /* ── Render ──────────────────────────────────────────── */

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="px-4 pt-4 pb-20"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Top bar: back, symbol, watchlist star, refresh */}
      <View className="flex-row items-center justify-between mb-4">
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={t('stocks.back')}
          className="flex-row items-center py-2 pr-3 active:opacity-70"
          style={{ minHeight: 44, minWidth: 44 }}
        >
          <Ionicons name="arrow-back" size={24} color="#6366f1" />
          <Text className="text-base font-medium text-indigo-500 dark:text-indigo-400 ml-1">
            {t('stocks.back')}
          </Text>
        </Pressable>

        <View className="flex-row items-center">
          {/* Refresh button */}
          <Pressable
            onPress={onRefresh}
            accessibilityRole="button"
            accessibilityLabel={t('stocks.refresh')}
            className="p-2 mr-1 active:opacity-70"
            style={{ minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'center' }}
          >
            <Ionicons
              name="refresh-outline"
              size={22}
              color={quoteLoading ? '#a5b4fc' : '#6366f1'}
            />
          </Pressable>

          {/* Watchlist star */}
          <Pressable
            onPress={() => onToggleWatchlist(symbol, companyName)}
            accessibilityRole="button"
            accessibilityLabel={
              isInWatchlist
                ? t('stocks.removeFromWatchlist')
                : t('stocks.addToWatchlist')
            }
            className="p-2 active:opacity-70"
            style={{ minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'center' }}
          >
            <Ionicons
              name={isInWatchlist ? 'star' : 'star-outline'}
              size={24}
              color={isInWatchlist ? '#eab308' : '#9ca3af'}
            />
          </Pressable>
        </View>
      </View>

      {/* Symbol & company name */}
      <View className="mb-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">
          {symbol}
        </Text>
        <Text
          className="text-sm text-gray-500 dark:text-gray-400 mt-1"
          numberOfLines={1}
        >
          {companyName}
        </Text>
      </View>

      {/* Quote card */}
      {quoteLoading && !quote ? (
        <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm mb-4">
          <View className="flex-row items-center">
            <View className="bg-gray-200 dark:bg-gray-700 rounded w-28 h-10 mr-4" />
            <View className="bg-gray-200 dark:bg-gray-700 rounded w-20 h-6" />
          </View>
        </View>
      ) : quote ? (
        <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm mb-4">
          {/* Price and change */}
          <View className="flex-row flex-wrap items-baseline mb-4">
            <Text className="text-4xl font-bold text-gray-900 dark:text-white mr-3">
              ${quote.c.toFixed(2)}
            </Text>
            <View
              className={`flex-row items-center px-2.5 py-1 rounded-full ${
                isPositive
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : 'bg-red-100 dark:bg-red-900/30'
              }`}
            >
              <Ionicons
                name={isPositive ? 'caret-up' : 'caret-down'}
                size={14}
                color={isPositive ? '#16a34a' : '#dc2626'}
              />
              <Text
                className={`text-base font-semibold ml-1 ${
                  isPositive
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {isPositive ? '+' : ''}
                {quote.d.toFixed(2)} ({isPositive ? '+' : ''}
                {quote.dp.toFixed(2)}%)
              </Text>
            </View>
          </View>

          {/* Quote details grid */}
          <View className="flex-row flex-wrap">
            <View className="w-1/2 mb-3">
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {t('stocks.open')}
              </Text>
              <Text className="text-sm font-medium text-gray-900 dark:text-white">
                ${quote.o.toFixed(2)}
              </Text>
            </View>
            <View className="w-1/2 mb-3">
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {t('stocks.high')}
              </Text>
              <Text className="text-sm font-medium text-gray-900 dark:text-white">
                ${quote.h.toFixed(2)}
              </Text>
            </View>
            <View className="w-1/2 mb-3">
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {t('stocks.low')}
              </Text>
              <Text className="text-sm font-medium text-gray-900 dark:text-white">
                ${quote.l.toFixed(2)}
              </Text>
            </View>
            <View className="w-1/2 mb-3">
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {t('stocks.prevClose')}
              </Text>
              <Text className="text-sm font-medium text-gray-900 dark:text-white">
                ${quote.pc.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      ) : null}

      {/* Chart with timeframe selector */}
      <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm mb-4 overflow-hidden">
        {/* Timeframe selector */}
        <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
          <Text className="text-base font-semibold text-gray-900 dark:text-white">
            {t('stocks.chart')}
          </Text>
          <View className="flex-row gap-1">
            {TIMEFRAMES.map((tf) => (
              <Pressable
                key={tf.id}
                onPress={() => setTimeframe(tf.id)}
                accessibilityRole="button"
                accessibilityLabel={`${t('stocks.chartTimeframe')} ${timeframeLabel(tf.id)}`}
                className={`px-3 py-1.5 rounded-full ${
                  timeframe === tf.id
                    ? 'bg-indigo-100 dark:bg-indigo-900/40'
                    : ''
                }`}
                style={{ minHeight: 36 }}
              >
                <Text
                  className={`text-sm font-medium ${
                    timeframe === tf.id
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {timeframeLabel(tf.id)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Chart content */}
        {candlesLoading && !candlesData?.stockCandles ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="small" color="#6366f1" />
          </View>
        ) : (
          <StockChart
            data={candlesData?.stockCandles ?? null}
            symbol={symbol}
            currentPrice={quote?.c}
            previousClose={quote?.pc}
            embedded
          />
        )}
      </View>

      {/* Company news */}
      <CompanyNews symbol={symbol} />
    </ScrollView>
  );
}
