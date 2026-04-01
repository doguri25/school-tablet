export function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatDateKo(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}년 ${m}월 ${day}일`;
}

export function formatMonthKo(year, month) {
  return `${year}년 ${month}월`;
}

export function today() {
  return formatDate(new Date());
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export function getDayLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return DAY_LABELS[d.getDay()];
}

// 해당 날짜가 속한 주의 월~금 날짜 배열 반환
export function getWeekDays(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay(); // 0=일, 1=월...
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);

  const days = [];
  for (let i = 0; i < 5; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);
    days.push(formatDate(current));
  }
  return days;
}

// 해당 주의 범위 문자열 반환 (예: 2026년 3월 30일 ~ 4월 3일)
export function getWeekRangeLabel(dateStr) {
  const days = getWeekDays(dateStr);
  const start = new Date(days[0] + 'T00:00:00');
  const end = new Date(days[4] + 'T00:00:00');
  const sm = start.getMonth() + 1;
  const sd = start.getDate();
  const em = end.getMonth() + 1;
  const ed = end.getDate();
  const y = start.getFullYear();
  if (sm === em) {
    return `${y}년 ${sm}월 ${sd}일 ~ ${ed}일`;
  }
  return `${y}년 ${sm}월 ${sd}일 ~ ${em}월 ${ed}일`;
}

// 해당 월의 모든 날짜를 주 단위 배열로 반환 (캘린더용)
export function getMonthCalendar(year, month) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  // 첫 주의 일요일 기준으로 시작
  const startOffset = firstDay.getDay(); // 0=일
  const start = new Date(firstDay);
  start.setDate(1 - startOffset);

  const weeks = [];
  const cur = new Date(start);
  while (cur <= lastDay || cur.getDay() !== 0) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push({
        dateStr: formatDate(cur),
        isCurrentMonth: cur.getMonth() + 1 === month,
        isToday: formatDate(cur) === today(),
        dayIndex: cur.getDay(),
      });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
    if (cur > lastDay && cur.getDay() === 0) break;
  }
  return weeks;
}

export function prevWeek(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - 7);
  return formatDate(d);
}

export function nextWeek(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + 7);
  return formatDate(d);
}

export function prevMonth(year, month) {
  if (month === 1) return { year: year - 1, month: 12 };
  return { year, month: month - 1 };
}

export function nextMonth(year, month) {
  if (month === 12) return { year: year + 1, month: 1 };
  return { year, month: month + 1 };
}
