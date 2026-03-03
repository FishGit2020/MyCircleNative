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

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: View,
    Path: View,
    Line: View,
    Circle: View,
    Text: Text,
    Defs: View,
    LinearGradient: View,
    Stop: View,
    Rect: View,
  };
});

import StockChart from '../src/components/StockChart';

describe('StockChart', () => {
  it('renders loading state when no data', () => {
    const { getByText } = render(
      <StockChart data={null} symbol="AAPL" />,
    );
    expect(getByText('stocks.loading')).toBeTruthy();
  });

  it('renders chart when data is provided', () => {
    const mockData = {
      c: [150, 152, 148, 155, 153],
      h: [153, 155, 150, 157, 155],
      l: [148, 150, 146, 152, 151],
      o: [149, 151, 149, 153, 154],
      t: [1000, 2000, 3000, 4000, 5000],
      v: [1e6, 2e6, 1.5e6, 3e6, 2.5e6],
      s: 'ok',
    };
    const { getByText } = render(
      <StockChart data={mockData} symbol="AAPL" currentPrice={153} previousClose={150} />,
    );
    expect(getByText('stocks.chart')).toBeTruthy();
  });
});
