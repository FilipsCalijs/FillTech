import { useState, useEffect } from 'react';
import { Typography } from '@/components/ui/Typography';
import { CONTAINER } from '@/config/sizes';

const API = 'http://localhost:5200';

const TOPUP_AMOUNTS = [5, 10, 25, 50, 100];

const TOOL_NAMES = {
  'portrait':               'AI Portrait',
  'ps2-filter':             'Game Filter',
  'watermark-remove':       'Watermark Remover',
  'video-watermark-remove': 'Video Watermark Remover',
  'bg-remove':              'BG Remover',
  'photo-colorize':         'Photo Colorizer',
  'voice-clone':            'Voice Cloning',
  'clothes-swap':           'Clothes Swap',
};

function fmt(n) {
  return `$${parseFloat(n ?? 0).toFixed(2)}`;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/* ── Blocks ─────────────────────────────── */
const Block = ({ children, className = '' }) => (
  <div className={`rounded-2xl border border-border bg-card p-6 flex flex-col gap-4 ${className}`}>
    {children}
  </div>
);

const Label = ({ children }) => (
  <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-muted-foreground">{children}</span>
);

/* ── Page ───────────────────────────────── */
const Billing = () => {
  const [balance,    setBalance]    = useState(null);
  const [spentMonth, setSpentMonth] = useState(null);
  const [tab,        setTab]        = useState('history');
  const [history,    setHistory]    = useState([]);
  const [histPage,   setHistPage]   = useState(1);
  const [histPages,  setHistPages]  = useState(1);
  const [loading,    setLoading]    = useState(true);

  const userUid = localStorage.getItem('userUID') || '';

  useEffect(() => {
    if (!userUid) return;
    fetch(`${API}/api/billing`, { headers: { 'x-user-uid': userUid } })
      .then(r => r.json())
      .then(d => { setBalance(d.balance); setSpentMonth(d.spent_month); })
      .finally(() => setLoading(false));
  }, [userUid]);

  useEffect(() => {
    if (!userUid || tab !== 'history') return;
    fetch(`${API}/api/billing/history?page=${histPage}`, { headers: { 'x-user-uid': userUid } })
      .then(r => r.json())
      .then(d => { setHistory(d.rows ?? []); setHistPages(d.pages ?? 1); });
  }, [userUid, tab, histPage]);

  return (
    <div className={`py-10 ${CONTAINER.blog}`}>
      <Typography variant="h2" weight="bold" className="block mb-8">Billing</Typography>

      {/* 4 blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">

        {/* TL — Balance */}
        <Block>
          <Label>Balance</Label>
          <p className="text-4xl font-bold text-foreground">
            {loading ? '—' : fmt(balance)}
          </p>
          <p className="text-xs text-muted-foreground">Available to spend on AI generations</p>
        </Block>

        {/* TR — Spent this month */}
        <Block>
          <Label>Spent this month</Label>
          <p className="text-4xl font-bold text-foreground">
            {loading ? '—' : fmt(spentMonth)}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleString('en', { month: 'long', year: 'numeric' })}
          </p>
        </Block>

        {/* BL — Top up */}
        <Block>
          <Label>Add funds</Label>
          <div className="flex flex-wrap gap-2">
            {TOPUP_AMOUNTS.map(amount => (
              <button
                key={amount}
                disabled
                className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:border-foreground/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ${amount}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Payment methods coming soon</p>
        </Block>

        {/* BR — Auto top-up */}
        <Block>
          <Label>Auto top-up</Label>
          <div className="flex items-center gap-3">
            <div className="w-10 h-6 rounded-full bg-muted border border-border flex items-center px-0.5 cursor-not-allowed opacity-50">
              <div className="w-5 h-5 rounded-full bg-muted-foreground/50" />
            </div>
            <span className="text-sm text-muted-foreground">Disabled</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Automatically top up when balance falls below a threshold — coming soon
          </p>
        </Block>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[
          { id: 'history',     label: 'Billing History' },
          { id: 'auto',        label: 'Auto-billing' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all
              ${tab === t.id ? 'bg-primary text-primary-foreground' : 'border border-border text-foreground hover:border-foreground/40'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'history' && (
        <div className="rounded-2xl border border-border overflow-hidden">
          {history.length === 0 ? (
            <div className="px-6 py-10 text-center text-muted-foreground text-sm">
              No billing history yet. Costs will appear here once tools have non-zero prices.
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead className="bg-muted text-muted-foreground text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-5 py-3 text-left">Tool</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Date</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {history.map(row => (
                    <tr key={row.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-5 py-3 font-medium text-foreground">
                        {TOOL_NAMES[row.tool_type] ?? row.tool_type}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground capitalize">{row.status}</td>
                      <td className="px-5 py-3 text-muted-foreground">{timeAgo(row.created_at)}</td>
                      <td className="px-5 py-3 text-right font-mono text-foreground">{fmt(row.cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {histPages > 1 && (
                <div className="flex items-center justify-center gap-3 py-4 border-t border-border">
                  <button onClick={() => setHistPage(p => Math.max(1, p - 1))} disabled={histPage === 1}
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <span className="text-sm text-muted-foreground">{histPage} / {histPages}</span>
                  <button onClick={() => setHistPage(p => Math.min(histPages, p + 1))} disabled={histPage === histPages}
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === 'auto' && (
        <div className="rounded-2xl border border-border bg-card p-8 text-center flex flex-col items-center gap-3">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
          <p className="text-sm font-medium text-foreground">Auto-billing coming soon</p>
          <p className="text-xs text-muted-foreground max-w-sm">
            Set a minimum balance threshold and a top-up amount. We'll automatically charge your payment method to keep your balance above the threshold.
          </p>
        </div>
      )}
    </div>
  );
};

export default Billing;
