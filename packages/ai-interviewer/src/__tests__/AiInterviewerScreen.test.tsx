jest.mock('@mycircle/shared', () => ({
  useTranslation: () => ({ t: (key: string) => key, locale: 'en', setLocale: jest.fn() }),
  safeGetItem: jest.fn(() => null),
  safeSetItem: jest.fn(),
  eventBus: { subscribe: jest.fn(() => jest.fn()), publish: jest.fn() },
  StorageKeys: {},
  AppEvents: {},
}));

jest.mock('../hooks/useInterviewChat', () => ({
  useInterviewChat: () => ({
    messages: [],
    sending: false,
    sendMessage: jest.fn(),
    reset: jest.fn(),
  }),
}));

import AiInterviewerScreen from '../components/AiInterviewerScreen';

describe('AiInterviewerScreen', () => {
  it('exports a React component', () => {
    expect(AiInterviewerScreen).toBeDefined();
    expect(typeof AiInterviewerScreen).toBe('function');
  });
});
