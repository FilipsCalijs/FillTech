import { watermarkQueue, bgRemoveQueue } from '../workers/queues.js';

const JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 5000 },
  removeOnComplete: { age: 3600, count: 100 },
  removeOnFail:     { age: 86400 },
};

export async function enqueueWatermarkRemove({ generationId, inputUrl, userUid }) {
  const job = await watermarkQueue.add('watermark-remove', { generationId, inputUrl, userUid }, JOB_OPTIONS);
  return job.id;
}

export async function enqueueBgRemove({ generationId, inputUrl, userUid }) {
  const job = await bgRemoveQueue.add('bg-remove', { generationId, inputUrl, userUid }, JOB_OPTIONS);
  return job.id;
}
