import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from '@apollo/client';
import {
  useTranslation,
  START_CRAWL,
  GET_CRAWL_JOBS,
  GET_CRAWL_JOB_DETAIL,
} from '@mycircle/shared';

type ViewMode = 'form' | 'jobs' | 'detail' | 'document';

interface CrawlJob {
  id: string;
  url: string;
  status: 'running' | 'completed' | 'failed';
  documentsCount: number;
  pagesCrawled: number;
  createdAt: string;
}

interface CrawlDocument {
  id: string;
  title: string;
  content: string;
  url: string;
  metadata: Record<string, string>;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: keyof typeof Ionicons.glyphMap }> = {
  running: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-300', icon: 'sync' },
  completed: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-300', icon: 'checkmark-circle' },
  failed: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-300', icon: 'close-circle' },
};

export default function WebCrawlerScreen() {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>('jobs');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<CrawlDocument | null>(null);

  // Form state
  const [url, setUrl] = useState('');
  const [maxDepth, setMaxDepth] = useState(2);
  const [maxPages, setMaxPages] = useState(10);

  const { data: jobsData, loading: jobsLoading, refetch: refetchJobs } = useQuery(GET_CRAWL_JOBS);
  const jobs: CrawlJob[] = jobsData?.getCrawlJobs ?? [];

  const { data: detailData, loading: detailLoading } = useQuery(GET_CRAWL_JOB_DETAIL, {
    variables: { id: selectedJobId },
    skip: !selectedJobId,
  });
  const jobDetail = detailData?.getCrawlJobDetail;

  const [startCrawl, { loading: startingCrawl }] = useMutation(START_CRAWL, {
    onCompleted: () => {
      refetchJobs();
      setViewMode('jobs');
      setUrl('');
    },
    onError: () => {
      Alert.alert(t('webCrawler.errorTitle' as any), t('webCrawler.startError' as any));
    },
  });

  const handleStartCrawl = useCallback(() => {
    if (!url.trim()) {
      Alert.alert(t('webCrawler.errorTitle' as any), t('webCrawler.urlRequired' as any));
      return;
    }
    startCrawl({ variables: { url: url.trim(), maxDepth, maxPages } });
  }, [url, maxDepth, maxPages, startCrawl, t]);

  const openJobDetail = useCallback((jobId: string) => {
    setSelectedJobId(jobId);
    setViewMode('detail');
  }, []);

  const openDocument = useCallback((doc: CrawlDocument) => {
    setSelectedDoc(doc);
    setViewMode('document');
  }, []);

  /* ─── Form View ─── */
  if (viewMode === 'form') {
    return (
      <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900 px-4 pt-4">
        {/* Back */}
        <Pressable
          onPress={() => setViewMode('jobs')}
          className="flex-row items-center mb-4 min-h-[44px]"
          accessibilityLabel={t('webCrawler.backToJobs' as any)}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={20} color="#3b82f6" />
          <Text className="text-blue-600 dark:text-blue-400 ml-1 font-medium">
            {t('webCrawler.backToJobs' as any)}
          </Text>
        </Pressable>

        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {t('webCrawler.startCrawl' as any)}
        </Text>

        {/* URL input */}
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('webCrawler.url' as any)}
        </Text>
        <TextInput
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white mb-4"
          placeholder="https://example.com"
          placeholderTextColor="#9ca3af"
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          keyboardType="url"
          accessibilityLabel={t('webCrawler.url' as any)}
        />

        {/* Max depth slider */}
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('webCrawler.maxDepth' as any)}: {maxDepth}
        </Text>
        <View className="flex-row items-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((val) => (
            <Pressable
              key={val}
              onPress={() => setMaxDepth(val)}
              className={`flex-1 py-2 rounded-lg min-h-[44px] items-center justify-center ${
                maxDepth === val
                  ? 'bg-blue-600 dark:bg-blue-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
              accessibilityLabel={`${t('webCrawler.maxDepth' as any)} ${val}`}
              accessibilityRole="button"
            >
              <Text
                className={`font-bold ${
                  maxDepth === val ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {val}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Max pages */}
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('webCrawler.maxPages' as any)}: {maxPages}
        </Text>
        <View className="flex-row items-center mb-4">
          <Pressable
            onPress={() => setMaxPages(Math.max(1, maxPages - 10))}
            className="bg-gray-200 dark:bg-gray-700 rounded-l-xl px-4 py-3 min-w-[44px] min-h-[44px] items-center justify-center"
            accessibilityLabel={t('webCrawler.decreasePages' as any)}
            accessibilityRole="button"
          >
            <Ionicons name="remove" size={20} color="#6b7280" />
          </Pressable>
          <TextInput
            className="flex-1 bg-white dark:bg-gray-800 border-t border-b border-gray-200 dark:border-gray-700 px-4 py-3 text-center text-base text-gray-900 dark:text-white"
            value={String(maxPages)}
            onChangeText={(v) => {
              const num = parseInt(v, 10);
              if (!isNaN(num) && num >= 1 && num <= 100) setMaxPages(num);
            }}
            keyboardType="number-pad"
            accessibilityLabel={t('webCrawler.maxPages' as any)}
          />
          <Pressable
            onPress={() => setMaxPages(Math.min(100, maxPages + 10))}
            className="bg-gray-200 dark:bg-gray-700 rounded-r-xl px-4 py-3 min-w-[44px] min-h-[44px] items-center justify-center"
            accessibilityLabel={t('webCrawler.increasePages' as any)}
            accessibilityRole="button"
          >
            <Ionicons name="add" size={20} color="#6b7280" />
          </Pressable>
        </View>

        {/* Start button */}
        <Pressable
          onPress={handleStartCrawl}
          disabled={startingCrawl}
          className="bg-green-600 dark:bg-green-500 rounded-xl py-4 items-center min-h-[44px] justify-center mb-8"
          accessibilityLabel={t('webCrawler.startCrawl' as any)}
          accessibilityRole="button"
        >
          {startingCrawl ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base">
              {t('webCrawler.startCrawl' as any)}
            </Text>
          )}
        </Pressable>
      </ScrollView>
    );
  }

  /* ─── Document View ─── */
  if (viewMode === 'document' && selectedDoc) {
    return (
      <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900 px-4 pt-4">
        <Pressable
          onPress={() => setViewMode('detail')}
          className="flex-row items-center mb-4 min-h-[44px]"
          accessibilityLabel={t('webCrawler.backToDetail' as any)}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={20} color="#3b82f6" />
          <Text className="text-blue-600 dark:text-blue-400 ml-1 font-medium">
            {t('webCrawler.backToDetail' as any)}
          </Text>
        </Pressable>

        <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {selectedDoc.title}
        </Text>
        <Text className="text-xs text-gray-400 dark:text-gray-500 mb-4">
          {selectedDoc.url}
        </Text>

        {/* Metadata */}
        {Object.keys(selectedDoc.metadata ?? {}).length > 0 && (
          <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 border border-gray-200 dark:border-gray-700">
            <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              {t('webCrawler.metadata' as any)}
            </Text>
            {Object.entries(selectedDoc.metadata).map(([key, value]) => (
              <View key={key} className="flex-row mb-1">
                <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">
                  {key}:
                </Text>
                <Text className="text-sm text-gray-900 dark:text-white flex-1">{value}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Content */}
        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-8 border border-gray-200 dark:border-gray-700">
          <Text className="text-base text-gray-900 dark:text-white leading-6">
            {selectedDoc.content}
          </Text>
        </View>
      </ScrollView>
    );
  }

  /* ─── Job Detail View ─── */
  if (viewMode === 'detail' && selectedJobId) {
    return (
      <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900 px-4 pt-4">
        <Pressable
          onPress={() => {
            setViewMode('jobs');
            setSelectedJobId(null);
          }}
          className="flex-row items-center mb-4 min-h-[44px]"
          accessibilityLabel={t('webCrawler.backToJobs' as any)}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={20} color="#3b82f6" />
          <Text className="text-blue-600 dark:text-blue-400 ml-1 font-medium">
            {t('webCrawler.backToJobs' as any)}
          </Text>
        </Pressable>

        {detailLoading ? (
          <View className="items-center py-20">
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : jobDetail ? (
          <>
            <Text className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {jobDetail.url}
            </Text>
            <View className="flex-row items-center mb-4">
              {(() => {
                const s = STATUS_STYLES[jobDetail.status] ?? STATUS_STYLES.running;
                return (
                  <View className={`flex-row items-center px-3 py-1 rounded-full ${s.bg}`}>
                    <Ionicons name={s.icon} size={14} color={s.text.includes('blue') ? '#3b82f6' : s.text.includes('green') ? '#22c55e' : '#ef4444'} />
                    <Text className={`text-sm font-medium ml-1 ${s.text}`}>
                      {t(`webCrawler.status.${jobDetail.status}` as any)}
                    </Text>
                  </View>
                );
              })()}
            </View>

            {/* Stats */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 items-center">
                <Text className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {jobDetail.documentsCount ?? 0}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('webCrawler.documents' as any)}
                </Text>
              </View>
              <View className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 items-center">
                <Text className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {jobDetail.pagesCrawled ?? 0}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('webCrawler.pagesCrawled' as any)}
                </Text>
              </View>
            </View>

            {/* Trace logs */}
            {jobDetail.traceLogs?.length > 0 && (
              <View className="mb-4">
                <Text className="text-base font-bold text-gray-900 dark:text-white mb-2">
                  {t('webCrawler.traceLogs' as any)}
                </Text>
                <View className="bg-gray-900 dark:bg-black rounded-xl p-4">
                  {jobDetail.traceLogs.map((log: string, i: number) => (
                    <Text key={i} className="text-xs text-green-400 font-mono mb-1">
                      {log}
                    </Text>
                  ))}
                </View>
              </View>
            )}

            {/* Documents list */}
            {jobDetail.documents?.length > 0 && (
              <View className="mb-8">
                <Text className="text-base font-bold text-gray-900 dark:text-white mb-2">
                  {t('webCrawler.documents' as any)}
                </Text>
                {jobDetail.documents.map((doc: CrawlDocument) => (
                  <Pressable
                    key={doc.id}
                    onPress={() => openDocument(doc)}
                    className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-2 border border-gray-200 dark:border-gray-700 min-h-[44px] justify-center"
                    accessibilityLabel={doc.title}
                    accessibilityRole="button"
                  >
                    <Text className="text-base font-semibold text-gray-900 dark:text-white">
                      {doc.title}
                    </Text>
                    <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1" numberOfLines={1}>
                      {doc.url}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </>
        ) : (
          <View className="items-center py-20">
            <Ionicons name="alert-circle-outline" size={48} color="#9ca3af" />
            <Text className="text-gray-500 dark:text-gray-400 mt-3">
              {t('webCrawler.jobNotFound' as any)}
            </Text>
          </View>
        )}
      </ScrollView>
    );
  }

  /* ─── Jobs List View (default) ─── */
  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* New crawl button */}
      <View className="px-4 pt-4 pb-2">
        <Pressable
          onPress={() => setViewMode('form')}
          className="flex-row items-center justify-center bg-blue-600 dark:bg-blue-500 rounded-xl py-3 min-h-[44px]"
          accessibilityLabel={t('webCrawler.newCrawl' as any)}
          accessibilityRole="button"
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text className="text-white font-bold ml-2">
            {t('webCrawler.newCrawl' as any)}
          </Text>
        </Pressable>
      </View>

      {jobsLoading && jobs.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : jobs.length === 0 ? (
        <View className="flex-1 justify-center items-center py-20">
          <Ionicons name="globe-outline" size={48} color="#9ca3af" />
          <Text className="text-gray-500 dark:text-gray-400 mt-3 text-base">
            {t('webCrawler.noJobs' as any)}
          </Text>
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => {
            const s = STATUS_STYLES[item.status] ?? STATUS_STYLES.running;
            return (
              <Pressable
                onPress={() => openJobDetail(item.id)}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 border border-gray-200 dark:border-gray-700 min-h-[44px]"
                accessibilityLabel={item.url}
                accessibilityRole="button"
              >
                <View className="flex-row items-start justify-between">
                  <Text
                    className="flex-1 text-base font-semibold text-gray-900 dark:text-white mr-2"
                    numberOfLines={1}
                  >
                    {item.url}
                  </Text>
                  <View className={`flex-row items-center px-2 py-1 rounded-full ${s.bg}`}>
                    <Ionicons
                      name={s.icon}
                      size={12}
                      color={item.status === 'running' ? '#3b82f6' : item.status === 'completed' ? '#22c55e' : '#ef4444'}
                    />
                    <Text className={`text-xs font-medium ml-1 ${s.text}`}>
                      {t(`webCrawler.status.${item.status}` as any)}
                    </Text>
                  </View>
                </View>
                <View className="flex-row mt-2">
                  <Text className="text-xs text-gray-400 dark:text-gray-500">
                    {t('webCrawler.documents' as any)}: {item.documentsCount}
                  </Text>
                  <Text className="text-xs text-gray-400 dark:text-gray-500 ml-4">
                    {t('webCrawler.pagesCrawled' as any)}: {item.pagesCrawled}
                  </Text>
                </View>
                <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}
