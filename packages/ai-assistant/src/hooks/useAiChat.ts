import { useState, useCallback, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter } from 'expo-router';
import {
  AI_CHAT,
  safeGetItem,
  safeSetItem,
  safeRemoveItem,
  safeGetJSON,
  eventBus,
  AppEvents,
  StorageKeys,
} from '@mycircle/shared';

/* ── Types ────────────────────────────────────────────────── */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCall[];
  timestamp: number;
}

export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
  result?: string;
}

export interface AiAction {
  type: string;
  payload: Record<string, unknown>;
}

interface AiChatState {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  lastUserContent: string | null;
}

/* ── Helpers ──────────────────────────────────────────────── */

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadMessages(): ChatMessage[] {
  try {
    const stored = safeGetItem(StorageKeys.AI_CHAT_HISTORY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    /* ignore */
  }
  return [];
}

function saveMessages(messages: ChatMessage[]) {
  try {
    // Keep at most 50 messages to avoid bloating AsyncStorage
    const toSave = messages.slice(-50);
    safeSetItem(StorageKeys.AI_CHAT_HISTORY, JSON.stringify(toSave));
  } catch {
    /* ignore */
  }
}

/** Gather user context from AsyncStorage for context-aware AI. */
function gatherUserContext(): Record<string, unknown> {
  const ctx: Record<string, unknown> = {};
  try {
    // Stock watchlist
    const watchlist = safeGetItem(StorageKeys.STOCK_WATCHLIST);
    if (watchlist) {
      const parsed = JSON.parse(watchlist);
      if (Array.isArray(parsed) && parsed.length > 0) {
        ctx.stockWatchlist = parsed
          .map((w: any) => w.symbol || w)
          .slice(0, 20);
      }
    }

    // Podcast subscriptions
    const subs = safeGetItem(StorageKeys.PODCAST_SUBSCRIPTIONS);
    if (subs) {
      const parsed = JSON.parse(subs);
      if (Array.isArray(parsed) && parsed.length > 0) {
        ctx.podcastSubscriptions = parsed.length;
      }
    }

    // Favorite cities — stored under RECENT_CITIES in the native version
    const favs = safeGetItem(StorageKeys.RECENT_CITIES);
    if (favs) {
      const parsed = JSON.parse(favs);
      if (Array.isArray(parsed) && parsed.length > 0) {
        ctx.favoriteCities = parsed
          .map((c: any) => c.name || c)
          .slice(0, 10);
      }
    }

    // User preferences
    const locale = safeGetItem(StorageKeys.LOCALE);
    if (locale) ctx.locale = locale;
    const tempUnit = safeGetItem(StorageKeys.TEMP_UNIT);
    if (tempUnit) ctx.tempUnit = tempUnit;
    const theme = safeGetItem(StorageKeys.THEME);
    if (theme) ctx.theme = theme;
  } catch {
    /* ignore storage errors */
  }
  return ctx;
}

/* ── Path mapping for navigation actions ─────────────────── */

const PATH_MAP: Record<string, string> = {
  '/podcasts': '/(tabs)/podcasts',
  '/weather': '/(tabs)/weather',
  '/stocks': '/(tabs)/stocks',
  '/bible': '/(tabs)/bible',
  '/worship': '/worship',
  '/notebook': '/notebook',
  '/flashcards': '/flashcards',
  '/ai': '/ai-assistant',
};

/* ── Hook ─────────────────────────────────────────────────── */

export function useAiChat() {
  const router = useRouter();

  const [state, setState] = useState<AiChatState>(() => ({
    messages: loadMessages(),
    loading: false,
    error: null,
    lastUserContent: null,
  }));

  const abortRef = useRef<AbortController | null>(null);

  const [aiChatMutation] = useMutation(AI_CHAT);

  /** Handle frontend actions returned by the AI. */
  const handleActions = useCallback(
    (actions: AiAction[]) => {
      for (const action of actions) {
        switch (action.type) {
          case 'navigateTo': {
            const targetPath = action.payload.path as string;
            const mapped = PATH_MAP[targetPath] || targetPath;
            router.push(mapped as any);
            break;
          }
          case 'addFlashcard':
            eventBus.publish('flashcard-add', action.payload);
            break;
          case 'addBookmark':
            eventBus.publish(AppEvents.BIBLE_BOOKMARKS_CHANGED, action.payload);
            break;
          case 'listFlashcards':
            eventBus.publish('flashcards-list', action.payload);
            break;
        }
      }
    },
    [router],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      const userMessage: ChatMessage = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      setState((prev) => {
        const updated = [...prev.messages, userMessage];
        saveMessages(updated);
        return {
          ...prev,
          messages: updated,
          loading: true,
          error: null,
          lastUserContent: content,
        };
      });

      // Abort any in-flight request
      if (abortRef.current) {
        abortRef.current.abort();
      }
      abortRef.current = new AbortController();

      try {
        const history = state.messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const userContext = gatherUserContext();

        const { data, errors } = await aiChatMutation({
          variables: {
            message: content,
            history,
            context: userContext,
          },
          context: {
            fetchOptions: { signal: abortRef.current.signal },
          },
        });

        if (errors && errors.length > 0) {
          throw new Error(errors[0].message);
        }

        const result = data?.aiChat;
        if (!result) {
          throw new Error('No response from AI');
        }

        // Handle frontend actions
        if (result.actions && result.actions.length > 0) {
          handleActions(result.actions);
        }

        const assistantMessage: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: result.response,
          toolCalls: result.toolCalls || undefined,
          timestamp: Date.now(),
        };

        setState((prev) => {
          const updated = [...prev.messages, assistantMessage];
          saveMessages(updated);
          return {
            ...prev,
            messages: updated,
            loading: false,
            lastUserContent: null,
          };
        });

        eventBus.publish(AppEvents.AI_CHAT_UPDATED);
      } catch (err: unknown) {
        // Ignore abort errors
        if (
          err instanceof Error &&
          err.name === 'AbortError'
        ) {
          return;
        }
        const message =
          err instanceof Error ? err.message : 'Failed to get response';
        setState((prev) => ({ ...prev, loading: false, error: message }));
      }
    },
    [state.messages, aiChatMutation, handleActions],
  );

  const clearChat = useCallback(() => {
    setState({
      messages: [],
      loading: false,
      error: null,
      lastUserContent: null,
    });
    safeRemoveItem(StorageKeys.AI_CHAT_HISTORY);
    eventBus.publish(AppEvents.AI_CHAT_UPDATED);
  }, []);

  const retry = useCallback(() => {
    if (state.lastUserContent) {
      const lastContent = state.lastUserContent;
      // Remove the last user message (will be re-added by sendMessage)
      setState((prev) => {
        const messages = prev.messages.slice(0, -1);
        saveMessages(messages);
        return { ...prev, messages, error: null };
      });
      // Small delay so the state update lands before sendMessage reads state.messages
      setTimeout(() => {
        sendMessage(lastContent);
      }, 0);
    }
  }, [state.lastUserContent, sendMessage]);

  return {
    messages: state.messages,
    loading: state.loading,
    error: state.error,
    canRetry: !!state.lastUserContent && !state.loading,
    sendMessage,
    clearChat,
    retry,
  };
}
