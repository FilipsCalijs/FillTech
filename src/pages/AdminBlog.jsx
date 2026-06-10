import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useLangNavigate from '@/hooks/useLangNavigate';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/Button';
import { Plus, Pencil, Trash2, Globe, FileText } from 'lucide-react';
import { useLang } from '@/contexts/LangContext';
import { API_URL } from '@/config/api';

const API = `${API_URL}/api/blog/admin/posts`;

const AdminBlog = () => {
  const { t } = useTranslation('blog');
  const { t: tc } = useTranslation('common');
  const lang = useLang();
  const navigate = useLangNavigate();
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);

  const headers = { 'x-user-uid': localStorage.getItem('userUID') };

  const fetchPosts = async () => {
    try {
      const { data } = await axios.get(API, { headers });
      setPosts(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(); }, []);

  const togglePublish = async (id) => {
    await axios.patch(`${API}/${id}/publish`, {}, { headers });
    fetchPosts();
  };

  const deletePost = async (id) => {
    if (!confirm(t('admin.deleteConfirm'))) return;
    await axios.delete(`${API}/${id}`, { headers });
    fetchPosts();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('admin.blog')}</h1>
        <Button size="sm" onClick={() => navigate('/admin/blog/new')}>
          <Plus size={16} className="mr-2" /> {t('admin.newPost')}
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-12">{tc('loading')}</p>
      ) : posts.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">{t('admin.noPostsYet')}</p>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('admin.title')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('admin.status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('admin.date')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-4 font-medium">{post.title}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                      ${post.status === 'published' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {post.status === 'published' ? <Globe size={11} /> : <FileText size={11} />}
                      {post.status === 'published' ? t('admin.published') : t('admin.draft')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString(lang)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => togglePublish(post.id)} className="p-1.5 rounded hover:bg-muted transition-colors"
                        title={post.status === 'published' ? t('admin.unpublish') : t('admin.publish')}>
                        <Globe size={15} className={post.status === 'published' ? 'text-primary' : 'text-muted-foreground'} />
                      </button>
                      <button onClick={() => navigate(`/admin/blog/${post.id}/edit`)} className="p-1.5 rounded hover:bg-muted transition-colors" title={t('admin.edit')}>
                        <Pencil size={15} className="text-muted-foreground" />
                      </button>
                      <button onClick={() => deletePost(post.id)} className="p-1.5 rounded hover:bg-muted transition-colors" title={t('admin.delete')}>
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
