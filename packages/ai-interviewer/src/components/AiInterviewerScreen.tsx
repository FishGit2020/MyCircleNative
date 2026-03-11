import { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@mycircle/shared';
import { useInterviewChat } from '../hooks/useInterviewChat';
import type { ChatMessage } from '../hooks/useInterviewChat';

export default function AiInterviewerScreen() {
  const { t } = useTranslation();
  const [question, setQuestionLocal] = useState('');
  const [document, setDocumentLocal] = useState('');
  const [interviewActive, setInterviewActive] = useState(false);
  const [input, setInput] = useState('');
  const [showQuestion, setShowQuestion] = useState(true);
  const scrollRef = useRef<ScrollView>(null);

  const {
    messages,
    loading,
    error,
    question: persistedQuestion,
    document: persistedDocument,
    hasPersistedSession,
    saveStatus,
    setQuestion,
    setDocument,
    sendMessage,
    startInterview,
    repeatQuestion,
    requestHint,
    endInterview,
    clearChat,
  } = useInterviewChat();

  useEffect(() => {
    if (hasPersistedSession) {
      setQuestionLocal(persistedQuestion);
      setDocumentLocal(persistedDocument);
      setInterviewActive(true);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, loading]);

  const handleQuestionChange = useCallback((text: string) => {
    setQuestionLocal(text);
    setQuestion(text);
  }, [setQuestion]);

  const handleDocumentChange = useCallback((text: string) => {
    setDocumentLocal(text);
    setDocument(text);
  }, [setDocument]);

  const handleStart = useCallback(() => {
    if (!question.trim()) return;
    setInterviewActive(true);
    setShowQuestion(false);
    startInterview(question);
  }, [question, startInterview]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || loading || !interviewActive) return;
    sendMessage(trimmed);
    setInput('');
  }, [input, loading, interviewActive, sendMessage]);

  const handleNewInterview = useCallback(() => {
    clearChat();
    setInterviewActive(false);
    setQuestionLocal('');
    setDocumentLocal('');
    setShowQuestion(true);
  }, [clearChat]);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white dark:bg-gray-900"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('aiInterviewer.title' as any)}
        </Text>
        <View className="flex-row items-center gap-2">
          {saveStatus === 'saving' && (
            <Text className="text-xs text-gray-400 dark:text-gray-500">
              {t('aiInterviewer.saving' as any)}
            </Text>
          )}
          {saveStatus === 'saved' && (
            <Text className="text-xs text-green-500 dark:text-green-400">
              {t('aiInterviewer.saved' as any)}
            </Text>
          )}
          {interviewActive && (
            <Pressable
              onPress={handleNewInterview}
              className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg min-w-[44px] min-h-[44px] items-center justify-center"
              accessibilityRole="button"
              accessibilityLabel={t('aiInterviewer.newInterview' as any)}
            >
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('aiInterviewer.newInterview' as any)}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Question setup (collapsible) */}
      {showQuestion && !interviewActive && (
        <View className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            {t('aiInterviewer.questionSection' as any)}
          </Text>
          <TextInput
            value={question}
            onChangeText={handleQuestionChange}
            placeholder={t('aiInterviewer.questionPlaceholder' as any)}
            placeholderTextColor="#9ca3af"
            multiline
            className="h-24 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm"
            accessibilityLabel={t('aiInterviewer.questionLabel' as any)}
          />
          <Pressable
            onPress={handleStart}
            disabled={!question.trim() || loading}
            className={`mt-3 rounded-lg py-3 items-center min-h-[44px] justify-center ${
              !question.trim() || loading
                ? 'bg-green-300 dark:bg-green-800'
                : 'bg-green-600 dark:bg-green-500 active:bg-green-700'
            }`}
            accessibilityRole="button"
            accessibilityLabel={t('aiInterviewer.startInterview' as any)}
          >
            <Text className="text-white font-semibold text-sm">
              {t('aiInterviewer.startInterview' as any)}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Working document toggle (during interview) */}
      {interviewActive && (
        <Pressable
          onPress={() => setShowQuestion(!showQuestion)}
          className="flex-row items-center px-4 py-2 border-b border-gray-200 dark:border-gray-700"
          accessibilityRole="button"
        >
          <Ionicons
            name={showQuestion ? 'chevron-down' : 'chevron-forward'}
            size={16}
            color="#6b7280"
          />
          <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">
            {t('aiInterviewer.workingDocument' as any)}
          </Text>
        </Pressable>
      )}
      {interviewActive && showQuestion && (
        <View className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 max-h-40">
          <TextInput
            value={document}
            onChangeText={handleDocumentChange}
            placeholder={t('aiInterviewer.documentPlaceholder' as any)}
            placeholderTextColor="#9ca3af"
            multiline
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm font-mono"
            accessibilityLabel={t('aiInterviewer.documentLabel' as any)}
          />
        </View>
      )}

      {/* Chat messages */}
      <ScrollView
        ref={scrollRef}
        className="flex-1 px-4 py-3"
        contentContainerClassName="gap-3"
        keyboardShouldPersistTaps="handled"
      >
        {messages.length === 0 && !loading && (
          <View className="items-center justify-center py-12">
            <Ionicons name="code-slash-outline" size={48} color="#9ca3af" />
            <Text className="text-gray-400 dark:text-gray-500 text-sm mt-3 text-center">
              {interviewActive
                ? t('aiInterviewer.waitingForResponse' as any)
                : t('aiInterviewer.startPrompt' as any)}
            </Text>
          </View>
        )}

        {messages.map((msg: ChatMessage) => (
          <View
            key={msg.id}
            className={`flex-row ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <View
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-blue-600 dark:bg-blue-500'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              <Text
                className={`text-sm leading-5 ${
                  msg.role === 'user'
                    ? 'text-white'
                    : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                {msg.content}
              </Text>
            </View>
          </View>
        ))}

        {loading && (
          <View className="flex-row justify-start">
            <View className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2.5">
              <ActivityIndicator size="small" color="#6b7280" />
            </View>
          </View>
        )}

        {error && (
          <Text className="text-center text-red-500 dark:text-red-400 text-sm py-1">
            {error}
          </Text>
        )}
      </ScrollView>

      {/* Action buttons (during interview) */}
      {interviewActive && (
        <View className="flex-row gap-2 px-4 py-2 border-t border-gray-200 dark:border-gray-700">
          <Pressable
            onPress={() => repeatQuestion()}
            disabled={loading}
            className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg min-h-[44px] items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel={t('aiInterviewer.repeatQuestion' as any)}
          >
            <Text className="text-xs font-medium text-gray-700 dark:text-gray-200">
              {t('aiInterviewer.repeatQuestion' as any)}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => requestHint()}
            disabled={loading}
            className="px-3 py-2 bg-yellow-500 dark:bg-yellow-600 rounded-lg min-h-[44px] items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel={t('aiInterviewer.hint' as any)}
          >
            <Text className="text-xs font-medium text-white">
              {t('aiInterviewer.hint' as any)}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => endInterview()}
            disabled={loading}
            className="px-3 py-2 bg-red-600 dark:bg-red-500 rounded-lg min-h-[44px] items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel={t('aiInterviewer.endInterview' as any)}
          >
            <Text className="text-xs font-medium text-white">
              {t('aiInterviewer.endInterview' as any)}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Chat input */}
      {interviewActive && (
        <View className="flex-row items-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={t('aiInterviewer.inputPlaceholder' as any)}
            placeholderTextColor="#9ca3af"
            multiline
            editable={interviewActive && !loading}
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm max-h-24"
            accessibilityLabel={t('aiInterviewer.inputLabel' as any)}
          />
          <Pressable
            onPress={handleSend}
            disabled={!input.trim() || loading || !interviewActive}
            className={`rounded-lg px-4 py-2.5 min-w-[44px] min-h-[44px] items-center justify-center ${
              !input.trim() || loading
                ? 'bg-blue-300 dark:bg-blue-800'
                : 'bg-blue-600 dark:bg-blue-500 active:bg-blue-700'
            }`}
            accessibilityRole="button"
            accessibilityLabel={t('aiInterviewer.send' as any)}
          >
            <Ionicons name="send" size={18} color="#ffffff" />
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
