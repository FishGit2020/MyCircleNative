jest.mock('@mycircle/shared', () => ({
  useTranslation: () => ({ t: (key: string) => key, locale: 'en', setLocale: jest.fn() }),
  safeGetItem: jest.fn(() => null),
  safeSetItem: jest.fn(),
  eventBus: { subscribe: jest.fn(() => jest.fn()), publish: jest.fn() },
  StorageKeys: {},
  AppEvents: {},
}));

import FamilyGamesScreen from '../FamilyGamesScreen';

describe('FamilyGamesScreen', () => {
  it('exports a React component', () => {
    expect(FamilyGamesScreen).toBeDefined();
    expect(typeof FamilyGamesScreen).toBe('function');
  });
});
