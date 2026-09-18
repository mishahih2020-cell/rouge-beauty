import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import { getProfile, saveProfile, getMyBookings, getServices } from '../api';
import { getTelegramUser } from '../telegram';
import './Profile.css';

const OWNER_TELEGRAM_ID = '8419316772';
function toISODate(date) { return date.toISOString().slice(0, 10); }

export default function Profile() {
  const navigate = useNavigate();
  const user = getTelegramUser();
  const isOwner = String(user.id) === OWNER_TELEGRAM_ID;
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProfile(user.id), getMyBookings(user.id), getServices()])
      .then(([profile, bookings, servicesData]) => {
        if (profile) { setName(profile.name || user.name || ''); setPhone(profile.phone || ''); }
        const today = toISODate(new Date());
        setHistory(bookings.filter((b) => b.status === 'confirmed' && b.date < today).sort((a, b) => b.date.localeCompare(a.date)));
        setServices(servicesData);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try { await saveProfile(user.id, name, phone); setSaved(true); } finally { setSaving(false); }
  }

  function serviceName(id) { return services.find((s) => String(s.id) === String(id))?.name || 'Услуга'; }

  return (
    <div className="profile-page">
      <h1 className="profile-title">Профиль</h1>
      <Card className="profile-card">
        <div className="profile-field">
          <label className="profile-label">Имя</label>
          <input className="profile-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Как к вам обращаться" />
        </div>
        <div className="profile-field">
          <label className="profile-label">Телефон</label>
          <input className="profile-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 900 000-00-00" inputMode="tel" />
        </div>
        <Button variant="primary" block onClick={handleSave}>{saving ? 'Сохраняем…' : 'Сохранить'}</Button>
        {saved && <div className="profile-saved-note">Данные сохранены</div>}
      </Card>

      <div className="profile-history-title">История посещений</div>
      {loading && <p className="profile-history-empty">Загружаем историю…</p>}
      {!loading && history.length === 0 && <p className="profile-history-empty">Пока нет завершённых визитов.</p>}
      {!loading && history.length > 0 && (
        <Card>{history.map((b) => (
          <div key={b.id} className="profile-history-item"><span>{serviceName(b.serviceId)}</span><span>{b.date}</span></div>
        ))}</Card>
      )}

      {isOwner && (
        <div style={{ marginTop: 32 }}>
          <Button variant="ghost" block onClick={() => navigate('/admin')}>Панель администратора</Button>
        </div>
      )}
    </div>
  );
}
