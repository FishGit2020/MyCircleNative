import React, { useCallback, useRef } from 'react';
import { View, Text, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  Swipeable,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { useTranslation } from '@mycircle/shared';
import StockCard from './StockCard';
import type { WatchlistItem } from '../hooks/useWatchlist';

/* ── Types ───────────────────────────────────────────────── */

interface WatchlistProps {
  watchlist: WatchlistItem[];
  onRemove: (symbol: string) => void;
}

/* ── Swipeable row ───────────────────────────────────────── */

function SwipeableRow({
  item,
  onRemove,
}: {
  item: WatchlistItem;
  onRemove: (symbol: string) => void;
}) {
  const { t } = useTranslation();
  const swipeRef = useRef<Swipeable>(null);

  const renderRightActions = useCallback(
    (
      _progress: Animated.AnimatedInterpolation<number>,
      dragX: Animated.AnimatedInterpolation<number>,
    ) => {
      const scale = dragX.interpolate({
        inputRange: [-80, 0],
        outputRange: [1, 0.5],
        extrapolate: 'clamp',
      });

      return (
        <Pressable
          onPress={() => {
            swipeRef.current?.close();
            onRemove(item.symbol);
          }}
          accessibilityRole="button"
          accessibilityLabel={`${t('stocks.removeFromWatchlist')} ${item.symbol}`}
          className="bg-red-500 dark:bg-red-600 justify-center items-center rounded-r-2xl"
          style={{ width: 80, minHeight: 44 }}
        >
          <Animated.View style={{ transform: [{ scale }] }}>
            <Ionicons name="trash-outline" size={24} color="#ffffff" />
          </Animated.View>
        </Pressable>
      );
    },
    [item.symbol, onRemove, t],
  );

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
    >
      <StockCard
        symbol={item.symbol}
        companyName={item.companyName}
      />
    </Swipeable>
  );
}

/* ── Component ───────────────────────────────────────────── */

export default function Watchlist({ watchlist, onRemove }: WatchlistProps) {
  const { t } = useTranslation();

  if (watchlist.length === 0) {
    return (
      <View className="items-center py-12">
        <Ionicons name="star-outline" size={48} color="#d1d5db" />
        <Text className="text-lg font-semibold text-gray-500 dark:text-gray-400 mt-4 text-center">
          {t('stocks.noWatchlist')}
        </Text>
        <Text className="text-sm text-gray-400 dark:text-gray-500 mt-1 text-center px-8">
          {t('stocks.addSome')}
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView>
      {watchlist.map((item) => (
        <SwipeableRow
          key={item.symbol}
          item={item}
          onRemove={onRemove}
        />
      ))}
    </GestureHandlerRootView>
  );
}
