import { Queue, QueueEvents } from 'bullmq';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
};

export const watermarkQueue = new Queue('ai-watermark-remove', { connection });
export const bgRemoveQueue  = new Queue('ai-bg-remove',        { connection });
export const upscaleQueue   = new Queue('ai-upscale',          { connection });

export const watermarkQueueEvents = new QueueEvents('ai-watermark-remove', { connection });
