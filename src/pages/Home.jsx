import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoyaltyCard from '../components/LoyaltyCard';
import PromoBanner from '../components/PromoBanner';
import ServiceCard from '../components/ServiceCard';
import Button from '../components/Button';
import { getServices, getPromotions } from '../api';
import { formatDateShort } from '../format';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([getServices(), getPromotions()])
      .then(([servicesData, promosData]) => {
        setServices(servicesData.slice(0, 3));
        setPromotions(promosData.map((p) => ({
          id: p.id, tag: p.tag, title: p.title, description: p.description,
          until: p.validUntil ? formatDateShort(p.validUntil) : null,
        })));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-greeting">Добро пожаловать</div>
        <h1 className="home-title">ROUGE Beauty</h1>
      </header>

      <LoyaltyCard name="Марина" tier="SILVER" cashback={5} balance={1240} />

      {error && <p className="home-error">Не удалось загрузить данные. Проверьте соединение.</p>}

      <section className="section">
        <div className="section-heading">
          <h2 className="section-title">Акции</h2>
          <span className="section-link" onClick={() => navigate('/promotions')}>Все акции</span>
        </div>
        {loading ? <p className="home-loading">Загружаем акции…</p> : <PromoBanner promotions={promotions} />}
      </section>

      <section className="section">
        <div className="section-heading">
          <h2 className="section-title">Популярные услуги</h2>
          <span className="section-link" onClick={() => navigate('/services')}>Все услуги</span>
        </div>
        {loading ? <p className="home-loading">Загружаем услуги…</p> : (
          <div className="services-list">
            {services.map((service) => (
              <ServiceCard key={service.id} service={{ name: service.name, duration: service.durationMin, price: service.price, photo: service.photoUrl || null }} onClick={() => navigate('/booking')} />
            ))}
          </div>
        )}
      </section>

      <div className="cta-block">
        <Button variant="primary" block onClick={() => navigate('/booking')}>Записаться</Button>
      </div>
    </div>
  );
}
