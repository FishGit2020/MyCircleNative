import React from 'react';
import { render } from '@testing-library/react-native';

// Mock @mycircle/shared
jest.mock('@mycircle/shared', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

import WeatherAlerts from '../src/components/WeatherAlerts';

describe('WeatherAlerts', () => {
  it('returns null when no alerts', () => {
    const current = {
      temp: 22,
      feels_like: 22,
      temp_min: 20,
      temp_max: 24,
      pressure: 1013,
      humidity: 50,
      weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
      wind: { speed: 5, deg: 180 },
      clouds: { all: 0 },
      dt: Date.now() / 1000,
      timezone: 0,
      sunrise: Date.now() / 1000 - 3600,
      sunset: Date.now() / 1000 + 3600,
      visibility: 10000,
    };
    const { toJSON } = render(<WeatherAlerts current={current} />);
    expect(toJSON()).toBeNull();
  });

  it('shows extreme heat alert when temp is high', () => {
    const current = {
      temp: 40,
      feels_like: 42,
      temp_min: 38,
      temp_max: 42,
      pressure: 1013,
      humidity: 30,
      weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
      wind: { speed: 3, deg: 180 },
      clouds: { all: 0 },
      dt: Date.now() / 1000,
      timezone: 0,
      sunrise: Date.now() / 1000 - 3600,
      sunset: Date.now() / 1000 + 3600,
      visibility: 10000,
    };
    const { getByText } = render(<WeatherAlerts current={current} />);
    expect(getByText('weather.alerts')).toBeTruthy();
    expect(getByText('alert.extremeHeat')).toBeTruthy();
  });

  it('shows cold advisory when temp is below zero', () => {
    const current = {
      temp: -5,
      feels_like: -10,
      temp_min: -8,
      temp_max: -2,
      pressure: 1020,
      humidity: 80,
      weather: [{ id: 600, main: 'Snow', description: 'light snow', icon: '13d' }],
      wind: { speed: 5, deg: 0 },
      clouds: { all: 90 },
      dt: Date.now() / 1000,
      timezone: 0,
      sunrise: Date.now() / 1000 - 3600,
      sunset: Date.now() / 1000 + 3600,
      visibility: 5000,
    };
    const { getByText } = render(<WeatherAlerts current={current} />);
    expect(getByText('alert.coldAdvisory')).toBeTruthy();
  });
});
