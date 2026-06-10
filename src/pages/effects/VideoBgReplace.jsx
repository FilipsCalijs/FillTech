import { useState, useRef, useCallback } from 'react';
import { Typography } from '@/components/ui/Typography';
import { CONTAINER } from '@/config/sizes';
import { useTranslation } from 'react-i18next';
import PageSEO from '@/components/seo/PageSEO';
import OtherProducts from '@/lib/OtherProducts';
import RelevantBlogs from '@/components/ui/RelevantBlogs';
import { API_URL as API } from '@/config/api';

const MAX_MB = 500;

const VideoBgReplace = () => {
  const { t } = useTranslation('tools');
  const [videoFile,    setVideoFile]    = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [bgFile,       setBgFile]       = useState(null);
  const [bgPreview,    setBgPreview]    = useState(null);
  const [bgDrag,       setBgDrag]       = useState(false);
  const [videoDrag,    setVideoDrag]    = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [resultUrl,    setResultUrl]    = useState(null);
  const [error,        setError]        = useState(null);

  const videoRef = useRef(null);
  const bgRef    = useRef(null);

  const pickVideo = (f) => {
    if (!f) return;
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`Video too large: ${(f.size / 1024 / 1024).toFixed(0)} MB. Max ${MAX_MB} MB.`);
      return;
    }
    setVideoFile(f);
    setVideoPreview(URL.createObjectURL(f));
    setResultUrl(null);
    setError(null);
  };

  const pickBg = (f) => {
    if (!f) return;
    setBgFile(f);
    setBgPreview(URL.createObjectURL(f));
    setResultUrl(null);
    setError(null);
  };

  const onVideoDrop = useCallback((e) => {
    e.preventDefault();
    setVideoDrag(false);
    pickVideo(e.dataTransfer.files?.[0]);
  }, []);

  const onBgDrop = useCallback((e) => {
    e.preventDefault();
    setBgDrag(false);
    pickBg(e.dataTransfer.files?.[0]);
  }, []);

  const handleGenerate = async () => {
    if (!videoFile) return;
    setLoading(true);
    setError(null);
    setResultUrl(null);

    try {
      const userUid = localStorage.getItem('userUID') || '';
      const form    = new FormData();
      form.append('video', videoFile);
      if (bgFile) form.append('background', bgFile);

      const res  = await fetch(`${API}/api/tools/video-bg-replace`, {
        method:  'POST',
        headers: { 'x-user-uid': userUid },
        body:    form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setResultUrl(data.videoUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`py-12 ${CONTAINER.blog}`}>
      <PageSEO title={t('seo.videoBg.title')} description={t('seo.videoBg.desc')} path="/tools/video-bg-replace" />
      <Typography variant="h2" weight="bold" className="block mb-2">
        Video BG Replace
      </Typography>
      <Typography variant="lead" color="muted" className="block mb-10">
        Remove or replace the background of any video using AI.
      </Typography>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* LEFT - Video */}
        <div className="flex flex-col gap-3">
          <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-muted-foreground">
            Your Video
          </span>
          <div
            onClick={() => videoRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setVideoDrag(true); }}
            onDragLeave={() => setVideoDrag(false)}
            onDrop={onVideoDrop}
            className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 min-h-[280px] overflow-hidden
              ${videoDrag ? 'border-primary bg-primary/5' : 'border-border hover:border-foreground/40'}
            `}
          >
            {videoPreview ? (
              <video src={videoPreview} controls className="max-w-full max-h-[280px] rounded-xl"
                onClick={e => e.stopPropagation()} />
            ) : (
              <div className="flex flex-col items-center gap-4 px-8 text-center">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
                  <polygon points="23 7 16 12 23 17 23 7"/>
                  <rect x="1" y="5" width="15" height="14" rx="2"/>
                </svg>
                <div>
                  <p className="text-lg font-bold text-foreground mb-1">Drop your video</p>
                  <p className="text-sm text-muted-foreground">MP4, MOV, AVI, MKV</p>
                </div>
              </div>
            )}
            {videoPreview && (
              <button onClick={(e) => { e.stopPropagation(); videoRef.current?.click(); }}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-black/60 text-white text-xs font-medium hover:bg-black/80 transition-colors">
                Change
              </button>
            )}
          </div>
          <input ref={videoRef} type="file" accept="video/*" className="hidden"
            onChange={e => pickVideo(e.target.files?.[0])} />
          <p className="text-xs text-muted-foreground">MP4, MOV, AVI, MKV · max {MAX_MB} MB</p>
        </div>

        {/* RIGHT - BG image + generate */}
        <div className="flex flex-col gap-5">

          {/* Background image upload */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-muted-foreground">
              Background Image <span className="normal-case font-normal text-muted-foreground">(optional - leave empty to remove background)</span>
            </span>
            <div
              onClick={() => bgRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setBgDrag(true); }}
              onDragLeave={() => setBgDrag(false)}
              onDrop={onBgDrop}
              className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 min-h-[180px] overflow-hidden
                ${bgDrag ? 'border-primary bg-primary/5' : 'border-border hover:border-foreground/40'}
              `}
            >
              {bgPreview ? (
                <img src={bgPreview} alt="Background" className="w-full h-full object-cover max-h-[180px]" />
              ) : (
                <div className="flex flex-col items-center gap-3 px-6 text-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <p className="text-sm text-muted-foreground">Drop a background image or click</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG · any image</p>
                </div>
              )}
              {bgPreview && (
                <button onClick={(e) => { e.stopPropagation(); bgRef.current?.click(); }}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-black/60 text-white text-xs font-medium hover:bg-black/80 transition-colors">
                  Change
                </button>
              )}
            </div>
            <input ref={bgRef} type="file" accept="image/*" className="hidden"
              onChange={e => pickBg(e.target.files?.[0])} />
          </div>

          {/* Info */}
          <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">How it works</p>
            <ul className="flex flex-col gap-2">
              {[
                'Upload your video - AI removes the background',
                'Optionally add a background image to replace it',
                'Download the composited result video',
              ].map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold mt-0.5">{i+1}</span>
                  {s}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 text-xs border-t border-border pt-3 mt-1">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Processing time depends on video length.
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !videoFile}
            className="w-full py-4 rounded-full bg-primary text-primary-foreground font-bold text-xs tracking-[0.16em] uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Processing…
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                </svg>
                {videoFile ? 'Replace Background' : 'Upload a video first'}
              </>
            )}
          </button>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </div>

      {/* Result */}
      {resultUrl && (
        <div className="mt-12 flex flex-col gap-5">
          <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-muted-foreground">Result</span>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs text-muted-foreground">Original</span>
              <video src={videoPreview} controls className="w-full rounded-2xl border border-border" />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-muted-foreground">Result</span>
              <video src={resultUrl} controls className="w-full rounded-2xl border border-border" />
            </div>
          </div>
          <div className="flex gap-3">
            <a href={resultUrl} download="video-bg-replaced.mp4"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-foreground hover:border-foreground/40 transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download
            </a>
            <a href={resultUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-foreground hover:border-foreground/40 transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Open URL
            </a>
          </div>
        </div>
      )}
      <RelevantBlogs currentSlug="video-bg-replace" />
      <OtherProducts currentSlug="video-bg-replace" />
    </div>
  );
};

export default VideoBgReplace;
