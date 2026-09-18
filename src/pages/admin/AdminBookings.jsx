import { useEffect, useState } from 'react';
import Card from '../../components/Card';
import { getAdminBookings, getServices, getMasters } from '../../api';
import './Admin.css';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminBookings(), getServices(), getMasters()])
      .then(([b, s, m]) => { setBookings(b); setServices(s); setMasters(m); })
      .finally(() => setLoading(false));
  }, []);

  function serviceName(id) { return services.find((s) => String(s.id) === String(id))?.name || '—'; }
  function masterName(id) { return masters.find((m) => String(m.id) === String(id))?.name || '—'; }

  return (
    <div>
      <div className="admin-section-title">Все записи клиентов</div>
      {loading && <p className="admin-empty">Загружаем…</p>}
      {!loading && bookings.length === 0 && <p className="admin-empty">Записей пока нет.</p>}
      {!loading && bookings.length > 0 && (
        <Card>
          {bookings.map((b) => (
            <div key={b.id} className="admin-bookings-item">
              <div>
                <div>{serviceName(b.serviceId)} · {masterName(b.masterId)}</div>
                <div style={{ color: 'var(--color-grey-text)', fontSize: 12 }}>Клиент: {b.clientTelegramId}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div>{b.date}, {b.startTime}</div>
                <div style={{ color: b.status === 'confirmed' ? 'var(--color-red-dark)' : 'var(--color-grey-mid)', fontSize: 12 }}>{b.status === 'confirmed' ? 'Подтверждена' : 'Отменена'}</div>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
