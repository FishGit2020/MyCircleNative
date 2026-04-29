jest.mock('@mycircle/shared', () => ({
  useTranslation: () => ({ t: (key: string) => key, locale: 'en', setLocale: jest.fn() }),
  safeGetItem: jest.fn(() => null),
  safeSetItem: jest.fn(),
  eventBus: { subscribe: jest.fn(() => jest.fn()), publish: jest.fn() },
  StorageKeys: {},
  AppEvents: {},
  createLogger: () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() }),
}));

jest.mock('../../../../src/contexts', () => ({
  useTheme: () => ({ theme: 'light' }),
}));

jest.mock('react-native-webview', () => ({ WebView: 'WebView' }));

import HikingMapScreen from '../HikingMapScreen';

describe('HikingMapScreen', () => {
  it('exports a React component', () => {
    expect(HikingMapScreen).toBeDefined();
    expect(typeof HikingMapScreen).toBe('function');
  });
});
