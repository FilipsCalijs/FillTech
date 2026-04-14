import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import MediaPicker from '@/components/admin/MediaPicker';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Globe, ImagePlus, X } from 'lucide-react';

const API = 'http://localhost:5200/api/blog/admin/posts';

const AdminBlogEditor = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    seo_title: '',
    seo_description: '',
  });
  const [coverUrl, setCoverUrl] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [postStatus, setPostStatus] = useState('draft');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPicker, setShowPicker] = useState(false);

  const headers = { 'x-user-uid': localStorage.getItem('userUID') };

  useEffect(() => {
    if (!isEdit) return;
    axios.get(API, { headers }).then(({ data }) => {
      const post = data.find((p) => String(p.id) === String(id));
      if (!post) return;
      setForm({
        title: post.title || '',
        content: post.content || '',
        excerpt: post.excerpt || '',
        seo_title: post.seo_title || '',
        seo_description: post.seo_description || '',
      });
      setCoverUrl(post.cover_url || '');
      setTags(Array.isArray(post.tags) ? post.tags : []);
      setPostStatus(post.status || 'draft');
    });
  }, [id]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const addTag = (raw) => {
    const tag = raw.trim().toLowerCase().replace(/^#/, '');
    if (tag && !tags.includes(tag)) setTags((prev) => [...prev, tag]);
    setTagInput('');
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const handlePublish = async () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Обязательное поле';
    if (!form.content.trim()) errs.content = 'Обязательное поле';
    if (!coverUrl) errs.cover = 'Обложка обязательна';
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    setError('');
    try {
      const payload = { ...form, cover_url: coverUrl, tags, publish: true };
      if (isEdit) {
        await axios.put(`${API}/${id}`, payload, { headers });
      } else {
        await axios.post(API, payload, { headers });
      }
      navigate('/admin/blog');
    } catch {
      setError('Ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  };

  const handleUnpublish = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.patch(`${API}/${id}/publish`, {}, { headers });
      setPostStatus(data.status);
    } catch {
      setError('Ошибка при снятии с публикации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      {showPicker && (
        <MediaPicker
          onSelect={(url) => { setCoverUrl(url); setShowPicker(false); setFieldErrors((p) => ({ ...p, cover: '' })); }}
          onClose={() => setShowPicker(false)}
        />
      )}

      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/blog')} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold flex-1">{isEdit ? 'Редактировать пост' : 'Новый пост'}</h1>
        <div className="flex gap-2">
          {isEdit && postStatus === 'published' ? (
            <Button variant="outline" size="sm" onClick={handleUnpublish} disabled={loading}>
              {loading ? '...' : 'Снять с публикации'}
            </Button>
          ) : (
            <Button size="sm" onClick={handlePublish} disabled={loading}>
              <Globe size={15} className="mr-1.5" />
              {loading ? '...' : 'Опубликовать'}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основной контент */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">
              Заголовок <span className="text-destructive">*</span>
            </label>
            <input
              value={form.title}
              onChange={(e) => { set('title')(e); setFieldErrors((p) => ({ ...p, title: '' })); }}
              placeholder="Заголовок поста..."
              className={`w-full px-4 py-2.5 rounded-lg border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${fieldErrors.title ? 'border-destructive' : 'border-border'}`}
            />
            {fieldErrors.title && <span className="text-xs text-destructive">{fieldErrors.title}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">
              Контент <span className="text-destructive">*</span>
            </label>
            <textarea
              value={form.content}
              onChange={(e) => { set('content')(e); setFieldErrors((p) => ({ ...p, content: '' })); }}
              placeholder="Текст поста..."
              rows={20}
              className={`w-full px-4 py-3 rounded-lg border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y font-mono text-sm ${fieldErrors.content ? 'border-destructive' : 'border-border'}`}
            />
            {fieldErrors.content && <span className="text-xs text-destructive">{fieldErrors.content}</span>}
          </div>
        </div>

        {/* Боковая панель */}
        <div className="flex flex-col gap-4">

          {/* Обложка */}
          <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-3">
            <p className="text-sm font-semibold">
              Обложка <span className="text-destructive">*</span>
            </p>
            {coverUrl ? (
              <div className="relative group rounded-lg overflow-hidden aspect-video">
                <img src={coverUrl} alt="cover" className="w-full h-full object-cover" />
                <button
                  onClick={() => setCoverUrl('')}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPicker(true)}
                className={`flex flex-col items-center justify-center gap-2 w-full aspect-video rounded-lg border-2 border-dashed transition-colors hover:border-primary ${fieldErrors.cover ? 'border-destructive' : 'border-border'}`}
              >
                <ImagePlus size={24} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Выбрать из медиатеки</span>
              </button>
            )}
            {fieldErrors.cover && <span className="text-xs text-destructive">{fieldErrors.cover}</span>}
            {coverUrl && (
              <Button variant="outline" size="sm" onClick={() => setShowPicker(true)}>
                Заменить
              </Button>
            )}
          </div>

          {/* Теги */}
          <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-3">
            <p className="text-sm font-semibold">Теги</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                  #{t}
                  <button type="button" onClick={() => setTags((prev) => prev.filter((x) => x !== t))} className="ml-0.5 text-primary/60 hover:text-primary leading-none">×</button>
                </span>
              ))}
            </div>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={() => tagInput.trim() && addTag(tagInput)}
              placeholder="Тег + Enter или запятая"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>

          {/* Краткое описание */}
          <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-3">
            <p className="text-sm font-semibold">Краткое описание</p>
            <textarea
              value={form.excerpt}
              onChange={set('excerpt')}
              placeholder="Короткое описание для превью..."
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none text-sm"
            />
          </div>

          {/* SEO */}
          <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-4">
            <p className="text-sm font-semibold">SEO</p>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">SEO заголовок</label>
              <input
                value={form.seo_title}
                onChange={set('seo_title')}
                placeholder="Title для поисковиков..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">Meta description</label>
              <textarea
                value={form.seo_description}
                onChange={set('seo_description')}
                placeholder="Описание для поисковиков (до 160 символов)..."
                rows={3}
                maxLength={160}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none text-sm"
              />
              <span className="text-xs text-muted-foreground text-right">{form.seo_description.length}/160</span>
            </div>
          </div>

          {/* Статус */}
          {isEdit && (
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm font-semibold mb-2">Статус</p>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                ${postStatus === 'published' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                <Globe size={11} />
                {postStatus === 'published' ? 'Опубликован' : 'Черновик'}
              </span>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBlogEditor;
