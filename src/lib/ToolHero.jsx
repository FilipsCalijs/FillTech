import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Upload } from '@/components/ui/Upload';
import { Card, CardContent } from '@/components/ui/Card';

const ToolHero = ({
  title,
  subtitle,
  buttonLabel = 'Generate',
  file,
  loading,
  error,
  onFileDrop,
  onSubmit,
  rightImage,
}) => {
  return (
    <div className="w-full max-w-[1280px] px-4">
      <Card className="flex flex-col md:flex-row rounded-xl overflow-hidden">

        {/* Left — upload side */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-2">
            <Typography variant="h2" weight="semibold" className="block">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body1" color="muted" className="block">
                {subtitle}
              </Typography>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <Upload
              onFileDrop={onFileDrop}
              className="w-full h-48 md:h-56"
            />
            {error && (
              <Typography variant="body2" className="text-destructive block">
                {error}
              </Typography>
            )}
            <Button
              size="md"
              className="w-full"
              onClick={onSubmit}
              disabled={loading || !file}
              isLoading={loading}
            >
              {loading ? 'Processing...' : buttonLabel}
            </Button>
          </div>
        </div>

        {/* Right — hero image */}
        {rightImage && (
          <div className="hidden md:block md:w-1/2">
            <img
              src={rightImage}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

      </Card>
    </div>
  );
};

export default ToolHero;
