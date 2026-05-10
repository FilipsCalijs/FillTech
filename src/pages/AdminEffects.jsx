import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Pencil, Trash2, Globe, FileText } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/Button';

const API = 'http://localhost:5200/api/effects';
const headers = () => ({ 'x-user-uid': localStorage.getItem('userUID') });

const AdminEffects = () => {
  const [effects, setEffects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetch = async () => {
    try {
      const { data } = await axios.get(`${API}/admin/all`, { headers: headers() });
      setEffects(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const togglePublish = async (id) => {
    await axios.patch(`${API}/admin/${id}/publish`, {}, { headers: headers() });
    fetch();
  };

  const deleteEffect = async (id) => {
    if (!confirm('Удалить эффект?')) return;
    await axios.delete(`${API}/admin/${id}`, { headers: headers() });
    fetch();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Эффекты</h1>
        <Button size="sm" onClick={() => navigate('/admin/effects/new')}>
          <Plus size={16} className="mr-2" /> Новый эффект
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-12">Загрузка...</p>
      ) : effects.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Эффектов пока нет</p>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Эффект</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Статус</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {effects.map((e) => (
                <tr key={e.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{e.icon}</span>
                      <span className="font-medium">{e.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{e.slug}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                      ${e.status === 'published'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'}`}>
                      {e.status === 'published' ? <Globe size={11} /> : <FileText size={11} />}
                      {e.status === 'published' ? 'Опубликован' : 'Черновик'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => togglePublish(e.id)} className="p-1.5 rounded hover:bg-muted transition-colors" title="Переключить статус">
                        <Globe size={15} className={e.status === 'published' ? 'text-primary' : 'text-muted-foreground'} />
                      </button>
                      <button onClick={() => navigate(`/admin/effects/${e.id}/edit`)} className="p-1.5 rounded hover:bg-muted transition-colors" title="Редактировать">
                        <Pencil size={15} className="text-muted-foreground" />
                      </button>
                      <button onClick={() => deleteEffect(e.id)} className="p-1.5 rounded hover:bg-muted transition-colors" title="Удалить">
                        <Trash2 size={15} className="text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminEffects;
