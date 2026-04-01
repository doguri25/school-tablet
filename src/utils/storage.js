const STORAGE_KEY = 'hongbuk_tablet_rentals';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function getAllRentals() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAll(rentals) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rentals));
}

export function getRentalsByDate(dateStr) {
  return getAllRentals().filter(r => r.date === dateStr);
}

export function getRentalsByDateRange(startDate, endDate) {
  return getAllRentals().filter(r => r.date >= startDate && r.date <= endDate);
}

export function getRentalsByMonth(year, month) {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return getAllRentals().filter(r => r.date.startsWith(prefix));
}

// 특정 날짜+교시의 대여 기록 반환
export function getRentalByDatePeriod(dateStr, period) {
  return getAllRentals().find(r => r.date === dateStr && r.period === period) || null;
}

export function addRental({ date, period, classNumber }) {
  const rentals = getAllRentals();
  const existing = rentals.find(r => r.date === date && r.period === period);
  if (existing) return existing;

  const newRental = {
    id: generateId(),
    date,
    period,
    classNumber,
    createdAt: new Date().toISOString(),
  };
  rentals.push(newRental);
  saveAll(rentals);
  return newRental;
}

export function deleteRental(id) {
  const rentals = getAllRentals().filter(r => r.id !== id);
  saveAll(rentals);
}

export function updateRental(id, { classNumber }) {
  const rentals = getAllRentals();
  const idx = rentals.findIndex(r => r.id === id);
  if (idx === -1) return null;
  rentals[idx] = { ...rentals[idx], classNumber };
  saveAll(rentals);
  return rentals[idx];
}
