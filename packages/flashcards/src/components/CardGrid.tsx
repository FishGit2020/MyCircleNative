import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from '@mycircle/shared';
import type { FlashCard } from '../types';

interface CardGridProps {
  cards: FlashCard[];
  masteredIds: string[];
  onCardClick: (card: FlashCard) => void;
  onDeleteCard?: (card: FlashCard) => void;
  onEditCard?: (card: FlashCard) => void;
}

const TYPE_COLORS: Record<string, { border: string; darkBorder: string }> = {
  chinese: { border: 'border-red-300', darkBorder: 'dark:border-red-700' },
  english: { border: 'border-green-300', darkBorder: 'dark:border-green-700' },
  'bible-first-letter': { border: 'border-purple-300', darkBorder: 'dark:border-purple-700' },
  'bible-full': { border: 'border-indigo-300', darkBorder: 'dark:border-indigo-700' },
  custom: { border: 'border-yellow-300', darkBorder: 'dark:border-yellow-700' },
};

function canDelete(card: FlashCard): boolean {
  return card.type !== 'english';
}

function canEdit(card: FlashCard): boolean {
  return card.type !== 'english';
}

export default function CardGrid({ cards, masteredIds, onCardClick, onDeleteCard, onEditCard }: CardGridProps) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const grouped = useMemo(() => {
    const map = new Map<string, FlashCard[]>();
    for (const card of cards) {
      const key = card.category || '';
      const list = map.get(key);
      if (list) list.push(card);
      else map.set(key, [card]);
    }
    return map;
  }, [cards]);

  if (cards.length === 0) {
    return (
      <Text className="text-center text-gray-500 dark:text-gray-400 py-8">
        {t('flashcards.noCards')}
      </Text>
    );
  }

  const toggleCollapse = (category: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  return (
    <View className="gap-4">
      {Array.from(grouped.entries()).map(([category, categoryCards]) => {
        const isCollapsed = collapsed.has(category);
        const displayName = category || t('flashcards.uncategorized');
        return (
          <View key={category}>
            {/* Category header */}
            <TouchableOpacity
              onPress={() => toggleCollapse(category)}
              className="flex-row items-center gap-2 py-2 px-1 min-h-[44px]"
              accessibilityLabel={`${displayName} (${categoryCards.length})`}
              accessibilityRole="button"
              accessibilityState={{ expanded: !isCollapsed }}
            >
              <Text
                className={`text-gray-400 dark:text-gray-500 text-sm ${isCollapsed ? '' : 'rotate-90'}`}
              >
                {'\u25B6'}
              </Text>
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
                {displayName}
              </Text>
              <Text className="text-xs text-gray-400 dark:text-gray-500">
                ({categoryCards.length})
              </Text>
            </TouchableOpacity>

            {/* Card grid */}
            {!isCollapsed && (
              <View className="flex-row flex-wrap gap-3 mt-1">
                {categoryCards.map(card => {
                  const isMastered = masteredIds.includes(card.id);
                  const colors = TYPE_COLORS[card.type] || { border: 'border-gray-300', darkBorder: 'dark:border-gray-600' };
                  return (
                    <TouchableOpacity
                      key={card.id}
                      onPress={() => onCardClick(card)}
                      className={`w-[47%] p-3 rounded-xl border-2 ${colors.border} ${colors.darkBorder} bg-white dark:bg-gray-800 min-h-[80px] ${
                        isMastered ? 'opacity-60' : ''
                      }`}
                      accessibilityLabel={`${card.front} - ${card.type}`}
                      accessibilityRole="button"
                    >
                      {/* Action buttons */}
                      {(onDeleteCard || onEditCard) && canEdit(card) && (
                        <View className="absolute top-1 right-1 flex-row gap-1 z-10">
                          {onEditCard && canEdit(card) && (
                            <TouchableOpacity
                              onPress={() => onEditCard(card)}
                              className="p-1.5 rounded min-w-[30px] min-h-[30px] items-center justify-center"
                              accessibilityLabel={t('flashcards.edit')}
                              accessibilityRole="button"
                            >
                              <Text className="text-gray-400 dark:text-gray-500 text-xs">
                                {'\u270E'}
                              </Text>
                            </TouchableOpacity>
                          )}
                          {onDeleteCard && canDelete(card) && (
                            <TouchableOpacity
                              onPress={() => onDeleteCard(card)}
                              className="p-1.5 rounded min-w-[30px] min-h-[30px] items-center justify-center"
                              accessibilityLabel={t('flashcards.delete')}
                              accessibilityRole="button"
                            >
                              <Text className="text-gray-400 dark:text-gray-500 text-xs">
                                {'\u2715'}
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}

                      <Text
                        className="text-sm font-medium text-gray-800 dark:text-white"
                        numberOfLines={2}
                      >
                        {card.front}
                      </Text>

                      <View className="flex-row items-center justify-between mt-2">
                        <Text className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                          {card.type}
                        </Text>
                        {isMastered && (
                          <Text className="text-[10px] font-medium text-green-600 dark:text-green-400">
                            {'\u2713'}
                          </Text>
                        )}
                      </View>

                      {card.meta?.pinyin && (
                        <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {card.meta.pinyin}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
