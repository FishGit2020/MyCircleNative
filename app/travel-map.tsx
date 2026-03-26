import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@mycircle/shared';
import { TravelMapScreen } from '@mycircle/travel-map';
import { ScreenHeader } from '../src/components/common';

export default function TravelMapRoute() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-white dark:bg-gray-900" style={{ paddingTop: insets.top }}>
      <ScreenHeader title={t('nav.travelMap' as any)} showBack />
      <TravelMapScreen />
    </View>
  );
}
