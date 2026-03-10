import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
  Share,
  Dimensions,
} from 'react-native';
import {
  useTranslation,
  StorageKeys,
  AppEvents,
  eventBus,
  safeGetItem,
  safeSetItem,
  createLogger,
} from '@mycircle/shared';

const logger = createLogger('DocScanner');

interface ScanEntry {
  id: string;
  uri: string;
  name: string;
  createdAt: number;
  width: number;
  height: number;
  rotation: number;
}

export default function DocScannerScreen() {
  const { t } = useTranslation();
  const [scans, setScans] = useState<ScanEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [selectedScan, setSelectedScan] = useState<ScanEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ScanEntry | null>(null);

  // Load scan history
  const loadScans = useCallback(() => {
    try {
      const stored = safeGetItem(StorageKeys.DOC_SCANNER_CACHE);
      if (stored) {
        setScans(JSON.parse(stored));
      }
    } catch (err) {
      logger.error('Failed to load scans', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadScans();
    const unsub = eventBus.subscribe(AppEvents.DOC_SCANNER_CHANGED, loadScans);
    return unsub;
  }, [loadScans]);

  const saveScans = useCallback((updated: ScanEntry[]) => {
    setScans(updated);
    try {
      safeSetItem(StorageKeys.DOC_SCANNER_CACHE, JSON.stringify(updated));
    } catch (err) {
      logger.error('Failed to save scans', err);
    }
    eventBus.publish(AppEvents.DOC_SCANNER_CHANGED);
  }, []);

  // Capture photo using image picker
  const handleCapture = useCallback(async () => {
    try {
      setProcessing(true);
      const ImagePicker = await import('expo-image-picker');
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.9,
        allowsEditing: false,
      });

      if (result.canceled || !result.assets?.length) {
        setProcessing(false);
        return;
      }

      const asset = result.assets[0];
      setCapturedUri(asset.uri);
      setRotation(0);
      setProcessing(false);
    } catch (err) {
      logger.error('Camera capture failed', err);
      // Fallback to gallery if camera not available
      try {
        const ImagePicker = await import('expo-image-picker');
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.9,
        });
        if (!result.canceled && result.assets?.length) {
          setCapturedUri(result.assets[0].uri);
          setRotation(0);
        }
      } catch (fallbackErr) {
        logger.error('Gallery fallback failed', fallbackErr);
        Alert.alert(t('scanner.title'), String(fallbackErr));
      }
      setProcessing(false);
    }
  }, [t]);

  // Save captured image
  const handleSave = useCallback(async () => {
    if (!capturedUri) return;
    setProcessing(true);

    try {
      // Save file locally using expo-file-system
      const FileSystem = await import('expo-file-system');
      const fileName = `scan-${Date.now()}.jpg`;
      const destUri = `${FileSystem.Paths.cache.uri}${fileName}`;
      await FileSystem.copyAsync({ from: capturedUri, to: destUri });

      const newScan: ScanEntry = {
        id: `scan-${Date.now()}`,
        uri: destUri,
        name: fileName,
        createdAt: Date.now(),
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').width * 1.4,
        rotation,
      };

      saveScans([newScan, ...scans]);
      setCapturedUri(null);
      setRotation(0);
      logger.info('Scan saved', { scanId: newScan.id });
    } catch (err) {
      logger.error('Save failed', err);
      // If file system not available, save with original URI
      const newScan: ScanEntry = {
        id: `scan-${Date.now()}`,
        uri: capturedUri,
        name: `scan-${Date.now()}.jpg`,
        createdAt: Date.now(),
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').width * 1.4,
        rotation,
      };
      saveScans([newScan, ...scans]);
      setCapturedUri(null);
      setRotation(0);
    } finally {
      setProcessing(false);
    }
  }, [capturedUri, rotation, scans, saveScans]);

  // Delete a scan
  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    const updated = scans.filter((s) => s.id !== deleteTarget.id);
    saveScans(updated);
    setDeleteTarget(null);
    if (selectedScan?.id === deleteTarget.id) {
      setSelectedScan(null);
    }
  }, [deleteTarget, scans, saveScans, selectedScan]);

  // Share a scan
  const handleShare = useCallback(async (scan: ScanEntry) => {
    try {
      await Share.share({
        url: scan.uri,
        message: scan.name,
      });
    } catch (err) {
      logger.error('Share failed', err);
    }
  }, []);

  // Captured image preview & edit view
  if (capturedUri) {
    return (
      <View className="flex-1 bg-black">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 bg-black/80">
          <TouchableOpacity
            onPress={() => { setCapturedUri(null); setRotation(0); }}
            className="min-h-[44px] min-w-[44px] justify-center"
            accessibilityLabel={t('scanner.retake')}
            accessibilityRole="button"
          >
            <Text className="text-white text-sm">{t('scanner.retake')}</Text>
          </TouchableOpacity>
          <Text className="text-white text-sm font-medium">{t('scanner.title')}</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={processing}
            className="min-h-[44px] min-w-[44px] justify-center items-end"
            accessibilityLabel={t('scanner.save')}
            accessibilityRole="button"
          >
            {processing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-blue-400 text-sm font-medium">{t('scanner.save')}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Image preview */}
        <View className="flex-1 items-center justify-center">
          <Image
            source={{ uri: capturedUri }}
            style={{
              width: Dimensions.get('window').width - 32,
              height: (Dimensions.get('window').width - 32) * 1.4,
              transform: [{ rotate: `${rotation}deg` }],
            }}
            resizeMode="contain"
          />
        </View>

        {/* Controls */}
        <View className="flex-row justify-center gap-6 py-4 bg-black/80">
          {/* Rotate left */}
          <TouchableOpacity
            onPress={() => setRotation((r) => (r - 90) % 360)}
            className="w-14 h-14 rounded-full bg-white/20 items-center justify-center"
            accessibilityLabel={t('scanner.title')}
            accessibilityRole="button"
          >
            <Text className="text-white text-lg">{'\u21BA'}</Text>
          </TouchableOpacity>
          {/* Rotate right */}
          <TouchableOpacity
            onPress={() => setRotation((r) => (r + 90) % 360)}
            className="w-14 h-14 rounded-full bg-white/20 items-center justify-center"
            accessibilityLabel={t('scanner.title')}
            accessibilityRole="button"
          >
            <Text className="text-white text-lg">{'\u21BB'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Scan detail view
  if (selectedScan) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <TouchableOpacity
            onPress={() => setSelectedScan(null)}
            className="min-h-[44px] min-w-[44px] justify-center"
            accessibilityLabel={t('scanner.history')}
            accessibilityRole="button"
          >
            <Text className="text-blue-500 dark:text-blue-400 text-sm">
              {'\u2190'} {t('scanner.history')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleShare(selectedScan)}
            className="min-h-[44px] min-w-[44px] justify-center items-end"
            accessibilityLabel={t('scanner.share')}
            accessibilityRole="button"
          >
            <Text className="text-blue-500 dark:text-blue-400 text-sm">{t('scanner.share')}</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center p-4">
          <Image
            source={{ uri: selectedScan.uri }}
            style={{
              width: Dimensions.get('window').width - 32,
              height: (Dimensions.get('window').width - 32) * 1.4,
              transform: [{ rotate: `${selectedScan.rotation}deg` }],
            }}
            resizeMode="contain"
            className="rounded-lg"
          />
        </View>
        <View className="flex-row justify-center gap-4 px-4 pb-6">
          <TouchableOpacity
            onPress={() => handleShare(selectedScan)}
            className="px-6 py-3 bg-blue-500 dark:bg-blue-600 rounded-xl min-h-[44px] justify-center"
            accessibilityLabel={t('scanner.share')}
            accessibilityRole="button"
          >
            <Text className="text-white font-medium">{t('scanner.share')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setDeleteTarget(selectedScan)}
            className="px-6 py-3 bg-red-500 dark:bg-red-600 rounded-xl min-h-[44px] justify-center"
            accessibilityLabel={t('scanner.delete')}
            accessibilityRole="button"
          >
            <Text className="text-white font-medium">{t('scanner.delete')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Main view
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center py-12">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 px-4 pb-20" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6 mt-4">
          <Text className="text-2xl font-bold text-gray-800 dark:text-white">
            {t('scanner.title')}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('scanner.subtitle')}
          </Text>
        </View>

        {/* Capture button */}
        <TouchableOpacity
          onPress={handleCapture}
          disabled={processing}
          className="mb-6 p-6 bg-blue-500 dark:bg-blue-600 rounded-xl items-center min-h-[80px] justify-center"
          accessibilityLabel={t('scanner.capture')}
          accessibilityRole="button"
        >
          {processing ? (
            <>
              <ActivityIndicator size="small" color="white" className="mb-2" />
              <Text className="text-white text-sm">{t('scanner.processing')}</Text>
            </>
          ) : (
            <>
              <Text className="text-3xl mb-2">{'\u{1F4F7}'}</Text>
              <Text className="text-white font-semibold">{t('scanner.capture')}</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Scan history */}
        <View className="mb-4">
          <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
            {t('scanner.history')}
          </Text>
        </View>

        {scans.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-4xl mb-4">{'\u{1F4C4}'}</Text>
            <Text className="text-gray-500 dark:text-gray-400">
              {t('scanner.noScans')}
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {scans.map((scan) => (
              <TouchableOpacity
                key={scan.id}
                onPress={() => setSelectedScan(scan)}
                className="flex-row bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden min-h-[80px]"
                accessibilityLabel={scan.name}
                accessibilityRole="button"
              >
                <Image
                  source={{ uri: scan.uri }}
                  className="w-20 h-20"
                  resizeMode="cover"
                />
                <View className="flex-1 p-3 justify-center">
                  <Text className="text-sm font-medium text-gray-800 dark:text-white" numberOfLines={1}>
                    {scan.name}
                  </Text>
                  <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {new Date(scan.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View className="flex-row items-center pr-3 gap-2">
                  <TouchableOpacity
                    onPress={() => handleShare(scan)}
                    className="min-h-[44px] min-w-[44px] items-center justify-center"
                    accessibilityLabel={`${t('scanner.share')}: ${scan.name}`}
                    accessibilityRole="button"
                  >
                    <Text className="text-blue-500 dark:text-blue-400 text-xs">{t('scanner.share')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setDeleteTarget(scan)}
                    className="min-h-[44px] min-w-[44px] items-center justify-center"
                    accessibilityLabel={`${t('scanner.delete')}: ${scan.name}`}
                    accessibilityRole="button"
                  >
                    <Text className="text-red-500 dark:text-red-400 text-xs">{t('scanner.delete')}</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View className="h-20" />
      </ScrollView>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setDeleteTarget(null)}>
          <View className="flex-1 justify-center items-center bg-black/50 px-4">
            <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6">
              <Text className="text-gray-800 dark:text-white mb-4">
                {t('scanner.delete')} &quot;{deleteTarget.name}&quot;?
              </Text>
              <View className="flex-row justify-end gap-2">
                <TouchableOpacity
                  onPress={() => setDeleteTarget(null)}
                  className="px-4 py-2 rounded-lg min-h-[44px] justify-center"
                  accessibilityLabel={t('scanner.title')}
                  accessibilityRole="button"
                >
                  <Text className="text-sm text-gray-600 dark:text-gray-400">{'\u2190'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDelete}
                  className="px-4 py-2 rounded-lg min-h-[44px] justify-center bg-red-500 dark:bg-red-600"
                  accessibilityLabel={t('scanner.delete')}
                  accessibilityRole="button"
                >
                  <Text className="text-sm font-medium text-white">{t('scanner.delete')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
