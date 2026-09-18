import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronLeft } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { getServices, getMasters, getAvailability, createBooking } from '../api';
import { getTelegramUser } from '../telegram';
import './Booking.css';

const STEPS = ['service', 'master', 'date', 'time', 'confirm', 'success'];
const WEEKDAY_LABELS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

function nextDays(count) {
  const days = [];
  const today = new Date();
  for (let i = 0; i < count; i += 1) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}
function toISODate(date) { return date.toISOString().slice(0, 10); }

export default function Booking() {
  const navigate = useNavigate();
  const location = useLocation();
  const presetMasterId = location.state?.presetMasterId;
  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];

  const [services, setServices] = useState([]);
  const [masters, setMasters] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedMaster, setSelectedMaster] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const days = useMemo(() => nextDays(14), []);

  useEffect(() => {
    getServices().then(setServices);
    getMasters().then((data) => {
      setMasters(data);
      if (presetMasterId) {
        const found = data.find((m) => String(m.id) === String(presetMasterId));
        if (found) setSelectedMaster(found);
      }
    });
  }, [presetMasterId]);

  function handleServiceSelect(service) {
    setSelectedService(service);
    setStepIndex(selectedMaster ? 2 : 1);
  }

  useEffect(() => {
    if (step !== 'time' || !selectedMaster || !selectedDate || !selectedService) return;
    setSlotsLoading(true);
    setSelectedSlot(null);
    getAvailability(selectedMaster.id, toISODate(selectedDate), selectedService.durationMin)
      .then((data) => setSlots(data.slots || []))
      .finally(() => setSlotsLoading(false));
  }, [step, selectedMaster, selectedDate, selectedService]);

  function goBack() { setStepIndex((i) => Math.max(0, i - 1)); }
  function goNext() { setStepIndex((i) => Math.min(STEPS.length - 1, i + 1)); }

  async function handleConfirm() {
    setSubmitting(true);
    setErrorMsg('');
    const user = getTelegramUser();
    try {
      await createBooking({
        clientTelegramId: user.id,
        serviceId: String(selectedService.id),
        masterId: String(selectedMaster.id),
        date: toISODate(selectedDate),
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
      });
      goNext();
    } catch (e) {
      setErrorMsg('Не получилось создать запись. Попробуйте ещё раз.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="booking-page">
      {step !== 'success' && (
        <div className="booking-steps">
          {STEPS.slice(0, 5).map((s, i) => (
            <div key={s} className={`booking-step-dot ${i < stepIndex ? 'done' : ''} ${i === stepIndex ? 'active' : ''}`} />
          ))}
        </div>
      )}

      {stepIndex > 0 && step !== 'success' && (
        <button className="booking-back" onClick={goBack}><ChevronLeft size={14} style={{ verticalAlign: -2 }} /> Назад</button>
      )}

      {step === 'service' && (
        <>
          <h1 className="booking-title">Выберите услугу</h1>
          {selectedMaster && <p className="booking-empty" style={{ marginTop: -12, marginBottom: 12 }}>Мастер: {selectedMaster.name}</p>}
          <div className="booking-list">
            {services.map((service) => (
              <Card key={service.id} interactive className="booking-pick-card" onClick={() => handleServiceSelect(service)}>
                <div>
                  <div className="booking-pick-name">{service.name}</div>
                  <div className="booking-pick-meta">{service.durationMin} мин</div>
                </div>
                <div className="booking-pick-meta">{service.price} ₽</div>
              </Card>
            ))}
          </div>
        </>
      )}

      {step === 'master' && (
        <>
          <h1 className="booking-title">Выберите мастера</h1>
          <div className="booking-list">
            {masters.map((master) => (
              <Card key={master.id} interactive className="booking-pick-card" onClick={() => { setSelectedMaster(master); goNext(); }}>
                <div>
                  <div className="booking-pick-name">{master.name}</div>
                  <div className="booking-pick-meta">{master.specialization}</div>
                </div>
                <div className="booking-pick-meta">★ {master.rating}</div>
              </Card>
            ))}
          </div>
        </>
      )}

      {step === 'date' && (
        <>
          <h1 className="booking-title">Выберите дату</h1>
          <div className="booking-dates-row">
            {days.map((d) => (
              <div key={toISODate(d)} className={`booking-date-chip ${selectedDate && toISODate(selectedDate) === toISODate(d) ? 'selected' : ''}`} onClick={() => { setSelectedDate(d); goNext(); }}>
                <div className="booking-date-weekday">{WEEKDAY_LABELS[d.getDay()]}</div>
                <div className="booking-date-day">{d.getDate()}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {step === 'time' && (
        <>
          <h1 className="booking-title">Выберите время</h1>
          {slotsLoading && <p className="booking-empty">Загружаем свободное время…</p>}
          {!slotsLoading && slots.length === 0 && <p className="booking-empty">На эту дату свободного времени нет. Выберите другой день.</p>}
          <div className="booking-slots-grid">
            {slots.map((slot) => (
              <div key={slot.start} className={`booking-slot ${selectedSlot?.start === slot.start ? 'selected' : ''}`} onClick={() => { setSelectedSlot(slot); goNext(); }}>
                {slot.start}
              </div>
            ))}
          </div>
        </>
      )}

      {step === 'confirm' && (
        <>
          <h1 className="booking-title">Подтвердите запись</h1>
          <Card className="booking-summary-card">
            <div className="booking-summary-row"><span className="booking-summary-label">Услуга</span><span>{selectedService?.name}</span></div>
            <div className="booking-summary-row"><span className="booking-summary-label">Мастер</span><span>{selectedMaster?.name}</span></div>
            <div className="booking-summary-row"><span className="booking-summary-label">Дата</span><span>{selectedDate && toISODate(selectedDate)}</span></div>
            <div className="booking-summary-row"><span className="booking-summary-label">Время</span><span>{selectedSlot?.start}–{selectedSlot?.end}</span></div>
            <div className="booking-summary-row"><span className="booking-summary-label">Стоимость</span><span>{selectedService?.price} ₽</span></div>
          </Card>
          {errorMsg && <p className="booking-empty">{errorMsg}</p>}
          <div style={{ marginTop: 24 }}>
            <Button variant="primary" block onClick={handleConfirm}>{submitting ? 'Записываем…' : 'Подтвердить запись'}</Button>
          </div>
        </>
      )}

      {step === 'success' && (
        <div className="booking-success">
          <CheckCircle2 size={56} color="var(--color-red)" />
          <div className="booking-success-title">Вы записаны!</div>
          <p className="booking-success-desc">
            {selectedService?.name} · {selectedMaster?.name}<br />
            {selectedDate && toISODate(selectedDate)}, {selectedSlot?.start}
          </p>
          <div style={{ marginTop: 24 }}>
            <Button variant="primary" block onClick={() => navigate('/my-bookings')}>Мои записи</Button>
          </div>
        </div>
      )}
    </div>
  );
}
