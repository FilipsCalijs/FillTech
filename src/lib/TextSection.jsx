import { Typography } from '@/components/ui/Typography';

const TextSection = ({ title = 'Section Title', text = '' }) => {
  const paragraphs = text.split('\n\n').filter(Boolean);
  return (
    <div className="w-full max-w-[1440px] px-4">
      <Typography variant="h2" weight="bold" className="block mb-6">{title}</Typography>
      <div className="flex flex-col gap-5">
        {paragraphs.map((p, i) => (
          <Typography key={i} variant="body1" color="muted" className="block">{p.trim()}</Typography>
        ))}
      </div>
    </div>
  );
};

export default TextSection;
