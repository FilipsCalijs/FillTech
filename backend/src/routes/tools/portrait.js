import express from 'express';
import multer from 'multer';
import { uploadFromUrl } from '../../lib/r2.js';
import { pool } from '../../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

const CREATE_URL   = 'https://api.wavespeed.ai/api/v3/google/nano-banana-pro/edit';
const TTL_DAYS     = 7;

async function safeJson(response) {
  const text = await response.text();
  try { return JSON.parse(text); }
  catch { throw new Error(`Non-JSON response: ${text.slice(0, 300)}`); }
}

async function pollPrediction(pollUrl) {
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const res  = await fetch(pollUrl, {
      headers: { Authorization: `Bearer ${process.env.NANO_BANANO_API_KEY}` },
    });
    const json = await safeJson(res);
    const prediction = json.data ?? json;
    if (prediction.status === 'completed') return (prediction.outputs ?? prediction.output)?.[0];
    if (prediction.status === 'failed')   throw new Error(prediction.error || 'Generation failed');
  }
  throw new Error('Timeout: generation took too long');
}

router.post('/', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE')
      return res.status(400).json({ error: 'File too large. Max 50MB.' });
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, async (req, res) => {
  const { prompt, aspect_ratio } = req.body;
  if (!prompt?.trim()) return res.status(400).json({ error: 'Prompt is required' });
  if (!req.file)       return res.status(400).json({ error: 'Image is required' });

  const userUid = req.headers['x-user-uid'] || 'anonymous';

  try {
    const base64  = req.file.buffer.toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${base64}`;

    const createRes = await fetch(CREATE_URL, {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${process.env.NANO_BANANO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        images:        [dataUri],
        prompt:        prompt.trim(),
        aspect_ratio:  aspect_ratio || '1:1',
        resolution:    '2k',
        output_format: 'png',
      }),
    });

    const createData = await safeJson(createRes);
    const pollUrl = createData.data?.urls?.get;
    if (!pollUrl) throw new Error(`No poll URL: ${JSON.stringify(createData)}`);

    const wavespeedUrl = await pollPrediction(pollUrl);
    if (!wavespeedUrl) throw new Error('No image URL in response');

    const r2Url     = await uploadFromUrl(wavespeedUrl, userUid, 'portrait');
    const expiresAt = new Date(Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000);
    const genId     = uuidv4();

    await pool.execute(
      `INSERT INTO generations (id, user_uid, output_url, tool_type, status, expires_at)
       VALUES (?, ?, ?, 'portrait', 'completed', ?)`,
      [genId, userUid, r2Url, expiresAt]
    );

    res.json({ success: true, imageUrl: r2Url, generationId: genId });
  } catch (err) {
    console.error('[portrait]', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
