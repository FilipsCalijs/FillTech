import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, ShieldCheck, ScanSearch, Layers } from 'lucide-react';
import PageSEO from '@/components/seo/PageSEO';
import StepsSection from '@/lib/StepsSection';
import BeforeAfterSection from '@/lib/BeforeAfterSection';
import BeforeAfterSlider from '@/lib/beforeAfterSlider';
import FeaturesGrid from '@/lib/FeaturesGrid';
import CardLeftImage from '@/lib/CardLeftImage';
import CardRightImage from '@/lib/CardRightImage';
import FAQSection from '@/lib/FAQSection';
import TextSection from '@/lib/TextSection';
import OtherProducts from '@/lib/OtherProducts';
import RelevantBlogs from '@/components/ui/RelevantBlogs';

const API = 'http://localhost:5200';
const MAX_MB = 22;
const MAX_SIZE = MAX_MB * 1024 * 1024;

const ImageUpscaler = () => {
  const { t } = useTranslation('tools');

  const STEPS = [
    { title: t('imageUpscaler.steps.items.0.title'), description: t('imageUpscaler.steps.items.0.text') },
    { title: t('imageUpscaler.steps.items.1.title'), description: t('imageUpscaler.steps.items.1.text') },
    { title: t('imageUpscaler.steps.items.2.title'), description: t('imageUpscaler.steps.items.2.text') },
  ];

  const FEATURES = [
    { icon: <Zap size={28} />,         title: t('imageUpscaler.features.items.0.title'), desc: t('imageUpscaler.features.items.0.text') },
    { icon: <ScanSearch size={28} />,  title: t('imageUpscaler.features.items.1.title'), desc: t('imageUpscaler.features.items.1.text') },
    { icon: <Layers size={28} />,      title: t('imageUpscaler.features.items.2.title'), desc: t('imageUpscaler.features.items.2.text') },
    { icon: <ShieldCheck size={28} />, title: t('imageUpscaler.features.items.3.title'), desc: t('imageUpscaler.features.items.3.text') },
  ];

  const FAQS = Array.from({ length: 10 }, (_, i) => ({
    q: t(`imageUpscaler.faq.items.${i}.q`),
    a: t(`imageUpscaler.faq.items.${i}.a`),
  }));

  const rawParas = t('imageUpscaler.seoText.paragraphs', { returnObjects: true });
  const SEO_TEXT = Array.isArray(rawParas) ? rawParas.join('\n\n') : '';

  const [file,        setFile]        = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [resultUrl,   setResultUrl]   = useState(null);
  const [isDragging,  setIsDragging]  = useState(false);
  const fileInputRef = useRef(null);

  const handleFileDrop = useCallback((f) => {
    if (!f) return;
    if (f.size > MAX_SIZE) {
      setError(`Image too large: ${(f.size / 1024 / 1024).toFixed(1)} MB. Max ${MAX_MB} MB.`);
      return;
    }
    setFile(f);
    setResultUrl(null);
    setError(null);
  }, []);

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResultUrl(null);
    try {
      const userUid = localStorage.getItem('userUID') || '';
      const form = new FormData();
      form.append('image', file);
      const res = await fetch(`${API}/api/tools/upscaler`, {
        method: 'POST',
        headers: { 'x-user-uid': userUid },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setResultUrl(data.resultUrl ?? data.imageUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const h1 = t('imageUpscaler.hero.h1');

  return (
    <div className="py-12 flex flex-col items-center gap-20">
      <PageSEO
        title={t('imageUpscaler.seo.title')}
        description={t('imageUpscaler.seo.description')}
        path="/tools/image-upscaler"
      />

      {/* Hero */}
      <div className="w-full max-w-[1440px] px-4 flex flex-col items-center gap-8">

        <h1 className="text-[52px] leading-tight font-bold text-center">
          {h1.startsWith('AI') || h1.includes('AI') ? (
            <>
              <span className="bg-gradient-to-r from-[#F5A623] to-[#FBCF33] bg-clip-text text-transparent">AI</span>
              {' '}{h1.replace(/^(Free\s+)?AI\s+/, h1.startsWith('Free') ? 'Free ' : '')}
            </>
          ) : h1}
        </h1>

        <p className="text-[22px] text-muted-foreground text-center max-w-3xl leading-relaxed">
          {t('imageUpscaler.hero.subtitle')}
        </p>

        {/* Upload zone */}
        <div className="w-[71%] mx-auto">
          <div
            className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center gap-5 cursor-pointer transition-all min-h-[280px] ${
              isDragging ? 'border-[#F5A623] bg-gradient-to-b from-[#F5A623]/10 to-transparent' : 'border-border bg-card'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileDrop(e.dataTransfer.files?.[0]); }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileDrop(e.target.files?.[0])}
            />

            {file ? (
              <div className="flex flex-col items-center gap-2">
                <span className="text-foreground font-semibold text-lg">{file.name}</span>
                <span className="text-muted-foreground text-sm">{t('upload.clickToChange')}</span>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-[#F5A623] to-[#FBCF33] text-black font-bold text-xl shadow-lg ring-2 ring-[#F5A623] ring-offset-2 ring-offset-card hover:opacity-90 transition-opacity pointer-events-none"
                >
                  <span className="w-9 h-9 rounded-full bg-black/20 flex items-center justify-center text-white font-bold text-2xl leading-none">+</span>
                  {t('upload.button')}
                </button>
                <p className="text-muted-foreground text-base text-center">
                  {t('upload.dropHint')} &nbsp;&middot;&nbsp; JPG, PNG, WebP &nbsp;&middot;&nbsp; {t('upload.maxSize', { max: MAX_MB })}
                </p>
              </>
            )}

            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); handleSubmit(); }}
            disabled={loading || !file}
            className="mt-3 w-full py-4 rounded-2xl bg-gradient-to-r from-[#F5A623] to-[#FBCF33] text-black font-bold text-lg hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? t('imageUpscaler.hero.submitLoading') : t('imageUpscaler.hero.submit')}
          </button>
        </div>

        {resultUrl && (
          <div className="w-[71%] mx-auto flex flex-col items-center gap-3">
            <img src={resultUrl} alt="Upscaled result" className="w-full rounded-2xl" />
            <a
              href={resultUrl}
              download
              className="px-8 py-3 rounded-full bg-foreground text-background font-bold text-sm hover:opacity-80 transition-opacity"
            >
              Download
            </a>
          </div>
        )}
      </div>

      {/* Description + slider */}
      <div className="w-full max-w-[1440px] px-4 flex flex-col items-center gap-10">
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            { key: 'free', gold: true },
            { key: 'aiPowered' },
            { key: 'noSignup' },
            { key: 'hdQuality' },
            { key: 'instantResults' },
            { key: 'securePrivate' },
          ].map(({ key, gold }) => (
            <span
              key={key}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                gold
                  ? 'border-[#F5A623] bg-gradient-to-r from-[#F5A623] to-[#FBCF33] bg-clip-text text-transparent'
                  : 'border-border text-muted-foreground'
              }`}
            >
              {t(`badges.${key}`)}
            </span>
          ))}
        </div>

        <div className="w-full flex flex-col gap-3 text-center">
          <h2 className="text-[42px] font-bold leading-tight">
            {t('imageUpscaler.description.h2')}
          </h2>
          <p className="text-[20px] text-muted-foreground leading-relaxed">
            {t('imageUpscaler.description.text')}
          </p>
        </div>

        <div className="w-[71%] mx-auto">
          <BeforeAfterSlider
            beforeImage="/upscaler/before.webp"
            afterImage="/upscaler/after.webp"
            width="100%"
            aspectRatio="16/9"
            autoAnimate={true}
          />
        </div>
      </div>

      <StepsSection
        title={t('imageUpscaler.steps.title')}
        steps={STEPS}
        images={[
          '/upscaler/step1.webp',
          '/upscaler/step2.webp',
          '/upscaler/step3.webp',
        ]}
        autoInterval={3000}
      />

      <BeforeAfterSection
        title={t('imageUpscaler.beforeAfter.title')}
        desc={t('imageUpscaler.beforeAfter.text')}
        beforeImage="/upscaler/before.webp"
        afterImage="/upscaler/after.webp"
      />

      <FeaturesGrid
        title={t('imageUpscaler.features.title')}
        features={FEATURES}
      />

      <CardLeftImage
        noCard
        title={t('imageUpscaler.cardLeft.title')}
        text={t('imageUpscaler.cardLeft.text')}
        imageUrl="/upscaler/product-photo.webp"
        alt="AI upscaling product photos for e-commerce"
      />

      <CardRightImage
        noCard
        title={t('imageUpscaler.cardRight.title')}
        text={t('imageUpscaler.cardRight.text')}
        imageUrl="/upscaler/old-photo-restored.webp"
        alt="Old photo restored and upscaled to 4K print quality"
      />

      <FAQSection
        title={t('imageUpscaler.faq.title')}
        faqs={FAQS}
      />

      <RelevantBlogs currentSlug="upscaler" />

      <TextSection
        title={t('imageUpscaler.seoText.title')}
        text={SEO_TEXT}
      />

      <OtherProducts currentSlug="upscaler" />
    </div>
  );
};

export default ImageUpscaler;
