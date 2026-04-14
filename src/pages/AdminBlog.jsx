import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/Button';
import { Plus, Pencil, Trash2, Globe, FileText } from 'lucide-react';

const API = 'http://localhost:5200/api/blog/admin/posts';

const AdminBlog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const headers = { 'x-user-uid': localStorage.getItem('userUID') };

  const fetchPosts = async () => {
    try {
      const { data } = await axios.get(API, { headers });
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const togglePublish = async (id) => {
    await axios.patch(`${API}/${id}/publish`, {}, { headers });
    fetchPosts();
  };

  const deletePost = async (id) => {
    if (!confirm('Удалить пост?')) return;
    await axios.delete(`${API}/${id}`, { headers });
    fetchPosts();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Блог</h1>
        <Button size="sm" onClick={() => navigate('/admin/blog/new')}>
          <Plus size={16} className="mr-2" /> Новый пост
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-12">Загрузка...</p>
      ) : posts.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Постов пока нет</p>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Заголовок</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Дата</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-4 font-medium">{post.title}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                      ${post.status === 'published'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'}`}>
                      {post.status === 'published' ? <Globe size={11} /> : <FileText size={11} />}
                      {post.status === 'published' ? 'Опубликован' : 'Черновик'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => togglePublish(post.id)}
                        className="p-1.5 rounded hover:bg-muted transition-colors"
                        title={post.status === 'published' ? 'Снять с публикации' : 'Опубликовать'}
                      >
                        <Globe size={15} className={post.status === 'published' ? 'text-primary' : 'text-muted-foreground'} />
                      </button>
                      <button
                        onClick={() => navigate(`/admin/blog/${post.id}/edit`)}
                        className="p-1.5 rounded hover:bg-muted transition-colors"
                        title="Редактировать"
                      >
                        <Pencil size={15} className="text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="p-1.5 rounded hover:bg-muted transition-colors"
                        title="Удалить"
                      >
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

export default AdminBlog;
