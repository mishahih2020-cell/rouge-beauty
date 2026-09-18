import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { getMasters } from '../api';
import { masterEmoji } from '../emoji';
import './Masters.css';

export default function Masters() {
  const navigate = useNavigate();
  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMasters().then(setMasters).finally(() => setLoading(false));
  }, []);

  return (
    <div className="masters-page">
      <h1 className="masters-page-title">Мастера</h1>
      {loading && <p>Загружаем мастеров…</p>}
      <div className="masters-page-list">
        {masters.map((master) => (
          <Card key={master.id} interactive className="master-full" onClick={() => navigate(`/masters/${master.id}`)}>
            <div className="master-photo" style={master.photoUrl ? { backgroundImage: `url(${master.photoUrl})` } : undefined}>
              {!master.photoUrl && <span className="master-photo-emoji">{masterEmoji(master.specialization)}</span>}
            </div>
            <div className="master-info">
              <div className="master-name">{master.name}</div>
              <div className="master-spec">{master.specialization}</div>
              {master.bio && <p className="master-bio">{master.bio}</p>}
              <div className="master-meta">
                <span>★ {master.rating}</span>
                <span>{master.experienceYears} лет опыта</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
