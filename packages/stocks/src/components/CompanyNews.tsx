import React, { useMemo, useCallback } from 'react';
import { View, Text, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@apollo/client';
import * as WebBrowser from 'expo-web-browser';
import { useTranslation, GET_COMPANY_NEWS } from '@mycircle/shared';

/* ── Types ───────────────────────────────────────────────── */

interface CompanyNewsArticle {
  id: number;
  category: string;
  datetime: number;
  headline: string;
  image: string | null;
  source: string;
  summary: string;
  url: string;
}

interface CompanyNewsResponse {
  companyNews: CompanyNewsArticle[];
}

interface CompanyNewsProps {
  symbol: string;
}

/* ── Helpers ─────────────────────────────────────────────── */

function formatRelativeTime(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

/* ── Article row ─────────────────────────────────────────── */

function ArticleRow({ article }: { article: CompanyNewsArticle }) {
  const handlePress = useCallback(async () => {
    try {
      await WebBrowser.openBrowserAsync(article.url);
    } catch {
      // Browser open failed silently
    }
  }, [article.url]);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="link"
      accessibilityLabel={article.headline}
      className="flex-row items-start py-3 border-b border-gray-100 dark:border-gray-700 active:opacity-80"
      style={{ minHeight: 44 }}
    >
      <View className="flex-1 mr-3">
        <Text
          className="text-sm font-medium text-gray-900 dark:text-white"
          numberOfLines={2}
        >
          {article.headline}
        </Text>
        <View className="flex-row items-center mt-1">
          <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {article.source}
          </Text>
          <Text className="text-xs text-gray-400 dark:text-gray-500 mx-1">
            {'\u00B7'}
          </Text>
          <Text className="text-xs text-gray-400 dark:text-gray-500">
            {formatRelativeTime(article.datetime)}
          </Text>
        </View>
      </View>
      <Ionicons
        name="open-outline"
        size={16}
        color="#9ca3af"
        style={{ marginTop: 2 }}
      />
    </Pressable>
  );
}

/* ── Component ───────────────────────────────────────────── */

export default function CompanyNews({ symbol }: CompanyNewsProps) {
  const { t } = useTranslation();

  const { from, to } = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return {
      from: weekAgo.toISOString().slice(0, 10),
      to: now.toISOString().slice(0, 10),
    };
  }, []);

  const { data, loading } = useQuery<CompanyNewsResponse>(GET_COMPANY_NEWS, {
    variables: { symbol, from, to },
    fetchPolicy: 'cache-first',
  });

  const articles = data?.companyNews ?? [];

  const renderItem = useCallback(
    ({ item }: { item: CompanyNewsArticle }) => <ArticleRow article={item} />,
    [],
  );

  const keyExtractor = useCallback(
    (item: CompanyNewsArticle) => String(item.id),
    [],
  );

  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm mt-4">
      {/* Section header */}
      <View className="flex-row items-center mb-3">
        <Ionicons name="newspaper-outline" size={20} color="#9ca3af" />
        <Text className="text-lg font-bold text-gray-900 dark:text-white ml-2">
          {t('stocks.news')}
        </Text>
      </View>

      {/* Loading */}
      {loading && articles.length === 0 && (
        <View className="py-6 items-center">
          <ActivityIndicator size="small" color="#6366f1" />
        </View>
      )}

      {/* Empty */}
      {!loading && articles.length === 0 && (
        <View className="py-6 items-center">
          <Ionicons name="newspaper-outline" size={32} color="#d1d5db" />
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
            {t('stocks.newsNoArticles')}
          </Text>
        </View>
      )}

      {/* Articles */}
      {articles.length > 0 && (
        <FlatList
          data={articles}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          scrollEnabled={false}
        />
      )}
    </View>
  );
}
