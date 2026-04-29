jest.mock('@mycircle/shared', () => ({
  useTranslation: () => ({ t: (key: string) => key, locale: 'en', setLocale: jest.fn() }),
  safeGetItem: jest.fn(() => null),
  safeSetItem: jest.fn(),
  eventBus: { subscribe: jest.fn(() => jest.fn()), publish: jest.fn() },
  MFEvents: {},
  StorageKeys: {},
  AppEvents: {},
}));

import RadioStationScreen from '../RadioStationScreen';

describe('RadioStationScreen', () => {
  it('exports a React component', () => {
    expect(RadioStationScreen).toBeDefined();
    expect(typeof RadioStationScreen).toBe('function');
  });
});
