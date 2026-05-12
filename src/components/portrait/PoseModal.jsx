import { useEffect } from 'react';
import { POSES } from '@/config/portraitPrompts';
import { Typography } from '@/components/ui/Typography';

const PoseModal = ({ selected, onSelect, onClose }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-xl shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <Typography variant="h4" weight="semibold">Body Pose</Typography>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {POSES.map(pose => (
            <button
              key={pose.id}
              onClick={() => { onSelect(pose.id === selected ? null : pose.id); onClose(); }}
              className={`flex flex-col rounded-xl overflow-hidden border-2 transition-all duration-200 text-left
                ${selected === pose.id ? 'border-primary' : 'border-border hover:border-foreground/40'}
              `}
            >
              <img
                src={pose.image}
                alt={pose.name}
                className="w-full aspect-[3/2] object-cover"
              />
              <div className={`px-3 py-2 text-sm font-medium ${selected === pose.id ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground'}`}>
                {pose.name}
              </div>
            </button>
          ))}
        </div>

        {selected && (
          <button
            onClick={() => { onSelect(null); onClose(); }}
            className="mt-4 w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear pose
          </button>
        )}
      </div>
    </div>
  );
};

export default PoseModal;
