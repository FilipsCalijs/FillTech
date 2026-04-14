import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Typography } from '@/components/ui/Typography';

const CardRightImage = ({ title, text, imageUrl, alt }) => {
  return (
    <Card className="flex flex-col md:flex-row rounded-xl overflow-hidden items-stretch md:flex-row-reverse w-full max-w-[1280px] mx-auto px-4">
      
      {/* Картинка справа */}
      <div className="md:w-1/2 h-full min-h-[300px] flex justify-center items-center">
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-cover rounded-r-xl"
        />
      </div>

      {/* Текст слева */}
      <CardContent className="flex-1 p-6 flex flex-col justify-center gap-4">
        <Typography variant="h3" weight="semibold">{title}</Typography>
        <Typography variant="body1">{text}</Typography>
      </CardContent>

    </Card>
  );
};

export default CardRightImage;