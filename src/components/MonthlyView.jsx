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
  const [myClassOnly, setMyClassOnly] = useState(false);

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

  return (
    // 부모(main)의 전체 높이를 채우면서 스크롤 없이 표시
    <div style={styles.container}>

      {/* ── 월 네비게이터 + 힌트 ── */}
      <div style={styles.nav}>
        <button style={styles.navBtn} onClick={handlePrev}>‹</button>
        <span style={styles.monthLabel}>{formatMonthKo(year, month)}</span>
        <button style={styles.navBtn} onClick={handleNext}>›</button>
        <span style={styles.navHint}>날짜를 누르면 교시별 현황을 볼 수 있습니다.</span>
      </div>

      {/* ── 반별 통계 + X반만 보기 ── */}
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
              opacity: (myClassOnly && selectedClass && !isSelected) ? 0.3 : 1,
            }}>
              <span style={{ fontSize: 10, color: c.accent, fontWeight: 600 }}>{n}반</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: c.accent, lineHeight: 1 }}>{cnt}</span>
            </div>
          );
        })}
        <div style={styles.totalChip}>
          <span style={{ fontSize: 10, color: '#6B7280', fontWeight: 600 }}>전체</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{rentals.length}</span>
        </div>
        {selectedClass && (
          <button
            onClick={() => setMyClassOnly(v => !v)}
            style={{
              ...styles.filterBtn,
              background: myClassOnly ? CLASS_COLORS[selectedClass].bg : '#F3F4F6',
              color: myClassOnly ? CLASS_COLORS[selectedClass].accent : '#6B7280',
              border: `1.5px solid ${myClassOnly ? CLASS_COLORS[selectedClass].accent : '#E5E7EB'}`,
              fontWeight: myClassOnly ? 700 : 500,
            }}
          >
            {myClassOnly ? `✓ ${selectedClass}반만` : `${selectedClass}반만`}
          </button>
        )}
      </div>

      {/* ── 캘린더 (나머지 공간 채움) ── */}
      <div style={styles.cal}>
        {/* 요일 헤더 */}
        <div style={styles.dayHeaders}>
          {DAY_HEADERS.map((d, i) => (
            <div key={d} style={{
              ...styles.dayHeader,
              color: i === 0 ? '#EF4444' : i === 6 ? '#3B82F6' : '#6B7280',
            }}>{d}</div>
          ))}
        </div>

        {/* 날짜 그리드 — 주(row)마다 flex: 1로 균등 분배 */}
        <div style={styles.weeksWrap}>
          {weeks.map((week, wi) => (
            <div key={wi} style={styles.week}>
              {week.map(({ dateStr, isCurrentMonth, isToday, dayIndex }) => {
                const dayRentals = rentals.filter(r => r.date === dateStr);
                const filtered = (myClassOnly && selectedClass)
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
                      width: 18, height: 18,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {parseInt(dateStr.slice(8), 10)}
                    </div>
                    <div style={styles.dots}>
                      {filtered.slice(0, 3).map(r => {
                        const c = CLASS_COLORS[r.classNumber];
                        const done = r.status === 'completed';
                        return (
                          <div key={r.id} style={{
                            ...styles.dot,
                            background: done ? 'transparent' : c.accent,
                            border: done ? `1.5px solid ${c.accent}` : 'none',
                            opacity: done ? 0.6 : 1,
                          }} />
                        );
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
      </div>

      {sheetDate && (
        <DayDetailSheet
          dateStr={sheetDate}
          selectedClass={selectedClass}
          allRentals={allRentals}
          onClose={() => setSheetDate(null)}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: '8px',
    gap: 7,
    boxSizing: 'border-box',
    overflow: 'hidden',
  },

  // 월 네비게이터
  nav: {
    display: 'flex',
    alignItems: 'center',
    background: '#fff',
    borderRadius: 12,
    padding: '8px 10px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    border: '1px solid #E5E7EB',
    gap: 6,
    flexShrink: 0,
  },
  navBtn: {
    width: 30, height: 30, borderRadius: 8, background: '#F3F4F6', border: 'none',
    fontSize: 18, color: '#374151', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', lineHeight: 1, flexShrink: 0,
  },
  monthLabel: { fontSize: 15, fontWeight: 800, color: '#111827', flexShrink: 0 },
  navHint: {
    flex: 1, textAlign: 'right', fontSize: 10, color: '#9CA3AF', lineHeight: 1.3,
  },

  // 통계 행
  statsRow: {
    display: 'flex',
    gap: 5,
    alignItems: 'center',
    flexShrink: 0,
    flexWrap: 'nowrap',
    overflowX: 'auto',
  },
  statChip: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '5px 7px', borderRadius: 9, gap: 2, flexShrink: 0,
    minWidth: 36, transition: 'opacity 0.15s',
  },
  totalChip: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '5px 7px', borderRadius: 9, gap: 2, flexShrink: 0,
    minWidth: 36, background: '#F3F4F6', border: '1.5px solid #E5E7EB',
  },
  filterBtn: {
    flexShrink: 0, padding: '5px 9px', borderRadius: 20,
    fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap',
    transition: 'all 0.15s', WebkitTapHighlightColor: 'transparent',
    marginLeft: 'auto',
  },

  // 캘린더
  cal: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    border: '1px solid #E5E7EB',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    minHeight: 0,
  },
  dayHeaders: {
    display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
    background: '#F9FAFB', borderBottom: '1px solid #E5E7EB',
    flexShrink: 0,
  },
  dayHeader: { padding: '5px 0', textAlign: 'center', fontSize: 11, fontWeight: 700 },
  weeksWrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  week: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    borderBottom: '1px solid #F3F4F6',
    minHeight: 0,
  },
  dayCell: {
    padding: '3px',
    overflow: 'hidden',
    transition: 'background 0.1s',
    WebkitTapHighlightColor: 'rgba(0,0,0,0.05)',
    borderRight: '1px solid #F3F4F6',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  dayNum: {
    fontSize: 11, fontWeight: 500, lineHeight: 1,
    fontVariantNumeric: 'tabular-nums', flexShrink: 0,
  },
  dots: { display: 'flex', flexWrap: 'wrap', gap: 2 },
  dot: { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },
  more: { fontSize: 9, color: '#9CA3AF', fontWeight: 600, lineHeight: 1, alignSelf: 'center' },
};
