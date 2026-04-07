import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@mycircle/shared';
import { HsaExpensesScreen } from '@mycircle/hsa-expenses';
import { ScreenHeader } from '../src/components/common';

export default function HsaExpensesRoute() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-white dark:bg-gray-900" style={{ paddingTop: insets.top }}>
      <ScreenHeader title={t('hsaExpenses.title' as any)} showBack />
      <HsaExpensesScreen />
    </View>
  );
}
