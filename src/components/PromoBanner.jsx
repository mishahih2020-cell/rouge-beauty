import './PromoBanner.css';

export default function PromoBanner({ promotions = [] }) {
  if (!promotions.length) return null;
  return (
    <div className="promo-scroller">
      {promotions.map((promo) => (
        <div className="promo-card" key={promo.id}>
          <span className="promo-card-tag">{promo.tag}</span>
          <div className="promo-card-title">{promo.title}</div>
          <p className="promo-card-desc">{promo.description}</p>
          {promo.until && <div className="promo-card-until">до {promo.until}</div>}
        </div>
      ))}
    </div>
  );
}
