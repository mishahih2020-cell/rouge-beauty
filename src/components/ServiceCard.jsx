import Card from './Card';
import './ServiceCard.css';

export default function ServiceCard({ service, onClick }) {
  return (
    <Card interactive onClick={onClick}>
      <div className="service-card">
        <div className="service-photo" style={service.photo ? { backgroundImage: `url(${service.photo})` } : undefined} />
        <div className="service-info">
          <div className="service-name">{service.name}</div>
          <div className="service-meta">{service.duration} мин</div>
        </div>
        <div className="service-price">{service.price} ₽</div>
      </div>
    </Card>
  );
}
