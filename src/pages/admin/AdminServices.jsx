import { useEffect, useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { getServices, createService, updateService, deleteService } from '../../api';
import './Admin.css';

const EMPTY = { name: '', description: '', price: '', durationMin: '' };

function ServiceRow({ service, onSaved, onDeleted }) {
  const [form, setForm] = useState({ name: service.name, description: service.description || '', price: service.price, durationMin: service.durationMin, active: service.active });
  const [saving, setSaving] = useState(false);
  function set(field, value) { setForm((f) => ({ ...f, [field]: value })); }
  async function handleSave() { setSaving(true); try { await updateService({ id: service.id, ...form }); onSaved(); } finally { setSaving(false); } }
  async function handleDelete() { if (!window.confirm(`Удалить услугу "${service.name}"?`)) return; await deleteService(service.id); onDeleted(); }

  return (
    <Card className="admin-card">
      <div className="admin-field-row">
        <div className="admin-field"><label className="admin-label">Название</label><input className="admin-input" value={form.name} onChange={(e) => set('name', e.target.value)} /></div>
      </div>
      <div className="admin-field" style={{ marginBottom: 8 }}>
        <label className="admin-label">Описание</label>
        <textarea className="admin-textarea" value={form.description} onChange={(e) => set('description', e.target.value)} />
      </div>
      <div className="admin-field-row">
        <div className="admin-field"><label className="admin-label">Цена, ₽</label><input type="number" className="admin-input" value={form.price} onChange={(e) => set('price', e.target.value)} /></div>
        <div className="admin-field"><label className="admin-label">Длительность, мин</label><input type="number" className="admin-input" value={form.durationMin} onChange={(e) => set('durationMin', e.target.value)} /></div>
      </div>
      <div className="admin-checkbox-row">
        <input type="checkbox" id={`active-${service.id}`} checked={form.active} onChange={(e) => set('active', e.target.checked)} />
        <label htmlFor={`active-${service.id}`}>Активна (показывать клиентам)</label>
      </div>
      <div className="admin-actions-row">
        <Button variant="primary" size="sm" onClick={handleSave}>{saving ? 'Сохраняем…' : 'Сохранить'}</Button>
        <Button variant="ghost" size="sm" onClick={handleDelete}>Удалить</Button>
      </div>
    </Card>
  );
}

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newForm, setNewForm] = useState(EMPTY);
  const [creating, setCreating] = useState(false);

  function refresh() { setLoading(true); getServices().then(setServices).finally(() => setLoading(false)); }
  useEffect(refresh, []);

  async function handleCreate() {
    if (!newForm.name || !newForm.price || !newForm.durationMin) return;
    setCreating(true);
    try { await createService(newForm); setNewForm(EMPTY); refresh(); } finally { setCreating(false); }
  }

  return (
    <div>
      <div className="admin-card-title">Добавить услугу</div>
      <Card className="admin-card">
        <div className="admin-field" style={{ marginBottom: 8 }}><label className="admin-label">Название</label><input className="admin-input" value={newForm.name} onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))} placeholder="Например: Маникюр с покрытием" /></div>
        <div className="admin-field" style={{ marginBottom: 8 }}><label className="admin-label">Описание</label><textarea className="admin-textarea" value={newForm.description} onChange={(e) => setNewForm((f) => ({ ...f, description: e.target.value }))} /></div>
        <div className="admin-field-row">
          <div className="admin-field"><label className="admin-label">Цена, ₽</label><input type="number" className="admin-input" value={newForm.price} onChange={(e) => setNewForm((f) => ({ ...f, price: e.target.value }))} /></div>
          <div className="admin-field"><label className="admin-label">Длительность, мин</label><input type="number" className="admin-input" value={newForm.durationMin} onChange={(e) => setNewForm((f) => ({ ...f, durationMin: e.target.value }))} /></div>
        </div>
        <Button variant="primary" size="sm" onClick={handleCreate}>{creating ? 'Добавляем…' : 'Добавить услугу'}</Button>
      </Card>
      <div className="admin-section-title">Все услуги</div>
      {loading && <p className="admin-empty">Загружаем…</p>}
      {!loading && services.map((s) => <ServiceRow key={s.id} service={s} onSaved={refresh} onDeleted={refresh} />)}
    </div>
  );
}
