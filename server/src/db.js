import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

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
  if (!fs.existsSync(DB_FILE)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(seed(), null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function persist(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

export function readDb() {
  return load();
}

export function withDb(fn) {
  const data = load();
  const result = fn(data);
  persist(data);
  return result;
}

export function nextId(data, collection) {
  const id = data.nextId[collection];
  data.nextId[collection] += 1;
  return id;
}
