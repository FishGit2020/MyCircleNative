import React, { useState, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@apollo/client';
import { useTranslation, GET_STOCK_QUOTE, GET_STOCK_CANDLES } from '@mycircle/shared';
import StockChart from './StockChart';

/* ── Types ───────────────────────────────────────────────── */

interface StockQuote {
  c: number;  // current price
  d: number;  // change
  dp: number; // percent change
  h: number;  // high
  l: number;  // low
  o: number;  // open
  pc: number; // previous close
  t: number;  // timestamp
}

interface StockQuoteResponse {
  stockQuote: StockQuote | null;
}

interface StockCardProps {
  symbol: string;
  companyName: string;
  onRemove?: (symbol: string) => void;
  onPress?: () => void;
}

/* ── Chart sub-component ─────────────────────────────────── */

function StockChartSection({ symbol, currentPrice, previousClose }: { symbol: string; currentPrice: number; previousClose: number }) {
  const now = Math.floor(Date.now() / 1000);
  const oneMonthAgo = now - 30 * 24 * 60 * 60;
  const { data } = useQuery(GET_STOCK_CANDLES, {
    variables: { symbol, resolution: 'D', from: oneMonthAgo, to: now },
    fetchPolicy: 'cache-first',
  });
  return (
    <StockChart
      data={data?.stockCandles ?? null}
      symbol={symbol}
      currentPrice={currentPrice}
      previousClose={previousClose}
    />
  );
}

/* ── Component ───────────────────────────────────────────── */

function StockCard({ symbol, companyName, onRemove, onPress }: StockCardProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const { data, loading } = useQuery<StockQuoteResponse>(GET_STOCK_QUOTE, {
    variables: { symbol },
    fetchPolicy: 'cache-and-network',
  });

  const quote = data?.stockQuote ?? null;
  const isPositive = quote ? quote.d >= 0 : true;

  const toggleExpanded = useCallback(() => {
    if (onPress) {
      onPress();
    } else {
      setExpanded((prev) => !prev);
    }
  }, [onPress]);

  /* ── Loading skeleton ──────────────────────────────────── */

  if (loading && !quote) {
    return (
      <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View>
            <View className="bg-gray-200 dark:bg-gray-700 rounded w-16 h-5 mb-2" />
            <View className="bg-gray-200 dark:bg-gray-700 rounded w-32 h-3" />
          </View>
          <View className="items-end">
            <View className="bg-gray-200 dark:bg-gray-700 rounded w-20 h-5 mb-1" />
            <View className="bg-gray-200 dark:bg-gray-700 rounded w-16 h-4" />
          </View>
        </View>
      </View>
    );
  }

  /* ── Rendered card ─────────────────────────────────────── */

  return (
    <Pressable
      onPress={toggleExpanded}
      accessibilityRole="button"
      accessibilityLabel={`${symbol} - ${companyName}`}
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 shadow-sm active:opacity-80"
      style={{ minHeight: 44 }}
    >
      {/* Top row: symbol, name, price, change */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            {symbol}
          </Text>
          <Text
            className="text-sm text-gray-500 dark:text-gray-400"
            numberOfLines={1}
          >
            {companyName}
          </Text>
        </View>

        {quote ? (
          <View className="items-end">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
              ${quote.c.toFixed(2)}
            </Text>
            <View
              className={`flex-row items-center px-2 py-0.5 rounded-full ${
                isPositive
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : 'bg-red-100 dark:bg-red-900/30'
              }`}
            >
              <Ionicons
                name={isPositive ? 'caret-up' : 'caret-down'}
                size={12}
                color={isPositive ? '#16a34a' : '#dc2626'}
              />
              <Text
                className={`text-sm font-medium ml-1 ${
                  isPositive
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {isPositive ? '+' : ''}
                {quote.dp.toFixed(2)}%
              </Text>
            </View>
          </View>
        ) : (
          <Text className="text-sm text-gray-400 dark:text-gray-500">
            {t('stocks.loading')}
          </Text>
        )}
      </View>

      {/* Daily range */}
      {quote && (
        <View className="flex-row justify-between mt-2">
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {t('stocks.high')}: ${quote.h.toFixed(2)}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {t('stocks.low')}: ${quote.l.toFixed(2)}
          </Text>
        </View>
      )}

      {/* Expanded details */}
      {expanded && quote && (
        <View className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <View className="flex-row flex-wrap">
            <View className="w-1/2 mb-2">
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {t('stocks.open')}
              </Text>
              <Text className="text-sm font-medium text-gray-900 dark:text-white">
                ${quote.o.toFixed(2)}
              </Text>
            </View>
            <View className="w-1/2 mb-2">
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {t('stocks.prevClose')}
              </Text>
              <Text className="text-sm font-medium text-gray-900 dark:text-white">
                ${quote.pc.toFixed(2)}
              </Text>
            </View>
            <View className="w-1/2 mb-2">
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {t('stocks.change')}
              </Text>
              <Text
                className={`text-sm font-medium ${
                  isPositive
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {isPositive ? '+' : ''}
                {quote.d.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Stock Chart */}
          <StockChartSection symbol={symbol} currentPrice={quote.c} previousClose={quote.pc} />
        </View>
      )}
    </Pressable>
  );
}

export default React.memo(StockCard);
