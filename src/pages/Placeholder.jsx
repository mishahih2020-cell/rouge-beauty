import './Placeholder.css';

export default function Placeholder({ title }) {
  return (
    <div className="placeholder-page">
      <h1>{title}</h1>
      <p>Этот экран появится на следующем этапе разработки.</p>
    </div>
  );
}
