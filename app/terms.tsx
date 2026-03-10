import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@mycircle/shared';

const SECTIONS = [
  { titleKey: 'terms.introTitle', textKey: 'terms.introText' },
  { titleKey: 'terms.useTitle', textKey: 'terms.useText' },
  { titleKey: 'terms.accountsTitle', textKey: 'terms.accountsText' },
  { titleKey: 'terms.contentTitle', textKey: 'terms.contentText' },
  { titleKey: 'terms.disclaimerTitle', textKey: 'terms.disclaimerText' },
  { titleKey: 'terms.limitationTitle', textKey: 'terms.limitationText' },
  { titleKey: 'terms.contactTitle', textKey: 'terms.contactText' },
] as const;

export default function TermsScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1" contentContainerClassName="pb-20">
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Pressable
            onPress={() => router.back()}
            className="mr-3 p-1 min-w-[44px] min-h-[44px] items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel={t('nav.goBack' as any) || 'Go back'}
          >
            <Ionicons name="arrow-back" size={24} color="#6b7280" />
          </Pressable>
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            {t('terms.title' as any)}
          </Text>
        </View>

        {/* Last updated */}
        <View className="px-4 mt-4 mb-6">
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {t('terms.lastUpdated' as any)}
          </Text>
        </View>

        {/* Sections */}
        <View className="px-4 gap-6">
          {SECTIONS.map(({ titleKey, textKey }) => (
            <View key={titleKey}>
              <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {t(titleKey as any)}
              </Text>
              <Text className="text-base text-gray-600 dark:text-gray-400 leading-6">
                {t(textKey as any)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
