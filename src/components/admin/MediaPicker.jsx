import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Upload, Link, Image, X, ChevronLeft, ChevronRight, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const API = 'http://localhost:5200/api/media';

export default function MediaPicker({ onSelect, onClose }) {
  const [tab, setTab] = useState('library'); // library | upload | url
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const headers = { 'x-user-uid': localStorage.getItem('userUID') };

  const fetchLibrary = async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}?page=${p}`, { headers });
      setItems(data.items);
      setPages(data.pages);
      setPage(p);
    } catch {
      setError('Не удалось загрузить медиатеку');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLibrary(1); }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      await axios.post(`${API}/upload`, form, { headers: { ...headers, 'Content-Type': 'multipart/form-data' } });
      setTab('library');
      fetchLibrary(1);
    } catch {
      setError('Ошибка загрузки файла');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlUpload = async () => {
    if (!urlInput.trim()) return;
    setUploading(true);
    setError('');
    try {
      await axios.post(`${API}/from-url`, { url: urlInput.trim() }, { headers });
      setUrlInput('');
      setTab('library');
      fetchLibrary(1);
    } catch {
      setError('Не удалось загрузить по URL');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Удалить изображение?')) return;
    try {
      await axios.delete(`${API}/${id}`, { headers });
      if (selected?.id === id) setSelected(null);
      fetchLibrary(page);
    } catch {
      setError('Ошибка удаления');
    }
  };

  const handleConfirm = () => {
    if (selected) onSelect(selected.url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-background border border-border rounded-xl shadow-xl w-full max-w-4xl mx-4 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">Медиатека</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4">
          {[
            { key: 'library', label: 'Библиотека', icon: Image },
            { key: 'upload', label: 'Загрузить файл', icon: Upload },
            { key: 'url', label: 'Вставить URL', icon: Link },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${tab === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
            >
              <Icon size={14} />{label}
            </button>
          ))}
        </div>

        {error && <p className="mx-6 mt-3 text-xs text-destructive">{error}</p>}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">

          {/* Library tab */}
          {tab === 'library' && (
            <>
              {loading ? (
                <p className="text-muted-foreground text-center py-12">Загрузка...</p>
              ) : items.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">Нет загруженных изображений</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelected(selected?.id === item.id ? null : item)}
                      className={`relative group aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all
                        ${selected?.id === item.id ? 'border-primary' : 'border-transparent hover:border-border'}`}
                    >
                      <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
                      {selected?.id === item.id && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <Check size={20} className="text-primary" />
                        </div>
                      )}
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="absolute top-1 right-1 p-1 rounded bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-4">
                  <button onClick={() => fetchLibrary(page - 1)} disabled={page <= 1} className="p-1.5 rounded hover:bg-muted disabled:opacity-40">
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm text-muted-foreground">{page} / {pages}</span>
                  <button onClick={() => fetchLibrary(page + 1)} disabled={page >= pages} className="p-1.5 rounded hover:bg-muted disabled:opacity-40">
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}

          {/* Upload tab */}
          {tab === 'upload' && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl w-full max-w-sm py-12 flex flex-col items-center gap-3 cursor-pointer hover:border-primary transition-colors"
              >
                <Upload size={32} className="text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Нажми чтобы выбрать файл</p>
                <p className="text-xs text-muted-foreground">JPG, PNG, WebP — до 10 МБ</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              {uploading && <p className="text-sm text-muted-foreground">Загружаю...</p>}
            </div>
          )}

          {/* URL tab */}
          {tab === 'url' && (
            <div className="flex flex-col gap-4 py-8 max-w-lg mx-auto">
              <p className="text-sm text-muted-foreground">Вставь URL изображения — оно будет скачано и сохранено в R2.</p>
              <input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button onClick={handleUrlUpload} disabled={uploading || !urlInput.trim()}>
                {uploading ? 'Загружаю...' : 'Сохранить в библиотеку'}
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            {selected ? `Выбрано: ${selected.filename}` : 'Ничего не выбрано'}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Отмена</Button>
            <Button onClick={handleConfirm} disabled={!selected}>Выбрать</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
