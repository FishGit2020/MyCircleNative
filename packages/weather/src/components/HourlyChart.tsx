import { View, Text, Dimensions } from 'react-native';
import Svg, { Path, Line, Circle, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTranslation } from '@mycircle/shared';
import type { HourlyForecast } from '@mycircle/shared';

interface HourlyChartProps {
  hourly: HourlyForecast[];
}

const CHART_HEIGHT = 150;
const PADDING = { top: 20, right: 15, bottom: 35, left: 15 };

export default function HourlyChart({ hourly }: HourlyChartProps) {
  const { t } = useTranslation();
  const screenWidth = Dimensions.get('window').width - 32;
  const chartWidth = screenWidth - PADDING.left - PADDING.right;

  if (!hourly?.length) return null;

  const data = hourly.slice(0, 12);
  const temps = data.map((h) => h.temp);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const range = maxTemp - minTemp || 1;

  const points = data.map((h, i) => ({
    x: PADDING.left + (i / (data.length - 1)) * chartWidth,
    y: PADDING.top + (1 - (h.temp - minTemp) / range) * CHART_HEIGHT,
    temp: h.temp,
    pop: h.pop,
    hour: new Date(h.dt * 1000).getHours(),
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaD = `${pathD} L${points[points.length - 1].x},${PADDING.top + CHART_HEIGHT} L${points[0].x},${PADDING.top + CHART_HEIGHT} Z`;

  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm">
      <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
        {t('weather.hourlyChart')}
      </Text>

      <Svg width={screenWidth} height={CHART_HEIGHT + PADDING.top + PADDING.bottom}>
        <Defs>
          <LinearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#3b82f6" stopOpacity={0.3} />
            <Stop offset="1" stopColor="#3b82f6" stopOpacity={0.02} />
          </LinearGradient>
        </Defs>

        {/* Area */}
        <Path d={areaD} fill="url(#tempGrad)" />

        {/* Line */}
        <Path d={pathD} fill="none" stroke="#3b82f6" strokeWidth={2} />

        {/* Points and labels */}
        {points.filter((_, i) => i % 2 === 0).map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={3} fill="#3b82f6" />
        ))}

        {/* Temp labels */}
        {points.filter((_, i) => i % 3 === 0).map((p, i) => (
          <SvgText
            key={`t${i}`}
            x={p.x}
            y={p.y - 8}
            fontSize={9}
            fill="#6b7280"
            textAnchor="middle"
          >
            {Math.round(p.temp)}{'\u00b0'}
          </SvgText>
        ))}

        {/* Hour labels */}
        {points.filter((_, i) => i % 2 === 0).map((p, i) => (
          <SvgText
            key={`h${i}`}
            x={p.x}
            y={PADDING.top + CHART_HEIGHT + 18}
            fontSize={9}
            fill="#9ca3af"
            textAnchor="middle"
          >
            {p.hour}:00
          </SvgText>
        ))}
      </Svg>

      {/* Rain chance bar */}
      <View className="flex-row justify-between mt-1">
        <Text className="text-xs text-gray-500 dark:text-gray-400">{t('weather.hourlyRain')}</Text>
      </View>
      <View className="flex-row gap-1 mt-1">
        {data.slice(0, 12).filter((_, i) => i % 2 === 0).map((h, i) => (
          <View key={i} className="flex-1 items-center">
            <View
              className="w-full bg-blue-200 dark:bg-blue-800 rounded-sm"
              style={{ height: Math.max(2, (h.pop ?? 0) * 30) }}
            />
            <Text className="text-[8px] text-gray-400 mt-0.5">
              {Math.round((h.pop ?? 0) * 100)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
