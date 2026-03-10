import React, { useState, useCallback, useEffect, useRef } from 'react';
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
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import {
  useTranslation,
  StorageKeys,
  AppEvents,
  eventBus,
  safeGetItem,
  safeSetItem,
  createLogger,
} from '@mycircle/shared';
import { useTheme } from '../../../src/contexts';

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

/** Build the HTML for the epub.js reader WebView */
function buildEpubReaderHtml(isDark: boolean, initialFontSize: number): string {
  const bgColor = isDark ? '#111827' : '#ffffff';
  const textColor = isDark ? '#e5e7eb' : '#1f2937';

  return `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<script src="https://cdn.jsdelivr.net/npm/epubjs/dist/epub.min.js"></script>
<style>
  html,body{margin:0;padding:0;height:100%;overflow:hidden;background:${bgColor};color:${textColor};}
  #viewer{width:100%;height:100%;}
  #loading{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-family:system-ui;color:${textColor};font-size:14px;}
</style>
</head><body>
<div id="loading">Loading...</div>
<div id="viewer"></div>
<script>
  var book = null;
  var rendition = null;
  var currentFontSize = ${initialFontSize};

  function loadBook(base64Data) {
    try {
      document.getElementById('loading').innerText = 'Rendering...';
      // Decode base64 to ArrayBuffer
      var binary = atob(base64Data);
      var len = binary.length;
      var bytes = new Uint8Array(len);
      for (var i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);

      book = ePub(bytes.buffer);
      rendition = book.renderTo('viewer', {
        width: '100%',
        height: '100%',
        flow: 'paginated',
        spread: 'none'
      });

      rendition.themes.default({
        body: {
          'background-color': '${bgColor}',
          'color': '${textColor}',
          'font-size': currentFontSize + 'px',
          'line-height': '1.6',
          'padding': '8px'
        },
        'p,div,span,h1,h2,h3,h4,h5,h6,li,a': {
          'color': '${textColor} !important'
        }
      });

      rendition.display().then(function() {
        document.getElementById('loading').style.display = 'none';
        sendLocationInfo();
      });

      rendition.on('relocated', function(location) {
        sendLocationInfo();
      });

      book.ready.then(function() {
        return book.locations.generate(1024);
      }).then(function() {
        sendLocationInfo();
      });

      // Notify RN of chapter info
      book.loaded.navigation.then(function(nav) {
        var chapters = nav.toc.map(function(ch, i) {
          return { index: i, label: ch.label.trim(), href: ch.href };
        });
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'chapters', chapters: chapters
        }));
      });

    } catch(e) {
      document.getElementById('loading').innerText = 'Error: ' + e.message;
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'error', message: e.message
      }));
    }
  }

  function sendLocationInfo() {
    if (!rendition || !book) return;
    var loc = rendition.currentLocation();
    var pct = 0;
    if (book.locations && loc && loc.start) {
      pct = book.locations.percentageFromCfi(loc.start.cfi);
      pct = Math.round(pct * 100);
    }
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'progress', percent: pct
    }));
  }

  function nextPage() {
    if (rendition) rendition.next();
  }

  function prevPage() {
    if (rendition) rendition.prev();
  }

  function setFontSize(size) {
    currentFontSize = size;
    if (rendition) {
      rendition.themes.default({
        body: { 'font-size': size + 'px' }
      });
    }
  }

  function goToChapter(href) {
    if (rendition) rendition.display(href);
  }

  function setDarkMode(dark) {
    var bg = dark ? '#111827' : '#ffffff';
    var fg = dark ? '#e5e7eb' : '#1f2937';
    document.body.style.background = bg;
    document.body.style.color = fg;
    if (rendition) {
      rendition.themes.default({
        body: { 'background-color': bg, 'color': fg },
        'p,div,span,h1,h2,h3,h4,h5,h6,li,a': { 'color': fg + ' !important' }
      });
    }
  }
</script>
</body></html>`;
}

