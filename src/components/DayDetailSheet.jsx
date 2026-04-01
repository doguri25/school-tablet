import { useState, useEffect, useRef, useMemo } from 'react';
import { getPeriodsForDate, getCurrentPeriod } from '../utils/schedule';
import { addRental, deleteRental, updateRental } from '../utils/storage';
import { formatDateKo, getDayLabel, today } from '../utils/dateUtils';
import ConfirmDialog from './ConfirmDialog';

const CLASS_COLORS = {
  1: { bg: '#DBEAFE', border: '#93C5FD', accent: '#1D4ED8', light: '#EFF6FF' },
  2: { bg: '#DCFCE7', border: '#86EFAC', accent: '#15803D', light: '#F0FDF4' },
  3: { bg: '#F3E8FF', border: '#D8B4FE', accent: '#7E22CE', light: '#FAF5FF' },
  4: { bg: '#FFEDD5', border: '#FDBA74', accent: '#C2410C', light: '#FFF7ED' },
  5: { bg: '#FFE4E6', border: '#FCA5A5', accent: '#BE123C', light: '#FFF1F2' },
  6: { bg: '#CCFBF1', border: '#5EEAD4', accent: '#0F766E', light: '#F0FDFA' },
};

export default function DayDetailSheet({ dateStr, selectedClass, allRentals, onClose }) {
  const [currentPeriod, setCurrentPeriod] = useState(getCurrentPeriod);
  const [changeConfirm, setChangeConfirm] = useState(null);
  const sheetRef = useRef(null);

  const periods = getPeriodsForDate(dateStr);
  const isToday = dateStr === today();

  useEffect(() => {
    setCurrentPeriod(getCurrentPeriod());
    const id = setInterval(() => setCurrentPeriod(getCurrentPeriod()), 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // allRentals에서 해당 날짜 필터 — 실시간 자동 반영
  const rentals = useMemo(
    () => allRentals.filter(r => r.date === dateStr),
    [allRentals, dateStr]
  );

  function getRentalForPeriod(period) {
    return rentals.find(r => r.period === period) || null;
  }

  function handleRegister(period) {
    if (!selectedClass) return;
    if (getRentalForPeriod(period)) return;
    addRental({ date: dateStr, period, classNumber: selectedClass });
  }

  function handleDelete(id) {
    deleteRental(id);
  }

  function handleCardClick(rental) {
    if (!selectedClass || !rental || rental.classNumber === selectedClass) return;
    setChangeConfirm({ rental, fromClass: rental.classNumber, toClass: selectedClass });
  }

  function handleChangeConfirm() {
    if (!changeConfirm) return;
    updateRental(changeConfirm.rental.id, { classNumber: changeConfirm.toClass });
    setChangeConfirm(null);
  }

  const dayLabel = `${formatDateKo(dateStr)} (${getDayLabel(dateStr)})`;

  return (
    <>
      <div style={styles.overlay} onClick={onClose} />

      <div ref={sheetRef} style={styles.sheet}>
        <div style={styles.handle} />

        <div style={styles.sheetHeader}>
          <div>
            <div style={styles.sheetDate}>{dayLabel}</div>
            {isToday && <span style={styles.todayBadge}>오늘</span>}
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {!selectedClass && (
          <div style={styles.noClass}>내 반을 먼저 선택해주세요</div>
        )}

        <div style={styles.list}>
          {periods.map((p, idx) => {
            const rental = getRentalForPeriod(p.period);
            const isCurrent = isToday && currentPeriod === p.period;
            const c = rental ? CLASS_COLORS[rental.classNumber] : null;
            const isChangeable = rental && selectedClass && rental.classNumber !== selectedClass;
            const isLast = idx === periods.length - 1;

            return (
              <div
                key={p.period}
                onClick={() => isChangeable && handleCardClick(rental)}
                style={{
                  ...styles.row,
                  background: rental ? c.light : '#fff',
                  borderBottom: isLast ? 'none' : '1px solid #F3F4F6',
                  cursor: isChangeable ? 'pointer' : 'default',
                }}
              >
                <div style={{ ...styles.currentBar, background: isCurrent ? '#F59E0B' : 'transparent' }} />

                <div style={styles.periodMeta}>
                  <div style={{
                    ...styles.periodBadge,
                    background: isCurrent ? '#FEF3C7' : '#F3F4F6',
                    color: isCurrent ? '#92400E' : '#374151',
                  }}>
                    {p.period}교시
                  </div>
                  <div style={styles.periodTime}>{p.start}~{p.end}</div>
                </div>

                <div style={styles.statusArea}>
                  {rental ? (
                    <div style={{ ...styles.classBadge, background: c.bg, color: c.accent, border: `1px solid ${c.border}` }}>
                      {rental.classNumber}반 사용중
                      {isChangeable && <span style={styles.changeArrow}> → {selectedClass}반</span>}
                    </div>
                  ) : (
                    <div style={styles.freeBadge}>연구실</div>
                  )}
                </div>

                <div style={styles.actionArea}>
                  {rental ? (
                    <button
                      style={styles.returnBtn}
                      onClick={e => { e.stopPropagation(); handleDelete(rental.id); }}
                    >
                      반납
                    </button>
                  ) : selectedClass ? (
                    <button
                      style={{ ...styles.registerBtn, background: CLASS_COLORS[selectedClass].accent }}
                      onClick={() => handleRegister(p.period)}
                    >
                      등록
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {changeConfirm && (
        <ConfirmDialog
          message={`${changeConfirm.fromClass}반 → ${changeConfirm.toClass}반으로 변경합니다.`}
          onConfirm={handleChangeConfirm}
          onCancel={() => setChangeConfirm(null)}
        />
      )}
    </>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200 },
  sheet: {
    position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
    width: '100%', maxWidth: 480, background: '#fff', borderRadius: '20px 20px 0 0',
    zIndex: 201, paddingBottom: 'env(safe-area-inset-bottom)',
    maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
  },
  handle: { width: 40, height: 4, borderRadius: 2, background: '#D1D5DB', margin: '12px auto 0' },
  sheetHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '12px 16px 10px', borderBottom: '1px solid #F3F4F6',
  },
  sheetDate: { fontSize: 16, fontWeight: 700, color: '#111827' },
  todayBadge: {
    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
    background: '#1D4ED8', color: '#fff', marginTop: 4, display: 'inline-block',
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: '50%', background: '#F3F4F6', border: 'none',
    fontSize: 14, color: '#6B7280', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  noClass: {
    textAlign: 'center', padding: '12px 16px', fontSize: 13, color: '#9CA3AF',
    background: '#FFFBEB', borderBottom: '1px solid #FEF3C7',
  },
  list: { background: '#fff' },
  row: {
    display: 'flex', alignItems: 'center', padding: '11px 14px 11px 0',
    gap: 10, position: 'relative', transition: 'background 0.1s',
  },
  currentBar: { width: 3, alignSelf: 'stretch', borderRadius: '0 2px 2px 0', flexShrink: 0 },
  periodMeta: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: 48, flexShrink: 0 },
  periodBadge: { fontSize: 12, fontWeight: 700, padding: '3px 6px', borderRadius: 6, whiteSpace: 'nowrap' },
  periodTime: { fontSize: 10, color: '#9CA3AF', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' },
  statusArea: { display: 'flex', alignItems: 'center', minWidth: 0, overflow: 'hidden' },
  classBadge: { display: 'inline-flex', alignItems: 'center', fontSize: 13, fontWeight: 600, padding: '5px 10px', borderRadius: 8, gap: 2 },
  changeArrow: { fontSize: 11, opacity: 0.7 },
  freeBadge: { fontSize: 13, color: '#9CA3AF', fontWeight: 500 },
  actionArea: { flexShrink: 0, marginLeft: 'auto' },
  returnBtn: {
    padding: '6px 12px', borderRadius: 8, background: '#FEF2F2', color: '#DC2626',
    fontSize: 12, fontWeight: 600, border: '1px solid #FECACA', cursor: 'pointer', whiteSpace: 'nowrap',
  },
  registerBtn: {
    padding: '6px 12px', borderRadius: 8, color: '#fff',
    fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
  },
};
