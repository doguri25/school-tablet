import { useState, useCallback } from 'react';
import Header from './components/Header';
import ClassSelector from './components/ClassSelector';
import DailyView from './components/DailyView';
import WeeklyView from './components/WeeklyView';
import MonthlyView from './components/MonthlyView';

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
  const [rentalVersion, setRentalVersion] = useState(0);

  const handleRentalChange = useCallback(() => {
    setRentalVersion(v => v + 1);
  }, []);

  function handleSelectClass(classNum) {
    setSelectedClass(classNum);
    localStorage.setItem(SAVED_CLASS_KEY, String(classNum));
  }

  return (
    <div style={styles.app}>
      <Header rentalVersion={rentalVersion} />
      <ClassSelector selectedClass={selectedClass} onSelectClass={handleSelectClass} />

      <main style={styles.main}>
        {activeTab === 'daily' && (
          <DailyView selectedClass={selectedClass} onRentalChange={handleRentalChange} />
        )}
        {activeTab === 'weekly' && (
          <WeeklyView selectedClass={selectedClass} />
        )}
        {activeTab === 'monthly' && (
          <MonthlyView selectedClass={selectedClass} />
        )}
      </main>

      {/* 하단 탭 바 */}
      <nav style={styles.bottomNav}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.navBtn,
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
      </nav>
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
  main: {
    flex: 1,
    overflowY: 'auto',
    paddingBottom: 70,
  },
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 480,
    display: 'flex',
    background: '#fff',
    borderTop: '1px solid #E5E7EB',
    boxShadow: '0 -2px 10px rgba(0,0,0,0.06)',
    zIndex: 100,
    paddingBottom: 'env(safe-area-inset-bottom)',
  },
  navBtn: {
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
  navIcon: {
    lineHeight: 1,
    transition: 'font-size 0.15s',
  },
  navLabel: {
    fontSize: 11,
    transition: 'all 0.15s',
  },
  activeDot: {
    position: 'absolute',
    top: 6,
    width: 4,
    height: 4,
    borderRadius: '50%',
    background: '#1D4ED8',
  },
};
