// Полностью статичное приложение (хостится на GitHub Pages, без своего сервера).
// Все данные — услуги, мастера, акции, записи, профиль — живут в localStorage
// браузера, в котором открыто приложение. Это значит: у каждого клиента и
// у владельца (админки) — свои, не связанные друг с другом данные на устройстве.

const STORAGE_KEY = 'rouge-beauty-db-v1';
const ADMIN_TELEGRAM_ID = '8419316772';
const STEP_MIN = 30;

const WORKDAYS = [1, 2, 3, 4, 5, 6];

function seed() {
  return {
    nextId: { services: 4, masters: 3, promotions: 3, bookings: 1 },
    services: [
      { id: 1, name: 'Маникюр с покрытием', description: 'Классический маникюр с гель-лаком.', price: 2200, durationMin: 90, photoUrl: null, active: true },
      { id: 2, name: 'Стрижка и укладка', description: 'Женская стрижка с укладкой феном.', price: 2800, durationMin: 60, photoUrl: null, active: true },
      { id: 3, name: 'Окрашивание в один тон', description: 'Окрашивание волос по всей длине.', price: 4500, durationMin: 120, photoUrl: null, active: true },
    ],
    masters: [
      { id: 1, name: 'Анна Соколова', specialization: 'Мастер маникюра', bio: 'Работает с 2016 года, специализируется на дизайне ногтей.', photoUrl: null, rating: 4.9, experienceYears: 8, active: true },
      { id: 2, name: 'Елена Волкова', specialization: 'Стилист-парикмахер', bio: 'Топ-стилист салона, эксперт по окрашиванию.', photoUrl: null, rating: 4.8, experienceYears: 10, active: true },
    ],
    promotions: [
      { id: 1, tag: 'Новинка', title: 'Скидка 15% на первый визит', description: 'Приведите подругу и получите скидку 15% на любую услугу.', validUntil: null },
      { id: 2, tag: 'Акция', title: 'Маникюр + педикюр', description: 'При записи на комплекс — скидка 500 ₽.', validUntil: null },
    ],
    bookings: [],
    profiles: [],
    schedule: [
      ...WORKDAYS.map((weekday) => ({ masterId: 1, weekday, startTime: '10:00', endTime: '19:00' })),
      ...WORKDAYS.map((weekday) => ({ masterId: 2, weekday, startTime: '10:00', endTime: '19:00' })),
    ],
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* localStorage недоступен (приватный режим и т.п.) */ }
  const data = seed();
  save(data);
  return data;
}

