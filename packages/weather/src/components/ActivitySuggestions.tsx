import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@mycircle/shared';
import type { CurrentWeather } from '@mycircle/shared';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface Activity {
  key: string;
  icon: IoniconsName;
}

function getOutdoorActivities(temp: number, weather: string): Activity[] {
  const activities: Activity[] = [];
  if (temp > 15 && temp < 35 && weather !== 'Rain' && weather !== 'Thunderstorm') {
    activities.push({ key: 'activity.hiking', icon: 'walk-outline' });
    activities.push({ key: 'activity.cycling', icon: 'bicycle-outline' });
    activities.push({ key: 'activity.jogging', icon: 'fitness-outline' });
  }
  if (temp > 20 && temp < 32 && weather === 'Clear') {
    activities.push({ key: 'activity.picnic', icon: 'restaurant-outline' });
    activities.push({ key: 'activity.gardening', icon: 'flower-outline' });
  }
  if (temp > 25) {
    activities.push({ key: 'activity.swimming', icon: 'water-outline' });
  }
  if (temp < 5) {
    activities.push({ key: 'activity.skiing', icon: 'snow-outline' });
    activities.push({ key: 'activity.snowman', icon: 'happy-outline' });
  }
  return activities.slice(0, 4);
}

function getIndoorActivities(temp: number, weather: string): Activity[] {
  const activities: Activity[] = [];
  activities.push({ key: 'activity.gym', icon: 'barbell-outline' });
  activities.push({ key: 'activity.yoga', icon: 'body-outline' });
  if (weather === 'Rain' || weather === 'Thunderstorm' || temp > 35 || temp < -5) {
    activities.push({ key: 'activity.museum', icon: 'business-outline' });
    activities.push({ key: 'activity.movie', icon: 'film-outline' });
    activities.push({ key: 'activity.cooking', icon: 'restaurant-outline' });
    activities.push({ key: 'activity.boardGames', icon: 'game-controller-outline' });
  }
  activities.push({ key: 'activity.reading', icon: 'book-outline' });
  return activities.slice(0, 4);
}

interface ActivitySuggestionsProps {
  current: CurrentWeather;
}

export default function ActivitySuggestions({ current }: ActivitySuggestionsProps) {
  const { t } = useTranslation();
  const weather = current.weather?.[0]?.main ?? '';
  const outdoor = getOutdoorActivities(current.temp, weather);
  const indoor = getIndoorActivities(current.temp, weather);

  return (
    <View className="mb-4">
      <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
        {t('weather.activitySuggestions')}
      </Text>

      {/* Outdoor */}
      {outdoor.length > 0 && (
        <View className="mb-3">
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {t('activity.outdoorTitle')}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {outdoor.map((act) => (
              <View
                key={act.key}
                className="flex-row items-center bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2"
              >
                <Ionicons name={act.icon} size={16} color="#10b981" />
                <Text className="text-sm text-green-700 dark:text-green-300 ml-1.5">
                  {t(act.key as any)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Indoor */}
      <View>
        <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {t('activity.indoorTitle')}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {indoor.map((act) => (
            <View
              key={act.key}
              className="flex-row items-center bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2"
            >
              <Ionicons name={act.icon} size={16} color="#3b82f6" />
              <Text className="text-sm text-blue-700 dark:text-blue-300 ml-1.5">
                {t(act.key as any)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
