import { useState, useRef, useCallback } from 'react';
import { Typography } from '@/components/ui/Typography';
import { CONTAINER } from '@/config/sizes';

const MAX_MB   = 22;
const MAX_SIZE = MAX_MB * 1024 * 1024;

const SCALES = ['2×', '4×'];

const Upscaler = () => {
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
      <Typography variant="h2" weight="bold" className="block mb-2">
        AI Upscaler
      </Typography>
      <Typography variant="body1" color="muted" className="block mb-10">
        Upscale images up to 4× without losing quality.
      </Typography>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* LEFT — drop zone */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-muted-foreground">Your Photo</span>
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
                  <p className="text-lg font-bold text-foreground mb-1">Drop your photo</p>
                  <p className="text-sm text-muted-foreground">JPG or PNG · low-res images work best</p>
                </div>
              </div>
            )}

            {preview && (
              <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm font-semibold">Click to change photo</span>
              </div>
            )}
          </div>

          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => pickFile(e.target.files?.[0])} />
          <p className="text-xs text-muted-foreground">JPG or PNG · max {MAX_MB} MB</p>
        </div>

        {/* RIGHT — scale + generate */}
        <div className="flex flex-col gap-6">

          {/* Scale selector */}
          <div>
            <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-muted-foreground block mb-3">
              Scale
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

          {/* Info card */}
          <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Real-ESRGAN</p>
            <p>Upscales images using AI super-resolution. Recovers fine details, removes compression artifacts, and sharpens edges.</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              <span>Backend coming soon</span>
            </div>
          </div>

          <button
            disabled
            className="w-full py-4 rounded-full bg-muted text-muted-foreground font-bold text-xs tracking-[0.16em] uppercase cursor-not-allowed opacity-60"
          >
            Upscale Image
          </button>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default Upscaler;