export default function DigitalLibraryScreen() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const [readerReady, setReaderReady] = useState(false);
  const [readerLoading, setReaderLoading] = useState(false);
  const [chapters, setChapters] = useState<{ index: number; label: string; href: string }[]>([]);
  const [showToc, setShowToc] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);

  const webViewRef = useRef<WebView>(null);

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

  // Load epub into WebView after it mounts
  const loadEpubIntoWebView = useCallback(async (book: Book) => {
    setReaderLoading(true);
    try {
      const base64 = await FileSystem.readAsStringAsync(book.fileUri, {
        encoding: 'base64',
      });
      // Inject the base64 data into the WebView
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`loadBook("${base64}");true;`);
      }
    } catch (err) {
      logger.error('Failed to read EPUB file', err);
      Alert.alert(t('library.title'), t('library.uploadFailed'));
    } finally {
      setReaderLoading(false);
    }
  }, [t]);

  // Handle messages from the WebView
  const handleWebViewMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'chapters') {
          setChapters(data.chapters);
          if (selectedBook) {
            const updated = books.map((b) =>
              b.id === selectedBook.id ? { ...b, chapterCount: data.chapters.length } : b,
            );
            saveBooks(updated);
          }
        } else if (data.type === 'progress') {
          setCurrentProgress(data.percent);
          if (selectedBook) {
            updateProgress(selectedBook.id, data.percent);
          }
        } else if (data.type === 'error') {
          logger.error('EPUB render error', data.message);
        }
      } catch {
        // ignore non-JSON messages
      }
    },
    [selectedBook, books, saveBooks, updateProgress],
  );

  // Font size change
  const handleFontSizeChange = useCallback(
    (newSize: number) => {
      const clamped = Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, newSize));
      setFontSize(clamped);
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`setFontSize(${clamped});true;`);
      }
    },
    [],
  );

  // Navigate pages
  const handleNextPage = useCallback(() => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript('nextPage();true;');
    }
  }, []);

  const handlePrevPage = useCallback(() => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript('prevPage();true;');
    }
  }, []);

  // Navigate to chapter
  const handleGoToChapter = useCallback((href: string) => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`goToChapter("${href.replace(/"/g, '\\"')}");true;`);
    }
    setShowToc(false);
  }, []);

  // Sync dark mode to WebView when theme changes
  useEffect(() => {
    if (webViewRef.current && selectedBook) {
      webViewRef.current.injectJavaScript(`setDarkMode(${isDark});true;`);
    }
  }, [isDark, selectedBook]);

  // Reader view
  if (selectedBook) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900">
        {/* Reader header */}
        <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <TouchableOpacity
            onPress={() => {
              setSelectedBook(null);
              setChapters([]);
              setReaderReady(false);
              setCurrentProgress(0);
            }}
            className="min-h-[44px] min-w-[44px] justify-center"
            accessibilityLabel={t('library.backToLibrary')}
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
          <TouchableOpacity
            onPress={() => setShowToc(!showToc)}
            className="min-h-[44px] min-w-[44px] justify-center items-end"
            accessibilityLabel={t('library.tableOfContents')}
            accessibilityRole="button"
          >
            <Text className="text-blue-500 dark:text-blue-400 text-xs">
              {t('library.tableOfContents')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Table of contents overlay */}
        {showToc && chapters.length > 0 && (
          <View className="absolute top-16 right-2 left-2 z-10 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg max-h-80">
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="p-2">
                <Text className="text-sm font-semibold text-gray-800 dark:text-white px-3 py-2">
                  {t('library.tableOfContents')}
                </Text>
                {chapters.map((ch) => (
                  <TouchableOpacity
                    key={ch.index}
                    onPress={() => handleGoToChapter(ch.href)}
                    className="py-3 px-3 border-b border-gray-100 dark:border-gray-700 min-h-[44px] justify-center"
                    accessibilityLabel={`${t('library.chapters')} ${ch.index + 1}: ${ch.label}`}
                    accessibilityRole="button"
                  >
                    <Text className="text-sm text-gray-700 dark:text-gray-300" numberOfLines={2}>
                      {ch.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* EPUB WebView Reader */}
        <View className="flex-1">
          {readerLoading && (
            <View className="absolute top-0 left-0 right-0 bottom-0 z-10 justify-center items-center bg-white/80 dark:bg-gray-900/80">
              <ActivityIndicator size="large" />
              <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {t('library.reading')}...
              </Text>
            </View>
          )}
          <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: buildEpubReaderHtml(isDark, fontSize) }}
            style={{ flex: 1 }}
            javaScriptEnabled
            domStorageEnabled
            allowFileAccess
            allowUniversalAccessFromFileURLs
            onMessage={handleWebViewMessage}
            onLoadEnd={() => {
              setReaderReady(true);
              loadEpubIntoWebView(selectedBook);
            }}
            accessibilityLabel={t('library.reading')}
          />
        </View>

        {/* Bottom controls */}
        <View className="px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          {/* Progress bar */}
          <View className="mb-3">
            <View className="flex-row justify-between mb-1">
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {t('library.progress')}
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {currentProgress}%
              </Text>
            </View>
            <View className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <View
                className="h-full bg-blue-500 dark:bg-blue-400 rounded-full"
                style={{ width: `${currentProgress}%` }}
              />
            </View>
          </View>

          {/* Navigation and font controls */}
          <View className="flex-row items-center justify-between">
            {/* Prev page */}
            <TouchableOpacity
              onPress={handlePrevPage}
              className="min-h-[44px] min-w-[44px] items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg px-4"
              accessibilityLabel={t('library.prevChapter')}
              accessibilityRole="button"
            >
              <Text className="text-gray-700 dark:text-gray-300 font-medium">{'\u2190'}</Text>
            </TouchableOpacity>

            {/* Font size controls */}
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => handleFontSizeChange(fontSize - 2)}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center"
                accessibilityLabel={t('library.fontSize')}
                accessibilityRole="button"
              >
                <Text className="text-sm text-gray-700 dark:text-gray-300">A-</Text>
              </TouchableOpacity>
              <Text className="text-xs text-gray-500 dark:text-gray-400">{fontSize}px</Text>
              <TouchableOpacity
                onPress={() => handleFontSizeChange(fontSize + 2)}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center"
                accessibilityLabel={t('library.fontSize')}
                accessibilityRole="button"
              >
                <Text className="text-sm text-gray-700 dark:text-gray-300">A+</Text>
              </TouchableOpacity>
            </View>

            {/* Next page */}
            <TouchableOpacity
              onPress={handleNextPage}
              className="min-h-[44px] min-w-[44px] items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg px-4"
              accessibilityLabel={t('library.nextChapter')}
              accessibilityRole="button"
            >
              <Text className="text-gray-700 dark:text-gray-300 font-medium">{'\u2192'}</Text>
            </TouchableOpacity>
          </View>
        </View>
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
                accessibilityLabel={`${t('library.openBook')}: ${book.title}`}
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
                {t('library.confirmDelete')} &quot;{deleteTarget.title}&quot;?
              </Text>
              <View className="flex-row justify-end gap-2">
                <TouchableOpacity
                  onPress={() => setDeleteTarget(null)}
                  className="px-4 py-2 rounded-lg min-h-[44px] justify-center"
                  accessibilityLabel={t('library.backToLibrary')}
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
