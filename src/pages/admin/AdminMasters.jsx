import { useEffect, useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { getMasters, createMaster, updateMaster, deleteMaster } from '../../api';
import './Admin.css';

const EMPTY = { name: '', specialization: '', bio: '', rating: 5, experienceYears: '' };

function MasterRow({ master, onSaved, onDeleted }) {
  const [form, setForm] = useState({ name: master.name, specialization: master.specialization || '', bio: master.bio || '', rating: master.rating, experienceYears: master.experienceYears, active: master.active });
  const [saving, setSaving] = useState(false);
  function set(field, value) { setForm((f) => ({ ...f, [field]: value })); }
  async function handleSave() { setSaving(true); try { await updateMaster({ id: master.id, ...form }); onSaved(); } finally { setSaving(false); } }
  async function handleDelete() { if (!window.confirm(`Удалить мастера "${master.name}"?`)) return; await deleteMaster(master.id); onDeleted(); }

  return (
    <Card className="admin-card">
      <div className="admin-field" style={{ marginBottom: 8 }}><label className="admin-label">Имя</label><input className="admin-input" value={form.name} onChange={(e) => set('name', e.target.value)} /></div>
      <div className="admin-field" style={{ marginBottom: 8 }}><label className="admin-label">Специализация</label><input className="admin-input" value={form.specialization} onChange={(e) => set('specialization', e.target.value)} /></div>
      <div className="admin-field" style={{ marginBottom: 8 }}><label className="admin-label">О мастере</label><textarea className="admin-textarea" value={form.bio} onChange={(e) => set('bio', e.target.value)} /></div>
      <div className="admin-field-row">
        <div className="admin-field"><label className="admin-label">Рейтинг</label><input type="number" step="0.1" className="admin-input" value={form.rating} onChange={(e) => set('rating', e.target.value)} /></div>
        <div className="admin-field"><label className="admin-label">Лет опыта</label><input type="number" className="admin-input" value={form.experienceYears} onChange={(e) => set('experienceYears', e.target.value)} /></div>
      </div>
      <div className="admin-checkbox-row">
        <input type="checkbox" id={`m-active-${master.id}`} checked={form.active} onChange={(e) => set('active', e.target.checked)} />
        <label htmlFor={`m-active-${master.id}`}>Активен (показывать клиентам)</label>
      </div>
      <div className="admin-actions-row">
        <Button variant="primary" size="sm" onClick={handleSave}>{saving ? 'Сохраняем…' : 'Сохранить'}</Button>
        <Button variant="ghost" size="sm" onClick={handleDelete}>Удалить</Button>
      </div>
    </Card>
  );
}

export default function AdminMasters() {
  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newForm, setNewForm] = useState(EMPTY);
  const [creating, setCreating] = useState(false);
  function refresh() { setLoading(true); getMasters().then(setMasters).finally(() => setLoading(false)); }
  useEffect(refresh, []);
  async function handleCreate() {
    if (!newForm.name || !newForm.specialization) return;
    setCreating(true);
    try { await createMaster(newForm); setNewForm(EMPTY); refresh(); } finally { setCreating(false); }
  }
  return (
    <div>
      <div className="admin-card-title">Добавить мастера</div>
      <Card className="admin-card">
        <div className="admin-field" style={{ marginBottom: 8 }}><label className="admin-label">Имя</label><input className="admin-input" value={newForm.name} onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))} /></div>
        <div className="admin-field" style={{ marginBottom: 8 }}><label className="admin-label">Специализация</label><input className="admin-input" value={newForm.specialization} onChange={(e) => setNewForm((f) => ({ ...f, specialization: e.target.value }))} /></div>
        <div className="admin-field" style={{ marginBottom: 8 }}><label className="admin-label">О мастере</label><textarea className="admin-textarea" value={newForm.bio} onChange={(e) => setNewForm((f) => ({ ...f, bio: e.target.value }))} /></div>
        <div className="admin-field-row"><div className="admin-field"><label className="admin-label">Лет опыта</label><input type="number" className="admin-input" value={newForm.experienceYears} onChange={(e) => setNewForm((f) => ({ ...f, experienceYears: e.target.value }))} /></div></div>
        <Button variant="primary" size="sm" onClick={handleCreate}>{creating ? 'Добавляем…' : 'Добавить мастера'}</Button>
      </Card>
      <div className="admin-section-title">Все мастера</div>
      {loading && <p className="admin-empty">Загружаем…</p>}
      {!loading && masters.map((m) => <MasterRow key={m.id} master={m} onSaved={refresh} onDeleted={refresh} />)}
    </div>
  );
}
