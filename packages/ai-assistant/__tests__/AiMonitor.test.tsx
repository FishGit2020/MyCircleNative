import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock @mycircle/shared
jest.mock('@mycircle/shared', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  GET_AI_USAGE_SUMMARY: 'mock-query',
  GET_AI_RECENT_LOGS: 'mock-query',
  GET_OLLAMA_STATUS: 'mock-query',
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock @apollo/client
jest.mock('@apollo/client', () => ({
  useQuery: () => ({ data: null, loading: false, refetch: jest.fn() }),
}));

import AiMonitor from '../src/components/AiMonitor';

describe('AiMonitor', () => {
  it('renders tabs', () => {
    const { getByText } = render(<AiMonitor />);
    expect(getByText('monitor.usage')).toBeTruthy();
    expect(getByText('monitor.logs')).toBeTruthy();
    expect(getByText('monitor.ollama')).toBeTruthy();
  });

  it('shows usage stats by default', () => {
    const { getByText } = render(<AiMonitor />);
    expect(getByText('monitor.totalRequests')).toBeTruthy();
  });

  it('switches to logs tab', () => {
    const { getByText } = render(<AiMonitor />);
    fireEvent.press(getByText('monitor.logs'));
    expect(getByText('monitor.noLogs')).toBeTruthy();
  });

  it('switches to ollama tab', () => {
    const { getByText, getAllByText } = render(<AiMonitor />);
    fireEvent.press(getByText('monitor.ollama'));
    // Tab label + content both show 'monitor.ollama'
    expect(getAllByText('monitor.ollama').length).toBeGreaterThanOrEqual(1);
    expect(getByText('monitor.ollamaStopped')).toBeTruthy();
  });
});
