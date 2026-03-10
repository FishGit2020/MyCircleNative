import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
  Image,
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

const logger = createLogger('DigitalLibrary');

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUri: string | null;
  fileUri: string;
  fileSize: number;
  chapterCount: number;
  uploadedAt: number;
  readingProgress: number; // 0-100
  currentChapter: number;
  fontSize: number;
}

const DEFAULT_FONT_SIZE = 16;
const FONT_SIZE_MIN = 12;
const FONT_SIZE_MAX = 28;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DigitalLibraryScreen() {
  const { t } = useTranslation();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);

  // Load books from storage
  const loadBooks = useCallback(() => {
    try {
      const stored = safeGetItem(StorageKeys.DIGITAL_LIBRARY_CACHE);
      if (stored) {
        setBooks(JSON.parse(stored));
      }
    } catch (err) {
      logger.error('Failed to load books', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBooks();
    const unsub = eventBus.subscribe(AppEvents.DIGITAL_LIBRARY_CHANGED, loadBooks);
    return unsub;
  }, [loadBooks]);

  // Save books to storage
  const saveBooks = useCallback((updated: Book[]) => {
    setBooks(updated);
    try {
      safeSetItem(StorageKeys.DIGITAL_LIBRARY_CACHE, JSON.stringify(updated));
    } catch (err) {
      logger.error('Failed to save books', err);
    }
    eventBus.publish(AppEvents.DIGITAL_LIBRARY_CHANGED);
  }, []);

  // Upload a book via document picker
  const handleUpload = useCallback(async () => {
    try {
      setUploading(true);
      // Dynamic import to avoid crash if not installed
      const DocumentPicker = await import('expo-document-picker');
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/epub+zip',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) {
        setUploading(false);
        return;
      }

      const asset = result.assets[0];
      const newBook: Book = {
        id: `book-${Date.now()}`,
        title: asset.name?.replace(/\.epub$/i, '') || t('library.title'),
        author: '',
        description: '',
        coverUri: null,
        fileUri: asset.uri,
        fileSize: asset.size || 0,
        chapterCount: 0,
        uploadedAt: Date.now(),
        readingProgress: 0,
        currentChapter: 0,
        fontSize: DEFAULT_FONT_SIZE,
      };

      saveBooks([...books, newBook]);
      logger.info('Book uploaded', { bookId: newBook.id });
    } catch (err) {
      logger.error('Upload failed', err);
      Alert.alert(t('library.title'), String(err));
    } finally {
      setUploading(false);
    }
  }, [books, saveBooks, t]);

  // Delete a book
  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    const updated = books.filter((b) => b.id !== deleteTarget.id);
    saveBooks(updated);
    setDeleteTarget(null);
    if (selectedBook?.id === deleteTarget.id) {
      setSelectedBook(null);
    }
  }, [deleteTarget, books, saveBooks, selectedBook]);

  // Update reading progress
  const updateProgress = useCallback(
    (bookId: string, progress: number) => {
      const updated = books.map((b) =>
        b.id === bookId ? { ...b, readingProgress: Math.min(100, Math.max(0, progress)) } : b,
      );
      saveBooks(updated);
    },
    [books, saveBooks],
  );

  // Reader view
  if (selectedBook) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900">
        {/* Reader header */}
        <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <TouchableOpacity
            onPress={() => setSelectedBook(null)}
            className="min-h-[44px] min-w-[44px] justify-center"
            accessibilityLabel={t('library.back' as any)}
            accessibilityRole="button"
          >
            <Text className="text-blue-500 dark:text-blue-400 text-sm">
              {'\u2190'} {t('library.title')}
            </Text>
          </TouchableOpacity>
          <Text
            className="text-sm font-medium text-gray-800 dark:text-white flex-1 text-center mx-2"
            numberOfLines={1}
          >
            {selectedBook.title}
          </Text>
          <View className="w-10" />
        </View>

        <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
          {/* Book info */}
          <View className="mb-6">
            {selectedBook.coverUri ? (
              <Image
                source={{ uri: selectedBook.coverUri }}
                className="w-32 h-48 rounded-lg self-center mb-4"
                resizeMode="cover"
              />
            ) : (
              <View className="w-32 h-48 rounded-lg self-center mb-4 bg-blue-100 dark:bg-blue-900/30 items-center justify-center">
                <Text className="text-4xl text-blue-300 dark:text-blue-600">{'\u{1F4D6}'}</Text>
              </View>
            )}
            <Text className="text-lg font-bold text-gray-900 dark:text-white text-center">
              {selectedBook.title}
            </Text>
            {selectedBook.author ? (
              <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                {t('library.author')}: {selectedBook.author}
              </Text>
            ) : null}
          </View>

          {/* Reading progress */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('library.progress')}: {selectedBook.readingProgress}%
            </Text>
            <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <View
                className="h-full bg-blue-500 dark:bg-blue-400 rounded-full"
                style={{ width: `${selectedBook.readingProgress}%` }}
              />
            </View>
            {/* Simulate progress buttons */}
            <View className="flex-row gap-2 mt-3">
              <TouchableOpacity
                onPress={() => updateProgress(selectedBook.id, selectedBook.readingProgress + 10)}
                className="px-3 py-2 rounded-lg bg-blue-500 dark:bg-blue-600 min-h-[44px] justify-center"
                accessibilityLabel={t('library.reading')}
                accessibilityRole="button"
              >
                <Text className="text-white text-sm font-medium">+10%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => updateProgress(selectedBook.id, 0)}
                className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 min-h-[44px] justify-center"
                accessibilityLabel={t('library.progress')}
                accessibilityRole="button"
              >
                <Text className="text-gray-700 dark:text-gray-300 text-sm">{t('library.progress')}: 0%</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Font size adjustment */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('library.fontSize')}
            </Text>
            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                onPress={() => setFontSize(Math.max(FONT_SIZE_MIN, fontSize - 2))}
                className="w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center"
                accessibilityLabel={t('library.fontSize')}
                accessibilityRole="button"
              >
                <Text className="text-lg text-gray-700 dark:text-gray-300">A-</Text>
              </TouchableOpacity>
              <Text className="text-sm text-gray-600 dark:text-gray-400">{fontSize}px</Text>
              <TouchableOpacity
                onPress={() => setFontSize(Math.min(FONT_SIZE_MAX, fontSize + 2))}
                className="w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center"
                accessibilityLabel={t('library.fontSize')}
                accessibilityRole="button"
              >
                <Text className="text-lg text-gray-700 dark:text-gray-300">A+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Placeholder for EPUB rendering */}
          <View className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 mb-6">
            <Text className="text-sm text-yellow-700 dark:text-yellow-300 text-center">
              {/* Full EPUB rendering placeholder — would use a WebView or native EPUB library */}
              EPUB reader view coming soon. File stored locally at: {selectedBook.fileUri ? '...' : 'N/A'}
            </Text>
          </View>

          {/* Chapter list placeholder */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('library.chapters')}
            </Text>
            {selectedBook.chapterCount === 0 ? (
              <Text className="text-sm text-gray-400 dark:text-gray-500">
                {t('library.noBooks')}
              </Text>
            ) : (
              Array.from({ length: selectedBook.chapterCount }, (_, i) => (
                <TouchableOpacity
                  key={i}
                  className="py-3 px-3 border-b border-gray-100 dark:border-gray-800 min-h-[44px] justify-center"
                  accessibilityLabel={`${t('library.chapters')} ${i + 1}`}
                  accessibilityRole="button"
                >
                  <Text className="text-sm text-gray-700 dark:text-gray-300">
                    {t('library.chapters')} {i + 1}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>

          <View className="h-20" />
        </ScrollView>
      </View>
    );
  }

  // Book list view
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
            {t('library.title')}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('library.subtitle')}
          </Text>
        </View>

        {/* Upload button */}
        <TouchableOpacity
          onPress={handleUpload}
          disabled={uploading}
          className={`mb-6 p-4 rounded-xl border-2 border-dashed items-center ${
            uploading
              ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          accessibilityLabel={t('library.upload')}
          accessibilityRole="button"
        >
          {uploading ? (
            <>
              <ActivityIndicator size="small" className="mb-2" />
              <Text className="text-sm text-blue-500 dark:text-blue-400">
                {t('library.uploading')}
              </Text>
            </>
          ) : (
            <>
              <Text className="text-2xl mb-2">{'\u{1F4E4}'}</Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                {t('library.upload')}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Book list */}
        {books.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-4xl mb-4">{'\u{1F4DA}'}</Text>
            <Text className="text-gray-500 dark:text-gray-400">
              {t('library.noBooks')}
            </Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap gap-4">
            {books.map((book) => (
              <TouchableOpacity
                key={book.id}
                onPress={() => setSelectedBook(book)}
                className="w-[47%] bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                accessibilityLabel={`${t('library.reading')}: ${book.title}`}
                accessibilityRole="button"
              >
                {book.coverUri ? (
                  <Image
                    source={{ uri: book.coverUri }}
                    className="w-full h-36"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-36 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 items-center justify-center">
                    <Text className="text-4xl">{'\u{1F4D6}'}</Text>
                  </View>
                )}
                <View className="p-3">
                  <Text
                    className="text-sm font-semibold text-gray-900 dark:text-white"
                    numberOfLines={2}
                  >
                    {book.title}
                  </Text>
                  {book.author ? (
                    <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1" numberOfLines={1}>
                      {book.author}
                    </Text>
                  ) : null}
                  <View className="flex-row items-center gap-2 mt-2">
                    <Text className="text-xs text-gray-400 dark:text-gray-500">
                      {formatFileSize(book.fileSize)}
                    </Text>
                  </View>
                  {/* Progress bar */}
                  {book.readingProgress > 0 && (
                    <View className="mt-2">
                      <View className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <View
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${book.readingProgress}%` }}
                        />
                      </View>
                      <Text className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {book.readingProgress}%
                      </Text>
                    </View>
                  )}
                </View>
                {/* Delete button */}
                <TouchableOpacity
                  onPress={() => setDeleteTarget(book)}
                  className="px-3 pb-2 min-h-[44px] justify-center"
                  accessibilityLabel={`${t('library.delete')}: ${book.title}`}
                  accessibilityRole="button"
                >
                  <Text className="text-xs text-red-500 dark:text-red-400">
                    {t('library.delete')}
                  </Text>
                </TouchableOpacity>
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
                {t('library.delete')} &quot;{deleteTarget.title}&quot;?
              </Text>
              <View className="flex-row justify-end gap-2">
                <TouchableOpacity
                  onPress={() => setDeleteTarget(null)}
                  className="px-4 py-2 rounded-lg min-h-[44px] justify-center"
                  accessibilityLabel={t('library.back' as any)}
                  accessibilityRole="button"
                >
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    {'\u2190'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDelete}
                  className="px-4 py-2 rounded-lg min-h-[44px] justify-center bg-red-500 dark:bg-red-600"
                  accessibilityLabel={t('library.delete')}
                  accessibilityRole="button"
                >
                  <Text className="text-sm font-medium text-white">
                    {t('library.delete')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
