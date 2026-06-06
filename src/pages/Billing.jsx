import { useState, useEffect, useCallback } from 'react';
import { Typography } from '@/components/ui/Typography';
import { useTranslation } from 'react-i18next';
import { CONTAINER } from '@/config/sizes';
import PageSEO from '@/components/seo/PageSEO';
import { useLang } from '@/contexts/LangContext';

const API = 'http://localhost:5200';

const AMOUNTS = [5, 10, 50, 100, 1000, 5000];
const AMOUNT_LABELS = {
  5: '$5', 10: '$10', 50: '$50', 100: '$100', 1000: '$1,000', 5000: '$5,000',
};

const TOOL_NAMES = {
  'portrait':               'AI Portrait',
  'ps2-filter':             'Game Filter',
  'watermark-remove':       'Watermark Remover',
  'video-watermark-remove': 'Video Watermark Remover',
  'bg-remove':              'BG Remover',
  'photo-colorize':         'Photo Colorizer',
  'voice-clone':            'Voice Cloning',
  'clothes-swap':           'Clothes Swap',
  'video-bg-replace':       'Video BG Replace',
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

const Block = ({ children, className = '' }) => (
  <div className={`rounded-2xl border border-border bg-card p-6 flex flex-col gap-4 ${className}`}>
    {children}
  </div>
);

const BlockLabel = ({ children }) => (
  <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-muted-foreground">
    {children}
  </span>
);

/* ─── Top-up block ────────────────────────────────────────────────────── */
function TopUpBlock({ lang }) {
  const { t } = useTranslation('billing');
  const [selected, setSelected] = useState(10);
  const [isCustom, setIsCustom] = useState(false);
  const [custom,   setCustom]   = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const uid = localStorage.getItem('userUID') || '';

  const amount = isCustom
    ? (parseFloat(custom) >= 5 ? parseFloat(custom) : null)
    : selected;

  async function handleCheckout(amt = amount) {
    if (!amt) return;
    setLoading(true);
    setError('');
    try {
      const res  = await fetch(`${API}/api/billing/create-checkout-session`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-uid': uid },
        body:    JSON.stringify({ amount: amt, lang }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      window.location.href = data.url;
    } catch {
      setError(t('errors.wentWrong', { ns: 'common' }));
    } finally {
      setLoading(false);
    }
  }

  function pickAmount(amt) {
    setSelected(amt);
    setIsCustom(false);
  }

  return (
    <Block>
      <BlockLabel>{t('addFundsLabel')}</BlockLabel>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Amount radio list */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-3">{t('selectAmount')}</p>
          <div className="flex flex-col gap-0.5">
            {AMOUNTS.map(amt => {
              const sel = !isCustom && selected === amt;
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => pickAmount(amt)}
                  className="flex items-center gap-3 py-2 group text-left"
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                    ${sel ? 'border-primary' : 'border-muted-foreground/30 group-hover:border-primary/50'}`}>
                    {sel && <div className="w-2 h-2 rounded-full bg-primary"/>}
                  </div>
                  <span className={`text-sm font-medium transition-colors
                    ${sel ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
                    {AMOUNT_LABELS[amt]}
                  </span>
                </button>
              );
            })}

            {/* Custom amount */}
            <div className="flex items-center gap-3 py-2">
              <button
                type="button"
                onClick={() => setIsCustom(true)}
                className="flex items-center gap-3"
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                  ${isCustom ? 'border-primary' : 'border-muted-foreground/30 hover:border-primary/50'}`}>
                  {isCustom && <div className="w-2 h-2 rounded-full bg-primary"/>}
                </div>
                <span className={`text-sm font-medium ${isCustom ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {t('custom')}
                </span>
              </button>
              {isCustom && (
                <input
                  autoFocus
                  type="number"
                  min="5"
                  placeholder={t('customMin')}
                  value={custom}
                  onChange={e => setCustom(e.target.value)}
                  className="w-28 px-3 py-1 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
              )}
            </div>
          </div>
        </div>

        {/* Limits + security */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-muted-foreground">{t('limits')}</p>
          <div className="rounded-xl border border-border bg-background/40 p-4 flex flex-col gap-2.5">
            {[
              [t('minPerTx'), '$5.00'],
              [t('maxPerTx'), '$5,000.00'],
              [t('currency'), 'USD'],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium text-foreground">{val}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border bg-background/40 p-4 flex items-start gap-2.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="text-muted-foreground mt-0.5 flex-shrink-0">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <p className="text-xs text-muted-foreground leading-relaxed">{t('stripeNote')}</p>
          </div>
        </div>
      </div>

      {/* Payment method */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-3">{t('paymentMethod')}</p>
        <div className="rounded-xl border border-border bg-background/40 p-4 flex items-center gap-3 max-w-md">
          <div className="w-9 h-9 rounded-lg bg-[#635BFF] flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 50 20" width="28" height="11" aria-hidden="true">
              <path fill="#fff" d="M49.7 10.8c0-3.6-1.7-6.4-5-6.4-3.3 0-5.3 2.8-5.3 6.4 0 4.2 2.4 6.3 5.8 6.3 1.7 0 3-.4 3.9-.9v-2.8c-.9.5-2 .8-3.3.8-1.3 0-2.5-.5-2.6-2.1h6.5c0-.2 0-.8 0-1.3zm-6.6-1.3c0-1.6.9-2.2 1.8-2.2.8 0 1.7.6 1.7 2.2h-3.5zM30.8 4.4c-1.3 0-2.2.6-2.6 1l-.2-.8H25v16.6l3.3-.7V17c.5.3 1.2.8 2.5.8 2.5 0 4.8-2 4.8-6.4-.1-4-2.4-6-4.8-6zm-.8 9.2c-.8 0-1.3-.3-1.7-.7V8c.4-.4.9-.6 1.7-.6 1.3 0 2.2 1.5 2.2 3.1 0 1.7-.8 3.1-2.2 3.1zM22.8 3.2l3.3-.7V0l-3.3.7zM22.8 4.6h3.3v12.2h-3.3zM19.1 5.6l-.2-1h-2.8v12.2h3.3v-8.3c.8-1 2.1-.8 2.5-.7V4.6c-.4-.1-1.9-.4-2.8 1zM11.8 1.6l-3.2.7-.1 10.9c0 2 1.5 3.5 3.5 3.5 1.1 0 1.9-.2 2.4-.5v-2.7c-.4.2-2.5.8-2.5-1.2V7.4h2.5V4.6h-2.5l-.1-3zM3.4 7.8c0-.5.4-.7 1.1-.7 1 0 2.2.3 3.2.8V4.9C6.7 4.6 5.7 4.4 4.5 4.4 1.8 4.4 0 5.8 0 8c0 3.4 4.7 2.9 4.7 4.3 0 .6-.5.8-1.2.8-1.1 0-2.4-.4-3.5-1.1v3c1.2.5 2.4.7 3.5.7 2.7 0 4.6-1.3 4.6-3.6C8.1 8.5 3.4 9.1 3.4 7.8z"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{t('stripeCheckout')}</p>
            <p className="text-xs text-muted-foreground">{t('stripeDesc')}</p>
          </div>
        </div>

        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

        <button
          onClick={() => handleCheckout()}
          disabled={!amount || loading}
          className="mt-4 w-full max-w-md h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {loading ? t('redirecting') : `${t('payWith')} ${amount ? fmt(amount) : ''}`}
        </button>

        {import.meta.env.DEV && (
          <button
            onClick={() => handleCheckout(5)}
            disabled={loading}
            className="mt-2 w-full max-w-md h-9 rounded-xl border border-dashed border-border text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 disabled:opacity-40 transition-all"
          >
            DEV · Test Stripe $5 - use card 4242 4242 4242 4242
          </button>
        )}
      </div>
    </Block>
  );
}

/* ─── Billing page ────────────────────────────────────────────────────── */
const Billing = () => {
  const { t }      = useTranslation('billing');
  const { t: tc }  = useTranslation('common');
  const lang       = useLang();
  const [balance,    setBalance]    = useState(null);
  const [spentMonth, setSpentMonth] = useState(null);
  const [tab,        setTab]        = useState('history');
  const [history,    setHistory]    = useState([]);
  const [histPage,   setHistPage]   = useState(1);
  const [histPages,  setHistPages]  = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [toast,      setToast]      = useState(null); // 'success' | 'cancel' | null
  const uid = localStorage.getItem('userUID') || '';

  const fetchBalance = useCallback(() => {
    if (!uid) return;
    fetch(`${API}/api/billing`, { headers: { 'x-user-uid': uid } })
      .then(r => r.json())
      .then(d => { setBalance(d.balance); setSpentMonth(d.spent_month); })
      .finally(() => setLoading(false));
  }, [uid]);

  // Check ?success / ?cancel on return from Stripe Checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      setToast('success');
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(fetchBalance, 2000);
    } else if (params.get('cancel') === 'true') {
      setToast('cancel');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [fetchBalance]);

  useEffect(fetchBalance, [fetchBalance]);

  useEffect(() => {
    if (!uid || tab !== 'history') return;
    fetch(`${API}/api/billing/history?page=${histPage}`, { headers: { 'x-user-uid': uid } })
      .then(r => r.json())
      .then(d => { setHistory(d.rows ?? []); setHistPages(d.pages ?? 1); });
  }, [uid, tab, histPage]);

  return (
    <div className={`py-10 ${CONTAINER.blog}`}>
      <PageSEO title={tc('seo.billing.title')} description={tc('seo.billing.desc')} path="/billing"/>
      <Typography variant="h2" weight="bold" className="block mb-8">{t('title')}</Typography>

      {/* Success / cancel toast */}
      {toast === 'success' && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 px-5 py-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" className="flex-shrink-0">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          <p className="text-sm font-medium text-foreground">{t('paySuccess')}</p>
          <button onClick={() => setToast(null)} className="ml-auto text-muted-foreground hover:text-foreground transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      )}
      {toast === 'cancel' && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-5 py-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-muted-foreground">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
          </svg>
          <p className="text-sm font-medium text-foreground">{t('payCancel')}</p>
          <button onClick={() => setToast(null)} className="ml-auto text-muted-foreground hover:text-foreground transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4 mb-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Block>
            <BlockLabel>{t('balance')}</BlockLabel>
            <p className="text-4xl font-bold text-foreground">{loading ? '-' : fmt(balance)}</p>
            <p className="text-xs text-muted-foreground">{t('balanceDesc')}</p>
          </Block>
          <Block>
            <BlockLabel>{t('spentMonth')}</BlockLabel>
            <p className="text-4xl font-bold text-foreground">{loading ? '-' : fmt(spentMonth)}</p>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleString('en', { month: 'long', year: 'numeric' })}
            </p>
          </Block>
        </div>

        {/* Top-up */}
        <TopUpBlock lang={lang}/>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[
          { id: 'history', label: t('history') },
          { id: 'auto',    label: t('autoBilling') },
        ].map(tb => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all
              ${tab === tb.id
                ? 'bg-primary text-primary-foreground'
                : 'border border-border text-foreground hover:border-foreground/40'}`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* History tab */}
      {tab === 'history' && (
        <div className="rounded-2xl border border-border overflow-hidden">
          {history.length === 0 ? (
            <div className="px-6 py-10 text-center text-muted-foreground text-sm">{t('noHistory')}</div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead className="bg-muted text-muted-foreground text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-5 py-3 text-left">{t('tool')}</th>
                    <th className="px-5 py-3 text-left">{t('status')}</th>
                    <th className="px-5 py-3 text-left">{t('date')}</th>
                    <th className="px-5 py-3 text-right">{t('amount')}</th>
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
                  <button
                    onClick={() => setHistPage(p => Math.max(1, p - 1))}
                    disabled={histPage === 1}
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <span className="text-sm text-muted-foreground">{histPage} / {histPages}</span>
                  <button
                    onClick={() => setHistPage(p => Math.min(histPages, p + 1))}
                    disabled={histPage === histPages}
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Auto billing tab */}
      {tab === 'auto' && (
        <div className="rounded-2xl border border-border bg-card p-8 text-center flex flex-col items-center gap-3">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
          <p className="text-sm font-medium text-foreground">{t('autoSoon')}</p>
          <p className="text-xs text-muted-foreground max-w-sm">{t('autoDesc2')}</p>
        </div>
      )}
    </div>
  );
};

export default Billing;
