import React from 'react';
import { Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography'; 
import WatermarkRemover from '@/pages/effects/WatermarkRemover';

const Plan = () => {
  const plansData = {
    free: {
      title: 'Base',
      price: '0€',
      features: ['Static sites', 'Basic SEO', 'Community support'],
      buttonText: 'Get Started',
      highlight: false,
    },
    pro: {
      title: 'Pro Build',
      price: '29€',
      features: ['Dynamic Apps', 'Advanced SEO', 'Priority support', 'Custom Domains'],
      buttonText: 'Go Pro',
      highlight: true,
    },
    enterprise: {
      title: 'Custom',
      price: 'Contact us',
      features: ['Full Ecosystem', 'Dedicated Manager', '24/7 Support'],
      buttonText: 'Talk to Sales',
      highlight: false,
    },
  };

  const plansArray = Object.values(plansData);

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <Typography variant="h2" weight="bold" align="center" className="mb-10">
          Choose your plan
        </Typography>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plansArray.map((plan, index) => (
            <Card
              key={index}
              padding="lg"
              radius="xl"
              variant={plan.highlight ? 'elevated' : 'default'}
              className={`${plan.highlight ? 'border-blue-500 scale-105' : 'border-gray-200'}`}
            >
              <CardHeader padding="sm" className="text-center">
                <CardTitle>
                  <Typography variant="h3" weight="semibold">
                    {plan.title}
                  </Typography>
                </CardTitle>
              </CardHeader>

              <CardContent padding="sm" className="text-center">
                <Typography variant="h2" weight="bold" className="text-4xl mb-6">
                  {plan.price}
                </Typography>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-600">
                      <Check size={18} className="text-green-500" />
                      <Typography variant="body2">{feature}</Typography>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter padding="sm" className="text-center">
                <Button
                  variant={plan.highlight ? 'primary' : 'outline'}
                  size="md"
                  className="w-full"
                >
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      <WatermarkRemover />
    </div>
  );
};

export default Plan;
