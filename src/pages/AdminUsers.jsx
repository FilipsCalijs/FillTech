import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout';
import { API_URL } from '@/config/api';
import { Pencil, Trash2, X, Check } from 'lucide-react';

const API = `${API_URL}/api/admin/users`;
const headers = () => ({ 'x-user-uid': localStorage.getItem('userUID') });

function fmt(n) {
  return `$${parseFloat(n ?? 0).toFixed(2)}`;
}

function fmtDate(s) {
  if (!s) return '-';
  return new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ── Edit modal ── */
function EditModal({ user, onClose, onSave }) {
  const [role,    setRole]    = useState(user.role);
  const [balance, setBalance] = useState(String(parseFloat(user.balance ?? 0)));
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState('');

  async function handleSave() {
    setSaving(true);
    setErr('');
    try {
      const { data } = await axios.patch(`${API}/${user.uid}`,
        { role, balance: parseFloat(balance) },
        { headers: headers() }
      );
      onSave(data);
    } catch (e) {
      setErr(e.response?.data?.error || 'Error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-foreground">Edit user</p>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="text-xs text-muted-foreground truncate">{user.email}</div>

        {/* Role */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Role</label>
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>

        {/* Balance */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Balance ($)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={balance}
            onChange={e => setBalance(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {err && <p className="text-xs text-red-500">{err}</p>}

        <div className="flex gap-2 mt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-60 transition-opacity flex items-center justify-center gap-1.5"
          >
            <Check size={14} />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Delete confirm ── */
function DeleteConfirm({ user, onClose, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState('');

  async function handleDelete() {
    setDeleting(true);
    try {
      await axios.delete(`${API}/${user.uid}`, { headers: headers() });
      onDelete(user.uid);
    } catch (e) {
      setErr(e.response?.data?.error || 'Error');
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-foreground">Delete user</p>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete <span className="font-medium text-foreground">{user.email}</span>?
          This action cannot be undone.
        </p>
        {err && <p className="text-xs text-red-500">{err}</p>}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main ── */
const AdminUsers = () => {
  const [users,   setUsers]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [editing, setEditing] = useState(null);  // user object
  const [deleting,setDeleting]= useState(null);  // user object

  const myUid = localStorage.getItem('userUID');

  const load = useCallback((p = page) => {
    setLoading(true);
    axios.get(`${API}?page=${p}&limit=20`, { headers: headers() })
      .then(({ data }) => {
        setUsers(data.rows);
        setTotal(data.total);
        setPage(data.page);
        setPages(data.pages);
      })
      .catch(e => setError(e.response?.data?.error || 'Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(1); }, [load]);

  function handleSaved(updated) {
    setUsers(prev => prev.map(u => u.uid === updated.uid ? { ...u, ...updated } : u));
    setEditing(null);
  }

  function handleDeleted(uid) {
    setUsers(prev => prev.filter(u => u.uid !== uid));
    setDeleting(null);
    setTotal(t => t - 1);
  }

  function goPage(p) {
    if (p < 1 || p > pages) return;
    load(p);
  }

  return (
    <AdminLayout>
      {editing  && <EditModal    user={editing}  onClose={() => setEditing(null)}  onSave={handleSaved}      />}
      {deleting && <DeleteConfirm user={deleting} onClose={() => setDeleting(null)} onDelete={handleDeleted}  />}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <span className="text-sm text-muted-foreground">{total} total</span>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      <div className="rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground text-xs uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3 text-left">User</th>
              <th className="px-5 py-3 text-left">Role</th>
              <th className="px-5 py-3 text-right">Balance</th>
              <th className="px-5 py-3 text-left">Joined</th>
              <th className="px-5 py-3 text-left">Last login</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">Loading...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">No users found</td>
              </tr>
            ) : users.map(u => (
              <tr key={u.uid} className="hover:bg-muted/40 transition-colors">
                {/* User */}
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {u.photo_url ? (
                      <img src={u.photo_url} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" onError={e => e.target.style.display='none'} />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                        {(u.email || u.display_name || '?')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate max-w-[200px]">{u.email || '-'}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">{u.display_name || ''}</p>
                    </div>
                  </div>
                </td>

                {/* Role */}
                <td className="px-5 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                    u.role === 'admin'
                      ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {u.role}
                  </span>
                </td>

                {/* Balance */}
                <td className="px-5 py-3 text-right font-mono text-foreground">{fmt(u.balance)}</td>

                {/* Dates */}
                <td className="px-5 py-3 text-muted-foreground text-xs">{fmtDate(u.created_at)}</td>
                <td className="px-5 py-3 text-muted-foreground text-xs">{fmtDate(u.last_login_at)}</td>

                {/* Actions */}
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setEditing(u)}
                      title="Edit"
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleting(u)}
                      disabled={u.uid === myUid}
                      title={u.uid === myUid ? "Can't delete yourself" : "Delete"}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20">
            <span className="text-xs text-muted-foreground">
              Page {page} of {pages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => goPage(page - 1)}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button
                onClick={() => goPage(page + 1)}
                disabled={page === pages}
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
