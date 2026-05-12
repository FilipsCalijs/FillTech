import { useState, useRef, useCallback } from 'react';
import { CONTAINER } from '@/config/sizes';
import ResultPanel from '@/components/ui/ResultPanel';

const API = 'http://localhost:5200';

const MODEL_PRESETS = [
  '/effects/08c7e346-b689-4a1f-b467-250c232c47b3-u1_c7a886ed-75b3-420d-a0c1-c4bc050f277f.jpeg',
  '/effects/b5ae8533-7804-4dad-9c04-6667a5f81317.png',
  '/effects/coloriezed.png',
];

const OUTFIT_PRESETS = [
  '/effects/ps_filters.png',
  '/effects/upcaler16_9.png',
  '/effects/upscaler.png',
];

const UploadZone = ({ label, preview, onFile, onPreset, presets, dragging, setDragging, fileRef }) => {
  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  }, [onFile, setDragging]);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-bold text-foreground text-center">{label}</h2>

      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 min-h-[280px] overflow-hidden
          ${dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-foreground/40 bg-muted/30'}
        `}
      >
        {preview ? (
          <img src={preview} alt="uploaded" className="w-full h-full object-contain max-h-[280px]" />
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 text-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-muted-foreground">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
              <line x1="14" y1="3" x2="14" y2="7"/>
              <line x1="12" y1="5" x2="16" y2="5"/>
            </svg>
            <span className="text-sm font-medium text-muted-foreground">Upload Image</span>
          </div>
        )}
        {preview && (
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
            <span className="text-white text-sm font-semibold">Click to change</span>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />

      <div>
        <p className="text-xs text-muted-foreground mb-2">Examples</p>
        <div className="grid grid-cols-3 gap-2">
          {presets.map((src, i) => (
            <button
              key={i}
              onClick={() => onPreset(src)}
              className={`rounded-xl overflow-hidden border-2 transition-all duration-200 aspect-[3/2]
                ${preview === src ? 'border-primary' : 'border-border hover:border-primary/60'}`}
            >
              <img src={src} alt={`preset ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const ClothesSwap = () => {
  const [modelFile,     setModelFile]     = useState(null);
  const [modelPreview,  setModelPreview]  = useState(null);
  const [outfitFile,    setOutfitFile]    = useState(null);
  const [outfitPreview, setOutfitPreview] = useState(null);
  const [outfitIsUrl,   setOutfitIsUrl]   = useState(false);
  const [modelDrag,     setModelDrag]     = useState(false);
  const [outfitDrag,    setOutfitDrag]    = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [resultUrl,     setResultUrl]     = useState(null);
  const [generationId,  setGenerationId]  = useState(null);
  const [error,         setError]         = useState(null);

  const modelRef  = useRef(null);
  const outfitRef = useRef(null);

  const handleModelFile = (f) => {
    setModelFile(f);
    setModelPreview(URL.createObjectURL(f));
    setResultUrl(null);
  };

  const handleOutfitFile = (f) => {
    setOutfitFile(f);
    setOutfitPreview(URL.createObjectURL(f));
    setOutfitIsUrl(false);
    setResultUrl(null);
  };

  const handleModelPreset = (src) => {
    setModelFile(null);
    setModelPreview(src);
    setResultUrl(null);
  };

  const handleOutfitPreset = (src) => {
    setOutfitFile(null);
    setOutfitPreview(src);
    setOutfitIsUrl(true);
    setResultUrl(null);
  };

  const canGenerate = modelPreview && outfitPreview && !loading;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);
    setResultUrl(null);

    try {
      const userUid = localStorage.getItem('userUID') || '';
      const form    = new FormData();

      // Model — always a file (either uploaded or we'll need to fetch preset)
      if (modelFile) {
        form.append('model', modelFile);
      } else {
        // fetch preset URL and convert to blob
        const blob = await fetch(modelPreview).then(r => r.blob());
        form.append('model', blob, 'model.jpg');
      }

      // Outfit — file or URL
      if (outfitFile) {
        form.append('outfit', outfitFile);
      } else if (outfitIsUrl) {
        form.append('outfit_url', outfitPreview);
      } else {
        const blob = await fetch(outfitPreview).then(r => r.blob());
        form.append('outfit', blob, 'outfit.jpg');
      }

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <UploadZone
          label="Step 1: Upload Your Model"
          preview={modelPreview}
          onFile={handleModelFile}
          onPreset={handleModelPreset}
          presets={MODEL_PRESETS}
          dragging={modelDrag}
          setDragging={setModelDrag}
          fileRef={modelRef}
        />
        <UploadZone
          label="Step 2: Select Your Outfit"
          preview={outfitPreview}
          onFile={handleOutfitFile}
          onPreset={handleOutfitPreset}
          presets={OUTFIT_PRESETS}
          dragging={outfitDrag}
          setDragging={setOutfitDrag}
          fileRef={outfitRef}
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
        ) : 'Generate'}
      </button>

      {resultUrl && (
        <ResultPanel
          referenceUrl={modelPreview}
          resultUrl={resultUrl}
          generationId={generationId}
        />
      )}
    </div>
  );
};

export default ClothesSwap;
