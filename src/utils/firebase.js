import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from './firebaseConfig';

export const isConfigured = firebaseConfig.apiKey !== 'YOUR_API_KEY';

export let db = null;

if (isConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (e) {
    console.error('Firebase 초기화 실패:', e);
  }
}
