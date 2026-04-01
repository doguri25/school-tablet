import { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import ClassSelector from './components/ClassSelector';
import DailyView from './components/DailyView';
import WeeklyView from './components/WeeklyView';
import MonthlyView from './components/MonthlyView';
import { subscribeRentals } from './utils/storage';
import { isConfigured } from './utils/firebase';

const SAVED_CLASS_KEY = 'hongbuk_my_class';

const TABS = [
  { id: 'daily',   icon: '📋', label: '등록' },
  { id: 'weekly',  icon: '📅', label: '주별' },
  { id: 'monthly', icon: '🗓', label: '월별' },
];

export default function App() {
  const [selectedClass, setSelectedClass] = useState(() => {
    const saved = localStorage.getItem(SAVED_CLASS_KEY);
    return saved ? parseInt(saved, 10) : null;
  });
  const [activeTab, setActiveTab] = useState('daily');

  // 전체 대여 데이터 (Firestore 또는 localStorage — 실시간 동기화)
  const [allRentals, setAllRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connStatus, setConnStatus] = useState('connecting'); // connecting | connected | error

  useEffect(() => {
    const unsub = subscribeRentals(
      data => {
        setAllRentals(data);
        setLoading(false);
        setConnStatus('connected');
      },
      status => setConnStatus(status)
    );
    return unsub;
  }, []);

  function handleSelectClass(classNum) {
    setSelectedClass(classNum);
    localStorage.setItem(SAVED_CLASS_KEY, String(classNum));
  }

  return (
    <div style={styles.app}>
      <Header allRentals={allRentals} />
      <ClassSelector selectedClass={selectedClass} onSelectClass={handleSelectClass} />

      {/* 연결 상태 배너 */}
      {!isConfigured && (
        <div style={styles.setupBanner}>
          ⚠️ 현재 이 기기에서만 저장됩니다. 선생님 간 공유하려면 Firebase 설정이 필요합니다.
        </div>
      )}
      {isConfigured && connStatus === 'error' && (
        <div style={styles.errorBanner}>
          ⚠️ 서버 연결 끊김 — 자동 재연결 중...
        </div>
      )}

      <div style={styles.tabBar}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.tabBtn,
                color: isActive ? '#1D4ED8' : '#9CA3AF',
              }}
            >
              <span style={{ ...styles.navIcon, fontSize: isActive ? 22 : 20 }}>{tab.icon}</span>
              <span style={{
                ...styles.navLabel,
                fontWeight: isActive ? 700 : 400,
                color: isActive ? '#1D4ED8' : '#9CA3AF',
              }}>
                {tab.label}
              </span>
              {isActive && <div style={styles.activeDot} />}
            </button>
          );
        })}
      </div>

      <main style={styles.main}>
        {loading ? (
          <div style={styles.loading}>데이터 불러오는 중...</div>
        ) : (
          <>
            {activeTab === 'daily' && (
              <DailyView
                selectedClass={selectedClass}
                allRentals={allRentals}
              />
            )}
            {activeTab === 'weekly' && (
              <WeeklyView selectedClass={selectedClass} allRentals={allRentals} />
            )}
            {activeTab === 'monthly' && (
              <MonthlyView selectedClass={selectedClass} allRentals={allRentals} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

const styles = {
  app: {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    background: '#F8FAFC',
    maxWidth: 480,
    margin: '0 auto',
    position: 'relative',
    boxShadow: '0 0 40px rgba(0,0,0,0.08)',
  },
  errorBanner: {
    padding: '7px 14px',
    background: '#FEE2E2',
    borderBottom: '1px solid #FECACA',
    fontSize: 12,
    color: '#991B1B',
    textAlign: 'center',
  },
  setupBanner: {
    padding: '8px 14px',
    background: '#FEF3C7',
    borderBottom: '1px solid #FDE68A',
    fontSize: 12,
    color: '#92400E',
    textAlign: 'center',
  },
  tabBar: {
    display: 'flex',
    background: '#fff',
    borderTop: '1px solid #E5E7EB',
    boxShadow: '0 -2px 10px rgba(0,0,0,0.06)',
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 480,
    zIndex: 100,
    paddingBottom: 'env(safe-area-inset-bottom)',
  },
  tabBtn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 0 6px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    gap: 2,
  },
  navIcon: { lineHeight: 1, transition: 'font-size 0.15s' },
  navLabel: { fontSize: 11, transition: 'all 0.15s' },
  activeDot: {
    position: 'absolute',
    top: 6,
    width: 4,
    height: 4,
    borderRadius: '50%',
    background: '#1D4ED8',
  },
  main: { flex: 1, overflowY: 'auto', paddingBottom: 70 },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    fontSize: 14,
    color: '#9CA3AF',
  },
};
