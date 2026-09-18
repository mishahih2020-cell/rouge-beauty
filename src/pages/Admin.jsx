import { useEffect, useState } from 'react';
import AdminServices from './admin/AdminServices';
import AdminMasters from './admin/AdminMasters';
import AdminSchedule from './admin/AdminSchedule';
import AdminBookings from './admin/AdminBookings';
import { adminCheckAccess } from '../api';
import { getTelegramUser } from '../telegram';
import './admin/Admin.css';

const TABS = [
  { key: 'services', label: 'Услуги', Component: AdminServices },
  { key: 'masters', label: 'Мастера', Component: AdminMasters },
  { key: 'schedule', label: 'График', Component: AdminSchedule },
  { key: 'bookings', label: 'Записи', Component: AdminBookings },
];

export default function Admin() {
  const [status, setStatus] = useState('checking');
  const [tab, setTab] = useState('services');

  useEffect(() => {
    const user = getTelegramUser();
    adminCheckAccess(user.id).then((res) => setStatus(res.ok ? 'allowed' : 'denied')).catch(() => setStatus('denied'));
  }, []);

  if (status === 'checking') return <div className="admin-login-page"><p className="admin-empty">Проверяем доступ…</p></div>;
  if (status === 'denied') {
    return (
      <div className="admin-login-page">
        <h1 className="admin-title">Доступ закрыт</h1>
        <p className="admin-empty">Админ-панель доступна только владельцу салона. Откройте приложение через Telegram, используя аккаунт владельца.</p>
      </div>
    );
  }

  const ActiveTab = TABS.find((t) => t.key === tab).Component;
  return (
    <div className="admin-page">
      <h1 className="admin-title">Админ-панель</h1>
      <div className="admin-tabs">
        {TABS.map((t) => <button key={t.key} className={`admin-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>)}
      </div>
      <ActiveTab />
    </div>
  );
}
