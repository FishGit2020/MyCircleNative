import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from '@mycircle/shared';
import { StockSearch, Watchlist, CryptoSection, CompanyNews } from './components';
import { useWatchlist } from './hooks/useWatchlist';

/* ── Component ───────────────────────────────────────────── */

export default function StocksScreen() {
  const { t } = useTranslation();
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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
          <StockSearch onAddToWatchlist={handleAddToWatchlist} />
        </View>

        {/* Watchlist section */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            {t('stocks.watchlist')}
          </Text>
          <Watchlist
            watchlist={watchlist}
            onRemove={removeFromWatchlist}
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
