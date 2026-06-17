import { useState, useEffect, useCallback } from 'react';
import { Typography } from '@/components/ui/Typography';
import { useTranslation } from 'react-i18next';
import { CONTAINER } from '@/config/sizes';
import PageSEO from '@/components/seo/PageSEO';
import { useLang } from '@/contexts/LangContext';
import { API_URL as API } from '@/config/api';

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
const PACKAGES = [
  { amount: 5,  popular: false },
  { amount: 10, popular: true  },
  { amount: 25, popular: false },
];

function TopUpBlock({ lang }) {
  const { t } = useTranslation('billing');
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [error, setError] = useState('');
  const uid = localStorage.getItem('userUID') || '';

  async function handleTopUp(pkg) {
    setCheckoutLoading(pkg);
    setError('');
    try {
      const res  = await fetch(`${API}/api/billing/create-checkout-session`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-uid': uid },
        body:    JSON.stringify({ amount: pkg, lang }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      window.location.href = data.url;
    } catch {
      setError(t('errors.wentWrong', { ns: 'common' }));
    } finally {
      setCheckoutLoading(null);
    }
  }

  return (
    <Block>
      <BlockLabel>{t('topup.title')}</BlockLabel>
      <p className="text-sm text-muted-foreground -mt-2">{t('topup.subtitle')}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-1">
        {PACKAGES.map(({ amount, popular }) => (
          <div
            key={amount}
            className={`relative rounded-2xl border p-6 flex flex-col items-center gap-4 transition-all ${
              popular ? 'border-[#F5A623] bg-gradient-to-b from-[#F5A623]/8 to-transparent' : 'border-border bg-card'
            }`}
          >
            {popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#F5A623] to-[#FBCF33] text-[11px] font-bold text-black">
                {t('topup.popular')}
              </span>
            )}
            <p className="text-[40px] font-bold text-foreground leading-none">${amount}</p>
            <p className="text-sm text-muted-foreground">{t('topup.credits', { amount })}</p>
            <button
              onClick={() => handleTopUp(amount)}
              disabled={checkoutLoading !== null}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#F5A623] to-[#FBCF33] text-black font-semibold text-sm hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
            >
              {checkoutLoading === amount ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12"/>
                  </svg>
                  {t('topup.loading')}
                </>
              ) : t('topup.buy')}
            </button>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

      <div className="flex items-start gap-2 mt-1">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className="text-muted-foreground mt-0.5 flex-shrink-0">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
        <p className="text-xs text-muted-foreground leading-relaxed">{t('stripeNote')}</p>
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
