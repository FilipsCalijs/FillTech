import { useState, useRef, useCallback } from 'react';
import { Typography } from '@/components/ui/Typography';
import { CONTAINER } from '@/config/sizes';
import PortraitControls from '@/components/portrait/PortraitControls';
import { buildPrompt } from '@/config/portraitPrompts';
import { useTranslation } from 'react-i18next';
import PageSEO from '@/components/seo/PageSEO';
import ResultPanel from '@/components/ui/ResultPanel';

const API = 'http://localhost:5200';

const AiPortrait = () => {
  const { t } = useTranslation('tools');
  const [file,      setFile]      = useState(null);
  const [preview,   setPreview]   = useState(null);
  const [dragging,  setDragging]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [resultUrl,    setResultUrl]    = useState(null);
  const [generationId, setGenerationId] = useState(null);
  const [error,        setError]        = useState(null);
  const fileRef = useRef(null);

  const MAX_MB   = 22;
  const MAX_SIZE = MAX_MB * 1024 * 1024;

  const pickFile = (f) => {
    if (!f) return;
    if (f.size > MAX_SIZE) {
      setError(`Image too large: ${(f.size / 1024 / 1024).toFixed(1)} MB. Max ${MAX_MB} MB.`);
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResultUrl(null);
    setError(null);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files?.[0]);
  }, []);

  const handleGenerate = async ({ prompt, gender, style, poseId, ratio }) => {
    if (!file) return;
    const fullPrompt = buildPrompt({ gender, style, userPrompt: prompt, poseId });
    setLoading(true);
    setError(null);
    setResultUrl(null);

    try {
      const form = new FormData();
      form.append('image', file);
      form.append('prompt', fullPrompt);
      form.append('aspect_ratio', ratio ?? '1:1');

      const userUid = localStorage.getItem('userUID') || '';
      const res  = await fetch(`${API}/api/tools/portrait`, {
        method: 'POST',
        headers: { 'x-user-uid': userUid },
        body: form,
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
      <PageSEO title={t('seo.portrait.title')} description={t('seo.portrait.desc')} path="/tools/portrait" />
      <Typography variant="h2" weight="bold" className="block mb-2">{t('portrait.title')}</Typography>
      <Typography variant="lead" color="muted" className="block mb-10">{t('portrait.subtitle')}</Typography>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* LEFT — photo drop zone */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-muted-foreground">{t('upload.yourPhoto')}</span>
            <span className="text-xs text-muted-foreground">{t('upload.uploadOrPick')}</span>
          </div>

          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 min-h-[420px]
              ${dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-foreground/40'}
            `}
          >
            {preview ? (
              <img src={preview} alt="Your photo" className="max-w-full max-h-[420px] object-contain rounded-xl" />
            ) : (
              <div className="flex flex-col items-center gap-4 px-8 text-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <div>
                  <p className="text-lg font-bold text-foreground mb-1">{t('upload.dropPhoto')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('upload.orClick')} · {t('upload.jpgPng')} · {t('upload.selfieHint')}
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {[t('portrait.stylesHint'), t('portrait.poseRef')].map(tag => (
                    <span key={tag} className="text-xs border border-border rounded-full px-3 py-1 text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Replace photo overlay */}
            {preview && (
              <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm font-semibold">{t('upload.clickToChange')}</span>
              </div>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => pickFile(e.target.files?.[0])}
          />
          <p className="text-xs text-muted-foreground mt-1">{t('upload.jpgPng')} · max {MAX_MB} MB</p>
        </div>

        {/* RIGHT — controls */}
        <PortraitControls
          onGenerate={handleGenerate}
          loading={loading}
          fileSelected={!!file}
        />
      </div>

      {error && (
        <p className="mt-6 text-red-500 text-sm text-center">{error}</p>
      )}

      {resultUrl && (
        <ResultPanel
          referenceUrl={preview}
          resultUrl={resultUrl}
          generationId={generationId}
        />
      )}
    </div>
  );
};

export default AiPortrait;
