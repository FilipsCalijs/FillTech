import { STORAGE_KEY } from './situations';

export interface LeadDraft {
  step?: number;
  situations?: string[];
  years?: string[];
  form?: string;
  employees?: string;
  vat?: string;
  urgency?: string;
  budget?: string;
  name?: string;
  phone?: string;
  email?: string;
  company?: string;
  channel?: string;
  time?: string;
}

// Storage can be blocked (private mode, disabled site data): every access is guarded.
export function readLead(): LeadDraft {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as LeadDraft;
  } catch {
    return {};
  }
}

export function writeLead(patch: Partial<LeadDraft>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readLead(), ...patch }));
  } catch {
    /* draft is a convenience only */
  }
}

export function clearLead(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

const TRACKING_KEY = 'irg-tracking-v1';
const TRACKING_PARAMS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'campaign_id', 'adset_id', 'ad_id', 'fbclid',
];

// First-touch attribution: params from the landing URL are kept for the session.
export function readTracking(): Record<string, string> {
  let stored: Record<string, string> = {};
  try {
    stored = JSON.parse(sessionStorage.getItem(TRACKING_KEY) || '{}');
  } catch {
    /* ignore */
  }
  const params = new URLSearchParams(location.search);
  const fresh: Record<string, string> = {};
  for (const p of TRACKING_PARAMS) {
    const v = params.get(p);
    if (v) fresh[p] = v;
  }
  const merged = Object.keys(fresh).length ? fresh : stored;
  try {
    sessionStorage.setItem(TRACKING_KEY, JSON.stringify(merged));
  } catch {
    /* ignore */
  }
  return merged;
}

export { TRACKING_PARAMS };
