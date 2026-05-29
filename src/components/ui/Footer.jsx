import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLang } from '@/contexts/LangContext';
import LangLink from '@/components/routing/LangLink';
import { SUPPORTED_LANGS } from '@/i18n/index';

const LANG_NAMES = { en: 'English', ru: 'Русский', lv: 'Latviešu', de: 'Deutsch', pt: 'Português', es: 'Español', ja: '日本語', hi: 'हिंदी', ko: '한국어', zh: '中文' };

const TOOLS = [
  { slug: 'portrait',          to: '/tools/portrait' },
  { slug: 'bg-remover',        to: '/tools/bg-remover' },
  { slug: 'watermark-remover', to: '/tools/watermark-remover' },
  { slug: 'watermark-remover', to: '/tools/watermark-remover-video' },
  { slug: 'photo-colorize',    to: '/tools/photo-colorize' },
  { slug: 'clothes-swap',      to: '/tools/clothes-swap' },
  { slug: 'upscaler',          to: '/tools/upscaler' },
];

const ColHeading = ({ children }) => (
  <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-foreground mb-4">
    {children}
  </p>
);

const Footer = () => {
  const { t }       = useTranslation('common');
  const { t: te }   = useTranslation('effects');
  const lang        = useLang();
  const navigate = useNavigate();

  function switchLang(newLang) {
    localStorage.setItem('preferredLang', newLang);
    navigate(`/${newLang}/home`);
  }

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Main columns ───────────────────────────────────────── */}
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Col 1 — Brand */}
          <div className="flex flex-col gap-4 lg:col-span-1">
            <div>
              <img
                src="/logo/logo-light.png"
                className="block dark:hidden h-8 w-auto"
                alt="FillTech"
              />
              <img
                src="/logo/logo-dark.png"
                className="hidden dark:block h-8 w-auto"
                alt="FillTech"
              />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {t('footer.description')}
            </p>
          </div>

          {/* Col 2 — Legal */}
          <div>
            <ColHeading>{t('footer.legal')}</ColHeading>
            <div className="flex flex-col gap-2.5">
              {[
                { key: 'footer.terms',   to: '/terms' },
                { key: 'footer.privacy', to: '/privacy' },
                { key: 'footer.cookies', to: '/cookies' },
              ].map(({ key, to }) => (
                <LangLink
                  key={to}
                  to={to}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
                >
                  {t(key)}
                </LangLink>
              ))}
            </div>
          </div>

          {/* Col 3 — Tools */}
          <div>
            <ColHeading>{t('footer.tools')}</ColHeading>
            <div className="flex flex-col gap-2.5">
              {TOOLS.map(({ slug, to }) => (
                <LangLink
                  key={to}
                  to={to}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
                >
                  {te(`${slug}.name`, { defaultValue: slug })}
                </LangLink>
              ))}
            </div>
          </div>

          {/* Col 4 — reserved for social links */}
          <div />
        </div>

        {/* ── Divider ────────────────────────────────────────────── */}
        <div className="border-t border-border" />

        {/* ── Bottom bar ─────────────────────────────────────────── */}
        <div className="py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            <span className="font-medium text-foreground">{LANG_NAMES[lang]}</span>
            {' · '}
            Copyright © 2026 — {t('footer.rights')}
          </p>

          {/* Language switcher */}
          <div className="flex items-center gap-4">
            {SUPPORTED_LANGS.map(l => (
              <button
                key={l}
                onClick={() => switchLang(l)}
                className={`text-xs transition-colors ${
                  l === lang
                    ? 'text-foreground font-semibold underline underline-offset-4 decoration-muted-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {LANG_NAMES[l]}
              </button>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
