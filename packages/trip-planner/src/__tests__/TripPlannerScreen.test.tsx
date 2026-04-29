jest.mock('@mycircle/shared', () => ({
  useTranslation: () => ({ t: (key: string) => key, locale: 'en', setLocale: jest.fn() }),
  eventBus: { subscribe: jest.fn(() => jest.fn()), publish: jest.fn() },
  AppEvents: {},
}));

import TripPlannerScreen from '../TripPlannerScreen';

describe('TripPlannerScreen', () => {
  it('exports a React component', () => {
    expect(TripPlannerScreen).toBeDefined();
    expect(typeof TripPlannerScreen).toBe('function');
  });
});
