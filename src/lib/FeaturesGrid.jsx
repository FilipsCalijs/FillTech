import { Card, CardContent } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';

const FeaturesGrid = ({ title = 'Why Choose Us', features = [] }) => {
  return (
    <div className="w-full max-w-[1280px] px-4">
      {title && (
        <Typography variant="h1" weight="semibold" className="mb-8 text-center block">
          {title}
        </Typography>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((f, i) => (
          <Card key={i}>
            <CardContent className="p-6 flex flex-col gap-3">
              <div className="text-foreground">{f.icon}</div>
              <Typography variant="h4" weight="semibold">{f.title}</Typography>
              <Typography variant="body2" color="muted">{f.desc}</Typography>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeaturesGrid;
