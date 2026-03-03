import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import {
  useTranslation,
  safeGetItem,
  safeSetItem,
  StorageKeys,
} from '@mycircle/shared';
import { useAiChat } from './hooks/useAiChat';
import { ChatMessage, ChatInput, SuggestedPrompts } from './components';
import AiMonitor from './components/AiMonitor';

/* ── Component ────────────────────────────────────────────── */

export default function AiAssistantScreen() {
  const { t } = useTranslation();
  const { messages, loading, error, canRetry, sendMessage, clearChat, retry } =
    useAiChat();

  const [showMonitor, setShowMonitor] = useState(false);
  const [debugMode, setDebugMode] = useState(() => {
    return safeGetItem(StorageKeys.AI_DEBUG_MODE) === 'true';
  });

  const toggleDebug = useCallback(() => {
    setDebugMode((prev) => {
      const next = !prev;
      safeSetItem(StorageKeys.AI_DEBUG_MODE, String(next));
      return next;
    });
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: (typeof messages)[0] }) => (
      <ChatMessage message={item} debugMode={debugMode} />
    ),
    [debugMode],
  );

  const keyExtractor = useCallback(
    (item: (typeof messages)[0]) => item.id,
    [],
  );

  const handleSuggestedPrompt = useCallback(
    (prompt: string) => {
      sendMessage(prompt);
    },
    [sendMessage],
  );

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-800 dark:text-white">
              {'\uD83D\uDCAC'} {t('ai.title')}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {t('ai.subtitle')}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            {/* Monitor toggle */}
            <Pressable
              onPress={() => setShowMonitor(!showMonitor)}
              accessibilityLabel={t('monitor.title')}
              accessibilityRole="button"
              className={`px-2 py-1 rounded ${
                showMonitor
                  ? 'bg-blue-100 dark:bg-blue-900/30'
                  : 'bg-transparent'
              }`}
              style={{ minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
            >
              <Text
                className={`text-xs ${
                  showMonitor
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {'\u{1F4CA}'}
              </Text>
            </Pressable>
            {/* Debug toggle */}
            <Pressable
              onPress={toggleDebug}
              accessibilityLabel={t('ai.debugToggle')}
              accessibilityRole="button"
              className={`px-2 py-1 rounded ${
                debugMode
                  ? 'bg-amber-100 dark:bg-amber-900/30'
                  : 'bg-transparent'
              }`}
              style={{ minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
            >
              <Text
                className={`text-xs ${
                  debugMode
                    ? 'text-amber-700 dark:text-amber-300'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {'</>'}
              </Text>
            </Pressable>
            {/* Clear chat */}
            {messages.length > 0 && (
              <Pressable
                onPress={clearChat}
                accessibilityLabel={t('ai.clearChat')}
                accessibilityRole="button"
                style={{ minHeight: 44, justifyContent: 'center' }}
              >
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {t('ai.clearChat')}
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Monitor view */}
        {showMonitor ? (
          <ScrollView className="flex-1 px-4 py-4">
            <AiMonitor />
          </ScrollView>
        ) : messages.length === 0 && !loading ? (
          <SuggestedPrompts onSelect={handleSuggestedPrompt} />
        ) : (
          <FlatList
            data={messages}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            inverted
            contentContainerStyle={{
              flexDirection: 'column-reverse',
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            accessibilityLabel={t('ai.chatMessages')}
            accessibilityRole="list"
            ListHeaderComponent={
              loading ? (
                <View className="flex-row justify-start mb-3">
                  <View className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-sm text-gray-500 dark:text-gray-400">
                        {'\u2022\u2022\u2022'} {t('ai.thinking')}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : null
            }
          />
        )}

        {/* Error display with retry */}
        {error && (
          <View className="mx-4 mb-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex-row items-center justify-between gap-2">
            <Text className="text-red-600 dark:text-red-400 text-sm flex-1">
              {error}
            </Text>
            {canRetry && (
              <Pressable
                onPress={retry}
                accessibilityLabel={t('ai.retry')}
                accessibilityRole="button"
                style={{ minHeight: 44, justifyContent: 'center' }}
              >
                <Text className="text-sm font-medium text-red-600 dark:text-red-400 underline">
                  {t('ai.retry')}
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Input */}
        <ChatInput onSend={sendMessage} disabled={loading} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
