import { useState, useMemo } from 'react';
import { PERIODS, getMaxPeriod } from '../utils/schedule';
import { addRental, deleteRental, returnRental, updateRental } from '../utils/storage';
import { today, getWeekDays, getWeekRangeLabel, prevWeek, nextWeek } from '../utils/dateUtils';
import ConfirmDialog from './ConfirmDialog';

const CLASS_COLORS = {
  1: { bg: '#DBEAFE', accent: '#1D4ED8' },
  2: { bg: '#DCFCE7', accent: '#15803D' },
  3: { bg: '#F3E8FF', accent: '#7E22CE' },
  4: { bg: '#FFEDD5', accent: '#C2410C' },
  5: { bg: '#FFE4E6', accent: '#BE123C' },
  6: { bg: '#CCFBF1', accent: '#0F766E' },
};

const DAY_LABELS = ['월', '화', '수', '목', '금'];

export default function WeeklyView({ selectedClass, allRentals }) {
  const [baseDate, setBaseDate] = useState(today);
  const [confirm, setConfirm] = useState(null);

  const weekDays = getWeekDays(baseDate);
  const todayStr = today();

  const rentals = useMemo(() => {
    const start = weekDays[0];
    const end = weekDays[4];
    return allRentals.filter(r => r.date >= start && r.date <= end);
  }, [allRentals, baseDate]);

  function getRental(dateStr, period) {
    return rentals.find(r => r.date === dateStr && r.period === period) || null;
  }

  function isAvailable(dateStr, period) {
    return getMaxPeriod(dateStr) >= period;
  }

  function handleCellClick(dateStr, period) {
    if (!selectedClass) return;
    const rental = getRental(dateStr, period);

    if (!rental) {
      setConfirm({ type: 'register', date: dateStr, period, rental: null });
    } else if (rental.status === 'completed') {
      // 완료된 항목 클릭 → 삭제만 가능
      setConfirm({ type: 'cancel', date: dateStr, period, rental });
    } else if (rental.classNumber !== selectedClass) {
      setConfirm({ type: 'change', date: dateStr, period, rental });
    } else {
      // 같은 반 사용중 → 반납(완료처리) 또는 취소(삭제)
      setConfirm({ type: 'own', date: dateStr, period, rental });
    }
  }

  function handleConfirm() {
    if (!confirm) return;
    if (confirm.type === 'register') {
      addRental({ date: confirm.date, period: confirm.period, classNumber: selectedClass, status: 'active' });
    } else if (confirm.type === 'change') {
      updateRental(confirm.rental.id, { classNumber: selectedClass });
    } else if (confirm.type === 'own') {
      // 반납(사용완료 처리)
      returnRental(confirm.rental.id);
    } else if (confirm.type === 'cancel') {
      deleteRental(confirm.rental.id);
    }
    setConfirm(null);
  }

  function handleSecondary() {
    // 취소(삭제) 버튼
    if (confirm?.type === 'own') deleteRental(confirm.rental.id);
    setConfirm(null);
  }

  function getConfirmProps() {
    if (!confirm) return {};
    const periodLabel = `${confirm.period}교시`;
    const dateLabel = confirm.date.slice(5).replace('-', '/');
    if (confirm.type === 'register') {
      return { message: `${dateLabel} ${periodLabel}\n${selectedClass}반 대여 등록할까요?`, confirmLabel: '등록' };
    }
    if (confirm.type === 'change') {
      return { message: `${dateLabel} ${periodLabel}\n${confirm.rental.classNumber}반 → ${selectedClass}반으로 변경합니다.`, confirmLabel: '변경' };
    }
    if (confirm.type === 'own') {
      return {
        message: `${dateLabel} ${periodLabel}\n${confirm.rental.classNumber}반 태블릿 처리 방법을 선택하세요.`,
        confirmLabel: '반납',
        onSecondary: handleSecondary, secondaryLabel: '취소(삭제)',
      };
    }
    return { message: `${dateLabel} ${periodLabel}\n사용완료 기록을 삭제할까요?`, confirmLabel: '삭제' };
  }

  return (
    <div style={styles.container}>
      {confirm && (() => {
        const props = getConfirmProps();
        return (
          <ConfirmDialog
            message={props.message}
            onConfirm={handleConfirm}
            confirmLabel={props.confirmLabel}
            onSecondary={props.onSecondary}
            secondaryLabel={props.secondaryLabel}
            onCancel={() => setConfirm(null)}
            cancelLabel="닫기"
          />
        );
      })()}

      {/* 주 네비게이터 */}
      <div style={styles.nav}>
        <button style={styles.navBtn} onClick={() => setBaseDate(prev => prevWeek(prev))}>‹</button>
        <span style={styles.weekLabel}>{getWeekRangeLabel(baseDate)}</span>
        <button style={styles.navBtn} onClick={() => setBaseDate(prev => nextWeek(prev))}>›</button>
      </div>

      {/* 반 미선택 안내 */}
      {!selectedClass && (
        <div style={styles.noClass}>내 반을 선택하면 셀을 눌러 대여 등록할 수 있습니다.</div>
      )}

      {/* 테이블 */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.periodTh}></th>
              {weekDays.map((d, i) => {
                const isToday = d === todayStr;
                return (
                  <th key={d} style={{
                    ...styles.dayTh,
                    color: isToday ? '#1D4ED8' : '#374151',
                    background: isToday ? '#EFF6FF' : '#F9FAFB',
                  }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{DAY_LABELS[i]}</div>
                    <div style={{ fontSize: 11, opacity: 0.65, marginTop: 1 }}>
                      {d.slice(5).replace('-', '/')}
                    </div>
                    {isToday && <div style={styles.todayLine} />}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map((p) => (
              <tr key={p.period}>
                <td style={styles.periodCell}>
                  <div style={styles.pNum}>{p.period}교시</div>
                  <div style={styles.pTime}>{p.start}~{p.end}</div>
                </td>
                {weekDays.map(d => {
                  if (!isAvailable(d, p.period)) {
                    return <td key={d} style={styles.naCell}>—</td>;
                  }
                  const rental = getRental(d, p.period);
                  const isCompleted = rental?.status === 'completed';
                  const c = rental ? CLASS_COLORS[rental.classNumber] : null;
                  const dim = selectedClass && rental && rental.classNumber !== selectedClass && !isCompleted;
                  const isMyRental = selectedClass && rental?.classNumber === selectedClass;
                  const clickable = !!selectedClass;

                  return (
                    <td
                      key={d}
                      onClick={() => clickable && handleCellClick(d, p.period)}
                      style={{
                        ...styles.cell,
                        background: rental ? (isCompleted ? '#F9FAFB' : c.bg) : '#fff',
                        cursor: clickable ? 'pointer' : 'default',
                      }}
                    >
                      {rental ? (
                        isCompleted ? (
                          <span style={{ ...styles.badge, background: '#9CA3AF', opacity: 0.7 }}>
                            {rental.classNumber}반✓
                          </span>
                        ) : (
                          <span style={{
                            ...styles.badge,
                            background: c.accent,
                            opacity: dim ? 0.3 : 1,
                            outline: isMyRental ? `2px solid ${c.accent}` : 'none',
                            outlineOffset: 1,
                          }}>
                            {rental.classNumber}반
                          </span>
                        )
                      ) : (
                        selectedClass
                          ? <span style={styles.addHint}>+</span>
                          : <span style={styles.empty}>·</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 범례 */}
      <div style={styles.legend}>
        {[1,2,3,4,5,6].map(n => (
          <div key={n} style={styles.legendItem}>
            <span style={{ ...styles.legendDot, background: CLASS_COLORS[n].accent }} />
            <span style={{ fontSize: 12, color: CLASS_COLORS[n].accent, fontWeight: 600 }}>{n}반</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#fff',
    borderRadius: 12,
    padding: '10px 14px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    border: '1px solid #E5E7EB',
  },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    background: '#F3F4F6',
    border: 'none',
    fontSize: 20,
    color: '#374151',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  },
  weekLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: '#111827',
  },
  noClass: {
    textAlign: 'center',
    padding: '10px 16px',
    fontSize: 12,
    color: '#9CA3AF',
    background: '#FFFBEB',
    borderRadius: 10,
    border: '1px solid #FEF3C7',
  },
  tableWrap: {
    overflowX: 'auto',
    borderRadius: 12,
    border: '1px solid #E5E7EB',
    background: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: 320,
    tableLayout: 'fixed',
  },
  periodTh: {
    width: 52,
    background: '#F9FAFB',
    borderRight: '1px solid #E5E7EB',
    borderBottom: '1px solid #E5E7EB',
  },
  dayTh: {
    padding: '8px 4px',
    textAlign: 'center',
    borderRight: '1px solid #E5E7EB',
    borderBottom: '1px solid #E5E7EB',
    position: 'relative',
  },
  todayLine: {
    position: 'absolute',
    bottom: 0,
    left: 4,
    right: 4,
    height: 2,
    background: '#1D4ED8',
    borderRadius: 2,
  },
  periodCell: {
    padding: '8px 6px',
    textAlign: 'center',
    background: '#F9FAFB',
    borderRight: '1px solid #E5E7EB',
    borderBottom: '1px solid #F3F4F6',
  },
  pNum: {
    fontSize: 12,
    fontWeight: 700,
    color: '#374151',
  },
  pTime: {
    fontSize: 9,
    color: '#9CA3AF',
    marginTop: 1,
    fontVariantNumeric: 'tabular-nums',
  },
  cell: {
    padding: '8px 4px',
    textAlign: 'center',
    borderRight: '1px solid #F3F4F6',
    borderBottom: '1px solid #F3F4F6',
    transition: 'background 0.1s',
    minHeight: 38,
  },
  naCell: {
    padding: '8px 4px',
    textAlign: 'center',
    background: '#F9FAFB',
    color: '#E5E7EB',
    fontSize: 12,
    borderRight: '1px solid #F3F4F6',
    borderBottom: '1px solid #F3F4F6',
  },
  badge: {
    display: 'inline-block',
    padding: '3px 7px',
    borderRadius: 6,
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    transition: 'opacity 0.15s',
  },
  addHint: {
    fontSize: 16,
    color: '#D1D5DB',
    fontWeight: 300,
  },
  empty: {
    color: '#E5E7EB',
    fontSize: 14,
  },
  legend: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    padding: '4px 2px',
    justifyContent: 'center',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
    display: 'inline-block',
  },
};
