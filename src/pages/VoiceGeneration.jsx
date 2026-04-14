import React from 'react';
import { Typography } from '@/components/ui/Typography';
import {Button } from '@/components/ui/Button';

const VoiceGeneration = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Typography variant="h1" weight="bold" color="primary" className="text-center">
        Your Own AI voice in seconds
      </Typography>

      <Typography variant="h3" weight="normal" className="text-center">
        The Fastest, Most Accurate AI Voice Cloning Technology Available Today,
      </Typography>

      <Typography variant="p" weight="normal" className="text-center">
        Experience premium AI voice cloning with just 3 seconds of audio!
      </Typography>

      <div className="flex gap-2 mt-4">
        <Button
        variant="primary"
        size="sm"
        type="submit" 
        className="w-full"
        >Voice cloning</Button>
  
        <Button
        variant="primary"
        size="sm"
        type="submit" 
        className="w-full"
        >Voice cloning</Button>
      </div>

      <div className="flex flex-col items-center mt-4 gap-2">
        <Typography variant="p" weight="normal">Enter your text</Typography>
        <textarea placeholder="Enter your text here..." className="border p-2 w-80 h-24" />
      </div>

      <div className="flex flex-col items-center mt-4 gap-2">
        <Typography variant="p" weight="normal">Presets</Typography>
        
        <Button
        variant="primary"
        size="sm"
        type="submit" 
        className="w-full"
        >Voice cloning</Button>
        
      </div>

      <div className="flex flex-col items-center mt-4 gap-2">
        <Typography variant="p" weight="normal">Presets</Typography>
        {/* здесь должна быть кнопкпа при нажатии на которую нужно выбрать язык из выплывающих */}
        <div>
          {/* здесь должен будет быть присеты из трех компонентов: слева иконка - по середине название присета - а с права демо версия */}
        </div>
        <Typography variant="p" weight="normal">Or</Typography>
        {/* здесь должен быть upload field */}
      </div>

      <Button
        variant="primary"
        size="sm"
        type="submit" 
        >Voice cloning</Button>

      <Typography variant="p" weight="normal" className="mt-2 text-center">
        Limit 120 characters per generation. Available: 120 characters.
      </Typography>
    </div>
  );
};

export default VoiceGeneration;
