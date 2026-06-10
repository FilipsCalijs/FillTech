import { useState, useRef, useCallback } from 'react';
import { CONTAINER } from '@/config/sizes';
import AudioPlayer from '@/components/ui/AudioPlayer';
import { useTranslation } from 'react-i18next';
import PageSEO from '@/components/seo/PageSEO';
import { API_URL as API } from '@/config/api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmtLabel = (ts) => {
  const h = ts.getHours().toString().padStart(2,'0');
  const m = ts.getMinutes().toString().padStart(2,'0');
  return `${ts.getDate()} ${MONTHS[ts.getMonth()]} ${h}:${m}`;
};

const VocalIsolator = () => {
  const { t } = useTranslation('tools');
  const [file,     setFile]     = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [results,  setResults]  = useState([]);
  const [error,    setError]    = useState(null);
  const fileRef = useRef(null);

  const pickFile = (f) => { if (f) { setFile(f); setError(null); } };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files?.[0]);
  }, []);

  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const userUid = localStorage.getItem('userUID') || '';
      const form = new FormData();
      form.append('audio', file);

      const res  = await fetch(`${API}/api/tools/vocal-isolator`, {
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

  return (
    <div className={`py-10 ${CONTAINER.blog}`}>
      <PageSEO
        title={t('seo.vocalIsolator.title')}
        description={t('seo.vocalIsolator.desc')}
        path="/tools/vocal-isolator"
      />
      <h1 className="text-2xl font-bold text-foreground mb-2">{t('vocalIsolator.title')}</h1>
      <p className="text-sm text-muted-foreground mb-8">{t('vocalIsolator.subtitle')}</p>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-8 flex flex-col gap-6">

          {/* Upload zone */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-muted-foreground">
              {t('upload.dropAudio')} <span className="normal-case font-normal">({t('upload.audioHint')})</span>
            </span>
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer min-h-[180px] transition-all duration-200
                ${dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-foreground/40'}`}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                className="text-muted-foreground mb-3">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3"/>
                <circle cx="18" cy="16" r="3"/>
              </svg>
              {file ? (
                <p className="text-sm font-medium text-foreground text-center px-4 break-all">{file.name}</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-foreground mb-1">{t('upload.dropAudio')}</p>
                  <p className="text-xs text-muted-foreground">{t('upload.audioHint')} · {t('upload.maxSize', { max: 50 })}</p>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={e => pickFile(e.target.files?.[0])}
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          {/* Generate */}
          <button
            onClick={handleGenerate}
            disabled={!file || loading}
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
                {t('actions.generating')}
              </>
            ) : t('vocalIsolator.isolate')}
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="border-t border-border px-8 py-6 flex flex-col gap-6">
            {results.map((r, i) => (
              <div key={r.url + i} className="flex flex-col gap-3">
                <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-muted-foreground">
                  {i === 0 ? t('voice.current') : fmtLabel(r.ts)}
                </span>
                <AudioPlayer src={r.url} />
                <div className="flex gap-3">
                  <a
                    href={r.url}
                    download="vocal-isolated.mp3"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-foreground hover:border-foreground/40 transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    {t('actions.download', { ns: 'common' })}
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
                    {t('actions.openUrl', { ns: 'common' })}
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

export default VocalIsolator;
