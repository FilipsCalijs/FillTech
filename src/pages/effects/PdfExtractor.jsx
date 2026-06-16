import { useState, useRef, useCallback } from 'react';
import { Typography } from '@/components/ui/Typography';
import { CONTAINER } from '@/config/sizes';
import { useTranslation } from 'react-i18next';
import PageSEO from '@/components/seo/PageSEO';
import OtherProducts from '@/lib/OtherProducts';
import RelevantBlogs from '@/components/ui/RelevantBlogs';
import { API_URL as API } from '@/config/api';
import { useAuthModal } from '@/contexts/AuthModalContext';

const MAX_MB   = 20;
const MAX_SIZE = MAX_MB * 1024 * 1024;

const PdfExtractor = () => {
  const { t } = useTranslation('tools');
  const [file,     setFile]     = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState(null);
  const [copied,   setCopied]   = useState(false);
  const fileRef = useRef(null);
  const { requireAuth } = useAuthModal();

  const pickFile = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') {
      setError(t('pdfExtract.error.fileType'));
      return;
    }
    if (f.size > MAX_SIZE) {
      setError(t('pdfExtract.error.fileSize', { max: MAX_MB }));
      return;
    }
    setFile(f);
    setResult(null);
    setError(null);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files?.[0]);
  }, []);

  const handleSubmit = async () => {
    if (!file) return;
    if (!requireAuth()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const userUid = localStorage.getItem('userUID') || '';
      const form    = new FormData();
      form.append('pdf', file);

      const res  = await fetch(`${API}/api/tools/pdf-extract`, {
        method:  'POST',
        headers: { 'x-user-uid': userUid },
        body:    form,
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'NO_TEXT') throw new Error(t('pdfExtract.error.noText'));
        throw new Error(t('pdfExtract.error.generic'));
      }

      setResult({
        textUrl:      data.textUrl,
        generationId: data.generationId,
        pageCount:    data.pageCount,
        charCount:    data.charCount,
        text:         data.text,
      });
    } catch (err) {
      setError(err.message || t('pdfExtract.error.generic'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result.text], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = 'extracted-text.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className={`py-12 ${CONTAINER.blog}`}>
      <PageSEO title={t('pdfExtract.seo.title')} description={t('pdfExtract.seo.description')} path="/tools/pdf-extractor" />
      <Typography variant="h2" weight="bold" className="block mb-2">{t('pdfExtract.title')}</Typography>
      <Typography variant="lead" color="muted" className="block mb-10">{t('pdfExtract.subtitle')}</Typography>

      <div className="max-w-2xl mx-auto flex flex-col gap-6">

        {/* Upload zone */}
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 min-h-[220px] px-8 text-center
            ${dragging ? 'border-[#F5A623] bg-gradient-to-b from-[#F5A623]/10 to-transparent' : 'border-border hover:border-foreground/40'}
          `}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground mb-4">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="9" y1="13" x2="15" y2="13"/>
            <line x1="9" y1="17" x2="13" y2="17"/>
          </svg>

          {file ? (
            <p className="text-sm font-medium text-foreground break-all">{file.name}</p>
          ) : (
            <>
              <p className="text-lg font-bold text-foreground mb-1">{t('pdfExtract.upload.dropHint')}</p>
              <p className="text-sm text-muted-foreground mb-4">{t('pdfExtract.upload.maxSize', { max: MAX_MB })}</p>
            </>
          )}

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
            className="mt-4 px-5 py-2.5 rounded-full border border-border text-sm font-semibold text-foreground hover:border-foreground/40 transition-all"
          >
            {t('pdfExtract.upload.button')}
          </button>

          <input
            ref={fileRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0])}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading || !file}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#F5A623] to-[#FBCF33] text-black font-bold text-sm tracking-[0.08em] uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              {t('pdfExtract.loading')}
            </>
          ) : t('pdfExtract.submit')}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="max-w-2xl mx-auto mt-10 flex flex-col gap-4">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>{t('pdfExtract.result.pageCount', { count: result.pageCount })}</span>
            <span>{t('pdfExtract.result.charCount', { count: result.charCount })}</span>
          </div>

          <textarea
            readOnly
            value={result.text}
            className="w-full h-[300px] rounded-2xl border border-border bg-card p-4 text-sm text-foreground resize-none overflow-auto"
          />

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:border-foreground/40 transition-all"
            >
              {copied ? t('pdfExtract.result.copied') : t('pdfExtract.result.copy')}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:border-foreground/40 transition-all"
            >
              {t('pdfExtract.result.download')}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:border-foreground/40 transition-all"
            >
              {t('pdfExtract.result.reset')}
            </button>
          </div>
        </div>
      )}

      <RelevantBlogs currentSlug="pdf-extractor" />
      <OtherProducts currentSlug="pdf-extractor" />
    </div>
  );
};

export default PdfExtractor;
