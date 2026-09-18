import { useEffect, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { getMyBookings, getServices, getMasters, cancelBooking, rescheduleBooking, getAvailability } from '../api';
import { getTelegramUser } from '../telegram';
import './MyBookings.css';
import './Booking.css';

const WEEKDAY_LABELS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
function nextDays(count) {
  const days = [];
  const today = new Date();
  for (let i = 0; i < count; i += 1) { const d = new Date(today); d.setDate(today.getDate() + i); days.push(d); }
  return days;
}
function toISODate(date) { return date.toISOString().slice(0, 10); }

function ReschedulePanel({ booking, durationMin, onDone, onCancel }) {
  const [date, setDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const days = nextDays(14);

  function pickDate(d) {
    setDate(d);
    setLoading(true);
    getAvailability(booking.masterId, toISODate(d), durationMin).then((data) => setSlots(data.slots || [])).finally(() => setLoading(false));
  }
  async function pickSlot(slot) {
    await rescheduleBooking(booking.id, toISODate(date), slot.start, slot.end);
    onDone();
  }

  return (
    <div className="reschedule-panel">
      <div className="booking-dates-row">
        {days.map((d) => (
          <div key={toISODate(d)} className={`booking-date-chip ${date && toISODate(date) === toISODate(d) ? 'selected' : ''}`} onClick={() => pickDate(d)}>
            <div className="booking-date-weekday">{WEEKDAY_LABELS[d.getDay()]}</div>
            <div className="booking-date-day">{d.getDate()}</div>
          </div>
        ))}
      </div>
      {date && loading && <p className="mybookings-empty">Загружаем время…</p>}
      {date && !loading && slots.length === 0 && <p className="mybookings-empty">Свободного времени нет, выберите другой день.</p>}
      {date && !loading && slots.length > 0 && (
        <div className="booking-slots-grid">
          {slots.map((slot) => <div key={slot.start} className="booking-slot" onClick={() => pickSlot(slot)}>{slot.start}</div>)}
        </div>
      )}
      <div style={{ marginTop: 12 }}><Button variant="ghost" size="sm" block onClick={onCancel}>Отмена</Button></div>
    </div>
  );
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reschedulingId, setReschedulingId] = useState(null);
  const user = getTelegramUser();

  function refresh() {
    setLoading(true);
    Promise.all([getMyBookings(user.id), getServices(), getMasters()])
      .then(([b, s, m]) => { setBookings(b); setServices(s); setMasters(m); })
      .finally(() => setLoading(false));
  }
  useEffect(refresh, []);

  function serviceFor(id) { return services.find((s) => String(s.id) === String(id)); }
  function masterFor(id) { return masters.find((m) => String(m.id) === String(id)); }

  async function handleCancel(booking) {
    if (!window.confirm('Отменить эту запись?')) return;
    await cancelBooking(booking.id);
    refresh();
  }

  const today = toISODate(new Date());
  const upcoming = bookings.filter((b) => b.status === 'confirmed' && b.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const history = bookings.filter((b) => b.status === 'cancelled' || b.date < today).sort((a, b) => b.date.localeCompare(a.date));

  function renderBooking(booking) {
    const service = serviceFor(booking.serviceId);
    const master = masterFor(booking.masterId);
    const isUpcoming = booking.status === 'confirmed' && booking.date >= today;
    return (
      <Card key={booking.id} className="booking-item">
        <div className="booking-item-top">
          <div>
            <div className="booking-item-service">{service?.name || 'Услуга'}</div>
            <div className="booking-item-master">{master?.name || 'Мастер'}</div>
          </div>
          <div className="booking-item-when">{booking.date}<br />{booking.startTime}</div>
        </div>
        <span className={`booking-item-status status-${booking.status}`}>{booking.status === 'confirmed' ? 'Подтверждена' : 'Отменена'}</span>
        {isUpcoming && reschedulingId !== booking.id && (
          <div className="booking-item-actions">
            <Button variant="ghost" size="sm" onClick={() => setReschedulingId(booking.id)}>Перенести</Button>
            <Button variant="ghost" size="sm" onClick={() => handleCancel(booking)}>Отменить</Button>
          </div>
        )}
        {isUpcoming && reschedulingId === booking.id && (
          <ReschedulePanel booking={booking} durationMin={service?.durationMin || 60} onDone={() => { setReschedulingId(null); refresh(); }} onCancel={() => setReschedulingId(null)} />
        )}
      </Card>
    );
  }

  return (
    <div className="mybookings-page">
      <h1 className="mybookings-title">Мои записи</h1>
      {loading && <p className="mybookings-empty">Загружаем записи…</p>}
      {!loading && (
        <>
          <div className="mybookings-section-title">Ближайшие</div>
          {upcoming.length === 0 && <p className="mybookings-empty">Активных записей нет.</p>}
          <div className="mybookings-list">{upcoming.map(renderBooking)}</div>
          {history.length > 0 && (
            <>
              <div className="mybookings-section-title">История</div>
              <div className="mybookings-list">{history.map(renderBooking)}</div>
            </>
          )}
        </>
      )}
    </div>
  );
}
