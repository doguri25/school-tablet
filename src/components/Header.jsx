import { useState, useEffect } from 'react';
import { getCurrentPeriod, getPeriodLabel, getPeriodTime, LUNCH } from '../utils/schedule';
import { getRentalByDatePeriod } from '../utils/storage';
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

function getCurrentStatus() {
  const period = getCurrentPeriod();
  if (period === null) return { type: 'outside' };
  if (period === 'lunch') return { type: 'lunch' };
  const rental = getRentalByDatePeriod(today(), period);
  return { type: 'period', period, periodLabel: getPeriodLabel(period), periodTime: getPeriodTime(period), rental };
}

export default function Header({ rentalVersion }) {
  const [now, setNow] = useState(new Date());
  const [status, setStatus] = useState(getCurrentStatus);

  useEffect(() => {
    const tick = () => { setNow(new Date()); setStatus(getCurrentStatus()); };
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => { setStatus(getCurrentStatus()); }, [rentalVersion]);

  const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
  const mo = now.getMonth() + 1;
  const da = now.getDate();
  const dy = DAY_SHORT[now.getDay()];

  return (
    <header style={styles.header}>
      <div style={styles.top}>
        <div style={styles.titleWrap}>
          <span style={styles.school}>홍북초 3학년</span>
          <span style={styles.title}>태블릿 대여장부</span>
        </div>
        <div style={styles.clockWrap}>
          <div style={styles.dateSmall}>{mo}월 {da}일({dy})</div>
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
  header: {
    background: 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)',
    color: '#fff',
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px 8px',
  },
  titleWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },
  school: {
    fontSize: 11,
    opacity: 0.75,
    fontWeight: 500,
    letterSpacing: '0.3px',
  },
  title: {
    fontSize: 17,
    fontWeight: 800,
    letterSpacing: '-0.4px',
  },
  clockWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  dateSmall: {
    fontSize: 11,
    opacity: 0.75,
  },
  clock: {
    fontSize: 26,
    fontWeight: 700,
    letterSpacing: '1px',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.1,
  },
  locationBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 16px',
    fontSize: 13,
  },
  barGray: {
    background: 'rgba(255,255,255,0.12)',
    color: 'rgba(255,255,255,0.9)',
  },
  barYellow: {
    background: 'rgba(254,240,138,0.2)',
    color: '#FDE68A',
  },
  barColored: {
    borderRadius: 0,
  },
  locIcon: {
    fontSize: 15,
  },
  locMain: {
    fontWeight: 700,
    fontSize: 13,
  },
  locSub: {
    fontSize: 12,
    opacity: 0.8,
    marginLeft: 2,
  },
};
