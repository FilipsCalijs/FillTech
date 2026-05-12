import { useState, useRef, useCallback } from 'react';
import { Typography } from '@/components/ui/Typography';
import { CONTAINER } from '@/config/sizes';
import ResultPanel from '@/components/ui/ResultPanel';

const API = 'http://localhost:5200';
const MAX_MB   = 22;
const MAX_SIZE = MAX_MB * 1024 * 1024;

const PhotoColorize = () => {
  const [file,         setFile]         = useState(null);
  const [preview,      setPreview]      = useState(null);
  const [dragging,     setDragging]     = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [resultUrl,    setResultUrl]    = useState(null);
  const [generationId, setGenerationId] = useState(null);
  const [error,        setError]        = useState(null);
  const fileRef = useRef(null);

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

  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResultUrl(null);

    try {
      const userUid = localStorage.getItem('userUID') || '';
      const form    = new FormData();
      form.append('image', file);

      const res  = await fetch(`${API}/api/tools/photo-colorize`, {
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
      <Typography variant="h2" weight="bold" className="block mb-2">
        Photo Colorizer
      </Typography>
      <Typography variant="body1" color="muted" className="block mb-10">
        Bring black-and-white photos to life with AI-powered colorization.
      </Typography>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* LEFT — drop zone */}
        <div className="flex flex-col gap-3">
          <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-muted-foreground">
            Your Photo
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
                  <p className="text-lg font-bold text-foreground mb-1">Drop your photo</p>
                  <p className="text-sm text-muted-foreground">Black & white or grayscale images work best</p>
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

        {/* RIGHT — info + generate */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4">
            <Typography variant="h4" weight="semibold">How it works</Typography>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              {[
                'Upload a black & white or grayscale photo',
                'AI analyzes the scene and adds realistic colors',
                'Download the colorized result in full quality',
              ].map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold mt-0.5">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !file}
            className="w-full py-4 rounded-full bg-primary text-primary-foreground font-bold text-xs tracking-[0.16em] uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Colorizing…
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                </svg>
                {file ? 'Colorize Photo' : 'Upload a photo first'}
              </>
            )}
          </button>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </div>

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

export default PhotoColorize;
