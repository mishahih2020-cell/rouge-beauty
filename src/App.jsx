import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Promotions from './pages/Promotions';
import Services from './pages/Services';
import Masters from './pages/Masters';
import MasterDetail from './pages/MasterDetail';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import BottomNav from './components/BottomNav';

function AppShell() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/promotions" element={<Promotions />} />
        <Route path="/services" element={<Services />} />
        <Route path="/masters" element={<Masters />} />
        <Route path="/masters/:id" element={<MasterDetail />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Home />} />
      </Routes>
      {!isAdmin && <BottomNav />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppShell />
    </BrowserRouter>
  );
}
