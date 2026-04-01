import { useState, useMemo } from 'react';
import { today, getMonthCalendar, formatMonthKo, prevMonth, nextMonth } from '../utils/dateUtils';
import DayDetailSheet from './DayDetailSheet';

const CLASS_COLORS = {
  1: { bg: '#DBEAFE', accent: '#1D4ED8', border: '#93C5FD' },
  2: { bg: '#DCFCE7', accent: '#15803D', border: '#86EFAC' },
  3: { bg: '#F3E8FF', accent: '#7E22CE', border: '#D8B4FE' },
  4: { bg: '#FFEDD5', accent: '#C2410C', border: '#FDBA74' },
  5: { bg: '#FFE4E6', accent: '#BE123C', border: '#FCA5A5' },
  6: { bg: '#CCFBF1', accent: '#0F766E', border: '#5EEAD4' },
};

const DAY_HEADERS = ['일', '월', '화', '수', '목', '금', '토'];

export default function MonthlyView({ selectedClass, allRentals }) {
  const todayStr = today();
  const nowDate = new Date();
  const [year, setYear] = useState(nowDate.getFullYear());
  const [month, setMonth] = useState(nowDate.getMonth() + 1);
  const [sheetDate, setSheetDate] = useState(null);

  const weeks = getMonthCalendar(year, month);

  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
  const rentals = useMemo(
    () => allRentals.filter(r => r.date.startsWith(monthPrefix)),
    [allRentals, monthPrefix]
  );

  const classCounts = {};
  rentals.forEach(r => { classCounts[r.classNumber] = (classCounts[r.classNumber] || 0) + 1; });

  function handlePrev() { const p = prevMonth(year, month); setYear(p.year); setMonth(p.month); }
  function handleNext() { const n = nextMonth(year, month); setYear(n.year); setMonth(n.month); }

  function handleDayClick(dateStr, isCurrentMonth) {
    if (!isCurrentMonth) return;
    setSheetDate(dateStr);
  }

  function handleSheetClose() {
    setSheetDate(null);
  }

  return (
    <div style={styles.container}>
      <div style={styles.nav}>
        <button style={styles.navBtn} onClick={handlePrev}>‹</button>
        <span style={styles.monthLabel}>{formatMonthKo(year, month)}</span>
        <button style={styles.navBtn} onClick={handleNext}>›</button>
      </div>

      <div style={styles.statsRow}>
        {[1,2,3,4,5,6].map(n => {
          const c = CLASS_COLORS[n];
          const cnt = classCounts[n] || 0;
          const isSelected = selectedClass === n;
          return (
            <div key={n} style={{
              ...styles.statChip,
              background: c.bg,
              border: `1.5px solid ${isSelected ? c.accent : c.border}`,
              opacity: selectedClass && !isSelected ? 0.5 : 1,
            }}>
              <span style={{ fontSize: 11, color: c.accent, fontWeight: 600 }}>{n}반</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: c.accent, lineHeight: 1 }}>{cnt}</span>
            </div>
          );
        })}
        <div style={styles.totalChip}>
          <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>전체</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{rentals.length}</span>
        </div>
      </div>

      <div style={styles.hint}>날짜를 누르면 해당 날의 교시별 현황을 볼 수 있습니다.</div>

      <div style={styles.cal}>
        <div style={styles.dayHeaders}>
          {DAY_HEADERS.map((d, i) => (
            <div key={d} style={{
              ...styles.dayHeader,
              color: i === 0 ? '#EF4444' : i === 6 ? '#3B82F6' : '#6B7280',
            }}>{d}</div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} style={styles.week}>
            {week.map(({ dateStr, isCurrentMonth, isToday, dayIndex }) => {
              const dayRentals = rentals.filter(r => r.date === dateStr);
              const filtered = selectedClass
                ? dayRentals.filter(r => r.classNumber === selectedClass)
                : dayRentals;
              const isSun = dayIndex === 0;
              const isSat = dayIndex === 6;

              return (
                <div
                  key={dateStr}
                  onClick={() => handleDayClick(dateStr, isCurrentMonth)}
                  style={{
                    ...styles.dayCell,
                    background: isToday ? '#EFF6FF' : '#fff',
                    opacity: isCurrentMonth ? 1 : 0.25,
                    borderBottom: '1px solid #F3F4F6',
                    borderRight: '1px solid #F3F4F6',
                    cursor: isCurrentMonth ? 'pointer' : 'default',
                  }}
                >
                  <div style={{
                    ...styles.dayNum,
                    color: isToday ? '#fff'
                      : isSun ? '#EF4444'
                      : isSat ? '#3B82F6'
                      : '#374151',
                    background: isToday ? '#1D4ED8' : 'transparent',
                    borderRadius: isToday ? '50%' : 0,
                    width: 20, height: 20,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {parseInt(dateStr.slice(8), 10)}
                  </div>
                  <div style={styles.dots}>
                    {filtered.slice(0, 3).map(r => {
                      const c = CLASS_COLORS[r.classNumber];
                      return <div key={r.id} style={{ ...styles.dot, background: c.accent }} />;
                    })}
                    {filtered.length > 3 && (
                      <span style={styles.more}>+{filtered.length - 3}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {sheetDate && (
        <DayDetailSheet
          dateStr={sheetDate}
          selectedClass={selectedClass}
          allRentals={allRentals}
          onClose={handleSheetClose}
        />
      )}
    </div>
  );
}

const styles = {
  container: { padding: '12px', display: 'flex', flexDirection: 'column', gap: 12 },
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: '#fff', borderRadius: 12, padding: '10px 14px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB',
  },
  navBtn: {
    width: 34, height: 34, borderRadius: 8, background: '#F3F4F6', border: 'none',
    fontSize: 20, color: '#374151', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', lineHeight: 1,
  },
  monthLabel: { fontSize: 16, fontWeight: 800, color: '#111827' },
  statsRow: { display: 'flex', gap: 6, overflowX: 'auto', padding: '2px 0' },
  statChip: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '7px 10px', borderRadius: 10, gap: 3, flexShrink: 0, minWidth: 44,
    transition: 'opacity 0.15s',
  },
  totalChip: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '7px 10px', borderRadius: 10, gap: 3, flexShrink: 0, minWidth: 44,
    background: '#F3F4F6', border: '1.5px solid #E5E7EB',
  },
  hint: { fontSize: 11, color: '#9CA3AF', textAlign: 'center' },
  cal: {
    background: '#fff', borderRadius: 12, overflow: 'hidden',
    border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  dayHeaders: {
    display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
    background: '#F9FAFB', borderBottom: '1px solid #E5E7EB',
  },
  dayHeader: { padding: '7px 0', textAlign: 'center', fontSize: 12, fontWeight: 700 },
  week: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' },
  dayCell: {
    minHeight: 56, padding: '4px', overflow: 'hidden',
    transition: 'background 0.1s', WebkitTapHighlightColor: 'rgba(0,0,0,0.05)',
  },
  dayNum: {
    fontSize: 12, fontWeight: 500, marginBottom: 3, lineHeight: 1,
    fontVariantNumeric: 'tabular-nums', flexShrink: 0,
  },
  dots: { display: 'flex', flexWrap: 'wrap', gap: 2 },
  dot: { width: 7, height: 7, borderRadius: '50%', flexShrink: 0 },
  more: { fontSize: 9, color: '#9CA3AF', fontWeight: 600, lineHeight: 1, alignSelf: 'center' },
};
