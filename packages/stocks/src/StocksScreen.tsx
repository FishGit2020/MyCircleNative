import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from '@mycircle/shared';
import { StockSearch, Watchlist, CryptoSection, CompanyNews, StockDetailView } from './components';
import { useWatchlist } from './hooks/useWatchlist';

/* ── Types ───────────────────────────────────────────────── */

interface SelectedStock {
  symbol: string;
  companyName: string;
}

/* ── Component ───────────────────────────────────────────── */

export default function StocksScreen() {
  const { t } = useTranslation();
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedStock, setSelectedStock] = useState<SelectedStock | null>(null);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Bump key to force Apollo queries to re-fetch
    setRefreshKey((k) => k + 1);
    // Allow the spinner to show briefly
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleAddToWatchlist = useCallback(
    (symbol: string, companyName: string) => {
      addToWatchlist(symbol, companyName);
    },
    [addToWatchlist],
  );

  const handleSelectStock = useCallback(
    (symbol: string, companyName: string) => {
      setSelectedStock({ symbol, companyName });
    },
    [],
  );

  const handleBack = useCallback(() => {
    setSelectedStock(null);
  }, []);

  const handleToggleWatchlist = useCallback(
    (symbol: string, companyName: string) => {
      const isInWatchlist = watchlist.some((item) => item.symbol === symbol);
      if (isInWatchlist) {
        removeFromWatchlist(symbol);
      } else {
        addToWatchlist(symbol, companyName);
      }
    },
    [watchlist, addToWatchlist, removeFromWatchlist],
  );

  /* ── Detail view ─────────────────────────────────────────── */

  if (selectedStock) {
    const isInWatchlist = watchlist.some(
      (item) => item.symbol === selectedStock.symbol,
    );

    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <StockDetailView
          symbol={selectedStock.symbol}
          companyName={selectedStock.companyName}
          isInWatchlist={isInWatchlist}
          onBack={handleBack}
          onToggleWatchlist={handleToggleWatchlist}
        />
      </SafeAreaView>
    );
  }

  /* ── List view ───────────────────────────────────────────── */

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView
        key={refreshKey}
        className="flex-1"
        contentContainerClassName="px-4 pt-4 pb-20"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {t('stocks.title')}
        </Text>

        {/* Search bar */}
        <View className="mb-6">
          <StockSearch
            onAddToWatchlist={handleAddToWatchlist}
            onSelectStock={handleSelectStock}
          />
        </View>

        {/* Watchlist section */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            {t('stocks.watchlist')}
          </Text>
          <Watchlist
            watchlist={watchlist}
            onRemove={removeFromWatchlist}
            onSelectStock={handleSelectStock}
          />
        </View>

        {/* Company news for the first watchlist item (detail preview) */}
        {watchlist.length > 0 && (
          <View className="mb-6">
            <CompanyNews symbol={watchlist[0].symbol} />
          </View>
        )}

        {/* Crypto section */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            {t('crypto.title')}
          </Text>
          <CryptoSection />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
