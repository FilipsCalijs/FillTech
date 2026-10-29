import express from 'express';
import multer from 'multer';
import { runWavespeed } from '../../lib/wavespeed.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

const CREATE_URL = 'https://api.wavespeed.ai/api/v3/google/nano-banana-pro/edit';

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

    const { genId, imageUrl } = await runWavespeed({
      createUrl: CREATE_URL,
      body: { images: [dataUri], prompt: prompt.trim(), aspect_ratio: aspect_ratio || '1:1', resolution: '2k', output_format: 'png' },
      userUid,
      toolType:  'ps2-filter',
      r2Folder:  'ps2-filter',
    });

    res.json({ success: true, imageUrl, generationId: genId });
  } catch (err) {
    console.error('[ps2-filter]', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
