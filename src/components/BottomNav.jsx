import { Home, Percent, Sparkles, Users, CalendarCheck, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import './BottomNav.css';

const ITEMS = [
  { path: '/', label: 'Главная', icon: Home },
  { path: '/promotions', label: 'Акции', icon: Percent },
  { path: '/services', label: 'Услуги', icon: Sparkles },
  { path: '/masters', label: 'Мастера', icon: Users },
  { path: '/my-bookings', label: 'Записи', icon: CalendarCheck },
  { path: '/profile', label: 'Профиль', icon: User },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <nav className="bottom-nav">
      {ITEMS.map(({ path, label, icon: Icon }) => (
        <button key={path} className={`nav-item ${pathname === path ? 'active' : ''}`} onClick={() => navigate(path)}>
          <Icon size={20} strokeWidth={pathname === path ? 2.4 : 1.8} />
          {label}
        </button>
      ))}
    </nav>
  );
}
