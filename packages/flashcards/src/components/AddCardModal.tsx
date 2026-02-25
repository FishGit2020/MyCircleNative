import React, { useState } from 'react';
import { View, Text, TextInput, Modal, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTranslation } from '@mycircle/shared';

interface AddCardModalProps {
  onAdd?: (card: { front: string; back: string; category: string }) => void;
  onEdit?: (updates: { front: string; back: string; category: string }) => void;
  initialValues?: { front: string; back: string; category: string };
  onClose: () => void;
}

export default function AddCardModal({ onAdd, onEdit, initialValues, onClose }: AddCardModalProps) {
  const { t } = useTranslation();
  const isEditMode = !!initialValues;
  const [front, setFront] = useState(initialValues?.front ?? '');
  const [back, setBack] = useState(initialValues?.back ?? '');
  const [category, setCategory] = useState(initialValues?.category ?? 'custom');

  const handleSubmit = () => {
    if (!front.trim() || !back.trim()) return;
    const data = { front: front.trim(), back: back.trim(), category: category.trim() || 'custom' };
    if (isEditMode && onEdit) {
      onEdit(data);
    } else if (onAdd) {
      onAdd(data);
    }
    onClose();
  };

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center items-center bg-black/50 px-4"
      >
        <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">
          <ScrollView keyboardShouldPersistTaps="handled">
            <View className="px-6 pt-6 pb-4">
              <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                {isEditMode ? t('flashcards.editCard') : t('flashcards.addCustomCard')}
              </Text>

              <View className="gap-4">
                {/* Front */}
                <View>
                  <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('flashcards.front')}
                  </Text>
                  <TextInput
                    value={front}
                    onChangeText={setFront}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    autoFocus
                    accessibilityLabel={t('flashcards.front')}
                  />
                </View>

                {/* Back */}
                <View>
                  <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('flashcards.back')}
                  </Text>
                  <TextInput
                    value={back}
                    onChangeText={setBack}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    accessibilityLabel={t('flashcards.back')}
                  />
                </View>

                {/* Category */}
                <View>
                  <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('flashcards.category')}
                  </Text>
                  <TextInput
                    value={category}
                    onChangeText={setCategory}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    accessibilityLabel={t('flashcards.category')}
                  />
                </View>
              </View>
            </View>

            {/* Actions */}
            <View className="flex-row justify-end gap-2 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <TouchableOpacity
                onPress={onClose}
                className="px-4 py-2 rounded-lg min-h-[44px] justify-center"
                accessibilityLabel={t('flashcards.cancel')}
                accessibilityRole="button"
              >
                <Text className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('flashcards.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!front.trim() || !back.trim()}
                className={`px-4 py-2 rounded-lg min-h-[44px] justify-center ${
                  !front.trim() || !back.trim() ? 'bg-blue-300 dark:bg-blue-800' : 'bg-blue-500 dark:bg-blue-600'
                }`}
                accessibilityLabel={t('flashcards.save')}
                accessibilityRole="button"
              >
                <Text className="text-sm font-medium text-white">
                  {t('flashcards.save')}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
