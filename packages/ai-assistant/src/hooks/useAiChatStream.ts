import { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage } from './useAiChat';

/* ── Constants ───────────────────────────────────────────── */

/** Characters revealed per tick during typewriter animation. */
const CHARS_PER_TICK = 3;
/** Milliseconds between each typewriter tick. */
const TICK_INTERVAL_MS = 18;

/* ── Types ───────────────────────────────────────────────── */

export interface TypewriterState {
  /** The message ID currently being animated (null when idle). */
  activeMessageId: string | null;
  /** How many characters of the full content to display. */
  displayedLength: number;
  /** Whether the animation is still running. */
  isTyping: boolean;
}

/* ── Hook ────────────────────────────────────────────────── */

/**
 * Provides a typewriter (character-by-character reveal) effect for
 * assistant messages.  After the full response arrives from the
 * AI_CHAT mutation the hook progressively reveals characters using
 * `setInterval`.
 *
 * Usage:
 * ```
 * const { startTypewriter, getDisplayedContent, isTypingMessage, skipTypewriter }
 *   = useAiChatStream();
 * ```
 */
export function useAiChatStream() {
  const [twState, setTwState] = useState<TypewriterState>({
    activeMessageId: null,
    displayedLength: 0,
    isTyping: false,
  });

  const fullContentRef = useRef<string>('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Cleanup on unmount ─────────────────────────────────── */

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  /* ── Start typewriter for a new assistant message ──────── */

  const startTypewriter = useCallback((messageId: string, fullContent: string) => {
    // Clear any running animation
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    fullContentRef.current = fullContent;

    setTwState({
      activeMessageId: messageId,
      displayedLength: 0,
      isTyping: true,
    });

    intervalRef.current = setInterval(() => {
      setTwState((prev) => {
        const nextLen = prev.displayedLength + CHARS_PER_TICK;

        if (nextLen >= fullContentRef.current.length) {
          // Animation complete
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return {
            activeMessageId: null,
            displayedLength: fullContentRef.current.length,
            isTyping: false,
          };
        }

        return { ...prev, displayedLength: nextLen };
      });
    }, TICK_INTERVAL_MS);
  }, []);

  /* ── Skip / finish the current animation immediately ───── */

  const skipTypewriter = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTwState({
      activeMessageId: null,
      displayedLength: fullContentRef.current.length,
      isTyping: false,
    });
  }, []);

  /* ── Query helpers ─────────────────────────────────────── */

  /**
   * Returns the content that should be rendered for a given message.
   * If the message is currently being animated, returns only the
   * revealed portion; otherwise returns the full content.
   */
  const getDisplayedContent = useCallback(
    (message: ChatMessage): string => {
      if (
        twState.activeMessageId === message.id &&
        twState.isTyping
      ) {
        return message.content.slice(0, twState.displayedLength);
      }
      return message.content;
    },
    [twState.activeMessageId, twState.displayedLength, twState.isTyping],
  );

  /** Whether the given message is currently being typewriter-animated. */
  const isTypingMessage = useCallback(
    (messageId: string): boolean => {
      return twState.activeMessageId === messageId && twState.isTyping;
    },
    [twState.activeMessageId, twState.isTyping],
  );

  return {
    startTypewriter,
    skipTypewriter,
    getDisplayedContent,
    isTypingMessage,
    isTyping: twState.isTyping,
  };
}
