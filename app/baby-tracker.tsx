import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BabyTrackerScreen } from '@mycircle/baby-tracker';

export default function BabyTrackerRoute() {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-white dark:bg-gray-900" style={{ paddingTop: insets.top }}>
      <BabyTrackerScreen />
    </View>
  );
}
