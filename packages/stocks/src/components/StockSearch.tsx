import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@apollo/client';
import { useTranslation, SEARCH_STOCKS } from '@mycircle/shared';

/* ── Types ───────────────────────────────────────────────── */

interface StockSearchResult {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}

interface SearchStocksResponse {
  searchStocks: StockSearchResult[];
}

interface StockSearchProps {
  onAddToWatchlist: (symbol: string, companyName: string) => void;
  onSelectStock?: (symbol: string, companyName: string) => void;
}

/* ── Component ───────────────────────────────────────────── */

export default function StockSearch({ onAddToWatchlist, onSelectStock }: StockSearchProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce the search query by 400ms
  useEffect(() => {
    if (query.length < 1) {
      setDebouncedQuery('');
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  const { data, loading, error } = useQuery<SearchStocksResponse>(
    SEARCH_STOCKS,
    {
      variables: { query: debouncedQuery },
      skip: debouncedQuery.length < 1,
      fetchPolicy: 'cache-first',
    },
  );

  const results: StockSearchResult[] =
    debouncedQuery.length < 1 ? [] : (data?.searchStocks ?? []);

  const handleAdd = useCallback(
    (item: StockSearchResult) => {
      onAddToWatchlist(item.symbol, item.description);
      setQuery('');
      setDebouncedQuery('');
    },
    [onAddToWatchlist],
  );

  const handleSelect = useCallback(
    (item: StockSearchResult) => {
      if (onSelectStock) {
        onSelectStock(item.symbol, item.description);
        setQuery('');
        setDebouncedQuery('');
      }
    },
    [onSelectStock],
  );

  const renderItem = useCallback(
    ({ item }: { item: StockSearchResult }) => (
      <Pressable
        onPress={() => handleSelect(item)}
        accessibilityRole="button"
        accessibilityLabel={`${t('stocks.viewDetail')} ${item.symbol} - ${item.description}`}
        className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700"
        style={{ minHeight: 44 }}
      >
        <View className="bg-indigo-100 dark:bg-indigo-900/50 px-2 py-1 rounded mr-3">
          <Text className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
            {item.displaySymbol}
          </Text>
        </View>
        <View className="flex-1 mr-3">
          <Text
            className="text-sm text-gray-700 dark:text-gray-300"
            numberOfLines={1}
          >
            {item.description}
          </Text>
          <Text className="text-xs text-gray-400 dark:text-gray-500">
            {item.type}
          </Text>
        </View>
        <Pressable
          onPress={(e) => {
            e.stopPropagation?.();
            handleAdd(item);
          }}
          accessibilityRole="button"
          accessibilityLabel={`${t('stocks.addToWatchlist')} ${item.symbol}`}
          className="bg-indigo-500 dark:bg-indigo-600 px-3 py-2 rounded-lg active:opacity-80"
          style={{ minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'center' }}
        >
          <Ionicons name="add" size={18} color="#ffffff" />
        </Pressable>
      </Pressable>
    ),
    [handleAdd, handleSelect, t],
  );

  const keyExtractor = useCallback(
    (item: StockSearchResult) => item.symbol,
    [],
  );

  return (
    <View>
      {/* Search input */}
      <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2">
        <Ionicons name="search" size={20} color="#9ca3af" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('stocks.search')}
          placeholderTextColor="#9ca3af"
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel={t('stocks.search')}
          className="flex-1 ml-2 text-base text-gray-900 dark:text-white"
          style={{ minHeight: 44 }}
        />
        {query.length > 0 && (
          <Pressable
            onPress={() => {
              setQuery('');
              setDebouncedQuery('');
            }}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            style={{ minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'center' }}
          >
            <Ionicons name="close-circle" size={20} color="#9ca3af" />
          </Pressable>
        )}
      </View>

      {/* Loading indicator */}
      {loading && debouncedQuery.length >= 1 && (
        <View className="py-6 items-center">
          <ActivityIndicator size="small" color="#6366f1" />
        </View>
      )}

      {/* Error state */}
      {error && (
        <View className="py-4 items-center">
          <Text className="text-sm text-red-500 dark:text-red-400">
            {t('stocks.error')}
          </Text>
        </View>
      )}

      {/* No results */}
      {!loading &&
        !error &&
        debouncedQuery.length >= 1 &&
        results.length === 0 && (
          <View className="py-6 items-center">
            <Ionicons name="search-outline" size={32} color="#d1d5db" />
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {t('stocks.noResults')}
            </Text>
          </View>
        )}

      {/* Results list */}
      {results.length > 0 && (
        <View className="mt-2 bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm">
          <FlatList
            data={results}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            scrollEnabled={false}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
}
