import { useState, useRef, useEffect } from 'react';
import { POSES } from '@/config/portraitPrompts';
import PoseModal from './PoseModal';

const STYLES = ['No style', 'Photographic', 'Cinematic', 'Disney', 'Digital Art', 'Anime', 'Oil Painting'];
const RATIOS = ['1:1', '3:2', '2:3', '4:3', '3:4', '16:9', '9:16', '4:5', '5:4', '21:9'];
const MAX    = 800;

const pillBase   = 'border border-border text-foreground bg-transparent hover:border-foreground/60 transition-all duration-200';
const pillActive = 'bg-primary text-primary-foreground border-primary';

const PortraitControls = ({ onGenerate, loading, fileSelected }) => {
  const [gender,      setGender]      = useState('Woman');
  const [style,       setStyle]       = useState('No style');
  const [prompt,      setPrompt]      = useState('');
  const [poseId,      setPoseId]      = useState(null);
  const [poseOpen,    setPoseOpen]    = useState(false);
  const [ratio,       setRatio]       = useState('1:1');
  const [ratioOpen,   setRatioOpen]   = useState(false);
  const ratioRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ratioRef.current && !ratioRef.current.contains(e.target)) setRatioOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const scroll = (dir) => scrollRef.current?.scrollBy({ left: dir * 140, behavior: 'smooth' });

  const handleClick = () => {
    if (fileSelected) onGenerate?.({ prompt, gender, style, poseId, ratio });
  };

  const selectedPose = POSES.find(p => p.id === poseId);

  return (
    <div className="flex flex-col gap-6 w-full">

      {/* GENDER */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-muted-foreground">Gender</span>
          <span className="text-xs text-muted-foreground">Pick one</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {['Woman', 'Man'].map(g => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className={`py-3 rounded-full text-sm font-semibold ${gender === g ? pillActive : pillBase}`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* STYLE */}
      <div>
        <div className="mb-3">
          <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-muted-foreground">Style</span>
        </div>
        <div className="relative flex items-center gap-2">
          <button
            onClick={() => scroll(-1)}
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground/60 transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {STYLES.map(s => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${style === s ? pillActive : pillBase}`}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            onClick={() => scroll(1)}
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground/60 transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      {/* PROMPT */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-muted-foreground">Prompt</span>
          <span className="text-xs text-muted-foreground">{prompt.length} / {MAX}</span>
        </div>
        <textarea
          value={prompt}
          onChange={e => e.target.value.length <= MAX && setPrompt(e.target.value)}
          rows={4}
          placeholder=""
          className="w-full rounded-xl border border-border bg-transparent text-foreground px-4 py-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-foreground/30 transition-all"
        />
      </div>

      {/* BODY POSE + ASPECT RATIO */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-muted-foreground">Body Pose</span>
          <span className="text-xs text-muted-foreground">Optional</span>
        </div>
        <div className="flex gap-2 items-stretch">
          {/* Pose button */}
          <button
            onClick={() => setPoseOpen(true)}
            className="flex-1 flex items-center justify-between px-4 py-3 rounded-xl border border-dashed border-border text-foreground hover:border-foreground/60 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-muted-foreground">
                <circle cx="12" cy="5" r="2"/>
                <path d="M12 7v6M9 10l-2 4M15 10l2 4M9 22l3-5 3 5"/>
              </svg>
              <span className={`text-sm ${poseId ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {selectedPose ? selectedPose.name : 'Add pose'}
              </span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>

          {/* Aspect ratio icon button */}
          <div ref={ratioRef} className="relative">
            <button
              onClick={() => setRatioOpen(v => !v)}
              title={`Aspect ratio: ${ratio}`}
              className={`h-full px-3 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-1
                ${ratioOpen ? 'border-foreground bg-foreground/5' : 'border-border hover:border-foreground/60'}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-muted-foreground">
                <rect x="3" y="5" width="18" height="14" rx="2"/>
                <path d="M3 9h18M9 5v14"/>
              </svg>
              <span className="text-[10px] text-muted-foreground font-mono leading-none">{ratio}</span>
            </button>

            {ratioOpen && (
              <div className="absolute right-0 bottom-full mb-2 bg-card border border-border rounded-xl shadow-lg p-2 z-20 min-w-[100px]">
                {RATIOS.map(r => (
                  <button
                    key={r}
                    onClick={() => { setRatio(r); setRatioOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm font-mono transition-colors
                      ${ratio === r ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* GENERATE BUTTON */}
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full py-4 rounded-full bg-primary text-primary-foreground font-bold text-xs tracking-[0.16em] uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-all duration-200 disabled:opacity-50"
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
            {fileSelected ? 'Generate' : 'Add a photo to generate'}
          </>
        )}
      </button>

      {poseOpen && (
        <PoseModal
          selected={poseId}
          onSelect={setPoseId}
          onClose={() => setPoseOpen(false)}
        />
      )}
    </div>
  );
};

export default PortraitControls;
