import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';


const WatermarkRemover = () => {

    const transparent = true;

    return (
        <div>
            <Card>
             <CardHeader padding="sm" className="text-center">
                <CardTitle>
                  <Typography variant="h3" weight="semibold">
                    Watermark Remover
                  </Typography>
                </CardTitle>
              </CardHeader>

              <CardContent padding="sm" className="text-center">
                <Typography variant="h2" weight="bold" className="text-4xl mb-6">
                 
                </Typography>
                <ul className="list-disc list-inside text-left">
                  <li>Upload your watermarked image.</li>
                  <li>Our AI will analyze and remove the watermark.</li>
                  <li>Download your clean image without any watermarks.</li>    
                </ul>
              </CardContent>

              <CardFooter padding="sm" className="text-center">
                <Button
                  variant="outline"
                  size="md"
                  className="w-full"
                >
                    Try It Now
                </Button>
              </CardFooter>    
            </Card>
        </div>
    );

 };

export default WatermarkRemover;    