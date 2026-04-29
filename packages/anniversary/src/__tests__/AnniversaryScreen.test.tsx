import React from 'react';
import { render, screen } from '@testing-library/react-native';

jest.mock('@mycircle/shared', () => ({
  useTranslation: () => ({ t: (key: string) => key, locale: 'en', setLocale: jest.fn() }),
}));

import AnniversaryScreen from '../AnniversaryScreen';

describe('AnniversaryScreen', () => {
  it('renders title and subtitle', () => {
    render(<AnniversaryScreen />);
    expect(screen.getByText('anniversary.title')).toBeTruthy();
    expect(screen.getByText('anniversary.subtitle')).toBeTruthy();
  });

  it('shows empty state when no anniversaries', () => {
    render(<AnniversaryScreen />);
    expect(screen.getByText('anniversary.empty')).toBeTruthy();
  });

  it('shows add button', () => {
    render(<AnniversaryScreen />);
    expect(screen.getByText('anniversary.add')).toBeTruthy();
  });
});
