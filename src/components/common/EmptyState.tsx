import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
}

export function EmptyState({ icon = 'albums-outline', title, message }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <Ionicons name={icon} size={48} color="#9ca3af" />
      <Text className="text-lg font-semibold text-gray-500 dark:text-gray-400 mt-4 text-center">
        {title}
      </Text>
      {message && (
        <Text className="text-gray-400 dark:text-gray-500 mt-2 text-center">
          {message}
        </Text>
      )}
    </View>
  );
}
