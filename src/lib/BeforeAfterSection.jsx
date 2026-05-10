import BeforeAfterSlider from '@/lib/beforeAfterSlider';
import { Typography } from '@/components/ui/Typography';
import { Card, CardContent } from '@/components/ui/Card';

const BeforeAfterSection = ({
  title = 'See the Difference',
  desc,
  beforeImage,
  afterImage,
}) => {
  return (
    <div className="w-full max-w-[1280px] px-4">
      <Card bordered="lg" className="flex flex-col md:flex-row rounded-xl overflow-hidden">
        <CardContent className="flex-1 p-8 flex flex-col justify-center gap-4">
          <Typography variant="h2" weight="semibold">{title}</Typography>
          {desc && (
            <Typography variant="body1" color="muted">{desc}</Typography>
          )}
        </CardContent>
        <div className="w-full md:w-1/2 h-64 md:min-h-[400px] p-4 flex justify-center items-center">
          <BeforeAfterSlider
            beforeImage={beforeImage}
            afterImage={afterImage}
            width={600}
            height={400}
            autoAnimate={true}
          />
        </div>
      </Card>
    </div>
  );
};

export default BeforeAfterSection;