function save(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

function withDb(fn) {
  const data = load();
  const result = fn(data);
  save(data);
  return result;
}

function nextId(data, collection) {
  const id = data.nextId[collection];
  data.nextId[collection] += 1;
  return id;
}

function timeToMin(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function minToTime(min) {
  const h = String(Math.floor(min / 60)).padStart(2, '0');
  const m = String(min % 60).padStart(2, '0');
  return `${h}:${m}`;
}
function weekdayOf(dateStr) {
  return new Date(`${dateStr}T00:00:00`).getDay();
}

// ---- Services ----
export async function getServices() { return load().services; }

export async function createService({ name, description, price, durationMin }) {
  return withDb((db) => {
    const service = { id: nextId(db, 'services'), name, description: description || '', price: Number(price), durationMin: Number(durationMin), photoUrl: null, active: true };
    db.services.push(service);
    return service;
  });
}

export async function updateService({ id, name, description, price, durationMin, active }) {
  return withDb((db) => {
    const service = db.services.find((s) => String(s.id) === String(id));
    if (!service) return null;
    Object.assign(service, { name, description: description || '', price: Number(price), durationMin: Number(durationMin), active: Boolean(active) });
    return service;
  });
}

export async function deleteService(id) {
  withDb((db) => { db.services = db.services.filter((s) => String(s.id) !== String(id)); });
  return { ok: true };
}

// ---- Masters ----
export async function getMasters() { return load().masters; }

export async function createMaster({ name, specialization, bio, rating, experienceYears }) {
  return withDb((db) => {
    const master = { id: nextId(db, 'masters'), name, specialization: specialization || '', bio: bio || '', photoUrl: null, rating: Number(rating) || 5, experienceYears: Number(experienceYears) || 0, active: true };
    db.masters.push(master);
    return master;
  });
}

export async function updateMaster({ id, name, specialization, bio, rating, experienceYears, active }) {
  return withDb((db) => {
    const master = db.masters.find((m) => String(m.id) === String(id));
    if (!master) return null;
    Object.assign(master, { name, specialization: specialization || '', bio: bio || '', rating: Number(rating), experienceYears: Number(experienceYears), active: Boolean(active) });
    return master;
  });
}

export async function deleteMaster(id) {
  withDb((db) => {
    db.masters = db.masters.filter((m) => String(m.id) !== String(id));
    db.schedule = db.schedule.filter((s) => String(s.masterId) !== String(id));
  });
  return { ok: true };
}

// ---- Promotions ----
export async function getPromotions() { return load().promotions; }

// ---- Schedule ----
export async function getSchedule(masterId) {
  return load().schedule.filter((s) => String(s.masterId) === String(masterId));
}

export async function saveScheduleDay(masterId, weekday, startTime, endTime) {
  withDb((db) => {
    const row = db.schedule.find((s) => String(s.masterId) === String(masterId) && Number(s.weekday) === Number(weekday));
    if (row) { row.startTime = startTime; row.endTime = endTime; }
    else db.schedule.push({ masterId: Number(masterId), weekday: Number(weekday), startTime, endTime });
  });
  return { ok: true };
}

export async function deleteScheduleDay(masterId, weekday) {
  withDb((db) => {
    db.schedule = db.schedule.filter((s) => !(String(s.masterId) === String(masterId) && Number(s.weekday) === Number(weekday)));
  });
  return { ok: true };
}

// ---- Availability ----
export async function getAvailability(masterId, date, durationMin) {
  const duration = Number(durationMin) || 60;
  const db = load();
  const weekday = weekdayOf(date);
  const day = db.schedule.find((s) => String(s.masterId) === String(masterId) && Number(s.weekday) === weekday);
  if (!day) return { slots: [] };

  const startMin = timeToMin(day.startTime);
  const endMin = timeToMin(day.endTime);
  const existing = db.bookings.filter((b) => String(b.masterId) === String(masterId) && b.date === date && b.status === 'confirmed');

  const slots = [];
  for (let start = startMin; start + duration <= endMin; start += STEP_MIN) {
    const end = start + duration;
    const overlaps = existing.some((b) => {
      const bs = timeToMin(b.startTime);
      const be = timeToMin(b.endTime);
      return start < be && end > bs;
    });
    if (!overlaps) slots.push({ start: minToTime(start), end: minToTime(end) });
  }
  return { slots };
}

// ---- Bookings ----
export async function createBooking({ clientTelegramId, serviceId, masterId, date, startTime, endTime }) {
  return withDb((db) => {
    const booking = {
      id: nextId(db, 'bookings'),
      clientTelegramId: String(clientTelegramId),
      serviceId: String(serviceId),
      masterId: String(masterId),
      date, startTime, endTime,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    db.bookings.push(booking);
    return booking;
  });
}

export async function getMyBookings(clientTelegramId) {
  return load().bookings.filter((b) => String(b.clientTelegramId) === String(clientTelegramId));
}

export async function cancelBooking(bookingId) {
  return withDb((db) => {
    const b = db.bookings.find((x) => String(x.id) === String(bookingId));
    if (b) b.status = 'cancelled';
    return b;
  });
}

export async function rescheduleBooking(bookingId, date, startTime, endTime) {
  return withDb((db) => {
    const b = db.bookings.find((x) => String(x.id) === String(bookingId));
    if (b) Object.assign(b, { date, startTime, endTime });
    return b;
  });
}

export async function getAdminBookings() { return load().bookings; }

// ---- Profile ----
export async function getProfile(clientTelegramId) {
  const profile = load().profiles.find((p) => String(p.telegramId) === String(clientTelegramId));
  return profile || null;
}

export async function saveProfile(telegramId, name, phone) {
  return withDb((db) => {
    let p = db.profiles.find((x) => String(x.telegramId) === String(telegramId));
    if (!p) { p = { telegramId: String(telegramId) }; db.profiles.push(p); }
    p.name = name;
    p.phone = phone;
    return p;
  });
}

// ---- Admin access ----
export async function adminCheckAccess(telegramId) {
  return { ok: String(telegramId) === String(ADMIN_TELEGRAM_ID) };
}
