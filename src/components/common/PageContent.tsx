import React from 'react';
import { View, ScrollView } from 'react-native';

interface PageContentProps {
  children: React.ReactNode;
  className?: string;
  scroll?: boolean;
  padded?: boolean;
}

/**
 * Consistent page content wrapper for feature screens.
 * Provides standard padding, flex layout, and optional scrolling.
 * Native equivalent of web's <PageContent> component.
 */
export function PageContent({
  children,
  className = '',
  scroll = true,
  padded = true,
}: PageContentProps) {
  const paddingClass = padded ? 'px-4 pt-4 pb-24' : '';

  if (scroll) {
    return (
      <ScrollView
        className={`flex-1 bg-white dark:bg-gray-900 ${className}`}
        contentContainerClassName={`${paddingClass} flex-grow`}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View className={`flex-1 bg-white dark:bg-gray-900 ${paddingClass} ${className}`}>
      {children}
    </View>
  );
}
