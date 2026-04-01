import { useState, useEffect, useMemo } from 'react';
import { getCurrentPeriod, getPeriodLabel, getPeriodTime, LUNCH } from '../utils/schedule';
import { today } from '../utils/dateUtils';

const CLASS_COLORS = {
  1: { bg: '#DBEAFE', text: '#1D4ED8' },
  2: { bg: '#DCFCE7', text: '#15803D' },
  3: { bg: '#F3E8FF', text: '#7E22CE' },
  4: { bg: '#FFEDD5', text: '#C2410C' },
  5: { bg: '#FFE4E6', text: '#BE123C' },
  6: { bg: '#CCFBF1', text: '#0F766E' },
};

const DAY_SHORT = ['일', '월', '화', '수', '목', '금', '토'];

export default function Header({ allRentals }) {
  const [now, setNow] = useState(new Date());
  const [currentPeriod, setCurrentPeriod] = useState(getCurrentPeriod);

  useEffect(() => {
    const tick = () => { setNow(new Date()); setCurrentPeriod(getCurrentPeriod()); };
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
  const mo = now.getMonth() + 1;
  const da = now.getDate();
  const dy = DAY_SHORT[now.getDay()];

  // 현재 교시 대여 기록 (allRentals에서 실시간 반영)
  const currentRental = useMemo(() => {
    if (!currentPeriod || currentPeriod === 'lunch') return null;
    const todayStr = today();
    return allRentals.find(r => r.date === todayStr && r.period === currentPeriod) || null;
  }, [allRentals, currentPeriod]);

  const status = useMemo(() => {
    if (currentPeriod === null) return { type: 'outside' };
    if (currentPeriod === 'lunch') return { type: 'lunch' };
    return {
      type: 'period',
      periodLabel: getPeriodLabel(currentPeriod),
      periodTime: getPeriodTime(currentPeriod),
      rental: currentRental,
    };
  }, [currentPeriod, currentRental]);

  return (
    <header style={styles.header}>
      <div style={styles.top}>
        <div style={styles.titleWrap} onClick={() => window.location.reload()}>
          <span style={styles.school}>홍북초 3학년</span>
          <span style={styles.title}>태블릿 대여장부</span>
        </div>
        <div style={styles.clockWrap}>
          <div style={styles.dateBig}>{mo}월 {da}일<span style={styles.dayTag}>({dy})</span></div>
          <div style={styles.clock}>{timeStr}</div>
        </div>
      </div>
      <LocationBar status={status} />
    </header>
  );
}

function LocationBar({ status }) {
  let icon, main, sub, barStyle;

  if (status.type === 'outside') {
    icon = '🏫'; main = '연구실'; sub = '수업 시간 외';
    barStyle = styles.barGray;
  } else if (status.type === 'lunch') {
    icon = '🍱'; main = '연구실'; sub = '점심시간 (12:10~13:00)';
    barStyle = styles.barYellow;
  } else if (!status.rental) {
    icon = '🏫'; main = '연구실'; sub = `${status.periodLabel} · ${status.periodTime}`;
    barStyle = styles.barGray;
  } else {
    const c = CLASS_COLORS[status.rental.classNumber] || {};
    icon = '📱';
    main = `3학년 ${status.rental.classNumber}반 사용중`;
    sub = `${status.periodLabel} · ${status.periodTime}`;
    barStyle = { ...styles.barColored, background: c.bg, color: c.text };
  }

  return (
    <div style={{ ...styles.locationBar, ...barStyle }}>
      <span style={styles.locIcon}>{icon}</span>
      <span style={styles.locMain}>{main}</span>
      <span style={styles.locSub}>{sub}</span>
    </div>
  );
}

const styles = {
  header: { background: 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)', color: '#fff' },
  top: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px 8px' },
  titleWrap: {
    display: 'flex', flexDirection: 'column', gap: 1,
    cursor: 'pointer', userSelect: 'none', WebkitTapHighlightColor: 'transparent',
  },
  school: { fontSize: 11, opacity: 0.75, fontWeight: 500, letterSpacing: '0.3px' },
  title: { fontSize: 17, fontWeight: 800, letterSpacing: '-0.4px' },
  clockWrap: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateBig: { fontSize: 17, fontWeight: 700, opacity: 0.92, letterSpacing: '-0.3px', lineHeight: 1 },
  dayTag: { fontSize: 14, fontWeight: 500, opacity: 0.75 },
  clock: { fontSize: 28, fontWeight: 800, letterSpacing: '1px', fontVariantNumeric: 'tabular-nums', lineHeight: 1 },
  locationBar: { display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', fontSize: 13 },
  barGray: { background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)' },
  barYellow: { background: 'rgba(254,240,138,0.2)', color: '#FDE68A' },
  barColored: { borderRadius: 0 },
  locIcon: { fontSize: 15 },
  locMain: { fontWeight: 700, fontSize: 13 },
  locSub: { fontSize: 12, opacity: 0.8, marginLeft: 2 },
};
