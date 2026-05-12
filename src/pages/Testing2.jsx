import { useState, useRef, useCallback } from 'react';
import { CONTAINER } from '@/config/sizes';
import AudioPlayer from '@/components/ui/AudioPlayer';

const API = 'http://localhost:5200';

const VoiceCloning = () => {
  const [text,     setText]     = useState('');
  const [file,     setFile]     = useState(null);
  const [dragging, setDragging] = useState(false);
  const [speed,    setSpeed]    = useState(1.0);
  const [loading,  setLoading]  = useState(false);
  const [results,  setResults]  = useState([]); // [{ url, ts }]
  const [error,    setError]    = useState(null);
  const fileRef = useRef(null);

  const pickFile = (f) => { if (f) { setFile(f); setError(null); } };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files?.[0]);
  }, []);

  const handleGenerate = async () => {
    if (!text.trim() || !file) return;
    setLoading(true);
    setError(null);
    setAudioUrl(null);

    try {
      const userUid = localStorage.getItem('userUID') || '';
      const form = new FormData();
      form.append('audio', file);
      form.append('text', text);
      form.append('speed', speed);

      const res  = await fetch(`${API}/api/tools/voice-clone`, {
        method:  'POST',
        headers: { 'x-user-uid': userUid },
        body:    form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setResults(prev => [{ url: data.audioUrl, ts: new Date() }, ...prev]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const canGenerate = text.trim().length > 0 && file && !loading;

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const fmtLabel = (ts) => {
    const h = ts.getHours().toString().padStart(2,'0');
    const m = ts.getMinutes().toString().padStart(2,'0');
    return `${ts.getDate()} ${MONTHS[ts.getMonth()]} ${h}:${m}`;
  };

  return (
    <div className={`py-10 ${CONTAINER.blog}`}>
      <h1 className="text-2xl font-bold text-foreground mb-8">Voice Cloning</h1>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px]">

          {/* LEFT — text */}
          <div className="p-8 border-b border-border lg:border-b-0 lg:border-r flex flex-col gap-3">
            <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-muted-foreground">
              Enter your text
            </span>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Type or paste the text you want to convert to speech…"
              rows={14}
              className="w-full rounded-2xl border border-border bg-transparent text-foreground px-5 py-4 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-foreground/30 transition-all"
            />
          </div>

          {/* RIGHT — voice upload + speed + generate */}
          <div className="p-6 flex flex-col gap-5">

            {/* Voice upload */}
            <div className="flex flex-col gap-2 flex-1">
              <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-muted-foreground">
                Voice sample <span className="normal-case font-normal">(3–10 sec)</span>
              </span>
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={`flex-1 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer min-h-[200px] transition-all duration-200
                  ${dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-foreground/40'}`}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground mb-3">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                {file ? (
                  <p className="text-sm font-medium text-foreground text-center px-3 break-all">{file.name}</p>
                ) : (
                  <>
                    <p className="text-sm font-medium text-foreground mb-1">Drag and drop</p>
                    <p className="text-xs text-muted-foreground">MP3, WAV, M4A</p>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={e => pickFile(e.target.files?.[0])} />
            </div>

            {/* Speed */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-muted-foreground">Speed</span>
                <span className="text-sm font-mono text-foreground">{speed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={2.0}
                step={0.1}
                value={speed}
                onChange={e => setSpeed(parseFloat(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            {/* Generate */}
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full py-3.5 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2
                bg-primary text-primary-foreground hover:opacity-90
                disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
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
          </div>
        </div>

        {/* Results list */}
        {results.length > 0 && (
          <div className="border-t border-border px-8 py-6 flex flex-col gap-6">
            {results.map((r, i) => (
              <div key={r.url} className="flex flex-col gap-3">
                <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-muted-foreground">
                  {i === 0 ? 'Current' : fmtLabel(r.ts)}
                </span>
                <AudioPlayer src={r.url} />
                <div className="flex gap-3">
                  <a
                    href={r.url}
                    download="voice-clone.mp3"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-foreground hover:border-foreground/40 transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download
                  </a>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-foreground hover:border-foreground/40 transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                    Open URL
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceCloning;
