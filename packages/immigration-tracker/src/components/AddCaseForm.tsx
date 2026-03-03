import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@mycircle/shared';
import type { FormType } from '@mycircle/shared';

const FORM_TYPES: FormType[] = [
  'I-130', 'I-140', 'I-485', 'I-765', 'I-131',
  'I-20', 'I-539', 'I-129', 'I-526', 'I-829', 'N-400', 'Other',
];

interface AddCaseFormProps {
  onSubmit: (receiptNumber: string, formType: FormType, nickname: string) => void;
  onCancel: () => void;
}

export default function AddCaseForm({ onSubmit, onCancel }: AddCaseFormProps) {
  const { t } = useTranslation();
  const [receiptNumber, setReceiptNumber] = useState('');
  const [formType, setFormType] = useState<FormType>('I-485');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  const validateReceipt = (value: string) => {
    // USCIS receipt numbers: 3 letters + 10 digits (e.g., IOE0123456789)
    return /^[A-Za-z]{3}\d{10}$/.test(value.trim());
  };

  const handleSubmit = () => {
    if (!validateReceipt(receiptNumber)) {
      setError(t('immigration.invalidReceipt'));
      return;
    }
    setError('');
    onSubmit(receiptNumber.trim(), formType, nickname.trim());
  };

  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm">
      <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        {t('immigration.addCase')}
      </Text>

      {/* Receipt Number */}
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {t('immigration.receiptNumber')}
      </Text>
      <TextInput
        className="bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2.5 text-gray-900 dark:text-white mb-3"
        value={receiptNumber}
        onChangeText={(text) => { setReceiptNumber(text); setError(''); }}
        placeholder={t('immigration.receiptPlaceholder')}
        placeholderTextColor="#9ca3af"
        autoCapitalize="characters"
        accessibilityLabel={t('immigration.receiptNumber')}
      />
      {error ? (
        <Text className="text-red-500 dark:text-red-400 text-xs mb-2">{error}</Text>
      ) : null}

      {/* Form Type */}
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {t('immigration.formType')}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
        <View className="flex-row gap-2">
          {FORM_TYPES.map((ft) => (
            <Pressable
              key={ft}
              className={`px-3 py-1.5 rounded-full ${
                formType === ft
                  ? 'bg-blue-500 dark:bg-blue-600'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}
              onPress={() => setFormType(ft)}
              accessibilityRole="button"
              accessibilityLabel={ft}
            >
              <Text
                className={`text-sm font-medium ${
                  formType === ft
                    ? 'text-white'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {ft}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Nickname */}
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {t('immigration.nickname')}
      </Text>
      <TextInput
        className="bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2.5 text-gray-900 dark:text-white mb-4"
        value={nickname}
        onChangeText={setNickname}
        placeholder={t('immigration.nicknamePlaceholder')}
        placeholderTextColor="#9ca3af"
        accessibilityLabel={t('immigration.nickname')}
      />

      {/* Buttons */}
      <View className="flex-row gap-2">
        <Pressable
          className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg py-3 items-center active:bg-gray-200 dark:active:bg-gray-600"
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel={t('immigration.cancel')}
        >
          <Text className="text-gray-700 dark:text-gray-300 font-medium">
            {t('immigration.cancel')}
          </Text>
        </Pressable>
        <Pressable
          className="flex-1 bg-blue-500 dark:bg-blue-600 rounded-lg py-3 items-center active:bg-blue-600 dark:active:bg-blue-700"
          onPress={handleSubmit}
          accessibilityRole="button"
          accessibilityLabel={t('immigration.save')}
        >
          <Text className="text-white font-medium">
            {t('immigration.save')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
