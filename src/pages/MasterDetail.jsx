import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Star, Briefcase } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { getMasters } from '../api';
import './MasterDetail.css';

export default function MasterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [master, setMaster] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMasters().then((masters) => {
      setMaster(masters.find((m) => String(m.id) === String(id)) || null);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="master-detail-page"><p>Загружаем анкету мастера…</p></div>;

  if (!master) {
    return (
      <div className="master-detail-page">
        <button className="booking-back" onClick={() => navigate('/masters')}><ChevronLeft size={14} style={{ verticalAlign: -2 }} /> Назад</button>
        <p className="master-not-found">Мастер не найден.</p>
      </div>
    );
  }

  return (
    <div className="master-detail-page">
      <button className="booking-back" onClick={() => navigate('/masters')}><ChevronLeft size={14} style={{ verticalAlign: -2 }} /> Назад</button>
      <div className="master-detail-photo" style={master.photoUrl ? { backgroundImage: `url(${master.photoUrl})` } : undefined} />
      <h1 className="master-detail-name">{master.name}</h1>
      <div className="master-detail-spec">{master.specialization}</div>
      <div className="master-detail-stats">
        <Card className="master-stat-card">
          <div className="master-stat-value"><Star size={16} style={{ verticalAlign: -2, marginRight: 4 }} />{master.rating}</div>
          <div className="master-stat-label">Рейтинг</div>
        </Card>
        <Card className="master-stat-card">
          <div className="master-stat-value"><Briefcase size={16} style={{ verticalAlign: -2, marginRight: 4 }} />{master.experienceYears}</div>
          <div className="master-stat-label">Лет опыта</div>
        </Card>
      </div>
      <div className="master-detail-section-title">О мастере</div>
      <p className="master-detail-bio">{master.bio || 'Информация появится позже.'}</p>
      <div className="master-detail-cta">
        <Button variant="primary" block onClick={() => navigate('/booking', { state: { presetMasterId: master.id } })}>
          Записаться к {master.name.split(' ')[0]}
        </Button>
      </div>
    </div>
  );
}
