const BASE_URL = 'https://dnaoedi5ks.app.n8n.cloud/webhook';

async function get(path) {
  const res = await fetch(`${BASE_URL}/${path}`);
  if (!res.ok) throw new Error(`API error on ${path}: ${res.status}`);
  return res.json();
}

async function post(path, payload) {
  const res = await fetch(`${BASE_URL}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`API error on ${path}: ${res.status}`);
  return res.json();
}

export function getServices() { return get('salon/services'); }
export function getMasters() { return get('salon/masters'); }
export function getPromotions() { return get('salon/promotions'); }

export async function getAvailability(masterId, date, durationMin) {
  const params = new URLSearchParams({ masterId, date, durationMin });
  const res = await fetch(`${BASE_URL}/salon/availability?${params}`);
  if (!res.ok) throw new Error(`API error on availability: ${res.status}`);
  return res.json();
}

export function createBooking(payload) { return post('salon/bookings', payload); }
export function getMyBookings(clientTelegramId) { return get(`salon/my-bookings?clientTelegramId=${encodeURIComponent(clientTelegramId)}`); }
export function cancelBooking(bookingId) { return post('salon/bookings/cancel', { bookingId }); }
export function rescheduleBooking(bookingId, date, startTime, endTime) { return post('salon/bookings/reschedule', { bookingId, date, startTime, endTime }); }

export async function getProfile(clientTelegramId) {
  const rows = await get(`salon/profile?clientTelegramId=${encodeURIComponent(clientTelegramId)}`);
  return rows[0] || null;
}
export function saveProfile(telegramId, name, phone) { return post('salon/profile', { telegramId, name, phone }); }

// ---- Admin ----
export function adminCheckAccess(telegramId) { return post('salon/admin/login', { telegramId }); }
export function getAdminBookings() { return get('salon/admin/bookings'); }
export function createService(data) { return post('salon/admin/services/create', data); }
export function updateService(data) { return post('salon/admin/services/update', data); }
export function deleteService(id) { return post('salon/admin/services/delete', { id }); }
export function createMaster(data) { return post('salon/admin/masters/create', data); }
export function updateMaster(data) { return post('salon/admin/masters/update', data); }
export function deleteMaster(id) { return post('salon/admin/masters/delete', { id }); }
export function getSchedule(masterId) { return get(`salon/admin/schedule?masterId=${encodeURIComponent(masterId)}`); }
export function saveScheduleDay(masterId, weekday, startTime, endTime) { return post('salon/admin/schedule/save', { masterId, weekday, startTime, endTime }); }
export function deleteScheduleDay(masterId, weekday) { return post('salon/admin/schedule/delete', { masterId, weekday }); }
