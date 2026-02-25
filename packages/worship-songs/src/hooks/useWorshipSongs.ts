import { useState, useEffect, useCallback, useMemo } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {
  StorageKeys,
  safeGetItem,
  safeSetItem,
  safeGetJSON,
  eventBus,
  WindowEvents,
} from '@mycircle/shared';
import type { WorshipSong } from '../types';

function getCachedSongs(): WorshipSong[] {
  return safeGetJSON<WorshipSong[]>(StorageKeys.WORSHIP_SONGS_CACHE, []);
}

function setCachedSongs(songs: WorshipSong[]) {
  try {
    safeSetItem(StorageKeys.WORSHIP_SONGS_CACHE, JSON.stringify(songs));
  } catch {
    /* ignore */
  }
}

export function loadFavorites(): Set<string> {
  try {
    const stored = safeGetItem(StorageKeys.WORSHIP_FAVORITES);
    if (stored) return new Set(JSON.parse(stored));
  } catch {
    /* ignore */
  }
  return new Set();
}

export function saveFavorites(favs: Set<string>) {
  try {
    safeSetItem(StorageKeys.WORSHIP_FAVORITES, JSON.stringify([...favs]));
    eventBus.publish(WindowEvents.WORSHIP_FAVORITES_CHANGED);
  } catch {
    /* ignore */
  }
}

export function useWorshipSongs() {
  const [songs, setSongs] = useState<WorshipSong[]>(getCachedSongs);
  const [loading, setLoading] = useState(true);

  const user = auth().currentUser;
  const isAuthenticated = !!user;

  // Real-time subscription via onSnapshot
  useEffect(() => {
    const songsRef = firestore()
      .collection('worshipSongs')
      .orderBy('updatedAt', 'desc');

    const unsubscribe = songsRef.onSnapshot(
      (snapshot) => {
        const data: WorshipSong[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as WorshipSong[];
        setSongs(data);
        setCachedSongs(data);
        setLoading(false);
        eventBus.publish(WindowEvents.WORSHIP_SONGS_CHANGED);
      },
      (err) => {
        console.error('Failed to load worship songs:', err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const addSong = useCallback(
    async (song: Omit<WorshipSong, 'id' | 'createdAt' | 'updatedAt'>) => {
      const currentUser = auth().currentUser;
      if (!currentUser) throw new Error('Not authenticated');
      const now = firestore.FieldValue.serverTimestamp();
      const docRef = await firestore().collection('worshipSongs').add({
        ...song,
        createdBy: currentUser.uid,
        createdAt: now,
        updatedAt: now,
      });
      return docRef.id;
    },
    [],
  );

  const updateSong = useCallback(
    async (id: string, updates: Partial<WorshipSong>) => {
      const now = firestore.FieldValue.serverTimestamp();
      await firestore().collection('worshipSongs').doc(id).update({
        ...updates,
        updatedAt: now,
      });
    },
    [],
  );

  const deleteSong = useCallback(async (id: string) => {
    await firestore().collection('worshipSongs').doc(id).delete();
  }, []);

  const getSong = useCallback(
    async (id: string): Promise<WorshipSong | null> => {
      try {
        const doc = await firestore().collection('worshipSongs').doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() } as WorshipSong;
      } catch (err) {
        console.error('Failed to get worship song:', id, err);
        return null;
      }
    },
    [],
  );

  const refresh = useCallback(() => {
    setLoading(true);
  }, []);

  return {
    songs,
    loading,
    isAuthenticated,
    addSong,
    updateSong,
    deleteSong,
    getSong,
    refresh,
  };
}
