import React from 'react';
import { View, Pressable } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onPress?: () => void;
}

export function Card({ children, className = '', onPress }: CardProps) {
  const baseClasses = 'bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm';

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={`${baseClasses} active:opacity-80 ${className}`}
      >
        {children}
      </Pressable>
    );
  }

  return <View className={`${baseClasses} ${className}`}>{children}</View>;
}
