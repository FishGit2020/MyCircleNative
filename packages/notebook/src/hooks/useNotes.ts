import { useState, useEffect, useCallback } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {
  useTranslation,
  StorageKeys,
  safeSetItem,
  eventBus,
  WindowEvents,
} from '@mycircle/shared';
import type { Note, NoteInput } from '../types';

export function useNotes() {
  const { t } = useTranslation();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = auth().currentUser;

  // Real-time subscription via onSnapshot
  useEffect(() => {
    if (!user) {
      setNotes([]);
      setLoading(false);
      return;
    }

    const notesRef = firestore()
      .collection('users')
      .doc(user.uid)
      .collection('notes')
      .orderBy('updatedAt', 'desc');

    const unsubscribe = notesRef.onSnapshot(
      (snapshot: { docs: Array<{ id: string; data: () => Record<string, unknown> }> }) => {
        const data: Note[] = snapshot.docs.map((doc: { id: string; data: () => Record<string, unknown> }) => ({
          id: doc.id,
          ...doc.data(),
        })) as Note[];
        setNotes(data);
        setLoading(false);
        setError(null);

        // Cache note count for dashboard widget
        try {
          safeSetItem(StorageKeys.NOTEBOOK_CACHE, JSON.stringify(data.length));
        } catch {
          /* ignore */
        }
        eventBus.publish(WindowEvents.NOTEBOOK_CHANGED);
      },
      (err: { message?: string }) => {
        setError(err.message || t('notebook.loadError'));
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user, t]);

  const reload = useCallback(() => {
    // With onSnapshot, reload is not strictly needed, but we
    // force a re-subscription by toggling loading state.
    setLoading(true);
    setError(null);
  }, []);

  const saveNote = useCallback(
    async (id: string | null, data: NoteInput) => {
      if (!user) throw new Error('Not authenticated');
      const notesRef = firestore()
        .collection('users')
        .doc(user.uid)
        .collection('notes');
      const now = firestore.FieldValue.serverTimestamp();

      if (id) {
        await notesRef.doc(id).update({
          title: data.title,
          content: data.content,
          updatedAt: now,
        });
      } else {
        await notesRef.add({
          title: data.title,
          content: data.content,
          createdAt: now,
          updatedAt: now,
        });
      }
    },
    [user],
  );

  const deleteNote = useCallback(
    async (id: string) => {
      if (!user) throw new Error('Not authenticated');
      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('notes')
        .doc(id)
        .delete();
    },
    [user],
  );

  return { notes, loading, error, saveNote, deleteNote, reload };
}
