import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CONTAINER } from '@/config/sizes';
import PageSEO from '@/components/seo/PageSEO';
import { useLang } from '@/contexts/LangContext';
import { useAuth } from '@/contexts/authContext';
import { API_URL as API } from '@/config/api';

const PACKAGES = [5, 10, 50, 100];

function fmt(n) {
  return `$${parseFloat(n ?? 0).toFixed(2)}`;
}

function fmtDate(dateStr) {
  const d = new Date(dateStr);
  const pad = n => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const Billing = () => {
  const { t }     = useTranslation('billing');
  const { t: tc } = useTranslation('common');
  const lang      = useLang();
  const { currentUser } = useAuth();
  const uid = currentUser?.uid || localStorage.getItem('userUID') || '';

  const [balance,     setBalance]     = useState(null);
  const [spentMonth,  setSpentMonth]  = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [toast,       setToast]       = useState(null); // 'success' | 'cancel' | null
  const [selectedPkg, setSelectedPkg] = useState(10);
  const [buyLoading,  setBuyLoading]  = useState(false);
  const [buyError,    setBuyError]    = useState('');
  const [tab,         setTab]         = useState('topup');
  const [payments,    setPayments]    = useState([]);
  const [autoThreshold]               = useState(5);
  const [autoCredits]                 = useState(20);
  const [comingSoon,  setComingSoon]  = useState(false);

  const fetchBalance = useCallback(() => {
    if (!uid) return;
    fetch(`${API}/api/billing`, { headers: { 'x-user-uid': uid } })
      .then(r => r.json())
      .then(d => { setBalance(d.balance); setSpentMonth(d.spent_month); })
      .finally(() => setLoading(false));
  }, [uid]);

  const fetchPayments = useCallback(() => {
    if (!uid) return;
    fetch(`${API}/api/billing/payments`, { headers: { 'x-user-uid': uid } })
      .then(r => r.json())
      .then(d => setPayments(d.rows ?? []));
  }, [uid]);

  // Handle Stripe return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      const sessionId = params.get('session_id');
      window.history.replaceState({}, '', window.location.pathname);
      setToast('success');
      if (sessionId && uid) {
        fetch(`${API}/api/billing/verify-session?session_id=${sessionId}`, {
          headers: { 'x-user-uid': uid },
        })
          .then(r => r.json())
          .then(() => {
            fetchBalance();
            fetchPayments();
            window.dispatchEvent(new CustomEvent('visaulio:balance-updated'));
          })
          .catch(() => setTimeout(fetchBalance, 2000));
      } else {
        setTimeout(() => {
          fetchBalance();
          window.dispatchEvent(new CustomEvent('visaulio:balance-updated'));
        }, 2000);
      }
    } else if (params.get('cancel') === 'true') {
      setToast('cancel');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [fetchBalance, fetchPayments, uid]);

  useEffect(fetchBalance, [fetchBalance]);
  useEffect(fetchPayments, [fetchPayments]);

  async function handleBuy() {
    if (!uid) return;
    setBuyLoading(true);
    setBuyError('');
    try {
      const res  = await fetch(`${API}/api/billing/create-checkout-session`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-uid': uid },
        body:    JSON.stringify({ amount: selectedPkg, lang }),
      });
      const data = await res.json();
      if (data.error) { setBuyError(data.error); return; }
      window.location.href = data.url;
    } catch {
      setBuyError('Something went wrong. Please try again.');
    } finally {
      setBuyLoading(false);
    }
  }

  const dailyAvg = spentMonth !== null
    ? parseFloat(spentMonth) / Math.max(1, new Date().getDate())
    : null;

  return (
    <div className={`py-10 ${CONTAINER.blog}`}>
      <PageSEO title={tc('seo.billing.title')} description={tc('seo.billing.desc')} path="/billing" />

      {/* Toasts */}
      {toast === 'success' && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 px-5 py-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" className="shrink-0"><path d="M20 6L9 17l-5-5"/></svg>
          <p className="text-sm font-medium text-foreground">{t('paySuccess')}</p>
          <button onClick={() => setToast(null)} className="ml-auto text-muted-foreground hover:text-foreground">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      )}
      {toast === 'cancel' && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-5 py-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-muted-foreground"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
          <p className="text-sm font-medium text-foreground">{t('payCancel')}</p>
          <button onClick={() => setToast(null)} className="ml-auto text-muted-foreground hover:text-foreground">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      )}
      {comingSoon && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-5 py-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-muted-foreground"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
          <p className="text-sm font-medium text-foreground">{t('autoTopUp.comingSoon')}</p>
          <button onClick={() => setComingSoon(false)} className="ml-auto text-muted-foreground hover:text-foreground">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col">
          <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-muted-foreground mb-3">{t('balance')}</p>
          <p className="text-[40px] font-bold leading-none text-foreground">{loading ? '-' : fmt(balance)}</p>
          <p className="text-xs text-muted-foreground mt-6">{t('creditsNeverExpire')}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col">
          <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-muted-foreground mb-3">{t('spentMonth')}</p>
          <p className="text-[40px] font-bold leading-none text-foreground">{loading ? '-' : fmt(spentMonth)}</p>
          <p className="text-xs text-muted-foreground mt-6">
            <span className="font-mono font-semibold text-foreground">{loading ? '-' : fmt(dailyAvg)}</span>
            {' '}{t('dailyAvg')}
          </p>
        </div>
      </div>

      {/* ── Top Up + Auto Top-up ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

        {/* Top Up */}
        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col">
          <p className="font-semibold text-[17px] text-foreground mb-4">{t('topUpTitle')}</p>

          <div className="flex flex-col gap-0.5 mb-6">
            {PACKAGES.map(amount => (
              <label
                key={amount}
                onClick={() => setSelectedPkg(amount)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer border transition-all ${
                  selectedPkg === amount
                    ? 'border-primary bg-primary/5'
                    : 'border-transparent hover:border-border'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  selectedPkg === amount ? 'border-primary' : 'border-muted-foreground/50'
                }`}>
                  {selectedPkg === amount && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
                <span className="font-semibold text-foreground">${amount}</span>
              </label>
            ))}

            {/* Custom — stub */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-transparent opacity-40 cursor-not-allowed select-none">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/50 shrink-0" />
                <span className="font-semibold text-foreground">{t('custom')}</span>
              </div>
              <span className="text-xs text-muted-foreground">{t('customMin')}</span>
            </div>
          </div>

          {buyError && <p className="text-sm text-red-500 mb-3">{buyError}</p>}

          <button
            onClick={handleBuy}
            disabled={buyLoading}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity mt-auto"
          >
            {buyLoading
              ? t('topup.loading')
              : t('buyBtn', { amount: selectedPkg })}
          </button>

          {/* Stripe note */}
          <div className="flex items-start gap-2 mt-4">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="text-muted-foreground mt-0.5 shrink-0">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <p className="text-xs text-muted-foreground leading-relaxed">{t('stripeNote')}</p>
          </div>
        </div>

        {/* Auto Top-up — stub */}
        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-[17px] text-foreground">{t('autoTopUp.title')}</p>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {t('autoTopUp.status')}
              </span>
            </div>
            {/* Toggle — always off, disabled */}
            <div className="w-10 h-6 rounded-full bg-muted flex items-center px-1 cursor-not-allowed opacity-50">
              <div className="w-4 h-4 rounded-full bg-muted-foreground transition-transform" />
            </div>
          </div>

          {/* Info banner */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 mb-5">
            <p className="text-xs text-primary leading-relaxed">ⓘ {t('autoTopUp.warning')}</p>
          </div>

          {/* Threshold */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-1.5">{t('autoTopUp.below')}</p>
            <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 bg-muted/20">
              <span className="text-muted-foreground text-sm">$</span>
              <input
                type="number"
                defaultValue={autoThreshold}
                disabled
                className="flex-1 bg-transparent outline-none text-foreground text-sm cursor-not-allowed w-full"
              />
            </div>
          </div>

          {/* Credits */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-1.5">{t('autoTopUp.credits')}</p>
            <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 bg-muted/20">
              <span className="text-muted-foreground text-sm">$</span>
              <input
                type="number"
                defaultValue={autoCredits}
                disabled
                className="flex-1 bg-transparent outline-none text-foreground text-sm cursor-not-allowed w-full"
              />
            </div>
          </div>

          {/* Hint */}
          <p className="text-xs text-muted-foreground mb-6">
            {t('autoTopUp.hint', { credits: autoCredits, threshold: autoThreshold })}
          </p>

          <button
            onClick={() => setComingSoon(true)}
            className="w-full py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-muted transition-colors mt-auto"
          >
            {t('autoTopUp.enable')}
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-6 border-b border-border">
        {[
          { id: 'topup',   label: t('topUpTab')  },
          { id: 'billing', label: t('billingTab') },
        ].map(tb => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={`pb-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              tab === tb.id
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className="rounded-b-2xl border border-border border-t-0 overflow-hidden">
        {/* Top Up tab — payment history */}
        {tab === 'topup' && (
          payments.length === 0 ? (
            <div className="px-6 py-10 text-center text-muted-foreground text-sm">{t('noPayments')}</div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-xs">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium">{t('billingTable.description')}</th>
                    <th className="px-5 py-3 text-left font-medium">{t('billingTable.date')}</th>
                    <th className="px-5 py-3 text-right font-medium">{t('billingTable.amount')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {payments.map(row => (
                    <tr key={row.session_id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-5 py-3 text-foreground">Stripe</td>
                      <td className="px-5 py-3 text-muted-foreground font-mono text-xs">{fmtDate(row.created_at)}</td>
                      <td className="px-5 py-3 text-right">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-mono font-bold bg-green-500/15 text-green-600 dark:text-green-400">
                          +{fmt(row.amount)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-5 py-3 border-t border-border text-xs text-muted-foreground">
                {t('billingTable.showing', { count: payments.length })}
              </div>
            </>
          )
        )}

        {/* Billing tab — empty for now */}
        {tab === 'billing' && (
          <div className="px-6 py-10 text-center text-muted-foreground text-sm">{t('billingTable.empty')}</div>
        )}
      </div>
    </div>
  );
};

export default Billing;
