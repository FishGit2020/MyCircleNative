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

jest.mock('expo-file-system', () => ({
  documentDirectory: '/tmp/',
  downloadAsync: jest.fn(),
  getInfoAsync: jest.fn(),
}));

import DigitalLibraryScreen from '../DigitalLibraryScreen';

describe('DigitalLibraryScreen', () => {
  it('exports a React component', () => {
    expect(DigitalLibraryScreen).toBeDefined();
    expect(typeof DigitalLibraryScreen).toBe('function');
  });
});
