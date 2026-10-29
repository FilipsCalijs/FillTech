import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, ShieldCheck, ScanSearch, Layers } from 'lucide-react';
import PageSEO from '@/components/seo/PageSEO';
import LangLink from '@/components/routing/LangLink';
import Result from '@/lib/Result';
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
import { useAuthModal } from '@/contexts/AuthModalContext';
import { API_URL as API } from '@/config/api';

const MAX_MB = 22;
const MAX_SIZE = MAX_MB * 1024 * 1024;

const WatermarkRemover = () => {
  const { t } = useTranslation('tools');

  const STEPS = [
    { title: t('watermarkRemover.steps.items.0.title'), description: t('watermarkRemover.steps.items.0.text') },
    { title: t('watermarkRemover.steps.items.1.title'), description: t('watermarkRemover.steps.items.1.text') },
    { title: t('watermarkRemover.steps.items.2.title'), description: t('watermarkRemover.steps.items.2.text') },
  ];

  const FEATURES = [
    { icon: <ScanSearch size={28} />, title: t('watermarkRemover.features.items.0.title'), desc: t('watermarkRemover.features.items.0.text') },
    { icon: <Zap size={28} />,        title: t('watermarkRemover.features.items.1.title'), desc: t('watermarkRemover.features.items.1.text') },
    { icon: <Layers size={28} />,     title: t('watermarkRemover.features.items.2.title'), desc: t('watermarkRemover.features.items.2.text') },
    { icon: <ShieldCheck size={28} />,title: t('watermarkRemover.features.items.3.title'), desc: t('watermarkRemover.features.items.3.text') },
  ];

  const FAQS = Array.from({ length: 10 }, (_, i) => ({
    q: t(`watermarkRemover.faq.items.${i}.q`),
    a: t(`watermarkRemover.faq.items.${i}.a`),
  }));

  const rawParas = t('watermarkRemover.seoText.paragraphs', { returnObjects: true });
  const SEO_TEXT = Array.isArray(rawParas) ? rawParas.join('\n\n') : '';

  const [file,          setFile]          = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [removedImage,  setRemovedImage]  = useState(null);
  const [resultVisible, setResultVisible] = useState(false);
  const [isDragging,    setIsDragging]    = useState(false);
  const fileInputRef = useRef(null);
  const { requireAuth } = useAuthModal();

  const handleFileDrop = useCallback((f) => {
    if (!f) return;
    if (f.size > MAX_SIZE) {
      setError(`Image too large: ${(f.size / 1024 / 1024).toFixed(1)} MB. Max ${MAX_MB} MB.`);
      return;
    }
    setFile(f);
    setOriginalImage(URL.createObjectURL(f));
    setRemovedImage(null);
    setResultVisible(false);
    setError(null);
  }, []);

  const handleSubmit = async () => {
    if (!file) return;
    if (!requireAuth()) return;
    setLoading(true);
    setError(null);
    setResultVisible(false);
    try {
      const userUid = localStorage.getItem('userUID') || '';
      const form = new FormData();
      form.append('image', file);
      const res = await fetch(`${API}/api/tools/watermark-remove`, {
        method: 'POST',
        headers: { 'x-user-uid': userUid },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setRemovedImage(data.imageUrl);
      setResultVisible(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const h1 = t('watermarkRemover.hero.h1');

  return (
    <div className="py-12 flex flex-col items-center gap-20">
      <PageSEO
        title={t('watermarkRemover.seo.title')}
        description={t('watermarkRemover.seo.description')}
        path="/tools/watermark-remover"
      />

      {/* Hero */}
      <div className="w-full max-w-[1440px] px-4 flex flex-col items-center gap-8">

        {/* Tab switcher */}
        <div className="inline-flex items-center gap-1 p-1 rounded-full border border-border bg-muted/20">
          <span className="px-5 py-2 rounded-full bg-foreground text-background text-sm font-bold cursor-default">
            {t('watermarkRemover.tabs.image')}
          </span>
          <LangLink
            to="/tools/watermark-remover-video"
            className="px-5 py-2 rounded-full text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('watermarkRemover.tabs.video')}
          </LangLink>
        </div>

        {/* Title */}
        <h1 className="text-[52px] leading-tight font-bold text-center">
          {h1.startsWith('AI') ? (
            <>
              <span className="bg-gradient-to-r from-[#F5A623] to-[#FBCF33] bg-clip-text text-transparent">AI</span>
              {' '}{h1.slice(3)}
            </>
          ) : h1}
        </h1>

        {/* Subtitle */}
        <p className="text-[22px] text-muted-foreground text-center max-w-3xl leading-relaxed">
          {t('watermarkRemover.hero.subtitle')}
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
                  {t('upload.dropHint')} &nbsp;&middot;&nbsp; JPG, PNG, WEBP, HEIC &nbsp;&middot;&nbsp; {t('upload.maxSize', { max: MAX_MB })}
                </p>
              </>
            )}

            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); handleSubmit(); }}
            disabled={loading || !file}
            className="mt-3 w-full py-4 rounded-2xl bg-gradient-to-r from-[#F5A623] to-[#FBCF33] text-black font-bold text-lg hover:opacity-90 transition-opacity disabled:cursor-not-allowed"
          >
            {loading ? t('watermarkRemover.hero.submitLoading') : t('watermarkRemover.hero.submit')}
          </button>
        </div>

        <Result
          isVisible={resultVisible}
          originalImage={originalImage}
          removedImage={removedImage}
        />
      </div>

      {/* Keywords + description + slider */}
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
            {t('watermarkRemover.description.h2')}
          </h2>
          <p className="text-[20px] text-muted-foreground leading-relaxed">
            {t('watermarkRemover.description.text')}
          </p>
        </div>

        <div className="w-[71%] mx-auto">
          <BeforeAfterSlider
            beforeImage="/watermark_remover/before.webp"
            afterImage="/watermark_remover/after.webp"
            width="100%"
            aspectRatio="16/9"
            autoAnimate={true}
          />
        </div>
      </div>

      <StepsSection
        title={t('watermarkRemover.steps.title')}
        steps={STEPS}
        images={[
          '/watermark_remover/before.webp',
          '/watermark_remover/Remove-watermark-from-photo.webp',
          '/watermark_remover/after.webp',
        ]}
        autoInterval={3000}
      />

      <BeforeAfterSection
        title={t('watermarkRemover.beforeAfter.title')}
        desc={t('watermarkRemover.beforeAfter.text')}
        beforeImage="/watermark_remover/before.webp"
        afterImage="/watermark_remover/after.webp"
      />

      <FeaturesGrid
        title={t('watermarkRemover.features.title')}
        features={FEATURES}
      />

      <CardLeftImage
        noCard
        title={t('watermarkRemover.cardLeft.title')}
        text={t('watermarkRemover.cardLeft.text')}
        imageUrl="/watermark_remover/remove-watermark-from-stock-sites-1024x613.jpg"
        alt="Examples of different watermark types removed by AI"
      />

      <CardRightImage
        noCard
        title={t('watermarkRemover.cardRight.title')}
        text={t('watermarkRemover.cardRight.text')}
        imageUrl="/watermark_remover/before-and-after-effect-of-removing-watermark-from-white-flower-image-in-AI-Ease.webp"
        alt="AI removing watermarks from scanned photos and graduation pictures"
      />

      <FAQSection
        title={t('watermarkRemover.faq.title')}
        faqs={FAQS}
      />

      <RelevantBlogs currentSlug="watermark-remover" />

      <TextSection
        title={t('watermarkRemover.seoText.title')}
        text={SEO_TEXT}
      />

      <OtherProducts currentSlug="watermark-remover" />
    </div>
  );
};

export default WatermarkRemover;
