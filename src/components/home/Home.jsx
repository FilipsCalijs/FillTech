import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { CONTAINER } from '@/config/sizes';
import PageSEO from '@/components/seo/PageSEO';
import LangLink from '@/components/routing/LangLink';
import { API_URL as API } from '@/config/api';
import { useLang } from '@/contexts/LangContext';

export default function Home() {
  const { t }       = useTranslation('home');
  const { t: te }   = useTranslation('effects');
  const { t: tc }   = useTranslation('common');
  const lang        = useLang();
  const navigate    = useNavigate();
  const [effects, setEffects] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/effects`)
      .then(r => r.json())
      .then(data => setEffects(Array.isArray(data) ? data.slice(0, 6) : []))
      .catch(() => {});
  }, []);

  const steps = t('howItWorks.steps', { returnObjects: true });

  const h1Full   = t('hero.h1');
  const lastSpace = h1Full.lastIndexOf(' ');
  const h1Start  = lastSpace >= 0 ? h1Full.substring(0, lastSpace + 1) : '';
  const h1Accent = lastSpace >= 0 ? h1Full.substring(lastSpace + 1)    : h1Full;

  return (
    <div className={`py-12 ${CONTAINER.blog}`}>
      <PageSEO title={t('seo.title')} description={t('seo.description')} path="/" />

      {/* ── Hero ── */}
      <div className="mb-16 text-center">
        <Typography variant="h2" weight="bold" className="block mb-4 leading-tight">
          {h1Start}
          <span className="gradient-text">{h1Accent}</span>
        </Typography>
        <Typography variant="lead" color="muted" className="block max-w-2xl mx-auto mb-8">
          {t('hero.subheadline')}
        </Typography>
        <div className="flex flex-wrap justify-center gap-3">
          <LangLink to="/tools">
            <Button size="lg">{t('hero.ctaPrimary')}</Button>
          </LangLink>
          <LangLink to="/tools">
            <Button variant="outline" size="lg">{t('hero.ctaSecondary')}</Button>
          </LangLink>
        </div>
      </div>

      {/* ── Featured tools ── */}
      {effects.length > 0 && (
        <div className="mb-16">
          <Typography variant="h3" weight="bold" className="block mb-6">
            {t('toolSpotlight.heading')}
          </Typography>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
            {effects.map(effect => (
              <div
                key={effect.id}
                onClick={() => navigate(`/${lang}/tools/${effect.slug}`)}
                className="group cursor-pointer border border-border rounded-2xl overflow-hidden bg-card hover:shadow-md transition-all duration-200"
              >
                <div className="aspect-video bg-muted overflow-hidden p-3">
                  <img
                    src={effect.cover_url || 'https://placehold.co/300x170'}
                    alt={te(`${effect.slug}.name`, { defaultValue: effect.name })}
                    className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <Typography variant="h4" weight="semibold" className="mb-1">
                    {te(`${effect.slug}.name`, { defaultValue: effect.name })}
                  </Typography>
                  <Typography variant="body2" color="muted" className="block line-clamp-2">
                    {te(`${effect.slug}.desc`, { defaultValue: effect.short_desc })}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
          <LangLink to="/tools">
            <Button variant="outline">{t('toolSpotlight.cta')}</Button>
          </LangLink>
        </div>
      )}

      {/* ── How it works ── */}
      {Array.isArray(steps) && steps.length > 0 && (
        <div>
          <Typography variant="h3" weight="bold" className="block mb-6">
            {t('howItWorks.heading')}
          </Typography>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {steps.map((step, i) => (
              <div key={i} className="border border-border rounded-2xl bg-card p-6 flex flex-col gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#F5A623] to-[#FBCF33] flex items-center justify-center text-[#0d0d0d] font-bold text-[15px] shrink-0">
                  {i + 1}
                </div>
                <Typography variant="body1" weight="semibold">{step.title}</Typography>
                <Typography variant="body2" color="muted" className="block leading-relaxed">
                  {step.desc}
                </Typography>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
