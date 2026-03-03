import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@mycircle/shared';
import type { CurrentWeather } from '@mycircle/shared';

interface WeatherAlertsProps {
  current: CurrentWeather;
}

interface Alert {
  key: string;
  icon: string;
  color: string;
  bgClass: string;
  darkBgClass: string;
  textClass: string;
  darkTextClass: string;
}

function generateAlerts(current: CurrentWeather): Alert[] {
  const alerts: Alert[] = [];

  if (current.temp > 38) {
    alerts.push({
      key: 'alert.extremeHeat',
      icon: 'flame-outline',
      color: '#ef4444',
      bgClass: 'bg-red-100',
      darkBgClass: 'dark:bg-red-900/30',
      textClass: 'text-red-800',
      darkTextClass: 'dark:text-red-200',
    });
  } else if (current.temp > 35) {
    alerts.push({
      key: 'alert.heatAdvisory',
      icon: 'sunny-outline',
      color: '#f97316',
      bgClass: 'bg-orange-100',
      darkBgClass: 'dark:bg-orange-900/30',
      textClass: 'text-orange-800',
      darkTextClass: 'dark:text-orange-200',
    });
  }

  if (current.temp < -15) {
    alerts.push({
      key: 'alert.extremeCold',
      icon: 'snow-outline',
      color: '#3b82f6',
      bgClass: 'bg-blue-100',
      darkBgClass: 'dark:bg-blue-900/30',
      textClass: 'text-blue-800',
      darkTextClass: 'dark:text-blue-200',
    });
  } else if (current.temp < 0) {
    alerts.push({
      key: 'alert.coldAdvisory',
      icon: 'snow-outline',
      color: '#06b6d4',
      bgClass: 'bg-cyan-100',
      darkBgClass: 'dark:bg-cyan-900/30',
      textClass: 'text-cyan-800',
      darkTextClass: 'dark:text-cyan-200',
    });
  }

  if (current.wind?.speed > 20) {
    alerts.push({
      key: 'alert.highWindWarning',
      icon: 'flag-outline',
      color: '#eab308',
      bgClass: 'bg-yellow-100',
      darkBgClass: 'dark:bg-yellow-900/30',
      textClass: 'text-yellow-800',
      darkTextClass: 'dark:text-yellow-200',
    });
  }

  if (current.weather?.[0]?.main === 'Thunderstorm') {
    alerts.push({
      key: 'alert.thunderstorm',
      icon: 'thunderstorm-outline',
      color: '#8b5cf6',
      bgClass: 'bg-purple-100',
      darkBgClass: 'dark:bg-purple-900/30',
      textClass: 'text-purple-800',
      darkTextClass: 'dark:text-purple-200',
    });
  }

  if (current.visibility && current.visibility < 1000) {
    alerts.push({
      key: 'alert.lowVisibility',
      icon: 'eye-off-outline',
      color: '#6b7280',
      bgClass: 'bg-gray-200',
      darkBgClass: 'dark:bg-gray-700',
      textClass: 'text-gray-800',
      darkTextClass: 'dark:text-gray-200',
    });
  }

  return alerts;
}

export default function WeatherAlerts({ current }: WeatherAlertsProps) {
  const { t } = useTranslation();
  const alerts = generateAlerts(current);

  if (alerts.length === 0) {
    return null;
  }

  return (
    <View className="mb-4">
      <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">
        {t('weather.alerts')}
      </Text>
      {alerts.map((alert) => (
        <View
          key={alert.key}
          className={`flex-row items-center rounded-xl p-3 mb-2 ${alert.bgClass} ${alert.darkBgClass}`}
        >
          <Ionicons name={alert.icon as any} size={20} color={alert.color} />
          <Text className={`ml-2 text-sm font-medium ${alert.textClass} ${alert.darkTextClass}`}>
            {t(alert.key as any)}
          </Text>
        </View>
      ))}
    </View>
  );
}
