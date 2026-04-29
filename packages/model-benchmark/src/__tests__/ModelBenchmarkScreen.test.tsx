jest.mock('@mycircle/shared', () => ({
  useTranslation: () => ({ t: (key: string) => key, locale: 'en', setLocale: jest.fn() }),
  safeGetJSON: jest.fn(() => null),
  safeSetItem: jest.fn(),
  StorageKeys: {},
}));

jest.mock('../hooks/useBenchmark', () => ({
  useBenchmark: () => ({ run: jest.fn(), running: false, result: null }),
}));
jest.mock('../hooks/useEndpoints', () => ({
  useEndpoints: () => ({ endpoints: [], addEndpoint: jest.fn(), removeEndpoint: jest.fn() }),
}));
jest.mock('../hooks/useBenchmarkHistory', () => ({
  useBenchmarkHistory: () => ({ history: [], clear: jest.fn() }),
}));
jest.mock('../components/PromptPicker', () => 'PromptPicker');
jest.mock('../components/BenchmarkResults', () => 'BenchmarkResults');
jest.mock('../components/BenchmarkHistory', () => 'BenchmarkHistory');
jest.mock('../components/EndpointManager', () => 'EndpointManager');
jest.mock('../components/ResultsDashboard', () => 'ResultsDashboard');

import ModelBenchmarkScreen from '../ModelBenchmarkScreen';

describe('ModelBenchmarkScreen', () => {
  it('exports a React component', () => {
    expect(ModelBenchmarkScreen).toBeDefined();
    expect(typeof ModelBenchmarkScreen).toBe('function');
  });
});
