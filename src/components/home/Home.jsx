import { useTranslation } from 'react-i18next';
import { Layers, Monitor, Globe, Shield } from 'lucide-react';
import PageSEO from '@/components/seo/PageSEO';
import LangLink from '@/components/routing/LangLink';
import FeaturesGrid from '@/lib/FeaturesGrid';
import FAQSection from '@/lib/FAQSection';

const ICON_MAP = { Layers, Monitor, Globe, Shield };

export default function Home() {
  const { t } = useTranslation('home');

  // Hero h1: last word gets gradient
  const h1Full = t('hero.h1');
  const lastSpace = h1Full.lastIndexOf(' ');
  const h1Start  = lastSpace >= 0 ? h1Full.substring(0, lastSpace + 1) : '';
  const h1Accent = lastSpace >= 0 ? h1Full.substring(lastSpace + 1)    : h1Full;

  // FeaturesGrid: map icon string → JSX element
  const rawFeatures = t('features.items', { returnObjects: true });
  const features = Array.isArray(rawFeatures) ? rawFeatures.map(item => {
    const I = ICON_MAP[item.icon];
    return { ...item, icon: I ? <I size={24} /> : null };
  }) : [];

  const stats       = t('socialProof.stats',    { returnObjects: true });
  const tools       = t('toolSpotlight.tools',  { returnObjects: true });
  const steps       = t('howItWorks.steps',     { returnObjects: true });
  const personas    = t('useCases.personas',    { returnObjects: true });
  const testimonials= t('testimonials.items',   { returnObjects: true });
  const faqs        = t('faq.items',            { returnObjects: true });
  const badges      = t('hero.badges',          { returnObjects: true });

  return (
    <>
      <PageSEO title={t('seo.title')} description={t('seo.description')} path="/" />

      {/* ── Hero ── */}
      <section className="-mx-4 sm:-mx-6 lg:-mx-8 bg-[#0F1729] py-20 px-4 sm:px-8">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-[40px] sm:text-[56px] font-bold leading-tight text-white mb-4">
            {h1Start}
            <span className="gradient-text">{h1Accent}</span>
          </h1>
          <p className="text-[18px] text-white/70 max-w-2xl mx-auto mb-6">
            {t('hero.subheadline')}
          </p>
          {Array.isArray(badges) && (
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {badges.map((b, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-[14px]">
                  {b}
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-3">
            <LangLink
              to="/tools"
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#F5A623] to-[#FBCF33] text-[#0d0d0d] font-semibold text-[16px] hover:opacity-90 transition-opacity"
            >
              {t('hero.ctaPrimary')}
            </LangLink>
            <LangLink
              to="/tools"
              className="px-6 py-3 rounded-lg border border-white/30 text-white text-[16px] font-medium hover:bg-white/10 transition-colors"
            >
              {t('hero.ctaSecondary')}
            </LangLink>
          </div>
        </div>
      </section>

      {/* ── Social Proof ── */}
      {Array.isArray(stats) && (
        <section className="-mx-4 sm:-mx-6 lg:-mx-8 bg-foreground/5 py-10 px-4">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {stats.map((s, i) => (
                <div key={i}>
                  <p className="text-[36px] font-bold text-foreground">{s.value}</p>
                  <p className="text-[14px] text-foreground/60 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Tool Spotlight ── */}
      {Array.isArray(tools) && (
        <section className="py-16">
          <h2 className="text-[40px] font-bold text-center mb-10" style={{ color: 'var(--foreground)' }}>
            {t('toolSpotlight.heading')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tools.map((tool) => (
              <LangLink
                key={tool.slug}
                to={`/tools/${tool.slug}`}
                className="block rounded-xl border border-foreground/10 bg-foreground/5 p-6 hover:border-foreground/30 hover:bg-foreground/10 transition-all"
              >
                <p className="font-semibold text-[17px] text-foreground mb-2">{tool.name}</p>
                <p className="text-[15px] text-foreground/60 leading-relaxed">{tool.desc}</p>
              </LangLink>
            ))}
          </div>
          <div className="text-center mt-8">
            <LangLink
              to="/tools"
              className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-[#F5A623] to-[#FBCF33] text-[#0d0d0d] font-semibold text-[16px] hover:opacity-90 transition-opacity"
            >
              {t('toolSpotlight.cta')}
            </LangLink>
          </div>
        </section>
      )}

      {/* ── How It Works ── */}
      {Array.isArray(steps) && (
        <section className="-mx-4 sm:-mx-6 lg:-mx-8 bg-foreground/5 py-16 px-4">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <h2 className="text-[40px] font-bold text-center mb-10" style={{ color: 'var(--foreground)' }}>
              {t('howItWorks.heading')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#F5A623] to-[#FBCF33] flex items-center justify-center text-[#0d0d0d] font-bold text-[20px] mb-4">
                    {i + 1}
                  </div>
                  <p className="font-semibold text-[18px] text-foreground mb-2">{step.title}</p>
                  <p className="text-[15px] text-foreground/60 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Features ── */}
      <section className="py-16 flex flex-col items-center">
        <h2 className="text-[40px] font-bold text-center mb-10" style={{ color: 'var(--foreground)' }}>
          {t('features.heading')}
        </h2>
        <FeaturesGrid title="" features={features} />
      </section>

      {/* ── Use Cases ── */}
      {Array.isArray(personas) && (
        <section className="-mx-4 sm:-mx-6 lg:-mx-8 bg-foreground/5 py-16 px-4">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <h2 className="text-[40px] font-bold text-center mb-10" style={{ color: 'var(--foreground)' }}>
              {t('useCases.heading')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {personas.map((p, i) => (
                <div key={i} className="rounded-xl border border-foreground/10 bg-background p-6">
                  <p className="font-semibold text-[17px] text-foreground mb-2">{p.role}</p>
                  <p className="text-[15px] text-foreground/60 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Testimonials ── */}
      {Array.isArray(testimonials) && (
        <section className="py-16">
          <h2 className="text-[40px] font-bold text-center mb-10" style={{ color: 'var(--foreground)' }}>
            {t('testimonials.heading')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {testimonials.map((item, i) => (
              <div key={i} className="rounded-xl border border-foreground/10 bg-foreground/5 p-6 flex flex-col gap-4">
                <p className="text-[15px] text-foreground/80 leading-relaxed">{item.text}</p>
                <div className="mt-auto">
                  <p className="font-semibold text-[15px] text-foreground">{item.name}</p>
                  <p className="text-[13px] text-foreground/50">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      {Array.isArray(faqs) && (
        <section className="-mx-4 sm:-mx-6 lg:-mx-8 bg-foreground/5 py-16 px-4">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <FAQSection title={t('faq.heading')} faqs={faqs} />
          </div>
        </section>
      )}

      {/* ── Final CTA ── */}
      <section className="-mx-4 sm:-mx-6 lg:-mx-8 bg-gradient-to-r from-[#F5A623] to-[#FBCF33] py-16 px-4">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-[40px] font-bold mb-4" style={{ color: '#0d0d0d' }}>
            {t('finalCta.heading')}
          </h2>
          <p className="text-[18px] mb-8 max-w-xl mx-auto" style={{ color: '#0d0d0d99' }}>
            {t('finalCta.subtext')}
          </p>
          <LangLink
            to="/tools"
            className="inline-block px-8 py-4 rounded-lg bg-[#0d0d0d] text-white font-semibold text-[16px] hover:opacity-90 transition-opacity"
          >
            {t('finalCta.cta')}
          </LangLink>
        </div>
      </section>
    </>
  );
}
