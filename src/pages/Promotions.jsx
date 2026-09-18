import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import { getPromotions } from '../api';
import { formatDateShort } from '../format';
import './Promotions.css';

export default function Promotions() {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPromotions().then(setPromotions).finally(() => setLoading(false));
  }, []);

  return (
    <div className="promotions-page">
      <h1 className="promotions-title">Акции</h1>
      {loading && <p>Загружаем акции…</p>}
      <div className="promotions-list">
        {promotions.map((promo) => (
          <Card key={promo.id} className="promo-full">
            <span className="promo-full-tag">{promo.tag}</span>
            <div className="promo-full-title">{promo.title}</div>
            <p className="promo-full-desc">{promo.description}</p>
            <div className="promo-full-footer">
              <span className="promo-full-until">{promo.validUntil ? `до ${formatDateShort(promo.validUntil)}` : ''}</span>
              <Button variant="ghost" size="sm" onClick={() => navigate('/booking')}>Записаться</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
