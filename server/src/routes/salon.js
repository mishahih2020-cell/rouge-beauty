import { Router } from 'express';
import { readDb, withDb, nextId } from '../db.js';

const router = Router();
const STEP_MIN = 30;
const ADMIN_TELEGRAM_ID = process.env.ADMIN_TELEGRAM_ID || '8419316772';

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
router.get('/services', (req, res) => {
  res.json(readDb().services);
});

router.post('/admin/services/create', (req, res) => {
  const { name, description, price, durationMin } = req.body;
  const created = withDb((db) => {
    const service = {
      id: nextId(db, 'services'),
      name,
      description: description || '',
      price: Number(price),
      durationMin: Number(durationMin),
      photoUrl: null,
      active: true,
    };
    db.services.push(service);
    return service;
  });
  res.json(created);
});

router.post('/admin/services/update', (req, res) => {
  const { id, name, description, price, durationMin, active } = req.body;
  const updated = withDb((db) => {
    const service = db.services.find((s) => String(s.id) === String(id));
    if (!service) return null;
    Object.assign(service, {
      name, description: description || '',
      price: Number(price), durationMin: Number(durationMin),
      active: Boolean(active),
    });
    return service;
  });
  if (!updated) return res.status(404).json({ error: 'not_found' });
  res.json(updated);
});

router.post('/admin/services/delete', (req, res) => {
  const { id } = req.body;
  withDb((db) => { db.services = db.services.filter((s) => String(s.id) !== String(id)); });
  res.json({ ok: true });
});

// ---- Masters ----
router.get('/masters', (req, res) => {
  res.json(readDb().masters);
});

router.post('/admin/masters/create', (req, res) => {
  const { name, specialization, bio, rating, experienceYears } = req.body;
  const created = withDb((db) => {
    const master = {
      id: nextId(db, 'masters'),
      name,
      specialization: specialization || '',
      bio: bio || '',
      photoUrl: null,
      rating: Number(rating) || 5,
      experienceYears: Number(experienceYears) || 0,
      active: true,
    };
    db.masters.push(master);
    return master;
  });
  res.json(created);
});

router.post('/admin/masters/update', (req, res) => {
  const { id, name, specialization, bio, rating, experienceYears, active } = req.body;
  const updated = withDb((db) => {
    const master = db.masters.find((m) => String(m.id) === String(id));
    if (!master) return null;
    Object.assign(master, {
      name, specialization: specialization || '', bio: bio || '',
      rating: Number(rating), experienceYears: Number(experienceYears),
      active: Boolean(active),
    });
    return master;
  });
  if (!updated) return res.status(404).json({ error: 'not_found' });
  res.json(updated);
});

router.post('/admin/masters/delete', (req, res) => {
  const { id } = req.body;
  withDb((db) => {
    db.masters = db.masters.filter((m) => String(m.id) !== String(id));
    db.schedule = db.schedule.filter((s) => String(s.masterId) !== String(id));
  });
  res.json({ ok: true });
});

// ---- Promotions ----
router.get('/promotions', (req, res) => {
  res.json(readDb().promotions);
});

// ---- Schedule ----
router.get('/admin/schedule', (req, res) => {
  const { masterId } = req.query;
  res.json(readDb().schedule.filter((s) => String(s.masterId) === String(masterId)));
});

router.post('/admin/schedule/save', (req, res) => {
  const { masterId, weekday, startTime, endTime } = req.body;
  withDb((db) => {
    const row = db.schedule.find((s) => String(s.masterId) === String(masterId) && Number(s.weekday) === Number(weekday));
    if (row) { row.startTime = startTime; row.endTime = endTime; }
    else db.schedule.push({ masterId: Number(masterId), weekday: Number(weekday), startTime, endTime });
  });
  res.json({ ok: true });
});

router.post('/admin/schedule/delete', (req, res) => {
  const { masterId, weekday } = req.body;
  withDb((db) => {
    db.schedule = db.schedule.filter((s) => !(String(s.masterId) === String(masterId) && Number(s.weekday) === Number(weekday)));
  });
  res.json({ ok: true });
});

// ---- Availability ----
router.get('/availability', (req, res) => {
  const { masterId, date, durationMin } = req.query;
  const duration = Number(durationMin) || 60;
  const db = readDb();
  const weekday = weekdayOf(date);
  const day = db.schedule.find((s) => String(s.masterId) === String(masterId) && Number(s.weekday) === weekday);
  if (!day) return res.json({ slots: [] });

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
  res.json({ slots });
});

// ---- Bookings ----
router.post('/bookings', (req, res) => {
  const { clientTelegramId, serviceId, masterId, date, startTime, endTime } = req.body;
  const booking = withDb((db) => {
    const created = {
      id: nextId(db, 'bookings'),
      clientTelegramId: String(clientTelegramId),
      serviceId: String(serviceId),
      masterId: String(masterId),
      date, startTime, endTime,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    db.bookings.push(created);
    return created;
  });
  res.json(booking);
});

router.get('/my-bookings', (req, res) => {
  const { clientTelegramId } = req.query;
  res.json(readDb().bookings.filter((b) => String(b.clientTelegramId) === String(clientTelegramId)));
});

router.post('/bookings/cancel', (req, res) => {
  const { bookingId } = req.body;
  const booking = withDb((db) => {
    const b = db.bookings.find((x) => String(x.id) === String(bookingId));
    if (b) b.status = 'cancelled';
    return b;
  });
  if (!booking) return res.status(404).json({ error: 'not_found' });
  res.json(booking);
});

router.post('/bookings/reschedule', (req, res) => {
  const { bookingId, date, startTime, endTime } = req.body;
  const booking = withDb((db) => {
    const b = db.bookings.find((x) => String(x.id) === String(bookingId));
    if (b) Object.assign(b, { date, startTime, endTime });
    return b;
  });
  if (!booking) return res.status(404).json({ error: 'not_found' });
  res.json(booking);
});

router.get('/admin/bookings', (req, res) => {
  res.json(readDb().bookings);
});

// ---- Profile ----
router.get('/profile', (req, res) => {
  const { clientTelegramId } = req.query;
  const profile = readDb().profiles.find((p) => String(p.telegramId) === String(clientTelegramId));
  res.json(profile ? [profile] : []);
});

router.post('/profile', (req, res) => {
  const { telegramId, name, phone } = req.body;
  const profile = withDb((db) => {
    let p = db.profiles.find((x) => String(x.telegramId) === String(telegramId));
    if (!p) { p = { telegramId: String(telegramId) }; db.profiles.push(p); }
    p.name = name;
    p.phone = phone;
    return p;
  });
  res.json(profile);
});

// ---- Admin access ----
router.post('/admin/login', (req, res) => {
  const { telegramId } = req.body;
  res.json({ ok: String(telegramId) === String(ADMIN_TELEGRAM_ID) });
});

export default router;
