import './Card.css';

export default function Card({ children, interactive = false, onClick, className = '' }) {
  return (
    <div className={`card ${interactive ? 'card-interactive' : ''} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
