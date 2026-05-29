import express from 'express';
import multer from 'multer';
import FormData from 'form-data';
import { pool } from '../../db.js';
import { uploadFromUrl } from '../../lib/r2.js';
import { v4 as uuidv4 } from 'uuid';
import { getPrice } from '../../config/toolPrices.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 500 * 1024 * 1024 } });

const WAVESPEED_UPLOAD = 'https://api.wavespeed.ai/api/v3/media/upload/binary';
const CREATE_URL       = 'https://api.wavespeed.ai/api/v3/wavespeed-ai/video-background-remover';
const TTL_DAYS         = 7;

async function safeJson(res) {
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { throw new Error(`Non-JSON response: ${text.slice(0, 300)}`); }
}

async function uploadToWavespeed(buffer, mimetype, filename) {
  const form = new FormData();
  form.append('file', buffer, { filename, contentType: mimetype });
  const res  = await fetch(WAVESPEED_UPLOAD, {
    method:  'POST',
    headers: { Authorization: `Bearer ${process.env.NANO_BANANO_API_KEY}`, ...form.getHeaders() },
    body:    form,
  });
  const json = await safeJson(res);
  const url  = json.data?.download_url;
  if (!url) throw new Error(`WaveSpeed upload failed: ${JSON.stringify(json)}`);
  return url;
}

async function pollPrediction(pollUrl) {
  for (let i = 0; i < 120; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const res  = await fetch(pollUrl, {
      headers: { Authorization: `Bearer ${process.env.NANO_BANANO_API_KEY}` },
    });
    const json = await safeJson(res);
    const pred = json.data ?? json;
    if (pred.status === 'completed') return (pred.outputs ?? pred.output)?.[0];
    if (pred.status === 'failed')   throw new Error(pred.error || 'Generation failed');
  }
  throw new Error('Timeout: video processing took too long');
}

router.post('/', (req, res, next) => {
  upload.fields([
    { name: 'video',      maxCount: 1 },
    { name: 'background', maxCount: 1 },
  ])(req, res, (err) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE')
      return res.status(400).json({ error: 'File too large. Max 500MB for video.' });
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, async (req, res) => {
  const videoFile = req.files?.video?.[0];
  const bgFile    = req.files?.background?.[0];
  const bgUrl     = req.body.background_url;

  if (!videoFile) return res.status(400).json({ error: 'Video file is required' });

  const userUid   = req.headers['x-user-uid'] || 'anonymous';
  const genId     = uuidv4();
  const expiresAt = new Date(Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000);
  const cost      = getPrice('video-bg-replace');

  await pool.execute(
    `INSERT INTO generations (id, user_uid, tool_type, status, expires_at, cost, created_at)
     VALUES (?, ?, 'video-bg-replace', 'pending', ?, ?, NOW())`,
    [genId, userUid, expiresAt, cost]
  );

  try {
    // Upload video to WaveSpeed CDN
    const videoUrl = await uploadToWavespeed(
      videoFile.buffer,
      videoFile.mimetype,
      videoFile.originalname || 'video.mp4'
    );

    // Background: base64 or URL
    let backgroundImage = bgUrl || null;
    if (bgFile) {
      backgroundImage = `data:${bgFile.mimetype};base64,${bgFile.buffer.toString('base64')}`;
    }

    const body = { video: videoUrl };
    if (backgroundImage) body.background_image = backgroundImage;

    const createRes = await fetch(CREATE_URL, {
      method:  'POST',
      headers: { Authorization: `Bearer ${process.env.NANO_BANANO_API_KEY}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });

    const createData = await safeJson(createRes);
    const pollUrl    = createData.data?.urls?.get;
    if (!pollUrl) throw new Error(`No poll URL: ${JSON.stringify(createData)}`);

    await pool.execute(`UPDATE generations SET status = 'processing', started_at = NOW() WHERE id = ?`, [genId]);

    const wavespeedUrl = await pollPrediction(pollUrl);
    if (!wavespeedUrl) throw new Error('No video URL in response');

    const r2Url = await uploadFromUrl(wavespeedUrl, userUid, 'video-bg-replace');

    await pool.execute(
      `UPDATE generations SET status = 'completed', output_url = ?, completed_at = NOW() WHERE id = ?`,
      [r2Url, genId]
    );

    res.json({ success: true, videoUrl: r2Url, generationId: genId });
  } catch (err) {
    await pool.execute(
      `UPDATE generations SET status = 'failed', error_message = ? WHERE id = ?`,
      [err.message.slice(0, 500), genId]
    );
    console.error('[video-bg-replace]', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
