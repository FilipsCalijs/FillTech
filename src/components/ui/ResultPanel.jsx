import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5200';

const ResultPanel = ({ referenceUrl, resultUrl, generationId }) => {
  const [deleted, setDeleted]   = useState(false);
  const navigate                 = useNavigate();
  const userUid                  = localStorage.getItem('userUID') || '';

  const handleDelete = async () => {
    if (!generationId) return;
    await fetch(`${API}/api/generations/${generationId}`, {
      method: 'DELETE',
      headers: { 'x-user-uid': userUid },
    });
    setDeleted(true);
  };

  if (deleted) return (
    <div className="mt-12 text-center text-muted-foreground text-sm">Generation deleted.</div>
  );

  return (
    <div className="mt-12 flex flex-col gap-5">
      {/* Reference + Result side by side */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-muted-foreground">Reference</span>
          <div className="rounded-2xl border border-border bg-muted overflow-hidden flex items-center justify-center min-h-[200px]">
            <img src={referenceUrl} alt="Reference" className="max-w-full object-contain max-h-[420px]" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-muted-foreground">Result</span>
          <div className="rounded-2xl border border-border bg-muted overflow-hidden flex items-center justify-center min-h-[200px]">
            <img src={resultUrl} alt="Result" className="max-w-full object-contain max-h-[420px]" />
          </div>
        </div>
      </div>

      {/* 4 action buttons */}
      <div className="flex items-center gap-3 flex-wrap">
        <a
          href={resultUrl}
          download
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:border-foreground/40 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download
        </a>

        <a
          href={resultUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:border-foreground/40 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          Open URL
        </a>

        <button
          onClick={() => navigate('/history')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:border-foreground/40 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          History
        </button>

        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-destructive text-sm font-medium text-destructive hover:bg-destructive/10 transition-all ml-auto"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
};

export default ResultPanel;
