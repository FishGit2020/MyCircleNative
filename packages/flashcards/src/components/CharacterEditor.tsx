import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTranslation } from '@mycircle/shared';
import type { TranslationKey } from '@mycircle/shared';
import type { ChineseCharacter, CharacterCategory } from '../data/characters';
import { categoryOrder } from '../data/characters';
import PinyinKeyboard from './PinyinKeyboard';

const categoryKeyMap: Record<CharacterCategory, TranslationKey> = {
  family: 'chinese.category.family',
  feelings: 'chinese.category.feelings',
  food: 'chinese.category.food',
  body: 'chinese.category.body',
  house: 'chinese.category.house',
  nature: 'chinese.category.nature',
  numbers: 'chinese.category.numbers',
  phrases: 'chinese.category.phrases',
};


interface CharacterEditorProps {
  character?: ChineseCharacter;
  onSave: (data: { character: string; pinyin: string; meaning: string; category: CharacterCategory }) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

export default function CharacterEditor({ character, onSave, onCancel, onDelete }: CharacterEditorProps) {
  const { t } = useTranslation();
  const [charValue, setCharValue] = useState(character?.character || '');
  const [pinyin, setPinyin] = useState(character?.pinyin || '');
  const [meaning, setMeaning] = useState(character?.meaning || '');
  const [category, setCategory] = useState<CharacterCategory>(character?.category || 'phrases');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const isEditing = !!character;

  const handleSubmit = useCallback(() => {
    if (!charValue.trim() || !pinyin.trim() || !meaning.trim()) return;
    onSave({ character: charValue.trim(), pinyin: pinyin.trim(), meaning: meaning.trim(), category });
  }, [charValue, pinyin, meaning, category, onSave]);

  const handlePinyinInsert = useCallback((char: string) => {
    setPinyin(prev => prev + char);
  }, []);

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center items-center bg-black/50 px-4"
      >
        <View className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {isEditing ? t('chinese.editCharacter') : t('chinese.addCharacter')}
            </Text>

            <View className="gap-4">
              {/* Character */}
              <View>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('chinese.character')} *
                </Text>
                <TextInput
                  value={charValue}
                  onChangeText={setCharValue}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-2xl text-center"
                  placeholder="\u5b57"
                  placeholderTextColor="#9CA3AF"
                  accessibilityLabel={t('chinese.character')}
                />
              </View>

              {/* Pinyin with keyboard */}
              <View>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('chinese.pinyin')} *
                </Text>
                <TextInput
                  value={pinyin}
                  onChangeText={setPinyin}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="p\u012bny\u012bn"
                  placeholderTextColor="#9CA3AF"
                  accessibilityLabel={t('chinese.pinyin')}
                />

                <PinyinKeyboard onInsert={handlePinyinInsert} />
              </View>

              {/* Meaning */}
              <View>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('chinese.meaning')} *
                </Text>
                <TextInput
                  value={meaning}
                  onChangeText={setMeaning}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="meaning"
                  placeholderTextColor="#9CA3AF"
                  accessibilityLabel={t('chinese.meaning')}
                />
              </View>

              {/* Category picker */}
              <View>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('chinese.categoryLabel')}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCategoryPicker(v => !v)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 min-h-[44px] justify-center"
                  accessibilityLabel={t('chinese.categoryLabel')}
                  accessibilityRole="button"
                >
                  <Text className="text-gray-900 dark:text-white">
                    {t(categoryKeyMap[category])}
                  </Text>
                </TouchableOpacity>

                {showCategoryPicker && (
                  <View className="mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
                    {categoryOrder.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => {
                          setCategory(cat);
                          setShowCategoryPicker(false);
                        }}
                        className={`px-3 py-2 min-h-[44px] justify-center ${
                          cat === category ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                        }`}
                        accessibilityLabel={t(categoryKeyMap[cat])}
                        accessibilityRole="button"
                      >
                        <Text className={`text-sm ${
                          cat === category
                            ? 'text-blue-600 dark:text-blue-400 font-medium'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {t(categoryKeyMap[cat])}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Actions */}
              <View className="flex-row items-center justify-between pt-2">
                <View>
                  {isEditing && onDelete && (
                    showDeleteConfirm ? (
                      <View className="flex-row items-center gap-2">
                        <Text className="text-xs text-red-600 dark:text-red-400">
                          {t('chinese.deleteConfirm')}
                        </Text>
                        <TouchableOpacity
                          onPress={() => onDelete(character!.id)}
                          className="px-2 py-1 bg-red-500 rounded min-h-[32px] justify-center"
                          accessibilityLabel={t('chinese.deleteCharacter')}
                          accessibilityRole="button"
                        >
                          <Text className="text-xs text-white">{t('chinese.deleteCharacter')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setShowDeleteConfirm(false)}
                          className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded min-h-[32px] justify-center"
                          accessibilityLabel={t('chinese.cancel')}
                          accessibilityRole="button"
                        >
                          <Text className="text-xs text-gray-700 dark:text-gray-300">{t('chinese.cancel')}</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => setShowDeleteConfirm(true)}
                        className="min-h-[44px] justify-center"
                        accessibilityLabel={t('chinese.deleteCharacter')}
                        accessibilityRole="button"
                      >
                        <Text className="text-sm text-red-500 dark:text-red-400">
                          {t('chinese.deleteCharacter')}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={onCancel}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg min-h-[44px] justify-center"
                    accessibilityLabel={t('chinese.cancel')}
                    accessibilityRole="button"
                  >
                    <Text className="text-sm text-gray-700 dark:text-gray-300">{t('chinese.cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={!charValue.trim() || !pinyin.trim() || !meaning.trim()}
                    className={`px-4 py-2 rounded-lg min-h-[44px] justify-center ${
                      !charValue.trim() || !pinyin.trim() || !meaning.trim()
                        ? 'bg-blue-300 dark:bg-blue-800'
                        : 'bg-blue-500 dark:bg-blue-600'
                    }`}
                    accessibilityLabel={t('chinese.save')}
                    accessibilityRole="button"
                  >
                    <Text className="text-sm text-white">{t('chinese.save')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
