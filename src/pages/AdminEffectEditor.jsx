import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';

const API = 'http://localhost:5200/api/effects';
const headers = () => ({ 'x-user-uid': localStorage.getItem('userUID') });

const toSlug = (str) =>
  str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring";

const AdminEffectEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [form, setForm] = useState({
    name: '', slug: '', short_desc: '', description: '',
    icon: '✨', cover_url: '', status: 'draft', sort_order: 0,
  });
  const [slugManual, setSlugManual] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isNew) {
      axios.get(`${API}/${id}`, { headers: headers() })
        .then(({ data }) => { setForm(data); setSlugManual(true); })
        .catch(() => navigate('/admin/effects'));
    }
  }, [id]);

  const set = (key) => (e) => {
    const val = e.target.value;
    setForm(prev => {
      const next = { ...prev, [key]: val };
      if (key === 'name' && !slugManual) next.slug = toSlug(val);
      return next;
    });
  };

  const handleSlug = (e) => {
    setSlugManual(true);
    setForm(prev => ({ ...prev, slug: toSlug(e.target.value) }));
  };

  const handleSave = async (status) => {
    if (!form.name.trim() || !form.slug.trim()) {
      setError('Название и slug обязательны');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, status };
      if (isNew) {
        await axios.post(`${API}/admin`, payload, { headers: headers() });
      } else {
        await axios.put(`${API}/admin/${id}`, payload, { headers: headers() });
      }
      navigate('/admin/effects');
    } catch (e) {
      setError(e.response?.data?.error || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <Typography variant="h2" weight="bold">
          {isNew ? 'Новый эффект' : 'Редактировать эффект'}
        </Typography>
        <button onClick={() => navigate('/admin/effects')} className="text-sm text-muted-foreground hover:text-foreground">
          ← Назад
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Название *">
            <input className={inputCls} value={form.name} onChange={set('name')} placeholder="Watermark Remover" />
          </Field>
          <Field label="Slug *">
            <input className={inputCls} value={form.slug} onChange={handleSlug} placeholder="watermark-remover" />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Иконка (emoji)">
            <input className={inputCls} value={form.icon} onChange={set('icon')} placeholder="✨" maxLength={10} />
          </Field>
          <Field label="Порядок сортировки">
            <input className={inputCls} type="number" value={form.sort_order} onChange={set('sort_order')} />
          </Field>
        </div>

        <Field label="Короткое описание (для карточки)">
          <input className={inputCls} value={form.short_desc} onChange={set('short_desc')} placeholder="Remove watermarks from any image with AI" maxLength={500} />
        </Field>

        <Field label="Полное описание (для страницы инструмента)">
          <textarea className={`${inputCls} resize-none`} rows={4} value={form.description} onChange={set('description')} placeholder="Подробное описание инструмента..." />
        </Field>

        <Field label="URL обложки (необязательно)">
          <input className={inputCls} value={form.cover_url} onChange={set('cover_url')} placeholder="https://..." />
        </Field>

        {error && <Typography variant="body2" className="text-destructive block">{error}</Typography>}

        <div className="flex gap-3 pt-2">
          <Button onClick={() => handleSave('draft')} variant="outline" disabled={saving}>
            Сохранить черновик
          </Button>
          <Button onClick={() => handleSave('published')} disabled={saving} isLoading={saving}>
            Опубликовать
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminEffectEditor;
