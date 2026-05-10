import axios from 'axios';
import { pool } from '../../db.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export async function processWatermarkRemove(job) {
  const { generationId, inputUrl } = job.data;

  await pool.execute(
    'UPDATE generations SET status = ?, started_at = NOW() WHERE id = ?',
    ['processing', generationId]
  );

  try {
    const { data } = await axios.post(
      `${AI_SERVICE_URL}/process/watermark`,
      { generationId, inputUrl },
      { timeout: 120_000 }
    );

    await pool.execute(
      `UPDATE generations
         SET status = 'completed', output_url = ?, completed_at = NOW()
       WHERE id = ?`,
      [data.resultUrl, generationId]
    );

    return { resultUrl: data.resultUrl };

  } catch (err) {
    const message = err.response?.data?.detail || err.message;

    await pool.execute(
      `UPDATE generations
         SET status = 'failed', error_message = ?, completed_at = NOW()
       WHERE id = ?`,
      [message, generationId]
    );

    throw err;
  }
}
