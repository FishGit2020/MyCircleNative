import React from 'react';
import { render, screen } from '@testing-library/react-native';

// Mock the shared package
jest.mock('@mycircle/shared', () => ({
  useTranslation: () => ({ t: (key: string) => key, locale: 'en', setLocale: jest.fn() }),
  safeGetItem: jest.fn(() => null),
  safeSetItem: jest.fn(),
  safeGetJSON: jest.fn(() => null),
  safeRemoveItem: jest.fn(),
  eventBus: { subscribe: jest.fn(() => jest.fn()), publish: jest.fn() },
  StorageKeys: {
    AI_DEBUG_MODE: 'aiDebugMode',
  },
  AppEvents: {},
}));

// Mock the hooks
jest.mock('../hooks/useAiChat', () => ({
  useAiChat: jest.fn(() => ({
    messages: [],
    loading: false,
    error: null,
    canRetry: false,
    sendMessage: jest.fn(),
    clearChat: jest.fn(),
    retry: jest.fn(),
  })),
}));

// Mock the sub-components - use require inside factory
jest.mock('../components', () => {
  const { View, Text } = require('react-native');
  return {
    ChatMessage: () => 'ChatMessage',
    ChatInput: () => require('react').createElement(View, { testID: 'chat-input' }),
    SuggestedPrompts: () => require('react').createElement(Text, {}, 'SuggestedPrompts'),
  };
});

import AiAssistantScreen from '../AiAssistantScreen';

describe('AiAssistantScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders suggested prompts when chat is empty', () => {
    render(<AiAssistantScreen />);

    // Should show the title
    expect(screen.getByText('ai.title', { exact: false })).toBeTruthy();
    // Should show suggested prompts when there are no messages
    expect(screen.getByText('SuggestedPrompts')).toBeTruthy();
  });
});
