import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import firebaseConfig from './firebaseConfig';

const isConfigured = firebaseConfig.apiKey !== 'YOUR_API_KEY';

export let db = null;
export let firebaseReady = false;

if (isConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    firebaseReady = true;
  } catch (e) {
    console.error('Firebase 초기화 실패:', e);
  }
}

export { isConfigured };
