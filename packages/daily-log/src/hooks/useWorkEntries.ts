import { useState, useEffect, useCallback } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import type { WorkEntry } from '../types';

export function useWorkEntries() {
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Auth state detection via onAuthStateChanged
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  // Real-time Firestore subscription
  useEffect(() => {
    if (!isAuthenticated) {
      setEntries([]);
      setLoading(false);
      return;
    }

    const user = auth().currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const ref = firestore()
      .collection('users')
      .doc(user.uid)
      .collection('workEntries')
      .orderBy('createdAt', 'desc');

    const unsubscribe = ref.onSnapshot(
      (snapshot) => {
        const data: WorkEntry[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as WorkEntry[];
        setEntries(data);
        setLoading(false);
      },
      (error) => {
        console.error('Work entries snapshot error:', error);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [isAuthenticated]);

  const addEntry = useCallback(async (content: string) => {
    const user = auth().currentUser;
    if (!user) throw new Error('Not authenticated');

    const date = new Date().toISOString().split('T')[0];
    const ref = firestore()
      .collection('users')
      .doc(user.uid)
      .collection('workEntries');

    await ref.add({
      date,
      content,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  }, []);

  const updateEntry = useCallback(async (id: string, content: string) => {
    const user = auth().currentUser;
    if (!user) throw new Error('Not authenticated');

    const ref = firestore()
      .collection('users')
      .doc(user.uid)
      .collection('workEntries')
      .doc(id);

    await ref.update({
      content,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    const user = auth().currentUser;
    if (!user) throw new Error('Not authenticated');

    const ref = firestore()
      .collection('users')
      .doc(user.uid)
      .collection('workEntries')
      .doc(id);

    await ref.delete();
  }, []);

  const moveEntry = useCallback(async (id: string, newDate: string) => {
    const user = auth().currentUser;
    if (!user) throw new Error('Not authenticated');

    const ref = firestore()
      .collection('users')
      .doc(user.uid)
      .collection('workEntries')
      .doc(id);

    await ref.update({
      date: newDate,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  }, []);

  return {
    entries,
    loading,
    isAuthenticated,
    authChecked,
    addEntry,
    updateEntry,
    deleteEntry,
    moveEntry,
  };
}
