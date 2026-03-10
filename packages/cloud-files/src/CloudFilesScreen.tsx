import { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import auth from '@react-native-firebase/auth';
import { useTranslation } from '@mycircle/shared';
import { useCloudFiles } from './hooks/useCloudFiles';
import FileList from './components/FileList';

export default function CloudFilesScreen() {
  const { t } = useTranslation();
  const { myFiles, sharedFiles, loading, uploadFile, deleteFile, toggleShare } = useCloudFiles();
  const [activeTab, setActiveTab] = useState<'my' | 'shared'>('my');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  const handleUpload = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      const fileInfo = await FileSystem.getInfoAsync(asset.uri);
      const fileSize = fileInfo.exists ? (fileInfo as { size?: number }).size || 0 : 0;

      await uploadFile(
        asset.name,
        asset.mimeType || 'application/octet-stream',
        fileSize,
        asset.uri,
      );
    } catch {
      Alert.alert(t('cloudFiles.uploadError'));
    }
  }, [uploadFile, t]);

  const handleDelete = useCallback(
    (fileId: string) => {
      Alert.alert(
        t('cloudFiles.delete'),
        t('cloudFiles.deleteConfirm'),
        [
          { text: t('cloudFiles.rename'), style: 'cancel' },
          { text: t('cloudFiles.delete'), style: 'destructive', onPress: () => deleteFile(fileId) },
        ],
      );
    },
    [deleteFile, t],
  );

  // Loading auth state
  if (!authChecked) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </View>
    );
  }

  // Auth wall — show sign-in message if not authenticated
  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="px-4 pt-4 flex-1">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('cloudFiles.title')}
          </Text>
          <View className="flex-1 justify-center items-center">
            <Ionicons name="lock-closed-outline" size={48} color="#9ca3af" />
            <Text className="text-gray-500 dark:text-gray-400 text-center mt-4">
              {t('cloudFiles.signInToAccess')}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pt-4 pb-20"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('cloudFiles.title')}
          </Text>
          <Pressable
            className="w-11 h-11 rounded-full bg-blue-500 dark:bg-blue-600 items-center justify-center active:bg-blue-600 dark:active:bg-blue-700"
            onPress={handleUpload}
            accessibilityRole="button"
            accessibilityLabel={t('cloudFiles.upload')}
          >
            <Ionicons name="cloud-upload-outline" size={22} color="white" />
          </Pressable>
        </View>
        <Text className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {t('cloudFiles.subtitle')}
        </Text>

        {/* Tabs */}
        <View className="flex-row mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <Pressable
            className={`flex-1 py-2.5 rounded-md items-center ${
              activeTab === 'my' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''
            }`}
            onPress={() => setActiveTab('my')}
            accessibilityRole="tab"
            accessibilityLabel={t('cloudFiles.myFiles')}
          >
            <Text
              className={`text-sm font-medium ${
                activeTab === 'my'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {t('cloudFiles.myFiles')}
            </Text>
          </Pressable>
          <Pressable
            className={`flex-1 py-2.5 rounded-md items-center ${
              activeTab === 'shared' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''
            }`}
            onPress={() => setActiveTab('shared')}
            accessibilityRole="tab"
            accessibilityLabel={t('cloudFiles.sharedFiles')}
          >
            <Text
              className={`text-sm font-medium ${
                activeTab === 'shared'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {t('cloudFiles.sharedFiles')}
            </Text>
          </Pressable>
        </View>

        {/* File List */}
        <FileList
          files={activeTab === 'my' ? myFiles : sharedFiles}
          onDelete={handleDelete}
          onShare={toggleShare}
          emptyMessage={
            activeTab === 'my' ? t('cloudFiles.noFiles') : t('cloudFiles.noSharedFiles')
          }
        />
      </ScrollView>
    </View>
  );
}
