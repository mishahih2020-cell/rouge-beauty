import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import { getServices } from '../api';
import './Services.css';

export default function Services() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServices().then(setServices).finally(() => setLoading(false));
  }, []);

  return (
    <div className="services-page">
      <h1 className="services-page-title">Услуги</h1>
      {loading && <p>Загружаем услуги…</p>}
      <div className="services-page-list">
        {services.map((service) => (
          <Card key={service.id} className="service-full">
            <div className="service-full-name">{service.name}</div>
            {service.description && <p className="service-full-desc">{service.description}</p>}
            <div className="service-full-footer">
              <span className="service-full-meta">{service.durationMin} мин</span>
              <span className="service-full-price">{service.price} ₽</span>
            </div>
            <div style={{ marginTop: 12 }}>
              <Button variant="ghost" size="sm" block onClick={() => navigate('/booking')}>Записаться</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
