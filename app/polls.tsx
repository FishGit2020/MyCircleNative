import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@mycircle/shared';
import { PollSystemScreen } from '@mycircle/poll-system';
import { ScreenHeader } from '../src/components/common';

export default function PollsRoute() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-white dark:bg-gray-900" style={{ paddingTop: insets.top }}>
      <ScreenHeader title={t('nav.pollSystem')} showBack />
      <PollSystemScreen />
    </View>
  );
}
