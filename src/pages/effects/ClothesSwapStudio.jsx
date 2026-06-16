import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ImagePlus, UserPlus, Sparkles, History as HistoryIcon, Plus, ArrowRight } from 'lucide-react';
import { CONTAINER } from '@/config/sizes';
import { cn } from '@/lib/utils';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { getButtonClasses } from '@/components/ui/Button/button.styles';
import ResultPanel from '@/components/ui/ResultPanel';
import PageSEO from '@/components/seo/PageSEO';
import LangLink from '@/components/routing/LangLink';
import OtherProducts from '@/lib/OtherProducts';
import { API_URL as API } from '@/config/api';
import { useAuthModal } from '@/contexts/AuthModalContext';

const MODEL_URLS = [
  'https://static.wavespeed.ai/examples/d2fc9d2482cf4cc28d915ae61e16eb02/1773776417433956840_AQfpxHQ0.jpeg',
  'https://static.wavespeed.ai/examples/73235a53b4e84309be65412267979d02/1773893458265591961_hHQZ9hqA.jpeg',
];
const OUTFIT_URLS = [
  'https://static.wavespeed.ai/examples/73235a53b4e84309be65412267979d02/1773893458265591961_hHQZ9hqA.jpeg',
];

/* ── Dropzone ────────────────────────────────────── */
const Dropzone = ({ label, icon, preview, onFile, fileRef, hint }) => {
  const [dragging, setDragging] = useState(false);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  }, [onFile]);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 min-h-[140px] overflow-hidden',
          dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-foreground/40 bg-muted/30'
        )}
      >
        {preview ? (
          <img src={preview} alt={label} className="w-full h-full object-contain max-h-[180px]" />
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
            {icon}
            <span className="text-xs text-muted-foreground">{hint}</span>
          </div>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
    </div>
  );
};

