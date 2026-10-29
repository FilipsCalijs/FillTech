import 'dotenv/config';
import { Worker } from 'bullmq';
import { processWatermarkRemove } from './processors/watermarkRemove.js';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
};

const watermarkWorker = new Worker(
  'ai-watermark-remove',
  processWatermarkRemove,
  {
    connection,
    concurrency: 2,
    limiter: { max: 10, duration: 60_000 },
  }
);

watermarkWorker.on('completed', (job) => {
  console.log(`✓ [watermark] job ${job.id} completed`);
});

watermarkWorker.on('failed', (job, err) => {
  console.error(`✗ [watermark] job ${job.id} failed (attempt ${job?.attemptsMade}): ${err.message}`);
});

watermarkWorker.on('error', (err) => {
  console.error('[worker error]', err.message);
});

console.log('BullMQ workers started — waiting for jobs...');
