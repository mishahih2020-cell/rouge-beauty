import { useEffect, useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { getMasters, getSchedule, saveScheduleDay, deleteScheduleDay } from '../../api';
import './Admin.css';

const WEEKDAYS = [
  { value: 1, label: 'пн' }, { value: 2, label: 'вт' }, { value: 3, label: 'ср' },
  { value: 4, label: 'чт' }, { value: 5, label: 'пт' }, { value: 6, label: 'сб' }, { value: 0, label: 'вс' },
];

function DayRow({ masterId, weekday, label, existing, onChange }) {
  const [startTime, setStartTime] = useState(existing?.startTime || '');
  const [endTime, setEndTime] = useState(existing?.endTime || '');
  const [saving, setSaving] = useState(false);
  async function handleSave() { setSaving(true); try { await saveScheduleDay(masterId, weekday, startTime, endTime); onChange(); } finally { setSaving(false); } }
  async function handleOff() { setSaving(true); try { await deleteScheduleDay(masterId, weekday); setStartTime(''); setEndTime(''); onChange(); } finally { setSaving(false); } }
  return (
    <div className="admin-schedule-row">
      <div className="admin-schedule-day">{label}</div>
      <input type="time" className="admin-input" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{ maxWidth: 100 }} />
      <input type="time" className="admin-input" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={{ maxWidth: 100 }} />
      <Button variant="ghost" size="sm" onClick={handleSave}>{saving ? '…' : 'Сохранить'}</Button>
      <Button variant="ghost" size="sm" onClick={handleOff}>Выходной</Button>
    </div>
  );
}

export default function AdminSchedule() {
  const [masters, setMasters] = useState([]);
  const [masterId, setMasterId] = useState('');
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getMasters().then((data) => { setMasters(data); if (data.length > 0) setMasterId(String(data[0].id)); }); }, []);
  function refreshSchedule() { if (!masterId) return; setLoading(true); getSchedule(masterId).then(setSchedule).finally(() => setLoading(false)); }
  useEffect(refreshSchedule, [masterId]);

  return (
    <div>
      <div className="admin-field" style={{ marginBottom: 16 }}>
        <label className="admin-label">Мастер</label>
        <select className="admin-select" value={masterId} onChange={(e) => setMasterId(e.target.value)}>
          {masters.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>
      <Card className="admin-card">
        {loading && <p className="admin-empty">Загружаем график…</p>}
        {!loading && WEEKDAYS.map(({ value, label }) => (
          <DayRow key={value} masterId={masterId} weekday={value} label={label} existing={schedule.find((s) => Number(s.weekday) === value)} onChange={refreshSchedule} />
        ))}
      </Card>
      <p className="admin-empty">Оставьте поля времени пустыми и нажмите "Выходной", чтобы убрать рабочий день.</p>
    </div>
  );
}