/* ── Page ────────────────────────────────────────── */
const ClothesSwapStudio = () => {
  const { t } = useTranslation('tools');
  const { t: tc } = useTranslation('common');
  const { requireAuth } = useAuthModal();

  const [garmentFile,    setGarmentFile]    = useState(null);
  const [garmentPreview, setGarmentPreview] = useState(null);
  const [modelFile,      setModelFile]      = useState(null);
  const [modelPreview,   setModelPreview]   = useState(null);
  const [loading,        setLoading]        = useState(false);
  const [resultUrl,      setResultUrl]      = useState(null);
  const [generationId,   setGenerationId]   = useState(null);
  const [error,          setError]          = useState(null);

  const garmentRef = useRef(null);
  const modelRef   = useRef(null);

  const handleGarmentFile = (f) => {
    setGarmentFile(f);
    setGarmentPreview(URL.createObjectURL(f));
    setResultUrl(null);
  };

  const handleModelFile = (f) => {
    setModelFile(f);
    setModelPreview(URL.createObjectURL(f));
    setResultUrl(null);
  };

  const handleClear = () => {
    setGarmentFile(null);
    setGarmentPreview(null);
    setModelFile(null);
    setModelPreview(null);
    setResultUrl(null);
    setGenerationId(null);
    setError(null);
  };

  const canGenerate = garmentFile && modelFile && !loading;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    if (!requireAuth()) return;
    setLoading(true);
    setError(null);
    setResultUrl(null);

    try {
      const userUid = localStorage.getItem('userUID') || '';
      const form    = new FormData();
      form.append('model', modelFile);
      form.append('outfit', garmentFile);

      const res  = await fetch(`${API}/api/tools/clothes-swap`, {
        method:  'POST',
        headers: { 'x-user-uid': userUid },
        body:    form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setResultUrl(data.imageUrl);
      setGenerationId(data.generationId ?? null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const garmentCount = garmentFile ? 1 : 0;
  const modelCount   = modelFile ? 1 : 0;
  const total        = garmentCount * modelCount * 1;

  return (
    <div className={`py-12 ${CONTAINER.blog}`}>
      <PageSEO title={t('seo.clothesSwapStudio.title')} description={t('seo.clothesSwapStudio.desc')} path="/tools/clothes-swap/studio" />

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8">
        {/* Sidebar */}
        <Card variant="elevated" bordered="disable" padding="md" className="flex flex-col gap-5 h-fit">
          <Dropzone
            label={t('clothes.studio.uploadGarment')}
            icon={<ImagePlus className="w-6 h-6 text-muted-foreground" />}
            preview={garmentPreview}
            onFile={handleGarmentFile}
            fileRef={garmentRef}
            hint={t('clothes.studio.fileHint')}
          />

          <button
            type="button"
            disabled
            className={cn(getButtonClasses('outline', 'sm'), 'w-full justify-center opacity-50 cursor-not-allowed')}
          >
            {t('clothes.studio.chooseFromLibrary')}
          </button>

          <label className="flex items-start gap-2 text-xs text-muted-foreground opacity-50 cursor-not-allowed">
            <input type="checkbox" disabled className="mt-0.5" />
            <span>{t('clothes.studio.revealing')}</span>
          </label>

          <Dropzone
            label={t('clothes.studio.uploadModel')}
            icon={<UserPlus className="w-6 h-6 text-muted-foreground" />}
            preview={modelPreview}
            onFile={handleModelFile}
            fileRef={modelRef}
            hint={t('clothes.studio.fileHint')}
          />

          {/* Extra notes - cosmetic only */}
          <div className="opacity-50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold">{t('clothes.studio.extraNotes')}</span>
              <span className="text-xs text-muted-foreground">{t('clothes.studio.optional')}</span>
            </div>
            <textarea
              disabled
              rows={3}
              placeholder={t('clothes.studio.extraNotesPlaceholder')}
              className="w-full rounded-lg border border-border bg-muted/30 p-2 text-xs cursor-not-allowed resize-none"
            />
            <button
              type="button"
              disabled
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border border-border cursor-not-allowed"
            >
              <Sparkles className="w-3 h-3" /> {t('clothes.studio.aiEnhance')}
            </button>
          </div>

          {/* Aspect ratio - cosmetic only */}
          <div className="opacity-50">
            <span className="text-sm font-semibold block mb-2">{t('clothes.studio.aspectRatio')}</span>
            <div className="flex gap-2 flex-wrap">
              {[t('clothes.studio.auto'), '1:1', '3:4', '9:16'].map((label, i) => (
                <button
                  key={label}
                  type="button"
                  disabled
                  className={cn(
                    'px-3 py-1.5 rounded-lg border text-xs cursor-not-allowed',
                    i === 0 ? 'border-primary text-primary' : 'border-border text-muted-foreground'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Resolution - cosmetic only */}
          <div className="opacity-50">
            <span className="text-sm font-semibold block mb-2">{t('clothes.studio.resolution')}</span>
            <div className="flex gap-2">
              {['2K', '4K'].map((label, i) => (
                <button
                  key={label}
                  type="button"
                  disabled
                  className={cn(
                    'px-3 py-1.5 rounded-lg border text-xs cursor-not-allowed',
                    i === 0 ? 'border-primary text-primary' : 'border-border text-muted-foreground'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Output count - cosmetic only */}
          <div className="opacity-50">
            <span className="text-sm font-semibold block mb-2">{t('clothes.studio.outputCount')}</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled
                  className={cn(
                    'w-9 h-9 rounded-lg border text-xs cursor-not-allowed',
                    n === 1 ? 'border-primary text-primary' : 'border-border text-muted-foreground'
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {t('clothes.studio.formula', { g: garmentCount, m: modelCount, n: 1, total })}
          </p>

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <div className="flex gap-3 mt-auto">
            <button
              type="button"
              onClick={handleClear}
              className={cn(getButtonClasses('outline', 'md'), 'flex-1')}
            >
              {t('clothes.studio.clear')}
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate}
              className={cn(getButtonClasses('gold', 'md'), 'flex-[2] disabled:opacity-40 disabled:cursor-not-allowed')}
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : t('actions.generate')}
            </button>
          </div>
        </Card>

        {/* Main area */}
        <div className="flex flex-col gap-6">
          <div className="flex justify-end">
            <LangLink
              to="/history"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <HistoryIcon className="w-4 h-4" />
              {tc('nav.history')}
            </LangLink>
          </div>

          <div className="flex flex-col items-center text-center gap-3">
            <Typography variant="h2">{t('clothes.heroTitle')}</Typography>
            <Typography variant="lead" color="muted" className="max-w-2xl">
              {t('clothes.heroSubtitle')}
            </Typography>
          </div>

          {resultUrl ? (
            <ResultPanel referenceUrl={modelPreview} resultUrl={resultUrl} generationId={generationId} />
          ) : (
            <Card variant="elevated" bordered="disable" padding="lg">
              <div className="flex items-center justify-center gap-4 md:gap-8 flex-wrap">
                <img src={OUTFIT_URLS[0]} alt="garment" className="w-28 md:w-40 aspect-[3/4] object-cover rounded-xl" />
                <Plus className="w-6 h-6 text-muted-foreground shrink-0" />
                <img src={MODEL_URLS[0]} alt="model" className="w-28 md:w-40 aspect-[3/4] object-cover rounded-xl" />
                <ArrowRight className="w-6 h-6 text-muted-foreground shrink-0" />
                <img src={MODEL_URLS[1]} alt="result" className="w-28 md:w-40 aspect-[3/4] object-cover rounded-xl" />
              </div>
            </Card>
          )}
        </div>
      </div>

      <OtherProducts currentSlug="clothes-swap" />
    </div>
  );
};

export default ClothesSwapStudio;
