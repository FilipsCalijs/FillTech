import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/authContext';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';

const API = 'http://localhost:5200';

const Avatar = ({ src, name }) => {
  if (src) return <img src={src} alt={name} className="w-9 h-9 rounded-full object-cover shrink-0" />;
  return (
    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
      <span className="text-sm font-semibold text-muted-foreground">
        {name?.[0]?.toUpperCase() || '?'}
      </span>
    </div>
  );
};

const CommentItem = ({ comment, currentUid, isAdmin, onEdit, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(comment.content);
  const canModify = isAdmin || comment.user_uid === currentUid;

  const handleSave = () => {
    if (draft.trim() && draft !== comment.content) onEdit(comment.id, draft.trim());
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(comment.content);
    setEditing(false);
  };

  return (
    <div className="flex gap-3">
      <Avatar src={comment.photo_url} name={comment.display_name} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Typography variant="label" weight="semibold" className="block">
            {comment.display_name}
          </Typography>
          <Typography variant="caption" color="muted" className="block">
            {formatDate(comment.created_at)}
            {comment.updated_at !== comment.created_at && ' (изменён)'}
          </Typography>
        </div>

        {editing ? (
          <div className="flex flex-col gap-2">
            <textarea
              className="w-full rounded-lg border border-border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              rows={3}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={!draft.trim()}>
                <Check size={14} className="mr-1" /> Сохранить
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancel}>
                <X size={14} className="mr-1" /> Отмена
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-2">
            <Typography variant="body2" className="block whitespace-pre-wrap break-words">
              {comment.content}
            </Typography>
            {canModify && (
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => setEditing(true)}
                  className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => onDelete(comment.id)}
                  className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Comments = ({ postId }) => {
  const { userLoggedIn, currentUser } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [text, setText]         = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAdmin   = localStorage.getItem('userRole') === 'admin';
  const currentUid = currentUser?.uid;

  const headers = () => ({
    'x-user-uid':    currentUid,
    'x-user-name':   currentUser?.displayName || 'User',
    'x-user-avatar': currentUser?.photoURL || '',
  });

  useEffect(() => {
    axios.get(`${API}/api/comments`, { params: { postId } })
      .then(({ data }) => setComments(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [postId]);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await axios.post(`${API}/api/comments`,
        { postId, content: text.trim() },
        { headers: headers() }
      );
      setComments(prev => [...prev, data]);
      setText('');
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (id, content) => {
    try {
      const { data } = await axios.put(`${API}/api/comments/${id}`,
        { content },
        { headers: headers() }
      );
      setComments(prev => prev.map(c => c.id === id ? data : c));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить комментарий?')) return;
    try {
      await axios.delete(`${API}/api/comments/${id}`, { headers: headers() });
      setComments(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <Typography variant="h2" weight="semibold" className="block mb-6">
        Комментарии {comments.length > 0 && `(${comments.length})`}
      </Typography>

      {/* Список комментариев */}
      {loading ? (
        <Typography variant="body2" color="muted" className="block">Загрузка...</Typography>
      ) : comments.length === 0 ? (
        <Typography variant="body2" color="muted" className="block mb-6">
          Пока нет комментариев. Будьте первым!
        </Typography>
      ) : (
        <div className="flex flex-col gap-5 mb-8">
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUid={currentUid}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Форма добавления */}
      {userLoggedIn ? (
        <div className="flex gap-3">
          <Avatar src={currentUser?.photoURL} name={currentUser?.displayName} />
          <div className="flex-1 flex flex-col gap-2">
            <textarea
              className="w-full rounded-lg border border-border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              rows={3}
              placeholder="Написать комментарий..."
              value={text}
              onChange={e => setText(e.target.value)}
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={submitting || !text.trim()}
                isLoading={submitting}
              >
                Отправить
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border p-4 text-center">
          <Typography variant="body2" color="muted" className="block mb-2">
            Чтобы оставить комментарий, нужно войти
          </Typography>
          <Link to="/login">
            <Button size="sm" variant="outline">Войти</Button>
          </Link>
        </div>
      )}
    </section>
  );
};

export default Comments;
