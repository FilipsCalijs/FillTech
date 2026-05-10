import { useState, useRef, useCallback } from 'react';
import { Typography } from '@/components/ui/Typography';
import { CONTAINER } from '@/config/sizes';
import { PS2_STYLES, buildPs2Prompt } from '@/config/ps2Prompts';
import ResultPanel from '@/components/ui/ResultPanel';

const API = 'http://localhost:5200';

const RATIOS = ['1:1', '3:2', '2:3', '4:3', '3:4', '16:9', '9:16', '4:5', '5:4', '21:9'];

const Ps2Filter = () => {
  const [file,       setFile]       = useState(null);
  const [preview,    setPreview]    = useState(null);
  const [dragging,   setDragging]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [resultUrl,    setResultUrl]    = useState(null);
  const [generationId, setGenerationId] = useState(null);
  const [error,        setError]        = useState(null);
  const [styleId,    setStyleId]    = useState('ps2');
  const [ratio,      setRatio]      = useState('1:1');
  const [ratioOpen,  setRatioOpen]  = useState(false);
  const fileRef  = useRef(null);
  const ratioRef = useRef(null);

  const pickFile = (f) => {
    if (!f) return;
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
      const prompt  = buildPs2Prompt({ styleId });
      const userUid = localStorage.getItem('userUID') || '';
      const form    = new FormData();
      form.append('image', file);
      form.append('prompt', prompt);
      form.append('aspect_ratio', ratio);

      const res  = await fetch(`${API}/api/tools/ps2-filter`, {
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
        Game Filter
      </Typography>
      <Typography variant="body1" color="muted" className="block mb-10">
        Transform any photo into a video game screenshot — from 8-bit to modern AAA.
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
                  <p className="text-sm text-muted-foreground">JPG or PNG · any scene works best</p>
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
        </div>

        {/* RIGHT — controls */}
        <div className="flex flex-col gap-6">

          {/* STYLE */}
          <div>
            <div className="mb-3">
              <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-muted-foreground">Choose Style</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {PS2_STYLES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setStyleId(s.id)}
                  className={`flex flex-col rounded-lg overflow-hidden border-2 transition-all duration-200 text-left
                    ${styleId === s.id ? 'border-primary' : 'border-border hover:border-foreground/40'}`}
                >
                  <img src={s.image} alt={s.name} className="w-full aspect-[4/3] object-cover" />
                  <div className={`px-1.5 py-1 text-[11px] font-semibold transition-colors leading-none ${styleId === s.id ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground'}`}>
                    {s.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ASPECT RATIO */}
          <div>
            <div className="mb-3">
              <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-muted-foreground">Aspect Ratio</span>
            </div>
            <div ref={ratioRef} className="relative inline-block">
              <button
                onClick={() => setRatioOpen(v => !v)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200
                  ${ratioOpen ? 'border-foreground bg-foreground/5' : 'border-border hover:border-foreground/60'}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-muted-foreground">
                  <rect x="3" y="5" width="18" height="14" rx="2"/>
                  <path d="M3 9h18M9 5v14"/>
                </svg>
                <span className="text-sm font-mono text-foreground">{ratio}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`text-muted-foreground transition-transform ${ratioOpen ? 'rotate-180' : ''}`}>
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>

              {ratioOpen && (
                <div className="absolute left-0 top-full mt-2 bg-card border border-border rounded-xl shadow-lg p-2 z-20 grid grid-cols-2 gap-1 min-w-[160px]">
                  {RATIOS.map(r => (
                    <button
                      key={r}
                      onClick={() => { setRatio(r); setRatioOpen(false); }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-mono transition-colors
                        ${ratio === r ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* GENERATE */}
          <button
            onClick={handleGenerate}
            disabled={loading || !file}
            className="w-full py-4 rounded-full bg-primary text-primary-foreground font-bold text-xs tracking-[0.16em] uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-all duration-200 disabled:opacity-50 mt-auto"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                </svg>
                {file ? 'Apply Filter' : 'Add a photo to apply'}
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

export default Ps2Filter;
