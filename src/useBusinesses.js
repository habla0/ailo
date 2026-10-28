import { useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db, enabled } from './firebase';
import sample from './sample.json';

// Live list of businesses from Firestore (or local sample data in demo mode).
export function useBusinesses(user) {
  const [items, setItems] = useState(enabled ? [] : sample);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!enabled) return undefined;
    return onSnapshot(
      collection(db, 'businesses'),
      (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => setError(err.message)
    );
  }, []);

  async function add(b) {
    const data = { ...b, ownerId: user.uid };
    if (!enabled) return setItems((prev) => [...prev, { ...data, id: String(Date.now()) }]);
    await addDoc(collection(db, 'businesses'), { ...data, createdAt: serverTimestamp() });
  }

  async function remove(id) {
    if (!enabled) return setItems((prev) => prev.filter((b) => b.id !== id));
    await deleteDoc(doc(db, 'businesses', id));
  }

  return { items, add, remove, error };
}
