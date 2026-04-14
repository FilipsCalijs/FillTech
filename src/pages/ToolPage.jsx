import React from 'react';
import { useParams } from 'react-router-dom';
import { aiEffects } from '@/lib/aiEffects';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';

const ToolPage = () => {
  const { effectPath } = useParams();
  const effect = aiEffects.find(e => e.path === effectPath);

  if (!effect) return <div className="p-6 text-center text-foreground">Effect not found</div>;

  return (
    <div className="p-6 min-h-screen bg-background text-foreground">
      <Typography variant="h1" className="text-3xl font-bold mb-6 text-center">
        {effect.name}
      </Typography>

      <div className="flex flex-col items-center gap-6">
        <div className="w-full h-64 bg-muted flex items-center justify-center rounded-md">
          <span className="text-muted-foreground">Placeholder for {effect.name}</span>
        </div>
        <Button className="w-full max-w-sm bg-primary text-primary-foreground hover:bg-primary/90">
          Run {effect.name}
        </Button>
      </div>
    </div>
  );
};

export default ToolPage;
