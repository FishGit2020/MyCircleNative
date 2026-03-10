import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@mycircle/shared';
import { useAuth } from '../src/contexts/AuthContext';
import { firestore } from '../src/firebase/config';

interface TrashItem {
  id: string;
  type: string;
  name: string;
  deletedAt: number | null;
  collectionPath: string;
}

type TrashType = 'note' | 'flashcard' | 'file' | 'trip' | 'route' | 'child' | 'book' | 'poll' | 'worship';

const PERSONAL_TYPES: TrashType[] = ['note', 'flashcard', 'file', 'trip', 'route', 'child'];
const PUBLIC_TYPES: TrashType[] = ['book', 'poll', 'worship'];
const ALL_TYPES: TrashType[] = [...PERSONAL_TYPES, ...PUBLIC_TYPES];

const TYPE_COLORS: Record<string, { bg: string; darkBg: string; text: string; darkText: string }> = {
  note: { bg: 'bg-blue-100', darkBg: 'dark:bg-blue-900/30', text: 'text-blue-800', darkText: 'dark:text-blue-300' },
  flashcard: { bg: 'bg-purple-100', darkBg: 'dark:bg-purple-900/30', text: 'text-purple-800', darkText: 'dark:text-purple-300' },
  file: { bg: 'bg-green-100', darkBg: 'dark:bg-green-900/30', text: 'text-green-800', darkText: 'dark:text-green-300' },
  trip: { bg: 'bg-orange-100', darkBg: 'dark:bg-orange-900/30', text: 'text-orange-800', darkText: 'dark:text-orange-300' },
  route: { bg: 'bg-teal-100', darkBg: 'dark:bg-teal-900/30', text: 'text-teal-800', darkText: 'dark:text-teal-300' },
  child: { bg: 'bg-pink-100', darkBg: 'dark:bg-pink-900/30', text: 'text-pink-800', darkText: 'dark:text-pink-300' },
  book: { bg: 'bg-indigo-100', darkBg: 'dark:bg-indigo-900/30', text: 'text-indigo-800', darkText: 'dark:text-indigo-300' },
  poll: { bg: 'bg-violet-100', darkBg: 'dark:bg-violet-900/30', text: 'text-violet-800', darkText: 'dark:text-violet-300' },
  worship: { bg: 'bg-rose-100', darkBg: 'dark:bg-rose-900/30', text: 'text-rose-800', darkText: 'dark:text-rose-300' },
};

const COLLECTION_MAP: Record<TrashType, { personal: boolean; collection: string }> = {
  note: { personal: true, collection: 'notes' },
  flashcard: { personal: true, collection: 'flashcardDecks' },
  file: { personal: true, collection: 'files' },
  trip: { personal: true, collection: 'trips' },
  route: { personal: true, collection: 'hikingRoutes' },
  child: { personal: true, collection: 'children' },
  book: { personal: false, collection: 'books' },
  poll: { personal: false, collection: 'polls' },
  worship: { personal: false, collection: 'worshipSongs' },
};

