import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Typography } from '@/components/ui/Typography';
import { CONTAINER } from '@/config/sizes';

const API = 'http://localhost:5200';

const TOOL_MAP = {
  'portrait':         { name: 'AI Portrait',       path: '/tools/portrait' },
  'watermark-remove': { name: 'Watermark Remover', path: '/tools/watermark-remover' },
  'bg-remove':        { name: 'BG Remover',         path: '/tools/bg-remover' },
  'upscaler':         { name: 'Upscaler',           path: '/tools/upscaler' },
  'ps2-filter':       { name: 'Game Filter',         path: '/testing' },
};

const STATUS_STYLES = {
  completed:  'text-green-600 dark:text-green-400',
  failed:     'text-red-500',
  pending:    'text-yellow-500',
  processing: 'text-blue-500',
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/* ── Image modal ──────────────────────────────────────────── */
const ImageModal = ({ gen, onClose }) => {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(gen.output_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative flex flex-col items-center gap-5 max-w-3xl w-full" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>

        <img src={gen.output_url} alt="Generation" className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-2xl" />

        <div className="flex items-center gap-3">
          {[
            { title: 'Copy URL', action: copy, icon: copied
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> },
          ].map(({ title, action, icon }) => (
            <button key={title} onClick={action} title={title} className="w-11 h-11 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-all">
              {icon}
            </button>
          ))}
          <a href={gen.output_url} target="_blank" rel="noreferrer" title="Open in new tab" className="w-11 h-11 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
          <a href={gen.output_url} download title="Download" className="w-11 h-11 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </a>
        </div>
      </div>
    </div>
  );
};

/* ── Table ────────────────────────────────────────────────── */
const GenerationsTable = ({ items, onDelete, adminMode }) => {
  const [selected, setSelected] = useState(new Set());
  const [sortBy,   setSortBy]   = useState('date');
  const [search,   setSearch]   = useState('');
  const [modal,    setModal]    = useState(null);

  const filtered = items
    .filter(i => search ? i.id.toLowerCase().includes(search.toLowerCase()) : true)
    .sort((a, b) => sortBy === 'date'
      ? new Date(b.created_at) - new Date(a.created_at)
      : (TOOL_MAP[a.tool_type]?.name ?? a.tool_type).localeCompare(TOOL_MAP[b.tool_type]?.name ?? b.tool_type)
    );

  const allChecked = filtered.length > 0 && filtered.every(i => selected.has(i.id));
  const toggleAll  = (v) => setSelected(v ? new Set(filtered.map(i => i.id)) : new Set());
  const toggleOne  = (id) => setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const handleDelete = async (id) => {
    await onDelete(id, adminMode);
    setSelected(prev => { const s = new Set(prev); s.delete(id); return s; });
  };

  const deleteSelected = () => Promise.all([...selected].map(id => handleDelete(id)));

  return (
    <>
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-sm border border-border rounded-lg px-3 py-1.5 bg-card text-foreground focus:outline-none">
            <option value="date">Sort by date</option>
            <option value="model">Sort by model</option>
          </select>
          <input type="text" placeholder="Search by ID…" value={search} onChange={e => setSearch(e.target.value)} className="text-sm border border-border rounded-lg px-3 py-1.5 bg-card text-foreground placeholder:text-muted-foreground focus:outline-none w-52" />
        </div>
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-4 mb-4 px-4 py-3 rounded-xl border border-border bg-muted">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex gap-2 ml-auto">
            <button onClick={() => [...selected].forEach(id => { const i = items.find(x => x.id === id); if (i?.output_url) window.open(i.output_url, '_blank'); })} className="text-sm px-3 py-1.5 rounded-lg border border-border bg-card text-foreground hover:border-foreground/40 transition-all flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download
            </button>
            <button onClick={deleteSelected} className="text-sm px-3 py-1.5 rounded-lg border border-destructive text-destructive hover:bg-destructive/10 transition-all flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm">No generations found.</p>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground text-xs uppercase tracking-wide">
              <tr>
                <th className="w-10 px-4 py-3"><input type="checkbox" checked={allChecked} onChange={e => toggleAll(e.target.checked)} className="accent-primary cursor-pointer" /></th>
                <th className="px-4 py-3 text-left">Output</th>
                {adminMode && <th className="px-4 py-3 text-left">User</th>}
                <th className="px-4 py-3 text-left">Model</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(gen => {
                const tool = TOOL_MAP[gen.tool_type] ?? { name: gen.tool_type, path: '/explore' };
                return (
                  <tr key={gen.id} className={`hover:bg-muted/50 transition-colors ${selected.has(gen.id) ? 'bg-primary/5' : 'bg-card'}`}>
                    <td className="px-4 py-3"><input type="checkbox" checked={selected.has(gen.id)} onChange={() => toggleOne(gen.id)} className="accent-primary cursor-pointer" /></td>

                    <td className="px-4 py-3">
                      {gen.output_url ? (
                        <button onClick={() => setModal(gen)} className="w-[50px] h-[80px] rounded-lg border border-border overflow-hidden bg-muted flex items-center justify-center hover:opacity-80 transition-opacity">
                          <img src={gen.output_url} alt="output" className="w-full h-full object-contain" />
                        </button>
                      ) : (
                        <div className="w-[50px] h-[80px] rounded-lg border border-dashed border-border bg-muted flex items-center justify-center text-muted-foreground text-xs">—</div>
                      )}
                    </td>

                    {adminMode && (
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[120px] truncate" title={gen.user_email || gen.user_uid}>
                        {gen.user_email || gen.user_uid?.slice(0, 8) + '…'}
                      </td>
                    )}

                    <td className="px-4 py-3">
                      <Link to={tool.path} className="text-foreground font-medium hover:underline flex items-center gap-1">
                        {tool.name}
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </Link>
                    </td>

                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1.5 ${STATUS_STYLES[gen.status] ?? 'text-muted-foreground'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {gen.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-muted-foreground">{timeAgo(gen.created_at)}</td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {gen.output_url && (
                          <>
                            <a href={gen.output_url} target="_blank" rel="noreferrer" title="Open in new tab" className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-all">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                            </a>
                            <a href={gen.output_url} download title="Download" className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-all">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            </a>
                          </>
                        )}
                        <button onClick={() => handleDelete(gen.id)} title="Delete" className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive transition-all">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal && <ImageModal gen={modal} onClose={() => setModal(null)} />}
    </>
  );
};

/* ── Page ─────────────────────────────────────────────────── */
const History = () => {
  const [tab,         setTab]         = useState('mine');
  const [myItems,     setMyItems]     = useState([]);
  const [allItems,    setAllItems]    = useState([]);
  const [loading,     setLoading]     = useState(true);

  const userUid  = localStorage.getItem('userUID');
  const isAdmin  = localStorage.getItem('userRole') === 'admin';

  const fetchMine = useCallback(async () => {
    if (!userUid) return;
    const res  = await fetch(`${API}/api/generations`, { headers: { 'x-user-uid': userUid } });
    const data = await res.json();
    setMyItems(Array.isArray(data) ? data : []);
  }, [userUid]);

  const fetchAll = useCallback(async () => {
    if (!isAdmin) return;
    const res  = await fetch(`${API}/api/generations/admin`, { headers: { 'x-user-uid': userUid } });
    const data = await res.json();
    setAllItems(Array.isArray(data) ? data : []);
  }, [isAdmin, userUid]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchMine(), isAdmin ? fetchAll() : Promise.resolve()])
      .finally(() => setLoading(false));
  }, [fetchMine, fetchAll, isAdmin]);

  const handleDelete = async (id, adminMode) => {
    const endpoint = adminMode
      ? `${API}/api/generations/admin/${id}`
      : `${API}/api/generations/${id}`;
    await fetch(endpoint, { method: 'DELETE', headers: { 'x-user-uid': userUid } });
    if (adminMode) setAllItems(prev => prev.filter(i => i.id !== id));
    else           setMyItems(prev  => prev.filter(i => i.id !== id));
  };

  return (
    <div className={`py-10 ${CONTAINER.blog}`}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Typography variant="h2" weight="bold">History</Typography>

        {isAdmin && (
          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={() => setTab('mine')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${tab === 'mine' ? 'bg-primary text-primary-foreground' : 'border border-border text-foreground hover:border-foreground/40'}`}
            >
              My History
            </button>
            <button
              onClick={() => setTab('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${tab === 'all' ? 'bg-destructive text-white' : 'border border-destructive text-destructive hover:bg-destructive/10'}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              Total
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : (
        <GenerationsTable
          items={tab === 'all' ? allItems : myItems}
          onDelete={handleDelete}
          adminMode={tab === 'all'}
        />
      )}
    </div>
  );
};

export default History;
