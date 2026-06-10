import { useState, useRef, useCallback } from 'react';
import { CONTAINER } from '@/config/sizes';
import ResultPanel from '@/components/ui/ResultPanel';
import { useTranslation } from 'react-i18next';
import PageSEO from '@/components/seo/PageSEO';
import OtherProducts from '@/lib/OtherProducts';
import RelevantBlogs from '@/components/ui/RelevantBlogs';
import { API_URL as API } from '@/config/api';

const MODEL_URLS = [
  'https://static.wavespeed.ai/examples/d2fc9d2482cf4cc28d915ae61e16eb02/1773776417433956840_AQfpxHQ0.jpeg',
  'https://static.wavespeed.ai/examples/73235a53b4e84309be65412267979d02/1773893458265591961_hHQZ9hqA.jpeg',
  'https://placehold.co/300x400/e8e8e8/555?text=Man',
];
const OUTFIT_URLS = [
  'https://static.wavespeed.ai/examples/73235a53b4e84309be65412267979d02/1773893458265591961_hHQZ9hqA.jpeg',
  'https://placehold.co/300x400/f0f0f0/555?text=Outfit+2',
  'https://placehold.co/300x400/e4e4e4/555?text=Outfit+3',
];

/* ── Upload zone ─────────────────────────────────── */
const UploadZone = ({ label, preview, previewUrl, onFile, onPreset, presets, fileRef, t }) => {
  const [dragging, setDragging] = useState(false);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  }, [onFile]);

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-base font-bold text-foreground text-center">{label}</h2>

      {/* Drop zone */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 min-h-[260px] overflow-hidden
          ${dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-foreground/40 bg-muted/30'}
        `}
      >
        {preview ? (
          <img src={preview} alt="selected" className="w-full h-full object-contain max-h-[260px]" />
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 text-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-muted-foreground">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
              <line x1="14" y1="3" x2="14" y2="7"/><line x1="12" y1="5" x2="16" y2="5"/>
            </svg>
            <span className="text-sm font-medium text-muted-foreground">{t('clothes.uploadImage')}</span>
          </div>
        )}
        {preview && (
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
            <span className="text-white text-sm font-semibold">{t('clothes.clickToChange')}</span>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />

      {/* Presets */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">{t('clothes.examples')}</p>
        <div className="grid grid-cols-3 gap-2">
          {presets.map((p) => (
            <button
              key={p.url}
              onClick={() => onPreset(p.url)}
              className={`rounded-xl overflow-hidden border-2 transition-all duration-200 aspect-[3/4]
                ${previewUrl === p.url ? 'border-primary' : 'border-border hover:border-primary/60'}`}
            >
              <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Page ────────────────────────────────────────── */
const ClothesSwap = () => {
  const { t } = useTranslation('tools');
  const MODEL_PRESETS = [
    { label: t('clothes.woman'),       url: MODEL_URLS[0] },
    { label: t('clothes.woman') + ' 2', url: MODEL_URLS[1] },
    { label: t('clothes.man'),         url: MODEL_URLS[2] },
  ];
  const OUTFIT_PRESETS = [
    { label: t('clothes.uploadImage'), url: OUTFIT_URLS[0] },
    { label: t('clothes.step2') + ' 2', url: OUTFIT_URLS[1] },
    { label: t('clothes.step2') + ' 3', url: OUTFIT_URLS[2] },
  ];
  const [modelFile,     setModelFile]     = useState(null);
  const [modelPreview,  setModelPreview]  = useState(null);
  const [modelUrl,      setModelUrl]      = useState(null);
  const [outfitFile,    setOutfitFile]    = useState(null);
  const [outfitPreview, setOutfitPreview] = useState(null);
  const [outfitUrl,     setOutfitUrl]     = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [resultUrl,     setResultUrl]     = useState(null);
  const [generationId,  setGenerationId]  = useState(null);
  const [error,         setError]         = useState(null);

  const modelRef  = useRef(null);
  const outfitRef = useRef(null);

  const handleModelFile = (f) => {
    setModelFile(f);
    setModelPreview(URL.createObjectURL(f));
    setModelUrl(null);
    setResultUrl(null);
  };

  const handleOutfitFile = (f) => {
    setOutfitFile(f);
    setOutfitPreview(URL.createObjectURL(f));
    setOutfitUrl(null);
    setResultUrl(null);
  };

  const handleModelPreset = (url) => {
    setModelFile(null);
    setModelPreview(url);
    setModelUrl(url);
    setResultUrl(null);
  };

  const handleOutfitPreset = (url) => {
    setOutfitFile(null);
    setOutfitPreview(url);
    setOutfitUrl(url);
    setResultUrl(null);
  };

  const canGenerate = (modelFile || modelUrl) && (outfitFile || outfitUrl) && !loading;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);
    setResultUrl(null);

    try {
      const userUid = localStorage.getItem('userUID') || '';
      const form    = new FormData();

      if (modelFile)  form.append('model', modelFile);
      else            form.append('model_url', modelUrl);

      if (outfitFile) form.append('outfit', outfitFile);
      else            form.append('outfit_url', outfitUrl);

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

  return (
    <div className={`py-12 ${CONTAINER.blog}`}>
      <PageSEO title={t('seo.clothesSwap.title')} description={t('seo.clothesSwap.desc')} path="/tools/clothes-swap" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <UploadZone
          label={t('clothes.step1')}
          preview={modelPreview}
          previewUrl={modelUrl}
          onFile={handleModelFile}
          onPreset={handleModelPreset}
          presets={MODEL_PRESETS}
          fileRef={modelRef}
          t={t}
        />
        <UploadZone
          label={t('clothes.step2')}
          preview={outfitPreview}
          previewUrl={outfitUrl}
          onFile={handleOutfitFile}
          onPreset={handleOutfitPreset}
          presets={OUTFIT_PRESETS}
          fileRef={outfitRef}
          t={t}
        />
      </div>

      {error && <p className="mt-6 text-red-500 text-sm text-center">{error}</p>}

      <button
        onClick={handleGenerate}
        disabled={!canGenerate}
        className="mt-8 w-full py-4 rounded-full bg-primary text-primary-foreground font-bold text-sm tracking-widest uppercase transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Generating…
          </>
        ) : t('actions.generate')}
      </button>

      {resultUrl && (
        <ResultPanel
          referenceUrl={modelPreview}
          resultUrl={resultUrl}
          generationId={generationId}
        />
      )}
      <RelevantBlogs currentSlug="clothes-swap" />
      <OtherProducts currentSlug="clothes-swap" />
    </div>
  );
};

export default ClothesSwap;