function formatDate(ts: number | null): string {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function TrashScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Record<TrashType, TrashItem[]>>({
    note: [], flashcard: [], file: [], trip: [], route: [], child: [],
    book: [], poll: [], worship: [],
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const result: Record<TrashType, TrashItem[]> = {
        note: [], flashcard: [], file: [], trip: [], route: [], child: [],
        book: [], poll: [], worship: [],
      };

      for (const type of ALL_TYPES) {
        const config = COLLECTION_MAP[type];
        const basePath = config.personal
          ? `users/${user.uid}/${config.collection}`
          : config.collection;

        const snapshot = await firestore()
          .collection(basePath)
          .where('deleted', '==', true)
          .limit(50)
          .get();

        result[type] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            type,
            name: data.title || data.name || data.deckName || doc.id,
            deletedAt: data.deletedAt?.toMillis?.() ?? data.deletedAt ?? null,
            collectionPath: basePath,
          };
        });
      }

      setItems(result);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleRestore = useCallback(async (item: TrashItem) => {
    setActionLoading(`restore-${item.type}-${item.id}`);
    try {
      await firestore()
        .collection(item.collectionPath)
        .doc(item.id)
        .update({ deleted: false, deletedAt: null });
      await loadItems();
    } finally {
      setActionLoading(null);
    }
  }, [loadItems]);

  const handlePermanentDelete = useCallback((item: TrashItem) => {
    Alert.alert(
      t('recycleBin.deleteForever' as any),
      t('recycleBin.deleteForeverConfirm' as any),
      [
        { text: t('common.cancel' as any) || 'Cancel', style: 'cancel' },
        {
          text: t('recycleBin.deleteForever' as any),
          style: 'destructive',
          onPress: async () => {
            setActionLoading(`delete-${item.type}-${item.id}`);
            try {
              await firestore()
                .collection(item.collectionPath)
                .doc(item.id)
                .delete();
              await loadItems();
            } finally {
              setActionLoading(null);
            }
          },
        },
      ],
    );
  }, [loadItems, t]);

  const totalItems = ALL_TYPES.reduce((sum, type) => sum + items[type].length, 0);

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
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              {t('recycleBin.title' as any)}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {t('recycleBin.autoDelete' as any)}
            </Text>
          </View>
        </View>

        {loading ? (
          <View className="items-center justify-center py-16">
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : totalItems === 0 ? (
          <View className="items-center justify-center py-16 px-4">
            <Ionicons name="trash-outline" size={64} color="#d1d5db" />
            <Text className="text-lg text-gray-500 dark:text-gray-400 mt-4 text-center">
              {t('recycleBin.empty' as any)}
            </Text>
          </View>
        ) : (
          <View className="px-4 mt-4 gap-6">
            {/* Personal section */}
            <TrashSection
              title={t('recycleBin.personalSection' as any)}
              types={PERSONAL_TYPES}
              items={items}
              actionLoading={actionLoading}
              onRestore={handleRestore}
              onDelete={handlePermanentDelete}
              t={t}
            />
            {/* Public section */}
            <TrashSection
              title={t('recycleBin.publicSection' as any)}
              types={PUBLIC_TYPES}
              items={items}
              actionLoading={actionLoading}
              onRestore={handleRestore}
              onDelete={handlePermanentDelete}
              t={t}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function TrashSection({
  title,
  types,
  items,
  actionLoading,
  onRestore,
  onDelete,
  t,
}: {
  title: string;
  types: TrashType[];
  items: Record<TrashType, TrashItem[]>;
  actionLoading: string | null;
  onRestore: (item: TrashItem) => void;
  onDelete: (item: TrashItem) => void;
  t: (key: any) => string;
}) {
  const count = types.reduce((sum, type) => sum + items[type].length, 0);
  if (count === 0) return null;

  return (
    <View>
      <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        {title} ({count})
      </Text>
      <View className="gap-3">
        {types.map((type) => {
          const typeItems = items[type];
          if (typeItems.length === 0) return null;
          return (
            <View key={type} className="gap-2">
              <View className="flex-row items-center gap-2">
                <TypeBadge type={type} t={t} />
                <Text className="text-xs text-gray-400 dark:text-gray-500">
                  ({typeItems.length})
                </Text>
              </View>
              <View className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {typeItems.map((item, index) => (
                  <View
                    key={item.id}
                    className={`px-4 py-3 ${index > 0 ? 'border-t border-gray-200 dark:border-gray-700' : ''}`}
                  >
                    <View className="flex-row items-center">
                      <View className="flex-1 mr-2">
                        <Text
                          className="text-sm font-medium text-gray-900 dark:text-white"
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        {item.deletedAt && (
                          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {t('recycleBin.deletedOn' as any)} {formatDate(item.deletedAt)}
                          </Text>
                        )}
                      </View>
                      <View className="flex-row gap-2">
                        <Pressable
                          onPress={() => onRestore(item)}
                          disabled={actionLoading === `restore-${item.type}-${item.id}`}
                          className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-md min-h-[44px] items-center justify-center"
                          accessibilityRole="button"
                          accessibilityLabel={`${t('recycleBin.restore' as any)} ${item.name}`}
                        >
                          <Text className="text-xs font-medium text-blue-700 dark:text-blue-300">
                            {t('recycleBin.restore' as any)}
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => onDelete(item)}
                          disabled={actionLoading === `delete-${item.type}-${item.id}`}
                          className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-md min-h-[44px] items-center justify-center"
                          accessibilityRole="button"
                          accessibilityLabel={`${t('recycleBin.deleteForever' as any)} ${item.name}`}
                        >
                          <Text className="text-xs font-medium text-red-700 dark:text-red-300">
                            {t('recycleBin.deleteForever' as any)}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function TypeBadge({ type, t }: { type: string; t: (key: any) => string }) {
  const colors = TYPE_COLORS[type] || { bg: 'bg-gray-100', darkBg: 'dark:bg-gray-700', text: 'text-gray-800', darkText: 'dark:text-gray-300' };
  return (
    <View className={`px-2 py-0.5 rounded-full ${colors.bg} ${colors.darkBg}`}>
      <Text className={`text-xs font-medium ${colors.text} ${colors.darkText}`}>
        {t(`recycleBin.type.${type}` as any)}
      </Text>
    </View>
  );
}
