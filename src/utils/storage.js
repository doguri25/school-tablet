import {
  collection, addDoc, deleteDoc, doc, updateDoc, query, onSnapshot
} from 'firebase/firestore';
import { db, isConfigured } from './firebase';

const COLLECTION = 'rentals';

// ── localStorage 폴백 (Firebase 미설정 시) ──────────────────────────
const LOCAL_KEY = 'hongbuk_tablet_rentals';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function localGetAll() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]'); } catch { return []; }
}
function localSave(rentals) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(rentals));
}

// ── 쓰기 연산 (Firebase 또는 localStorage) ──────────────────────────

export async function addRental({ date, period, classNumber }) {
  if (isConfigured && db) {
    await addDoc(collection(db, COLLECTION), {
      date, period, classNumber, createdAt: new Date().toISOString(),
    });
  } else {
    const all = localGetAll();
    if (all.find(r => r.date === date && r.period === period)) return;
    all.push({ id: generateId(), date, period, classNumber, createdAt: new Date().toISOString() });
    localSave(all);
  }
}

export async function deleteRental(id) {
  if (isConfigured && db) {
    await deleteDoc(doc(db, COLLECTION, id));
  } else {
    localSave(localGetAll().filter(r => r.id !== id));
  }
}

export async function updateRental(id, { classNumber }) {
  if (isConfigured && db) {
    await updateDoc(doc(db, COLLECTION, id), { classNumber });
  } else {
    const all = localGetAll();
    const idx = all.findIndex(r => r.id === id);
    if (idx !== -1) { all[idx] = { ...all[idx], classNumber }; localSave(all); }
  }
}

// ── 실시간 리스너 구독 (App.jsx에서 한 번만 호출) ─────────────────────
export function subscribeRentals(onUpdate, onConnectionChange) {
  if (isConfigured && db) {
    const q = query(collection(db, COLLECTION));

    let retryTimer = null;
    let unsub = null;

    function startListener() {
      if (unsub) unsub();

      unsub = onSnapshot(
        q,
        { includeMetadataChanges: false },
        snapshot => {
          const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          onUpdate(data);
          onConnectionChange?.('connected');
        },
        err => {
          console.error('Firestore 연결 오류:', err);
          onConnectionChange?.('error');
          // 5초 후 자동 재연결
          retryTimer = setTimeout(startListener, 5000);
        }
      );
    }

    startListener();

    return () => {
      if (retryTimer) clearTimeout(retryTimer);
      if (unsub) unsub();
    };
  } else {
    onUpdate(localGetAll());
    return () => {};
  }
}
