import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@mycircle/shared';
import { TransitTrackerScreen } from '@mycircle/transit-tracker';
import { ScreenHeader } from '../src/components/common';

export default function TransitTrackerRoute() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-white dark:bg-gray-900" style={{ paddingTop: insets.top }}>
      <ScreenHeader title={t('transit.title' as any)} showBack />
      <TransitTrackerScreen />
    </View>
  );
}
