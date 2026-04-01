export const PERIODS = [
  { period: 1, label: '1교시', start: '09:00', end: '09:40' },
  { period: 2, label: '2교시', start: '09:50', end: '10:30' },
  { period: 3, label: '3교시', start: '10:40', end: '11:20' },
  { period: 4, label: '4교시', start: '11:30', end: '12:10' },
  { period: 5, label: '5교시', start: '13:00', end: '13:40' },
  { period: 6, label: '6교시', start: '13:50', end: '14:30' },
];

export const LUNCH = { start: '12:10', end: '13:00', label: '점심시간' };

// 목요일(4)은 6교시까지, 나머지는 5교시까지
export function getMaxPeriod(date) {
  const d = date ? new Date(date) : new Date();
  return d.getDay() === 4 ? 6 : 5;
}

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// 현재 시각을 HH:MM 문자열로 반환
export function getCurrentTimeStr() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

// 현재 교시 반환 (없으면 null, 점심이면 'lunch')
export function getCurrentPeriod() {
  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();
  const maxPeriod = getMaxPeriod(now);

  const lunchStart = timeToMinutes(LUNCH.start);
  const lunchEnd = timeToMinutes(LUNCH.end);
  if (currentMins >= lunchStart && currentMins < lunchEnd) return 'lunch';

  for (const p of PERIODS) {
    if (p.period > maxPeriod) break;
    const start = timeToMinutes(p.start);
    const end = timeToMinutes(p.end);
    if (currentMins >= start && currentMins <= end) return p.period;
  }
  return null;
}

// 특정 날짜에서 사용 가능한 교시 목록 반환
export function getPeriodsForDate(dateStr) {
  const maxPeriod = getMaxPeriod(dateStr);
  return PERIODS.filter(p => p.period <= maxPeriod);
}

export function getPeriodLabel(period) {
  const found = PERIODS.find(p => p.period === period);
  return found ? found.label : '';
}

export function getPeriodTime(period) {
  const found = PERIODS.find(p => p.period === period);
  return found ? `${found.start}~${found.end}` : '';
}
