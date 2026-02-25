import { useState, useEffect, useCallback } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useTranslation } from '@mycircle/shared';
import type { PublicNote, NoteInput } from '../types';

export function usePublicNotes() {
  const { t } = useTranslation();
  const [notes, setNotes] = useState<PublicNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = auth().currentUser;

  // Real-time subscription via onSnapshot
  useEffect(() => {
    const publicNotesRef = firestore()
      .collection('publicNotes')
      .orderBy('updatedAt', 'desc');

    const unsubscribe = publicNotesRef.onSnapshot(
      (snapshot: { docs: Array<{ id: string; data: () => Record<string, unknown> }> }) => {
        const data: PublicNote[] = snapshot.docs.map((doc: { id: string; data: () => Record<string, unknown> }) => ({
          id: doc.id,
          ...doc.data(),
        })) as PublicNote[];
        setNotes(data);
        setLoading(false);
        setError(null);
      },
      (err: { message?: string }) => {
        setError(err.message || t('notebook.loadError'));
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [t]);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  const publishNote = useCallback(
    async (data: NoteInput) => {
      if (!user) throw new Error('Not authenticated');
      const now = firestore.FieldValue.serverTimestamp();
      await firestore().collection('publicNotes').add({
        title: data.title,
        content: data.content,
        isPublic: true,
        createdBy: {
          uid: user.uid,
          displayName: user.displayName || 'Anonymous',
        },
        createdAt: now,
        updatedAt: now,
      });
    },
    [user],
  );

  const updateNote = useCallback(
    async (id: string, data: Partial<NoteInput>) => {
      if (!user) throw new Error('Not authenticated');
      await firestore()
        .collection('publicNotes')
        .doc(id)
        .update({
          ...data,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
    },
    [user],
  );

  const deleteNote = useCallback(
    async (id: string) => {
      if (!user) throw new Error('Not authenticated');
      await firestore().collection('publicNotes').doc(id).delete();
    },
    [user],
  );

  return { notes, loading, error, publishNote, updateNote, deleteNote, reload };
}
