import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@apollo/client';
import { useTranslation, GET_CRYPTO_PRICES } from '@mycircle/shared';
import type { CryptoPrice } from '@mycircle/shared';

/* ── Constants ───────────────────────────────────────────── */

const CRYPTO_IDS = ['bitcoin', 'ethereum', 'solana', 'cardano', 'dogecoin'];

/* ── Types ───────────────────────────────────────────────── */

interface CryptoPricesResponse {
  cryptoPrices: CryptoPrice[];
}

/* ── Sparkline placeholder ───────────────────────────────── */

function SparklinePlaceholder({ positive }: { positive: boolean }) {
  return (
    <View
      className={`w-16 h-6 rounded items-center justify-center ${
        positive
          ? 'bg-green-50 dark:bg-green-900/20'
          : 'bg-red-50 dark:bg-red-900/20'
      }`}
    >
      <Ionicons
        name={positive ? 'trending-up' : 'trending-down'}
        size={14}
        color={positive ? '#22c55e' : '#ef4444'}
      />
    </View>
  );
}

/* ── Crypto row ──────────────────────────────────────────── */

function CryptoRow({ coin }: { coin: CryptoPrice }) {
  const isPositive = (coin.price_change_percentage_24h ?? 0) >= 0;

  return (
    <View className="flex-row items-center py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      {/* Icon */}
      {coin.image ? (
        <Image
          source={{ uri: coin.image }}
          className="w-8 h-8 rounded-full mr-3"
          accessibilityLabel={coin.name}
        />
      ) : (
        <View className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 mr-3 items-center justify-center">
          <Text className="text-xs font-bold text-gray-500 dark:text-gray-400">
            {coin.symbol.toUpperCase().slice(0, 2)}
          </Text>
        </View>
      )}

      {/* Name / symbol */}
      <View className="flex-1 mr-2">
        <Text className="text-sm font-bold text-gray-900 dark:text-white">
          {coin.symbol.toUpperCase()}
        </Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
          {coin.name}
        </Text>
      </View>

      {/* Sparkline placeholder */}
      <SparklinePlaceholder positive={isPositive} />

      {/* Price and 24h change */}
      <View className="items-end ml-3" style={{ minWidth: 80 }}>
        <Text className="text-sm font-bold text-gray-900 dark:text-white">
          $
          {coin.current_price.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
        <Text
          className={`text-xs font-medium ${
            isPositive
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {isPositive ? '+' : ''}
          {(coin.price_change_percentage_24h ?? 0).toFixed(2)}%
        </Text>
      </View>
    </View>
  );
}

/* ── Component ───────────────────────────────────────────── */

export default function CryptoSection() {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);

  const { data, loading, error, refetch } = useQuery<CryptoPricesResponse>(
    GET_CRYPTO_PRICES,
    {
      variables: { ids: CRYPTO_IDS, vsCurrency: 'usd' },
      fetchPolicy: 'cache-and-network',
    },
  );

  const prices = data?.cryptoPrices ?? [];

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  /* ── Error ─────────────────────────────────────────────── */

  if (error && prices.length === 0) {
    return (
      <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
        <Text className="text-sm text-red-700 dark:text-red-300">
          {t('crypto.loadError')}
        </Text>
      </View>
    );
  }

  /* ── Rendered section ──────────────────────────────────── */

  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Header with collapse toggle */}
      <Pressable
        onPress={toggleCollapsed}
        accessibilityRole="button"
        accessibilityLabel={`${t('crypto.title')} ${collapsed ? 'expand' : 'collapse'}`}
        className="flex-row items-center justify-between px-4 py-3 active:opacity-80"
        style={{ minHeight: 44 }}
      >
        <View className="flex-row items-center">
          <Ionicons name="logo-bitcoin" size={20} color="#f59e0b" />
          <Text className="text-lg font-bold text-gray-900 dark:text-white ml-2">
            {t('crypto.title')}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              refetch();
            }}
            accessibilityRole="button"
            accessibilityLabel={t('crypto.refresh')}
            className="p-2 mr-1"
            style={{ minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'center' }}
          >
            <Ionicons name="refresh-outline" size={18} color="#9ca3af" />
          </Pressable>
          <Ionicons
            name={collapsed ? 'chevron-down' : 'chevron-up'}
            size={18}
            color="#9ca3af"
          />
        </View>
      </Pressable>

      {/* Content */}
      {!collapsed && (
        <View className="px-4 pb-3">
          {loading && prices.length === 0 ? (
            <View className="py-6 items-center">
              <ActivityIndicator size="small" color="#f59e0b" />
            </View>
          ) : prices.length === 0 ? (
            <View className="py-6 items-center">
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {t('crypto.noPrices')}
              </Text>
            </View>
          ) : (
            prices.map((coin) => <CryptoRow key={coin.id} coin={coin} />)
          )}
        </View>
      )}
    </View>
  );
}
