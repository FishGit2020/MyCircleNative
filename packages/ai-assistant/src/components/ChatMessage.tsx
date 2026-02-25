import { useState, useCallback, Fragment } from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from '@mycircle/shared';
import ToolCallDisplay from './ToolCallDisplay';
import type { ChatMessage as ChatMessageType } from '../hooks/useAiChat';

/* ── Props ────────────────────────────────────────────────── */

interface ChatMessageProps {
  message: ChatMessageType;
  debugMode?: boolean;
}

/* ── Lightweight markdown renderer ────────────────────────── */

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  // regex: code, bold, italic (in priority order)
  const regex = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <Text key={`t-${lastIndex}`}>{text.slice(lastIndex, match.index)}</Text>,
      );
    }

    if (match[1]) {
      // Inline code
      parts.push(
        <Text
          key={`c-${match.index}`}
          className="bg-gray-200 dark:bg-gray-600 px-1 rounded font-mono text-xs"
        >
          {match[1].slice(1, -1)}
        </Text>,
      );
    } else if (match[2]) {
      // Bold
      parts.push(
        <Text key={`b-${match.index}`} className="font-bold">
          {match[2].slice(2, -2)}
        </Text>,
      );
    } else if (match[3]) {
      // Italic
      parts.push(
        <Text key={`i-${match.index}`} className="italic">
          {match[3].slice(1, -1)}
        </Text>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(<Text key={`t-${lastIndex}`}>{text.slice(lastIndex)}</Text>);
  }

  if (parts.length === 0) return <Text>{text}</Text>;
  if (parts.length === 1) return parts[0];
  return <Text>{parts}</Text>;
}

function MarkdownText({ content }: { content: string }) {
  // Split into code blocks and text segments
  const segments = content.split(/(```[\s\S]*?```)/g);

  return (
    <>
      {segments.map((segment, i) => {
        // Code block
        if (segment.startsWith('```') && segment.endsWith('```')) {
          const inner = segment.slice(3, -3);
          const firstNewline = inner.indexOf('\n');
          const code = firstNewline > -1 ? inner.slice(firstNewline + 1) : inner;
          return (
            <View
              key={i}
              className="my-2 p-3 rounded-lg bg-gray-800 dark:bg-gray-900"
            >
              <Text
                className="text-gray-100 text-xs font-mono"
                selectable
              >
                {code}
              </Text>
            </View>
          );
        }

        // Regular text
        const lines = segment.split('\n');
        return (
          <Fragment key={i}>
            {lines.map((line, j) => {
              const trimmed = line.trimStart();

              // Bullet list items
              if (/^[-*]\s+/.test(trimmed)) {
                return (
                  <View key={j} className="flex-row gap-1.5 ml-2">
                    <Text className="text-gray-400 dark:text-gray-500">
                      {'\u2022'}
                    </Text>
                    <Text className="flex-1 text-sm text-gray-900 dark:text-white">
                      {renderInline(trimmed.replace(/^[-*]\s+/, ''))}
                    </Text>
                  </View>
                );
              }

              // Numbered list items
              if (/^\d+[.)]\s+/.test(trimmed)) {
                const match = trimmed.match(/^(\d+[.)])\s+(.*)/);
                if (match) {
                  return (
                    <View key={j} className="flex-row gap-1.5 ml-2">
                      <Text className="text-gray-400 dark:text-gray-500 min-w-[20px] text-right text-sm">
                        {match[1]}
                      </Text>
                      <Text className="flex-1 text-sm text-gray-900 dark:text-white">
                        {renderInline(match[2])}
                      </Text>
                    </View>
                  );
                }
              }

              // Empty line = paragraph break
              if (trimmed === '') {
                return <View key={j} className="h-2" />;
              }

              // Regular paragraph
              return (
                <Text key={j} className="text-sm text-gray-900 dark:text-white">
                  {renderInline(line)}
                </Text>
              );
            })}
          </Fragment>
        );
      })}
    </>
  );
}

/* ── ChatMessage component ────────────────────────────────── */

export default function ChatMessage({ message, debugMode }: ChatMessageProps) {
  const { t } = useTranslation();
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  }, [message.content]);

  return (
    <View className={`flex-row ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <View
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-blue-500 rounded-br-md'
            : 'bg-gray-100 dark:bg-gray-700 rounded-bl-md'
        }`}
      >
        {/* Role label + copy button */}
        <View className="flex-row items-center justify-between gap-2 mb-1">
          <Text
            className={`text-xs font-medium ${
              isUser
                ? 'text-white/70'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {isUser ? t('ai.you') : t('ai.assistant')}
          </Text>
          {!isUser && (
            <Pressable
              onPress={handleCopy}
              accessibilityLabel={copied ? t('ai.copied') : t('ai.copyMessage')}
              accessibilityRole="button"
              className="p-1"
              style={{ minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
            >
              <Text className="text-xs text-gray-400 dark:text-gray-500">
                {copied ? '\u2705' : '\uD83D\uDCCB'}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Message content */}
        {isUser ? (
          <Text className="text-sm text-white">{message.content}</Text>
        ) : (
          <MarkdownText content={message.content} />
        )}

        {/* Tool calls */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <ToolCallDisplay toolCalls={message.toolCalls} debugMode={debugMode} />
        )}
      </View>
    </View>
  );
}
