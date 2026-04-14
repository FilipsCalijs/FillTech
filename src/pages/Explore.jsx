import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { useNavigate } from 'react-router-dom';
import { aiEffects } from '@/lib/aiEffects';

const Explore = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 min-h-screen bg-background text-foreground">
      <Typography variant="h1" className="text-3xl font-bold mb-6 text-center">
        Explore AI Effects
      </Typography>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {aiEffects.map((effect, idx) => (
          <Card
            key={idx}
            className="cursor-pointer hover:shadow-lg transition-shadow rounded-lg border border-border bg-card text-card-foreground"
            onClick={() => navigate(`/tools/${effect.path}`)}
          >
            <CardHeader>
              <CardTitle className="text-center">{effect.name}</CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col items-center gap-4">
              <div className="w-full h-40 bg-muted flex items-center justify-center rounded-md">
                <span className="text-muted-foreground">Placeholder Image</span>
              </div>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Open
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Explore;
