import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@mycircle/shared';
import { AiInterviewerScreen } from '@mycircle/ai-interviewer';
import { ScreenHeader } from '../src/components/common';

export default function AiInterviewerRoute() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-white dark:bg-gray-900" style={{ paddingTop: insets.top }}>
      <ScreenHeader title={t('aiInterviewer.title' as any)} showBack />
      <AiInterviewerScreen />
    </View>
  );
}
