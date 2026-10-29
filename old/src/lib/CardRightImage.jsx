import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';

const CardRightImage = ({ title, text, imageUrl, alt, noCard = false }) => {
  const Wrapper = noCard ? 'div' : Card;
  const Content = noCard ? 'div' : CardContent;
  return (
    <Wrapper className="flex flex-col md:flex-row md:flex-row-reverse rounded-xl overflow-hidden items-stretch w-full max-w-[1440px] mx-auto px-4">

      <div className="md:w-1/2 h-full min-h-[300px] flex justify-center items-center">
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-cover rounded-xl"
        />
      </div>

      <Content className="flex-1 p-6 md:p-10 flex flex-col justify-center gap-4">
        <Typography variant="h3" weight="semibold">{title}</Typography>
        <Typography variant="body1">{text}</Typography>
      </Content>

    </Wrapper>
  );
};

export default CardRightImage;
