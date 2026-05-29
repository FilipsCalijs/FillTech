import { Typography } from '@/components/ui/Typography';

const TextSection = ({ title = 'Section Title', text = '' }) => {
  return (
    <div className="w-full max-w-[1280px] px-4">
      <Typography variant="h2" weight="bold" className="block mb-4">{title}</Typography>
      <Typography variant="body1" color="muted" className="block">{text}</Typography>
    </div>
  );
};

export default TextSection;
