import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

// Coleção de registros de um usuário: users/{uid}/records
const recordsRef = (uid) => collection(db, 'users', uid, 'records');

/**
 * Escuta em tempo real os registros do usuário.
 * Retorna a função de cancelamento do listener.
 */
export function subscribeToRecords(uid, onChange, onError) {
  const q = query(recordsRef(uid), orderBy('surgeryDate', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const records = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      onChange(records);
    },
    onError
  );
}

export async function addRecord(uid, data) {
  const { id: _ignore, ...payload } = data; // remove id local se existir
  await addDoc(recordsRef(uid), { ...payload, createdAt: new Date().toISOString() });
}

export async function updateRecord(uid, id, data) {
  const { id: _ignore, ...payload } = data;
  await updateDoc(doc(db, 'users', uid, 'records', id), payload);
}

export async function deleteRecord(uid, id) {
  await deleteDoc(doc(db, 'users', uid, 'records', id));
}

/**
 * Importa vários registros de uma vez (usado pelo import de JSON).
 * Usa batch write — até 500 por vez.
 */
export async function importRecords(uid, records) {
  const BATCH_SIZE = 400;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    records.slice(i, i + BATCH_SIZE).forEach((r) => {
      const { id: _ignore, ...payload } = r;
      const ref = doc(recordsRef(uid)); // novo ID gerado pelo Firestore
      batch.set(ref, payload);
    });
    await batch.commit();
  }
}
