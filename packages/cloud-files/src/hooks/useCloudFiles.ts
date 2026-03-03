import { useState, useEffect, useCallback } from 'react';
import {
  safeGetJSON,
  safeSetItem,
  StorageKeys,
  eventBus,
  AppEvents,
} from '@mycircle/shared';
import type { CloudFile, FileType } from '@mycircle/shared';

function getFileType(mimeType: string): FileType {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
  if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('rar')) return 'archive';
  if (mimeType.includes('document') || mimeType.includes('text')) return 'document';
  return 'other';
}

export function useCloudFiles() {
  const [files, setFiles] = useState<CloudFile[]>(() => {
    return safeGetJSON<CloudFile[]>(StorageKeys.CLOUD_FILES_CACHE, []);
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    safeSetItem(StorageKeys.CLOUD_FILES_CACHE, JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    return eventBus.subscribe(AppEvents.CLOUD_FILES_CHANGED, () => {
      const fresh = safeGetJSON<CloudFile[]>(StorageKeys.CLOUD_FILES_CACHE, []);
      setFiles(fresh);
    });
  }, []);

  const uploadFile = useCallback(async (name: string, mimeType: string, size: number, uri: string) => {
    setLoading(true);
    try {
      const newFile: CloudFile = {
        id: `file_${Date.now()}`,
        name,
        type: getFileType(mimeType),
        size,
        mimeType,
        url: uri,
        ownerId: 'current-user',
        ownerName: 'Me',
        shared: false,
        sharedWith: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setFiles((prev) => [newFile, ...prev]);
      eventBus.publish(AppEvents.CLOUD_FILES_CHANGED);
      return newFile;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFile = useCallback((fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    eventBus.publish(AppEvents.CLOUD_FILES_CHANGED);
  }, []);

  const toggleShare = useCallback((fileId: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, shared: !f.shared, updatedAt: Date.now() } : f,
      ),
    );
    eventBus.publish(AppEvents.CLOUD_FILES_CHANGED);
  }, []);

  const myFiles = files.filter((f) => f.ownerId === 'current-user');
  const sharedFiles = files.filter((f) => f.shared);

  return { files, myFiles, sharedFiles, loading, uploadFile, deleteFile, toggleShare };
}
