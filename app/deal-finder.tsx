import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@mycircle/shared';
import { DealFinderScreen } from '@mycircle/deal-finder';
import { ScreenHeader } from '../src/components/common';

export default function DealFinderRoute() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-white dark:bg-gray-900" style={{ paddingTop: insets.top }}>
      <ScreenHeader title={t('nav.dealFinder' as any)} showBack />
      <DealFinderScreen />
    </View>
  );
}
