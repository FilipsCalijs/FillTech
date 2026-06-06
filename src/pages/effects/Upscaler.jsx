import { useState, useRef, useCallback } from 'react';
import { Typography } from '@/components/ui/Typography';
import { CONTAINER } from '@/config/sizes';
import { useTranslation } from 'react-i18next';
import PageSEO from '@/components/seo/PageSEO';
import OtherProducts from '@/lib/OtherProducts';
import { Construction } from 'lucide-react';

const MAX_MB   = 22;
const MAX_SIZE = MAX_MB * 1024 * 1024;

const SCALES = ['2×', '4×'];

const Upscaler = () => {
  const { t } = useTranslation('tools');
  const [,         setFile]     = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [dragging, setDragging] = useState(false);
  const [scale,    setScale]    = useState('4×');
  const [error,    setError]    = useState(null);
  const fileRef = useRef(null);

  const pickFile = (f) => {
    if (!f) return;
    if (f.size > MAX_SIZE) {
      setError(`Image too large: ${(f.size / 1024 / 1024).toFixed(1)} MB. Max ${MAX_MB} MB.`);
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files?.[0]);
  }, []);

  return (
    <div className={`py-12 ${CONTAINER.blog}`}>
      <PageSEO title={t('seo.upscaler.title')} description={t('seo.upscaler.desc')} path="/tools/upscaler" />
      <Typography variant="h2" weight="bold" className="block mb-2">{t('upscaler.title')}</Typography>
      <Typography variant="lead" color="muted" className="block mb-6">{t('upscaler.subtitle')}</Typography>

      {/* Coming soon banner */}
      <div className="mb-10 flex items-center gap-3 rounded-xl border border-yellow-400/40 bg-yellow-400/10 px-5 py-4">
        <Construction size={20} className="text-yellow-400 shrink-0" />
        <p className="text-sm text-yellow-400 font-medium">{t('upscaler.inDevelopment')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* LEFT — drop zone */}
        <div className="flex flex-col gap-3">
          <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-muted-foreground">
            {t('upload.yourPhoto')}
          </span>

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
                  <p className="text-sm text-muted-foreground">{t('upscaler.lowResHint')}</p>
                </div>
              </div>
            )}

            {preview && (
              <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm font-semibold">{t('upload.clickToChange')}</span>
              </div>
            )}
          </div>

          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => pickFile(e.target.files?.[0])} />
          <p className="text-xs text-muted-foreground">{t('upload.jpgPng')} · max {MAX_MB} MB</p>
        </div>

        {/* RIGHT — scale + generate */}
        <div className="flex flex-col gap-6">

          <div>
            <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-muted-foreground block mb-3">
              {t('upscaler.scale')}
            </span>
            <div className="grid grid-cols-2 gap-3">
              {SCALES.map(s => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  className={`py-3 rounded-full text-sm font-semibold transition-all duration-200
                    ${scale === s
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border text-foreground hover:border-foreground/60'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Real-ESRGAN</p>
            <p>{t('upscaler.esrganDesc')}</p>
          </div>

          <button
            disabled
            className="w-full py-4 rounded-full bg-muted text-muted-foreground font-bold text-xs tracking-[0.16em] uppercase cursor-not-allowed opacity-60"
          >
            {t('upscaler.upscaleButton')}
          </button>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </div>
      <OtherProducts currentSlug="upscaler" />
    </div>
  );
};

export default Upscaler;
