import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@mycircle/shared';
import type { CloudFile } from '@mycircle/shared';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const FILE_TYPE_ICONS: Record<string, IoniconsName> = {
  document: 'document-text-outline',
  image: 'image-outline',
  video: 'videocam-outline',
  audio: 'musical-note-outline',
  pdf: 'document-outline',
  spreadsheet: 'grid-outline',
  presentation: 'easel-outline',
  archive: 'archive-outline',
  other: 'document-outline',
};

const FILE_TYPE_COLORS: Record<string, string> = {
  document: '#3b82f6',
  image: '#10b981',
  video: '#8b5cf6',
  audio: '#f59e0b',
  pdf: '#ef4444',
  spreadsheet: '#059669',
  presentation: '#f97316',
  archive: '#6b7280',
  other: '#6b7280',
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

interface FileCardProps {
  file: CloudFile;
  onDelete: (id: string) => void;
  onShare: (id: string) => void;
}

export default function FileCard({ file, onDelete, onShare }: FileCardProps) {
  const { t } = useTranslation();
  const icon = FILE_TYPE_ICONS[file.type] ?? 'document-outline';
  const iconColor = FILE_TYPE_COLORS[file.type] ?? '#6b7280';

  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm">
      <View className="flex-row items-center">
        {/* File Icon */}
        <View className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 items-center justify-center mr-3">
          <Ionicons name={icon} size={24} color={iconColor} />
        </View>

        {/* File Info */}
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 dark:text-white" numberOfLines={1}>
            {file.name}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {formatFileSize(file.size)} \u2022 {new Date(file.updatedAt).toLocaleDateString()}
          </Text>
        </View>

        {/* Share indicator */}
        {file.shared && (
          <View className="bg-blue-100 dark:bg-blue-900/30 rounded-full px-2 py-0.5 mr-2">
            <Text className="text-xs text-blue-600 dark:text-blue-400">
              {t('cloudFiles.share')}
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View className="flex-row gap-2 mt-3">
        <Pressable
          className="flex-1 flex-row items-center justify-center bg-blue-50 dark:bg-blue-900/20 rounded-lg py-2 active:bg-blue-100 dark:active:bg-blue-900/40"
          onPress={() => onShare(file.id)}
          accessibilityRole="button"
          accessibilityLabel={t('cloudFiles.share')}
        >
          <Ionicons name="share-outline" size={16} color="#3b82f6" />
          <Text className="text-sm text-blue-600 dark:text-blue-400 ml-1">
            {t('cloudFiles.share')}
          </Text>
        </Pressable>
        <Pressable
          className="flex-row items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-2 active:bg-red-100 dark:active:bg-red-900/40"
          onPress={() => onDelete(file.id)}
          accessibilityRole="button"
          accessibilityLabel={t('cloudFiles.delete')}
        >
          <Ionicons name="trash-outline" size={16} color="#ef4444" />
        </Pressable>
      </View>
    </View>
  );
}
