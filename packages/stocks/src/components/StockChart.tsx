import { useState, useMemo } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import Svg, { Path, Line, Text as SvgText, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useTranslation } from '@mycircle/shared';

interface CandleData {
  c: number[];
  h: number[];
  l: number[];
  o: number[];
  t: number[];
  v: number[];
  s: string;
}

interface StockChartProps {
  data: CandleData | null;
  symbol: string;
  currentPrice?: number;
  previousClose?: number;
  embedded?: boolean;
}

type Timeframe = '1D' | '1W' | '1M' | '3M' | '1Y';
type ChartMode = 'line' | 'area';

const CHART_HEIGHT = 200;
const PADDING = { top: 20, right: 50, bottom: 30, left: 10 };

export default function StockChart({ data, symbol, currentPrice, previousClose, embedded }: StockChartProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<ChartMode>('area');
  const screenWidth = Dimensions.get('window').width - 32; // px-4 padding
  const chartWidth = screenWidth - PADDING.left - PADDING.right;

  const isPositive = currentPrice && previousClose ? currentPrice >= previousClose : true;
  const lineColor = isPositive ? '#10b981' : '#ef4444';

  const { pathD, areaD, minPrice, maxPrice, priceLabels } = useMemo(() => {
    if (!data?.c?.length) return { pathD: '', areaD: '', minPrice: 0, maxPrice: 0, priceLabels: [] };

    const prices = data.c;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;

    const points = prices.map((price, i) => {
      const x = PADDING.left + (i / (prices.length - 1)) * chartWidth;
      const y = PADDING.top + (1 - (price - min) / range) * CHART_HEIGHT;
      return { x, y };
    });

    const lineD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    const areaPath = `${lineD} L${points[points.length - 1].x},${PADDING.top + CHART_HEIGHT} L${points[0].x},${PADDING.top + CHART_HEIGHT} Z`;

    const labels = [max, min + range * 0.5, min].map((price) => ({
      price: price.toFixed(2),
      y: PADDING.top + (1 - (price - min) / range) * CHART_HEIGHT,
    }));

    return { pathD: lineD, areaD: areaPath, minPrice: min, maxPrice: max, priceLabels: labels };
  }, [data, chartWidth]);

  if (!data?.c?.length) {
    return (
      <View className="items-center py-8">
        <Text className="text-gray-500 dark:text-gray-400 text-sm">
          {t('stocks.loading')}
        </Text>
      </View>
    );
  }

  const chartContent = (
    <>
      {/* Chart Header — hidden when embedded (parent provides header) */}
      {!embedded && (
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-base font-semibold text-gray-900 dark:text-white">
            {t('stocks.chart')}
          </Text>
          <View className="flex-row gap-1">
            {(['line', 'area'] as ChartMode[]).map((m) => (
              <Pressable
                key={m}
                className={`px-2 py-1 rounded ${mode === m ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}
                onPress={() => setMode(m)}
                accessibilityRole="button"
                accessibilityLabel={m === 'line' ? t('stocks.chartLine') : t('stocks.chartArea')}
              >
                <Text className={`text-xs ${mode === m ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                  {m === 'line' ? t('stocks.chartLine') : t('stocks.chartArea')}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Chart mode toggle when embedded */}
      {embedded && (
        <View className="flex-row justify-end px-4 pb-2">
          <View className="flex-row gap-1">
            {(['line', 'area'] as ChartMode[]).map((m) => (
              <Pressable
                key={m}
                className={`px-2 py-1 rounded ${mode === m ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}
                onPress={() => setMode(m)}
                accessibilityRole="button"
                accessibilityLabel={m === 'line' ? t('stocks.chartLine') : t('stocks.chartArea')}
              >
                <Text className={`text-xs ${mode === m ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                  {m === 'line' ? t('stocks.chartLine') : t('stocks.chartArea')}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* SVG Chart */}
      <Svg width={screenWidth} height={CHART_HEIGHT + PADDING.top + PADDING.bottom}>
        {/* Grid lines */}
        {priceLabels.map((label, i) => (
          <Line
            key={i}
            x1={PADDING.left}
            y1={label.y}
            x2={screenWidth - PADDING.right}
            y2={label.y}
            stroke="#e5e7eb"
            strokeWidth={0.5}
            strokeDasharray="4,4"
          />
        ))}

        {/* Area fill */}
        {mode === 'area' && areaD && (
          <>
            <Defs>
              <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={lineColor} stopOpacity={0.3} />
                <Stop offset="1" stopColor={lineColor} stopOpacity={0.02} />
              </LinearGradient>
            </Defs>
            <Path d={areaD} fill="url(#areaGrad)" />
          </>
        )}

        {/* Line */}
        {pathD && (
          <Path d={pathD} fill="none" stroke={lineColor} strokeWidth={2} />
        )}

        {/* Price labels */}
        {priceLabels.map((label, i) => (
          <SvgText
            key={i}
            x={screenWidth - PADDING.right + 5}
            y={label.y + 4}
            fontSize={10}
            fill="#9ca3af"
          >
            ${label.price}
          </SvgText>
        ))}
      </Svg>
    </>
  );

  if (embedded) {
    return <View className="pb-2">{chartContent}</View>;
  }

  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm">
      {chartContent}
    </View>
  );
}
