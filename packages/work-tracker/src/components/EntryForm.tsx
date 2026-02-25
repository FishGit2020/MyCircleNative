import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from '@mycircle/shared';

interface EntryFormProps {
  onSubmit: (content: string) => Promise<void>;
  initialValue?: string;
  onCancel?: () => void;
}

export default function EntryForm({ onSubmit, initialValue = '', onCancel }: EntryFormProps) {
  const { t } = useTranslation();
  const [content, setContent] = useState(initialValue);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(content.trim());
      if (!initialValue) setContent('');
    } catch {
      /* ignore */
    }
    setSubmitting(false);
  };

  return (
    <View className="flex-row gap-2">
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder={t('workTracker.placeholder')}
        placeholderTextColor="#9ca3af"
        className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
        autoFocus
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        accessibilityLabel={t('workTracker.placeholder')}
      />
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={!content.trim() || submitting}
        className="px-4 py-3 rounded-xl bg-blue-500 dark:bg-blue-600 justify-center items-center min-h-[44px]"
        style={{ opacity: !content.trim() || submitting ? 0.5 : 1 }}
        accessibilityLabel={t('workTracker.save')}
        accessibilityRole="button"
      >
        {submitting ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text className="text-sm font-medium text-white">
            {t('workTracker.save')}
          </Text>
        )}
      </TouchableOpacity>
      {onCancel && (
        <TouchableOpacity
          onPress={onCancel}
          className="px-3 py-3 rounded-xl justify-center items-center min-h-[44px]"
          accessibilityLabel={t('workTracker.cancel')}
          accessibilityRole="button"
        >
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            {t('workTracker.cancel')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
