import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
} from 'firebase/firestore';
import firebaseConfig from './firebaseConfig';

const isConfigured = firebaseConfig.apiKey !== 'YOUR_API_KEY';

export let db = null;
export let firebaseReady = false;

if (isConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    // 로컬 캐시 활성화: 쓰기가 즉시 로컬에 반영 → onSnapshot 즉각 발동
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
    firebaseReady = true;
  } catch (e) {
    // persistentLocalCache 미지원 브라우저 폴백
    try {
      const app2 = initializeApp(firebaseConfig, 'fallback');
      db = getFirestore(app2);
      firebaseReady = true;
    } catch (e2) {
      console.error('Firebase 초기화 실패:', e2);
    }
  }
}

export { isConfigured };
