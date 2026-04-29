jest.mock('@mycircle/shared', () => ({
  useTranslation: () => ({ t: (key: string) => key, locale: 'en', setLocale: jest.fn() }),
  eventBus: { subscribe: jest.fn(() => jest.fn()), publish: jest.fn() },
  AppEvents: {},
}));

import PollSystemScreen from '../PollSystemScreen';

describe('PollSystemScreen', () => {
  it('exports a React component', () => {
    expect(PollSystemScreen).toBeDefined();
    expect(typeof PollSystemScreen).toBe('function');
  });
});
