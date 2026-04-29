jest.mock('@mycircle/shared', () => ({
  useTranslation: () => ({ t: (key: string) => key, locale: 'en', setLocale: jest.fn() }),
}));

jest.mock('../hooks/useImmigrationCases', () => ({
  useImmigrationCases: () => ({
    cases: [],
    loading: false,
    addCase: jest.fn(),
    removeCase: jest.fn(),
    refreshCase: jest.fn(),
  }),
}));

jest.mock('../components/CaseCard', () => 'CaseCard');
jest.mock('../components/AddCaseForm', () => 'AddCaseForm');

import ImmigrationTrackerScreen from '../ImmigrationTrackerScreen';

describe('ImmigrationTrackerScreen', () => {
  it('exports a React component', () => {
    expect(ImmigrationTrackerScreen).toBeDefined();
    expect(typeof ImmigrationTrackerScreen).toBe('function');
  });
});
