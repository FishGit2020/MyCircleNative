jest.mock('@mycircle/shared', () => ({
  useTranslation: () => ({ t: (key: string) => key, locale: 'en', setLocale: jest.fn() }),
  safeGetItem: jest.fn(() => null),
  safeSetItem: jest.fn(),
  eventBus: { subscribe: jest.fn(() => jest.fn()), publish: jest.fn() },
  StorageKeys: {},
  AppEvents: {},
  createLogger: () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() }),
}));

import DocScannerScreen from '../DocScannerScreen';

describe('DocScannerScreen', () => {
  it('exports a React component', () => {
    expect(DocScannerScreen).toBeDefined();
    expect(typeof DocScannerScreen).toBe('function');
  });
});
