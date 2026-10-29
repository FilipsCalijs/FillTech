import { useState, useRef, useEffect, useMemo } from 'react';

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// Deterministic waveform from URL string seed
function seedRandom(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return () => { h ^= h << 13; h ^= h >> 17; h ^= h << 5; return (h >>> 0) / 0xffffffff; };
}

const AudioPlayer = ({ src }) => {
  const audioRef              = useRef(null);
  const waveRef               = useRef(null);
  const rafRef                = useRef(null);
  const [playing,  setPlaying]  = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current,  setCurrent]  = useState(0);

  const BARS = 64;

  const heights = useMemo(() => {
    const rand = seedRandom(src ?? 'default');
    return Array.from({ length: BARS }, (_, i) => {
      const wave = Math.abs(Math.sin(i * 0.45) * 0.5 + Math.sin(i * 0.9) * 0.3);
      return 12 + wave * 55 + rand() * 20;
    });
  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onLoaded  = () => setDuration(audio.duration);
    const onTimeUpdate = () => {
      setCurrent(audio.currentTime);
      setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
    };
    const onEnded = () => { setPlaying(false); setProgress(0); setCurrent(0); };
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, [src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play(); setPlaying(true); }
  };

  const seek = (e) => {
    const rect = waveRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const audio = audioRef.current;
    if (audio && audio.duration) {
      audio.currentTime = ratio * audio.duration;
      setProgress(ratio);
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden bg-primary/10 dark:bg-primary/20 border border-primary/20 px-5 py-4">
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="flex items-center gap-4">
        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          className="shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          {playing ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1"/>
              <rect x="14" y="4" width="4" height="16" rx="1"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21"/>
            </svg>
          )}
        </button>

        {/* Waveform */}
        <div
          ref={waveRef}
          onClick={seek}
          className="flex-1 flex items-center gap-[2px] cursor-pointer h-12"
        >
          {heights.map((h, i) => {
            const played = (i / BARS) < progress;
            return (
              <div
                key={i}
                className="flex-1 rounded-full transition-all duration-75"
                style={{
                  height: `${h}%`,
                  background: played
                    ? 'var(--primary)'
                    : 'color-mix(in srgb, var(--primary) 30%, transparent)',
                  transform: playing && played ? `scaleY(${0.85 + Math.sin(Date.now() / 200 + i) * 0.15})` : 'scaleY(1)',
                }}
              />
            );
          })}
        </div>

        {/* Time */}
        <span className="shrink-0 text-xs font-mono text-muted-foreground tabular-nums">
          {formatTime(current)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
};

export default AudioPlayer;
