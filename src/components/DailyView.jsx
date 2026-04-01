import { useState, useEffect } from 'react';
import { getPeriodsForDate, getCurrentPeriod } from '../utils/schedule';
import { getRentalsByDate, addRental, deleteRental, updateRental } from '../utils/storage';
import { today, formatDate, formatDateKo, getDayLabel } from '../utils/dateUtils';
import ConfirmDialog from './ConfirmDialog';

const CLASS_COLORS = {
  1: { bg: '#DBEAFE', border: '#93C5FD', accent: '#1D4ED8', light: '#EFF6FF' },
  2: { bg: '#DCFCE7', border: '#86EFAC', accent: '#15803D', light: '#F0FDF4' },
  3: { bg: '#F3E8FF', border: '#D8B4FE', accent: '#7E22CE', light: '#FAF5FF' },
  4: { bg: '#FFEDD5', border: '#FDBA74', accent: '#C2410C', light: '#FFF7ED' },
  5: { bg: '#FFE4E6', border: '#FCA5A5', accent: '#BE123C', light: '#FFF1F2' },
  6: { bg: '#CCFBF1', border: '#5EEAD4', accent: '#0F766E', light: '#F0FDFA' },
};

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return formatDate(d);
}

export default function DailyView({ selectedClass, onRentalChange }) {
  const [dateStr, setDateStr] = useState(today);
  const [rentals, setRentals] = useState([]);
  const [currentPeriod, setCurrentPeriod] = useState(getCurrentPeriod);
  const [changeConfirm, setChangeConfirm] = useState(null);

  const periods = getPeriodsForDate(dateStr);
  const isToday = dateStr === today();

  function refresh() {
    setRentals(getRentalsByDate(dateStr));
    setCurrentPeriod(getCurrentPeriod());
  }

  useEffect(() => { refresh(); }, [dateStr]);

  function getRentalForPeriod(period) {
    return rentals.find(r => r.period === period) || null;
  }

  function handleRegister(period) {
    if (!selectedClass) return;
    addRental({ date: dateStr, period, classNumber: selectedClass });
    refresh(); onRentalChange();
  }

  function handleDelete(id) {
    deleteRental(id);
    refresh(); onRentalChange();
  }

  function handleCardClick(rental) {
    if (!selectedClass || !rental) return;
    if (rental.classNumber === selectedClass) return;
    setChangeConfirm({ rental, fromClass: rental.classNumber, toClass: selectedClass });
  }

  function handleChangeConfirm() {
    if (!changeConfirm) return;
    updateRental(changeConfirm.rental.id, { classNumber: changeConfirm.toClass });
    setChangeConfirm(null);
    refresh(); onRentalChange();
  }

  return (
    <div style={styles.container}>
      {changeConfirm && (
        <ConfirmDialog
          message={`${changeConfirm.fromClass}반 → ${changeConfirm.toClass}반으로 변경합니다.`}
          onConfirm={handleChangeConfirm}
          onCancel={() => setChangeConfirm(null)}
        />
      )}

      {/* 날짜 네비게이터 */}
      <div style={styles.datNav}>
        <button style={styles.navArrow} onClick={() => setDateStr(prev => addDays(prev, -1))}>‹</button>
        <div style={styles.datCenter}>
          <input
            type="date"
            value={dateStr}
            onChange={e => setDateStr(e.target.value)}
            style={styles.dateHidden}
            id="date-pick"
          />
          <label htmlFor="date-pick" style={styles.dateDisplay}>
            <span style={styles.dateText}>{formatDateKo(dateStr)} ({getDayLabel(dateStr)})</span>
            {isToday && <span style={styles.todayPill}>오늘</span>}
          </label>
        </div>
        <button style={styles.navArrow} onClick={() => setDateStr(prev => addDays(prev, 1))}>›</button>
      </div>

      {/* 반 미선택 안내 */}
      {!selectedClass && (
        <div style={styles.noClass}>
          위에서 내 반을 선택하세요
        </div>
      )}

      {/* 교시 리스트 */}
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
              {/* 현재 교시 인디케이터 */}
              <div style={{
                ...styles.currentBar,
                background: isCurrent ? '#F59E0B' : 'transparent',
              }} />

              {/* 교시 정보 */}
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

              {/* 상태 */}
              <div style={styles.statusArea}>
                {rental ? (
                  <div style={{
                    ...styles.classBadge,
                    background: c.bg,
                    color: c.accent,
                    border: `1px solid ${c.border}`,
                  }}>
                    {rental.classNumber}반 사용중
                    {isChangeable && <span style={styles.changeArrow}> → {selectedClass}반</span>}
                  </div>
                ) : (
                  <div style={styles.freeBadge}>연구실</div>
                )}
              </div>

              {/* 액션 버튼 */}
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
                    style={{
                      ...styles.registerBtn,
                      background: CLASS_COLORS[selectedClass].accent,
                    }}
                    onClick={() => handleRegister(p.period)}
                  >
                    등록
                  </button>
                ) : (
                  <div style={styles.noActionPlaceholder} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    background: '#F8FAFC',
    minHeight: '100%',
  },
  datNav: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    background: '#fff',
    borderBottom: '1px solid #E5E7EB',
    gap: 4,
  },
  navArrow: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: '#F3F4F6',
    border: 'none',
    fontSize: 22,
    color: '#374151',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    lineHeight: 1,
  },
  datCenter: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
  },
  dateHidden: {
    position: 'absolute',
    opacity: 0,
    width: '100%',
    height: '100%',
    cursor: 'pointer',
    zIndex: 1,
  },
  dateDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    cursor: 'pointer',
  },
  dateText: {
    fontSize: 15,
    fontWeight: 700,
    color: '#111827',
  },
  todayPill: {
    fontSize: 11,
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 10,
    background: '#1D4ED8',
    color: '#fff',
  },
  noClass: {
    textAlign: 'center',
    padding: '16px',
    fontSize: 13,
    color: '#9CA3AF',
    background: '#FFFBEB',
    borderBottom: '1px solid #FEF3C7',
  },
  list: {
    background: '#fff',
    margin: '12px',
    borderRadius: 14,
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    border: '1px solid #E5E7EB',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    padding: '11px 14px 11px 0',
    gap: 10,
    position: 'relative',
    transition: 'background 0.1s',
  },
  currentBar: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: '0 2px 2px 0',
    flexShrink: 0,
    marginLeft: 0,
  },
  periodMeta: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    width: 48,
    flexShrink: 0,
  },
  periodBadge: {
    fontSize: 12,
    fontWeight: 700,
    padding: '3px 6px',
    borderRadius: 6,
    whiteSpace: 'nowrap',
  },
  periodTime: {
    fontSize: 10,
    color: '#9CA3AF',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  statusArea: {
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    overflow: 'hidden',
  },
  classBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    padding: '5px 10px',
    borderRadius: 8,
    gap: 2,
  },
  changeArrow: {
    fontSize: 11,
    opacity: 0.7,
  },
  freeBadge: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: 500,
  },
  actionArea: {
    flexShrink: 0,
    marginLeft: 'auto',
  },
  returnBtn: {
    padding: '6px 12px',
    borderRadius: 8,
    background: '#FEF2F2',
    color: '#DC2626',
    fontSize: 12,
    fontWeight: 600,
    border: '1px solid #FECACA',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  registerBtn: {
    padding: '6px 12px',
    borderRadius: 8,
    color: '#fff',
    fontSize: 12,
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  noActionPlaceholder: {
    width: 44,
  },
};
